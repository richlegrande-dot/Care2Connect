# Manual Testing Gate Runbook

> **Scope**: Operator guide for the three preflight gates used before demos, QA sessions, and production verification. Each gate is a single PowerShell command that exits 0 (green) or non-zero (red) with a clear failure context.

---

## Quick Reference

| Gate | When to use | Command |
|------|-------------|---------|
| **Gate A -- Demo** | Before any stakeholder demo or recorded session | `.\scripts\preflight\run-gate-demo.ps1` |
| **Gate B -- Open Testing** | Before opening to QA testers / external session | `.\scripts\preflight\run-gate-open-testing.ps1` |
| **Gate C -- Phase 10 Smoke** | Standalone smoke verification (no preflight) | `.\scripts\smoke\test-phase10-complete-prod.ps1` |

All three gates produce a `READY` banner on success and a `RUN ID + log path + first FAIL lines` summary on failure.

---

## Gate A -- Demo

**Purpose**: Verify stack is stable for a demo session. Runs preflight in Demo mode (local + Caddy checks) then the smoke suite.

**Command**:
```powershell
.\scripts\preflight\run-gate-demo.ps1
```

**What it checks** (2 stages):

| Stage | Script | Checks |
|-------|--------|--------|
| 1 | `start-preflight.ps1 -Mode Demo -UseCaddy` | Port sweep, identity, env vars, DB, PM2, Caddy routing |
| 2 | `test-phase10-complete-prod.ps1` | Full Phase 10 smoke suite against production URLs |

**Success output**:
```
============================================================
  GATE A (Demo) -- READY
  LAST_GOOD_Demo: 2026-02-22 14:05:11
============================================================
```

**Failure output**:
```
[GATE FAILED] Stage 1 -- preflight (Demo) exited 3
  Run-ID : 20260222-140511
  Log    : logs\preflight\preflight_20260222-140511.log
  [FAIL] ...first few FAIL lines from the log...
```

---

## Gate B -- Open Testing

**Purpose**: Full confidence check before opening a session to external testers. Starts PM2 (idempotent), runs OpenTesting preflight (including uptime drill against public hostname), then the smoke suite.

**Command**:
```powershell
.\scripts\preflight\run-gate-open-testing.ps1
```

**Skip PM2 start** (services already running):
```powershell
.\scripts\preflight\run-gate-open-testing.ps1 -SkipPm2Start
```

**What it checks** (3 stages):

| Stage | Script | Checks |
|-------|--------|--------|
| 1 | `pm2 start ecosystem.prod.config.js` | Idempotent start (no-op if already running) |
| 2 | `start-preflight.ps1 -Mode OpenTesting -UsePublic -IncludeUptimeDrill -NonDisruptiveUptimeDrill` | All 12 preflight steps + public hostname + non-disruptive uptime drill |
| 3 | `test-phase10-complete-prod.ps1` | Full Phase 10 smoke suite |

The OpenTesting preflight includes **Step 9 (`caddy-public-check.ps1 -UsePublic`)** which now verifies:

| URL | Assertion |
|-----|-----------|
| `GET https://api.care2connects.org/health/live` | HTTP 200, JSON `service=="backend"` |
| `GET https://api.care2connects.org/api/v2/intake/health` | HTTP 200, JSON `status=="healthy"`, `database=="connected"` |
| `GET https://api.care2connects.org/api/v2/provider/sessions` | HTTP 401 (no cookie -- auth guard active) |

---

## Gate C -- Phase 10 Smoke

**Purpose**: Lightweight post-deploy check or standalone verification; runs only the smoke test suite (no preflight).

**Command**:
```powershell
.\scripts\smoke\test-phase10-complete-prod.ps1
```

Use this when preflight has already passed and you only need a quick functional re-check.

---

## -SkipPreflight Hardening (Phase 11.4)

As of Phase 11.4, bypassing the preflight gate requires **explicit authorization**.

### Affected scripts

- `scripts\start-stack.ps1`
- `scripts\start-server-and-test.ps1`

### Override methods

