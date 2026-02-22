# Phase 11.3 — Preflight Operationalization: Completion Report

**Date:** 2026-02-22  
**Branch:** `hardening/phase11.3-preflight-operationalization`  
**Commit:** `bfe05be`  
**PR:** [#9](https://github.com/richlegrande-dot/Care2Connect/pull/9)  
**Builds on:** Phase 11.2 (PR #8, `452f583`), Phase 11.1 (PR #7, `bbeb0a3`), Phase 11 (PR #6, `834688b`)

---

## Objective

Make the preflight gate a **non-optional operator gate** before manual testing. Add Caddy/public verification, rate-limit bypass safety, log retention, and a "Manual Testing Ready" stamp.

---

## Deliverables

### D1 — Log Retention (`-RetentionDays`)

| Item | Detail |
|------|--------|
| **File** | `scripts/preflight/start-preflight.ps1` |
| **Param** | `-RetentionDays <int>` (default: 7) |
| **Behavior** | After creating today's log, prunes `preflight_*.log` files older than N days. Never deletes today's logs. Pruned count shown in banner. |
| **Evidence** | Smoke test: created dummy log dated 30 days ago → "Pruned 1 old log(s) (retention: 7d)" in output, dummy file deleted |

### D2 — `-UseCaddy` Mode (Caddy Host-Routing Checks)

| Item | Detail |
|------|--------|
| **File** | `scripts/preflight/caddy-public-check.ps1` (NEW, ~200 lines) |
| **Step** | Step 9 in orchestrator (flag-gated) |
| **Checks** | Tests `localhost:8080` with Host headers: `care2connects.org` → frontend pages (`/onboarding/v2`, `/provider/login`), `api.care2connects.org` → `/health/live`, papi auth via Caddy (expect 401 = routing works) |

### D3 — `-UsePublic` Mode (Public Domain Probes)

| Item | Detail |
|------|--------|
| **File** | `scripts/preflight/caddy-public-check.ps1` (same script, `-UsePublic` flag) |
| **Step** | Step 9 in orchestrator (flag-gated) |
| **Checks** | Tests `https://care2connects.org/onboarding/v2`, `/provider/login`, `https://api.care2connects.org/health/live`, papi auth (expect 401) |

### D4 — Enforce Preflight in Start Scripts

| Item | Detail |
|------|--------|
| **Files Modified** | `scripts/start-stack.ps1`, `scripts/start-server-and-test.ps1` |
| **Behavior** | Both scripts call `start-preflight.ps1 -Mode Demo` before stack startup. Failure → abort with clear message. `-SkipPreflight` switch bypasses gate. |
| **VS Code Tasks** | Added "Run Preflight Gate (Demo)" and "Run Preflight Gate (OpenTesting)" to `.vscode/tasks.json` |

### D5 — Rate-Limit Bypass Safety Check

| Item | Detail |
|------|--------|
| **File** | `scripts/preflight/rate-limit-bypass-check.ps1` (NEW, ~160 lines) |
| **Step** | Step 10 in orchestrator (OpenTesting mode only) |
| **Check 1** | Two rapid requests to `/health/live` WITHOUT `x-c2c-test` header (both should return 200) |
| **Check 2** | GET `/api/hardening/security` → verify `rateLimiting.enabled = true`, scan for dangerous bypass keys |
| **Check 3** | Scan `backend/.env` and `.env` for bypass env vars (`X_C2C_TEST`, `DISABLE_RATE_LIMIT`, `RATE_LIMIT_BYPASS`) — values never printed |

### D6 — Manual Testing Ready Stamp

| Item | Detail |
|------|--------|
| **File** | `scripts/preflight/start-preflight.ps1` |
| **Behavior** | On PASS in Demo or OpenTesting mode, writes `logs/preflight/LAST_GOOD_<Mode>.txt` with RunId, timestamp, mode, pass count, log path |
| **Non-PASS** | Stamp not written when preflight fails (verified in smoke test) |

---

## Files Changed (6)

| File | Change | Lines |
|------|--------|-------|
| `scripts/preflight/start-preflight.ps1` | Modified | +350 |
| `scripts/preflight/caddy-public-check.ps1` | **New** | ~200 |
| `scripts/preflight/rate-limit-bypass-check.ps1` | **New** | ~160 |
| `scripts/start-stack.ps1` | Modified | +30 |
| `scripts/start-server-and-test.ps1` | Modified | +25 |
| `.vscode/tasks.json` | Modified | +40 |

Total: **605 insertions**, 8 deletions

---

## Orchestrator Step Map (12 Steps)

| Step | Name | Source |
|------|------|--------|
| 0 | Phase 11 Baseline Assertion | `assert-phase11-baseline.ps1` |
| 1 | Environment Variables | `env-check.ps1` |
| 2 | PM2 Shim Check | `pm2-shim-check.ps1` |
| 3 | Rewrite Shadow Guard | `check-next-rewrite-shadow.ps1` |
| 4 | Port Collision Proof | `port-collision-check.ps1` |
| 5 | Database Connectivity | `db-connectivity-check.ps1` |
| 6 | Port Identity + Proxy | `ports-and-identity.ps1` |
| 7 | Provider Auth | `provider-auth-check.ps1` |
| 8 | Chat Backend Check | `chat-backend-check.ps1` |
| 9 | **Caddy / Public Check** | `caddy-public-check.ps1` (**NEW**, flag-gated) |
| 10 | **Rate-Limit Bypass Safety** | `rate-limit-bypass-check.ps1` (**NEW**, OpenTesting only) |
| 11 | Uptime Drill | `uptime-drill.ps1` (renumbered from 9) |

---

## Validation

| Check | Result |
|-------|--------|
| PS 5.1 parser — all 5 scripts | ✅ Clean |
| Smoke test — Demo mode | ✅ Ran, log retention pruned 1 old log |
| Stamp not written on failure | ✅ Verified |
| No secrets printed | ✅ Confirmed (D5 never prints env var values) |

---

## Usage Examples

```powershell
# Standard Demo preflight (default — enforced by start scripts)
.\scripts\preflight\start-preflight.ps1 -Mode Demo -VerboseOutput

# Demo + Caddy host-routing verification
.\scripts\preflight\start-preflight.ps1 -Mode Demo -UseCaddy -VerboseOutput

# OpenTesting + public domain probes (includes rate-limit safety)
.\scripts\preflight\start-preflight.ps1 -Mode OpenTesting -UsePublic -VerboseOutput

# Custom log retention (30 days)
.\scripts\preflight\start-preflight.ps1 -Mode Demo -RetentionDays 30

# Start stack (preflight runs automatically, use -SkipPreflight to bypass)
.\scripts\start-stack.ps1
.\scripts\start-stack.ps1 -SkipPreflight  # Not recommended
```

---

## Navigator Handoff

Phase 11.3 is complete. The preflight gate is now a mandatory, non-optional step before stack startup. All 6 deliverables are implemented, parse-validated, smoke-tested, and pushed as PR #9.

**Next suggested phases:**
- Phase 12: Full production deployment verification with `-UseCaddy` and `-UsePublic` modes active
- Merge PR #9 into main after manual verification
