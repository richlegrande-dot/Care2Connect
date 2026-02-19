# V2 Intake — GA Approval Tracker

> **Date**: February 19, 2026
> **Phase**: 6B — Blocker Removal
> **Purpose**: Track stakeholder approvals required for General Availability
> **Reference**: `docs/V2_PILOT_REVIEW.md` (4 stakeholder sign-offs)

---

## Current Status: ⚠️ APPROVALS PENDING

No stakeholder approvals have been collected. This document provides
structured approval request templates and tracks the status of each
required sign-off.

---

## 1. Required Approvals

| # | Stakeholder | Domain | Can Approve Now | Status |
|---|-------------|--------|-----------------|--------|
| 1 | Program Manager (Ops) | Workflow, operational fit | ⚠️ After calibration | [ ] Not requested |
| 2 | DV Advocate / SME | Safety, trauma-informed design | ⚠️ After DV testing | [ ] Not requested |
| 3 | Technical Lead | Code quality, CI/CD, security | ✅ Yes — all evidence available | [ ] Not requested |
| 4 | Data Privacy / Compliance | Data handling, HMIS, audit trail | ✅ Yes — all evidence available | [ ] Not requested |

### Approval Dependencies

```
Technical Lead ──────► Can sign off NOW
Data Privacy ────────► Can sign off NOW
Program Manager ─────► Blocked by: Calibration session
DV Advocate ─────────► Blocked by: DV testing (9–12 days)
```

**Recommendation**: Request Technical Lead and Data Privacy approvals
immediately while waiting for calibration and DV testing to complete.

---

## 2. Risk Summary (For Stakeholder Review)

### What the V2 Intake System Does

The V2 Intake system is a **deterministic, rules-based** housing needs
assessment tool. It:
- Collects structured intake data across 8 modules (consent, demographics,
  housing, safety, health, history, income, goals)
- Computes a stability score across 4 dimensions using fixed rules
- Assigns a priority tier (CRITICAL / HIGH / MODERATE / LOW)
- Generates an explainability card showing score contributors
- Produces an action plan with recommended next steps
- Exports data in HMIS-compatible format

### What It Does NOT Do

- No AI/ML inference — purely deterministic rules
- No OpenAI API calls — `ZERO_OPENAI_MODE=true`
- No live user data collection during pilot — test data only
- No V1 system modification — V1 is completely isolated
- No frontend changes — API-only pilot

### Security Posture

| Control | Status |
|---------|--------|
| JWT authentication required | ✅ Enforced |
| Consent collected first | ✅ Module 1 of 8 |
| Sensitive data blocking | ✅ `BLOCK_SENSITIVE_DATA=true` |
| Speech redaction | ✅ `SPEECH_REDACTION_ENABLED=true` |
| Rate limiting | ✅ 100 req/15 min |
| Panic button (DV safety) | ✅ Clears all local storage |
| Rollback time | ✅ < 30 seconds (flag flip) |

### Test Coverage

| Suite | Result |
|-------|--------|
| V2 Intake (9 suites) | 195/195 pass |
| V1 Gate | 27/28 (1 pre-existing) |
| Pilot smoke tests | 10+ endpoints verified |
| E2E lifecycle | Create → 8 modules → score → export |

---

## 3. Rollback Plan Reference

In case of any issue post-GA:

| Action | Time | Method |
|--------|------|--------|
| Emergency disable | < 30 seconds | Set `ENABLE_V2_INTAKE=false`, restart |
| Full rollback | 5 minutes | See `V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` §9 |
| DB rollback | 15 minutes | Rollback SQL documented in runbook |

---

## 4. Environment Diff Summary

### Current Pilot Environment vs V1 Production

| Variable | V1 Production | V2 Pilot | Change |
|----------|--------------|----------|--------|
| `ENABLE_V2_INTAKE` | `false` | `true` | **Changed** |
| `ENABLE_V2_INTAKE_AUTH` | N/A | `true` | **Added** |
| `V1_STABLE` | `true` | `true` | No change |
| `ZERO_OPENAI_MODE` | `true` | `true` | No change |
| `AI_PROVIDER` | `rules` | `rules` | No change |
| `DB_MODE` | `remote` | `remote` | No change |
| `NODE_ENV` | `development` | `development` | No change |
| DB migration | 9 applied | 10 applied | **+1 migration** |

### Impact Assessment

- V1 endpoints: **Zero impact** — all V1 routes unchanged
- V2 endpoints: **New routes added** under `/api/v2/intake/*`
- Database: **Additive only** — new table `v2_intake_sessions`, no existing table modifications
- Memory/CPU: **Minimal** — V2 routes are I/O-bound, scoring is simple arithmetic

---

## 5. Structured Approval Request Template

### For Technical Lead

**Subject**: V2 Intake — Technical Approval Request for General Availability

---

Dear [Technical Lead],

The V2 Intake system has completed Phase 6 pilot deployment and is seeking
your technical sign-off for General Availability.

**Evidence available for your review**:

1. **Code Quality**: 195/195 tests across 9 suites (1.4s runtime)
2. **CI Pipeline**: `test-v2-intake` job configured in `.github/workflows/ci.yml`,
   runs in parallel with `test-backend`, blocks `build-test` and `notify-slack`
