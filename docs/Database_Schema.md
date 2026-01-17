# Knowledge Reset: Database Schema & Data Model

## 1. Database Technology: Supabase (PostgreSQL with pgvector)

**Why Supabase:**
- **PostgreSQL:** Robust, open-source, and feature-rich relational database.
- **pgvector:** Enables efficient semantic search on vector embeddings.
- **Row-Level Security (RLS):** Critical for multi-tenant data isolation.
- **Auto-generated APIs:** Speeds up development with instant RESTful and GraphQL APIs.
- **Authentication:** Built-in user management and authentication.
- **Storage:** Integrated object storage for files, images, and other assets.
- **Scalability:** Managed service that scales with your needs.

## 2. Data Model Overview

The data model is designed to support a multi-tenant knowledge base with a hierarchical structure, version control, and semantic search capabilities.

![Data Model Diagram](https://i.imgur.com/your-db-diagram.png)  
*Figure 1: High-Level Data Model Diagram (Placeholder)*

## 3. Core Tables

### 3.1. `tenants`

Stores information about each customer or internal team.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key (auto-generated) |
| `name` | `text` | Name of the tenant |
| `domain` | `text` | Custom domain for the tenant |
| `status` | `text` | `active`, `inactive`, `suspended` |
| `created_at` | `timestamp` | Timestamp of creation |

### 3.2. `applications`

Represents a specific software application whose documentation is being crawled.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `tenant_id` | `uuid` | Foreign key to `tenants` |
| `name` | `text` | Name of the application |
| `url_doc_base` | `text` | Base URL for the documentation |
| `crawl_freq_days` | `integer` | How often to re-crawl (in days) |
| `last_crawl_at` | `timestamp` | Timestamp of the last crawl |
| `created_at` | `timestamp` | Timestamp of creation |

### 3.3. `documents`

Stores the crawled content from documentation websites.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `tenant_id` | `uuid` | Foreign key to `tenants` |
| `app_id` | `uuid` | Foreign key to `applications` |
| `parent_id` | `uuid` | Self-referencing key for hierarchy |
| `title` | `text` | Title of the document |
| `content_text` | `text` | Plain text content |
| `content_html` | `text` | HTML content |
| `content_hash` | `text` | SHA-256 hash for change detection |
| `source_url` | `text` | Original URL of the document |
| `breadcrumbs` | `jsonb` | JSON array of breadcrumb path |
| `embedding` | `vector(1536)` | Vector embedding for semantic search |
| `created_at` | `timestamp` | Timestamp of creation |
| `updated_at` | `timestamp` | Timestamp of last update |

### 3.4. `document_versions`

Stores the version history of each document.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `document_id` | `uuid` | Foreign key to `documents` |
| `content_html` | `text` | HTML content of this version |
| `content_hash` | `text` | SHA-256 hash of this version |
| `diff_summary` | `text` | Summary of changes from the previous version |
| `created_at` | `timestamp` | Timestamp of creation |

## 4. Supporting Tables

### 4.1. `crawl_jobs`

Tracks the status of each crawl job.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `app_id` | `uuid` | Foreign key to `applications` |
| `status` | `text` | `pending`, `running`, `completed`, `failed` |
| `started_at` | `timestamp` | Timestamp when the job started |
| `finished_at` | `timestamp` | Timestamp when the job finished |
| `stats` | `jsonb` | Crawl statistics (pages crawled, errors, etc.) |
| `created_at` | `timestamp` | Timestamp of creation |

### 4.2. `crawl_errors`

Logs any errors that occur during crawling.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Primary key |
| `job_id` | `uuid` | Foreign key to `crawl_jobs` |
| `url` | `text` | URL that caused the error |
| `error_code` | `text` | HTTP status code or error code |
| `error_message` | `text` | Detailed error message |
| `created_at` | `timestamp` | Timestamp of the error |

### 4.3. `users` & `roles`

Standard tables for user authentication and role-based access control (RBAC), managed by Supabase Auth.

## 5. Multi-Tenancy Implementation

Multi-tenancy is implemented using a combination of **Row-Level Security (RLS)** and a `tenant_id` column in every relevant table.

### 5.1. RLS Policies

- **`documents` table:**
  - `CREATE POLICY 
