# Care2Connect Deployment Runbook (Windows)

> Last updated: 2026-02-22 | Branch: hardening/deploy-guardrails

## Before Anything: Run Preflight

Run **one command** before any demo or testing session:

```powershell
# Before a demo
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/run-preflight-demo.ps1

# Before opening the site to testers
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/run-preflight-open-testing.ps1
```

Both commands run the same checks (env vars, PM2 shims, rewrite shadows, port
identity, papi proxy speed). If any check fails: **stop and fix before proceeding**.

### Modes explained

| Mode | When to use | What it checks |
|------|-------------|----------------|
| **Demo** | Before a live demo | All checks including port sweep + backend identity + proxy speed |
| **OpenTesting** | Before leaving the site open for testers | Same as Demo (higher risk = same strictness) |
| **LocalDev** | Routine local development | Env vars + PM2 shims + rewrite shadow only (add `-IncludePorts` for full) |

### Advanced flags

```powershell
# Lightweight local dev check
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/preflight.ps1 -Mode LocalDev

# Skip ports check even in Demo mode (emergency)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/preflight.ps1 -Mode Demo -SkipPorts

# See full output from each sub-script
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/preflight.ps1 -Mode Demo -VerboseOutput
```

---

## Quick Reference

| Service | Port | Process | Health |
|---------|------|---------|--------|
| Backend (Express) | 3001 | `node --import tsx ./src/server.ts` | `GET /health/live` |
| Frontend (Next.js) | 3000 | `node node_modules/next/dist/bin/next` | `GET /` |
| Caddy (reverse proxy) | 8080 | `caddy run` | `GET :8080/health/live` |
| Cloudflared (tunnel) | -- | `cloudflared tunnel run` | Dashboard at dash.cloudflare.com |

## Start Sequence

### 1. Pre-flight checks

The unified preflight command (above) replaces running individual scripts.
You can still run them individually if needed:

```powershell
# From repo root
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/validate-env.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/check-pm2-shims.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/check-next-rewrite-shadow.ps1
```

All must exit 0 before proceeding.

### 2. Clean start (recommended)

```powershell
# Kill leftover processes on target ports
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/dev/stop-clean.ps1

# Start ALL services via PM2 (includes backend, frontend, Caddy, and cloudflared)
pm2 start ecosystem.dev.config.js    # development
pm2 start ecosystem.prod.config.js   # production
```

PM2 now manages Caddy and cloudflared alongside backend/frontend. They auto-restart
on crash with exponential backoff (see ecosystem configs for details).

### 3. Verify services

```powershell
# Full port sweep + identity verification + infrastructure + public endpoints
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/ports-and-identity.ps1 -SkipSweep
```

Expected output: `READY FOR MANUAL TESTING` with all checks green.

### 4. Watchdog (recommended for OpenTesting/Demo sessions)

For sessions where the site is open to external testers or during a demo,
start the watchdog for continuous auto-recovery:

```powershell
# Start in a dedicated terminal (runs continuously)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/ops/watchdog-stack.ps1
```

The watchdog:
- Checks every 12 seconds: backend health, frontend reachability, Caddy port, cloudflared process
- Auto-restarts only the specific failed service via PM2 (not all services)
- Throttles restarts to max 3 per service per 5-minute window
- Logs to `logs/watchdog-stack.log`

**To stop**: Press `Ctrl+C` in the watchdog terminal.

**When NOT to use**: Routine local development where you're frequently stopping/starting services manually.

> **Note**: If you prefer to run Caddy/cloudflared outside PM2 (e.g. for debugging),
> you can start them manually:
> ```powershell
> bin\caddy\caddy.exe run --config Caddyfile.production
> cloudflared tunnel --edge-ip-version 4 run care2connects-tunnel
> ```

---

## The /api Rewrite Problem

### What happens

`next.config.js` contains a blanket rewrite rule:

