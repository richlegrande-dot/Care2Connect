# V2 Intake — General Availability Gate

> **Date**: February 19, 2026
> **Phase**: 6B — Blocker Removal
> **Purpose**: Define explicit GO / NO-GO criteria for General Availability launch
> **Authority**: Decision requires all 4 stakeholder approvals (see `V2_GA_APPROVAL_TRACKER.md`)

---

## Purpose

This document defines the complete set of criteria that must be satisfied
before the V2 Intake system transitions from **Pilot** to **General
Availability (GA)**. It includes the blocker clearance checklist, risk
assessment, rollback procedures, and post-launch monitoring plans.

No subjective judgment is permitted in the GO/NO-GO decision — every
criterion is binary (met / not met).

---

## 1. Blockers Cleared Checklist

All 7 original blockers must be either RESOLVED or SCHEDULED WITH EVIDENCE.

| # | Blocker | Required Evidence | Status |
|---|---------|-------------------|--------|
| 1 | Git remote configured | `git remote -v` shows origin | [ ] |
| 2 | Remote CI verified | GitHub Actions run URL showing `test-v2-intake` pass | [ ] |
| 3 | Branch protection applied | GitHub Settings screenshot or `gh api` output | [ ] |
| 4 | Calibration session completed | Sign-off document from Clinical Director | [ ] |
| 5 | DV testing completed | Sign-off document from certified DV advocate | [ ] |
| 6 | All stakeholder approvals | 4/4 sign-offs in `V2_PILOT_REVIEW.md` | [ ] |
| 7 | `gh` CLI installed (optional) | `gh --version` output or N/A (workaround used) | [ ] |

### Gate Rule

- Items 1–6: **ALL REQUIRED** for GO decision
- Item 7: Optional — does not block GA

---

## 2. Infrastructure Gate

| # | Criterion | Verification Command | Expected | Status |
|---|-----------|---------------------|----------|--------|
| 1 | Server running | `curl /health/live` | 200, `alive` | [ ] |
| 2 | V2 routes active | `curl /api/v2/intake/health` | 200, `healthy` | [ ] |
| 3 | Database connected | V2 health shows `database: connected` | `connected` | [ ] |
| 4 | Auth enforcing | `POST /session` without token | 401 | [ ] |
| 5 | Migrations current | `npx prisma migrate status` | `up to date` | [ ] |
| 6 | Feature flag correct | V2 health shows `featureFlag: true` | `true` | [ ] |
| 7 | Policy pack version | V2 version shows `v1.0.0` | `v1.0.0` (or calibration-bumped) | [ ] |
| 8 | No critical incidents | Incidents table audit | 0 open critical | [ ] |
| 9 | Rate limiting active | Env check `DISABLE_RATE_LIMITING=false` | `false` | [ ] |
| 10 | Secrets configured | Env audit (all `[REDACTED_SET]`) | All present | [ ] |

### Gate Rule: ALL 10 must pass.

---

## 3. Governance Gate

| # | Criterion | Evidence | Status |
|---|-----------|----------|--------|
| 1 | Technical Lead sign-off | Recorded in `V2_PILOT_REVIEW.md` §3.3 | [ ] |
| 2 | Data Privacy sign-off | Recorded in `V2_PILOT_REVIEW.md` §3.4 | [ ] |
| 3 | Program Manager sign-off | Recorded in `V2_PILOT_REVIEW.md` §3.1 | [ ] |
| 4 | DV Advocate sign-off | Recorded in `V2_PILOT_REVIEW.md` §3.2 | [ ] |
| 5 | Calibration session completed | `V2_CALIBRATION_SESSION_STATUS.md` updated | [ ] |
| 6 | DV testing completed | `V2_DV_TESTING_STATUS.md` updated | [ ] |
| 7 | Scoring freeze maintained | No scoring files modified since pilot | [ ] |
| 8 | No guardrail violations | Guardrails compliance table all green | [ ] |

