# Knowledge Reset Database Migrations

## Quick Start

### Option 1: Run Combined Migration (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → SQL Editor
2. Open `000_complete_migration.sql`
3. Paste the entire contents
4. Click **Run**

### Option 2: Run Individual Migrations
Run each file in order:
1. `001_enable_extensions.sql`
2. `002_create_tenants.sql`
3. `003_create_applications.sql`
4. `004_create_documents.sql`
5. `005_create_crawl_tables.sql`
6. `006_create_audit_logs.sql`
7. `007_create_conversations.sql`

## Tables Created

| Table | Purpose |
|:------|:--------|
| `tenants` | Multi-tenant organization data |
| `applications` | Documentation sources to crawl |
| `documents` | Crawled content with vector embeddings |
| `document_versions` | Version history for documents |
| `crawl_jobs` | Crawl job tracking |
| `crawl_errors` | Crawl error logging |
| `audit_logs` | Compliance audit trail |
| `conversations` | AI chat sessions |
| `messages` | Chat messages |
| `knowledge_corrections` | Expert knowledge corrections |

## Security Features

- **Row-Level Security (RLS)** enabled on all tables
- **Tenant isolation** via `tenant_id` column and RLS policies
- **Audit logs** are immutable (no UPDATE/DELETE policies)
- **Service role** required for crawler and system operations

## Environment Variables

After running migrations, ensure your application uses:

```
SUPABASE_URL=https://esfcxaeckelrelyutacu.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...  # Client-side
SUPABASE_SECRET_KEY=sb_secret_...            # Server-side only
```
