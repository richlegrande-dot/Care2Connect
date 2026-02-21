# Phase 10 Manual Testing Readiness Report — Evidence Pack

**Date:** 2026-02-21  
**Branch:** `main`  
**HEAD SHA:** `081c253`  
**Commit:** `fix: resolve legacy CI debt (prettier + test imports + frontend assertions)`  
**PR #4:** Merged via GitHub merge commit  

---

## Executive Summary

All Phase 10 readiness criteria **PASS**. The Care2Connect system is fully operational on
production domains (`care2connects.org` / `api.care2connects.org`), with all smoke tests
green across preflight, chat pipeline, and provider dashboard test suites.

**Overall Verdict: PASS (3/3 sections, 42/42 assertions)**

---

## 1. Merge & Sync

| Item | Value |
|------|-------|
| PR | #4 (`fix/legacy-ci-debt`) |
| Merge method | GitHub merge commit |
| HEAD SHA | `081c253` |
| Branch | `main` |
| CI checks (required) | 7 passed (V2 required checks all green) |

---

## 2. Environment & Migrations

| Check | Status | Detail |
|-------|--------|--------|
| `ENABLE_V2_INTAKE` | PASS | `true` |
| `ENABLE_V2_INTAKE_AUTH` | PASS | `true` (JWT auth enforced) |
| `PROVIDER_DASHBOARD_TOKEN` | PASS | Set (30 chars) |
| `DATABASE_URL` | PASS | `postgresql://...@localhost:5432/careconnect` |
| `NEXT_PUBLIC_API_URL` | PASS | `http://localhost:3001/api` |
| `NEXT_PUBLIC_FRONTEND_URL` | PASS | `https://care2connects.org` |
| PostgreSQL | PASS | Docker container `careconnect-postgres` running |
| Prisma migrations | PASS | 13 migrations applied, none pending |
| Prisma Client | PASS | v6.19.1 generated |

### Migration Applied This Session

- `20260221_add_chat_tables` — Created `v2_intake_chat_threads` and `v2_intake_chat_messages` tables  
  (Tables were defined in Prisma schema but missing migration; safe idempotent SQL with `IF NOT EXISTS`)

---

## 3. Services Running

| Service | Port | PID | Status |
|---------|------|-----|--------|
| Backend (Express) | 3001 | running | Healthy |
| Frontend (Next.js) | 3000 | running | Serving |
| Caddy (reverse proxy) | 8080 | running | Proxying |
| Cloudflared (tunnel) | — | running | Connected |

---

## 4. Production Endpoint Verification

All endpoints verified via HTTPS through Cloudflare tunnel:

| Endpoint | Status | Detail |
|----------|--------|--------|
| `https://care2connects.org/` | 200 | Frontend root |
| `https://care2connects.org/onboarding/v2` | 200 | V2 intake form |
| `https://care2connects.org/api/v2/intake/health` | 200 | `healthy`, database connected |
| `https://api.care2connects.org/health/live` | 200 | `alive` |
| `https://api.care2connects.org/api/v2/intake/schema` | 200 | Module schemas returned |
| `https://api.care2connects.org/api/v2/intake/panic-button` | 200 | Panic button config |

---

## 5. Smoke Test Results

### Overall Verdict: **PASS**

| Section | Status | Passed | Failed | Warnings |
|---------|--------|--------|--------|----------|
| Preflight Checks | **PASS** | 5 | 0 | 0 |
| Chat Pipeline | **PASS** | 19 | 0 | 0 |
| Provider Dashboard | **PASS** | 18 | 0 | 0 |
| **Total** | **PASS** | **42** | **0** | **0** |

### Preflight Sub-Results

| Check | Status | Detail |
|-------|--------|--------|
| API reachable | PASS | GET `/api/v2/intake/health` → 200 |
| ENABLE_V2_INTAKE | PASS | Intake health: healthy, db: connected |
| PROVIDER_DASHBOARD_TOKEN | PASS | Set (value not printed) |
| Chat endpoint active | PASS | Returns 404 for invalid session (endpoint wired) |
| Provider auth endpoint | PASS | Returns 401 for invalid token |

### Chat Pipeline Assertions (19/19 PASS)

| # | Assertion | Status | Detail |
|---|-----------|--------|--------|
| S1 | Session created | PASS | 201, `sessionId=cmlwrhpnv001gz808dtm8dc9b` |
| S2 | Session completed (non-DV) | PASS | `score=7` |
| C1 | Chat thread created | PASS | `threadId=cmlwrhtug0022z808z37ka8fn`, mode=DETERMINISTIC |
| C2 | Thread idempotency | PASS | Same threadId on retry |
| M1 | Normal message response | PASS | Deterministic response (467 chars) |
| M2 | Substantive content | PASS | Includes action steps |
| DV1 | DV-safe session created + completed | PASS | `sessionId=cmlwrhw10002dz808lzhfgdj1` |
| DV2 | DV chat thread created | PASS | `threadId=cmlwri0bk002zz8083xu9iikp` |
| DV3 | DV-safe message accepted | PASS | 200 |
| DV4 | No echo of sensitive text | PASS | Response safe |
| DV5 | Safety/support guidance included | PASS | — |
| DV6 | User message stored redacted | PASS | `[User message - redacted for safety]` |
| R1 | Messages retrieved | PASS | count=2 |
| R2 | Both user + assistant roles | PASS | — |
| A1 | Audit: CHAT_THREAD_CREATED | PASS | — |
| A2 | Audit: CHAT_MESSAGE_USER | PASS | — |
| A3 | Audit: CHAT_MESSAGE_ASSISTANT | PASS | — |
| A4 | Audit meta excludes content | PASS | — |
| PII | All evidence clean of PII | PASS | — |

