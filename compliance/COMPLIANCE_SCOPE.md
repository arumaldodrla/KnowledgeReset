# Knowledge Reset: Compliance Scope

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Active

---

## 1. Data Types Processed

| Data Type | Classification | Source | Storage Location |
|:----------|:---------------|:-------|:------------------|
| Tenant identifiers | Internal | Registration | `tenants` table |
| User credentials (hashed) | Restricted | Auth | Supabase Auth |
| Documentation content | Internal | Web crawl / Upload | `documents` table |
| Vector embeddings | Internal | AI processing | `documents.embedding` |
| Crawl job metadata | Internal | System | `crawl_jobs` table |
| API access tokens (JWT) | Restricted | Auth | Memory only |
| AI conversation logs | Confidential | Chat interface | `conversations` table |

---

## 2. Jurisdictions & Customer Types

| Jurisdiction | Applicable Regulations |
|:-------------|:-----------------------|
| United States | CCPA, SOC 2, HIPAA (if PHI) |
| European Union | GDPR, ISO 27001 |
| Global | PCI DSS (if payment data - NOT IN SCOPE) |

**Customer Types:**
- Internal Digital Reset teams
- External customers (B2B SaaS model)
- Healthcare organizations (HIPAA compliance required)

---

## 3. Integrations & Subprocessors

| Subprocessor | Purpose | Data Shared |
|:-------------|:--------|:------------|
| Supabase | Database, Auth, Storage | All application data |
| Vercel | API hosting | API requests/logs |
| Google Cloud Run | Crawler execution | URLs, crawled content |
| Anthropic (Claude) | AI processing | Anonymized queries |
| OpenAI (GPT) | AI processing | Anonymized queries |
| Google (Gemini) | AI processing | Anonymized queries |

---

## 4. Applicable Requirements Matrix

| Standard/Regulation | Applies? | Reason |
|:--------------------|:---------|:-------|
| SOC 2 Type II | **YES** | B2B SaaS platform with customer data |
| ISO 27001 | **YES** | Information security for multi-tenant system |
| GDPR | **YES** | EU customers, personal data in documents |
| CCPA | **YES** | California customers |
| HIPAA | **CONDITIONAL** | Only if PHI is processed |
| PCI DSS | **NO** | Payment data not handled |

---

## 5. Scope Boundaries

**In Scope:**
- Multi-tenant data isolation
- Authentication and authorization
- Data encryption (at rest and in transit)
- Audit logging
- Data subject rights (access, deletion, export)
- AI model data separation

**Out of Scope:**
- Payment card processing
- Direct healthcare record storage (customers manage their own PHI)