```javascript
rewrites: async () => [
  { source: "/api/:path*", destination: "${NEXT_PUBLIC_API_URL}/:path*" }
]
```

This sends **every** `/api/*` request to the Express backend (port 3001), **before**
Next.js App Router gets a chance to handle it. Any route file placed under
`frontend/app/api/**` is dead code.

### Why we cannot narrow it

13 frontend components fetch `/api/*` paths (not `/api/v2/*`):
- `/api/health`, `/api/transcription`, `/api/support/tickets`
- `/api/donations/manual-draft`, `/api/admin/knowledge/*`
- `/api/admin/db/*`, `/api/eligibility/*`, `/api/v2/intake/*`

Narrowing the rewrite to `/api/v2/:path*` would break all of these.

### The solution: /papi convention

App Router proxy routes MUST use the `/papi/*` prefix (Provider API):
- `frontend/app/papi/[...path]/route.ts` -- production proxy
- The `check-next-rewrite-shadow.ps1` script guards against future `/api/**` routes

### What to do if you need a new frontend-only API route

1. Place it under `/papi/...` (not `/api/...`)
2. Or add it to the backend Express server under `/api/...`
3. **Never** create `frontend/app/api/*/route.ts` -- it will be silently unreachable

---

## Failure Signatures and Remediation

### Provider dashboard shows "Network Error" or infinite spinner

**Root cause**: Backend is down, or papi proxy cannot reach it.

**Diagnosis**:
```powershell
# Check backend is alive
Invoke-RestMethod http://localhost:3001/health/live
# Expected: { status: "alive", service: "backend", ... }

# Check papi proxy
Invoke-WebRequest http://localhost:3000/papi/sessions?limit=1 -UseBasicParsing
# Expected: 401 (requires auth) -- not a timeout or 502
```

**Fix**: Restart backend via `pm2 restart care2connect-backend-dev`

### /health/live returns service: "frontend" (wrong identity)

**Root cause**: Next.js is listening on port 3001 instead of backend (port collision).

**Diagnosis**:
```powershell
# Check what process owns port 3001
Get-NetTCPConnection -LocalPort 3001 -State Listen |
  Select-Object OwningProcess |
  ForEach-Object { Get-CimInstance Win32_Process -Filter "ProcessId=$($_.OwningProcess)" } |
  Select-Object ProcessId, CommandLine
```

**Fix**:
```powershell
# Kill rogue process, restart backend
scripts/dev/stop-clean.ps1
pm2 start ecosystem.dev.config.js
```

### PM2 starts but Next.js never binds to port

**Root cause**: PM2 ecosystem config uses `.bin/next` (bash shim, fails on Windows).

**Diagnosis**:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/check-pm2-shims.ps1
pm2 logs care2connect-frontend-dev --lines 20
```

**Fix**: Change `script` field to `node_modules/next/dist/bin/next` (not `.bin/next`).

### papi proxy returns 504 (Gateway Timeout)

**Root cause**: Backend took >8s to respond (or is unresponsive).

**Diagnosis**: Check `x-c2c-request-id` header in the 504 response. Search backend
logs for that request ID. Check backend `/health/live`.

**Fix**: Restart backend. If persistent, check for blocked event loop or DB issues.

### App Router route under /api/* not working

**Root cause**: Shadowed by next.config.js rewrite (see above).

**Diagnosis**:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/check-next-rewrite-shadow.ps1
```

**Fix**: Move the route to `/papi/*` or implement it in the Express backend.

---

## Pre-Manual-Testing Checklist

Before any demo, QA session, or production verification:

- [ ] `run-preflight-demo.ps1` (or `run-preflight-open-testing.ps1`) exits 0
- [ ] Backend `/health/live` returns `service: "backend"`
- [ ] Frontend index page loads at `http://localhost:3000/`
- [ ] Provider login page loads at `http://localhost:3000/provider/login`
- [ ] `/papi/sessions?limit=1` returns 401 (not timeout, not 502)
- [ ] Caddy is listening on port 8080
- [ ] cloudflared process is running
- [ ] `https://care2connects.org/onboarding/v2` returns 200
- [ ] `https://care2connects.org/provider/login` returns 200

