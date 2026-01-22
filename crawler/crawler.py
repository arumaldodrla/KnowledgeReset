"""
Knowledge Reset Crawler - Main Crawler Logic
Playwright-based web crawler with content extraction and hierarchy building.
"""

import hashlib
import asyncio
import os
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
        max_pages: int = 100,
        delay_ms: int = 1000,
        timeout_ms: int = 30000,
        respect_robots: bool = True,
        user_agent: str = "KnowledgeReset-Crawler/1.0",
    ):
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.delay_ms = delay_ms
        self.timeout_ms = timeout_ms
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
        
        # Document parent mapping (for hierarchy)
        self.url_to_doc_id: Dict[str, str] = {}
        
    async def crawl_page(self, page: Page, url: str) -> Optional[CrawlResult]:
        """Crawl a single page and extract content."""
        try:
            # Navigate to page
            response = await page.goto(url, timeout=self.config.timeout_ms)
            
            if not response:
                log_crawl_error(self.job_id, url, "NO_RESPONSE", "No response received")
                self.errors_count += 1
                return None
            
            if response.status >= 400:
                log_crawl_error(self.job_id, url, str(response.status), f"HTTP {response.status}")
                self.errors_count += 1
                return None
            
            # Wait for content to load
            await page.wait_for_load_state("networkidle", timeout=10000)
            
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
        # Check if document already exists
        existing = get_document_by_url(self.tenant_id, self.app_id, result.url)
        
        parent_id = self.determine_parent_id(result.breadcrumbs)
        
        doc_data = {
            "tenant_id": self.tenant_id,
            "app_id": self.app_id,
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
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=self.config.user_agent
            )
            page = await context.new_page()
            
            try:
                while self.queued_urls and self.pages_crawled < self.config.max_pages:
                    url, depth = self.queued_urls.pop(0)
                    
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
                        
                        # Queue discovered links (if within depth)
                        if depth < self.config.max_depth:
                            for link in result.discovered_links:
                                if link not in self.visited_urls:
                                    self.queued_urls.append((link, depth + 1))
                    
                    # Delay between requests
                    await asyncio.sleep(self.config.delay_ms / 1000)
                    
            finally:
                await browser.close()
        
        # Update job status
        stats = {
            "pages_crawled": self.pages_crawled,
            "errors_count": self.errors_count,
            "urls_visited": len(self.visited_urls),
        }
        
        status = "completed" if self.errors_count == 0 else "completed"
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
        max_pages=config.get("max_pages", 100) if config else 100,
        delay_ms=config.get("delay_ms", 1000) if config else 1000,
    )
    
    crawler = Crawler(
        tenant_id=tenant_id,
        app_id=app_id,
        job_id=job_id,
        base_url=base_url,
        config=crawler_config,
    )
    
    return await crawler.run()