| Method | How |
|--------|-----|
| Environment variable | Set `$env:ALLOW_SKIP_PREFLIGHT = 'true'` before running |
| Flag | Pass `-ForceSkipPreflight` on the command line |

If `-SkipPreflight` is passed without one of the above, the script **aborts with exit 1**.

Every authorized skip is logged to `logs\preflight\skip_preflight.log`:
```
2026-02-22 14:30:00 PREFLIGHT SKIPPED -- user=richl script=start-stack.ps1 force=True env=
```

### Examples

```powershell
# Authorized via env var (CI/CD pipeline)
$env:ALLOW_SKIP_PREFLIGHT = 'true'
.\scripts\start-stack.ps1 -SkipPreflight

# Authorized via explicit flag (local emergency)
.\scripts\start-stack.ps1 -SkipPreflight -ForceSkipPreflight

# Will ABORT (no authorization)
.\scripts\start-stack.ps1 -SkipPreflight
```

---

## Operator Script Table

| Script | Purpose | PS version |
|--------|---------|------------|
| `scripts/preflight/run-gate-demo.ps1` | Gate A -- Demo (2-stage) | 5.1+ |
| `scripts/preflight/run-gate-open-testing.ps1` | Gate B -- Open Testing (3-stage) | 5.1+ |
| `scripts/smoke/test-phase10-complete-prod.ps1` | Gate C -- Phase 10 smoke | 5.1+ |
| `scripts/preflight/start-preflight.ps1` | Preflight orchestrator (12 steps) | 5.1+ |
| `scripts/preflight/caddy-public-check.ps1` | Step 9: Caddy + public API hostname checks | 5.1+ |
| `scripts/ops/pm2-enable-startup.ps1` | Register PM2 resurrect as Windows Task Scheduler job | 5.1+ |
| `scripts/start-stack.ps1` | Atomic stack start (preflight -> pm2 -> validation) | 5.1+ |
| `scripts/start-server-and-test.ps1` | Full server start + comprehensive tests | 5.1+ |

---

## Pre-Session Checklist

Before any demo, QA session, or production verification:

- [ ] Run the appropriate gate and confirm exit 0.
- [ ] `LAST_GOOD_Demo.txt` or `LAST_GOOD_OpenTesting.txt` timestamp is fresh (within last hour).
- [ ] `pm2 list` shows all 4 services `online`.
- [ ] `https://care2connects.org/onboarding/v2` loads in browser.
- [ ] `https://care2connects.org/provider/login` loads in browser.
- [ ] `https://api.care2connects.org/health/live` returns `{"service":"backend", ...}`.

---

## PM2 Startup Persistence

To survive reboots, run once:

```powershell
.\scripts\ops\pm2-enable-startup.ps1
```

See [DEPLOYMENT_RUNBOOK_WINDOWS.md](DEPLOYMENT_RUNBOOK_WINDOWS.md#pm2-startup-persistence) for the full reboot checklist.

---

## Troubleshooting

### Gate fails at Stage 2 preflight

1. Check the log file printed in the failure output.
2. Run `start-preflight.ps1` directly to see which step fails.
3. Common fixes:
   - **Port conflict**: `.\scripts\dev\stop-clean.ps1` then restart.
   - **PM2 offline**: `pm2 restart all` or re-run `run-gate-open-testing.ps1` (Stage 1 restarts).
   - **Tunnel down**: `pm2 restart care2connect-tunnel`.
   - **Caddy bad config**: `caddy validate --config Caddyfile.production`.

### Gate fails at Stage 3 smoke

Preflight passed but functional tests fail -- check application logs:

```powershell
pm2 logs --lines 50
```

### -SkipPreflight aborts immediately

You need to authorize the bypass:

```powershell
# Option 1
$env:ALLOW_SKIP_PREFLIGHT = 'true' ; .\scripts\start-stack.ps1 -SkipPreflight

# Option 2
.\scripts\start-stack.ps1 -SkipPreflight -ForceSkipPreflight
```

---

*Last updated: Phase 11.4 -- Manual Testing Gate Polish*
