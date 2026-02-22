# Care2Connect System State Report -- Pre-Manual-Testing Final Briefing

> **Date**: 2026-02-22
> **Branch**: `hardening/deploy-guardrails` (commit `c5f6dec`)
> **Main HEAD**: `65797a8`
> **Purpose**: Complete system inventory for navigator agent before next hardening phase
> **Author**: Deploy Guardrails Agent

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend Deep Dive](#3-frontend-deep-dive)
4. [Backend Deep Dive](#4-backend-deep-dive)
5. [Infrastructure Stack](#5-infrastructure-stack)
6. [Database Layer](#6-database-layer)
7. [Security Posture](#7-security-posture)
8. [Deployment Guardrails (Current Branch)](#8-deployment-guardrails-current-branch)
9. [Testing Infrastructure](#9-testing-infrastructure)
10. [Environment Configuration](#10-environment-configuration)
11. [Git State and Branch Hygiene](#11-git-state-and-branch-hygiene)
12. [Known Issues and Tech Debt](#12-known-issues-and-tech-debt)
13. [Risk Assessment for Manual Testing](#13-risk-assessment-for-manual-testing)
14. [Recommended Next Hardening Phase](#14-recommended-next-hardening-phase)
15. [Appendix A: All Route Prefixes](#appendix-a-all-route-prefixes)
16. [Appendix B: All Prisma Models](#appendix-b-all-prisma-models)
17. [Appendix C: Complete Script Inventory](#appendix-c-complete-script-inventory)
18. [Appendix D: Handoff and Report Document Index](#appendix-d-handoff-and-report-document-index)

---

## 1. Executive Summary

Care2Connect is a social services platform connecting individuals experiencing
homelessness with providers through AI-assisted intake, profile generation, and
case management. The system runs on a Windows development machine, tunneled to
production via Cloudflare at `care2connects.org` and `api.care2connects.org`.

### Current State

- **Production domains**: Live and serving via Cloudflare tunnel
- **Last full smoke test**: 2026-02-21 (42/42 assertions passed -- see Phase 10 report)
- **Unmerged hardening branches**: 3 (`hardening/deploy-guardrails`, `hardening/deploy-process`, `fix/ci-unblock-v2-required-checks`)
- **Preflight system**: Fully operational -- unified `preflight.ps1` orchestrates all checks
- **Critical path**: Intake form -> profile -> scoring -> chat -> provider dashboard -- all verified

### What This Branch Adds (Not Yet on Main)

The `hardening/deploy-guardrails` branch adds 14 files (1,113+ insertions) that
prevent recurrence of the Feb 2026 provider dashboard proxy failure:

- 6 preflight/dev scripts (PS 5.1 compatible)
- Hardened papi proxy (8s timeout, tracing headers)
- Backend identity field (`service: "backend"` in `/health/live`)
- Frontend `.env.local.example` template
- Deployment runbook
- Navigator report

**These changes must be merged to main before manual testing benefits from them.**

---

## 2. Architecture Overview

```
                    Internet
                       |
              [Cloudflare Tunnel]
              cloudflared (IPv4)
                       |
                  [Caddy :8080]
                  /          \
    care2connects.org    api.care2connects.org
           |                     |
    [Next.js :3000]      [Express :3001]
    (App Router,          (41 route files,
     standalone)           Prisma ORM)
                               |
                       [PostgreSQL :5432]
                       (Docker container)
```

### Traffic Flow

1. Browser -> `care2connects.org` -> Cloudflare -> cloudflared -> Caddy :8080 -> Next.js :3000
2. Browser -> `api.care2connects.org` -> Cloudflare -> cloudflared -> Caddy :8080 -> Express :3001
3. Browser JS -> `/api/*` (rewritten by next.config.js) -> Express :3001 directly
4. Browser JS -> `/papi/*` (App Router proxy) -> Next.js server -> Express :3001

### The /api Rewrite Shadow Problem

`next.config.js` contains a blanket rewrite:
```javascript
rewrites: async () => [
  { source: "/api/:path*", destination: "${NEXT_PUBLIC_API_URL}/:path*" }
]
```

This intercepts ALL `/api/*` requests before the App Router, making any
`frontend/app/api/**/route.ts` file dead code. There are currently 13
frontend components that fetch `/api/*` paths (non-v2), preventing the
rewrite from being narrowed. The guardrails branch adds a detection script
and enforces the `/papi/*` convention for App Router proxy routes.

---

## 3. Frontend Deep Dive

### Framework and Build

| Property | Value |
|----------|-------|
| Framework | Next.js 14.0.3 (App Router) |
| Output mode | `standalone` |
| TypeScript | 5.3.2, `ignoreBuildErrors: false` |
| ESLint | 8.54.0, `ignoreDuringBuilds: false` |
| CSS | Tailwind 3.3.6 + PostCSS |
| State management | Zustand 4.4.7 |
| Data fetching | @tanstack/react-query 5.8.4, Axios 1.6.2 |
| Animation | Framer Motion 10.16.16 |
| UI components | Headless UI, Heroicons, Lucide React |
| Charts | Recharts 3.5.1 |
| QR codes | qrcode 1.5.4 |
| Auth | @supabase/supabase-js 2.38.5 |
| Testing | Jest 29.7.0, Testing Library, Playwright 1.58.2 |

### Route Structure (27 pages, 3 API routes)

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/about` | About page |
| `/find` | Resource finder |
| `/resources` | Resource directory |
| `/support` | Support page |
| `/health` | Health dashboard page |
| `/health/live` | Health endpoint (route.ts -- NOT shadowed) |
| `/tell-story`, `/tell-your-story` | Story submission |
| `/system` | System admin |
| `/system/setup-wizard` | Setup wizard |
| `/gfm/extract`, `/gfm/review` | GoFundMe extraction/review |
| `/funding-setup/[clientId]` | Funding setup per client |
| `/onboarding/v2` | **V2 Intake Wizard** (primary user flow) |
| `/donate/[slug]` | Donation page per profile |
| `/provider/dashboard` | **Provider Dashboard** (authenticated) |
| `/provider/login` | Provider login |
| `/profile/[id]` | Individual profile view |
| `/profile/session` | Session list |
| `/profile/session/[sessionId]` | Session detail |
| `/admin/knowledge` | Knowledge base admin |
| `/admin/knowledge/[sourceId]` | Knowledge source detail |
| `/admin/knowledge/audit` | Audit log |
| `/admin/knowledge/audit/[auditId]` | Audit detail |
| `/admin/knowledge/incidents` | Incident log |
| `/admin/knowledge/incidents/[incidentId]` | Incident detail |
| `/papi/[...path]` | **Provider API proxy** (route.ts) |
| `/api/health` | Frontend health (route.ts -- SHADOWED, dead code) |

### Security Headers (via next.config.js)

Applied to all routes (`/(.*)`):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `X-Care2-Origin: frontend`

Profile routes (`/profile/:path*`) get additional hardening:
- `Referrer-Policy: no-referrer`
- `Cache-Control: private, no-store, no-cache, must-revalidate`
- `X-Robots-Tag: noindex, nofollow`

### Papi Proxy (Hardened on This Branch)

The `/papi/[...path]/route.ts` proxy relays requests from the browser to
`http://localhost:3001/api/v2/provider/*`, forwarding cookies and relaying
`Set-Cookie` headers with domain/secure stripping for same-origin compliance.

**Hardening added on this branch:**
- 8s `AbortController` timeout (prevents infinite hang if backend dies)
- `X-C2C-Proxy: papi` header on upstream requests
- `X-C2C-Request-Id` UUID on all requests/responses
- `X-C2C-Upstream` status code header on responses
- `requestId` included in all error responses (502/504)
- 504 status for timeout (was generic 502)

### Frontend Test Coverage

Only 3 test files exist:
1. `frontend/__tests__/lib/api-client.test.ts` -- API client unit tests
2. `frontend/__tests__/e2e/demo-flow.spec.ts` -- E2E demo flow (Playwright)
3. `frontend/__tests__/e2e/criticalJourneys.spec.ts` -- Critical journey E2E

**Gap**: No component-level tests for any of the 27 pages.

---

## 4. Backend Deep Dive

### Framework and Dependencies

| Property | Value |
|----------|-------|
| Framework | Express 4.18.2 |
| Language | TypeScript 5.9.3 (tsx for dev, tsc for build) |
| ORM | Prisma 6.19.1 (PostgreSQL) |
| Auth | jsonwebtoken, bcryptjs |
| AI | OpenAI 4.20.1 (disabled in V1 via `ZERO_OPENAI_MODE`) |
| Transcription | AssemblyAI 4.22.1 |
| Payments | Stripe 20.0.0 |
| Email | Nodemailer 7.0.11 |
| Document gen | docx 9.5.1 |
| Web scraping | Cheerio 1.2.0 |
| Security | Helmet 7.1.0, express-rate-limit 7.1.5, cors |
| Validation | Zod 3.25.76, express-validator |
| Scheduling | node-cron |
| Testing | Jest 29.7.0, Supertest |

### Route Architecture (41 route files, 200+ handlers)

The backend mounts routes in `server.ts` with 62 `app.use`/`app.get` registrations.
Top-level prefixes:

**Public (no auth required):**
- `/health/live` -- liveness probe (always responds)
- `/health/db` -- database connectivity probe
- `/ops/health` -- production readiness (checks Caddy, frontend, tunnel)
- `/` -- HTML welcome page

**API routes (mounted under /api):**
- `/api/auth` -- login, JWT issuance
- `/api/transcribe`, `/api/transcription` -- audio transcription
- `/api/chat` -- chat pipeline
- `/api/profile`, `/api/profiles` -- profile CRUD, search
- `/api/story` -- story submission
- `/api/resources` -- resource directory
- `/api/donations` -- donation management
- `/api/payments` -- Stripe webhooks
- `/api/support`, `/api/tickets` -- support ticketing
- `/api/eligibility` -- eligibility assessment
- `/api/jobs` -- background job management
- `/api/analysis` -- data analysis
- `/api/export`, `/api/exports` -- document/data export
- `/api/qr` -- QR code donations
- `/api/hardening` -- hardening metrics
- `/api/v2/intake` -- **V2 intake wizard endpoints**
- `/api/v2/provider` -- **Provider dashboard API**

**Admin routes:**
- `/admin`, `/admin/ops`, `/admin/self-heal`
- `/admin/knowledge`, `/admin/knowledge/audit`
- `/admin/db` -- database admin
- `/admin/incidents` -- incident management
- `/admin/profiles`, `/admin/support`
- `/admin/setup/tunnel` -- tunnel configuration

**Observability:**
- `/metrics`, `/metrics/performance`
- `/errors` -- error reporting
- `/demo` -- demo mode

### Health Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /health/live` | Liveness | `{ status: "alive", service: "backend", timestamp, uptime, pid, port }` |
| `GET /health/db` | DB check | `{ status: "connected" }` or error |
| `GET /ops/health` | Full stack | Checks backend, Caddy, frontend static assets, tunnel |

**Note**: `service: "backend"` was added on this branch to enable port identity verification.

### Backend Test Coverage

- **115 test files** (93 in `backend/tests/`, 21 in `backend/src/tests/`, 1 in `backend/src/utils/__tests__/`)
- Test categories: unit, integration, pipeline, gate, qa-v1, core30, intake-v2
- 28 `test.todo()` stubs (placeholder tests awaiting implementation)
- Key test suites:
  - `core30.test.ts` -- parsing engine regression (30 golden transcripts)
  - `qa-v1-zero-openai.test.ts` -- V1 zero-OpenAI mode validation
  - `connectivity-real.test.ts` -- real connectivity integration tests
  - `tests/intake_v2/` -- V2 intake wizard tests
  - `tests/pipeline/`, `tests/pipeline30/` -- full pipeline tests

### V1 Stable Mode

The backend enforces V1 stability through environment flags:
- `V1_STABLE=true` -- production hardening mode
- `ZERO_OPENAI_MODE=true` -- disables all OpenAI API calls
- `AI_PROVIDER=rules` -- uses deterministic rule-based AI
- `TRANSCRIPTION_PROVIDER=assemblyai` -- AssemblyAI for transcription

---

## 5. Infrastructure Stack

### PM2 Process Management

4 ecosystem config files exist:

| Config | Services | Status |
|--------|----------|--------|
| `ecosystem.dev.config.js` | backend-dev (3001), frontend-dev (3000) | **Active, recommended** |
| `ecosystem.prod.config.js` | backend-prod (3001), frontend-prod (3000) | Production use |
| `ecosystem.config.js` (root) | backend (3001), frontend (3000) | **DEPRECATED** |
| `backend/ecosystem.config.js` | backend only (3001, cluster mode) | Legacy |

**Production hardening** (`ecosystem.prod.config.js`):
- `max_restarts: 3`, `min_uptime: 60s`, `restart_delay: 10s`
- Exponential backoff: `exp_backoff_restart_delay: 1000`
- Memory limits: backend 500MB, frontend 300MB
- `STRICT_PORT_MODE: true` -- prevents port drift
- Pre-start: runs `critical-path-regression-tests.ps1 -Quick`

**Key fix**: All configs now use `node_modules/next/dist/bin/next` (not `.bin/next`
bash shim which fails silently on Windows).

### Caddy Reverse Proxy

```
:8080 {
  @frontend host care2connects.org   -> reverse_proxy 127.0.0.1:3000
  @api      host api.care2connects.org -> reverse_proxy 127.0.0.1:3001
  catch-all -> 404 "Invalid hostname"
}
```

- `auto_https off` (TLS handled by Cloudflare)
- Health checks: `/` for frontend (10s), `/health/live` for backend (10s)
- Upstream headers: `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto: https`

### Cloudflare Tunnel

| Property | Value |
|----------|-------|
| Tunnel ID | `07e7c160-451b-4d41-875c-a58f79700ae8` |
| Tunnel name | `care2connects-tunnel` |
| Config | `C:\Users\richl\.cloudflared\config.yml` |
| Binary version | cloudflared v2025.8.1 |
| Start command | `cloudflared tunnel --edge-ip-version 4 run` |
| Routes | `care2connects.org` and `api.care2connects.org` -> Caddy :8080 |

### Service Start Order (Critical)

1. PostgreSQL (Docker container `careconnect-postgres`)
2. Backend (Express, port 3001)
3. Frontend (Next.js, port 3000)
4. Caddy (port 8080)
5. Cloudflared (tunnel)

**Failure if out of order**: Frontend's `/papi/*` proxy will 502 if backend isn't up.
Caddy health checks will mark backends as unhealthy if services are down.

---

## 6. Database Layer

### PostgreSQL via Prisma

| Property | Value |
|----------|-------|
| Provider | PostgreSQL |
| Version | Docker container |
| Container name | `careconnect-postgres` |
| Port | 5432 |
| ORM | Prisma 6.19.1 |
| Schema file | `backend/prisma/schema.prisma` (1,080 lines) |
| Migrations applied | 13 |
| Connection | `DATABASE_URL` env var |
| DB_MODE | `local` (Docker) or `remote` (cloud) |

### Data Model (38 tables)

**Core entities:**
- `profiles` -- individual client profiles
- `users` -- system users
- `messages` -- chat/communication messages
- `resources` -- community resources

**V2 Intake system:**
- `V2IntakeSession` -- intake wizard sessions
- `V2IntakeAuditEvent` -- audit trail for intake
- `V2IntakeChatThread` -- chat threads per session
- `V2IntakeChatMessage` -- individual chat messages

**Transcription pipeline:**
- `audio_files` -- uploaded audio
- `transcription_sessions` -- transcription jobs
- `transcription_segments` -- transcription segments
- `transcription_feedback` -- user feedback
- `transcription_error_events` -- error tracking
- `SpeechAnalysisResult` -- speech analysis output
- `RecordingTicket` -- recording tickets

**Financial:**
- `donations` -- donation records
- `donation_drafts` -- draft donations
- `stripe_attributions` -- Stripe attribution tracking
- `stripe_events` -- Stripe webhook events
- `qr_code_history`, `qr_code_links` -- QR donation system

**Operations:**
- `support_tickets` -- support tickets
- `profile_tickets` -- profile-linked tickets
- `generated_documents` -- exported documents
- `health_check_runs` -- health check history
- `incidents`, `system_incidents`, `pipeline_incidents` -- incident tracking
- `knowledge_sources`, `knowledge_chunks`, `knowledge_bindings` -- knowledge base
- `knowledge_audit_logs` -- knowledge audit trail
- `jobs_cache` -- background jobs
- `model_tuning_profiles` -- ML model tuning

**Community:**
- `AidProgram` -- aid programs
- `AidEligibilityAssessment` -- eligibility assessments
- `ShelterFacility` -- shelter locations
- `ShelterAvailabilityLog` -- shelter availability tracking

---

## 7. Security Posture

### Authentication

| Component | Mechanism |
|-----------|-----------|
| Backend API | JWT (jsonwebtoken) |
| Provider dashboard | Cookie-based (`c2c_provider_auth`, httpOnly) |
| V2 intake | JWT auth (when `ENABLE_V2_INTAKE_AUTH=true`) |
| Admin panel | `SYSTEM_PANEL_PASSWORD` |

### Secrets Management

- All secrets in `.env` files (gitignored)
- `backend/.env.example` and `frontend/.env.local.example` in git (templates only)
- `validate-env.ps1` checks key presence without printing values
- No secret scanning in CI (gap)

### Headers and CORS

- Helmet.js for standard security headers
- CORS configured via `CORS_ORIGIN` env var
- Rate limiting via `express-rate-limit` (configurable window/max)
- `X-Content-Type-Options: nosniff` on all frontend routes
- `X-Frame-Options: DENY` on all frontend routes
- Profile routes get `no-store, no-cache` + `noindex, nofollow`

### Known Security Gaps

1. **No HTTPS between services** -- all internal traffic is HTTP (Caddy -> Express/Next.js)
2. **No secret rotation** -- JWT_SECRET is static
3. **No CI secret scanning** -- no automated detection of committed secrets
4. **Admin panel uses shared password** -- not per-user auth
5. **Rate limiting bypassable in tests** -- `DISABLE_RATE_LIMITING` env flag exists
6. **CORS_ORIGIN not validated** -- defaults to `http://localhost:3000`

---

## 8. Deployment Guardrails (Current Branch)

### Preflight System

The unified preflight command orchestrates all checks:

```powershell
# Before a demo
scripts/preflight/run-preflight-demo.ps1

# Before opening to testers
scripts/preflight/run-preflight-open-testing.ps1

# Lightweight local dev
scripts/preflight/preflight.ps1 -Mode LocalDev
```

### Modes

| Mode | Env Check | PM2 Shims | Rewrite Shadow | Port Identity |
|------|-----------|-----------|----------------|---------------|
| Demo | Yes | Yes | Yes | Yes (full sweep) |
| OpenTesting | Yes | Yes | Yes | Yes (full sweep) |
| LocalDev | Yes | Yes | Yes | No (unless -IncludePorts) |

### Individual Scripts

| Script | Purpose | Exit 0 | Exit 1 |
|--------|---------|--------|--------|
| `validate-env.ps1` | Check required env keys exist | All present | Missing keys |
| `check-pm2-shims.ps1` | Detect `.bin/` bash shim refs | No shims | Shims found |
| `check-next-rewrite-shadow.ps1` | Detect shadowed App Router routes | Clean | Shadowed routes |
| `ports-and-identity.ps1` | Port sweep + service identity | Ready | Failed checks |
| `stop-clean.ps1` | Kill all + sweep ports | Clean | Ports stuck |

### Papi Proxy Hardening

| Feature | Before | After |
|---------|--------|-------|
| Upstream timeout | None (infinite hang) | 8s AbortController |
| Request tracing | None | X-C2C-Request-Id UUID |
| Proxy identification | None | X-C2C-Proxy: papi |
| Upstream status | Not exposed | X-C2C-Upstream header |
| Timeout status code | N/A | 504 (distinct from 502) |
| Error response | Generic | Includes requestId |

### Backend Identity

`/health/live` now returns `service: "backend"` field, enabling the port identity
script to verify that the correct process is bound to port 3001 (not a rogue
Next.js instance).

---

## 9. Testing Infrastructure

### Automated Test Suites

| Suite | Command | Files | Purpose |
|-------|---------|-------|---------|
| Unit | `npm run test:unit` | ~50 | Core logic, utils |
| Integration | `npm run test:integration` | ~20 | API endpoints, DB |
| Pipeline | `npm run test:pipeline` | ~15 | Full intake pipeline |
| Core30 | `npm run test:parsing:core30` | 1 | 30 golden transcripts |
| QA V1 | `npm run test:qa:v1` | 1 | Zero-OpenAI mode |
| V2 Intake | `npm run test:v2:intake` | ~10 | Intake wizard |
| Gate | `npm run test:gate` | ~5 | Deployment gate checks |

### Smoke Test Scripts

| Script | Purpose |
|--------|---------|
| `scripts/smoke/test-chat-pipeline-prod.ps1` | Chat pipeline (19 assertions) |
| `scripts/smoke/test-phase10-complete-prod.ps1` | Full Phase 10 (42 assertions) |
| `scripts/pre-demo-smoke-tests.ps1` | Pre-demo quick checks |
| `scripts/comprehensive-system-test.ps1` | Full system validation |

### VS Code Tasks

| Task | Trigger | Purpose |
|------|---------|---------|
| Run Health Checks on Startup | Folder open | Auto-health check with auto-fix |
| Critical Path Regression Tests | Manual | Full regression suite |
| Validate Configuration Consistency | Manual | Config validation |
| Start Server and Send Link | Manual | Start + smoke test |
| Monitor Services (Continuous) | Manual (background) | Continuous monitoring |
| Verify Production Deployment | Manual | Production verification |

### Test Coverage Gaps

1. **Frontend**: Only 3 test files for 27 pages -- almost no component tests
2. **E2E**: Playwright specs exist but no evidence of regular CI runs
3. **Provider dashboard**: Smoke-tested but no unit tests for proxy logic
4. **Papi proxy**: No unit tests for the hardened proxy route
5. **Security**: No penetration testing or security-focused test suite
6. **Performance**: `stress-test.ps1` exists but no load testing framework

---

## 10. Environment Configuration

### Backend Required Keys

| Key | Purpose | Default |
|-----|---------|---------|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | JWT signing key | (required) |
| `DATABASE_URL` | PostgreSQL connection | (required) |
| `V1_STABLE` | Production hardening | `true` |
| `ZERO_OPENAI_MODE` | Disable OpenAI | `true` |
| `AI_PROVIDER` | AI backend | `rules` |
| `TRANSCRIPTION_PROVIDER` | Transcription backend | `assemblyai` |
| `FRONTEND_URL` | Frontend origin for CORS | `https://care2connects.org` |
| `ENABLE_V2_INTAKE` | V2 intake endpoints | `false` (must be `true` in prod) |
| `ENABLE_V2_INTAKE_AUTH` | JWT auth on intake | `true` |

### Frontend Required Keys

| Key | Purpose | Value |
|-----|---------|-------|
| `NEXT_PUBLIC_API_URL` | Browser-side API URL | `http://localhost:3001/api` |
| `BACKEND_INTERNAL_URL` | Server-side proxy target (NO /api) | `http://localhost:3001` |
| `NEXT_PUBLIC_FRONTEND_URL` | Canonical domain | `https://care2connects.org` |
| `NEXT_PUBLIC_ENABLE_V2_INTAKE` | Feature flag | `true` |
| `NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN` | Smoke test token | (set) |

### Environment Files

| File | In Git? | Purpose |
|------|---------|---------|
| `backend/.env.example` | Yes | Backend template (212 lines) |
| `backend/.env` | No (gitignored) | Actual backend config |
| `frontend/.env.local.example` | Yes (this branch) | Frontend template |
| `frontend/.env.local` | No (gitignored) | Actual frontend config |

### Configuration Gotcha: .env.example Duplication

`backend/.env.example` contains two blocks of variables -- an upper "V1" block and
a lower "legacy" block that duplicate some keys (`NODE_ENV`, `PORT`, `DATABASE_URL`,
`JWT_SECRET`). This should be cleaned up to avoid confusion.

---

## 11. Git State and Branch Hygiene

### Repository

```
origin  git@github.com:richlegrande-dot/Care2Connect.git
```

### Branch Status

**Unmerged branches (action needed):**

| Branch | Behind Main | Purpose | Action |
|--------|-------------|---------|--------|
| `hardening/deploy-guardrails` | 0 (ahead by 1 commit) | Preflight scripts, proxy hardening | **Merge to main** |
| `hardening/deploy-process` | 0 (ahead by 2 commits) | Earlier hardening iteration (PR #5) | Review/merge or close |
| `fix/ci-unblock-v2-required-checks` | Unknown | CI check fixes | Review/merge or close |

**Merged branches (can be cleaned up):**

| Branch | Merged Into |
|--------|-------------|
| `fix/legacy-ci-debt` | main |
| `fix/v2-wizard-client-crash` | main |
| `phase10/smoke-evidence-prod` | main |
| `phase9b.1/migration-requestid-test-tagging` | main |
| `phase9b.2/rank-scalability` | main |
| `phase9b/harden-post-intake` | main |
| `phase9c/profile-spectrum-roadmap` | main |
| `phase9d/profile-hub-hardening` | main |
| `v2-intake-scaffold` | main |

**Recommendation**: Delete the 9 merged branches (both local and remote) to reduce
clutter. This is safe since they are fully merged into main.

### Commit History (Recent)

```
c5f6dec (hardening/deploy-guardrails) hardening: deploy guardrails
65797a8 (main) fix: provider proxy -- move to /papi/*
229a3fa feat: provider dashboard + V2 intake route fix
9fdb6bc test: add intake ranking test suite + rate limiter test bypass
7991622 chore: Phase 10 manual testing readiness
081c253 fix: resolve legacy CI debt (prettier + test imports)
3b2b029 fix(test): add null guard for name.value
f445deb docs: add extraction engine capability gaps
771a9e1 test(legacy): relax performance timing budgets
4bfd361 test(legacy): hybrid option D -- 11 easy wins + 28 test.todo()
```

---

## 12. Known Issues and Tech Debt

### Critical (Fix Before Manual Testing)

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 1 | Hardening branch not merged | Preflight scripts unavailable on main | `hardening/deploy-guardrails` |
| 2 | `app/api/health/route.ts` is dead code | Shadowed by rewrite -- returns wrong service identity if somehow reached | `frontend/app/api/health/route.ts` |
| 3 | No auto-restart for Caddy/cloudflared | Both can die silently, taking production offline | Infrastructure |
| 4 | Duplicate keys in backend `.env.example` | Confusing for new developers | `backend/.env.example` |

### Medium (Fix Before Production)

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 5 | Frontend has only 3 test files | No regression safety for 27 pages | `frontend/__tests__/` |
| 6 | No CI secret scanning | Committed secrets not detected | CI pipeline |
| 7 | Admin panel uses shared password | No per-user audit trail | `SYSTEM_PANEL_PASSWORD` |
| 8 | 28 `test.todo()` stubs in backend | Untested code paths | Various test files |
| 9 | OpenAI key not configured | Chat uses template responses only | `OPENAI_API_KEY` |
| 10 | AssemblyAI key not configured | Audio transcription untested in smoke | `ASSEMBLYAI_API_KEY` |
| 11 | Stripe keys not configured | Donation pipeline untested | `STRIPE_SECRET_KEY` |

### Low (Tech Debt)

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 12 | 97 scripts in `scripts/` | Many are legacy/duplicate | `scripts/` directory |
| 13 | Multiple `startup-health-check*.ps1` variations | Confusion about which to use | `scripts/` |
| 14 | `ecosystem.config.js` (root) is deprecated | Still present, could be used accidentally | Root |
| 15 | `backend/ecosystem.config.js` uses cluster mode | May conflict with dev config | `backend/` |
| 16 | 72 report files in repo root | Clutters workspace | Root directory |
| 17 | `evtsFirst.ts` has TODO for actual integration | Placeholder code in prod | `backend/src/services/` |
| 18 | `speechIntelligence.ts` hardcodes admin ID | `createdByAdminId: "system"` | `backend/src/routes/admin/` |

### Known Working (Verified 2026-02-21)

All critical paths passed 42/42 assertions in Phase 10 smoke tests:
- Intake form submission and profile generation
- Scoring engine (v1.0.0) and policy pack (v1.0.0)
- Chat pipeline (deterministic mode, DV-safe mode)
- Provider dashboard (auth, sessions, detail, logout)
- Production tunneling (care2connects.org, api.care2connects.org)

---

## 13. Risk Assessment for Manual Testing

### High Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| Port collision (Next.js on 3001) | Backend requests serve frontend HTML | `ports-and-identity.ps1` detects this |
| Caddy/cloudflared crash | Production goes offline silently | Manual monitoring (no auto-restart) |
| Backend restart during demo | papi proxy returns 502/504 | 8s timeout prevents infinite hang |
| New route under `/api/*` | Silently dead code | `check-next-rewrite-shadow.ps1` detects |

### Medium Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| Database connection loss | All data endpoints fail | `/health/db` probe exists |
| PM2 config with bash shim | Silent startup failure | `check-pm2-shims.ps1` detects |
| Missing env vars | Silent misconfiguration | `validate-env.ps1` checks |
| Cookie not relayed by papi | Provider dashboard login fails | Smoke test verifies Set-Cookie relay |

### Low Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| Frontend build failure | TypeScript errors caught | `ignoreBuildErrors: false` |
| Rate limiting too aggressive | Users blocked during demo | `DISABLE_RATE_LIMITING` flag |
| Prisma schema drift | Queries fail | 13 migrations applied, none pending |

---

## 14. Recommended Next Hardening Phase

### Priority 1: Merge Guardrails and Clean Branches

1. Merge `hardening/deploy-guardrails` into main
2. Close/merge `hardening/deploy-process` (PR #5) -- superseded by guardrails
3. Review `fix/ci-unblock-v2-required-checks` -- merge or close
4. Delete 9 merged remote branches

### Priority 2: Auto-Restart for Caddy + Cloudflared

The biggest production risk is silent death of Caddy or cloudflared. Options:
- Add them to PM2 ecosystem config as managed processes
- Create a Windows Service wrapper
- Add a watchdog script that restarts them on health check failure
- The existing `continuous-monitor.ps1` and `watchdog-stack.ps1` may partially
  address this -- audit their current behavior before creating new solutions

### Priority 3: Script Consolidation

The `scripts/` directory has 97+ files with significant overlap:
- 7 variations of `startup-health-check*.ps1`
- Multiple `stop-*.ps1`, `start-*.ps1` scripts
- Many scripts from earlier phases that are now redundant

Recommend:
- Audit all scripts and identify which are still used
- Archive obsolete scripts to `scripts/archive/`
- Update VS Code tasks to reference only canonical scripts

### Priority 4: Frontend Test Coverage

Only 3 test files for 27 pages is a significant gap. Priority targets:
- Provider dashboard (`/provider/dashboard`) -- critical authenticated flow
- V2 intake form (`/onboarding/v2`) -- primary user-facing flow
- Papi proxy route -- needs unit tests for timeout/error handling

### Priority 5: Clean Up Root Directory

72 report files and 17 handoff documents in the repo root create noise.
Recommend moving them to `docs/reports/` and `docs/handoffs/` respectively.

### Priority 6: Backend .env.example Cleanup

The duplicate key blocks in `backend/.env.example` should be consolidated into
a single authoritative section with clear comments.

### Priority 7: Dead Code Removal

- `frontend/app/api/health/route.ts` is shadowed and unreachable -- either
  remove it or move it to `/papi/health` or `/health/frontend`
- Review `ecosystem.config.js` (root, deprecated) and `backend/ecosystem.config.js`
  for removal or archival

---

## Appendix A: All Route Prefixes

### Backend Express Routes (Mounted in server.ts)

```
/                           -> HTML welcome page
/health                     -> healthRoutes, healthDashboardRoutes
/health/live                -> inline liveness probe
/health/db                  -> inline database probe
/ops                        -> opsRoutes
/ops/health                 -> inline production readiness
/admin                      -> adminRoutes, systemAdminRoutes
/admin/ops                  -> opsAdminRoutes
/admin/self-heal            -> selfHealRoutes
/admin/knowledge            -> adminKnowledgeRoutes
/admin/knowledge/audit      -> adminAuditRoutes
/admin/db                   -> adminDbRoutes
/admin/incidents            -> adminIncidentsRoutes
/admin/profiles             -> profilesRoutes
/admin/support              -> supportTicketRoutes
/admin/setup/tunnel         -> tunnelSetupRoutes
/demo                       -> demoRoutes
/metrics                    -> metricsRoutes
/metrics/performance        -> inline handler
/errors                     -> errorReportingRoutes
/api/auth                   -> authRoutes
/api/transcribe             -> transcribeRoutes
/api/transcription          -> transcriptionRoutes
/api/qr                     -> qrDonationRoutes
/api/exports                -> exportRoutes
/api/profile                -> profileRoutes
/api/story                  -> storyRoutes
/api/chat                   -> chatRoutes
/api/jobs                   -> jobRoutes
/api/resources              -> resourceRoutes
/api/donations              -> donationRoutes, manualDraftRoutes
/api/payments               -> stripeWebhookRoutes
/api/test                   -> stripe/db test routes (dev only)
/api/export                 -> exportWordRoutes
/api/analysis               -> analysisRoutes
/api/tickets                -> ticketsRoutes
/api/support                -> supportRoutes
/api/profiles               -> profileSearchRoutes
/api/hardening              -> hardeningMetricsRoutes
/api/v2/intake              -> intakeV2Routes
/api/v2/provider            -> providerRoutes
*                           -> 404 catch-all
```

### Frontend Next.js Routes

```
/                           -> Landing page
/about                      -> About page
/find                       -> Resource finder
/resources                  -> Resource directory
/support                    -> Support page
/health                     -> Health dashboard
/health/live                -> Health route (route.ts)
/tell-story                 -> Story submission
/tell-your-story            -> Story submission (alternate)
/system                     -> System admin
/system/setup-wizard        -> Setup wizard
/gfm/extract                -> GoFundMe extraction
/gfm/review                 -> GoFundMe review
/funding-setup/[clientId]   -> Funding setup
/onboarding/v2              -> V2 Intake Wizard
/donate/[slug]              -> Donation page
/provider/dashboard         -> Provider Dashboard
/provider/login             -> Provider login
/profile/[id]               -> Profile view
/profile/session            -> Session list
/profile/session/[sessionId] -> Session detail
/admin/knowledge            -> Knowledge admin
/admin/knowledge/[sourceId] -> Knowledge source
/admin/knowledge/audit      -> Audit log
/admin/knowledge/audit/[auditId]        -> Audit detail
/admin/knowledge/incidents               -> Incidents
/admin/knowledge/incidents/[incidentId]  -> Incident detail
/papi/[...path]             -> Provider API proxy (route.ts)
/api/health                 -> SHADOWED (dead code)
```

---

## Appendix B: All Prisma Models

| # | Model | Key Fields |
|---|-------|------------|
| 1 | `audio_files` | id, filename, mimeType, size, duration, transcript, transcribed |
| 2 | `donation_drafts` | id, ticketId, title, createdAt |
| 3 | `donations` | id, amount, status |
| 4 | `generated_documents` | id, type, content |
| 5 | `health_check_runs` | id, status, timestamp |
| 6 | `incidents` | id, severity, description |
| 7 | `jobs_cache` | id, jobType, status |
| 8 | `knowledge_audit_logs` | id, action, entityId |
| 9 | `knowledge_bindings` | id, sourceId, chunkId |
| 10 | `knowledge_chunks` | id, content, embedding |
| 11 | `knowledge_sources` | id, name, type |
| 12 | `messages` | id, content, role, sessionId |
| 13 | `model_tuning_profiles` | id, modelName, parameters |
| 14 | `pipeline_incidents` | id, pipelineId, error |
| 15 | `profile_tickets` | id, profileId, ticketId |
| 16 | `profiles` | id, name, score, urgencyLevel |
| 17 | `qr_code_history` | id, code, scannedAt |
| 18 | `qr_code_links` | id, profileId, url |
| 19 | `RecordingTicket` | id, audioFileId, status |
| 20 | `resources` | id, name, type, location |
| 21 | `SpeechAnalysisResult` | id, audioFileId, analysis |
| 22 | `stripe_attributions` | id, donationId, stripeId |
| 23 | `stripe_events` | id, type, payload |
| 24 | `support_tickets` | id, subject, status |
| 25 | `system_incidents` | id, type, resolvedAt |
| 26 | `transcription_error_events` | id, sessionId, error |
| 27 | `transcription_feedback` | id, sessionId, rating |
| 28 | `transcription_segments` | id, sessionId, text, start, end |
| 29 | `transcription_sessions` | id, audioFileId, status |
| 30 | `users` | id, email, role |
| 31 | `AidProgram` | id, name, eligibilityCriteria |
| 32 | `AidEligibilityAssessment` | id, profileId, programId |
| 33 | `ShelterFacility` | id, name, capacity |
| 34 | `ShelterAvailabilityLog` | id, facilityId, available |
| 35 | `V2IntakeSession` | id, status, score, modules |
| 36 | `V2IntakeAuditEvent` | id, sessionId, action |
| 37 | `V2IntakeChatThread` | id, sessionId, mode |
| 38 | `V2IntakeChatMessage` | id, threadId, role, content |

---

## Appendix C: Complete Script Inventory

### Preflight Scripts (This Branch)

| Script | Purpose |
|--------|---------|
| `scripts/preflight/preflight.ps1` | Unified entrypoint (Demo/OpenTesting/LocalDev) |
| `scripts/preflight/run-preflight-demo.ps1` | One-liner: preflight -Mode Demo |
| `scripts/preflight/run-preflight-open-testing.ps1` | One-liner: preflight -Mode OpenTesting |
| `scripts/preflight/validate-env.ps1` | Env var presence check |
| `scripts/preflight/check-pm2-shims.ps1` | PM2 bash shim detection |
| `scripts/preflight/check-next-rewrite-shadow.ps1` | Rewrite shadow detection |
| `scripts/preflight/ports-and-identity.ps1` | Port sweep + identity verification |

### Dev Scripts (This Branch)

| Script | Purpose |
|--------|---------|
| `scripts/dev/stop-clean.ps1` | Kill all services + sweep ports |

### Smoke Test Scripts

| Script | Purpose |
|--------|---------|
| `scripts/smoke/test-chat-pipeline-prod.ps1` | Chat pipeline (19 assertions) |
| `scripts/smoke/test-phase10-complete-prod.ps1` | Full Phase 10 (42 assertions) |

### VS Code Task Scripts

| Script | Task Label |
|--------|------------|
| `scripts/validate-config-consistency.ps1` | Validate Configuration Consistency |
| `scripts/critical-path-regression-tests.ps1` | Critical Path Regression Tests |
| `scripts/startup-health-check.ps1` | Run Health Checks on Startup |
| `scripts/start-server-and-test.ps1` | Start Server and Send Link |
| `scripts/continuous-monitor.ps1` | Monitor Services (Continuous) |
| `scripts/fix-cloudflare-tunnel.ps1` | Fix Cloudflare Tunnel Configuration |
| `scripts/verify-production-deployment.ps1` | Verify Production Deployment |

### Infrastructure Scripts (Selection)

| Script | Purpose |
|--------|---------|
| `scripts/start-all.ps1` | Start all services |
| `scripts/stop-all.ps1` | Stop all services |
| `scripts/restart-all.ps1` | Restart all services |
| `scripts/start-production-stack.ps1` | Start production stack |
| `scripts/stop-production-stack.ps1` | Stop production stack |
| `scripts/start-stack.ps1` | Start stack (generic) |
| `scripts/stop-stack.ps1` | Stop stack (generic) |
| `scripts/dev-up.ps1` | Dev environment up |
| `scripts/dev-down.ps1` | Dev environment down |
| `scripts/prod-start.ps1` | Production start |
| `scripts/prod-verify.ps1` | Production verify |
| `scripts/tunnel-start.ps1` | Start tunnel |
| `scripts/tunnel-status.ps1` | Check tunnel status |
| `scripts/tunnel-monitor.ps1` | Monitor tunnel |
| `scripts/install-caddy.ps1` | Install Caddy |

---

## Appendix D: Handoff and Report Document Index

### Handoff Documents (17)

| File | Date | Topic |
|------|------|-------|
| `AGENT_HANDOFF_PROVIDER_DASHBOARD_PROXY_FIX_2026-02-21.md` | 2026-02-21 | Provider proxy fix (root cause) |
| `AGENT_HANDOFF_TUNNELING_FIXES_2026-01-14.md` | 2026-01-14 | Tunneling fixes |
| `AGENT_HANDOFF_PRODUCTION_FIX_2026-01-14.md` | 2026-01-14 | Production fix |
| `AGENT_HANDOFF_PARSING_HELPER_TECHNICAL_REPORT_2026-01-14.md` | 2026-01-14 | Parsing helper |
| `AGENT_HANDOFF_SMOKE_TESTS_2026-01-11.md` | 2026-01-11 | Smoke tests |
| `AGENT_HANDOFF_TEST_FIXES_2026-01-10.md` | 2026-01-10 | Test fixes |
| `AGENT_HANDOFF_REPORT_2026-01-07.md` | 2026-01-07 | General handoff |
| `AGENT_HANDOFF_JAN_V25_PARSING_EVALUATION_SYSTEM.md` | 2026-01 | Parsing eval |
| `NAVIGATOR_HANDOFF_COMPLETE.md` | Various | Navigator handoff |
| `NAVIGATOR_AGENT_HANDOFF_REPORT.md` | Various | Navigator report |
| `NAVIGATOR_REPORT_DEPLOY_GUARDRAILS.md` | 2026-02-21 | Deploy guardrails |
| `PARSER_PLATEAU_BREAKTHROUGH_HANDOFF.md` | Various | Parsing breakthrough |
| `PRODUCTION_INVARIANTS_HANDOFF_REPORT_2026-01-13.md` | 2026-01-13 | Production invariants |
| `SYSTEM_AGENT_HANDOFF_REPORT_2026-01-07.md` | 2026-01-07 | System agent |
| `SYSTEM_AGENT_HANDOFF_REPORT.md` | Various | System agent |

### Key Reports for Navigator

| File | Relevance |
|------|-----------|
| `docs/PHASE10_MANUAL_TESTING_READINESS_REPORT.md` | Last full smoke test (42/42 PASS) |
| `docs/DEPLOYMENT_RUNBOOK_WINDOWS.md` | Operational runbook (this branch) |
| `docs/GO_LIVE_READINESS_REPORT.md` | Go-live checklist |
| `NAVIGATOR_REPORT_DEPLOY_GUARDRAILS.md` | This branch summary |
| `AGENT_HANDOFF_PROVIDER_DASHBOARD_PROXY_FIX_2026-02-21.md` | Root cause of Feb incident |

---

*Generated: 2026-02-22 | Branch: hardening/deploy-guardrails | Commit: c5f6dec*
