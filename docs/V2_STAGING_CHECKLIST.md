# V2 Intake — Staging Deployment Checklist

> **Version**: 1.1
> **Last Updated**: February 18, 2026
> **Branch**: `v2-intake-scaffold`
> **Policy Pack**: v1.0.0
> **Engine**: v1.0.0
> **Evidence Pack**: [V2_STAGING_RUN_EVIDENCE_2026-02-18.md](V2_STAGING_RUN_EVIDENCE_2026-02-18.md)

---

## Pre-Deployment Verification

Complete each item in order. Mark with ✅ when verified and initial + date.

---

### 1. Feature Flag Confirmation

| Check | Expected | Verified |
|-------|----------|----------|
| `.env` contains `ENABLE_V2_INTAKE` | Present | ☐ |
| `.env` value on staging | `true` | ☐ |
| `.env` value on production | `false` | ☐ |
| `.env` contains `ENABLE_V2_INTAKE_AUTH` | Present | ☐ |
| `.env` value on staging | `true` or `false` per plan | ☐ |

**Verification command**:
```bash
grep ENABLE_V2_INTAKE .env
# Expected: ENABLE_V2_INTAKE=true
```

---

### 2. Database Migration Verification

| Check | Expected | Verified |
|-------|----------|----------|
| `v2_intake_sessions` table exists | Yes | ☐ |
| Prisma schema includes `V2IntakeSession` model | Yes | ☐ |
| Can create a test session via API | 201 Created | ☐ |
| Can read a test session via API | 200 OK | ☐ |

**Verification commands**:
```bash
# Check table exists
npx prisma db pull --print | grep v2_intake_sessions

# Verify Prisma client is generated
npx prisma generate
```

---

### 3. Authentication Validation

| Check | Expected | Verified |
|-------|----------|----------|
| `ENABLE_V2_INTAKE_AUTH=true` | Auth enforced | ☐ |
| POST /session without token | 401 Unauthorized | ☐ |
| PUT /session/:id without token | 401 Unauthorized | ☐ |
| POST /session/:id/complete without token | 401 Unauthorized | ☐ |
| GET /session/:id without token | 401 Unauthorized | ☐ |
| All endpoints WITH valid token | 200/201 OK | ☐ |
| GET /schema (no auth required) | 200 OK | ☐ |
| GET /health (no auth required) | 200 OK | ☐ |

**Verification commands**:
```bash
# Without auth (should fail)
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://staging.example.com/api/v2/intake/session
# Expected: 401

# With auth (should succeed)
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -X POST https://staging.example.com/api/v2/intake/session
# Expected: 201
```

---

### 4. Health Endpoint Check

| Check | Expected | Verified |
|-------|----------|----------|
| GET /api/v2/intake/health | 200 OK | ✅ 2026-02-18 |
| Response includes `status: healthy` | Yes | ✅ 2026-02-18 |
| Response includes `database: connected` | Yes | ✅ 2026-02-18 |
| Response includes `policyPackVersion` | v1.0.0 | ✅ 2026-02-18 |
| Response includes `scoringEngineVersion` | v1.0.0 | ✅ 2026-02-18 |

**Verification command**:
```bash
curl -s https://staging.example.com/api/v2/intake/health | jq .
```

---

### 5. Version Endpoint Check

| Check | Expected | Verified |
|-------|----------|----------|
| GET /api/v2/intake/version | 200 OK | ✅ 2026-02-18 |
| `policyPackVersion` | v1.0.0 | ✅ 2026-02-18 |
| `scoringEngineVersion` | v1.0.0 | ✅ 2026-02-18 |
| `buildCommit` | Non-empty (if BUILD_COMMIT set) | ✅ "unknown" (not set) |
| `migrationVersion` | 20260218_v2_intake_tables | ✅ 2026-02-18 |
| `featureFlags.v2IntakeEnabled` | true | ✅ 2026-02-18 |

**Verification command**:
```bash
curl -s https://staging.example.com/api/v2/intake/version | jq .
```

---

### 6. HMIS CSV Export Test

| Check | Expected | Verified |
|-------|----------|----------|
| Create + complete a test session | 200 OK | ✅ 2026-02-18 |
| GET /export/hmis/:sessionId | 200 OK, JSON | ✅ 2026-02-18 |
| GET /export/hmis/:sessionId?format=csv | 200 OK, CSV | ✅ 2026-02-18 |
| CSV contains header row | PersonalID,FirstName,LastName,... | ✅ 2026-02-18 |
| CSV contains data row | Non-empty values | ✅ 2026-02-18 |
| DV-safe session: FirstName is null | Yes | ✅ 2026-02-18 |
| DV-safe session: LastName is null | Yes | ✅ 2026-02-18 |
| DV-safe session: LivingSituation is null | Yes | ✅ 2026-02-18 |
| GET /export/hmis (bulk) | 200 OK | ✅ 2026-02-18 |
| GET /export/hmis?since=2026-01-01 | Filtered results | ✅ 2026-02-18 |

**Verification commands**:
```bash
# Single session CSV
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://staging.example.com/api/v2/intake/export/hmis/$SESSION_ID?format=csv"

# Bulk export
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://staging.example.com/api/v2/intake/export/hmis?since=2026-01-01"
```

---

### 7. Fairness Endpoint Smoke Test

