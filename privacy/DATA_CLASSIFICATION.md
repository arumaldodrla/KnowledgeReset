# Knowledge Reset: Data Classification

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Active

---

## 1. Classification Categories

| Category | Definition | Examples |
|:---------|:-----------|:---------|
| **Public** | Non-sensitive, can be shared externally | Public documentation, marketing content |
| **Internal** | Business data, not for external sharing | Crawled documentation, system metadata |
| **Confidential** | Requires access controls | Customer-uploaded documents, AI conversations |
| **Restricted** | Highest protection, limited access | Credentials, API keys, encryption keys |

---

## 2. Data Classification Matrix

### Application Data

| Dataset | Classification | Storage | Access | Retention |
|:--------|:---------------|:--------|:-------|:----------|
| Tenant metadata | Internal | `tenants` table | Admins, System | Indefinite |
| Application configs | Internal | `applications` table | Tenant admins | Indefinite |
| Crawled documents | Confidential | `documents` table | Tenant users (RLS) | User-controlled |
| Document versions | Confidential | `document_versions` table | Tenant users (RLS) | With document |
| Vector embeddings | Confidential | `documents.embedding` | System only | With document |

### Authentication Data

| Dataset | Classification | Storage | Access | Retention |
|:--------|:---------------|:--------|:-------|:----------|
| Email addresses | Confidential | `auth.users` | User, System | Account lifetime |
| Password hashes | Restricted | `auth.users` | System only | Account lifetime |
| JWT tokens | Restricted | Client memory | User only | 1 hour (configurable) |
| API keys | Restricted | Secrets manager | System only | Until rotated |

### Operational Data

| Dataset | Classification | Storage | Access | Retention |
|:--------|:---------------|:--------|:-------|:----------|
| Crawl jobs | Internal | `crawl_jobs` table | Tenant admins | 90 days |
| Crawl errors | Internal | `crawl_errors` table | Tenant admins | 90 days |
| Audit logs | Confidential | `audit_logs` table | Security admins | 7 years |
| Query logs | Confidential | `query_logs` table | Analytics | 90 days |

---

## 3. Storage Buckets & Classification

| Bucket/Location | Purpose | Classification | Encryption |
|:----------------|:--------|:---------------|:-----------|
| Supabase PostgreSQL | All structured data | Mixed (RLS enforced) | AES-256 at rest |
| Supabase Storage | Uploaded files | Confidential | AES-256 at rest |
| Vercel (API) | Runtime only | N/A (no storage) | N/A |
| Cloud Run (Crawler) | Runtime only | N/A (no storage) | N/A |

---

## 4. Handling Requirements by Classification

| Classification | Transmission | Storage | Logging | Sharing |
|:---------------|:-------------|:--------|:--------|:--------|
| Public | Any | Any | Optional | Unrestricted |
| Internal | TLS required | Encrypted | Minimal | Internal only |
| Confidential | TLS required | Encrypted, RLS | Audit logged | Need-to-know |
| Restricted | TLS required | Encrypted, access logged | Full audit | Explicit approval |
