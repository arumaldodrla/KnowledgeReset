"""
Knowledge Reset Crawler - Main Crawler Logic
Playwright-based web crawler with content extraction and hierarchy building.
"""

import hashlib
import asyncio
import os
import time
from typing import Optional, Dict, Any, List, Set
from urllib.parse import urlparse, urljoin
from datetime import datetime

from playwright.async_api import async_playwright, Browser, Page
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from extractors import (
    extract_title,
    extract_breadcrumbs,
    extract_main_content,
    extract_internal_links,
    extract_metadata,
)
from db import (
    get_document_by_url,
    create_document,
    update_document,
    create_document_version,
    update_document_embedding,
    log_crawl_error,
    update_crawl_job_status,
    create_audit_log,
)
from embeddings import generate_embedding

load_dotenv()


class CrawlerConfig:
    """Configuration for a crawl job."""
    def __init__(
        self,
        max_depth: int = 3,
        max_pages: int = 10000,
        delay_ms: int = 1000,
        timeout_ms: int = 30000,
        max_runtime_seconds: int = 3600,  # 1 hour default
        respect_robots: bool = True,
        user_agent: str = "KnowledgeReset-Crawler/1.0",
    ):
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.delay_ms = delay_ms
        self.timeout_ms = timeout_ms
        self.max_runtime_seconds = max_runtime_seconds
        self.respect_robots = respect_robots
        self.user_agent = user_agent


class CrawlResult:
    """Result of crawling a single page."""
    def __init__(
        self,
        url: str,
        title: str,
        content_text: str,
        content_html: str,
        content_hash: str,
        breadcrumbs: List[Dict[str, str]],
        discovered_links: List[str],
        metadata: Dict[str, Any],
    ):
        self.url = url
        self.title = title
        self.content_text = content_text
        self.content_html = content_html
        self.content_hash = content_hash
        self.breadcrumbs = breadcrumbs
        self.discovered_links = discovered_links
        self.metadata = metadata


