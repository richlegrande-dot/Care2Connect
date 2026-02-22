# Phase 11.1 Completion Report — Preflight Gate + Uptime Proof

> **Date**: 2026-02-22  
> **Branch**: `hardening/phase11.1-preflight-gate-uptime-proof`  
> **Commit**: `bbeb0a3`  
> **Parent branch**: `hardening/phase11-uptime-footgun-removal` (`1d98680`)  
> **Main HEAD**: `fa83e4e`  
> **PR**: [#7 — Phase 11.1: Preflight Gate + Uptime Proof + Provider Auth Check](https://github.com/richlegrande-dot/Care2Connect/pull/7)  
> **Status**: All deliverables complete, PR open, ready for merge  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Deliverables (D1–D5)](#2-deliverables-d1d5)
3. [Wrapper Updates](#3-wrapper-updates)
4. [Verification Evidence](#4-verification-evidence)
5. [Security Considerations](#5-security-considerations)
6. [Current Repository State](#6-current-repository-state)
7. [Usage Reference](#7-usage-reference)
8. [Remaining Work & Recommendations](#8-remaining-work--recommendations)

---

## 1. Executive Summary

Phase 11.1 transforms preflight from a basic env/shadow checker into a
**single-gate system** that proves the full stack is healthy before any demo,
open-testing session, or deployment. It adds port collision detection, provider
auth round-trip verification, and Caddy restart recovery drills — all
orchestrated through one canonical entrypoint.

### Key Outcomes

| Area | Before | After |
|------|--------|-------|
| Preflight entrypoint | `preflight.ps1` (4 steps) | `start-preflight.ps1` (7 steps, flag-driven) |
| Port collision detection | None | Exactly-one-listener proof with PID dedup |
| Provider auth verification | Manual browser test only | Automated POST/GET round-trip (cookie relay + session) |
| Restart recovery proof | None | Caddy bounce + recovery poll with stopwatch |
| Watchdog usability | Continuous loop only | Added `-Once` (single cycle) and `-DryRun` (report only) |

### Change Stats

- **7 files changed** (4 new, 3 modified)
- **842 insertions**, **6 deletions**
- All scripts PS 5.1 compatible, parse clean

---

## 2. Deliverables (D1–D5)

### D1 — Canonical Preflight Entrypoint (`start-preflight.ps1`)

**File**: `scripts/preflight/start-preflight.ps1` (272 lines)

The single command to run before any demo or testing session. Replaces
`preflight.ps1` as the orchestrator (original still exists for backward
compatibility).

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `-Mode` | `Demo\|OpenTesting\|LocalDev` | `Demo` | Controls which checks run |
| `-IncludeUptimeDrill` | switch | `$false` | Enable Caddy restart drill |
| `-IncludeProviderAuthCheck` | switch | auto | Provider auth (auto-on for Demo/OpenTesting) |
| `-SkipPorts` | switch | `$false` | Skip ports-and-identity check |
| `-IncludePorts` | switch | `$false` | Force ports-and-identity in LocalDev |
| `-TimeoutSeconds` | int | `30` | HTTP timeout for sub-checks |
| `-VerboseOutput` | switch | `$false` | Show child script stdout |

**Orchestrated steps** (in order):

| # | Step | Source | Condition |
|---|------|--------|-----------|
| 1 | Environment Variables | `validate-env.ps1` | Always |
| 2 | PM2 Shim Check | `check-pm2-shims.ps1` | Always |
| 3 | Rewrite Shadow Guard | `check-next-rewrite-shadow.ps1` | Always |
| 4 | Port Collision Proof | `port-collision-check.ps1` | Always |
| 5 | Port Identity + Proxy | `ports-and-identity.ps1 -SkipSweep` | Demo/OpenTesting (or `-IncludePorts`) |
| 6 | Provider Auth Round-Trip | `provider-auth-check.ps1` | Demo/OpenTesting (disable with `-IncludeProviderAuthCheck:$false`) |
| 7 | Uptime Drill | `uptime-drill.ps1` | Only when `-IncludeUptimeDrill` |

**Mode matrix**:

| Step | LocalDev | Demo | OpenTesting |
|------|----------|------|-------------|
| 1-3 (env/shims/shadow) | Run | Run | Run |
| 4 (port collision) | Run | Run | Run |
| 5 (ports-and-identity) | Skip | Run | Run |
| 6 (provider auth) | Skip | Run | Run |
| 7 (uptime drill) | On request | On request | On request |

### D2 — Uptime Drill (`uptime-drill.ps1`)

**File**: `scripts/preflight/uptime-drill.ps1` (243 lines)

Proves the stack survives a Caddy restart by:
1. **Baseline check**: backend `/health/live`, frontend `/`, Caddy port 8080, cloudflared process
2. **Caddy bounce**: `pm2 restart care2connect-caddy` (auto-detects prod vs dev name)
3. **Recovery poll**: check port 8080 every 2s until recovered or timeout
4. **(Optional) Tunnel bounce**: restart cloudflared, poll public URL

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `-TimeoutSeconds` | int | `30` | Max wait for recovery |
| `-IncludeTunnel` | switch | `$false` | Also bounce cloudflared |
| `-PublicUrl` | string | `https://care2.tech` | URL to probe after tunnel restart |

**Fail-fast**: If baseline checks fail, the drill aborts immediately with
remediation guidance rather than bouncing services in an already-broken state.

### D3 — Provider Auth Round-Trip (`provider-auth-check.ps1`)

**File**: `scripts/preflight/provider-auth-check.ps1` (191 lines)

End-to-end verification of the provider dashboard authentication flow:

```
Step 1: POST http://localhost:3000/papi/auth
        Body: {"token":"<from frontend/.env.local>"}
        Expect: 200 + Set-Cookie: c2c_provider_auth=...

Step 2: GET http://localhost:3000/papi/sessions?limit=1
        Header: Cookie: c2c_provider_auth=<captured value>
        Expect: 200 + response contains sessions[]
```

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `-TimeoutSeconds` | int | `10` | HTTP request timeout |
| `-FrontendPort` | int | `3000` | Frontend port |

**What it catches**:
- Backend `PROVIDER_DASHBOARD_TOKEN` not set or mismatched
- Papi proxy not forwarding cookies (cookie relay broken)
- Session store issues (auth succeeds but sessions query fails)
- Next.js rewrite conflicts blocking `/papi/*` routes

### D4 — Port Collision Proof (`port-collision-check.ps1`)

**File**: `scripts/preflight/port-collision-check.ps1` (100 lines)

Ensures exactly one process owns each critical port:

| Port | Service | Expected |
|------|---------|----------|
| 3000 | Frontend (Next.js) | 1 listener |
| 3001 | Backend (Express) | 1 listener |
| 8080 | Caddy (reverse proxy) | 1 listener |

**Key design decisions**:
- Uses `Get-NetTCPConnection -State Listen` (PS 5.1 native, no `netstat` parsing)
- **PID deduplication**: A single process binding both IPv4 and IPv6 creates two
  TCP connection entries — the script groups by `OwningProcess` to avoid false
  collision reports
- Shows PID + command line (via `Get-CimInstance Win32_Process`) for each listener
- Caddy check controlled by `-RequireCaddy` parameter (default `$true`)

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `-RequireCaddy` | bool | `$true` | Include port 8080 check |

### D5 — Watchdog QoL Enhancements (`watchdog-stack.ps1`)

**File**: `scripts/ops/watchdog-stack.ps1` (+38 lines, now 271 total)

Two new switches added to the existing watchdog:

| Parameter | Type | Purpose |
|-----------|------|---------|
| `-Once` | switch | Run a single health-check cycle then exit with code 0 (healthy) or 1 (issues) |
| `-DryRun` | switch | Detect issues but do NOT restart services; log intended actions |

**Use cases**:
- `watchdog-stack.ps1 -Once` — CI/preflight health snapshot
- `watchdog-stack.ps1 -Once -DryRun` — report-only mode for diagnostics
- `watchdog-stack.ps1 -DryRun` — continuous monitoring without auto-restart (observation mode)

**Implementation details**:
- `-DryRun` intercepts `Restart-Service` to log `[DRY-RUN] Would restart...` without executing
- `-Once` breaks the main loop after one cycle, exits with appropriate code
- Post-restart sleep skipped in `-DryRun` mode (nothing to wait for)
- Banner displays mode label: "Single-cycle", "Dry-run", or "Continuous"

---

## 3. Wrapper Updates

Both thin wrappers updated to call `start-preflight.ps1` instead of `preflight.ps1`:

| File | Before | After |
|------|--------|-------|
| `scripts/preflight/run-preflight-demo.ps1` | `preflight.ps1 -Mode Demo` | `start-preflight.ps1 -Mode Demo` |
| `scripts/preflight/run-preflight-open-testing.ps1` | `preflight.ps1 -Mode OpenTesting` | `start-preflight.ps1 -Mode OpenTesting` |

The original `preflight.ps1` remains in place for backward compatibility but is
no longer the canonical entrypoint.

---

## 4. Verification Evidence

### All Scripts Parse Clean (PS 5.1)

```
start-preflight.ps1:      OK
port-collision-check.ps1:  OK
provider-auth-check.ps1:   OK
uptime-drill.ps1:          OK
watchdog-stack.ps1:         OK
```

### Port Collision Check (services down — expected failure)

```
-- Port Collision Proof --
  [FAIL] Port 3000 (Frontend (Next.js)) -- no listener. Service not running.
  [FAIL] Port 3001 (Backend (Express)) -- no listener. Service not running.
  [FAIL] Port 8080 (Caddy (reverse proxy)) -- no listener. Service not running.

  Port collision proof FAILED -- 3 issue(s)
```

Correctly detects missing services with remediation guidance.

### Watchdog `-Once -DryRun` (services down — expected failure)

```
============================================================
  CARE2CONNECT WATCHDOG
============================================================
  Mode: Single-cycle | Interval: 12s | Throttle: 3 restarts / 5 min
  Log: C:\Users\richl\Care2system\logs\watchdog-stack.log
  Running ONE cycle then exiting
  DRY-RUN: will NOT restart services

[2026-02-22 11:06:58] [INFO] Watchdog started (interval=12s, throttle=3/5min)
[2026-02-22 11:07:07] [WARN] backend UNHEALTHY: /health/live unreachable
[2026-02-22 11:07:08] [ERROR] backend: no PM2 process found
[2026-02-22 11:07:08] [WARN] frontend UNHEALTHY: /onboarding/v2 unreachable
[2026-02-22 11:07:09] [WARN] caddy UNHEALTHY: Port 8080 not listening
[2026-02-22 11:07:09] [WARN] Single cycle complete -- 3 issue(s) detected
```

Correctly runs one cycle, reports issues, does NOT attempt restarts, exits.

### Start Preflight — LocalDev Mode

```
============================================================
  CARE2CONNECT PREFLIGHT GATE  (Mode: LocalDev)
============================================================
  [PASS] Environment Variables
  [PASS] PM2 Shim Check
  [PASS] Rewrite Shadow Guard
  [FAIL] Port Collision Proof (exit code 1)
  [SKIP] Port Identity + Proxy (LocalDev mode)
  [SKIP] Provider Auth Round-Trip (disabled for LocalDev)
  [SKIP] Uptime Drill (use -IncludeUptimeDrill to enable)

  PREFLIGHT FAIL -- DO NOT PROCEED
  Failed steps: Port Collision Proof
```

Correctly passes 3 env checks, fails on port collision (services down), skips
LocalDev-disabled checks.

---

## 5. Security Considerations

- **Provider token never printed**: `provider-auth-check.ps1` reads
  `NEXT_PUBLIC_PROVIDER_DASHBOARD_TOKEN` from `frontend/.env.local` but only
  logs "Token found (not printed for security)"
- **Cookie values hidden**: Auth cookie captured for session verification but
  logged as "Cookie c2c_provider_auth captured (value hidden)"
- **No secrets in source**: All scripts reference env files, never hardcode tokens
- **`.env.local` is gitignored**: Token source file excluded from version control

---

## 6. Current Repository State

### Branches

| Branch | Commit | Status |
|--------|--------|--------|
| `main` | `fa83e4e` | Production baseline |
| `hardening/phase11-uptime-footgun-removal` | `1d98680` | PR #6 (Phase 11) |
| `hardening/phase11.1-preflight-gate-uptime-proof` | `bbeb0a3` | PR #7 (this work) |

### Open PRs

| PR | Title | Branch | Status |
|----|-------|--------|--------|
| [#6](https://github.com/richlegrande-dot/Care2Connect/pull/6) | Phase 11: Uptime + Footgun Removal | `hardening/phase11-uptime-footgun-removal` | Open |
| [#7](https://github.com/richlegrande-dot/Care2Connect/pull/7) | Phase 11.1: Preflight Gate + Uptime Proof | `hardening/phase11.1-preflight-gate-uptime-proof` | Open |

### Files Changed in This Phase

| File | Status | Lines | Purpose |
|------|--------|-------|---------|
| `scripts/preflight/start-preflight.ps1` | **New** | 272 | Canonical preflight entrypoint |
| `scripts/preflight/uptime-drill.ps1` | **New** | 243 | Restart recovery drill |
| `scripts/preflight/provider-auth-check.ps1` | **New** | 191 | Auth round-trip verification |
| `scripts/preflight/port-collision-check.ps1` | **New** | 100 | Port collision proof |
| `scripts/ops/watchdog-stack.ps1` | Modified | +38 | `-Once` and `-DryRun` switches |
| `scripts/preflight/run-preflight-demo.ps1` | Modified | +1 | Wrapper → `start-preflight.ps1` |
| `scripts/preflight/run-preflight-open-testing.ps1` | Modified | +1 | Wrapper → `start-preflight.ps1` |

### Preflight Script Inventory

```
scripts/preflight/
  start-preflight.ps1             ← NEW canonical entrypoint (D1)
  preflight.ps1                   ← original orchestrator (retained for compat)
  run-preflight-demo.ps1          ← updated wrapper
  run-preflight-open-testing.ps1  ← updated wrapper
  validate-env.ps1                ← env var checker
  check-pm2-shims.ps1             ← PM2 path resolver
  check-next-rewrite-shadow.ps1   ← dead route detector
  port-collision-check.ps1        ← NEW port proof (D4)
  ports-and-identity.ps1          ← service identity + proxy check
  provider-auth-check.ps1         ← NEW auth round-trip (D3)
  uptime-drill.ps1                ← NEW restart drill (D2)
```

---

## 7. Usage Reference

### Before a Demo

```powershell
# Standard demo preflight (env + ports + auth)
.\scripts\preflight\start-preflight.ps1 -Mode Demo

# Or use the wrapper
.\scripts\preflight\run-preflight-demo.ps1
```

### Before Open Testing

```powershell
# Full preflight with uptime drill
.\scripts\preflight\start-preflight.ps1 -Mode OpenTesting -IncludeUptimeDrill

# Or use the wrapper (without drill)
.\scripts\preflight\run-preflight-open-testing.ps1
```

### Local Development

```powershell
# Quick env-only check
.\scripts\preflight\start-preflight.ps1 -Mode LocalDev

# Include port checks
.\scripts\preflight\start-preflight.ps1 -Mode LocalDev -IncludePorts
```

### Diagnostics

```powershell
# Single watchdog cycle (report only)
.\scripts\ops\watchdog-stack.ps1 -Once -DryRun

# Port check standalone
.\scripts\preflight\port-collision-check.ps1

# Provider auth standalone
.\scripts\preflight\provider-auth-check.ps1

# Uptime drill standalone (with tunnel)
.\scripts\preflight\uptime-drill.ps1 -IncludeTunnel -TimeoutSeconds 45
```

---

## 8. Remaining Work & Recommendations

### Merge Order

1. **Merge PR #6 first** (Phase 11 → main) — Phase 11.1 branch was created from Phase 11
2. **Merge PR #7** (Phase 11.1 → main) — after PR #6 is merged

### Live Validation (Post-Merge)

Once services are running with `pm2 start ecosystem.prod.config.js`:

1. **Run full Demo preflight**: `.\scripts\preflight\start-preflight.ps1 -Mode Demo`
   — all 6 active steps should PASS
2. **Run with uptime drill**: add `-IncludeUptimeDrill` — Caddy should recover in <5s
3. **Run OpenTesting with tunnel drill**: add `-IncludeUptimeDrill` — tunnel should
   recover in <15s
4. **Provider auth round-trip**: should show POST 200 + Set-Cookie + GET 200 + sessions[]

### Future Enhancements (Out of Scope)

| Enhancement | Rationale |
|-------------|-----------|
| Database connectivity check in preflight | Prisma connection test before demo |
| WebSocket health in uptime drill | Chat requires WS, not just HTTP |
| Configurable port list from `config/ports.json` | DRY — currently hardcoded in port-collision-check |
| Integration with CI pipeline | Run `start-preflight.ps1 -Mode Demo -SkipPorts` in CI |
| Alert/notification on watchdog failures | Slack/email integration for production monitoring |

---

*Generated: 2026-02-22 | Branch: hardening/phase11.1-preflight-gate-uptime-proof | Commit: bbeb0a3*
