# V2 Intake — Production Deployment Runbook

> **Version**: 1.0
> **Date**: February 18, 2026
> **Branch**: `v2-intake-scaffold`
> **Status**: Ready — execute when production deployment is approved
> **Audience**: Engineering Lead, DevOps, System Administrator

---

## Overview

This runbook covers the end-to-end procedure for deploying the V2 Intake system
to production. It includes pre-flight checks, environment configuration, migration,
verification, and rollback procedures.

**Critical Rule**: Deploy with `ENABLE_V2_INTAKE=false` first. Enable only after
all verification steps pass.

---

## Table of Contents

1. [Pre-Flight Checklist](#1-pre-flight-checklist)
2. [Environment Variable Configuration](#2-environment-variable-configuration)
3. [Database Migration](#3-database-migration)
4. [Deployment (Kill Switch OFF)](#4-deployment-kill-switch-off)
5. [Post-Deployment Verification](#5-post-deployment-verification)
6. [Enable V2 Intake (Kill Switch ON)](#6-enable-v2-intake-kill-switch-on)
7. [Smoke Test — Production](#7-smoke-test--production)
8. [Monitoring Checklist](#8-monitoring-checklist)
9. [Rollback Procedure](#9-rollback-procedure)
10. [Emergency Disable](#10-emergency-disable)
11. [Post-Deployment Observation Period](#11-post-deployment-observation-period)

---

## 1. Pre-Flight Checklist

Complete ALL items before proceeding to deployment:

| # | Check | Command / Action | Expected | ☐ |
|---|-------|-----------------|----------|---|
| 1 | All CI checks pass on branch | GitHub Actions — `v2-intake-scaffold` | All green (6 jobs) | ☐ |
| 2 | V2 Intake Gate specifically passes | CI → `V2 Intake Gate` job | 195/195 tests, <5s | ☐ |
| 3 | Staging smoke test passes | `npx tsx scripts/v2_staging_smoke.ts` | 57/57 checks | ☐ |
| 4 | V1 gate tests unaffected | `npx jest tests/gate/ --verbose` | 27/28 (pre-existing 1 fail) | ☐ |
| 5 | Clinical calibration session completed | See Calibration Protocol doc | Sign-off obtained | ☐ |
| 6 | DV advocate testing completed | See DV Testing Protocol doc | Advocate sign-off | ☐ |
| 7 | Branch merged to `main` via PR | PR reviewed + approved | Merged | ☐ |
| 8 | Database backup taken | `pg_dump production_db > backup_$(date).sql` | Backup verified | ☐ |
| 9 | Deployment window communicated | Email/Slack to stakeholders | Acknowledged | ☐ |
| 10 | Rollback plan reviewed | This document, Section 9 | Reviewed by 2 people | ☐ |

---

## 2. Environment Variable Configuration

### Required Environment Variables

Set these in the production environment **before** deployment:

```bash
# ─── V2 Intake Feature Flags ───
ENABLE_V2_INTAKE=false              # Deploy DISABLED first — enable in Step 6
ENABLE_V2_INTAKE_AUTH=true           # JWT auth required on all protected V2 endpoints

# ─── V1 Stability ───
V1_STABLE=true                       # Protect V1 parser — no V1 changes
ZERO_OPENAI_MODE=true                # No OpenAI API calls (V2 is rules-based)
AI_PROVIDER=rules                    # Deterministic scoring — no AI inference

# ─── Existing Variables (verify present) ───
NODE_ENV=production
DATABASE_URL=postgresql://...        # Production PostgreSQL connection string
JWT_SECRET=<production-secret>       # JWT signing secret (min 32 chars)
ENCRYPTION_KEY=<production-key>      # Encryption key for sensitive data
PORT=3001                            # Server port (or as configured)
```

### Verification

```bash
# SSH to production server, then:
printenv | grep -E "ENABLE_V2|V1_STABLE|ZERO_OPENAI|AI_PROVIDER|NODE_ENV"

# Expected output:
# ENABLE_V2_INTAKE=false
# ENABLE_V2_INTAKE_AUTH=true
# V1_STABLE=true
# ZERO_OPENAI_MODE=true
# AI_PROVIDER=rules
# NODE_ENV=production
```

---

## 3. Database Migration

The V2 Intake system requires the `v2_intake_sessions` table.

### Step 3.1: Verify Migration Files

```bash
# Check that the migration exists
ls backend/prisma/migrations/ | grep v2_intake
# Expected: migration directory with v2_intake_sessions table creation
```

### Step 3.2: Run Migration (Production)

```bash
cd backend

# Preview what will be applied (dry run)
npx prisma migrate status
# Verify: should show 1 pending migration for v2_intake_sessions

# Apply migration
npx prisma migrate deploy
# Expected: Migration applied successfully

# Verify table exists
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM v2_intake_sessions;"
# Expected: 0 (empty table)
```

### Step 3.3: Generate Prisma Client

```bash
npx prisma generate
# Expected: Prisma client generated with V2IntakeSession model
```

### Migration Rollback (if needed)

```sql
-- If migration must be reversed:
DROP TABLE IF EXISTS v2_intake_sessions;
DELETE FROM _prisma_migrations WHERE migration_name LIKE '%v2_intake%';
```

---

## 4. Deployment (Kill Switch OFF)

Deploy with V2 disabled to verify the deployment itself doesn't break V1:

### Step 4.1: Deploy Application

```bash
# Pull latest code
git checkout main
git pull origin main

# Install dependencies
cd backend && npm ci

# Generate Prisma client
npx prisma generate

# Build
npm run build

# Restart application (method depends on your process manager)
# PM2 example:
pm2 restart careconnect-backend

# Systemd example:
sudo systemctl restart careconnect-backend
```

### Step 4.2: Verify V1 Unaffected

```bash
# Health check
curl -s https://api.yoursite.com/api/health | jq .status
# Expected: "ok"

# V1 parser endpoint (should still work)
curl -s https://api.yoursite.com/api/version | jq .
# Expected: version response

# Liveness
curl -s https://api.yoursite.com/api/liveness
# Expected: 200 OK
```

### Step 4.3: Verify V2 is Disabled

```bash
# V2 endpoints should return 404
curl -s -o /dev/null -w "%{http_code}" https://api.yoursite.com/api/v2/intake/schema
# Expected: 404

curl -s -o /dev/null -w "%{http_code}" https://api.yoursite.com/api/v2/intake/health
# Expected: 404
```

### Step 4.4: Check Startup Logs

```bash
# Verify the disable log message appears
pm2 logs careconnect-backend --lines 50 | grep "V2 Intake"
# Expected: "[V2 Intake] DISABLED — ENABLE_V2_INTAKE is not set to 'true'"
```

**STOP HERE** if any V1 functionality is broken. See [Section 9: Rollback](#9-rollback-procedure).

---

## 5. Post-Deployment Verification

Before enabling V2, verify production stability:

| # | Check | Command | Expected | ☐ |
|---|-------|---------|----------|---|
| 1 | Health endpoint | `curl .../api/health` | `{"status":"ok"}` | ☐ |
| 2 | Liveness | `curl .../api/liveness` | 200 | ☐ |
| 3 | Version | `curl .../api/version` | Valid JSON | ☐ |
| 4 | V1 parsing works | Submit a test transcript via V1 | Parsed successfully | ☐ |
| 5 | No error spikes | Check error monitoring (Sentry/logs) | No new errors | ☐ |
| 6 | V2 endpoints are 404 | `curl .../api/v2/intake/schema` | 404 | ☐ |
| 7 | Database accessible | Application connects to PostgreSQL | No connection errors | ☐ |

**Wait 15 minutes** and verify no V1 regressions before proceeding.

---

## 6. Enable V2 Intake (Kill Switch ON)

### Step 6.1: Set Environment Variable

```bash
# Set the feature flag
export ENABLE_V2_INTAKE=true

# Restart the application
pm2 restart careconnect-backend
# or
sudo systemctl restart careconnect-backend
```

### Step 6.2: Verify V2 is Active

```bash
# Check startup logs
pm2 logs careconnect-backend --lines 20 | grep "V2"
# Expected: "[V2 INTAKE ENABLED] Routes mounted at /api/v2/intake"

# V2 health endpoint
curl -s https://api.yoursite.com/api/v2/intake/health | jq .
# Expected: {"status":"healthy","policyPackVersion":"v1.0.0","timestamp":"..."}

# V2 schema endpoint (public)
curl -s https://api.yoursite.com/api/v2/intake/schema | jq .version
# Expected: "v1.0.0"
```

### Step 6.3: Verify Auth is Enforced

```bash
# Protected endpoint without token — should be 401
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://api.yoursite.com/api/v2/intake/sessions
# Expected: 401

# With valid JWT — should be 201
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"personaData":{"firstName":"Test"}}' \
  -X POST https://api.yoursite.com/api/v2/intake/sessions
# Expected: 201
```

---

## 7. Smoke Test — Production

Run a targeted subset of smoke tests against production:

### Manual Quick Smoke

```bash
# 1. Health
curl -s https://api.yoursite.com/api/v2/intake/health | jq .status
# Expected: "healthy"

# 2. Schema
curl -s https://api.yoursite.com/api/v2/intake/schema | jq '.modules | length'
# Expected: 8

# 3. Create session
SESSION_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"personaData":{"firstName":"SmokeTest","lastName":"Production"}}' \
  -X POST https://api.yoursite.com/api/v2/intake/sessions)
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r .sessionId)
echo "Session created: $SESSION_ID"
# Expected: valid UUID

# 4. Complete session (with minimal data)
curl -s \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"modules\":{\"consent\":{\"agreed\":true},\"demographics\":{\"age\":35},\"housing\":{\"currentSituation\":\"sheltered\"},\"health\":{\"conditions\":[]},\"safety\":{\"dvStatus\":\"none\"},\"barriers\":{\"items\":[]},\"income\":{\"monthlyIncome\":1500},\"goals\":{\"housingGoal\":\"maintain\"}}}" \
  -X POST https://api.yoursite.com/api/v2/intake/sessions/$SESSION_ID/complete | jq .status
# Expected: "completed"

# 5. Calibration endpoint
curl -s \
  -H "Authorization: Bearer $TOKEN" \
  https://api.yoursite.com/api/v2/intake/calibration | jq .totalSessions
# Expected: ≥ 1

# 6. Verify V1 still works
curl -s https://api.yoursite.com/api/health | jq .status
# Expected: "ok"
```

### Automated Smoke (if staging URL matches production)

```bash
cd backend
npx tsx scripts/v2_staging_smoke.ts https://api.yoursite.com $ADMIN_TOKEN
# Expected: 57/57 checks pass
```

---

## 8. Monitoring Checklist

### First 24 Hours

| Interval | Check | How |
|----------|-------|-----|
| +15 min | Error rate normal | Check Sentry / error logs |
| +1 hour | Response times normal | Check APM / response time dashboards |
| +1 hour | V1 parser still working | Verify recent V1 intakes processed |
| +4 hours | No memory leaks | Check server memory utilization |
| +4 hours | Database connections stable | Check connection pool metrics |
| +12 hours | Audit trail recording | Query audit events for V2 sessions |
| +24 hours | Full health check | Run smoke test again |

### Ongoing (First Week)

| Check | Frequency | Action if Failed |
|-------|-----------|-----------------|
| V2 health endpoint | Every 5 min (uptime monitor) | Alert engineering |
| Error log review | Daily | Investigate new errors |
| Calibration report | Daily for first 3 days | Compare with staging baseline |
| V1 regression check | Daily | If any V1 issue, disable V2 immediately |

### Log Verification

```bash
# Check for V2-related errors in last hour
pm2 logs careconnect-backend --lines 500 | grep -i "error.*v2\|v2.*error"
# Expected: No matches (or only expected warnings)

# Check V2 request volume
pm2 logs careconnect-backend --lines 500 | grep "v2/intake" | wc -l
# Expected: Growing as users access V2

# Check for unhandled rejections
pm2 logs careconnect-backend --lines 500 | grep "UnhandledPromise\|unhandledRejection"
# Expected: None
```

---

## 9. Rollback Procedure

### When to Rollback

- V1 functionality is broken after V2 deployment
- Persistent 500 errors on V2 endpoints that cannot be quickly fixed
- Database performance degradation
- Security vulnerability discovered

### Quick Rollback (Disable V2)

If V2 specifically is causing issues but V1 is fine:

```bash
# Disable V2 without redeployment
export ENABLE_V2_INTAKE=false
pm2 restart careconnect-backend

# Verify V2 is disabled
curl -s -o /dev/null -w "%{http_code}" https://api.yoursite.com/api/v2/intake/health
# Expected: 404

# Verify V1 still works
curl -s https://api.yoursite.com/api/health | jq .status
# Expected: "ok"
```

This is the **fastest** rollback — takes < 1 minute.

### Full Rollback (Revert Code)

If the deployment itself caused issues:

```bash
# 1. Identify the pre-deployment commit
git log --oneline -5
# Find the commit BEFORE the V2 merge

# 2. Revert to previous commit
git checkout <previous-commit-hash>

# 3. Rebuild and restart
cd backend
npm ci
npx prisma generate
npm run build
pm2 restart careconnect-backend

# 4. Verify V1 works
curl -s https://api.yoursite.com/api/health | jq .status
# Expected: "ok"
```

### Database Rollback (if migration caused issues)

```bash
# Restore from backup taken in Step 1.8
psql production_db < backup_YYYY-MM-DD.sql

# Or drop the V2 table only
psql production_db -c "DROP TABLE IF EXISTS v2_intake_sessions;"
psql production_db -c "DELETE FROM _prisma_migrations WHERE migration_name LIKE '%v2_intake%';"
```

---

## 10. Emergency Disable

If V2 is causing active harm (wrong scores, data leaks, DV safety issues):

### Immediate Action (< 30 seconds)

```bash
# Set environment variable and restart
export ENABLE_V2_INTAKE=false
pm2 restart careconnect-backend --update-env
```

### If Environment Variable Approach Fails

```bash
# Hard stop and redeploy previous version
pm2 stop careconnect-backend
git checkout <last-known-good-commit>
cd backend && npm ci && npx prisma generate && npm run build
pm2 start careconnect-backend
```

### Post-Emergency Actions

1. Notify all stakeholders within 15 minutes
2. Create incident report
3. Preserve all logs from the incident period
4. Identify root cause before re-enabling
5. Run full test suite before re-enabling
6. Schedule post-incident review within 48 hours

---

## 11. Post-Deployment Observation Period

### Week 1: Active Monitoring

| Day | Required Actions |
|-----|-----------------|
| Day 1 | Check every 2 hours. Run smoke test at end of day. |
| Day 2 | Check every 4 hours. Review error logs. |
| Day 3 | Generate first production calibration report. Compare with staging. |
| Day 4-5 | Daily log review. Monitor session completion rates. |
| Day 6-7 | Weekend monitoring: automated health checks only. |

### Week 2: Reduced Monitoring

- Daily log review
- Generate second calibration report — compare with Day 3
- Review fairness endpoint data
- Document any edge cases observed

### End of Observation

After 2 weeks with no issues:
1. Document production calibration baseline
2. Archive deployment evidence
3. Update this runbook with any production-specific learnings
4. Schedule first clinical calibration session (see Calibration Protocol)

---

## Appendix A: Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_V2_INTAKE` | Yes | `false` | Master kill switch for V2 intake routes |
| `ENABLE_V2_INTAKE_AUTH` | Yes | `true` | JWT auth enforcement on V2 protected endpoints |
| `V1_STABLE` | Yes | `true` | Prevent V1 parser modifications |
| `ZERO_OPENAI_MODE` | Yes | `true` | Disable all OpenAI API calls |
| `AI_PROVIDER` | Yes | `rules` | Scoring engine mode (must be `rules` for V2) |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `ENCRYPTION_KEY` | Yes | — | Data encryption key |
| `NODE_ENV` | Yes | — | Must be `production` |
| `PORT` | No | `3001` | Server listen port |

## Appendix B: Key Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v2/intake/health` | GET | No | V2 health check |
| `/api/v2/intake/schema` | GET | No | Intake module schema |
| `/api/v2/intake/sessions` | POST | Yes | Create intake session |
| `/api/v2/intake/sessions/:id/complete` | POST | Yes | Complete session + score |
| `/api/v2/intake/sessions/:id` | GET | Yes | Retrieve session |
| `/api/v2/intake/sessions/:id/hmis` | GET | Yes | HMIS export |
| `/api/v2/intake/calibration` | GET | Yes | Calibration report |
| `/api/v2/intake/audit/fairness` | GET | Yes | Fairness analysis |

---

## Guardrails Compliance

| Guardrail | Status |
|-----------|--------|
| No scoring changes | ✅ — Runbook only, no code changes |
| No UI changes | ✅ |
| No V1 changes | ✅ |
| No AI calls | ✅ |
| No new endpoints | ✅ |
| No migration changes | ✅ |

---

*Production Deployment Runbook — V2 Intake Phase 5*
*Authored: 2026-02-18*
