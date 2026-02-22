# Care2Connect Deployment Runbook (Windows)

> Last updated: 2026-02-21 | Branch: hardening/deploy-guardrails

## Quick Reference

| Service | Port | Process | Health |
|---------|------|---------|--------|
| Backend (Express) | 3001 | `node --import tsx ./src/server.ts` | `GET /health/live` |
| Frontend (Next.js) | 3000 | `node node_modules/next/dist/bin/next` | `GET /` |
| Caddy (reverse proxy) | 8080 | `caddy run` | `GET :8080/health/live` |
| Cloudflared (tunnel) | -- | `cloudflared tunnel run` | Dashboard at dash.cloudflare.com |

## Start Sequence

### 1. Pre-flight checks

Run all preflight scripts before starting services:

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

# Start both services via PM2
pm2 start ecosystem.dev.config.js    # development
pm2 start ecosystem.prod.config.js   # production
```

### 3. Verify services

```powershell
# Full port sweep + identity verification
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/ports-and-identity.ps1 -SkipSweep
```

Expected output: `READY FOR MANUAL TESTING` with all checks green.

### 4. Start Caddy + Tunnel (production only)

```powershell
caddy start --config Caddyfile.production
cloudflared tunnel run care2connect
```

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

- [ ] `validate-env.ps1` exits 0
- [ ] `check-pm2-shims.ps1` exits 0
- [ ] `check-next-rewrite-shadow.ps1` exits 0
- [ ] `ports-and-identity.ps1 -SkipSweep` exits 0
- [ ] Backend `/health/live` returns `service: "backend"`
- [ ] Frontend index page loads at `http://localhost:3000/`
- [ ] Provider login page loads at `http://localhost:3000/provider/login`
- [ ] `/papi/sessions?limit=1` returns 401 (not timeout, not 502)

---

## Script Reference

| Script | Purpose | Exit Codes |
|--------|---------|------------|
| `scripts/preflight/validate-env.ps1` | Verify .env and .env.local have required keys | 0=pass, 1=missing |
| `scripts/preflight/check-pm2-shims.ps1` | Detect .bin/ bash shim references in PM2 configs | 0=clean, 1=found |
| `scripts/preflight/check-next-rewrite-shadow.ps1` | Find App Router routes shadowed by /api rewrite | 0=clean, 1=found |
| `scripts/preflight/ports-and-identity.ps1` | Port sweep + backend/frontend identity check | 0=ready, 1=failed |
| `scripts/dev/stop-clean.ps1` | Kill all services and sweep ports | 0=clean, 1=stuck |

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
