# Web Crawler Architecture: Complete Technical Specification

## 1. Crawler System Overview

The Knowledge Reset web crawler is designed to automatically discover, extract, and organize knowledge from documentation websites, regardless of their underlying technology stack or structure.

### 1.1. Core Technology: Playwright on Google Cloud Run

**Why Playwright:**
- **Multi-browser support:** Chromium, Firefox, and WebKit
- **Better API:** More modern and intuitive than Puppeteer
- **Auto-waiting:** Built-in smart waiting for elements
- **Network interception:** Better control over requests/responses
- **Cross-platform:** Works on Linux, macOS, Windows

**Why Google Cloud Run:**
- **No execution time limits:** Unlike Vercel (10-60 sec), Cloud Run allows unlimited execution
- **Auto-scaling:** Scales from 0 to thousands of instances
- **Cost-effective:** Pay only for actual compute time
- **Container-based:** Full control over environment

### 1.2. Crawler Capabilities

| Feature | Implementation | Purpose |
|:---|:---|:---|
| **Link Discovery** | Breadcrumbs, TOC, menus, sitemaps | Automatically find all documentation pages |
| **Content Extraction** | Multiple selectors (main, article, .content) | Extract clean content regardless of site structure |
| **Hierarchy Building** | Breadcrumb analysis + parent-child relationships | Preserve document structure (categories, subcategories, sections) |
| **Version Control** | SHA-256 content hashing | Detect changes and maintain version history |
| **Multi-level Crawling** | Configurable depth (default: 3 levels) | Handle nested documentation structures |
| **Error Handling** | Retry logic + error logging | Robust crawling with detailed error tracking |

---

## 2. Crawling Process Flow

### 2.1. High-Level Flow

```
1. User provides documentation URL
2. Crawler initializes with URL
3. Browser navigates to page
4. Content extraction begins:
   - Extract title (h1 or title tag)
   - Extract breadcrumbs (multiple selector strategies)
   - Extract main content (multiple selector strategies)
   - Remove unwanted elements (nav, header, footer, ads)
   - Extract internal links
   - Extract table of contents
5. Calculate content hash (SHA-256)
6. Discover new URLs from links
7. Save document to database
8. Queue discovered URLs for crawling
9. Repeat until max depth or max pages reached
```

### 2.2. Content Extraction Strategy

The crawler uses a **fallback selector strategy** to work with any documentation site:

**Title Extraction:**
1. Try `h1` element
2. Fall back to `title` tag
3. Default to "Untitled"

**Breadcrumb Extraction (tries in order):**
1. `.breadcrumb a`
2. `.breadcrumbs a`
3. `[aria-label="breadcrumb"] a`
4. `nav[aria-label="Breadcrumb"] a`

**Main Content Extraction (tries in order):**
1. `main`
2. `article`
3. `.content`
4. `.main-content`
5. `#content`
6. `.documentation`
7. `.doc-content`
8. Fall back to `body` (with unwanted elements removed)

**Unwanted Elements (removed):**
- `nav`, `header`, `footer`
- `.navigation`, `.sidebar`, `.menu`
- `.ad`, `.advertisement`
- `script`, `style`, `iframe`

### 2.3. Hierarchy Building

The crawler builds document hierarchy using **breadcrumbs** and **parent-child relationships**:

1. **Breadcrumbs provide the path:**
   - Example: Home > Documentation > API > Authentication
   - This creates a 4-level hierarchy

2. **Parent-child relationships:**
   - Each document stores its `parent_id`
   - The parent is determined by matching the last breadcrumb URL to an existing document

3. **Multi-level support:**
   - The system supports unlimited hierarchy levels
   - Categories → Subcategories → Sections → Subsections → Articles

---

## 3. Database Schema for Crawled Data

### 3.1. Core Tables

**Documents Table:**
```
id: bigint (primary key)
app_id: bigint (foreign key to Applications)
title: varchar(500)
slug: varchar(500)
parent_id: bigint (self-referencing foreign key for hierarchy)
version_id: bigint (foreign key to Versions)
content_text: text (plain text content)
content_html: text (HTML content)
content_hash: varchar(64) (SHA-256 hash for change detection)
source_url: varchar(1000) (original URL)
breadcrumbs: text (JSON array of breadcrumb path)
json_meta: text (additional metadata)
created_at: datetime
updated_at: datetime
```

**Applications Table:**
```
id: bigint (primary key)
manufacturer_id: bigint (foreign key)
name: varchar(255)
url_doc_base: varchar(500) (base URL for documentation)
status: varchar(50)
crawl_freq_days: int (how often to re-crawl)
last_crawl_at: datetime
active: boolean
created_at: datetime
```

**DocSources Table:**
```
id: bigint (primary key)
app_id: bigint (foreign key)
url: varchar(1000) (unique starting URL)
title: varchar(500)
type: varchar(50)
index_depth: int (max crawl depth)
state: varchar(50) (pending, crawling, completed, failed)
notes: text
created_at: datetime
```

