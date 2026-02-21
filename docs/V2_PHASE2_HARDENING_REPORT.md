# V2 Intake — Phase 2 Production Hardening Report

**Date**: 2026-02-18  
**Branch**: `v2-intake-scaffold`  
**Status**: ✅ All 4 P0 corrections + 4 Phase 2 tasks COMPLETE  
**Tests**: 58/58 passing (29 original + 29 new)

---

## P0 Architectural Corrections

### P0-1: Prisma Session Persistence ✅
**Problem**: In-memory `Map<string, IntakeSession>` lost all data on server restart.  
**Solution**:
- Added `V2IntakeSession` model to `backend/prisma/schema.prisma` with:
  - `V2IntakeStatus` enum (`IN_PROGRESS`, `COMPLETED`, `ABANDONED`)
  - `V2PriorityTier` enum (`CRITICAL`, `HIGH`, `MODERATE`, `LOWER`)
  - Full session state: modules (JSON), completedModules, scoreResult, explainabilityCard, actionPlan
  - DV-safe flag: `sensitiveDataRedacted`
  - Indexes on `userId`, `status`, `createdAt`
  - Table mapped to `v2_intake_sessions`
- Rewrote `backend/src/intake/v2/routes/intakeV2.ts`:
  - All 6 endpoints now use `prisma.v2IntakeSession.*` CRUD
  - Complete endpoint atomically stores scores + plan + explainability + status
  - Proper error handling with 500 responses and console.error logging
- Ran `npx prisma generate` — client types verified

**Migration needed**: Run `npx prisma db push` or create a migration to apply the new table.

### P0-2: Policy Pack Extraction ✅
**Problem**: All scoring point values, waterfall rules, override rules, and tier thresholds were hardcoded in `computeScores.ts`. Policy changes required engine rewrites.  
**Solution**:
- Created `backend/src/intake/v2/policy/` directory:
  - `policyPack.ts` (290 lines) — Complete PolicyPack interface + DEFAULT_POLICY_PACK v1.0.0
  - `index.ts` — Barrel exports for all types
- PolicyPack contains:
  - `pointMaps.housing` — situationPoints, durationPoints, homelessSituations, etc.
  - `pointMaps.safety` — fleeingDv, suicidalIdeation, feelsSafe map, etc.
  - `pointMaps.vulnerability` — chronicConditions, selfCare, age thresholds, etc.
  - `pointMaps.chronicity` — episodes, months, emergencyServices, etc.
  - `waterfallRules[]` — ordered, declarative, first-match-wins with AND/OR logic
  - `overrideRules[]` — field-check-based floor adjustments with optional age checks
  - `tierThresholds` — CRITICAL/HIGH/MODERATE/LOWER score boundaries
- Refactored `computeScores.ts` (530 lines):
  - `computeScores(data, pack?)` — accepts optional PolicyPack, defaults to DEFAULT_POLICY_PACK
  - All 4 dimension scorers read from `pack.pointMaps.*`
  - `determineLevel()` evaluates `pack.waterfallRules` generically
  - `applyOverrides()` evaluates `pack.overrideRules` generically
  - `determinePriorityTier()` uses `pack.tierThresholds`
  - Engine is now a generic evaluator that runs ANY valid PolicyPack

### P0-3: DV-Safe Mode Hardening ✅
**Problem**: Raw safety answers stored in DB, no logging protection, no panic button.  
**Solution**:
- Created `backend/src/intake/v2/dvSafe.ts` (95 lines):
  - `DV_SENSITIVE_SIGNALS` set — 5 safety fields
  - `redactSensitiveModules()` — replaces values with `[REDACTED]` before DB storage
  - `sanitizeForLogging()` — replaces values with `[LOG_REDACTED]` for server logs
  - `getPanicButtonUrl()` — configurable via `DV_PANIC_BUTTON_URL` env var (default: google.com)
  - `getPanicButtonConfig()` — returns URL + clear flags (IndexedDB, sessionStorage, localStorage)
- Routes integration:
  - Complete endpoint calls `redactSensitiveModules()` before persisting when dvSafeMode is active
  - `sensitiveDataRedacted` flag stored in DB record
  - New `GET /panic-button` endpoint returns panic button config
- Tests validate:
  - Redaction replaces all 5 sensitive fields
  - Non-sensitive fields preserved
  - Original object not mutated
  - Public default URL, configurable override

### P0-4: Waterfall Refactor ✅
**Problem**: `totalScore >= 50 → Level 3` and `totalScore >= 25 → Level 4` conflated triage (Tier) with housing stability (Level).  
**Solution**:
- Removed ALL totalScore-based waterfall rules from DEFAULT_POLICY_PACK
- Replaced with dimension-based rules:
  - Level 3: `housing_stability ≥ 10` OR `any_dimension ≥ 15`
  - Level 4: `housing_stability ≥ 5` OR `any_dimension ≥ 10`
