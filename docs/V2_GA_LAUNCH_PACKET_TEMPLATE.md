# V2 Intake — GA Launch Packet Template

> **Date**: February 18, 2026
> **Phase**: 7 — GA Enablement
> **Purpose**: Final launch document to be completed when all sign-offs arrive
> **Status**: TEMPLATE — fill in when all 44 GA gate criteria pass
> **Prerequisite**: All sections of `V2_PHASE7_GA_GATE_CHECKLIST.md` = PASSED

---

## Table of Contents

1. [Launch Authorization](#1-launch-authorization)
2. [GO/NO-GO Summary](#2-gono-go-summary)
3. [Sign-Off Table](#3-sign-off-table)
4. [Calibration Outcome Summary](#4-calibration-outcome-summary)
5. [DV Safety Sign-Off Result](#5-dv-safety-sign-off-result)
6. [Infrastructure Verification](#6-infrastructure-verification)
7. [Rollback Plan](#7-rollback-plan)
8. [Monitoring Plan](#8-monitoring-plan)
9. [Launch Timeline](#9-launch-timeline)
10. [Post-Launch Contacts](#10-post-launch-contacts)
11. [Risk Acceptance](#11-risk-acceptance)
12. [Final Checklist](#12-final-checklist)

---

## 1. Launch Authorization

| Field | Value |
|-------|-------|
| System | V2 Intake — Housing Needs Assessment |
| Version | ________________ (e.g., v1.0.0 or calibration-bumped) |
| Environment | Production |
| Feature Flag | `ENABLE_V2_INTAKE=true` |
| Branch | `v2-intake-scaffold` merged to `main` |
| Launch Decision | [ ] GO / [ ] CONDITIONAL GO / [ ] NO-GO |
| Decision Date | ________________ |
| Decision Authority | ________________ |
| Launch Date | ________________ |
| Launch Time | ________________ |

### Authorization Statement

> I, ________________ (Decision Authority), authorize the transition of the
> V2 Intake system from **Pilot** to **General Availability** based on the
> evidence, sign-offs, and gate results documented in this packet.
>
> All 44 gate criteria have been verified as PASSED.
> The 14-day observation plan with escalation procedures is in effect.
> Emergency disable capability has been confirmed (< 30 seconds).
>
> Signed: ________________  Date: ________________

---

## 2. GO/NO-GO Summary

### Gate Results (from `V2_PHASE7_GA_GATE_CHECKLIST.md`)

| Gate | Criteria | Passed | Status |
|------|----------|--------|--------|
| Blockers Cleared | 6 required | ___/6 | [ ] GO |
| Infrastructure | 10 required | ___/10 | [ ] GO |
| Governance | 8 required | ___/8 | [ ] GO |
| Clinical | 5 required | ___/5 | [ ] GO |
| DV Safety | 7 required | ___/7 | [ ] GO |
| Security | 8 required | ___/8 | [ ] GO |
| **TOTAL** | **44** | **___/44** | [ ] **GO** |

### Conditions (if CONDITIONAL GO)

| # | Condition | Mitigation | Owner | Deadline |
|---|-----------|-----------|-------|----------|
| 1 | ________________ | ________________ | ________________ | ________________ |
| 2 | ________________ | ________________ | ________________ | ________________ |
| 3 | ________________ | ________________ | ________________ | ________________ |

### Failed Criteria (if NO-GO)

| # | Criterion | Gate | Issue | Remediation Plan | Re-Eval Date |
|---|-----------|------|-------|-----------------|-------------|
| 1 | ________________ | ________________ | ________________ | ________________ | ________________ |

---

## 3. Sign-Off Table

All 4 stakeholder sign-offs must be recorded before launch.

| # | Stakeholder | Role | Decision | Date | Conditions | Evidence |
|---|-------------|------|----------|------|------------|---------|
| 1 | ________________ | Program Manager | [ ] Approved | ________ | ________________ | `V2_PILOT_REVIEW.md` §3.1 |
| 2 | ________________ | DV Advocate | [ ] Approved | ________ | ________________ | `V2_PILOT_REVIEW.md` §3.2 |
| 3 | ________________ | Technical Lead | [ ] Approved | ________ | ________________ | `V2_PILOT_REVIEW.md` §3.3 |
| 4 | ________________ | Data Privacy | [ ] Approved | ________ | ________________ | `V2_PILOT_REVIEW.md` §3.4 |

### Sign-Off Verification

- [ ] All 4 sign-offs are "Approved" or "Approved with Conditions"
- [ ] All conditions (if any) are documented with mitigations above
- [ ] All sign-offs are recorded in `V2_PILOT_REVIEW.md`
- [ ] No "Do Not Approve" decisions exist

---

## 4. Calibration Outcome Summary

### Session Details

| Field | Value |
|-------|-------|
| Session Date | ________________ |
| Duration | ________________ |
| Attendees | ________________ |
| Quorum Met | [ ] Yes (3 of 4 core + Clinical Director) |
| Location | ________________ |

### Scoring Review Results

| Dimension | Current Weight | Clinician Agreement | Changes |
|-----------|---------------|-------------------|---------|
| Housing Stability | ________________ | [ ] Agreed | ________________ |
| Safety / Crisis | ________________ | [ ] Agreed | ________________ |
| Vulnerability / Health | ________________ | [ ] Agreed | ________________ |
| Chronicity / System Involvement | ________________ | [ ] Agreed | ________________ |

### Override Rules Validation

| Override Rule | Validated | Clinician Notes |
|---------------|-----------|----------------|
| Domestic Violence | [ ] Yes | ________________ |
| Human Trafficking | [ ] Yes | ________________ |
| Veteran Status | [ ] Yes | ________________ |
| Chronic Homelessness | [ ] Yes | ________________ |
| Minor (under 18) | [ ] Yes | ________________ |

### Persona Card Results

| Persona | Expected Priority | Actual Priority | Clinician Assessment |
|---------|------------------|----------------|---------------------|
| Maria (DV survivor) | HIGH | ________________ | [ ] Correct / [ ] Adjust |
| James (stable individual) | LOW | ________________ | [ ] Correct / [ ] Adjust |
| Robert (veteran) | HIGH | ________________ | [ ] Correct / [ ] Adjust |
| Youth (aging out) | HIGH | ________________ | [ ] Correct / [ ] Adjust |
| Moderate needs | MEDIUM | ________________ | [ ] Correct / [ ] Adjust |

### Calibration Decision

- [ ] **No changes** — Scoring confirmed at current version (v1.0.0)
- [ ] **Changes required** — Version bump to v___.___.___ initiated
  - Changes: ________________
  - Re-tested: [ ] Yes, all 195 tests pass
  - Re-reviewed: [ ] Yes, Clinical Director signed off on new version

### Clinical Director Sign-Off

> I confirm the V2 Intake scoring weights, override rules, and edge-case
> results are appropriate for our community's needs.
>
> Version: ________________
> Signed: ________________  Date: ________________

---

## 5. DV Safety Sign-Off Result

### Testing Summary

| Field | Value |
|-------|-------|
| DV Advocate Name | ________________ |
| Certification | ________________ |
| Testing Period | ________________ to ________________ |
| Total Testing Days | ________________ |
| Total Test Items | 144 (browser) + 3 (shared device) + 4 (screen reader) + forensic |

### Area Results

| Area | Items Tested | Passed | Failed | Assessment |
|------|-------------|--------|--------|-----------|
| Browser matrix (9 browsers) | 144 | _____ | _____ | [ ] Safe |
| Shared device (3 scenarios) | 3 | _____ | _____ | [ ] Safe |
| Screen readers (4 tools) | 4 | _____ | _____ | [ ] Safe |
| Panic button | 1 | _____ | _____ | [ ] Safe |
| Data retention (post-panic) | 1 | _____ | _____ | [ ] Safe |

### Remediation Items

| # | Issue | Severity | Fixed | Verified | Notes |
|---|-------|----------|-------|----------|-------|
| 1 | ________________ | [ ] Critical / [ ] High | [ ] Yes | [ ] Yes | ________________ |
| 2 | ________________ | [ ] Critical / [ ] High | [ ] Yes | [ ] Yes | ________________ |
| 3 | ________________ | [ ] Critical / [ ] High | [ ] Yes | [ ] Yes | ________________ |

### Overall DV Safety Assessment

- [ ] **Safe** — No safety concerns identified
- [ ] **Conditionally Safe** — Minor issues with mitigations documented
- [ ] **Not Safe** — AUTOMATIC NO-GO

### DV Advocate Sign-Off

> I certify that the V2 Intake system has been evaluated for safety in
> domestic violence contexts across [___] browsers, [___] shared device
> scenarios, and [___] screen readers.
>
> Assessment: ________________
> Recommendation: [ ] Approve / [ ] Approve with Conditions / [ ] Do Not Approve
>
> Signed: ________________  Date: ________________

---

## 6. Infrastructure Verification

### Launch-Day Checks (All 10 Required)

| # | Check | Command | Result | Pass |
|---|-------|---------|--------|------|
| 1 | Server alive | `curl /health/live` | ________________ | [ ] |
| 2 | V2 healthy | `curl /api/v2/intake/health` | ________________ | [ ] |
| 3 | DB connected | V2 health → database | ________________ | [ ] |
| 4 | Auth enforcing | POST without token | ________________ | [ ] |
| 5 | Migrations current | `prisma migrate status` | ________________ | [ ] |
| 6 | Feature flag on | V2 health → featureFlag | ________________ | [ ] |
| 7 | Policy version | V2 version → policyPack | ________________ | [ ] |
| 8 | No open incidents | Incident audit | ________________ | [ ] |
| 9 | Rate limiting on | Env check | ________________ | [ ] |
| 10 | Secrets set | Env audit | ________________ | [ ] |

### CI/CD Status

| Item | Status | Evidence |
|------|--------|---------|
| GitHub Actions run | ________________ | Run URL: ________________ |
| `test-v2-intake` job | ________________ | 195/195 tests |
| Branch protection | ________________ | Screenshot/API output |

---

## 7. Rollback Plan

### Emergency Disable (< 30 seconds)

```bash
# Step 1: Disable feature flag
# In production .env:
ENABLE_V2_INTAKE=false

# Step 2: Restart server
pm2 restart backend
# OR: docker restart care2-backend
# OR: systemctl restart care2-backend

# Step 3: Verify
curl http://localhost:3001/api/v2/intake/health
# Expected: 404 Not Found

curl http://localhost:3001/health/live
# Expected: 200, {"status":"alive"}
```

### Rollback Decision Authority

| Scenario | Who Can Trigger | Approval |
|----------|----------------|----------|
| DV safety concern | Anyone | None needed |
| Critical production error | Engineering Lead | None needed |
| Stakeholder concern | Program Manager | Engineering ack |
| Scheduled maintenance | Engineering Lead | 24hr notice |

### Rollback Verification Checklist

- [ ] V2 routes return 404
- [ ] V1 health returns 200
- [ ] V1 functionality unaffected
- [ ] Incident logged with timestamp and reason
- [ ] Stakeholders notified

### Pre-Launch Rollback Test

> Before launching, verify rollback works:
>
> 1. Set `ENABLE_V2_INTAKE=false` → restart → verify 404
> 2. Set `ENABLE_V2_INTAKE=true` → restart → verify 200
> 3. Record: "Rollback tested at [TIME] — confirmed working"
>
> Tested: [ ] Yes  Time: ________________  By: ________________

---

## 8. Monitoring Plan

### 72-Hour Active Monitoring

#### Phase 1: Hours 0–4 (Hypercare)

| Check | Frequency | Owner | Alert Threshold |
|-------|-----------|-------|----------------|
| `/health/live` | Every 5 min | Engineering | Any non-200 |
| `/api/v2/intake/health` | Every 5 min | Engineering | Any non-200 |
| Error logs | Continuous | Engineering | Any ERROR level |
| First session test | Hour 0 | Engineering | Any failure |
| V1 health | Every 15 min | Engineering | Any non-200 |

#### Phase 2: Hours 4–24

| Check | Frequency | Owner |
|-------|-----------|-------|
| Health endpoints | Every 15 min | Automated |
| Error log review | Every 2 hours | Engineering |
| Session count | Every 4 hours | Engineering |
| V1 health | Every 30 min | Automated |

#### Phase 3: Hours 24–72

| Check | Frequency | Owner |
|-------|-----------|-------|
| Health endpoints | Every 30 min | Automated |
| Error log review | Daily | Engineering |
| Session + scoring distribution | Daily | Engineering + Clinical |
| Fairness analysis | Daily | Data Analyst |

### 14-Day Observation Period

| Week | Activity | Owner | Deliverable |
|------|----------|-------|-------------|
| Day 1 | Launch + hypercare begins | Engineering | Monitoring log |
| Day 2 | First real session review | Clinical | Session notes |
| Day 3 | 72-hour checkpoint | All | Status update |
| Day 4-5 | Monitoring + feedback | Engineering | Feedback log |
| Day 6-7 | Weekly scoring review | Data Analyst | Distribution report |
| Day 8-10 | Fairness analysis | Data + Clinical | Fairness report |
| Day 11-12 | User feedback synthesis | Program Manager | Summary |
| Day 13 | 14-day review meeting | All | Review doc |
| Day 14 | Close/extend decision | Decision Authority | Decision record |

### Observation Success Criteria

| # | Criterion | Threshold | Measured |
|---|-----------|-----------|---------|
| 1 | Uptime | ≥ 99.5% | ________________ |
| 2 | Health check pass rate | ≥ 99% | ________________ |
| 3 | Critical incidents | 0 | ________________ |
| 4 | DV safety concerns | 0 | ________________ |
| 5 | Scoring consistency | No unexplained outliers | ________________ |
| 6 | V1 regressions | 0 | ________________ |
| 7 | Blocking user feedback | 0 | ________________ |

### Escalation Triggers

| Trigger | Immediate Action | Escalation Path |
|---------|-----------------|----------------|
| V2 health unhealthy | Investigate | Engineering Lead |
| 3+ consecutive failures | Emergency disable | Eng Lead + PM |
| Unexpected score | Suspend new sessions | Clinical Director |
| DV safety concern | Immediate disable | DV Advocate + PM |
| V1 regression | Disable V2 | Engineering Lead |

---

## 9. Launch Timeline

### T-Day Execution Plan

| Time | Step | Action | Owner | Verification |
|------|------|--------|-------|-------------|
| T-60m | Pre-flight | Run infra verification (§6) | Engineering | 10/10 pass |
| T-45m | Pre-flight | Run security verification (§6) | Engineering | 8/8 pass |
| T-30m | Pre-flight | Test rollback procedure (§7) | Engineering | Rollback works |
| T-15m | Pre-flight | Notify stakeholders: "Launching in 15 min" | Engineering | Emails sent |
| **T-0** | **LAUNCH** | **Confirm `ENABLE_V2_INTAKE=true` + restart** | **Engineering** | **V2 health = 200** |
| T+5m | Verify | First session creation test | Engineering | Session created |
| T+10m | Verify | Full E2E session lifecycle test | Engineering | Session → score → export |
| T+15m | Announce | Send "V2 Live" notification | Engineering | All stakeholders |
| T+30m | Monitor | First monitoring checkpoint | Engineering | All healthy |
| T+1h | Monitor | Second checkpoint | Engineering | All healthy |
| T+2h | Monitor | Third checkpoint — hypercare continues | Engineering | All healthy |
| T+4h | Transition | Hand off to automated monitoring | Engineering | Alerts configured |
| T+24h | Review | Daily review — Day 1 complete | Engineering | Log filed |
| T+72h | Checkpoint | 72-hour stakeholder update | All | Status update |
| T+14d | Close | Observation period review meeting | All | Decision record |

### Pre-Launch Notification Template

```
Subject: V2 Intake — Launching to General Availability in 15 Minutes

All,

The V2 Intake system will transition from Pilot to General Availability
at [TIME] today.

What this means:
- V2 Intake is now the active intake assessment system
- V1 remains fully functional and unaffected
- Feature flag kill-switch is available (< 30 sec disable)
- 72-hour hypercare monitoring is in effect
- 14-day observation period begins

Emergency contact: [Engineering Lead — phone/email]

If you observe any issues, contact Engineering immediately.

Thank you,
[Engineering Lead]
```

### Post-Launch "V2 Live" Notification Template

```
Subject: ✅ V2 Intake System — Now Live in Production

All,

The V2 Intake system is now LIVE in production as of [TIME].

Launch verification:
- [ ] Server healthy
- [ ] V2 routes active
- [ ] First session test passed
- [ ] V1 unaffected

Monitoring status: ACTIVE (72-hour hypercare)
Emergency contact: [Engineering Lead]

Next milestone: 72-hour checkpoint meeting on [DATE].

Thank you,
[Engineering Lead]
```

---

## 10. Post-Launch Contacts

| Role | Name | Phone | Email | Backup |
|------|------|-------|-------|--------|
| Engineering Lead | ________________ | ________________ | ________________ | ________________ |
| Clinical Director | ________________ | ________________ | ________________ | ________________ |
| Program Manager | ________________ | ________________ | ________________ | ________________ |
| DV Advocate | ________________ | ________________ | ________________ | ________________ |
| Data Privacy | ________________ | ________________ | ________________ | ________________ |
| Data Analyst | ________________ | ________________ | ________________ | ________________ |
| QA Lead | ________________ | ________________ | ________________ | ________________ |

---

## 11. Risk Acceptance

### Residual Risks at Launch

| # | Risk | Severity | Likelihood | Mitigation | Accepted By |
|---|------|----------|------------|-----------|-------------|
| 1 | Scoring thresholds mismatch | MEDIUM | LOW | Calibration validated | ________________ |
| 2 | Unexpected load | LOW | LOW | Rate limiting active | ________________ |
| 3 | Uncaught DV safety issue | HIGH | VERY LOW | 6-phase testing complete | ________________ |
| 4 | Migration side effects | LOW | VERY LOW | Additive-only, rollback ready | ________________ |
| 5 | V1 interference | LOW | VERY LOW | Isolated routes, V1 tests pass | ________________ |
| 6 | Feature flag misconfiguration | MEDIUM | LOW | Health endpoint verified | ________________ |

### Risk Acceptance Statement

> The residual risks listed above have been reviewed and accepted.
> All risks have documented mitigations and escalation procedures.
> No HIGH-likelihood risks remain. The risk profile is acceptable
> for General Availability launch.
>
> Accepted by: ________________  Date: ________________

---

## 12. Final Checklist

### Pre-Launch (Complete before T-0)

- [ ] All 44 GA gate criteria passed (`V2_PHASE7_GA_GATE_CHECKLIST.md`)
- [ ] All 4 stakeholder sign-offs collected (§3)
- [ ] Calibration outcome documented (§4)
- [ ] DV safety assessment documented (§5)
- [ ] Infrastructure verified on launch day (§6)
- [ ] Rollback tested and confirmed working (§7)
- [ ] Monitoring plan activated (§8)
- [ ] Pre-launch notification sent (§9)
- [ ] Emergency contacts populated (§10)
- [ ] Risk acceptance signed (§11)
- [ ] Branch merged to `main` (or merge plan confirmed)

### Launch (T-0)

- [ ] Feature flag confirmed `true`
- [ ] Server restarted (if needed)
- [ ] V2 health = 200
- [ ] First session test passed
- [ ] E2E lifecycle test passed
- [ ] "V2 Live" notification sent

### Post-Launch (T+0 to T+14d)

- [ ] 72-hour hypercare monitoring active
- [ ] Day 1 review completed
- [ ] Day 3 stakeholder checkpoint completed
- [ ] Week 1 scoring distribution reviewed
- [ ] Week 2 fairness analysis reviewed
- [ ] Day 14 observation close meeting held
- [ ] Decision: [ ] Close observation / [ ] Extend

---

*GA Launch Packet Template — Phase 7 Workstream C2*
*Complete this document when all sign-offs arrive*
*Generated: 2026-02-18*
