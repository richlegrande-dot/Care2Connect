# V2 Intake — Staging Deployment Checklist

> **Version**: 1.0
> **Last Updated**: February 18, 2026
> **Branch**: `v2-intake-scaffold`
> **Policy Pack**: v1.0.0
> **Engine**: v1.0.0

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
| GET /api/v2/intake/health | 200 OK | ☐ |
| Response includes `status: healthy` | Yes | ☐ |
| Response includes `database: connected` | Yes | ☐ |
| Response includes `policyPackVersion` | v1.0.0 | ☐ |
| Response includes `scoringEngineVersion` | v1.0.0 | ☐ |

**Verification command**:
```bash
curl -s https://staging.example.com/api/v2/intake/health | jq .
```

---

### 5. Version Endpoint Check

| Check | Expected | Verified |
|-------|----------|----------|
| GET /api/v2/intake/version | 200 OK | ☐ |
| `policyPackVersion` | v1.0.0 | ☐ |
| `scoringEngineVersion` | v1.0.0 | ☐ |
| `buildCommit` | Non-empty (if BUILD_COMMIT set) | ☐ |
| `migrationVersion` | 20260218_v2_intake_tables | ☐ |
| `featureFlags.v2IntakeEnabled` | true | ☐ |

**Verification command**:
```bash
curl -s https://staging.example.com/api/v2/intake/version | jq .
```

---

### 6. HMIS CSV Export Test

| Check | Expected | Verified |
|-------|----------|----------|
| Create + complete a test session | 200 OK | ☐ |
| GET /export/hmis/:sessionId | 200 OK, JSON | ☐ |
| GET /export/hmis/:sessionId?format=csv | 200 OK, CSV | ☐ |
| CSV contains header row | PersonalID,FirstName,LastName,... | ☐ |
| CSV contains data row | Non-empty values | ☐ |
| DV-safe session: FirstName is null | Yes | ☐ |
| DV-safe session: LastName is null | Yes | ☐ |
| DV-safe session: LivingSituation is null | Yes | ☐ |
| GET /export/hmis (bulk) | 200 OK | ☐ |
| GET /export/hmis?since=2026-01-01 | Filtered results | ☐ |

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
| GET /audit/fairness | 200 OK | ☐ |
| Response includes `totalSessions` | Number ≥ 0 | ☐ |
| Response includes `reports` object | Non-null | ☐ |
| GET /audit/fairness?dimension=gender | Single report | ☐ |
| GET /audit/fairness?dimension=race_ethnicity | Single report | ☐ |
| GET /audit/fairness?dimension=veteran_status | Single report | ☐ |

**Verification command**:
```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://staging.example.com/api/v2/intake/audit/fairness" | jq .
```

---

### 8. Calibration Endpoint Check

| Check | Expected | Verified |
|-------|----------|----------|
| GET /calibration | 200 OK | ☐ |
| Response includes `totalSessions` | Number ≥ 0 | ☐ |
| Response includes `levelDistribution` | Object | ☐ |
| Response includes `tierDistribution` | Object | ☐ |
| Response includes `dimensionAverages` | 4 entries | ☐ |
| GET /calibration?format=csv | CSV download | ☐ |

---

### 9. Startup Log Verification

| Check | Expected | Verified |
|-------|----------|----------|
| Server log on startup | `[V2 INTAKE ENABLED] POLICY_PACK=v1.0.0 ENGINE=v1.0.0` | ☐ |
| Log message present in stdout | Yes | ☐ |
| If disabled, log shows | `[V2 Intake] DISABLED` | ☐ |

---

### 10. Sample Persona Walkthroughs

Complete a full intake wizard walkthrough for each persona.

#### 10.1 Crisis Persona — Maria (DV Survivor)

| Step | Action | Expected | Verified |
|------|--------|----------|----------|
| 1 | Start session | 201 Created, sessionId returned | ☐ |
| 2 | Submit consent (dv_safe_mode: true) | 200 OK | ☐ |
| 3 | Submit demographics | 200 OK | ☐ |
| 4 | Submit housing (unsheltered) | 200 OK | ☐ |
| 5 | Submit safety (fleeing_dv: true) | 200 OK | ☐ |
| 6 | Skip optional modules | OK | ☐ |
| 7 | Complete intake | Level 0, CRITICAL | ☐ |
| 8 | Action plan includes DV hotline | Yes | ☐ |
| 9 | Explainability card: DV redacted | Yes | ☐ |
| 10 | HMIS export: name nullified | Yes | ☐ |

#### 10.2 Stable Persona — James (Housed)

| Step | Action | Expected | Verified |
|------|--------|----------|----------|
| 1 | Start session | 201 Created | ☐ |
| 2 | Submit consent (dv_safe_mode: false) | 200 OK | ☐ |
| 3 | Submit demographics | 200 OK | ☐ |
| 4 | Submit housing (permanently_housed) | 200 OK | ☐ |
| 5 | Submit safety (all safe) | 200 OK | ☐ |
| 6 | Complete intake | Level 4–5, LOWER | ☐ |
| 7 | Minimal action plan | Yes | ☐ |

#### 10.3 Chronic Persona — Robert (Veteran)

| Step | Action | Expected | Verified |
|------|--------|----------|----------|
| 1 | Start session | 201 Created | ☐ |
| 2–5 | Submit required modules | 200 OK | ☐ |
| 6 | Submit history (chronic: true) | 200 OK | ☐ |
| 7 | Complete intake | Level ≤ 1, CRITICAL | ☐ |
| 8 | Action plan includes veteran services | Yes | ☐ |
| 9 | Override applied: chronic + veteran | Yes | ☐ |

---

### 11. V1 Non-Regression

| Check | Expected | Verified |
|-------|----------|----------|
| V1 intake endpoints still functioning | Yes | ☐ |
| V1 parser accuracy unchanged | 99.32% (586/590) | ☐ |
| No V1 test failures | 0 failures | ☐ |

**Verification command**:
```bash
npm run test:gate
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineer | | | |
| QA Lead | | | |
| Product Owner | | | |

---

## Notes

- If any check fails, do NOT proceed. Document the failure and investigate.
- The feature flag can be set back to `false` at any time as a kill switch.
- All V2 endpoints return 404 when the flag is disabled.
- DV-safe mode testing should be done in coordination with P2#10 advocate review.

---

*End of V2 Staging Deployment Checklist*
