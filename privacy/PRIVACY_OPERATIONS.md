# Knowledge Reset: Privacy Operations

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Active

---

## 1. Data Subject Rights

### 1.1 Right to Access (GDPR Art. 15, CCPA 1798.110)

**Request Process:**
1. User submits access request via account settings or support
2. System verifies user identity
3. API endpoint: `POST /api/privacy/export`
4. System compiles all user data:
   - Account profile
   - Uploaded documents
   - Query history
   - AI conversation logs
5. Data exported as JSON/ZIP within 30 days
6. Audit log entry created

**API Implementation:**
```graphql
mutation ExportUserData {
  exportUserData {
    downloadUrl
    expiresAt
  }
}
```

---

### 1.2 Right to Deletion (GDPR Art. 17, CCPA 1798.105)

**Deletion Scope:**
| Data Type | Deletion Method | Timeline |
|:----------|:----------------|:---------|
| User profile | Hard delete | Immediate |
| Documents | Soft delete → Hard delete | 30 days |
| Vector embeddings | Cascade delete | With document |
| Query logs | Anonymize | Immediate |
| Audit logs | Retained (legal requirement) | 7 years |

**Request Process:**
1. User submits deletion request via account settings
2. System verifies user identity
3. API endpoint: `POST /api/privacy/delete`
4. Soft delete applied immediately
5. Hard delete after 30-day grace period
6. Confirmation email sent
7. Audit log entry created

**API Implementation:**
```graphql
mutation DeleteUserData($includeAccount: Boolean!) {
  deleteUserData(includeAccount: $includeAccount) {
    success
    scheduledDeletionDate
  }
}
```

---

### 1.3 Right to Rectification (GDPR Art. 16)

**Process:**
1. User edits data via standard UI/API
2. Previous version stored in `document_versions`
3. Audit log entry created

---

### 1.4 Right to Data Portability (GDPR Art. 20)

**Export Format:** JSON, with machine-readable structure
**Included Data:** All user-created/uploaded content

---

## 2. Consent Management

### 2.1 Collection Points

| Data Collection | Consent Type | Withdrawal Method |
|:----------------|:-------------|:------------------|
| Account creation | Explicit (signup) | Account deletion |
| Document upload | Implicit (action) | Document deletion |
| AI conversations | Explicit (first use) | Settings toggle |
| Analytics | Opt-in | Settings toggle |

---

## 3. Retention Policy

| Data Type | Default Retention | Justification |
|:----------|:------------------|:--------------|
| User accounts | Until deletion requested | Service provision |
| Documents | Until user deletes | Service provision |
| Crawl job logs | 90 days | Troubleshooting |
| Query logs | 90 days | Analytics |
| Audit logs | 7 years | Legal/compliance |
| Backup data | 30 days | Disaster recovery |

---

## 4. Anonymization Procedures

### For AI Training/Analytics:
1. Remove all tenant_id references
2. Remove user identifiers (emails, names, IDs)
3. Generalize location data (country level only)
4. Apply k-anonymity (minimum group size: 5)

### For AI Query Processing:
1. Strip tenant context before sending to AI APIs
2. Use generic session IDs (not linked to users)
3. Never include document source URLs

---

## 5. Subprocessor Notifications

When data is shared with subprocessors, ensure:
1. Data Processing Agreement (DPA) in place
2. User notified in privacy policy
3. Minimum necessary data shared
4. Processing logged for audit

---

## 6. Operational Runbook

### Handling Access Request
```
1. Verify requester identity (email confirmation)
2. Run: SELECT * FROM get_user_data(:user_id)
3. Package into JSON export
4. Upload to Supabase Storage (signed URL, 7-day expiry)
5. Send download link to user
6. Log: INSERT INTO audit_logs (event_type: 'DATA_EXPORT')
```

### Handling Deletion Request
```
1. Verify requester identity
2. Run: SELECT soft_delete_user_data(:user_id)
3. Schedule hard delete: INSERT INTO deletion_queue
4. Send confirmation email
5. Log: INSERT INTO audit_logs (event_type: 'DATA_DELETION_REQUESTED')
6. After 30 days: Run hard_delete_user_data(:user_id)
7. Log: INSERT INTO audit_logs (event_type: 'DATA_DELETION_COMPLETED')
```