class Crawler:
    """
    Playwright-based web crawler for documentation sites.
    """
    
    def __init__(
        self,
        tenant_id: str,
        app_id: str,
        job_id: str,
        base_url: str,
        config: CrawlerConfig = None,
    ):
        self.tenant_id = tenant_id
        self.app_id = app_id
        self.job_id = job_id
        self.base_url = base_url
        self.config = config or CrawlerConfig()
        
        # Parse base URL for domain filtering
        parsed = urlparse(base_url)
        self.allowed_domain = parsed.netloc
        
        # Tracking
        self.visited_urls: Set[str] = set()
        self.queued_urls: List[tuple[str, int]] = []  # (url, depth)
        self.pages_crawled = 0
        self.errors_count = 0
        self.start_time = None  # Will be set when crawl starts
        
        # Document parent mapping (for hierarchy)
        self.url_to_doc_id: Dict[str, str] = {}
        
    async def crawl_page(self, page: Page, url: str) -> Optional[CrawlResult]:
        """Crawl a single page and extract content."""
        MAX_RETRIES = 3
        response = None
        
        for attempt in range(MAX_RETRIES):
            try:
                print(f"DEBUG: Navigating to {url} for job {self.job_id} (Attempt {attempt + 1}/{MAX_RETRIES})")
                # Navigation with domcontentloaded is more resilient against slow trackers/ads
                response = await page.goto(
                    url, 
                    wait_until="domcontentloaded", 
                    timeout=self.config.timeout_ms
                )
                
                if response:
                    print(f"DEBUG: Navigation to {url} finished for job {self.job_id} with status {response.status}")
                    break
                else:
                    print(f"DEBUG: Navigation return None for {url} (Attempt {attempt + 1}/{MAX_RETRIES})")
                    
            except Exception as e:
                print(f"DEBUG: Navigation error for {url} (Attempt {attempt + 1}/{MAX_RETRIES}): {str(e)}")
                if attempt == MAX_RETRIES - 1:
                    log_crawl_error(self.job_id, url, "MAX_RETRIES_EXCEEDED", f"Failed after {MAX_RETRIES} attempts: {str(e)}")
                    self.errors_count += 1
                    return None
                
                # Exponential backoff: 2s, 4s, 8s...
                wait_time = 2 * (attempt + 1)
                print(f"DEBUG: Waiting {wait_time}s before retrying {url}")
                await asyncio.sleep(wait_time)

        if not response:
            log_crawl_error(self.job_id, url, "NO_RESPONSE", "No response received after retries")
            self.errors_count += 1
            return None
        
        if response.status >= 400:
            log_crawl_error(self.job_id, url, str(response.status), f"HTTP {response.status}")
            self.errors_count += 1
            return None
        
        try:
            # Optional additional wait for network to settle, but don't fail if it doesn't
            try:
                await page.wait_for_load_state("networkidle", timeout=5000)
            except Exception:
                pass
            
            # Get page HTML
            html = await page.content()
            soup = BeautifulSoup(html, "lxml")
            
            # Extract content
            title = extract_title(soup)
            breadcrumbs = extract_breadcrumbs(soup, url)
            content_text, content_html = extract_main_content(soup)
            discovered_links = extract_internal_links(soup, url, self.allowed_domain)
            metadata = extract_metadata(soup)
            
            # Calculate content hash
            content_hash = hashlib.sha256(content_html.encode()).hexdigest()
            
            return CrawlResult(
                url=url,
                title=title,
                content_text=content_text,
                content_html=content_html,
                content_hash=content_hash,
                breadcrumbs=breadcrumbs,
                discovered_links=discovered_links,
                metadata=metadata,
            )
            
        except Exception as e:
            log_crawl_error(self.job_id, url, "EXCEPTION", str(e))
            self.errors_count += 1
            return None
    
    def determine_parent_id(self, breadcrumbs: List[Dict[str, str]]) -> Optional[str]:
        """Determine parent document ID from breadcrumbs."""
        if len(breadcrumbs) < 2:
            return None
        
        # The parent is the second-to-last breadcrumb
        parent_href = breadcrumbs[-2].get("href")
        if parent_href and parent_href in self.url_to_doc_id:
            return self.url_to_doc_id[parent_href]
        
        return None
    
    async def save_page(self, result: CrawlResult) -> str:
        """Save or update a crawled page in the database."""
        print(f"DEBUG: Saving page {result.url} for job {self.job_id}")
        # Check if document already exists
        existing = get_document_by_url(self.tenant_id, self.app_id, result.url)
        print(f"DEBUG: Document existence check finished for {result.url}, existing={existing is not None}")
        
        parent_id = self.determine_parent_id(result.breadcrumbs)
        
        doc_data = {
            "tenant_id": self.tenant_id,
            "app_id": self.app_id,
            "job_id": self.job_id,  # Track which job last processed this document
            "parent_id": parent_id,
            "title": result.title,
            "content_text": result.content_text,
            "content_html": result.content_html,
            "content_hash": result.content_hash,
            "source_url": result.url,
            "breadcrumbs": result.breadcrumbs,
            "metadata": result.metadata,
        }
        
        if existing:
            # Check if content changed
            if existing.get("content_hash") != result.content_hash:
                # Save version history
                create_document_version(
                    existing["id"],
                    existing.get("content_html", ""),
                    existing.get("content_hash", ""),
                    f"Updated on {datetime.utcnow().isoformat()}"
                )
                
                # Update document
                doc = update_document(existing["id"], doc_data)
                doc_id = existing["id"]
                
                # Regenerate embedding
                embedding = generate_embedding(result.content_text)
                update_document_embedding(doc_id, embedding)
            else:
                doc_id = existing["id"]
        else:
            # Create new document
            doc = create_document(doc_data)
            doc_id = doc["id"]
            
            # Generate embedding
            embedding = generate_embedding(result.content_text)
            update_document_embedding(doc_id, embedding)
        
        # Track for hierarchy
        self.url_to_doc_id[result.url] = doc_id
        
        return doc_id
    
    async def run(self) -> Dict[str, Any]:
        """Run the crawler."""
        update_crawl_job_status(self.job_id, "running")
        
        create_audit_log(
            event_type="CRAWL_JOB_STARTED",
            action="start_crawl",
            tenant_id=self.tenant_id,
            target_type="crawl_job",
            target_id=self.job_id,
            metadata={"base_url": self.base_url}
        )
        
        # Initialize queue with base URL
        self.queued_urls.append((self.base_url, 0))
        
        print(f"DEBUG: Initializing async_playwright for job {self.job_id}")
        pw_manager = async_playwright()
        try:
            p = await pw_manager.__aenter__()
            print(f"DEBUG: async_playwright __aenter__ finished for job {self.job_id}")
            
            print(f"DEBUG: Launching browser for job {self.job_id}")
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ]
            )
            print(f"DEBUG: Browser launched for job {self.job_id}")
            context = await browser.new_context(
                user_agent=self.config.user_agent,
                extra_http_headers={
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Upgrade-Insecure-Requests": "1",
                }
            )
            page = await context.new_page()
            
            # Set start time for timeout tracking
            self.start_time = time.time()
            
            try:
                while self.queued_urls and self.pages_crawled < self.config.max_pages:
                    url, depth = self.queued_urls.pop(0)
                    
                    # Check for timeout
                    elapsed_time = time.time() - self.start_time
                    if elapsed_time > self.config.max_runtime_seconds:
                        print(f"DEBUG: Crawler timeout after {elapsed_time}s for job {self.job_id}")
                        stats = {
                            "pages_crawled": self.pages_crawled,
                            "errors_count": self.errors_count,
                            "urls_visited": len(self.visited_urls),
                            "timeout": True,
                            "elapsed_seconds": int(elapsed_time)
                        }
                        update_crawl_job_status(self.job_id, "timeout", stats)
                        break
                    
                    # Check for cancellation every 10 pages
                    if self.pages_crawled % 10 == 0:
                        from db import get_crawl_job
                        job = get_crawl_job(self.job_id)
                        if job and job.get("status") == "cancelled":
                            print(f"DEBUG: Crawler cancelled for job {self.job_id}")
                            stats = {
                                "pages_crawled": self.pages_crawled,
                                "errors_count": self.errors_count,
                                "urls_visited": len(self.visited_urls),
                                "cancelled": True
                            }
                            update_crawl_job_status(self.job_id, "cancelled", stats)
                            break
                    
                    # Skip if already visited
                    if url in self.visited_urls:
                        continue
                    
                    self.visited_urls.add(url)
                    
                    # Crawl the page
                    result = await self.crawl_page(page, url)
                    
                    if result:
                        # Save to database
                        await self.save_page(result)
                        self.pages_crawled += 1
                        
                        # Update progress every 10 pages
                        if self.pages_crawled % 10 == 0:
                            progress_stats = {
                                "pages_crawled": self.pages_crawled,
                                "errors_count": self.errors_count,
                                "urls_visited": len(self.visited_urls),
                                "current_url": url,
                                "elapsed_seconds": int(time.time() - self.start_time)
                            }
                            update_crawl_job_status(self.job_id, "running", progress_stats)
                        
                        # Queue discovered links (if within depth)
                        if depth < self.config.max_depth:
                            for link in result.discovered_links:
                                if link not in self.visited_urls:
                                    self.queued_urls.append((link, depth + 1))
                    
                    # Delay between requests
                    await asyncio.sleep(self.config.delay_ms / 1000)
                    
            finally:
                await browser.close()
        except Exception as e:
            print(f"DEBUG: Error in crawler run: {str(e)}")
            update_crawl_job_status(self.job_id, "failed", {"error": str(e)})
            raise e
        finally:
            await pw_manager.__aexit__(None, None, None)
            print(f"DEBUG: Playwright closed for job {self.job_id}")
        
        # Update job status
        stats = {
            "pages_crawled": self.pages_crawled,
            "errors_count": self.errors_count,
            "urls_visited": len(self.visited_urls),
        }
        
        # If we didn't crawl any pages and we have errors, it's a failure
        if self.pages_crawled == 0 and self.errors_count > 0:
            status = "failed"
            stats["error"] = "Crawl failed: 0 pages processed. Check crawl_errors for details."
        else:
            status = "completed"
            
        update_crawl_job_status(self.job_id, status, stats)
        
        create_audit_log(
            event_type="CRAWL_JOB_COMPLETED",
            action="complete_crawl",
            tenant_id=self.tenant_id,
            target_type="crawl_job",
            target_id=self.job_id,
            metadata=stats
        )
        
        return stats


async def start_crawl(
    tenant_id: str,
    app_id: str,
    job_id: str,
    base_url: str,
    config: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """Start a crawl job."""
    crawler_config = CrawlerConfig(
        max_depth=config.get("max_depth", 3) if config else 3,
        max_pages=config.get("max_pages", 10000) if config else 10000,
        delay_ms=config.get("delay_ms", 1000) if config else 1000,
        timeout_ms=config.get("timeout_ms", 30000) if config else 30000,
        max_runtime_seconds=config.get("max_runtime_seconds", 3600) if config else 3600,
    )
    
    crawler = Crawler(
        tenant_id=tenant_id,
        app_id=app_id,
        job_id=job_id,
        base_url=base_url,
        config=crawler_config,
    )
    
    return await crawler.run()
