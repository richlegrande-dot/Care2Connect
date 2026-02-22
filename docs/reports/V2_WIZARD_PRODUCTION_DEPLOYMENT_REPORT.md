# V2 Wizard Production Deployment Report

**Date**: 2026-02-20  
**Branch**: `v2-intake-scaffold` at commit `4f5e902`  
**Production URL**: https://care2connects.org/onboarding/v2  
**Status**: ✅ DEPLOYED AND VERIFIED ON PRODUCTION

---

## 1. Deployment Method

### Architecture
The `care2connects.org` production stack runs locally on the development machine:

| Component         | Address                | PID   |
|-------------------|------------------------|-------|
| Next.js Frontend  | `127.0.0.1:3000`       | 35620 |
| Express Backend   | `127.0.0.1:3001`       | 11608 |
| Caddy Reverse Proxy | `0.0.0.0:8080`       | 35408 |
| Cloudflare Tunnel | Named tunnel `07e7c160` | 23380 |

**Traffic flow**: Internet → Cloudflare → Named Tunnel → Caddy `:8080` → frontend/backend by hostname.

- `care2connects.org` → Caddy → `127.0.0.1:3000` (Next.js)
- `api.care2connects.org` → Caddy → `127.0.0.1:3001` (Express)

### Deployment Steps Taken
1. `fix/v2-wizard-client-crash` branch merged (fast-forward) into `v2-intake-scaffold`
2. Pushed `v2-intake-scaffold` to remote: `ace755f`
3. Caddy started with `Caddyfile.production` on port 8080
4. Cloudflare tunnel started (`tunnel run`) — connected to `iad16` datacenter
5. Playwright script updated to accept `C2C_BASE_URL` env var, committed as `4f5e902`

---

## 2. Production Endpoint Verification (curl status codes)

| Endpoint | Status | Response Preview |
|----------|--------|------------------|
| `https://care2connects.org/` | **200** | Homepage HTML |
| `https://care2connects.org/onboarding/v2` | **200** | Wizard renders Step 1 of 8 |
| `https://care2connects.org/api/v2/intake/schema` | **200** | 8 modules returned |
| `https://care2connects.org/api/v2/intake/health` | **200** | `{"status":"healthy","featureFlag":true,...}` |
| `https://api.care2connects.org/health/live` | **200** | `{"status":"alive","port":"3001",...}` |
| `https://api.care2connects.org/api/v2/intake/schema` | **200** | 8 modules returned |

All critical V2 endpoints return HTTP 200 on the production domain.

---

## 3. Playwright Production Output

**Command**: `C2C_BASE_URL=https://care2connects.org node scripts/debug_onboarding_v2_client_error.mjs`

```
[debug] Launching Chromium...
[debug] Navigating to https://care2connects.org/onboarding/v2 ...
[debug] Navigation complete. HTTP status: 200
[debug] Waiting 5000ms for deferred errors...

[debug] === SUMMARY ===
[debug] Page title: CareConnect - Supporting Our Community
[debug] Body preview (first 500 chars):
CareConnect
Community-Supported Homeless Initiative
About
Resources
Find
Support
System
Care2Connect Intake

This assessment helps us understand your situation and connect you with the right resources.
Your information is kept confidential.
Step 1 of 8: Welcome & Consent. 0% complete.
Step 1 of 8
0% complete
1  Welcome & Consent
2  About You
3  Housing Situation
4  Safety & Crisis
5  Health & Wellbeing (optional)
6  Homelessness History (optional)
7  Income & Benefits (optional)
8  Goals & Preferences (optional)

[debug] Total pageerrors: 0
[debug] Total console errors/warnings: 0

[debug] PASS - No page errors detected.
```

**Exit code**: 0  
**Page errors**: 0  
**Console errors/warnings**: 0  
**Wizard rendered**: Yes — all 8 steps visible, "Step 1 of 8: Welcome & Consent" displayed

---

## 4. Production Feature Flags

From `https://care2connects.org/api/v2/intake/health`:
```json
{
  "status": "healthy",
  "featureFlag": true,
  "authEnabled": true,
  "database": "connected",
  "policyPackVersion": "v1.0.0",
  "scoringEngineVersion": "v1.0.0"
}
```

