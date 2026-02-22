# Navigator Agent Handoff — Phase 11 Series Complete

**Date:** 2026-02-22  
**Repo:** [richlegrande-dot/Care2Connect](https://github.com/richlegrande-dot/Care2Connect)  
**Status:** All Phase 11.x deliverables complete — 4 PRs open, ready to merge in order  

---

## Merge Order (Sequential — Do Not Skip)

```
PR #6  →  PR #7  →  PR #8  →  PR #9  →  main
```

| PR | Title | Branch | Commit | Report |
|----|-------|--------|--------|--------|
| [#6](https://github.com/richlegrande-dot/Care2Connect/pull/6) | Phase 11: Uptime + Footgun Removal Hardening | `hardening/phase11-uptime-footgun-removal` | `834688b` + `cf3dd2a` | [PHASE11_COMPLETION_REPORT_2026-02-22.md](PHASE11_COMPLETION_REPORT_2026-02-22.md) |
| [#7](https://github.com/richlegrande-dot/Care2Connect/pull/7) | Phase 11.1: Preflight Gate + Uptime Proof + Provider Auth Check | `hardening/phase11.1-preflight-gate-uptime-proof` | `bbeb0a3` | [PHASE11.1_COMPLETION_REPORT_2026-02-22.md](PHASE11.1_COMPLETION_REPORT_2026-02-22.md) |
| [#8](https://github.com/richlegrande-dot/Care2Connect/pull/8) | Phase 11.2: Final Preflight Hardening (7 deliverables) | `hardening/phase11.2-final-preflight-hardening` | `452f583` | [PHASE11.2_COMPLETION_REPORT_2026-02-22.md](PHASE11.2_COMPLETION_REPORT_2026-02-22.md) |
| [#9](https://github.com/richlegrande-dot/Care2Connect/pull/9) | Phase 11.3: Preflight Operationalization | `hardening/phase11.3-preflight-operationalization` | `bfe05be` | [PHASE11.3_COMPLETION_REPORT_2026-02-22.md](PHASE11.3_COMPLETION_REPORT_2026-02-22.md) |

---

## What Was Built

### Phase 11 — Uptime, Footgun Removal & Repo Hygiene
**PR #6 · Commits `834688b` + `cf3dd2a`**

| Deliverable | Detail |
|-------------|--------|
| A — Branch hygiene | Merged `hardening/deploy-guardrails` → `main`, deleted 15 stale branches, closed PR #5 |
| B — PM2 for Caddy + cloudflared | Both now PM2-managed with restartDelay and auto-restart |
| C — Watchdog replacement | New `watchdog-stack.ps1` (PM2-based, throttled), retired 268-line legacy script |
| D — Dead code removal | Deleted `frontend/app/api/health/route.ts` (shadowed by `/api/:path*` rewrite) |
| E — Preflight enhancement | Added Caddy, cloudflared, public endpoint checks; 17 papi proxy regression tests (all pass) |
| Repo hygiene | 360+ files moved to `archive/`, `docs/`, `scripts/`; root cleaned to 20 files |

---

### Phase 11.1 — Preflight Gate + Uptime Proof
**PR #7 · Commit `bbeb0a3`**

| Deliverable | Detail |
|-------------|--------|
| Canonical `start-preflight.ps1` | 7-step orchestrator replacing `preflight.ps1`; `-Mode` flag (LocalDev/Demo/OpenTesting) |
| `uptime-drill.ps1` | Non-destructive HTTP uptime probe with pass/fail thresholds |
| `provider-auth-check.ps1` | Validates provider API token (backend `.env` first, then frontend `.env.local`) |
| `port-collision-check.ps1` | Verifies frontend (3000), backend (3001), Caddy (8080) are all live |
| Watchdog `-Once` / `-DryRun` | Watchdog can run as a one-shot health check or dry-run |
| Domain default fix | Fixed incorrect domain fallback in preflight config |

**Preflight steps after 11.1:** Steps 1–7 (env, PM2, rewrite, port, provider auth, uptime)

---

### Phase 11.2 — Final Preflight Hardening
**PR #8 · Commit `452f583`**

| Deliverable | Detail |
|-------------|--------|
| D1 — Step 0 Baseline Gate | `assert-phase11-baseline.ps1` — verifies watchdog, PM2 app count, papi prefix before anything else runs |
| D2 — DB Connectivity | `db-connectivity-check.ps1` — probes backend `/health/live`, prints no secrets |
| D3 — Chat Backend Check | `chat-backend-check.ps1` — confirms chat API endpoint responds |
| D4 — Provider token hardening | Validates token format/length; fails fast on obvious placeholder values |
| D5 — Non-disruptive uptime mode | `uptime-drill.ps1 -NonDisruptive` — safe for live open-testing sessions |
| D6 — RunId + log file | Every preflight run gets a unique ID; full output tee'd to `logs/preflight/preflight_<RunId>.log` |
| D7 — Domain default fix | Corrected domain resolution for multi-mode orchestrator |

**Preflight steps after 11.2:** Steps 0–9 (baseline, env, PM2, rewrite, port, db, port-identity, provider auth, chat backend, uptime)

---

### Phase 11.3 — Preflight Operationalization (Final Gate Before Manual Testing)
**PR #9 · Commit `bfe05be`**

| Deliverable | Detail |
|-------------|--------|
| D1 — Log retention | `-RetentionDays` param (default 7); auto-prunes `logs/preflight/preflight_*.log`; never deletes today's log |
| D2 — `-UseCaddy` mode | `caddy-public-check.ps1` (new) — checks `localhost:8080` with Host headers (`care2connects.org`, `api.care2connects.org`) |
| D3 — `-UsePublic` mode | Same script — probes live `https://care2connects.org/*` and `https://api.care2connects.org/*` |
| D4 — Enforce preflight in start scripts | `start-stack.ps1` and `start-server-and-test.ps1` both call preflight before startup; abort if non-zero; `-SkipPreflight` escape hatch; 2 VS Code tasks added |
| D5 — Rate-limit bypass safety | `rate-limit-bypass-check.ps1` (new, OpenTesting only) — verifies rate limiting enabled, scans env for dangerous bypass flags; values never printed |
| D6 — Manual Testing Ready stamp | On PASS: writes `logs/preflight/LAST_GOOD_<Mode>.txt` with RunId, timestamp, mode, pass counts |

**Preflight steps after 11.3:** Steps 0–11 (adds Caddy/public probe at step 9, rate-limit safety at step 10, uptime drill renumbered to step 11)

---

## Final Preflight Orchestrator — 12-Step Map

| Step | Name | Script | Mode Gate |
|------|------|--------|-----------|
| 0 | Phase 11 Baseline Assertion | `assert-phase11-baseline.ps1` | All modes |
| 1 | Environment Variables | `env-check.ps1` | All modes |
| 2 | PM2 Shim Check | `pm2-shim-check.ps1` | All modes |
| 3 | Rewrite Shadow Guard | `check-next-rewrite-shadow.ps1` | All modes |
| 4 | Port Collision Proof | `port-collision-check.ps1` | All modes |
| 5 | Database Connectivity | `db-connectivity-check.ps1` | All modes |
| 6 | Port Identity + Proxy | `ports-and-identity.ps1` | All modes |
| 7 | Provider Auth | `provider-auth-check.ps1` | All modes |
| 8 | Chat Backend Check | `chat-backend-check.ps1` | All modes |
| 9 | Caddy / Public Check | `caddy-public-check.ps1` | `-UseCaddy` or `-UsePublic` only |
| 10 | Rate-Limit Bypass Safety | `rate-limit-bypass-check.ps1` | OpenTesting only |
| 11 | Uptime Drill | `uptime-drill.ps1` | All modes (non-disruptive flag available) |

---

## Files Delivered Across Phase 11 Series

### New scripts (created from scratch)

| File | Phase | Purpose |
|------|-------|---------|
| `scripts/preflight/start-preflight.ps1` | 11.1 | Canonical 12-step orchestrator |
| `scripts/preflight/uptime-drill.ps1` | 11.1 | Non-destructive uptime probe |
| `scripts/preflight/provider-auth-check.ps1` | 11.1 | Provider token validation |
| `scripts/preflight/port-collision-check.ps1` | 11.1 | Port liveness check |
| `scripts/preflight/assert-phase11-baseline.ps1` | 11.2 | Baseline gate (Step 0) |
| `scripts/preflight/db-connectivity-check.ps1` | 11.2 | Database connectivity proof |
| `scripts/preflight/chat-backend-check.ps1` | 11.2 | Chat backend health probe |
| `scripts/preflight/caddy-public-check.ps1` | 11.3 | Caddy host-routing + public domain probes |
| `scripts/preflight/rate-limit-bypass-check.ps1` | 11.3 | Rate-limit bypass safety (OpenTesting) |
| `scripts/ops/watchdog-stack.ps1` | 11 | PM2-based watchdog with throttling |

### Modified scripts

| File | Phase | Key Change |
|------|-------|------------|
| `scripts/start-stack.ps1` | 11.3 | Preflight gate enforced; `-SkipPreflight` escape |
| `scripts/start-server-and-test.ps1` | 11.3 | Preflight gate enforced; `-SkipPreflight` escape |
| `ecosystem.prod.config.js` | 11 | Caddy + cloudflared added as PM2-managed apps |
| `.vscode/tasks.json` | 11.3 | +2 tasks: Preflight Gate (Demo), Preflight Gate (OpenTesting) |
| `backend/.env.example` | 11 | Removed duplicate keys |

---

## How to Use After Merging

### Standard startup (preflight runs automatically)

```powershell
pm2 start ecosystem.prod.config.js
# preflight now runs automatically inside start-stack.ps1
.\scripts\start-stack.ps1
```

### Manual preflight invocations

```powershell
# Demo mode (standard)
.\scripts\preflight\start-preflight.ps1 -Mode Demo -VerboseOutput

# Demo + Caddy host-routing verification
.\scripts\preflight\start-preflight.ps1 -Mode Demo -UseCaddy -VerboseOutput

# Open testing + public domain probes + uptime drill
.\scripts\preflight\start-preflight.ps1 -Mode OpenTesting -UsePublic -IncludeUptimeDrill -NonDisruptiveUptimeDrill

# Custom log retention (30 days)
.\scripts\preflight\start-preflight.ps1 -Mode Demo -RetentionDays 30
```

### Check stamp before opening for manual testing

```powershell
Get-Content logs\preflight\LAST_GOOD_OpenTesting.txt
# Shows: RunId, timestamp, mode, pass counts
```

### VS Code tasks

- **Run Preflight Gate (Demo)** — quick pre-demo gate
- **Run Preflight Gate (OpenTesting)** — full gate before opening to users

---

## Rewrite Shadow Guard Note

The step 3 check prints a `[WARN]` about the `/api/:path*` rewrite in `next.config.js`. This is **expected and non-failing**. The script only exits 1 if actual `route.ts` files exist under `frontend/app/api/` — that directory does not exist on clean `main`. The WARN is documentation of a known config decision (proxy routes live under `/papi/`).

---

## Stack Architecture (for reference)

| Service | Port | PM2 App Name |
|---------|------|-------------|
| Next.js 14 frontend | 3000 | `careconnect-frontend-prod` |
| Express 4.18 backend | 3001 | `careconnect-backend-prod` |
| Caddy reverse proxy | 8080 | `care2connect-caddy` |
| Cloudflare tunnel | — | `care2connect-tunnel` |

**Caddy host routing:**
- `care2connects.org` → `127.0.0.1:3000`
- `api.care2connects.org` → `127.0.0.1:3001`

**Rate limiting:** `express-rate-limit`, 100 req/15min. Endpoint `/api/hardening/security` reports live config.

---

## Next Steps for Incoming Navigator Agent

1. **Merge PRs #6 → #7 → #8 → #9** into `main` in order
2. On the production machine: `pm2 start ecosystem.prod.config.js`
3. Run `.\scripts\preflight\start-preflight.ps1 -Mode Demo -UseCaddy` — should be all green
4. If Cloudflare tunnel is live, run `.\scripts\preflight\start-preflight.ps1 -Mode OpenTesting -UsePublic`
5. Confirm `logs\preflight\LAST_GOOD_OpenTesting.txt` is written
6. **Manual testing can begin**
