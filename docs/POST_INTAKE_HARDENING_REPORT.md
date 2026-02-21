# Phase 9B: Post-Intake Pipeline Hardening Report

**Date:** 2026-02-20  
**Branch:** `phase9b/harden-post-intake`  
**Commit:** `a563bf0`  
**Production domain:** `https://care2connects.org` / `https://api.care2connects.org`

---

## Deliverable Summary

| # | Deliverable | Status |
|---|------------|--------|
| A1 | DB-backed audit logging (9 event types, meta allowlist) | PASS |
| A2 | Session profile endpoint with deterministic rank | PASS |
| A3 | Completion endpoint hardening (idempotency, atomicity, correlationId, error contract) | PASS |
| A4 | Production verification script | PASS |

---

## A1: Persisted Audit Logging

**Files created/modified:**
- `backend/prisma/schema.prisma` -- Added `V2IntakeAuditEvent` model
- `backend/src/intake/v2/audit/auditWriter.ts` -- Audit writer utility (~230 lines)

### V2IntakeAuditEvent Schema

| Column | Type | Notes |
|--------|------|-------|
| id | String (cuid) | Primary key |
| sessionId | String | FK to V2IntakeSession, indexed |
| eventType | String | Indexed, one of 9 types |
| requestId | String? | Correlates completion pipeline events |
| meta | Json | Sanitized via allowlist |
| createdAt | DateTime | Indexed, default now() |

### Event Types (9 total)

| Event | Trigger |
|-------|---------|
| `INTAKE_STARTED` | POST /session (create) |
| `MODULE_SAVED` | PUT /session/:id (save module) |
| `INTAKE_SUBMITTED` | POST /session/:id/complete (start) |
| `SCORE_COMPUTED` | After computeScores() in $transaction |
| `PLAN_GENERATED` | After generatePlan() in $transaction |
| `SESSION_COMPLETED` | Final session update in $transaction |
| `SESSION_COMPLETE_IDEMPOTENT_HIT` | Re-complete of already-completed session |
| `SESSION_COMPLETE_FAILED` | Completion failure (validation or internal) |
| `MODULE_VALIDATION_FAILED` | Module save validation error |

### Meta Allowlist (25 safe keys)

```
moduleId, isRequired, isComplete, completedModuleCount, totalModuleCount,
totalScore, stabilityLevel, priorityTier, policyPackVersion, inputHashPrefix,
housingScore, incomeScore, safetyScore, healthScore, supportScore,
highPriorityTasks, mediumPriorityTasks, lowPriorityTasks,
durationMs, errorCode, errorMessage, requestId, correlationId,
dvSafeMode, sensitiveDataRedacted
```

All non-allowlisted keys are stripped. Strings are truncated to 200 chars. No raw PII (names, DOB, race, gender, DV status) can appear in audit meta.

---

## A2: Session Profile + Rank Endpoint

**Endpoint:** `GET /api/v2/intake/session/:id/profile`

### Response Shape (completed session)

```json
{
  "sessionId": "cmluwg55p0027z8ak37fnall7",
  "status": "COMPLETED",
  "createdAt": "2026-02-20T13:02:05.000Z",
  "completedAt": "2026-02-20T13:02:09.000Z",
  "profile": {
    "totalScore": 10,
    "stabilityLevel": 3,
    "priorityTier": "MODERATE",
    "policyPackVersion": "v1.0.0"
  },
  "topFactors": [...],
  "rank": {
    "position": 9,
    "of": 11,
    "sortKey": "3|0010|2026-02-20T13:02:09.714Z"
  },
  "audit": {
    "count": 10,
    "lastEventType": "SESSION_COMPLETE_IDEMPOTENT_HIT"
  }
}
```

### Deterministic Ranking Algorithm

1. Query all COMPLETED sessions
2. Sort by: `stabilityLevel ASC, totalScore DESC, completedAt ASC, id ASC`
3. Position = 1-based index of target session in sorted list
4. Lower stability level = higher priority (closer to position 1)
5. Within same level: higher score = higher priority
6. Tie-breakers: earlier completion time, then lexicographic ID

---

## A3: Completion Endpoint Hardening

**Endpoint:** `POST /api/v2/intake/session/:id/complete`

### Features Added

