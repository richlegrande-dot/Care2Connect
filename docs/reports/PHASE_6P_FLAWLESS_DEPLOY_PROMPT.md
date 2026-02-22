# Phase 6P: Zero-Friction Production Deployment & Connectivity Hardening

**Target Phase**: Phase 6P - "Flawless Deploy"  
**Date Created**: December 17, 2025  
**Status**: 📋 SPECIFICATION - Ready for Implementation  
**Builds On**: Phase 6M (Production Hardening Complete)  

---

## Title

**Phase 6P: Zero-Friction Production Deployment & Connectivity Hardening (DB + Tunnel + APIs) — "Flawless Deploy"**

---

## Context

We already have Phase 6M hardening in place:

* Prisma hardening (`backend/src/lib/prisma.ts`): retries, timeouts, circuit breaker, slow query logs, graceful shutdown
* Auto-recovery (`backend/src/ops/autoRecoveryService.ts`): detects degraded, rate-limited recovery, recovery stats endpoints
* Monitoring scripts:
  * `scripts/tunnel-monitor.ps1` (restart tunnel)
  * `scripts/hardened-monitor.ps1` (multi-component monitoring + auto-recovery trigger)
* Health endpoints: `/health/live`, `/health/status`, `/health/recover`, `/health/recovery-stats`

**Now we want the next level:** deploying the server and connecting **database + tunnel + OpenAI/Stripe/Cloudflare APIs** should be a *flawless experience* with:

* **one-command start**
* **preflight validation**
* **readiness gates**
* **automatic troubleshooting**
* **automatic rollback / safe shutdown**
* **crystal-clear logs and a deploy report**

No demo mode. Prisma DB must be mandatory.

---

## Objectives

### 1) "Deploy Orchestrator" (One Command)

Create a single command that reliably does:

1. **Preflight** (validate env + ports + dependencies)
2. **DB Gate** (connectivity + schema/migrations)
3. **Start Backend** (readiness gate waits for `/health/db` and `/health/status`)
4. **Start Frontend**
5. **Start/Verify Tunnel** (cloudflared running + external reachability)
6. **Verify external APIs** (OpenAI, Stripe, Cloudflare)
7. Produce a **Deploy Report** (JSON + readable text) saved under `logs/deploy-report-<timestamp>.json`

This replaces manual "start-all + tunnel monitor + health curl checks" with a *single flawless workflow*.

---

## Implementation Plan (Required)

### A) Create a Cross-Platform Deploy Orchestrator (Preferred: Node/TS)

Add:

* `scripts/deploy-orchestrator.ts` (or `backend/src/ops/deployOrchestrator.ts`)
* PowerShell wrapper: `scripts/deploy.ps1` that calls the TS/Node orchestrator
* Optional: `scripts/deploy.cmd` for Windows convenience

**Why Node/TS:** PowerShell-only breaks CI and Linux deployments. Node lets us run the same deploy flow everywhere.

#### A1) Deploy state machine

Implement explicit states:

* `PRECHECK`
* `DB_VALIDATE`
* `MIGRATE_VERIFY`
* `BACKEND_START`
* `BACKEND_READY_GATE`
* `FRONTEND_START`
* `TUNNEL_START_OR_VERIFY`
* `EXTERNAL_VERIFY`
* `SUCCESS`
* `FAILURE_ROLLBACK`

Each state must log structured events and either advance or fail with an actionable error.

#### A2) Preflight checks

Must validate:

* Required env vars present and non-empty:
  * `DATABASE_URL`
  * `STRIPE_SECRET_KEY`
  * `STRIPE_WEBHOOK_SECRET`
  * `OPENAI_API_KEY` (required for fallback reliability)
  * `ADMIN_PASSWORD` (or whatever is used for protected pages)
  * `BASE_URL`
  * Cloudflare tunnel config presence
* Ports are free or processes are controlled:
  * Backend port (current system uses 3001 or 3003—detect from env or config)
  * Frontend 3000
