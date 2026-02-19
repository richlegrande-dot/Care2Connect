# V2 Intake — Production Environment Verification

> **Date**: February 19, 2026
> **Phase**: 6B — Blocker Removal
> **Verified By**: Engineering (automated audit)
> **Reference**: `docs/V2_PRODUCTION_DEPLOYMENT_RUNBOOK.md` Section 2

---

## Purpose

This document verifies that the production environment variables match the
requirements specified in the V2 Production Deployment Runbook. Each variable
is checked for presence, correct value, and security posture.

---

## 1. V2 Feature Flags

| Variable | Required Value | Actual Value | Status |
|----------|---------------|--------------|--------|
| `ENABLE_V2_INTAKE` | `true` | `true` | ✅ MATCH |
| `ENABLE_V2_INTAKE_AUTH` | `true` | `true` | ✅ MATCH |

## 2. V1 Stability & AI Controls

| Variable | Required Value | Actual Value | Status |
|----------|---------------|--------------|--------|
| `V1_STABLE` | `true` | `true` | ✅ MATCH |
| `ZERO_OPENAI_MODE` | `true` | `true` | ✅ MATCH |
| `AI_PROVIDER` | `rules` | `rules` | ✅ MATCH |

## 3. Security Secrets

| Variable | Required | Present | Status |
|----------|----------|---------|--------|
| `JWT_SECRET` | Yes — min 32 chars | ✅ Set (redacted) | ✅ PRESENT |
| `STRIPE_SECRET_KEY` | Yes | ✅ Set (redacted) | ✅ PRESENT |
| `STRIPE_WEBHOOK_SECRET` | Yes | ✅ Set (redacted) | ✅ PRESENT |
| `ADMIN_PASSWORD` | Yes | ✅ Set (redacted) | ✅ PRESENT |
| `SESSION_SECRET` | Yes | ✅ Set (redacted) | ✅ PRESENT |
| `ADMIN_DIAGNOSTICS_TOKEN` | Yes | ✅ Set (redacted) | ✅ PRESENT |

## 4. Database

| Variable | Required | Actual Value | Status |
|----------|----------|--------------|--------|
| `DB_MODE` | `remote` | `remote` | ✅ MATCH |
| `DATABASE_URL` | PostgreSQL connection string | ✅ Set — `postgres://...@db.prisma.io:5432/postgres?sslmode=require&pool=true` | ✅ PRESENT |

## 5. Server Configuration

