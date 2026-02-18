# V2 Intake — Phase 5 Status Report

> **Date**: February 18, 2026
> **Phase**: 5 — Governance + Production Readiness
> **Branch**: `v2-intake-scaffold`
> **Previous HEAD**: `cc95deb` (Phase 4 Status Report)
> **Phase 5 Commit**: `7c72a33` (deliverables) + `0331fc8` (Node LTS alignment)

---

## Phase 5 Scope

Phase 5 was strictly governance and production readiness — no scoring changes,
no UI changes, no V1 changes, no feature expansion, no new endpoints, no AI calls.

### Objectives (from Navigator Driver Prompt)

| # | Objective | Status |
|---|-----------|--------|
| 1 | CI Gate Implementation | ✅ Complete |
| 2 | Branch Protection Configuration | ✅ Complete |
| 3 | Production Deployment Runbook | ✅ Complete |
| 4 | Clinical Scoring Calibration Session Brief | ✅ Complete |
| 5 | DV Advocate Testing Execution Plan | ✅ Complete |

---

## Deliverable Details

### 1. CI Gate Implementation

**File modified**: `.github/workflows/ci.yml` (+36 lines)

Added `test-v2-intake` job that:
- Runs `npx jest tests/intake_v2/ --verbose --bail` (195 tests)
- Runs on `ubuntu-latest` with Node.js 24 (Active LTS)
- No database required (all pure unit tests)
- Runs in **parallel** with `test-backend` (no `needs` dependency)
- Sets `ZERO_OPENAI_MODE=true` and `NODE_ENV=test`
- Includes gate summary step (always runs)

**Integration points**:
- `build-test` job: `needs` array updated to include `test-v2-intake`
- `notify-slack` job: `needs` array updated to include `test-v2-intake`

**CI Gate Plan doc** (`docs/V2_CI_GATE_PLAN.md`): Status updated from "Plan" to "✅ Implemented".

### 2. Branch Protection Configuration

**New file**: `docs/V2_BRANCH_PROTECTION_CONFIG.md` (~200 lines)

Contents:
- Required status checks for `main`, `develop`, and `v2-intake-scaffold` branches
- Pull request requirements (approvals, stale dismissal)
- Push restrictions (no direct push, no force push)
- Recommended CODEOWNERS file (V2, V1, scoring, CI, Prisma paths)
- Step-by-step GitHub UI configuration instructions
- Verification steps
- Emergency override procedure

### 3. Production Deployment Runbook

**New file**: `docs/V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` (~340 lines)

Contents:
- Pre-flight checklist (10 items)
- Environment variable configuration (with verification commands)
- Database migration procedure (with rollback SQL)
- Kill-switch deployment (deploy DISABLED first)
- Post-deployment verification (7 checks, 15-minute wait)
- Kill-switch enable procedure (with startup log verification)
- Auth enforcement verification
- Production smoke test (manual + automated)
- Monitoring checklist (first 24 hours, first week)
- Rollback procedure (quick disable, full rollback, DB rollback)
- Emergency disable (< 30 seconds)
- Post-deployment observation period (2-week schedule)
- Appendix: env var reference, key endpoints

### 4. Calibration Session Scheduling Brief

**New file**: `docs/V2_CALIBRATION_SESSION_BRIEF.md` (~300 lines)

Contents:
- Session objectives (7 items)
- Required stakeholders with quorum rule (3/4 + Clinical Director)
- Pre-session materials checklist (8 items with prep commands)
- 5 edge-case persona cards (Maria DV, James stable, Robert veteran, youth, moderate)
- 90-minute session agenda structure
- Post-session action items (10 steps if changes, 3 if no changes)
- Version bump protocol summary
- Scheduling recommendations
- References: Scoring Calibration Protocol, Policy Governance docs

### 5. DV Advocate Testing Execution Plan

**New file**: `docs/V2_DV_EXECUTION_PLAN.md` (~400 lines)

Contents:
- 6-phase testing timeline (Prep → Browser → Shared Device → Screen Reader → Review → Remediation)
- Required personnel (7 roles with qualifications)
- Device & software inventory (5 devices, 4 software tools)
- Browser matrix testing procedure (16 items per browser × 9 browsers)
- Shared device simulation (Library, Home, Abuser scenarios)
- Screen reader validation (NVDA, VoiceOver, TalkBack — 8 items each)
- Data retention verification (before panic, after panic, after completion)
- Evidence capture structure with file naming convention
- Sign-off process (4 steps, 4.5-hour advocate review)
- Known risks & mitigations (6 identified)
- Scheduling recommendations (9–12 business days)
- References: DV-Safe Testing Protocol

---

## Test Verification