### Provider Dashboard Assertions (18/18 PASS)

| # | Assertion | Status | Detail |
|---|-----------|--------|--------|
| U1 | Unauthenticated GET /sessions → 401 | PASS | — |
| L1 | Provider login → 200, success:true | PASS | — |
| L2 | Set-Cookie contains `c2c_provider_auth` | PASS | — |
| L3 | Cookie is httpOnly | PASS | — |
| SL1 | GET /sessions → 200 | PASS | count=4 |
| SL2 | Session data available | PASS | — |
| SL3 | Session list excludes raw modules | PASS | — |
| SL4 | Privacy headers on sessions-list | PASS | — |
| SD1 | GET /session/:id → 200 | PASS | — |
| SD2 | Detail includes profile | PASS | — |
| SD3 | Detail includes topFactors | PASS | — |
| SD4 | Detail includes audit data | PASS | — |
| SD5 | Detail excludes raw modules | PASS | — |
| SD6 | Privacy headers on session-detail | PASS | — |
| PH1 | All privacy headers verified | PASS | Cache-Control, X-Robots-Tag, Referrer-Policy |
| LO1 | Logout → 200, success:true | PASS | — |
| LO2 | Cookie cleared on logout | PASS | — |
| LO3 | Post-logout GET /sessions → 401 | PASS | — |

---

## 6. Golden Test Artifacts

| Artifact | Value |
|----------|-------|
| Non-DV Session ID | `cmlwrhpnv001gz808dtm8dc9b` |
| DV-Safe Session ID | `cmlwrhw10002dz808lzhfgdj1` |
| Chat Thread ID | `cmlwrhtug0022z808z37ka8fn` |
| DV Chat Thread ID | `cmlwri0bk002zz8083xu9iikp` |
| Score (non-DV) | 7 |
| Scoring Engine | v1.0.0 |
| Policy Pack | v1.0.0 |

---

## 7. Manual Testing URLs

Open in browser to verify visually:

| Page | URL |
|------|-----|
| Landing | https://care2connects.org/ |
| V2 Intake Form | https://care2connects.org/onboarding/v2 |
| Provider Dashboard | https://care2connects.org/provider/dashboard |

---

## 8. Fixes Applied During This Phase

| Fix | File | Detail |
|-----|------|--------|
| Frontend API URL | `frontend/.env.local` | Added `/api` suffix to `NEXT_PUBLIC_API_URL` |
| Chat tables migration | `backend/prisma/migrations/20260221_add_chat_tables/` | Created `v2_intake_chat_threads` + `v2_intake_chat_messages` tables |
| Smoke test JWT auth | `scripts/smoke/test-chat-pipeline-prod.ps1` | Added `-IntakeToken` param + Authorization header |
| Smoke test JWT auth | `scripts/smoke/test-phase10-complete-prod.ps1` | Added `-IntakeToken` param + pass-through to chat script |

---

## 9. Evidence Files

```
docs/evidence/phase10/
├── HEAD_SHA.txt                 # Git HEAD + timestamp
├── ENDPOINTS_200.txt            # All endpoint verification results
├── SMOKE_SUITE_SUMMARY.md       # Overall smoke test summary
├── SMOKE_SUITE_RESULTS.json     # Structured suite results
├── SMOKE_CHAT_PROD.json         # Chat pipeline evidence (19 assertions)
└── SMOKE_PROVIDER_PROD.json     # Provider dashboard evidence (18 assertions)
```

Full evidence directories (with sub-suite outputs):
```
out/phase10/20260221-151848/     # Orchestrator + preflight
out/phase10/20260221-151851/     # Chat pipeline evidence
out/phase10/20260221-151910/     # Provider dashboard evidence
```

---

## 10. Known Issues / Caveats

| Issue | Severity | Detail |
|-------|----------|--------|
| OpenAI API key not set | Low | Chat uses deterministic (template) responses; LLM mode requires `OPENAI_API_KEY` |
| AssemblyAI key not set | Low | Audio transcription not tested in smoke suite |
| Stripe key not set | Low | Donation pipeline not tested in smoke suite |
| Caddy/Cloudflared can drop | Info | Both processes were restarted during this session; no auto-restart configured |

---

## 11. Conclusion

The Care2Connect V2 system is **manual testing ready** on production domains. All critical
paths — intake form → profile generation → scoring/ranking → chat → provider dashboard —
have been verified end-to-end through the Cloudflare tunnel against `care2connects.org` and
`api.care2connects.org`.

**No V2 scoring or policy pack changes were made.** All edits were infrastructure (migration,
env config, smoke script auth headers).

---

*Generated: 2026-02-21 15:20 EST*  
*Agent: Phase 10 Manual Testing Prep*
