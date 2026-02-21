# V2 Phase 9B.1 Session Report — 2026-02-20

## Summary

Phase 9B.1 "Migration Hygiene + RequestId Everywhere + Review Event + Test-Run Tagging + Rank Scalability" completed in one session. All 7 tasks delivered, production-verified on `api.care2connects.org` + `care2connects.org`.

**Branch**: `phase9b.1/migration-requestid-test-tagging`  
**Commit**: `c859208`  
**Parent**: `phase9b/harden-post-intake` @ `414b207`  
**PR URL**: https://github.com/richlegrande-dot/Care2Connect/pull/new/phase9b.1/migration-requestid-test-tagging

---

## Deliverables

### Task 1: Idempotent Prisma Migration

**File**: `backend/prisma/migrations/20260220_add_audit_events_istest_rank_index/migration.sql`

- `CREATE TABLE IF NOT EXISTS` for `v2_intake_sessions` and `v2_intake_audit_events`
- `CREATE TYPE ... EXCEPTION WHEN duplicate_object` for enums
- `ADD COLUMN "isTest" BOOLEAN NOT NULL DEFAULT false` (idempotent via `EXCEPTION WHEN duplicate_column`)
- FK constraint via `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object ... END $$`
- Composite rank index: `(status, isTest, stabilityLevel, totalScore, completedAt, id)`

**Evidence**: `prisma migrate status` → "11 migrations found — Database schema is up to date!"

### Task 2: RequestId Middleware

**File**: `backend/src/intake/v2/routes/intakeV2.ts` (lines 63-80)

- Router-level middleware reads `X-Request-Id` header or generates UUID
- Attached to `req.requestId`, echoed in response `X-Request-Id` header
- All `writeAuditEvent` calls now pass `req.requestId`
- MODULE_SAVED events now have requestId (previously null)

**Evidence**: Every test request returns unique `X-Request-Id` header:
- POST /session: `b1a6a8e7-cce8-4f5e-9543-d3292a18d952`
- PUT /session (consent): `74baef65-663c-46c5-b703-7d9208faafc8`
- POST /review-entered: `52db9d84-66ab-47e3-a3e9-9e78d730ea34`
- POST /complete: `a9f7de47-e06a-4c15-8673-3cbaf242b864`
- GET /profile: `1c4a56df-04f5-4799-afd0-fbcb51f5bdeb`

### Task 3: REVIEW_ENTERED Event

**Backend**: `POST /session/:id/review-entered` endpoint  
**Frontend**: `useEffect` fires best-effort POST when `state.status === 'review'`

**Evidence**: Audit trail shows `REVIEW_ENTERED` event:
- After last `MODULE_SAVED` ✓
- Before `INTAKE_SUBMITTED` ✓
- Contains safe meta: `{ stage, completedModuleCount, totalModuleCount, requestId }`

### Task 4: isTest Tagging + Rank Exclusion

- `isTest Boolean @default(false)` added to `V2IntakeSession` schema
- POST /session checks `X-C2C-Test-Run: 1` header → sets `isTest = true`
- Verification script sends `X-C2C-Test-Run: 1` on all requests
- Rank query excludes `isTest: true` sessions by default
- Override: `?includeTest=true` query param

**Evidence**: Session created with `isTest: true`, rank response includes `excludesTestSessions: true`, rank of 11 non-test sessions (excludes test sessions from count).

### Task 5: Count-Based Rank Scalability

Replaced `findMany` + `sort` + `findIndex` (loads ALL sessions) with `COUNT` query:

```
rank = 1 + COUNT(sessions WHERE
  stabilityLevel < L
  OR (stabilityLevel = L AND totalScore > S)
  OR (stabilityLevel = L AND totalScore = S AND completedAt < T)
  OR (stabilityLevel = L AND totalScore = S AND completedAt = T AND id < ID)
)
```

Uses composite index `v2_intake_sessions_rank_composite_idx` for O(index-scan) performance.

**Evidence**: Rank position=10, of=11 — identical to Phase 9B deterministic rank, but computed via COUNT instead of full table scan.

### Task 6: Sanitize Error Audit Messages

- `SESSION_COMPLETE_FAILED` events now store `"Validation failed"` or `"Internal error"` instead of raw `err.message`
- Missing-modules validation error also sanitized
- No stack traces ever stored
- `errorCode` field preserved unchanged

### Task 7: Dual-Domain Production Verification

**Script**: `scripts/test-post-intake-pipeline-9b1.ps1`

46+ assertions, all passing on production:

| Domain | Result |
|--------|--------|
| `api.care2connects.org` | ALL PASS (46 assertions) |
| `care2connects.org/onboarding/v2` | Page accessible (200) |
| `care2connects.org/api/v2/intake/health` | Proxied via Next.js rewrite |

---

## Files Changed

| File | Lines | Change |
|------|-------|--------|
| `backend/prisma/schema.prisma` | +8 | `isTest` field, composite index, isTest index |
| `backend/prisma/migrations/.../migration.sql` | +86 (new) | Idempotent migration |
| `backend/src/intake/v2/routes/intakeV2.ts` | +97/-28 | RequestId middleware, review-entered endpoint, isTest, count-based rank, error sanitization |
| `frontend/app/onboarding/v2/page.tsx` | +7 | REVIEW_ENTERED useEffect |
| `scripts/test-post-intake-pipeline-9b1.ps1` | +310 (new) | Phase 9B.1 dual-domain verification |

---

## Acceptance Criteria

- [x] Migration exists in repo; `prisma migrate deploy` succeeds on prod
- [x] All intake endpoints emit `X-Request-Id`; MODULE_SAVED has requestId
- [x] `REVIEW_ENTERED` event emitted and visible in `/audit`
- [x] Verification script uses `X-C2C-Test-Run: 1`, sessions tagged `isTest=true`
- [x] Rank excludes test sessions by default
- [x] Failure audits never store raw error strings
- [x] Evidence includes both `care2connects.org` and `api.care2connects.org` paths

## Non-Negotiables Verified

- [x] `computeScores.ts` unchanged (PolicyPack v1.0.0 frozen)
- [x] No PII/PHI in audit meta (9 sensitive patterns tested)
- [x] No scoring logic changes

## Production Test Output (api.care2connects.org)

```
Session ID:       cmlv1kfpj001dz83c5o24u5dq
isTest:           True
Total Score:      10 / 100
Stability Level:  3
Priority Tier:    MODERATE
Rank:             10 of 11 (excl test: True)
Audit Events:     11
Request IDs:      create=b1a6a8e7 | complete=a9f7de47
ALL ASSERTIONS PASSED
```
