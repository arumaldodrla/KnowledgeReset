"""
Knowledge Reset Crawler - Content Extraction Strategies
Implements multiple fallback strategies for extracting content from various documentation sites.
"""

import re
from typing import Optional, List, Dict, Any
from bs4 import BeautifulSoup


# ==================== TITLE EXTRACTION ====================

def extract_title(soup: BeautifulSoup) -> str:
    """Extract page title with fallback strategies."""
    # Strategy 1: h1 element
    h1 = soup.find("h1")
    if h1:
        return h1.get_text(strip=True)
    
    # Strategy 2: title tag
    title_tag = soup.find("title")
    if title_tag:
        title_text = title_tag.get_text(strip=True)
        # Remove common suffixes like " | Docs" or " - Documentation"
        title_text = re.sub(r'\s*[|\-–]\s*.*$', '', title_text)
        return title_text
    
    # Fallback
    return "Untitled"


# ==================== BREADCRUMB EXTRACTION ====================

BREADCRUMB_SELECTORS = [
    ".breadcrumb a",
    ".breadcrumbs a",
    "[aria-label='breadcrumb'] a",
    "nav[aria-label='Breadcrumb'] a",
    ".navigation-breadcrumb a",
    "ol.breadcrumb a",
    ".docs-breadcrumb a",
]


def extract_breadcrumbs(soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
    """Extract breadcrumbs with fallback selectors."""
    for selector in BREADCRUMB_SELECTORS:
        try:
            elements = soup.select(selector)
            if elements:
                breadcrumbs = []
                for el in elements:
                    href = el.get("href", "")
                    text = el.get_text(strip=True)
                    if text:
                        # Make relative URLs absolute
                        if href and not href.startswith(("http://", "https://")):
                            if href.startswith("/"):
                                from urllib.parse import urljoin
                                href = urljoin(base_url, href)
                        breadcrumbs.append({"text": text, "href": href})
                if breadcrumbs:
                    return breadcrumbs
        except Exception:
            continue
    
    return []


# ==================== MAIN CONTENT EXTRACTION ====================

CONTENT_SELECTORS = [
    "main",
    "article",
    ".content",
    ".main-content",
    "#content",
    ".documentation",
    ".doc-content",
    ".md-content",  # MkDocs
    ".page-inner",  # GitBook
    ".document",  # Sphinx
    ".theme-default-content",  # VuePress
    ".article-content",
    "[role='main']",
]

UNWANTED_SELECTORS = [
    "nav",
    "header",
    "footer",
    ".navigation",
    ".sidebar",
    ".menu",
    ".toc",
    ".table-of-contents",
    ".ad",
    ".advertisement",
    ".cookie-banner",
    "script",
    "style",
    "iframe",
    ".edit-this-page",
    ".feedback",
    ".comments",
]


def extract_main_content(soup: BeautifulSoup) -> tuple[str, str]:
    """
    Extract main content as both text and HTML.
    Returns (content_text, content_html)
    """
    # Try each content selector
    content_element = None
    for selector in CONTENT_SELECTORS:
        try:
            element = soup.select_one(selector)
            if element:
                content_element = element
                break
        except Exception:
            continue
    
    # Fallback to body
    if not content_element:
        content_element = soup.find("body") or soup
    
    # Remove unwanted elements
    for selector in UNWANTED_SELECTORS:
        try:
            for el in content_element.select(selector):
                el.decompose()
        except Exception:
            continue
    
    # Get HTML and text
    content_html = str(content_element)
    content_text = content_element.get_text(separator="\n", strip=True)
    
    # Clean up excessive whitespace
    content_text = re.sub(r'\n{3,}', '\n\n', content_text)
    content_text = content_text.strip()
    
    return content_text, content_html


# ==================== LINK EXTRACTION ====================

def extract_internal_links(soup: BeautifulSoup, base_url: str, allowed_domain: str) -> List[str]:
    """Extract internal documentation links."""
    from urllib.parse import urljoin, urlparse
    
    links = set()
    
    for a_tag in soup.find_all("a", href=True):
        href = a_tag.get("href", "")
        
        # Skip anchors, javascript, mailto, etc.
        if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue
        
        # Make absolute
        absolute_url = urljoin(base_url, href)
        
        # Parse and validate
        parsed = urlparse(absolute_url)
        
        # Must be same domain
        if allowed_domain not in parsed.netloc:
            continue
        
        # Remove fragment
        clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        
        # Skip common non-documentation paths
        skip_patterns = [
            "/api/",
            "/auth/",
            "/login",
            "/signup",
            "/search",
            ".pdf",
            ".zip",
            ".tar",
            ".png",
            ".jpg",
            ".gif",
            ".svg",
        ]
        if any(pattern in clean_url.lower() for pattern in skip_patterns):
            continue
        
        links.add(clean_url)
    
    return list(links)


# ==================== TABLE OF CONTENTS ====================

def extract_table_of_contents(soup: BeautifulSoup) -> List[Dict[str, Any]]:
    """Extract table of contents / sidebar navigation."""
    toc_selectors = [
        ".table-of-contents a",
        ".toc a",
        ".sidebar-nav a",
        ".docs-sidebar a",
        "nav.sidebar a",
        "#sidebar a",
    ]
    
    for selector in toc_selectors:
        try:
            elements = soup.select(selector)
            if elements:
                toc = []
                for el in elements:
                    text = el.get_text(strip=True)
                    href = el.get("href", "")
                    if text and href:
                        toc.append({"text": text, "href": href})
                if len(toc) >= 3:  # Only return if we found a reasonable TOC
                    return toc
        except Exception:
            continue
    
    return []


# ==================== METADATA EXTRACTION ====================

def extract_metadata(soup: BeautifulSoup) -> Dict[str, Any]:
    """Extract page metadata."""
    metadata = {}
    
    # Description
    desc_tag = soup.find("meta", attrs={"name": "description"})
    if desc_tag:
        metadata["description"] = desc_tag.get("content", "")
    
    # Keywords
    keywords_tag = soup.find("meta", attrs={"name": "keywords"})
    if keywords_tag:
        metadata["keywords"] = keywords_tag.get("content", "")
    
    # Last modified
    for attr in ["dateModified", "date-modified", "last-modified"]:
        mod_tag = soup.find("meta", attrs={"name": attr}) or soup.find("meta", attrs={"property": attr})
        if mod_tag:
            metadata["last_modified"] = mod_tag.get("content", "")
            break
    
    # Author
    author_tag = soup.find("meta", attrs={"name": "author"})
    if author_tag:
        metadata["author"] = author_tag.get("content", "")
    
    return metadata
