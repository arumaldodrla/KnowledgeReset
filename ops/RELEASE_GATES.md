# Knowledge Reset: Release Gates

**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Active

---

## 1. Gate Overview

All code changes must pass the following gates before production deployment:

| Gate | Type | Pass Criteria | Blocking |
|:-----|:-----|:--------------|:---------|
| Dependency Scanning | Automated | No critical/high CVEs | Yes |
| Secret Scanning | Automated | No secrets detected | Yes |
| SAST | Automated | No high-severity findings | Yes |
| Unit Tests | Automated | 100% pass, >80% coverage | Yes |
| Integration Tests | Automated | 100% pass | Yes |
| Tenant Isolation Tests | Automated | 100% pass | Yes |
| RLS Policy Tests | Automated | 100% pass | Yes |
| SBOM Generation | Automated | Successfully generated | Yes |
| Security Review | Manual | Approved for changes to auth/authz | Conditional |

---

## 2. Automated Gates

### 2.1 Dependency Scanning

**Tool:** `npm audit` / `pip-audit`
**Configuration:**
```yaml
# CI Pipeline
dependency_scan:
  command: |
    pip-audit --strict --desc
  fail_on: 
    - severity: critical
    - severity: high
```

### 2.2 Secret Scanning

**Tool:** `gitleaks`
**Configuration:**
```yaml
secret_scan:
  command: gitleaks detect --source . --verbose
  fail_on: any_detection
```

### 2.3 Static Analysis (SAST)

**Tool:** `bandit` (Python), `semgrep`
**Configuration:**
```yaml
sast:
  command: |
    bandit -r src/ -ll
    semgrep --config=auto src/
  fail_on:
    - severity: high
```

### 2.4 Unit Tests

**Command:**
```bash
pytest tests/unit/ --cov=src --cov-report=xml --cov-fail-under=80
```

### 2.5 Integration Tests

**Command:**
```bash
pytest tests/integration/ -v
```

### 2.6 Tenant Isolation Tests

**Purpose:** Verify RLS policies prevent cross-tenant access
**Command:**
```bash
pytest tests/security/test_tenant_isolation.py -v
```

**Test Cases:**
- User A cannot read User B's documents
- User A cannot query User B's tenant scope
- Admin of Tenant A cannot access Tenant B data

---

## 3. Manual Gates

### 3.1 Security Review

**Required For:**
- Changes to authentication logic
- Changes to authorization/RBAC
- New API endpoints handling sensitive data
- Changes to RLS policies
- New integrations with external services

**Reviewer:** Security team member
**Checklist:**
- [ ] No new vulnerabilities introduced
- [ ] Input validation adequate
- [ ] Output encoding proper
- [ ] Rate limiting in place
- [ ] Audit logging added

---

## 4. SBOM Generation

**Tool:** `syft` or `cyclonedx-bom`
**Output Location:** `compliance/SBOM/`
**Format:** CycloneDX JSON

**Command:**
```bash
syft packages dir:. -o cyclonedx-json > compliance/SBOM/sbom-$(date +%Y%m%d).json
```

---

## 5. Bypass Procedure

**Requirements for bypass:**
1. Written risk acceptance in `compliance/RISK_ACCEPTANCE.md`
2. Compensating controls documented
3. Expiration date set (max 30 days)
4. Approved by Security Owner

**Risk Acceptance Template:**
```markdown
## Bypass: [Gate Name]
- **Date:** YYYY-MM-DD
- **Reason:** [Why bypass is needed]
- **Compensating Controls:** [What mitigations are in place]
- **Residual Risk:** [What risk remains]
- **Expiration:** YYYY-MM-DD
- **Approved By:** [Name/Role]
```

---

## 6. Deployment Flow

```
Code Push
    │
    ▼
┌──────────────┐
│ CI Pipeline  │
├──────────────┤
│ • Lint       │
│ • Unit Tests │
│ • SAST       │
│ • Secrets    │
│ • Deps       │
└──────────────┘
    │
    ▼ (All Pass?)
    │
┌──────────────┐
│ Integration  │
│ Tests        │
└──────────────┘
    │
    ▼ (All Pass?)
    │
┌──────────────┐        ┌─────────────────┐
│ Manual       │◄───────┤ Security Review │
│ Approval     │        │ (if required)   │
└──────────────┘        └─────────────────┘
    │
    ▼
┌──────────────┐
│ PRODUCTION   │
│ DEPLOYMENT   │
└──────────────┘
```