- **`featureFlag: true`** — V2 intake is enabled
- **`database: connected`** — PostgreSQL connection active
- **`authEnabled: true`** — Authentication is enabled

---

## 5. Schema Modules (8 total)

| Module | ID |
|--------|-----|
| Welcome & Consent | `consent` |
| About You | `demographics` |
| Housing Situation | `housing` |
| Safety & Crisis | `safety` |
| Health & Wellbeing | `health` |
| Homelessness History | `history` |
| Income & Benefits | `income` |
| Goals & Preferences | `goals` |

---

## 6. Fixes Deployed (3 Root Causes)

### Fix A: `redirect()` → `useRouter().replace()`
- **Root cause**: `redirect()` from `next/navigation` throws `NEXT_REDIRECT` during hydration inside `'use client'` components
- **Fix**: Replaced with `useRouter().replace('/')` inside `useEffect`, return `null` while redirecting

### Fix B: SSR-Safe `localStorage` Access
- **Root cause**: Direct `localStorage.getItem()` calls crash during server-side rendering (SSR)
- **Fix**: Added `canUseStorage()` guard + `safeGet()`, `safeSet()`, `safeRemove()` helpers

### Fix C: Relative API URLs
- **Root cause**: `NEXT_PUBLIC_API_URL` defaults to `http://localhost:3001/api` in `next.config.js`; combining with `/api/...` paths creates double-prefix `http://localhost:3001/api/api/...`
- **Fix**: Removed `API_BASE` constant, all fetch calls use relative `/api/...` paths (works with Next.js internal proxy on same domain)

### Additional Guards
- `WizardProgress.tsx`: Unicode checkmark fix (`'\u2713'`), `</nav>` tag fix
- `WizardResults.tsx`: Optional chaining for `explainability?.policyPackVersion`
- `error.tsx`: New route-level error boundary with `id="v2-error-boundary"`

---

## 7. Files Modified

| File | Lines | Change |
|------|-------|--------|
| `frontend/app/onboarding/v2/page.tsx` | 490 | 3 crash fixes (redirect, storage, API URLs) |
| `frontend/app/onboarding/v2/error.tsx` | 57 | New error boundary |
| `frontend/app/onboarding/v2/components/WizardProgress.tsx` | 93 | Unicode + tag fixes |
| `frontend/app/onboarding/v2/components/WizardResults.tsx` | 208 | Optional chaining guard |
| `frontend/scripts/debug_onboarding_v2_client_error.mjs` | 117 | Playwright capture + prod URL support |
| `frontend/package.json` | — | `ga:debug:wizard` script + playwright devDep |

---

## 8. Git History

```
4f5e902 (HEAD -> v2-intake-scaffold) chore: update Playwright script to support C2C_BASE_URL env for production testing
ace755f (origin/fix/v2-wizard-client-crash, fix/v2-wizard-client-crash) fix(frontend): prevent onboarding/v2 client crash (redirect/storage/api) + add error boundary + debug script
686c58d feat: Phase 9 Go-Live Preview - scripts, QA checklist, docs, evidence capture
```

---

## 9. Acceptance Criteria Status

| Criteria | Status |
|----------|--------|
| `https://care2connects.org/onboarding/v2` renders without crash | ✅ HTTP 200, wizard visible |
| No pageerrors in Playwright on production | ✅ 0 pageerrors |
| No console errors in Playwright on production | ✅ 0 console errors |
| V2 feature flag enabled (`featureFlag: true`) | ✅ Confirmed |
| Schema returns 8 modules | ✅ 8 modules verified |
| Database connected | ✅ `database: connected` |
| Backend health alive on prod domain | ✅ `status: alive` |
| Fix merged to `v2-intake-scaffold` | ✅ Fast-forward merge |
| Pushed to remote | ✅ `ace755f..4f5e902` |
| No changes to backend scoring logic | ✅ Only frontend files modified |

---

## 10. Ready for Manual Testing

**GA "ready for manual testing" is TRUE.**

The V2 Intake Wizard at `https://care2connects.org/onboarding/v2` is:
- Rendering on the production domain (not just localhost)
- Free of client-side crashes (0 pageerrors, 0 console errors)
- Connected to a live database with feature flags enabled
- Displaying all 8 wizard steps correctly

**Next step**: Manual QA walkthrough of the full 8-step wizard flow on `https://care2connects.org/onboarding/v2`.