- Total score now ONLY affects Priority Tier (via tierThresholds), never Level
- Test validates: no waterfall rule in pack references `'total'` as a dimension

---

## Phase 2 Hardening Tasks

### Phase 2B: Auth Middleware ✅
- Created `backend/src/intake/v2/middleware/v2Auth.ts` (120 lines):
  - `v2IntakeAuthMiddleware` — JWT Bearer token auth accepting `system-admin` and `intake-user` types
  - Staged rollout: gated by `ENABLE_V2_INTAKE_AUTH` env var (default: off)
  - Sets `req.v2User` with userId and type for downstream access control
  - `v2SessionOwnershipGuard` — prepares cross-session access prevention
- Wired into routes: auth applied to `POST /session*`, `PUT /session*`, `GET /session/:id`
- Schema and panic-button endpoints remain public

### Phase 2C: Score Audit Trail ✅
- Added `inputHash` to `ScoreResult` interface:
  - SHA-256 hash (16-char prefix) of input data using deterministic serialization
  - `stableStringify()` — recursive key-sorted JSON for consistent hashing
  - Same input always produces same hash
  - Different inputs produce different hashes
- `policyPackVersion` included in every ScoreResult
- Tests validate: hash presence, determinism, uniqueness

### Phase 2D: Feature Flag + Health Endpoint ✅
- Added `GET /health` endpoint returning:
  - `status`: healthy/degraded
  - `featureFlag`: ENABLE_V2_INTAKE state
  - `authEnabled`: ENABLE_V2_INTAKE_AUTH state
  - `database`: connected/unreachable (via `SELECT 1` probe)
  - `policyPackVersion`: current default pack version
  - `scoringEngineVersion`: engine code version
  - `timestamp`: ISO string
- Returns 200 when healthy, 503 when degraded
- Feature flag guard already existed from Phase 1 scaffold

---

## Files Changed/Created

### New Files (7)
| File | Lines | Purpose |
|------|-------|---------|
| `backend/src/intake/v2/policy/policyPack.ts` | 290 | PolicyPack interface + DEFAULT_POLICY_PACK |
| `backend/src/intake/v2/policy/index.ts` | 19 | Barrel exports |
| `backend/src/intake/v2/dvSafe.ts` | 95 | DV-safe utilities |
| `backend/src/intake/v2/middleware/v2Auth.ts` | 120 | JWT auth middleware |
| `backend/tests/intake_v2/policyPack.test.ts` | 290 | 29 new tests |

### Modified Files (5)
| File | Change |
|------|--------|
| `backend/src/intake/v2/scoring/computeScores.ts` | Policy-driven engine, inputHash, stableStringify |
| `backend/src/intake/v2/routes/intakeV2.ts` | Prisma CRUD, DV-safe, auth, health endpoint |
| `backend/src/intake/v2/constants.ts` | Updated docs, scoring constants → policy ref |
| `backend/src/intake/v2/explainability/buildExplanation.ts` | Uses ScoreResult.policyPackVersion |
| `backend/src/intake/v2/index.ts` | Added policy + dvSafe exports |
| `backend/prisma/schema.prisma` | Added V2IntakeSession model + enums |

---

## Test Results

```
Test Suites: 4 passed, 4 total
Tests:       58 passed, 58 total

  scoring.test.ts         — 12 tests (original, all pass with policy pack)
  explainability.test.ts  — 9 tests (original, pass with new ScoreResult shape)
  actionPlan.test.ts      — 8 tests (original, unchanged)
  policyPack.test.ts      — 29 tests (NEW — covers P0-2, P0-3, P0-4, 2C)
```

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ENABLE_V2_INTAKE` | `false` | Feature flag for V2 intake system |
| `ENABLE_V2_INTAKE_AUTH` | `false` | Enable JWT auth on session endpoints |
| `DV_PANIC_BUTTON_URL` | `https://www.google.com` | Neutral URL for DV panic button |
| `ADMIN_SESSION_SECRET` / `JWT_SECRET` | — | JWT signing secret (existing) |

---

## Remaining Work (Not in Scope)

1. **Database migration**: Run `npx prisma db push` or `npx prisma migrate dev` to create the `v2_intake_sessions` table
2. **Frontend panic button**: Implement the client-side quick-exit button using the `/panic-button` config
3. **Frontend wizard**: Connect to Prisma-backed endpoints
4. **Production enable**: Set `ENABLE_V2_INTAKE=true` only after full integration testing
5. **Coordinated Entry export**: Not yet implemented (separate phase)

---

## Guardrails Honored

- ✅ V1 parser untouched — zero modifications to V1 code
- ✅ No AI/LLM calls anywhere in V2 — all scoring is deterministic
- ✅ `ENABLE_V2_INTAKE` defaults to false — not production-enabled
- ✅ All changes on `v2-intake-scaffold` branch
- ✅ No Supabase auth dependencies — uses existing JWT pattern
