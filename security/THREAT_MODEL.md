# Knowledge Reset: Threat Model

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Active

---

## 1. Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET (Untrusted)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌──────────────┐       ┌──────────────────┐
            │ Client Apps  │       │ External Websites │
            │ (Browsers)   │       │ (Crawl targets)   │
            └──────────────┘       └──────────────────┘
                    │                       │
        [TLS + JWT Auth]           [Playwright Sandbox]
                    │                       │
                    ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TRUST BOUNDARY 1: API LAYER                 │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │ GraphQL API      │    │ Crawler Service (Cloud Run)      │   │
│  │ (Vercel)         │    │                                  │   │
│  └──────────────────┘    └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                    │                       │
        [RLS + tenant_id]           [Validated content only]
                    │                       │
                    ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TRUST BOUNDARY 2: DATA LAYER                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Supabase (PostgreSQL + pgvector + Auth + Storage)       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                    │
        [Anonymized + rate-limited]
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                TRUST BOUNDARY 3: AI SERVICES                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ Claude API │  │ Gemini API │  │ OpenAI API │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Threat Analysis (STRIDE)

### 2.1 Spoofing Identity

| Threat | Impact | Mitigation | Test |
|:-------|:-------|:-----------|:-----|
| Forged JWT tokens | Unauthorized access | Validate JWT signature with Supabase secret | Unit test JWT validation |
| Session hijacking | Account takeover | Short-lived tokens, secure cookie settings | Penetration test |

### 2.2 Tampering

| Threat | Impact | Mitigation | Test |
|:-------|:-------|:-----------|:-----|
| SQL injection | Data breach | Parameterized queries via Supabase client | SAST scanning |
| XSS in crawled content | Malicious script execution | Sanitize HTML, CSP headers | Content sanitization tests |
| Prompt injection | AI manipulation | Input validation, output filtering | AI output tests |

### 2.3 Repudiation

| Threat | Impact | Mitigation | Test |
|:-------|:-------|:-----------|:-----|
| Denied actions | Compliance failure | Comprehensive audit logging | Audit log coverage tests |

### 2.4 Information Disclosure

| Threat | Impact | Mitigation | Test |
|:-------|:-------|:-----------|:-----|
| Tenant data leakage | Breach, legal liability | RLS policies, tenant_id filtering in every query | Cross-tenant isolation tests |
| API keys in logs | Credential theft | Never log secrets, use secrets manager | Log review, secret scanning |
| AI model data leakage | Privacy violation | Anonymize before sending to AI APIs | Data anonymization tests |

### 2.5 Denial of Service

| Threat | Impact | Mitigation | Test |
|:-------|:-------|:-----------|:-----|
| API flooding | Service unavailability | Rate limiting (1000 req/min/tenant) | Load testing |
| Crawler abuse | Resource exhaustion | Max pages limit, concurrent request limits | Crawler limit tests |

### 2.6 Elevation of Privilege

| Threat | Impact | Mitigation | Test |
|:-------|:-------|:-----------|:-----|
| Admin role escalation | Full system compromise | RBAC + explicit permission checks | RBAC tests |
| Cross-tenant access | Data breach | RLS at database level | Integration tests proving isolation |

---

## 3. Critical Controls Summary

1. **JWT Authentication** - All API requests authenticated
2. **Row-Level Security** - Database-enforced tenant isolation
3. **Input Validation** - All user input sanitized
4. **Audit Logging** - All critical actions logged
5. **Encryption** - TLS in transit, AES-256 at rest
6. **Rate Limiting** - Prevent resource exhaustion
7. **AI Data Anonymization** - No tenant data to AI providers