| Feature | Implementation |
|---------|---------------|
| **Idempotency** | If session already COMPLETED, returns stored results with `idempotent: true` |
| **Atomicity** | Session update + 3 audit events written in single `$transaction` |
| **Correlation ID** | `generateRequestId()` at start, returned in `X-Request-Id` header and response body |
| **Stage pipeline** | INTAKE_SUBMITTED -> validate -> build -> score (timed) -> explain -> plan -> DV redact -> atomic commit |
| **Error contract** | `{ error: "COMPLETE_FAILED", code: "E_VALIDATE_REQUIRED_MODULES" \| "E_INTERNAL", requestId }` |
| **Best-effort audit on failure** | `SESSION_COMPLETE_FAILED` event written even when completion throws |

### Idempotent Response Example

```json
{
  "status": "COMPLETED",
  "idempotent": true,
  "requestId": "ca6f81fb-a785-4412-95b8-138f806cca99",
  "score": { "totalScore": 10, "stabilityLevel": 3, "priorityTier": "MODERATE" },
  "explainability": { ... },
  "actionPlan": { ... }
}
```

---

## A4: Production Verification

**Script:** `scripts/test-post-intake-pipeline.ps1`

### Test Steps (all passing on production)

| Step | Description | Assertions |
|------|-------------|------------|
| 1 | Create session | 201 status, valid CUID |
| 2 | Submit required modules (consent, demographics, housing, safety) | 4x 200 status |
| 3 | Complete intake | 200 status, COMPLETED, requestId, score 0-100, level 0-5, tier present, explainability, action plan |
| 4 | Idempotent re-complete | 200, `idempotent: true`, score unchanged |
| 5 | Fetch profile + rank | Session ID match, score/level/tier match, rank.position >= 1, topFactors present, audit stats |
| 6 | Fetch audit events | >= 5 events, all 7 required event types present, requestId on >= 3 events, zero sensitive data in meta |

### Production Evidence

```
Target: https://api.care2connects.org
Session ID:       cmluwg55p0027z8ak37fnall7
Total Score:      10 / 100
Stability Level:  3
Priority Tier:    MODERATE
Rank:             9 of 11
Audit Events:     10
Request ID:       ca6f81fb-a785-4412-95b8-138f806cca99

ALL ASSERTIONS PASSED
Completed: 2026-02-20 08:02:16
```

### Acceptance Criteria Checklist

- [x] Completion returns score + plan + explainability
- [x] Completion is idempotent
- [x] Profile returns deterministic rank
- [x] Audit events are DB-backed with all required types
- [x] requestId present and propagated across completion pipeline
- [x] No sensitive data (PII, DV, health) in audit meta
- [x] Rate-limit safe (500ms throttle between requests, 429 backoff)
- [x] No scoring logic/threshold/policy pack changes (v1.0.0 frozen)

---

## Frontend Changes

- `frontend/app/onboarding/v2/page.tsx` -- Fetches profile after completion (non-blocking), passes rank to results
- `frontend/app/onboarding/v2/components/WizardResults.tsx` -- Shows session ID (monospace) and rank badge ("Priority Rank: X of Y" in blue pill)

---

## Files Changed (7 files, +2099 -33)

| File | Action |
|------|--------|
| `backend/prisma/schema.prisma` | Modified (added V2IntakeAuditEvent model) |
| `backend/src/intake/v2/audit/auditWriter.ts` | **Created** (audit writer utility) |
| `backend/src/intake/v2/routes/intakeV2.ts` | Modified (hardened completion, profile+audit endpoints) |
| `frontend/app/onboarding/v2/page.tsx` | Modified (profile fetch, rank pass-through) |
| `frontend/app/onboarding/v2/components/WizardResults.tsx` | Modified (session ID + rank display) |
| `scripts/test-post-intake-pipeline.ps1` | **Created** (E2E verification script) |
| `docs/V2_PHASE9_SESSION_REPORT_2026-02-20.md` | **Created** (Phase 9 navigator report) |

---

## Non-Negotiables Verified

1. **Production domain evidence**: All tests run against `https://api.care2connects.org`
2. **No scoring changes**: PolicyPack v1.0.0 frozen, zero changes to computeScores/buildExplanation/generatePlan
3. **No raw PII in logs**: Meta allowlist enforced, 9 sensitive patterns verified absent from audit data
4. **Wizard UX preserved**: No step flow, validation, or UI behavior changes (only additive rank badge)