### Gate Rule: ALL 8 must pass.

---

## 4. Clinical Gate

| # | Criterion | Evidence | Status |
|---|-----------|----------|--------|
| 1 | Scoring weights reviewed by clinicians | Calibration session minutes | [ ] |
| 2 | Override rules validated | Calibration session sign-off | [ ] |
| 3 | Edge-case personas passed | 5/5 personas reviewed | [ ] |
| 4 | Fairness analysis reviewed | No discriminatory patterns identified | [ ] |
| 5 | Version bump completed (if changes) | POLICY_PACK_VERSION updated | [ ] |

### Gate Rule: ALL 5 must pass.

---

## 5. DV Safety Gate

| # | Criterion | Evidence | Status |
|---|-----------|----------|--------|
| 1 | Browser matrix tested (9 browsers) | Evidence folder complete | [ ] |
| 2 | Shared device scenarios passed | 3/3 scenarios (library, home, abuser) | [ ] |
| 3 | Screen readers tested (4) | NVDA, VoiceOver×2, TalkBack | [ ] |
| 4 | Panic button verified | Clears storage, redirects safely | [ ] |
| 5 | Data retention verified pre/post panic | No residual data after panic | [ ] |
| 6 | DV advocate safety assessment | "Safe" or "Conditionally Safe" | [ ] |
| 7 | Remediation items resolved (if any) | All critical/high fixed | [ ] |

### Gate Rule: ALL 7 must pass. "Not Safe" assessment = automatic NO-GO.

---

## 6. Security Gate

| # | Criterion | Evidence | Status |
|---|-----------|----------|--------|
| 1 | JWT auth enforced on protected routes | 401 verification | [ ] |
| 2 | No test/mock modes enabled | Env audit: all `false` | [ ] |
| 3 | Rate limiting active | `DISABLE_RATE_LIMITING=false` | [ ] |
| 4 | Sensitive data blocking | `BLOCK_SENSITIVE_DATA=true` | [ ] |
| 5 | Consent required | `REQUIRE_CONSENT=true` | [ ] |
| 6 | Speech redaction enabled | `SPEECH_REDACTION_ENABLED=true` | [ ] |
| 7 | `.env` not in git | `.gitignore` includes `.env` | [ ] |
| 8 | No credentials in codebase | `grep` audit clean | [ ] |

### Gate Rule: ALL 8 must pass.

---

## 7. Risk Assessment Summary

### Residual Risks at GA Launch

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| 1 | Scoring thresholds don't match community needs | MEDIUM | LOW | Calibration session validates; version bump protocol ready |
| 2 | Unexpected load under production traffic | LOW | LOW | Rate limiting; horizontal scaling documented |
| 3 | DV safety issue not caught in testing | HIGH | VERY LOW | 6-phase DV testing; 9-browser matrix; advocate sign-off |
| 4 | Database migration side effects | LOW | VERY LOW | Additive-only migration; rollback SQL documented |
| 5 | V1 interference | LOW | VERY LOW | V1 untouched; isolated routes; V1 tests unchanged |
| 6 | Feature flag misconfiguration | MEDIUM | LOW | Verified via health endpoint; documented in runbook |

### Risk Acceptance

- Risks 1–6 are all mitigated with documented procedures
- No HIGH-likelihood risks remain
- Residual risk is acceptable for GA launch with monitoring plan

---

## 8. Rollback Confirmation

### Emergency Disable (< 30 seconds)

```bash
# In production .env:
ENABLE_V2_INTAKE=false

# Restart server (or trigger restart via deployment tool)
# V2 routes immediately return 404
# V1 is completely unaffected
```

### Full Rollback (5–15 minutes)

1. Set `ENABLE_V2_INTAKE=false`
2. Restart server
3. (Optional) Rollback migration:
   ```sql
   -- Documented in V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md §9
   DROP TABLE IF EXISTS "v2_intake_sessions" CASCADE;
   DELETE FROM "_prisma_migrations" WHERE migration_name = '20260218_v2_intake_tables';
   ```
