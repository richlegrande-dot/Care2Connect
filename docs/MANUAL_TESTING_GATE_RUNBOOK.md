# Manual Testing Gate Runbook
# Care2Connect — Post Phase 11.x

**Date:** 2026-02-22
**Repo:** richlegrande-dot/Care2Connect
**Prepared by:** Copilot Agent (Phase 11 + Report Hygiene sessions)

---

## CURRENT STATE AT HANDOFF

| Item | Status |
|------|--------|
| PR #6 — Phase 11: Uptime + Footgun Removal | **MERGED** to main (`3d81b05`) |
| PR #7 — Phase 11.1: Preflight Gate + Uptime Proof | **MERGED** to main (`ae15971`) |
| PR #8 — Phase 11.2: Final Preflight Hardening | **MERGED** to main (`78d9b4f`) |
| PR #9 — Phase 11.3: Preflight Operationalization | **MERGED** to main (`192b6ba`) |
| PR #10 — Report hygiene + guardrails | **OPEN** — merge before manual testing |
| `main` HEAD (post PR #9) | `192b6ba` |
| Archive branch | `reports-archive/2026-02-22` — all old reports preserved |

---

## STEP 1 — Merge PR #10 (required before manual testing)

[PR #10](https://github.com/richlegrande-dot/Care2Connect/pull/10) —
`chore: purge assistant reports from main + add report hygiene guardrails`

**What it does:**
- Removes 342 AI-generated report/handoff files from main
- Adds `.gitignore` guardrails blocking future report commits
- Adds `.dockerignore` to exclude docs from Docker build context
- Adds `scripts/ci/check-no-reports.ps1` CI guard
- Adds `docs/REPORTS_POLICY.md`
- Keeps: `DEPLOYMENT_RUNBOOK_WINDOWS.md`, `GO_LIVE_READINESS_REPORT.md`,
  `PHASE10_MANUAL_TESTING_READINESS_REPORT.md`, `PHASE11_COMPLETION_REPORT_2026-02-22.md`
  and all V2 planning/spec/runbook docs.

**Merge command:**
```powershell
gh pr merge 10 --merge --admin
git checkout main
git pull origin main
```

**Sanity checks after merge:**
```powershell
Test-Path "scripts/ci/check-no-reports.ps1"         # True
Test-Path ".dockerignore"                            # True
Test-Path "docs/REPORTS_POLICY.md"                  # True
Test-Path "docs/DEPLOYMENT_RUNBOOK_WINDOWS.md"      # True
Test-Path "docs/PHASE11_COMPLETION_REPORT_2026-02-22.md"  # True
Test-Path "docs/reports"                             # False (deleted)
Test-Path "docs/handoffs"                            # False (deleted)
# Run CI guard (should pass clean):
.\scripts\ci\check-no-reports.ps1 -Mode tree
```

---

## STEP 2 — Production Machine: Start the Stack

```powershell
pm2 start ecosystem.prod.config.js
pm2 list   # should show 4 apps: backend-prod, frontend-prod, caddy, tunnel
```

Expected apps:
| PM2 App Name | Port | Service |
|-------------|------|---------|
| careconnect-backend-prod | 3001 | Express API |
| careconnect-frontend-prod | 3000 | Next.js |
| care2connect-caddy | 8080 | Caddy reverse proxy |
| care2connect-tunnel | — | Cloudflare tunnel |

If any app is errored: `pm2 logs <app-name> --lines 50` to diagnose.

---

## STEP 3 — Run Preflight Gates (both must PASS before opening testing)

### Gate A — Demo via Caddy host routing
```powershell
.\scripts\preflight\start-preflight.ps1 -Mode Demo -UseCaddy -VerboseOutput
```

Verifies:
- All 12 preflight steps pass (baseline, env, PM2, ports, DB, Caddy host routing)
- `logs/preflight/preflight_<RunId>.log` written
- `logs/preflight/LAST_GOOD_Demo.txt` written on PASS

### Gate B — OpenTesting via public domains
```powershell
.\scripts\preflight\start-preflight.ps1 -Mode OpenTesting -UsePublic -IncludeUptimeDrill -NonDisruptiveUptimeDrill
```

Verifies:
- Public domain reachability: `https://care2connects.org`, `https://api.care2connects.org`
- Rate-limit bypass safety check (Step 10)
- Non-disruptive uptime drill (Step 11)
- `logs/preflight/LAST_GOOD_OpenTesting.txt` written on PASS

### Confirm stamp before opening
```powershell
Get-Content logs\preflight\LAST_GOOD_OpenTesting.txt
# Should show: RunId, timestamp, mode=OpenTesting, pass counts
```

---

## STEP 4 — Manual Testing Start Condition

**Only proceed when ALL of the following are true:**

- [ ] PR #10 merged to main
- [ ] `pm2 list` shows 4 apps **online**
- [ ] `start-preflight.ps1 -Mode Demo -UseCaddy` exits 0
- [ ] `start-preflight.ps1 -Mode OpenTesting -UsePublic` exits 0
- [ ] `logs/preflight/LAST_GOOD_OpenTesting.txt` exists and timestamp is current

---

## STEP 5 — If Preflight Fails

**Do NOT open to testers.** Capture and fix:

```powershell
# Get the RunId from the LAST run
$runId = (Get-ChildItem logs\preflight\preflight_*.log | Sort-Object LastWriteTime -Desc | Select-Object -First 1).BaseName
Write-Host "RunId: $runId"

# Read the log
Get-Content "logs\preflight\$runId.log" | Select-String "\[FAIL\]"
```

Fix only what the failing step indicates, then rerun preflight in the same mode until green.

---

## PREFLIGHT ORCHESTRATOR REFERENCE (12 Steps)

| Step | Name | Flag / Mode Gate |
|------|------|-----------------|
| 0 | Phase 11 Baseline Assertion | All modes |
| 1 | Environment Variables | All modes |
| 2 | PM2 Shim Check | All modes |
| 3 | Rewrite Shadow Guard | All modes |
| 4 | Port Collision Proof | All modes |
| 5 | Database Connectivity | All modes |
| 6 | Port Identity + Proxy | All modes |
| 7 | Provider Auth | All modes |
| 8 | Chat Backend Check | All modes |
| 9 | Caddy / Public Check | `-UseCaddy` or `-UsePublic` only |
| 10 | Rate-Limit Bypass Safety | OpenTesting mode only |
| 11 | Uptime Drill | All modes (`-NonDisruptiveUptimeDrill` for live sessions) |

**Notes:**
- Step 3 prints a `[WARN]` about the `/api/:path*` rewrite — this is expected and non-failing. The step exits 0 unless `frontend/app/api/` contains actual `route.ts` files (it does not on clean main).
- `logs/` is gitignored. Log files never enter the repo.
- `-SkipPreflight` is available on `start-stack.ps1` and `start-server-and-test.ps1` as an escape hatch (not recommended).

---

## REPORT HYGIENE GUARDRAILS (ongoing)

AI-generated session reports must NOT be committed to `main`.

### gitignore blocks (automatic)
```
docs/reports/
docs/handoffs/
**/AGENT_HANDOFF_*.md
**/NAVIGATOR_HANDOFF_*.md
**/SYSTEM_STATE_REPORT*.md
**/PHASE*_COMPLETION_REPORT_*.md
```

### CI guard (run before pushing)
```powershell
# Check staged files before commit
.\scripts\ci\check-no-reports.ps1

# Audit full tree
.\scripts\ci\check-no-reports.ps1 -Mode tree
```
Exit 0 = clean. Exit 1 = blocked files found (listed with paths).

### Where reports go instead
| Location | When to use |
|----------|------------|
| `reports-archive/*` branch | Preserve a full session without touching main |
| PR description | Attach session summary to the PR it relates to |
| GitHub issue | Track decisions / investigations |

Current archive: **`reports-archive/2026-02-22`** — contains all pre-cleanup reports and handoffs.

Full policy: [docs/REPORTS_POLICY.md](REPORTS_POLICY.md)

---

## STACK ARCHITECTURE REFERENCE

| Service | Port | Domain |
|---------|------|--------|
| Next.js 14 frontend | 3000 | `care2connects.org` |
| Express 4.18 backend | 3001 | `api.care2connects.org` |
| Caddy reverse proxy | 8080 | routes by Host header |
| Cloudflare tunnel | — | exposes Caddy to internet |

**Rate limiting:** 100 req/15min, bypass via `x-c2c-test: 1` header (blocked in OpenTesting via Step 10).
**Hardening endpoint:** `GET /api/hardening/security` reports live rate-limit config.
