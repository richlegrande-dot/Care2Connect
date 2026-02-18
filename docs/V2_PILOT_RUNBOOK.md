# V2 Intake — Pilot Deployment Runbook

> **Version**: 1.0
> **Date**: February 18, 2026
> **Phase**: 6 — Pilot Enablement
> **Branch**: `v2-intake-scaffold`
> **Status**: ✅ Pilot environment validated

---

## Purpose

This runbook documents the actual steps taken to enable the V2 Intake pilot,
including migration deployment, feature flag activation, live smoke test
results, and verification evidence. It serves as the auditable record of
the pilot launch.

---

## 1. Pre-Pilot Checklist

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Phase 5 artifacts committed | ✅ | Commits `7c72a33` + `4b22871` |
| 2 | CI gate job (`test-v2-intake`) in ci.yml | ✅ | `.github/workflows/ci.yml` — V2 Intake Gate job |
| 3 | Branch protection doc | ✅ | `docs/V2_BRANCH_PROTECTION_CONFIG.md` |
| 4 | Production deployment runbook | ✅ | `docs/V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` |
| 5 | Calibration session brief | ✅ | `docs/V2_CALIBRATION_SESSION_BRIEF.md` |
| 6 | DV execution plan | ✅ | `docs/V2_DV_EXECUTION_PLAN.md` |
| 7 | V2 tests passing (195/195) | ✅ | `npx jest tests/intake_v2/ --verbose --bail` |
| 8 | V1 gate tests baseline (27/28) | ✅ | 1 pre-existing `assemblyai-contract` failure |
| 9 | Node LTS alignment (v24) | ✅ | Commit `4b22871` |
| 10 | Clean working tree | ✅ | `git status -sb` shows no dirty files |

---

## 2. Database Migration

### Migration Applied

```
Migration: 20260218_v2_intake_tables
Database:  PostgreSQL at db.prisma.io:5432/postgres
DB_MODE:   remote
Status:    ✅ Applied successfully
```

### Command Output

```
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.prisma.io:5432"

10 migrations found in prisma/migrations

Applying migration `20260218_v2_intake_tables`

The following migration(s) have been applied:

migrations/
  └─ 20260218_v2_intake_tables/
    └─ migration.sql

All migrations have been successfully applied.
```

### Verification

```
npx prisma migrate status → All migrations applied, no pending
v2_intake_sessions table → Created and accessible
```

---

## 3. Feature Flag Activation

### Environment Variables (backend/.env)

| Variable | Before | After | Purpose |
|----------|--------|-------|---------|
| `ENABLE_V2_INTAKE` | `false` | **`true`** | Master kill switch — V2 routes active |
| `ENABLE_V2_INTAKE_AUTH` | `true` | `true` | JWT auth required (unchanged) |
| `V1_STABLE` | `true` | `true` | V1 protection (unchanged) |
| `ZERO_OPENAI_MODE` | `true` | `true` | No OpenAI calls (unchanged) |
| `AI_PROVIDER` | `rules` | `rules` | Deterministic scoring (unchanged) |
| `NODE_ENV` | `development` | `development` | Local pilot env |
| `DB_MODE` | `remote` | `remote` | Cloud PostgreSQL |

### Startup Log Verification

```
[V2 INTAKE ENABLED] POLICY_PACK=v1.0.0 ENGINE=v1.0.0
```

---

## 4. Pilot Smoke Test Results

### 4.1 Health Endpoints

| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| `/health/live` | GET | ✅ 200 | `{"status":"alive","uptime":...}` |
| `/ops/health` | GET | ✅ 200 | Backend ok, caddy/frontend not tested |
| `/api/v2/intake/health` | GET | ✅ 200 | `{"status":"healthy","database":"connected","policyPackVersion":"v1.0.0"}` |

### 4.2 Public Endpoints (No Auth)

| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| `/api/v2/intake/schema` | GET | ✅ 200 | 8 modules, all schemas valid |
| `/api/v2/intake/version` | GET | ✅ 200 | `policyPack=v1.0.0` |
| `/api/v2/intake/panic-button` | GET | ✅ 200 | Panic button config returned |

### 4.3 Auth Enforcement

| Test | Status | Evidence |
|------|--------|----------|
| POST /session without token | ✅ 401 | Auth middleware blocks |
| POST /session with valid JWT | ✅ 201 | Session created |

### 4.4 Full Session Lifecycle (E2E)

**Session ID**: `cmlsnvpbi0000z874k4q5qwi6`

| Step | Endpoint | Status | Detail |
|------|----------|--------|--------|
| Create session | POST /session | ✅ 201 | IN_PROGRESS, nextModule=consent |
| Submit consent | PUT /session/:id | ✅ 200 | completed=[consent] |
| Submit demographics | PUT /session/:id | ✅ 200 | completed=[consent,demographics] |
| Submit housing | PUT /session/:id | ✅ 200 | completed=[...housing] |
| Submit safety | PUT /session/:id | ✅ 200 | completed=[...safety] |
| Submit health | PUT /session/:id | ✅ 200 | completed=[...health] |
| Submit history | PUT /session/:id | ✅ 200 | completed=[...history] |
| Submit income | PUT /session/:id | ✅ 200 | completed=[...income] |
| Submit goals | PUT /session/:id | ✅ 200 | completed=[...goals] (8/8) |
| Complete + score | POST /session/:id/complete | ✅ 200 | Scored successfully |

### 4.5 Scoring Results (Pilot Session)

```json
{
  "totalScore": 13,
  "stabilityLevel": 3,
  "priorityTier": "MODERATE",
  "dimensions": {
    "housing_stability": 10,
    "safety_crisis": 0,
    "vulnerability_health": 0,
    "chronicity_system": 3
  }
}
```

**Explainability card**: Generated with 3 contributing factors:
- Current situation: staying with others (+5)
- At risk of losing current housing (+5)
- 2 episodes of homelessness (+3)

**Action plan**: 2 medium-term tasks generated:
- Rapid re-housing application
- Matched savings (IDA) program

### 4.6 Data Endpoints (Authenticated)

| Endpoint | Method | Status | Detail |
|----------|--------|--------|--------|
| GET /session/:id | GET | ✅ 200 | Full session data retrieved |
| GET /export/hmis/:id | GET | ✅ 200 | 5 HMIS fields exported |
| GET /calibration | GET | ✅ 200 | totalSessions=6 |
| GET /audit/fairness | GET | ✅ 200 | 3 fairness dimension reports |

### 4.7 V1 Non-Interference

| Check | Status | Evidence |
|-------|--------|----------|
| V1 /health/live responds | ✅ 200 | `{"status":"alive"}` |
| V1 gate tests unchanged | ✅ 27/28 | Same pre-existing failure |
| V2 tests still pass | ✅ 195/195 | 9 suites, 1.381s |

---

## 5. Summary

| Metric | Value |
|--------|-------|
| V2 Endpoints tested | 10/10 |
| All return expected status | ✅ |
| Full E2E session lifecycle | ✅ Completed + scored |
| Auth enforcement | ✅ Verified |
| Database connected | ✅ `db.prisma.io:5432/postgres` |
| Migration applied | ✅ `20260218_v2_intake_tables` |
| Feature flag active | ✅ `ENABLE_V2_INTAKE=true` |
| V1 unaffected | ✅ All V1 health endpoints respond |
| Scoring engine | ✅ Deterministic, rules-based, v1.0.0 |

---

## 6. Rollback Plan (If Needed)

### Quick Disable (< 30 seconds)

```bash
# In backend/.env:
ENABLE_V2_INTAKE=false

# Restart server
```

All V2 endpoints immediately return 404. V1 is unaffected.

### Full Rollback

See `docs/V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` Section 9.

---

*Pilot Deployment Runbook — V2 Intake Phase 6*
*Executed: 2026-02-18*