3. **Auth**: JWT authentication enforced on all protected endpoints (verified: 401 without token)
4. **Security**: All secrets set, test modes disabled, rate limiting active,
   sensitive data blocking enabled
5. **Database**: Migration `20260218_v2_intake_tables` applied, schema up to date
6. **Rollback**: Feature flag disable < 30 seconds, full rollback documented
7. **V1 Isolation**: Zero V1 files modified, V1 gate tests unchanged (27/28)

**Documents for review**:
- `docs/V2_PROD_ENV_VERIFICATION.md` — 45-item environment audit
- `docs/V2_GA_BRANCH_PROTECTION_VERIFIED.md` — CI and branch protection verification
- `docs/V2_PROD_HEALTH_VERIFICATION.md` — Production health check with timestamps
- `docs/V2_PILOT_RUNBOOK.md` — Full pilot deployment evidence

**Decision requested**: Approve / Approve with Conditions / Do Not Approve

Please record your decision in `docs/V2_PILOT_REVIEW.md` Section 3.3.

---

### For Data Privacy / Compliance Officer

**Subject**: V2 Intake — Data Privacy & Compliance Approval Request

---

Dear [Compliance Officer],

The V2 Intake system has completed pilot deployment and requires your
compliance review before General Availability.

**Data handling controls in place**:

1. **Consent**: Mandatory first module — data cannot be collected without consent
2. **HMIS Export**: 5-field compliant export verified (`GET /export/hmis/:id`)
3. **Fairness Audit**: 3-dimension fairness analysis available (`GET /audit/fairness`)
4. **Audit Trail**: All sessions logged with timestamps and user attribution
5. **Data Protection**: `BLOCK_SENSITIVE_DATA=true`, `REQUIRE_CONSENT=true`
6. **Speech Redaction**: Enabled for any audio data
7. **Retention**: 30-day retention policy configured
8. **Panic Button**: DV safety feature clears all local storage and redirects

**No live user data** has been used during the pilot. All sessions are
synthetic test data.

**Documents for review**:
- `docs/V2_PROD_ENV_VERIFICATION.md` — Data protection settings audit
- `docs/V2_DV_SAFE_TESTING_PROTOCOL.md` — DV safety protocol
- `docs/V2_PILOT_RUNBOOK.md` — Pilot evidence with HMIS export verification

**Decision requested**: Approve / Approve with Conditions / Do Not Approve

Please record your decision in `docs/V2_PILOT_REVIEW.md` Section 3.4.

---

### For Program Manager

**Subject**: V2 Intake — Operational Approval Request (post-Calibration)

*Note: Send after calibration session is complete.*

---

Dear [Program Manager],

The V2 Intake scoring calibration session has been completed on [DATE].
The scoring weights and override rules have been [confirmed / adjusted per
session outcomes].

**Review summary**:
1. **E2E Workflow**: Session lifecycle verified (create → 8 modules → score → plan)
2. **Scoring Output**: Level 3/MODERATE for test case (13 points, housing instability)
3. **Action Plans**: 2 medium-term tasks generated (re-housing, savings program)
4. **Calibration**: [X] sessions reviewed, [outcome]
5. **Rollback**: Feature flag disable < 30 seconds

**Decision requested**: Approve / Approve with Conditions / Do Not Approve

Please record your decision in `docs/V2_PILOT_REVIEW.md` Section 3.1.

---

### For DV Advocate

**Subject**: V2 Intake — DV Safety Approval Request (post-Testing)

*Note: Send after DV testing phases A–E are complete.*

---

Dear [DV Advocate],

Thank you for completing the DV safety evaluation of the V2 Intake system.

**Please confirm your assessment**:
1. Safety module language is trauma-informed: [ ] Yes / [ ] No
2. Panic button functions correctly: [ ] Yes / [ ] No
3. Shared device scenarios are safe: [ ] Yes / [ ] No
4. Screen reader does not leak sensitive information: [ ] Yes / [ ] No
5. Data is properly cleared after panic activation: [ ] Yes / [ ] No

**Decision requested**: Approve / Approve with Conditions / Do Not Approve

Please record your decision in `docs/V2_PILOT_REVIEW.md` Section 3.2.

---

## 6. Approval Status Tracker

| Date | Stakeholder | Action | Status |
|------|-------------|--------|--------|
| 2026-02-19 | All | Approval templates prepared | ✅ Ready |
| __________ | Technical Lead | Approval request sent | [ ] |
| __________ | Technical Lead | Decision received | [ ] |
| __________ | Data Privacy | Approval request sent | [ ] |
| __________ | Data Privacy | Decision received | [ ] |
| __________ | Program Manager | (After calibration) Request sent | [ ] |
| __________ | Program Manager | Decision received | [ ] |
| __________ | DV Advocate | (After DV testing) Request sent | [ ] |
| __________ | DV Advocate | Decision received | [ ] |
| __________ | **ALL** | **Go/No-Go decision** | [ ] |

---

*GA Approval Tracker — Phase 6B*
*Generated: 2026-02-19*