| Check | Expected | Verified |
|-------|----------|----------|
| GET /audit/fairness | 200 OK | ✅ 2026-02-18 |
| Response includes `totalSessions` | Number ≥ 0 | ✅ 2026-02-18 |
| Response includes `reports` object | Non-null | ✅ 2026-02-18 |
| GET /audit/fairness?dimension=gender | Single report | ✅ 2026-02-18 |
| GET /audit/fairness?dimension=race_ethnicity | Single report | ✅ 2026-02-18 |
| GET /audit/fairness?dimension=veteran_status | Single report | ✅ 2026-02-18 |

**Verification command**:
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://staging.example.com/api/v2/intake/audit/fairness" | jq .
```

---

### 8. Calibration Endpoint Check

| Check | Expected | Verified |
|-------|----------|----------|
| GET /calibration | 200 OK | ✅ 2026-02-18 |
| Response includes `totalSessions` | Number ≥ 0 | ✅ 2026-02-18 |
| Response includes `levelDistribution` | Object | ✅ 2026-02-18 |
| Response includes `tierDistribution` | Object | ✅ 2026-02-18 |
| Response includes `dimensionAverages` | 4 entries | ✅ 2026-02-18 |
| GET /calibration?format=csv | CSV download | ✅ 2026-02-18 |

---

### 9. Startup Log Verification

| Check | Expected | Verified |
|-------|----------|----------|
| Server log on startup | `[V2 INTAKE ENABLED] POLICY_PACK=v1.0.0 ENGINE=v1.0.0` | ✅ 2026-02-18 |
| Log message present in stdout | Yes | ✅ 2026-02-18 |
| If disabled, log shows | `[V2 Intake] DISABLED` | ☐ (not tested this run) |

---

### 10. Sample Persona Walkthroughs

Complete a full intake wizard walkthrough for each persona.

#### 10.1 Crisis Persona — Maria (DV Survivor)

| Step | Action | Expected | Verified |
|------|--------|----------|----------|
| 1 | Start session | 201 Created, sessionId returned | ✅ 2026-02-18 |
| 2 | Submit consent (dv_safe_mode: true) | 200 OK | ✅ 2026-02-18 |
| 3 | Submit demographics | 200 OK | ✅ 2026-02-18 |
| 4 | Submit housing (unsheltered) | 200 OK | ✅ 2026-02-18 |
| 5 | Submit safety (fleeing_dv: true) | 200 OK | ✅ 2026-02-18 |
| 6 | Submit all 8 modules | 200 OK | ✅ 2026-02-18 |
| 7 | Complete intake | Level 0, CRITICAL, Score 57 | ✅ 2026-02-18 |
| 8 | Action plan includes DV hotline | Yes | ✅ 2026-02-18 |
| 9 | Explainability card: DV redacted | Yes | ✅ 2026-02-18 |
| 10 | HMIS export: name nullified | Yes | ✅ 2026-02-18 |

#### 10.2 Stable Persona — James (Housed)

| Step | Action | Expected | Verified |
|------|--------|----------|----------|
| 1 | Start session | 201 Created | ✅ 2026-02-18 |
| 2 | Submit consent (dv_safe_mode: false) | 200 OK | ✅ 2026-02-18 |
| 3 | Submit demographics | 200 OK | ✅ 2026-02-18 |
| 4 | Submit housing (permanent_housing) | 200 OK | ✅ 2026-02-18 |
| 5 | Submit safety (all safe) | 200 OK | ✅ 2026-02-18 |
| 6 | Complete intake | Level 5, LOWER, Score 0 | ✅ 2026-02-18 |
| 7 | Minimal action plan | Yes (0 imm, 0 short, 1 med) | ✅ 2026-02-18 |

#### 10.3 Chronic Persona — Robert (Veteran)

| Step | Action | Expected | Verified |
|------|--------|----------|----------|
| 1 | Start session | 201 Created | ✅ 2026-02-18 |
| 2–5 | Submit required modules | 200 OK | ✅ 2026-02-18 |
| 6 | Submit history (chronic: true) | 200 OK | ✅ 2026-02-18 |
| 7 | Complete intake | Level 0, CRITICAL, Score 51 | ✅ 2026-02-18 |
| 8 | Action plan includes veteran services | Yes (st-veteran-services) | ✅ 2026-02-18 |
| 9 | Override / waterfall applied | Waterfall: housing≥20 + chronicity≥15 | ✅ 2026-02-18 |

---

### 11. V1 Non-Regression

| Check | Expected | Verified |
|-------|----------|----------|
| V1 intake endpoints still functioning | Yes | ✅ 2026-02-18 |
| V1 parser accuracy unchanged | 99.32% (586/590) | ☐ (not re-tested) |
| No V1 test failures | 0 failures | ✅ 27/28 pass (1 pre-existing) |

**Verification command**:
```bash
npm run test:gate
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineer (Phase 4 Staging) | Copilot | 2026-02-18 | ✅ All automated checks pass |
| QA Lead | | | |
| Product Owner | | | |

**Evidence**: See [V2_STAGING_RUN_EVIDENCE_2026-02-18.md](V2_STAGING_RUN_EVIDENCE_2026-02-18.md) for full evidence pack.
**CI Gate Plan**: See [V2_CI_GATE_PLAN.md](V2_CI_GATE_PLAN.md) for CI integration plan.

---

## Notes

- If any check fails, do NOT proceed. Document the failure and investigate.
- The feature flag can be set back to `false` at any time as a kill switch.
- All V2 endpoints return 404 when the flag is disabled.
- DV-safe mode testing should be done in coordination with P2#10 advocate review.

---

*End of V2 Staging Deployment Checklist*
