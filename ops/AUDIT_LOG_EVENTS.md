# Knowledge Reset: Audit Log Events

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Active

---

## 1. Event Schema

All audit events follow this structure:

| Field | Type | Description |
|:------|:-----|:------------|
| `id` | `uuid` | Unique event identifier |
| `event_type` | `text` | Event type code (see below) |
| `actor_id` | `uuid` | User or service account ID |
| `tenant_id` | `uuid` | Tenant context |
| `target_type` | `text` | Resource type affected |
| `target_id` | `uuid` | Resource ID affected |
| `action` | `text` | Action performed |
| `metadata` | `jsonb` | Additional context |
| `ip_address` | `inet` | Client IP address |
| `user_agent` | `text` | Client user agent |
| `request_id` | `uuid` | Correlation ID |
| `created_at` | `timestamp` | Event timestamp (UTC) |

---

## 2. Authentication Events

| Event Type | Description | Logged Fields |
|:-----------|:------------|:--------------|
| `AUTH_LOGIN_SUCCESS` | Successful login | actor_id, ip_address, user_agent |
| `AUTH_LOGIN_FAILURE` | Failed login attempt | email (masked), ip_address, reason |
| `AUTH_LOGOUT` | User logout | actor_id |
| `AUTH_PASSWORD_RESET` | Password reset requested | actor_id |
| `AUTH_PASSWORD_CHANGED` | Password changed | actor_id |
| `AUTH_MFA_ENABLED` | MFA enabled | actor_id |
| `AUTH_MFA_DISABLED` | MFA disabled | actor_id |
| `AUTH_TOKEN_REVOKED` | JWT token revoked | actor_id |

---

## 3. Authorization Events

| Event Type | Description | Logged Fields |
|:-----------|:------------|:--------------|
| `AUTHZ_ROLE_ASSIGNED` | Role assigned to user | actor_id, target_id, role |
| `AUTHZ_ROLE_REVOKED` | Role removed from user | actor_id, target_id, role |
| `AUTHZ_PERMISSION_DENIED` | Access denied | actor_id, resource, action |

---

## 4. Data Events

| Event Type | Description | Logged Fields |
|:-----------|:------------|:--------------|
| `DATA_DOCUMENT_CREATED` | Document created | actor_id, target_id, title |
| `DATA_DOCUMENT_UPDATED` | Document updated | actor_id, target_id, changes |
| `DATA_DOCUMENT_DELETED` | Document deleted | actor_id, target_id |
| `DATA_DOCUMENT_VIEWED` | Document accessed | actor_id, target_id |
| `DATA_DOCUMENT_EXPORTED` | Document exported | actor_id, target_id, format |
| `DATA_BULK_EXPORT` | Bulk data export | actor_id, count, format |

---

## 5. Crawl Events

| Event Type | Description | Logged Fields |
|:-----------|:------------|:--------------|
| `CRAWL_JOB_STARTED` | Crawl job initiated | actor_id, job_id, url |
| `CRAWL_JOB_COMPLETED` | Crawl job finished | job_id, pages_crawled, duration |
| `CRAWL_JOB_FAILED` | Crawl job failed | job_id, error_message |
| `CRAWL_PAGE_INDEXED` | Page indexed | job_id, url, document_id |

---

## 6. Admin Events

| Event Type | Description | Logged Fields |
|:-----------|:------------|:--------------|
| `ADMIN_TENANT_CREATED` | New tenant created | actor_id, tenant_id, name |
| `ADMIN_TENANT_SUSPENDED` | Tenant suspended | actor_id, tenant_id, reason |
| `ADMIN_USER_CREATED` | User created by admin | actor_id, target_id |
| `ADMIN_USER_DELETED` | User deleted by admin | actor_id, target_id |
| `ADMIN_CONFIG_CHANGED` | System config changed | actor_id, setting, old_value, new_value |

---

## 7. Privacy Events

| Event Type | Description | Logged Fields |
|:-----------|:------------|:--------------|
| `PRIVACY_DATA_EXPORT_REQUESTED` | User requested data export | actor_id |
| `PRIVACY_DATA_EXPORT_COMPLETED` | Export ready for download | actor_id |
| `PRIVACY_DATA_DELETION_REQUESTED` | User requested deletion | actor_id |
| `PRIVACY_DATA_DELETION_COMPLETED` | Deletion finalized | actor_id |
| `PRIVACY_CONSENT_GRANTED` | User granted consent | actor_id, consent_type |
| `PRIVACY_CONSENT_REVOKED` | User revoked consent | actor_id, consent_type |

---

## 8. AI Events

| Event Type | Description | Logged Fields |
|:-----------|:------------|:--------------|
| `AI_QUERY_SUBMITTED` | AI query received | actor_id, query_hash, model_used |
| `AI_KNOWLEDGE_ADDED` | Expert added knowledge | actor_id, document_id |
| `AI_KNOWLEDGE_CORRECTED` | Expert corrected knowledge | actor_id, document_id, correction_type |

---

## 9. Implementation Notes

- **Log Integrity:** Logs are append-only (no UPDATE/DELETE)
- **Retention:** 7 years minimum
- **Access:** Security admins only (separate from tenant admins)
- **Storage:** Separate partition in database or external SIEM