---

## Script Reference

| Script | Purpose | Exit Codes |
|--------|---------|------------|
| `scripts/preflight/preflight.ps1` | **Unified entrypoint** -- orchestrates all checks | 0=pass, 1=fail |
| `scripts/preflight/run-preflight-demo.ps1` | One-liner wrapper: preflight -Mode Demo | 0=pass, 1=fail |
| `scripts/preflight/run-preflight-open-testing.ps1` | One-liner wrapper: preflight -Mode OpenTesting | 0=pass, 1=fail |
| `scripts/preflight/validate-env.ps1` | Verify .env and .env.local have required keys | 0=pass, 1=missing |
| `scripts/preflight/check-pm2-shims.ps1` | Detect .bin/ bash shim references in PM2 configs | 0=clean, 1=found |
| `scripts/preflight/check-next-rewrite-shadow.ps1` | Find App Router routes shadowed by /api rewrite | 0=clean, 1=found |
| `scripts/preflight/ports-and-identity.ps1` | Port sweep + identity + infra + public endpoints | 0=ready, 1=failed |
| `scripts/ops/watchdog-stack.ps1` | Continuous auto-recovery watchdog (12s interval) | Runs until Ctrl+C |
| `scripts/ops/pm2-enable-startup.ps1` | Register PM2 resurrect as Windows Scheduled Task (run once) | 0=ok, 1=fail |
| `scripts/dev/stop-clean.ps1` | Kill all services and sweep ports | 0=clean, 1=stuck |
| `scripts/preflight/run-gate-demo.ps1` | One-command gate: preflight Demo + smoke suite | 0=ready, 1=fail |
| `scripts/preflight/run-gate-open-testing.ps1` | One-command gate: pm2 start + preflight OpenTesting + phase10 smoke | 0=ready, 1=fail |

---

## PM2 Startup Persistence

To make PM2-managed services survive a Windows reboot, run this **once** after the stack is healthy:

```powershell
.\scripts\ops\pm2-enable-startup.ps1
```

This will:
1. Run `pm2 save` to persist the current process list (`~/.pm2/dump.pm2`).
2. Create a Windows Scheduled Task named `PM2-Resurrect` that calls `pm2 resurrect` at user logon.

### Reboot checklist

After a reboot:

| Step | Command | Expected result |
|------|---------|------------------|
| 1 | _(log in)_ | Task Scheduler runs `pm2 resurrect` automatically |
| 2 | `pm2 list` | All 4 processes show `status=online` |
| 3 | `pm2 logs --lines 20` | No startup errors |
| 4 | `.\scripts\preflight\run-gate-open-testing.ps1` | Exits 0, READY banner shown |

### Verify the task exists

```powershell
Get-ScheduledTask -TaskName "PM2-Resurrect" | Select-Object TaskName, State
```

### Remove the task

```powershell
Unregister-ScheduledTask -TaskName "PM2-Resurrect" -Confirm:$false
```

---

## Environment Variables

### Backend (`backend/.env`)
See `backend/.env.example` for the full template. Critical keys:
- `PORT=3001` -- must match PM2 config
- `JWT_SECRET` -- required for auth
- `DATABASE_URL` -- required for DB access

### Frontend (`frontend/.env.local`)
See `frontend/.env.local.example` for the full template. Critical keys:
- `NEXT_PUBLIC_API_URL=http://localhost:3001/api` -- browser-side API URL
- `BACKEND_INTERNAL_URL=http://localhost:3001` -- server-side proxy target (NO /api suffix)
- `NEXT_PUBLIC_FRONTEND_URL=https://care2connects.org` -- canonical domain