* Disk write access to:
  * `backend/storage/*`
  * `logs/*`
* Prisma client generated check:
  * ensure `npx prisma generate` has been run or run it automatically if missing

#### A3) DB gate + schema verification

Before backend starts, orchestrator must:

* attempt DB connection with retry/backoff
* verify migrations are applied:
  * run `npx prisma migrate deploy` (production-safe) or verify status
* verify required tables exist (lightweight query)
* record DB latency baseline (avg of 3 pings)

If DB fails: orchestrator **must refuse** to continue and output a clear report.

#### A4) Backend readiness gate

Start backend, then **poll**:

* `/health/live` must return `alive`
* `/health/db` must return `ready=true`
* `/health/status` must show required services healthy (define a strict list)

If not ready within timeout, orchestrator should:

* fetch `/health/recovery-stats`
* attempt `POST /health/recover` once (rate-limit respected)
* if still failing → rollback and stop services

#### A5) Tunnel start + external verification gate

Orchestrator must:

* ensure cloudflared process exists or start it (config path known)
* validate external reachability:
  * `https://care2connects.org` returns 200
  * optionally `https://care2connects.org/api/health/live` works if using same-origin proxy
* detect "tunnel running but not routing" vs "process not running"

If tunnel fails:

* restart tunnel once
* re-test
* if still failing → produce actionable guidance + do NOT claim success

#### A6) External APIs verification

Add a strict API verification stage:

* **Stripe:** perform a lightweight API call (not charging) like retrieving account or creating a $0 test session in test mode (choose safe)
* **OpenAI:** lightweight call (models list or small request depending on SDK setup)
* **Cloudflare API (if used):** verify token permissions via existing `/health/cloudflare`

Each API test must:

* return `PASS/FAIL`
* record latency
* record failure reason (401/403/timeout/DNS)

#### A7) Deploy Report Artifact

Output both:

* `logs/deploy-report-<timestamp>.json`
* `logs/deploy-report-<timestamp>.txt`

Include:

* versions (git commit hash, node version)
* start times + durations for each phase
* health snapshots from `/health/status`, `/health/db`
* external checks results
* next steps on failure

---

### B) Backend: Add "Doctor Mode" Diagnostics Endpoint (No Secrets)

Add a backend endpoint:

* `GET /ops/doctor` (admin protected)
* returns a comprehensive diagnostic bundle:
  * dbReady + latency + prisma circuit breaker status + last DB error
  * tunnel expected hostname config + last tunnel check result (if observable)
  * OpenAI/Stripe/Cloudflare connectivity summary (PASS/FAIL + reason)
  * last 20 recovery attempts summary (from recovery history)
  * recommended actions list (human-readable)

**No secrets in output.** Only "configured: true/false" and masked IDs.

Also:

* Add `POST /ops/doctor/run` to actively run the checks (admin protected) and store the results in an "OpsIncident" log table (see C section).

---

### C) Add Persistent Ops Incident Logging (Prisma)

Create new Prisma model(s):

#### `OpsIncident`

Fields:

* id, createdAt
* severity: INFO | WARN | CRITICAL
* category: DB | TUNNEL | API | DEPLOY | OTHER
* summary (string)
* detailsJson (Json)
* resolvedAt (nullable)
* resolutionNotes (nullable)

#### `OpsIncidentEvent`

Fields:

* id, incidentId, createdAt
* eventType: DETECTED | RECOVERY_ATTEMPTED | RECOVERY_SUCCESS | RECOVERY_FAILED | ESCALATED | RESOLVED
* message
* metadataJson

Whenever:

* DB gate fails
* circuit breaker triggers
* autoRecovery triggers and fails repeatedly
* tunnel monitor restarts repeatedly
* deploy orchestrator fails

…create an incident and append events.

This gives "why did deploy fail?" in one place.

---

### D) Replace "Blind Sleeps" with Deterministic Gates Everywhere