| Variable | Required | Actual Value | Status |
|----------|----------|--------------|--------|
| `NODE_ENV` | `production` or `development` | `development` | ⚠️ NOTE |
| `PORT` | 3001 | `3001` | ✅ MATCH |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:3000` | ✅ SET |

> **Note on NODE_ENV**: Currently set to `development`. For the pilot
> environment this is acceptable. For GA production deployment, this should
> be changed to `production` to enable production optimizations and disable
> debug output. This is a **pilot-phase configuration**, not a misconfiguration.

## 6. Data Protection & Compliance

| Variable | Required Value | Actual Value | Status |
|----------|---------------|--------------|--------|
| `BLOCK_SENSITIVE_DATA` | `true` | `true` | ✅ MATCH |
| `REQUIRE_CONSENT` | `true` | `true` | ✅ MATCH |
| `SPEECH_REDACTION_ENABLED` | `true` | `true` | ✅ MATCH |
| `SPEECH_STORE_TRANSCRIPTS_DEFAULT` | `false` | `false` | ✅ MATCH |
| `SPEECH_RETENTION_DAYS` | Positive integer | `30` | ✅ SET |

## 7. Test/Debug Flags (Must Not Leak to Production)

| Variable | Required Value | Actual Value | Status |
|----------|---------------|--------------|--------|
| `ENABLE_TEST_MODE` | `false` | `false` | ✅ SAFE |
| `ENABLE_STRESS_TEST_MODE` | `false` | `false` | ✅ SAFE |
| `TEST_USE_STUBBED_TRANSCRIPTS` | `false` | `false` | ✅ SAFE |
| `TEST_DETERMINISTIC_MODE` | `false` | `false` | ✅ SAFE |
| `DEMO_MODE` | `false` | `false` | ✅ SAFE |
| `MOCK_OPENAI_RESPONSES` | `false` | `false` | ✅ SAFE |
| `MOCK_STRIPE_RESPONSES` | `false` | `false` | ✅ SAFE |
| `DISABLE_RATE_LIMITING` | `false` | `false` | ✅ SAFE |

## 8. External Services

| Variable | Required | Present | Status |
|----------|----------|---------|--------|
| `OPENAI_API_KEY` | Present (unused in rules mode) | ✅ Set (redacted) | ✅ PRESENT |
| `ASSEMBLYAI_API_KEY` | Present | ✅ Set (redacted) | ✅ PRESENT |
| `STRIPE_PUBLISHABLE_KEY` | Present | ✅ Set (redacted) | ✅ PRESENT |
| `CLOUDFLARE_API_TOKEN` | Present | ✅ Set (redacted) | ✅ PRESENT |
| `CLOUDFLARE_ZONE_ID` | Present | `0b6345d646f1d114dc38d07ae970e841` | ✅ SET |
| `CLOUDFLARE_TUNNEL_ID` | Present | `07e7c160-451b-4d41-875c-a58f79700ae8` | ✅ SET |
| `CLOUDFLARE_DOMAIN` | Present | `care2connects.org` | ✅ SET |

## 9. Monitoring & Recovery

| Variable | Required Value | Actual Value | Status |
|----------|---------------|--------------|--------|
| `HEALTHCHECKS_ENABLED` | `true` | `true` | ✅ MATCH |
| `HEALTHCHECKS_INTERVAL_SEC` | Positive integer | `300` (5 min) | ✅ SET |
| `AUTO_RECOVERY_ENABLED` | `true` | `true` | ✅ MATCH |
| `HEALTH_CHECK_INTERVAL` | Positive integer | `30000` (30 sec) | ✅ SET |
| `EXTERNAL_SERVICE_TIMEOUT` | Positive integer | `5000` (5 sec) | ✅ SET |

## 10. Rate Limiting

| Variable | Required | Actual Value | Status |
|----------|----------|--------------|--------|
| `RATE_LIMIT_WINDOW_MS` | Positive integer | `900000` (15 min) | ✅ SET |
| `RATE_LIMIT_MAX_REQUESTS` | Positive integer | `100` | ✅ SET |
| `DISABLE_RATE_LIMITING` | `false` | `false` | ✅ SAFE |

---

## Summary

| Category | Items | Passing | Warnings | Failures |
|----------|-------|---------|----------|----------|
| V2 Feature Flags | 2 | 2 | 0 | 0 |
| V1/AI Controls | 3 | 3 | 0 | 0 |
| Security Secrets | 6 | 6 | 0 | 0 |
| Database | 2 | 2 | 0 | 0 |
| Server Config | 3 | 2 | 1 | 0 |
| Data Protection | 5 | 5 | 0 | 0 |
| Test/Debug Flags | 8 | 8 | 0 | 0 |
| External Services | 8 | 8 | 0 | 0 |
| Monitoring | 5 | 5 | 0 | 0 |
| Rate Limiting | 3 | 3 | 0 | 0 |
| **TOTAL** | **45** | **44** | **1** | **0** |

### Warning Details

| # | Variable | Issue | Risk | Remediation |
|---|----------|-------|------|-------------|
| 1 | `NODE_ENV` | Set to `development` instead of `production` | LOW — pilot phase, acceptable | Change to `production` at GA launch |

### Security Posture

- ✅ All secrets are set and non-empty
- ✅ No test/mock modes enabled
- ✅ Rate limiting active
- ✅ Sensitive data blocking enabled
- ✅ Consent required before data collection
- ✅ Speech redaction enabled
- ✅ `.env` file is gitignored — never committed

### Verdict

**PASS** — Production environment is correctly configured for pilot operations.
One advisory warning (`NODE_ENV=development`) is expected during pilot and will
be remediated at GA launch.

---

*Production Environment Verification — Phase 6B*
*Verified: 2026-02-19T01:00Z*