4. Verify V1 unaffected: `GET /health/live` → 200

### Rollback Decision Authority

| Scenario | Who Can Trigger | Approval Needed |
|----------|----------------|-----------------|
| Critical safety issue | Anyone | No — immediate disable |
| Production error spike | Engineering Lead | No — immediate disable |
| Stakeholder concern | Program Manager | Engineering acknowledgment |
| Scheduled maintenance | Engineering Lead | 24-hour notice |

---

## 9. 72-Hour Post-Launch Monitoring Plan

### Hour 0–4: Active Monitoring

| Check | Frequency | Owner | Action if Failed |
|-------|-----------|-------|-----------------|
| `/health/live` | Every 5 min | Engineering | Investigate immediately |
| `/api/v2/intake/health` | Every 5 min | Engineering | Check DB connection |
| Error logs | Continuous | Engineering | Triage by severity |
| New session creation | First user test | Engineering | Verify E2E flow |
| V1 health | Every 15 min | Engineering | Confirm no regression |

### Hour 4–24: Reduced Cadence

| Check | Frequency | Owner |
|-------|-----------|-------|
| Health endpoints | Every 15 min | Automated monitoring |
| Error log review | Every 2 hours | Engineering |
| Session count | Every 4 hours | Engineering |
| V1 health | Every 30 min | Automated monitoring |

### Hour 24–72: Standard Cadence

| Check | Frequency | Owner |
|-------|-----------|-------|
| Health endpoints | Every 30 min | Automated monitoring |
| Error log review | Daily | Engineering |
| Session count + scoring distribution | Daily | Engineering + Clinical |
| Fairness analysis | Daily | Data Analyst |

### Escalation Triggers (72-hour window)

| Trigger | Action | Escalation |
|---------|--------|------------|
| V2 health endpoint unhealthy | Investigate → fix or disable | Engineering Lead |
| 3+ consecutive health check failures | Emergency disable | Engineering Lead + PM |
| Any session produces unexpected score | Suspend new sessions, investigate | Clinical Director |
| DV safety concern reported | Immediate disable + review | DV Advocate + PM |
| V1 regression detected | Disable V2, investigate | Engineering Lead |

---

## 10. 14-Day Observation Plan

### Week 1 (Days 1–7)

| Day | Activity | Owner | Deliverable |
|-----|----------|-------|-------------|
| 1 | Launch + 72-hour monitoring begins | Engineering | Monitoring log |
| 2 | First real session review (if any) | Clinical | Session review notes |
| 3 | 72-hour checkpoint meeting | All stakeholders | Status update |
| 4–5 | Continue monitoring; collect feedback | Engineering + Clinical | Feedback log |
| 6–7 | Weekly scoring distribution review | Data Analyst | Distribution report |

### Week 2 (Days 8–14)

| Day | Activity | Owner | Deliverable |
|-----|----------|-------|-------------|
| 8–10 | Fairness analysis review | Data Analyst + Clinical | Fairness report |
| 11–12 | User feedback synthesis | Program Manager | Feedback summary |
| 13 | 14-day review meeting | All stakeholders | Review document |
| 14 | Observation period close decision | Decision Authority | Close / extend |

### Observation Period Success Criteria

| # | Criterion | Threshold |
|---|-----------|-----------|
| 1 | Uptime | ≥ 99.5% (max 1 hour downtime) |
| 2 | Health check pass rate | ≥ 99% |
| 3 | Zero critical incidents | 0 unresolved critical |
| 4 | Zero DV safety concerns | 0 reported |
| 5 | Scoring consistency | No unexplained outliers |
| 6 | V1 unaffected | Zero V1 regressions |
| 7 | User feedback | No blocking issues reported |

---