Anywhere we currently do `Start-Sleep 90` style logic:

* replace with poll loops and explicit "why waiting" logs
* strict timeouts
* immediate early-exit on unrecoverable errors

---

### E) Make Startup/Shutdown Behavior Truly "Flawless"

#### E1) Process supervision

Add recommended production runner:

* PM2 ecosystem file OR Windows Scheduled Task config OR systemd unit files (depending on platform)
* orchestrator should detect which environment and recommend one

#### E2) Explicit failure policy

If DB not connected:

* backend must shut down (already policy)
* frontend should show "System Offline" (optional UI change; can be separate phase)

#### E3) Automatic safe shutdown on persistent failure

If:

* DB circuit breaker open AND reconnect attempts exhausted
* orchestrator cannot restore readiness

Then:

* graceful shutdown backend
* log incident CRITICAL
* exit with code 1 (so PM2/systemd can restart)

---

### F) Tunnel Monitor + System Monitor Upgrade

Unify or coordinate monitors to prevent "dueling restarts."

Rules:

* Only one component can restart tunnel at a time (lockfile or mutex)
* Rate limits centralized
* Monitor writes should be structured JSON lines
* Add log rotation:
  * keep 7 days
  * max file size threshold

---

## G) Acceptance Criteria

### Deploy success

Running:

* `.\scripts\deploy.ps1` (or `node scripts/deploy-orchestrator.ts`)

Must end with:

* backend ready: `/health/db ready=true`, `/health/status overall healthy`
* tunnel verified: external homepage reachable
* API checks: OpenAI + Stripe pass; Cloudflare pass if configured
* deploy report generated in `logs/`
* no manual steps required

### Deploy failure (DB down)

If DB unreachable:

* deploy stops immediately
* produces deploy report with failure reason + next steps
* creates OpsIncident CRITICAL
* does not start frontend/tunnel unnecessarily

### Deploy failure (tunnel broken)

If tunnel down:

* orchestrator restarts tunnel once
* re-tests
* if still broken: fail deploy with actionable guidance + report

---

## Deliverables

1. **Deploy Orchestrator**:
   - `scripts/deploy-orchestrator.ts` + `scripts/deploy.ps1`
   - Cross-platform support (Node/TS for Linux/macOS/Windows)
   - State machine with explicit phases
   - Structured logging with timestamps

2. **Backend Doctor Endpoints**:
   - `GET /ops/doctor` (comprehensive diagnostics)
   - `POST /ops/doctor/run` (active health checks)
   - Admin-protected, no secrets exposed
   - Human-readable recommendations

3. **Prisma Models**:
   - `OpsIncident` model with severity/category
   - `OpsIncidentEvent` model for incident timeline
   - Migration file for new tables
   - Integration with existing recovery service

4. **Enhanced Monitoring**:
   - Updated logging with JSON lines
   - Log rotation (7 days, size limits)
   - Mutex/lockfile for tunnel restart coordination
   - Centralized rate limiting

5. **Documentation**:
   - `docs/DEPLOYMENT_FLAWLESS_RUNBOOK.md`
   - How deploy orchestrator works
   - Failure modes and troubleshooting
   - Deploy report interpretation
   - Incident model explanation
   - Examples of successful/failed deploys

---

## Notes / Non-Negotiables

* **No demo mode**. DB is mandatory.
* No secrets in logs or doctor output.
* All checks must be deterministic gates, not blind sleeps.
* Must use same-origin API conventions where applicable.
* Deploy must be idempotent (safe to run multiple times).
* All timeouts must be configurable via environment variables.
* Exit codes must be meaningful (0=success, 1=failure, 2=partial).

---

## Integration with Existing Systems

### Phase 6M Components to Leverage

**Prisma Hardening** (`backend/src/lib/prisma.ts`):
- Use existing retry logic
- Integrate with circuit breaker status
- Leverage slow query monitoring

