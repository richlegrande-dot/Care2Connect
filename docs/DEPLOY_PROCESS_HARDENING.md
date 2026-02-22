# Deployment Process Hardening Guide

**Project:** care2connects.org  
**Created:** 2026-02-21  
**Branch:** `hardening/deploy-process`  
**Related report:** `AGENT_HANDOFF_PROVIDER_DASHBOARD_PROXY_FIX_2026-02-21.md`

---

## Overview

This document describes the three repeatable deployment hazards discovered during the Feb 2026 provider dashboard deployment, the architectural constraints that cause them, and the guardrails added to prevent recurrence.

---

## 1. Why `/api/*` Rewrites Break `app/api/*` App Router Routes

### What happens

`frontend/next.config.js` contains a blanket rewrite:
```javascript
rewrites: async () => [
  {
    source: "/api/:path*",
    destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
  },
],
```

**Next.js evaluates rewrites before consulting the App Router.** This means:

```
Browser:  GET /api/provider/sessions
  ↓  [next.config.js rewrite fires first]
  →  http://localhost:3001/api/provider/sessions     ← Express backend
  ✗  frontend/app/api/provider/[...path]/route.ts    ← NEVER REACHED
```

Any file at `frontend/app/api/**` is unreachable dead code when this rewrite is active. Creating such a file is a silent failure — no compile error, no runtime error, just zero traffic.

### Why we can't simply narrow the rewrite

The frontend has 9+ routes that call `/api/` paths that are NOT under `/api/v2/`:

| Path | Component |
|---|---|
| `/api/health` | `frontend/app/health/page.tsx` |
| `/api/transcription` | `frontend/components/RecordingInterface.tsx` |
| `/api/support/tickets` | `frontend/components/funding-wizard/HelpModal.tsx` |
| `/api/donations/manual-draft` | `frontend/components/ManualDraftEditor.tsx` |
| `/api/admin/knowledge/*` | `frontend/app/admin/knowledge/` pages |
| `/api/admin/db/*` | `frontend/components/AdminPasswordGate.tsx` |
| `/api/eligibility/*` | `frontend/src/components/EligibilityAssessment.tsx` |

Narrowing the rewrite to `/api/v2/:path*` would break all of the above. The decision is to **keep the blanket rewrite** and enforce the constraint via guard script.

### The approved prefix map

| Prefix | Handler | Description |
|---|---|---|
| `/api/v2/*` | Express backend (via rewrite) | V2 intake, provider auth sessions |
| `/api/*` (non-v2) | Express backend (via rewrite) | Legacy V1 endpoints |
| `/papi/*` | Next.js App Router (`app/papi/[...path]/route.ts`) | Provider dashboard proxy — same-origin cookie relay |
| `app/api/*` | **FORBIDDEN** (unreachable dead code) | Must not be used while blanket rewrite exists |

### Rules

1. **Never place proxy/relay routes under `app/api/`.** Use `/papi/` or another non-conflicting prefix.
2. The guard script `scripts/preflight/check-next-rewrite-conflicts.ps1` enforces this automatically.
3. If you need a new same-origin proxy route, use prefix `/papi/<feature>/` and document it here.

---

## 2. Rogue Orphan Processes on Ports

### What happens

When PM2 crash-loops (see §3 below) or is killed externally, Node.js may leave child processes alive that remain bound to ports. The most dangerous pattern:

```
PM2 starts Next.js dev server
  → Next.js forks start-server.js (child PID)
  → PM2 crashes outer process
  → Child process survives, still bound to port 3001 (or 3000)
  ↓
Backend starts on port 3001
  → OS delivers connections to FIRST registered listener
  → Rogue Next.js child receives backend calls
  → /health/live proxied through Next.js rewrite → backend → response includes "service":"frontend"
  ↓
Provider proxy (/papi/) calls localhost:3001
  → Hits rogue Next.js (not backend)
  → Next.js re-applies /api/:path* rewrite → calls localhost:3001 again
  → Infinite proxy loop → connection timeout → 502
```

### Detection signature