## 11. Incident Escalation Tree

```
Incident Detected
    │
    ├─ Severity: CRITICAL (safety, data loss, V1 regression)
    │   ├─ Action: IMMEDIATE DISABLE (< 30 seconds)
    │   ├─ Notify: Engineering Lead → Clinical Director → Program Manager
    │   ├─ Timeline: Fix within 4 hours or escalate to full rollback
    │   └─ Post-incident: Root cause analysis within 24 hours
    │
    ├─ Severity: HIGH (scoring error, auth bypass, data integrity)
    │   ├─ Action: Suspend new sessions, investigate
    │   ├─ Notify: Engineering Lead → Program Manager
    │   ├─ Timeline: Fix within 24 hours
    │   └─ Post-incident: Review within 48 hours
    │
    ├─ Severity: MEDIUM (performance degradation, non-critical error)
    │   ├─ Action: Log, investigate, fix
    │   ├─ Notify: Engineering Lead
    │   ├─ Timeline: Fix within 3 business days
    │   └─ Post-incident: Include in weekly review
    │
    └─ Severity: LOW (cosmetic, enhancement request)
        ├─ Action: Log to backlog
        ├─ Notify: None required
        ├─ Timeline: Schedule for next sprint
        └─ Post-incident: N/A
```

### Emergency Contacts

| Role | Name | Contact | Backup |
|------|------|---------|--------|
| Engineering Lead | ________________ | ________________ | ________________ |
| Clinical Director | ________________ | ________________ | ________________ |
| Program Manager | ________________ | ________________ | ________________ |
| DV Advocate | ________________ | ________________ | ________________ |
| Data Privacy | ________________ | ________________ | ________________ |

---

## 12. Emergency Disable Procedure

**Time to disable: < 30 seconds**

### Step 1: Disable Feature Flag

```bash
# SSH into production server (or use deployment tool)
# Edit .env:
ENABLE_V2_INTAKE=false
```

### Step 2: Restart Server

```bash
# Method depends on deployment:
# PM2:     pm2 restart backend
# Docker:  docker restart care2-backend
# systemd: systemctl restart care2-backend
# Manual:  kill PID && npx tsx src/server.ts
```

### Step 3: Verify

```bash
# V2 should return 404:
curl -s http://localhost:3001/api/v2/intake/health
# Expected: 404 Not Found

# V1 should be unaffected:
curl -s http://localhost:3001/health/live
# Expected: 200, {"status":"alive"}
```

### Step 4: Notify

- Notify Engineering Lead (if not already aware)
- Notify Program Manager
- Log incident with timestamp and reason

---

## 13. GO / NO-GO Decision Template

### Pre-Decision Checklist

| Gate | Items | Required | Passing | Status |
|------|-------|----------|---------|--------|
| Blockers | 7 | 6 (item 7 optional) | [ ]/6 | [ ] |
| Infrastructure | 10 | 10 | [ ]/10 | [ ] |
| Governance | 8 | 8 | [ ]/8 | [ ] |
| Clinical | 5 | 5 | [ ]/5 | [ ] |
| DV Safety | 7 | 7 | [ ]/7 | [ ] |
| Security | 8 | 8 | [ ]/8 | [ ] |
| **TOTAL** | **45** | **44** | **[ ]/44** | |

### Decision

- [ ] **GO** — All 44 required criteria met. Proceed to General Availability.
- [ ] **CONDITIONAL GO** — All criteria met except [specify]. Proceed with
      documented conditions and monitoring plan.
- [ ] **NO-GO** — [specify failed criteria]. Address before re-evaluation.

### Decision Record

| Field | Value |
|-------|-------|
| Decision | ________________ |
| Decision Authority | ________________ |
| Date | ________________ |
| Conditions (if any) | ________________ |
| Next review date (if NO-GO) | ________________ |

---

*General Availability Gate — Phase 6B*
*Generated: 2026-02-19*