**Auto-Recovery Service** (`backend/src/ops/autoRecoveryService.ts`):
- Call recovery endpoints from orchestrator
- Use recovery stats for deploy reports
- Create incidents for failed recoveries

**Health Endpoints**:
- `/health/live` - liveness check
- `/health/status` - comprehensive status
- `/health/db` - database readiness
- `/health/recover` - trigger recovery
- `/health/recovery-stats` - recovery history

**Monitoring Scripts**:
- Coordinate with `tunnel-monitor.ps1`
- Integrate with `hardened-monitor.ps1`
- Prevent duplicate restart attempts

---

## Success Metrics

### Deployment Reliability

- **First-time Success Rate**: >95% when all dependencies healthy
- **Time to Deploy**: <2 minutes for full stack (excluding npm install)
- **Time to Failure Detection**: <30 seconds for any component failure
- **False Positive Rate**: <1% (must not fail on transient issues)

### Incident Management

- **Incident Detection Rate**: 100% of critical failures logged
- **Incident Resolution Time**: Automated recovery within 5 minutes
- **Manual Intervention Required**: <10% of incidents
- **Incident Report Quality**: All incidents have actionable next steps

### Developer Experience

- **Commands to Deploy**: 1 (down from 5+)
- **Manual Checks Required**: 0 (down from checking 4+ URLs)
- **Troubleshooting Time**: <5 minutes (down from 15-30 minutes)
- **Deploy Confidence**: High (clear success/failure indication)

---

## Future Extensions (Not in Scope)

These are explicitly **out of scope** for Phase 6P but could be future phases:

- **Knowledge Vault Integration**: Store incidents + resolutions as training data
- **Automated Performance Testing**: Load testing during deploy verification
- **Blue-Green Deployments**: Zero-downtime deployment strategy
- **Canary Releases**: Gradual rollout with automatic rollback
- **Multi-Region Support**: Coordinated deployment across regions
- **Slack/Discord Notifications**: Real-time alerts for deploy status
- **Deploy Metrics Dashboard**: Visual timeline of deploy phases

---

## Testing Strategy

### Unit Tests

- Deploy orchestrator state machine transitions
- Preflight validation logic
- Doctor endpoint responses
- Incident model creation and querying

### Integration Tests

- Full deploy flow with mock services
- DB gate with test database
- Tunnel verification with mock endpoints
- API checks with mocked external services

### End-to-End Tests

- Deploy to staging environment
- Simulate DB failure during deploy
- Simulate tunnel failure during deploy
- Verify rollback behavior
- Verify incident creation

### Performance Tests

- Deploy orchestrator overhead
- Doctor endpoint response time
- Incident query performance
- Log file size management

---

## Risk Assessment

### High Risk

- **Deploy orchestrator bugs could block all deployments**
  - Mitigation: Extensive testing, fallback to manual deploy
  
- **Incident logging DB writes could impact performance**
  - Mitigation: Async writes, separate connection pool

### Medium Risk

- **Tunnel restart race conditions**
  - Mitigation: Lockfile/mutex implementation
  
- **Log rotation breaking active monitoring**
  - Mitigation: Atomic log file rotation

### Low Risk

- **Doctor endpoint performance impact**
  - Mitigation: Admin-only, rate limited
  
- **Deploy report storage growth**
  - Mitigation: Automatic cleanup after 30 days

---

## Timeline Estimate

- **Phase 6P Complete**: 3-5 days for full implementation
  - Day 1: Deploy orchestrator core + state machine
  - Day 2: Preflight checks + readiness gates
  - Day 3: Doctor endpoints + incident models
  - Day 4: Monitoring upgrades + log rotation
  - Day 5: Testing + documentation

---

**Status**: Ready for GitHub Agent Implementation  
**Priority**: High (Directly impacts deployment reliability)  
**Complexity**: Medium-High (Cross-cutting changes across deployment flow)  
**Dependencies**: Phase 6M must be complete and stable
