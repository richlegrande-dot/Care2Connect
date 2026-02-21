# V2 Intake — Pilot Review & Stakeholder Sign-Off

> **Version**: 1.0
> **Date**: 2026-02-18
> **Phase**: 6 — Pilot Enablement
> **Branch**: `v2-intake-scaffold` @ `4b22871`
> **Prepared By**: Engineering (automated pilot deployment)

---

## Purpose

This document records stakeholder feedback and sign-off for the V2 Intake
pilot. Each stakeholder reviews this section and confirms their acceptance
or flags concerns before the pilot proceeds to general availability.

---

## 1. Pilot Environment Summary

| Item | Value |
|------|-------|
| Feature flag | `ENABLE_V2_INTAKE=true` |
| Database | PostgreSQL at `db.prisma.io:5432/postgres` |
| Migration | `20260218_v2_intake_tables` ✅ applied |
| Auth | JWT required (`ENABLE_V2_INTAKE_AUTH=true`) |
| Scoring engine | Deterministic, rules-based, v1.0.0 |
| V1 status | Unaffected — all V1 endpoints operational |
| Rollback time | < 30 seconds (set flag to `false`, restart) |

---

## 2. Evidence Pack Cross-Reference

| Artifact | Location | Status |
|----------|----------|--------|
| Pilot Runbook (full smoke test results) | `docs/V2_PILOT_RUNBOOK.md` | ✅ Complete |
| Pilot Deploy Log | `logs/pilot_deploy.log` | ✅ Complete |
| Calibration Session Brief | `docs/V2_CALIBRATION_SESSION_BRIEF.md` | ✅ Published (Phase 5) |
| DV Advocate Execution Plan | `docs/V2_DV_EXECUTION_PLAN.md` | ✅ Published (Phase 5) |
| Production Deployment Runbook | `docs/V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` | ✅ Published (Phase 5) |
| CI Gate Configuration | `docs/V2_CI_GATE_PLAN.md` | ✅ Published (Phase 5) |
| Branch Protection Config | `docs/V2_BRANCH_PROTECTION_CONFIG.md` | ✅ Published (Phase 5) |

---

## 3. Stakeholder Review Sections

### 3.1 Program Manager

**Review scope**: End-to-end workflow, scoring output reasonableness,
action plan relevance, rollback preparedness.

| Question | Response |
|----------|----------|
| E2E session lifecycle works? | ✅ Verified — 8 modules → scored → action plan |
| Score output reasonable? | Pilot: Level 3/MODERATE (13 pts) — consistent with test case |
| Action plan items relevant? | 2 medium-term tasks (re-housing, savings program) |
| Rollback plan acceptable? | Feature flag disable < 30s, V1 unaffected |
| **Sign-off** | [ ] Approved  /  [ ] Concerns (see notes below) |
| **Date** | ________________ |
| **Notes** | |

---

### 3.2 DV Advocate / Subject Matter Expert

**Review scope**: Safety module design, consent flow, panic button
availability, sensitivity of language, trauma-informed approach.

| Question | Response |
|----------|----------|
| Consent module adequate? | Schema reviewed: explicit consent required first |
| Safety module language appropriate? | See `docs/V2_DV_EXECUTION_PLAN.md` for details |
| Panic button accessible? | ✅ `/panic-button` endpoint returns config |
| DV evaluation session scheduled? | [ ] Yes (date: __________)  /  [ ] Not yet |
| **Sign-off** | [ ] Approved  /  [ ] Concerns (see notes below) |
| **Date** | ________________ |
| **Notes** | |

---

### 3.3 Technical Lead / Engineering Manager

**Review scope**: Code quality, test coverage, infrastructure readiness,
CI/CD pipeline, security posture.

| Question | Response |
|----------|----------|
| V2 test suite passing? | ✅ 195/195 tests, 9 suites |
| CI gate job in pipeline? | ✅ `test-v2-intake` job in `.github/workflows/ci.yml` |
| Auth enforcement verified? | ✅ 401 without token, 201 with valid JWT |
| DB migration reversible? | See runbook Section 9 for rollback SQL |
| No scoring logic changes? | ✅ Policy pack v1.0.0, no modifications |
| **Sign-off** | [ ] Approved  /  [ ] Concerns (see notes below) |
| **Date** | ________________ |
| **Notes** | |

---

### 3.4 Data Privacy / Compliance Officer

**Review scope**: Data handling, consent management, HMIS export format,
audit trail, fairness reporting.

| Question | Response |
|----------|----------|
| Consent collected before data? | ✅ Consent module required first in sequence |
| HMIS export format compliant? | ✅ 5-field export verified |
| Fairness audit available? | ✅ `/audit/fairness` returns 3 dimension reports |
| Audit trail maintained? | ✅ All sessions logged with timestamps |
| Live user data consent plan? | [ ] Approved  /  [ ] Needs additional controls |
| **Sign-off** | [ ] Approved  /  [ ] Concerns (see notes below) |
| **Date** | ________________ |
| **Notes** | |

---

## 4. Calibration Session Scheduling

Per `docs/V2_CALIBRATION_SESSION_BRIEF.md`:

| Item | Status |
|------|--------|
| Calibration session date | [ ] Scheduled: __________ / [ ] Not yet scheduled |
| Participants confirmed | [ ] Yes / [ ] Pending |
| Test cases prepared | ✅ 6 sessions in calibration dataset |
| Scoring review protocol | ✅ Documented in brief |

---

## 5. DV Evaluation Session Scheduling

Per `docs/V2_DV_EXECUTION_PLAN.md`:

| Item | Status |
|------|--------|
| DV evaluation date | [ ] Scheduled: __________ / [ ] Not yet scheduled |
| DV advocate identified | [ ] Yes / [ ] Pending |
| Safety scenarios prepared | ✅ Documented in execution plan |
| Feedback mechanism defined | ✅ Documented in execution plan |

---

## 6. Go / No-Go Decision

| Stakeholder | Decision | Date |
|-------------|----------|------|
| Program Manager | [ ] Go / [ ] No-Go | |
| DV Advocate / SME | [ ] Go / [ ] No-Go | |
| Technical Lead | [ ] Go / [ ] No-Go | |
| Data Privacy / Compliance | [ ] Go / [ ] No-Go | |

### Final Decision

- [ ] **GO** — Proceed to general availability
- [ ] **NO-GO** — Address concerns before proceeding (see Section 7)

**Decision Authority**: ________________
**Date**: ________________

---

## 7. Concerns & Action Items

| # | Concern | Raised By | Priority | Resolution | Status |
|---|---------|-----------|----------|------------|--------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

---

## 8. Post-Pilot Next Steps

Once all stakeholders approve:

1. **Schedule calibration session** with intake workers (2-hour block)
2. **Schedule DV evaluation** with advocate (1-hour block)
3. **Configure remote** and push branch for CI verification
4. **Apply branch protection** rules per `docs/V2_BRANCH_PROTECTION_CONFIG.md`
5. **Enable for pilot users** via access control list
6. **Monitor** using calibration dashboard (`/calibration` endpoint)
7. **Collect feedback** for 2-week pilot period
8. **Phase 7**: General availability decision based on pilot outcomes

---

*V2 Intake Pilot Review — Phase 6*
*Prepared: 2026-02-18*