The **only reliable signal** is the health check service identity:

```powershell
$h = Invoke-RestMethod http://localhost:3001/health/live
# GOOD:  $h.service -eq "backend"
# BAD:   $h.service -eq "frontend"  ← a Next.js process is on port 3001
```

### Guardrails

- `scripts/preflight/ports-and-identity.ps1` — detects multiple listeners, verifies `service:"backend"` on port 3001
- `scripts/dev/pm2-stop-clean.ps1` — PM2 delete + port sweep to eliminate orphans on stop
- Run `scripts/preflight/ports-and-identity.ps1 -SweepOnly` before starting services to guarantee clean ports

---

## 3. PM2 Bash Shim Crash Loop on Windows

### What happens

`node_modules/.bin/*` on Windows are Unix bash scripts (`#!/bin/sh`). When passed as an argument to the `node` binary via PM2:

```javascript
// ecosystem config (broken):
script: 'node',
args: ['node_modules/.bin/next', 'dev', '--port', '3000'],
```

Node.js attempts to parse the bash script as JavaScript and throws immediately:
```
SyntaxError: missing ) after argument list
    at wrapSafe (node:internal/modules/cjs/loader:1692:18)
```

PM2 enters a restart loop. On some iterations, Next.js manages to fork a child process before the outer process dies. That child persists → rogue process on port → §2 above.

### Fix

Use the actual JavaScript entry point:

```javascript
// ecosystem config (correct on all platforms):
script: 'node',
args: ['node_modules/next/dist/bin/next', 'dev', '--port', '3000'],
```

To find the correct JS entry for any npm package:
```powershell
(Get-Content node_modules/next/package.json | ConvertFrom-Json).bin
# Returns: @{next = "./dist/bin/next"}
# So the correct path is: node_modules/next/dist/bin/next
```

### Guardrail

`scripts/preflight/check-pm2-windows-shims.ps1` — scans all `ecosystem*.js` for `.bin/` paths. Fails CI if found.

---

## 4. Environment Variable Drift

### What happens

`frontend/.env.local` is gitignored. If a required key is missing, features silently break:

| Missing Key | Symptom |
|---|---|
| `NEXT_PUBLIC_ENABLE_V2_INTAKE` | `/onboarding/v2` silently `router.replace("/")` → homepage |
| `NEXT_PUBLIC_API_URL` | All `/api/*` rewrites target `undefined` → 500 |
| `BACKEND_INTERNAL_URL` | Proxy routes call external Cloudflare URL for internal server-to-server traffic (latency + loopback issue) |
| `PROVIDER_DASHBOARD_TOKEN` | Provider login form has no pre-filled token |

### References

- `frontend/.env.local.example` — committed template with all required keys (placeholders only)
- `backend/.env.example` — committed template for backend env
- `scripts/preflight/validate-env.ps1` — validates required keys present on startup

---

## 5. Provider Proxy (`/papi/*`) Architecture

The `/papi/[...path]` App Router route (`frontend/app/papi/[...path]/route.ts`) is the same-origin cookie relay for the provider dashboard.

### Why `/papi/` not `/api/provider/`

See §1. The blanket `/api/:path*` rewrite intercepts `/api/provider/*` before App Router. `/papi/*` is not matched by the rewrite.

### Proxy request flow

```
Browser: GET https://care2connects.org/papi/sessions?limit=10
  → Caddy → Next.js frontend (port 3000)
  → app/papi/[...path]/route.ts (App Router)
  → fetch http://localhost:3001/api/v2/provider/sessions?limit=10  (BACKEND_INTERNAL_URL)
  → Express backend → session store
  → response + Set-Cookie relayed back to browser
```

### Checklist for adding a new proxy route

If you need to add another same-origin proxy:

- [ ] Place it under `/papi/<feature>/` or a new unique prefix — **never under `/api/`**
- [ ] Include `req.nextUrl.search` in the upstream URL (query string)
- [ ] Forward request body for non-GET methods
- [ ] Forward `cookie` header from browser
- [ ] Use `BACKEND_INTERNAL_URL` (not `NEXT_PUBLIC_API_URL`) for internal server-to-server calls
- [ ] Add `AbortController` with 8s timeout
- [ ] Wrap in try/catch returning JSON `502` (not HTML)
- [ ] Strip `domain=`, `secure`, rewrite `SameSite` from `Set-Cookie` before forwarding
- [ ] Add `X-C2C-Proxy`, `X-C2C-RequestId`, `X-C2C-Upstream` response headers
- [ ] Add `console.log` with method, URL, requestId for every call
- [ ] Document the prefix in the table in §1 of this document

---

## 6. Clean Start Procedure

Run these steps in order before each development session or deployment verification:

```powershell
# Step 1: Validate environment files
pwsh -File scripts/preflight/validate-env.ps1

# Step 2: Check no rewrite/router conflicts in next.config.js
pwsh -File scripts/preflight/check-next-rewrite-conflicts.ps1

# Step 3: Check no Windows .bin shim paths in PM2 configs
pwsh -File scripts/preflight/check-pm2-windows-shims.ps1

# Step 4: Clean stop (kill PM2 apps + port sweep)
pwsh -File scripts/dev/pm2-stop-clean.ps1

# Step 5: Start services
pm2 start ecosystem.dev.config.js

# Step 6: Verify ports and service identity
pwsh -File scripts/preflight/ports-and-identity.ps1 -SkipSweep
```

All steps 1–3 pass in CI. Steps 4–6 are local-only.

---

## 7. Common Failure Signatures and Fixes

| Symptom | Root Cause | Fix |
|---|---|---|
| `/papi/*` returns 500 or times out | Rogue process on port 3001 (wrong service) | Run `ports-and-identity.ps1`, look for `service:"frontend"` on 3001; kill PID and restart backend |
| `/papi/*` returns 500 immediately | Backend down | `GET http://localhost:3001/health/live` — if no response, start backend |
| `PM2 shows error state, restart count rising` | `.bin/` shim in ecosystem config on Windows | Run `check-pm2-windows-shims.ps1`, fix with `node_modules/<pkg>/dist/bin/<entry>` path |
| `/onboarding/v2` immediately redirects to `/` | `NEXT_PUBLIC_ENABLE_V2_INTAKE` not set in `.env.local` | Run `validate-env.ps1`; add key to `frontend/.env.local` and restart frontend |
| Provider login 500 in DevTools | App Router proxy route placed under `app/api/` | Run `check-next-rewrite-conflicts.ps1`; move route to `/papi/` |
| JWT auth fails with "token expired" immediately | `Get-Date -UFormat "%s"` returns local time on Windows | Use `(Get-Date).ToUniversalTime() - [datetime]::UnixEpoch).TotalSeconds` |
| `health/live` returns `service:"frontend"` on port 3001 | Rogue Next.js process bound to 3001 | `netstat -ano \| findstr ":3001.*LISTEN"` → kill rogue PID → verify one PID remains |
| Two PIDs on one port in netstat | Port conflict from crash loop orphan | Run `pm2-stop-clean.ps1` to sweep ports, then restart |

---

## 8. Key Invariants

The following decisions are locked. Do not change without team review:

1. **`/api/:path*` rewrite stays** — too many non-v2 endpoints depend on it. Use `/papi/*` for new proxy routes.
2. **`/papi/`** is the canonical same-origin proxy prefix for provider dashboard. Do not move to `/api/`.
3. **`ecosystem.dev.config.js`** must use `node_modules/next/dist/bin/next` (not `.bin/next`) on Windows.
4. **`BACKEND_INTERNAL_URL`** takes priority over `NEXT_PUBLIC_API_URL` in server-side route handlers.
5. **V2 scoring engine** — do not modify files under `backend/src/intake/v2/scoring/` without running the full regression suite.
6. **`ENABLE_V2_INTAKE_AUTH=true`** — JWT auth must remain enabled on V2 intake endpoints.

---

*Last updated: 2026-02-21 | Branch: hardening/deploy-process*