### V2 Intake Tests

```
Test Suites: 9 passed, 9 total
Tests:       195 passed, 195 total
Time:        1.421 s
```

### V1 Gate Tests

```
Test Suites: 1 failed, 4 passed, 5 total
Tests:       1 failed, 27 passed, 28 total
```

The 1 failure is the pre-existing `assemblyai-contract.gate.test.ts:383` (`confidence.name`
expected 0, received 0.5) — unchanged from Phase 4 baseline.

---

## Files Changed

### Modified (3)

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | +36 lines: `test-v2-intake` job, updated `build-test` and `notify-slack` needs; Node 18→24 LTS |
| `docs/V2_CI_GATE_PLAN.md` | Status updated to "✅ Implemented" |

### New (4)

| File | Lines | Purpose |
|------|-------|---------|
| `docs/V2_BRANCH_PROTECTION_CONFIG.md` | ~200 | Branch protection setup guide |
| `docs/V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` | ~340 | Production deployment procedure |
| `docs/V2_CALIBRATION_SESSION_BRIEF.md` | ~300 | Calibration session scheduling |
| `docs/V2_DV_EXECUTION_PLAN.md` | ~400 | DV advocate testing execution |

### NOT Modified (Guardrails Verification)

| File/Area | Status |
|-----------|--------|
| `backend/src/intake/v2/scoring/` | ✅ No changes |
| `backend/src/intake/v2/policy/` | ✅ No changes |
| `backend/src/intake/v2/routes/intakeV2.ts` | ✅ No changes |
| `backend/src/intake/v2/middleware/v2Auth.ts` | ✅ No changes |
| `backend/src/server.ts` | ✅ No changes |
| `backend/prisma/schema.prisma` | ✅ No changes |
| `backend/src/services/transcript*` | ✅ No changes (V1 parser) |
| Frontend files | ✅ No changes |

---

## Guardrails Compliance

| Guardrail | Status | Evidence |
|-----------|--------|----------|
| No scoring constant changes | ✅ | Zero V2 scoring files modified |
| No `computeScores` logic changes | ✅ | File unmodified |
| No waterfall rule changes | ✅ | File unmodified |
| No override floor changes | ✅ | File unmodified |
| No explainability changes | ✅ | File unmodified |
| No frontend / UI changes | ✅ | Zero frontend files modified |
| No V1 parser changes | ✅ | Zero V1 service files modified |
| No AI calls added | ✅ | No OpenAI references added |
| No new endpoints | ✅ | `intakeV2.ts` unmodified |
| No migration behavior changes | ✅ | `schema.prisma` unmodified |
| No auth guard changes | ✅ | `v2Auth.ts` unmodified |
| CI does not interfere with V1 | ✅ | V1 gate: 27/28 (same baseline) |
| No smoke regression | ✅ | V2 tests: 195/195 |

---

## Cumulative Project Status

| Phase | Status | Tests | Commit |
|-------|--------|-------|--------|
| Phase 1: V2 Intake Scaffold | ✅ Complete | 97/97 | `d1fb746` |
| Phase 2: P0-P2 Hardening | ✅ Complete | 167/167 | `ac779e9` |
| Phase 3: Staging + Calibration | ✅ Complete | 195/195 | `37a1337` |
| Phase 4: Staging Execution | ✅ Complete | 195/195 + 57/57 smoke | `46cfea7` |
| **Phase 5: Governance + Readiness** | **✅ Complete** | **195/195 + 27/28 V1** | `7c72a33` + `0331fc8` |

---

## Recommended Next Steps (for Navigator)

1. **Push branch to remote** and verify CI pipeline runs with new `V2 Intake Gate` job
2. **Apply branch protection rules** per `V2_BRANCH_PROTECTION_CONFIG.md`
3. **Schedule calibration session** per `V2_CALIBRATION_SESSION_BRIEF.md`
4. **Schedule DV testing** per `V2_DV_EXECUTION_PLAN.md`
5. **Execute production deployment** per `V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` (after #3 and #4)

---

*Phase 5 Status Report — V2 Intake*
*Authored: 2026-02-18*
*Branch: `v2-intake-scaffold` | HEAD: 0331fc8*

---

## Navigator Review Corrections (applied)

| Correction | Action Taken | Commit |
|------------|-------------|--------|
| Node.js 18 EOL in CI | Updated `NODE_VERSION` from `'18'` to `'24'` (Active LTS) | `0331fc8` |
| `incidents.json` auto-generated change | Reverted via `git checkout --`; not included in any Phase 5 commit | N/A (working tree) |
| Missing commit hash in status report | Added `7c72a33` + `0331fc8` to report header and cumulative table | `0331fc8` (this update) |