**DocumentVersions Table:**
```
id: bigint (primary key)
doc_id: bigint (foreign key to Documents)
content_html: text
content_hash: varchar(64)
diff_summary: text (summary of changes)
created_at: datetime
```

### 3.2. Hierarchy Example

```
Document: "Getting Started" (id: 1, parent_id: null)
  └─ Document: "Installation" (id: 2, parent_id: 1)
      ├─ Document: "Windows Installation" (id: 3, parent_id: 2)
      ├─ Document: "Mac Installation" (id: 4, parent_id: 2)
      └─ Document: "Linux Installation" (id: 5, parent_id: 2)
```

---

## 4. Crawling Configuration

### 4.1. Configurable Parameters

| Parameter | Default | Description |
|:---|:---|:---|
| `maxDepth` | 3 | Maximum crawl depth from starting URL |
| `maxPages` | 100 | Maximum number of pages to crawl |
| `delayMs` | 1000 | Delay between requests (ms) |
| `concurrency` | 1 | Number of concurrent crawlers |
| `timeout` | 30000 | Page load timeout (ms) |
| `waitForSelector` | 'body' | Selector to wait for before extraction |
| `userAgent` | 'KnowledgeReset-Crawler/1.0' | User agent string |
| `respectRobots` | true | Respect robots.txt |

### 4.2. Crawl Scheduling

- **On-demand:** Triggered by user or API call
- **Scheduled:** Automatic re-crawling based on `crawl_freq_days`
- **Event-driven:** Triggered by webhooks (e.g., documentation updated)

---

## 5. Technology Stack for Crawler

| Component | Technology | Justification |
|:---|:---|:---|
| **Browser Automation** | Playwright | Multi-browser, modern API, auto-waiting |
| **Runtime** | Node.js 20+ or Python 3.11+ | Playwright supports both |
| **Hosting** | Google Cloud Run | Unlimited execution time, auto-scaling |
| **Container** | Docker | Portable, reproducible environment |
| **Queue** | Supabase (PostgreSQL) | Built-in queue with `CrawlJobs` table |
| **Storage** | Supabase (PostgreSQL + pgvector) | Unified data storage |

---

## 6. Handling Different Documentation Formats

The crawler is designed to work with **any documentation format**:

### 6.1. Static Site Generators

| Generator | Strategy |
|:---|:---|
| **Docusaurus** | Extract from `main` or `article`, use sidebar for hierarchy |
| **MkDocs** | Extract from `.md-content`, use navigation for hierarchy |
| **GitBook** | Extract from `.page-inner`, use TOC for hierarchy |
| **Sphinx** | Extract from `.document`, use TOC tree for hierarchy |
| **VuePress** | Extract from `.theme-default-content`, use sidebar for hierarchy |
| **Jekyll** | Extract from `.content`, use breadcrumbs for hierarchy |

### 6.2. Custom Documentation Sites

For custom sites, the crawler uses **multiple fallback selectors** to ensure content is extracted correctly, regardless of the site's structure.

---

## 7. Error Handling and Retry Logic

### 7.1. Error Types

| Error Type | Handling Strategy |
|:---|:---|
| **Network errors** | Retry up to 3 times with exponential backoff |
| **Timeout errors** | Increase timeout and retry |
| **404 errors** | Log and skip |
| **403/401 errors** | Log and notify (may require authentication) |
| **Content extraction failures** | Log with page screenshot for debugging |

### 7.2. Error Logging

All errors are logged to the `CrawlErrors` table with:
- URL
- Error code
- Error message
- Timestamp
- Retry count

---

## 8. Performance Optimization

### 8.1. Optimization Strategies

1. **Concurrent crawling:** Run multiple crawlers in parallel
2. **Intelligent queueing:** Prioritize important pages
3. **Content caching:** Use content hash to avoid re-processing unchanged pages
4. **Incremental crawling:** Only crawl new or updated pages
5. **Resource filtering:** Block unnecessary resources (images, fonts, analytics)

### 8.2. Expected Performance

- **Single page:** 2-5 seconds
- **100-page documentation:** 5-10 minutes
- **1000-page documentation:** 30-60 minutes

---

## 9. Integration with Knowledge Reset

### 9.1. Crawler API Endpoints

- `POST /api/crawler/start` - Start a new crawl job
- `GET /api/crawler/status/:jobId` - Get crawl job status
- `POST /api/crawler/stop/:jobId` - Stop a running crawl job
- `GET /api/crawler/errors/:jobId` - Get crawl errors

### 9.2. Data Flow

```
1. User submits documentation URL via admin interface
2. Admin interface calls Knowledge Reset API
3. Knowledge Reset API creates CrawlJob record
4. Cloud Run crawler is triggered
5. Crawler extracts content and saves to Supabase
6. Knowledge Reset API processes content for AI query engine
7. Content is indexed and ready for queries
```

---

This architecture ensures that Knowledge Reset can crawl **any documentation website**, regardless of technology stack, and properly organize the content with full hierarchy preservation.
