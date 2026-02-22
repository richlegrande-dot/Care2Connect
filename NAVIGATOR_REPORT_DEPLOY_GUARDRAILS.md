# Navigator Report: Deploy Guardrails Hardening

> **Branch**: `hardening/deploy-guardrails`
> **Date**: 2026-02-21
> **Status**: Implementation complete, awaiting merge
> **Predecessor**: `hardening/deploy-process` (PR #5)

---

## Summary

This branch prevents recurrence of the Feb 2026 provider dashboard proxy failure
where the blanket `/api/:path*` rewrite in `next.config.js` shadowed App Router
routes, a bash shim caused silent PM2 startup failure on Windows, and missing
`BACKEND_INTERNAL_URL` caused the papi proxy to target the wrong URL.

All guardrails are automated preflight scripts that run before manual testing and
exit non-zero on failure.

---

## Deliverables

### A -- Rewrite Shadow Guard
- **A1**: `scripts/preflight/check-next-rewrite-shadow.ps1` -- scans `app/api/**`
  for `route.ts` files that would be shadowed by the blanket rewrite. Allowlists
  the pre-existing `app/api/health/route.ts`. Exits 1 if new shadowed routes found.
- **A2**: Investigated narrowing to `/api/v2/:path*` -- NOT safe (13 non-v2
  frontend callers). Documented in runbook.

### B -- Port Identity Verification
- `scripts/preflight/ports-and-identity.ps1` -- port sweep (B0), backend identity
  check requiring `service:"backend"` in `/health/live` (B1), frontend page
  reachability (B2), papi proxy speed + auth (B3).
- Backend `/health/live` now returns `service: "backend"` field.

### C -- PM2 + Clean Start
- **C1**: `scripts/preflight/check-pm2-shims.ps1` -- flags `.bin/` references in
  all `ecosystem*.config.js` files.
- **C2**: `scripts/dev/stop-clean.ps1` -- `pm2 delete all`, port sweep
  3000/3001/8080/8443, optional `-IncludeTunnel` for Caddy/cloudflared.

### D -- Environment Variable Safety
- **D1**: `frontend/.env.local.example` template with `BACKEND_INTERNAL_URL`
  documented. `.gitignore` updated with `!.env.local.example` exception.
- **D2**: `scripts/preflight/validate-env.ps1` -- checks required keys in
  `backend/.env` and `frontend/.env.local` without printing values. `-Fix` flag
  copies example templates when target file is missing.

### E -- Papi Proxy Hardening
- `frontend/app/papi/[...path]/route.ts` upgraded:
  - 8s `AbortController` timeout (prevents infinite hang)
  - `X-C2C-Proxy`, `X-C2C-Request-Id`, `X-C2C-Upstream` headers
  - `requestId` in all error responses (502/504)
  - 504 status for timeout (was generic 502)

### F -- Deployment Runbook
- `docs/DEPLOYMENT_RUNBOOK_WINDOWS.md` -- start sequence, `/api` rewrite
  explanation, failure signatures with diagnosis/fix, pre-testing checklist,
  script reference, environment variable docs.

---

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `scripts/preflight/check-next-rewrite-shadow.ps1` | New | Rewrite shadow detection |
| `scripts/preflight/ports-and-identity.ps1` | New | Port + identity verification |
| `scripts/preflight/check-pm2-shims.ps1` | New | PM2 bash shim detection |
| `scripts/preflight/validate-env.ps1` | New | Env var validation |
| `scripts/dev/stop-clean.ps1` | New | Clean stop + port sweep |
| `frontend/.env.local.example` | New | Frontend env template |
| `frontend/app/papi/[...path]/route.ts` | Modified | Timeout + tracing headers |
| `backend/src/server.ts` | Modified | service:"backend" in /health/live |
| `.gitignore` | Modified | !.env.local.example exception |
| `docs/DEPLOYMENT_RUNBOOK_WINDOWS.md` | New | Windows deployment runbook |

---

## Key Design Decisions

1. **Cannot narrow `/api/:path*` rewrite** -- 13 non-v2 frontend fetch callers
   would break. Guard via script instead.
2. **All scripts are PS 5.1 compatible** -- no unicode, no multi-arg Join-Path,
   null-safe `@()` wrapping for Get-ChildItem.
3. **Papi proxy timeout is 8s** -- matches PM2 `listen_timeout` in prod config.
   Returns 504 (not 502) on timeout for clear diagnostics.
4. **Env validation never prints values** -- only reports presence/absence of keys.

---

## How to Verify

```powershell
# Run all preflight scripts (all must exit 0)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/validate-env.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/check-pm2-shims.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/check-next-rewrite-shadow.ps1

# Start services, then verify
pm2 start ecosystem.dev.config.js
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/preflight/ports-and-identity.ps1 -SkipSweep
```

---

## Related

- **PR #5** (`hardening/deploy-process`): Earlier iteration with similar scripts
- `AGENT_HANDOFF_PROVIDER_DASHBOARD_PROXY_FIX_2026-02-21.md`: Root cause analysis
- `docs/DEPLOYMENT_RUNBOOK_WINDOWS.md`: Full runbook with failure signatures
