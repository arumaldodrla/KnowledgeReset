# Knowledge Reset: Data Flow

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Active

---

## 1. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA SOURCES                                    │
├───────────────────┬──────────────────────┬──────────────────────────────────┤
│  Web Crawler      │  File Upload API     │  Conversational AI Interface     │
│  (Public URLs)    │  (Docs/Images/Voice) │  (Expert Knowledge Feeding)      │
└─────────┬─────────┴──────────┬───────────┴────────────────┬─────────────────┘
          │                    │                            │
          ▼                    ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INGESTION LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Content Extraction → Sanitization → Embedding Generation → Storage  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE DATA STORE                                   │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐     │
│  │ tenants    │  │ documents   │  │ crawl_jobs   │  │ audit_logs      │     │
│  │ (isolated) │  │ (+ vectors) │  │              │  │                 │     │
│  └────────────┘  └─────────────┘  └──────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        QUERY LAYER (GraphQL API)                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Authentication → Authorization (RLS) → Query → Response             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         ┌─────────────────────┐         ┌─────────────────────┐
         │ Client Applications │         │ AI Services         │
         │ (via GraphQL)       │         │ (Anonymized queries)│
         └─────────────────────┘         └─────────────────────┘
```

---

## 2. Data Types & Flow Details

### 2.1 Documentation Content

| Stage | Data | Location | Encryption | Access Control |
|:------|:-----|:---------|:-----------|:---------------|
| Entry | Raw HTML/Text | Crawler memory | TLS | Crawler service only |
| Processing | Sanitized content | API memory | TLS | API service only |
| Storage | Text + Embedding | `documents` table | AES-256 at rest | RLS (tenant_id) |
| Query | Search results | API response | TLS | JWT + RLS |
| Exit | JSON response | Client | TLS | User's tenant only |

### 2.2 User Credentials

| Stage | Data | Location | Encryption | Access Control |
|:------|:-----|:---------|:-----------|:---------------|
| Entry | Email/Password | Login form | TLS | Public |
| Processing | Hashed password | Supabase Auth | bcrypt | Auth service only |
| Storage | Hash + metadata | `auth.users` | AES-256 at rest | System only |
| Session | JWT token | Client memory | Signed JWT | User only |

### 2.3 AI Query Data

| Stage | Data | Location | Encryption | Access Control |
|:------|:-----|:---------|:-----------|:---------------|
| Entry | User question | API request | TLS | Authenticated user |
| Processing | Anonymized query | AI API call | TLS | No tenant identifiers |
| Response | AI answer | API memory | TLS | Return to user only |
| Logging | Query metadata | `query_logs` | AES-256 | Audit purposes |

---

## 3. Data Exit Points

| Exit Point | Data Shared | Controls |
|:-----------|:------------|:---------|
| GraphQL API | Tenant-scoped documents, search results | JWT auth, RLS filtering |
| AI APIs (Claude/Gemini/OpenAI) | Anonymized queries only | No tenant_id, no PII |
| Data Export | User's own data | Authenticated, tenant-scoped |
| Audit Logs | System events | Admin access only |

---

## 4. Sensitive Data Handling

| Data Type | Storage | Retention | Deletion Process |
|:----------|:--------|:----------|:-----------------|
| User credentials | Supabase Auth | Account lifetime | Cascade delete on account removal |
| Documents | `documents` table | Until deleted | Soft delete → Hard delete after 30 days |
| Vector embeddings | `documents.embedding` | With document | Deleted with document |
| Audit logs | `audit_logs` table | 7 years | Automated archival after retention |
| AI conversation logs | `conversations` table | 90 days default | User-initiated or automatic purge |
