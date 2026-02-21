# V2 Phase 10 Smoke Test Evidence Pack - Production

**Date:** 2026-02-20  
**Target:** `https://api.care2connects.org`  
**Verdict:** **ALL PASS**  
**Runner:** `scripts/smoke/test-phase10-complete-prod.ps1`

---

## Executive Summary

Phase 10 (Chat + Provider Dashboard) has been verified end-to-end against
**production** (`api.care2connects.org`). Every assertion passed with zero
failures and zero warnings.

| Suite | Assertions | Passed | Failed | Warnings |
|-------|-----------|--------|--------|----------|
| Preflight | 5 | 5 | 0 | 0 |
| Chat Pipeline | 19 | 19 | 0 | 0 |
| Provider Dashboard | 18 | 18 | 0 | 0 |
| **Total** | **42** | **42** | **0** | **0** |

---

## 1. Preflight Checks

| Check | Status | Detail |
|-------|--------|--------|
| API reachable | PASS | `GET /api/v2/intake/health` -> 200 |
| V2 Intake enabled | PASS | status=healthy, db=connected |
| PROVIDER_DASHBOARD_TOKEN | PASS | Set (value redacted) |
| Chat endpoint active | PASS | Returns 404 for invalid session |
| Provider auth endpoint | PASS | Returns 401 for invalid token |

**Command:**
```powershell
.\scripts\smoke\test-phase10-complete-prod.ps1 `
    -ApiBase "https://api.care2connects.org" -ThrottleMs 600
```

---

## 2. Chat Pipeline Smoke Test

### 2.1 Session Setup

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| S1 | Session created | PASS | sessionId=cmlvlfg14001uz874o2759a4q, HTTP 201 |
| S2 | Session completed (non-DV) | PASS | totalScore=7 |

### 2.2 Chat Thread + Idempotency

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| C1 | Chat thread created (200) | PASS | threadId=cmlvlflnu002gz8747u67b9kg, mode=DETERMINISTIC |
| C2 | Thread idempotency (same threadId) | PASS | Second POST returns same threadId |

### 2.3 Normal Chat Message

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| C3 | Normal message -> deterministic response | PASS | responseLength=467 |
| C3a | Response has substantive content | PASS | Preview: "**What You Can Do Next**..." |

### 2.4 DV-Safe Mode

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| DV1 | DV-safe session created + completed | PASS | sessionId=cmlvlfnwq002rz874qs145ie8 |
| DV2 | DV chat thread created | PASS | threadId=cmlvlfsut003dz874y8uxrsch |
| DV3 | DV-safe message accepted (200) | PASS | Sensitive message sent |
| DV4 | Response does NOT echo sensitive text | PASS | "fleeing domestic violence" NOT in response |
| DV5 | Response includes safety/support guidance | PASS | Safety keywords found in response |
| DV6 | User message stored as redacted placeholder | PASS | content="[User message - redacted for safety]" |

### 2.5 Message Retrieval

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| C4 | Messages retrieved (>= 2) | PASS | count=2 |
| C5 | Both user + assistant roles present | PASS | |

### 2.6 Audit Events

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| A-CHAT_THREAD_CREATED | Audit event present | PASS | |
| A-CHAT_MESSAGE_USER | Audit event present | PASS | |
| A-CHAT_MESSAGE_ASSISTANT | Audit event present | PASS | |
| A4 | Audit meta excludes message content | PASS | No PII/message text in audit meta |

### 2.7 PII/DV Safety Scan

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| PII-ALL | All evidence files clean of PII | PASS | No email, phone, SSN, DOB, or name fields detected |

**Test Sessions Used:**
- Non-DV: `cmlvlfg14001uz874o2759a4q`
- DV-Safe: `cmlvlfnwq002rz874qs145ie8`

---

## 3. Provider Dashboard Smoke Test

### 3.1 Access Control

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| P1 | Unauthenticated GET /sessions -> 401 | PASS | Access denied without cookie |

### 3.2 Authentication

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| P2 | Provider login -> 200, success:true | PASS | |
| P2a | Set-Cookie contains c2c_provider_auth | PASS | Cookie set in response |
| P2b | Cookie is httpOnly | PASS | httpOnly flag present |

### 3.3 Session Listing

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| P3 | GET /sessions -> 200 | PASS | count=8 sessions returned |
| P3a | Session data available | PASS | sessionId available for detail test |
| P3b | Session list excludes raw modules | PASS | No `"modules": {` in response |

### 3.4 Session Detail

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| P4 | GET /session/:id -> 200 | PASS | |
| P4a | Detail includes profile | PASS | |
| P4b | Detail includes topFactors | PASS | |
| P4c | Detail includes audit data | PASS | |
| P4d | Detail excludes raw modules | PASS | |

### 3.5 Privacy Headers

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| HDR-sessions-list | All 3 headers on /sessions | PASS | |
| HDR-session-detail | All 3 headers on /session/:id | PASS | |
| P5 | All privacy headers verified | PASS | Cache-Control, X-Robots-Tag, Referrer-Policy |

**Headers Verified:**
- `Cache-Control: private, no-store, no-cache, must-revalidate`
- `X-Robots-Tag: noindex, nofollow`
- `Referrer-Policy: no-referrer`

### 3.6 Logout

| ID | Assertion | Status | Detail |
|----|-----------|--------|--------|
| P6 | Logout -> 200, success:true | PASS | |
| P6a | Cookie cleared on logout | PASS | Max-Age=0 in Set-Cookie |
| P7 | Post-logout GET /sessions -> 401 | PASS | Session properly invalidated |

---

## 4. Evidence Files

All evidence stored in `out/phase10/20260220-194119/` (suite runner)
with sub-directories for individual tests.

| File | Description |
|------|-------------|
| `SUMMARY.md` | Auto-generated Markdown summary |
| `suite-results.json` | Full suite results JSON |
| `preflight-results.json` | Preflight check details |
| `chat-smoke.json` | Chat pipeline all assertions JSON |
| `chat-normal-message-response.json` | Normal chat response evidence |
| `chat-dv-safe-response.json` | DV-safe mode response evidence |
| `chat-messages-list.json` | Message retrieval evidence |
| `chat-audit-events.json` | Chat audit event trail |
| `provider-smoke.json` | Provider dashboard all assertions JSON |
| `provider-login-evidence.json` | Login flow evidence (token redacted) |
| `provider-sessions-list.json` | Session listing evidence |
| `provider-session-detail.json` | Session detail evidence |

---

## 5. Code Fixes Applied During Smoke Testing

### 5.1 Chat Audit Event Signature Fix

**File:** `backend/src/intake/v2/routes/intakeV2.ts`

The chat endpoints called `writeAuditEvent(prisma, sessionId, eventType, requestId, meta)` 
(5-arg, old signature). The current `writeAuditEvent` function accepts 
`(sessionId, eventType, meta?, requestId?)` (2-4 args).

**Fix:** Updated all three chat audit calls to use correct signature:
- `CHAT_THREAD_CREATED` (L1237)
- `CHAT_MESSAGE_USER` (L1384)
- `CHAT_MESSAGE_ASSISTANT` (L1388)

### 5.2 Audit Event Type Registration

**File:** `backend/src/intake/v2/audit/auditWriter.ts`

Added `CHAT_THREAD_CREATED`, `CHAT_MESSAGE_USER`, `CHAT_MESSAGE_ASSISTANT` to 
`V2AuditEventType` union. Added `messageLength`, `redacted`, `templateId`, 
`responseLength` to `META_ALLOWLIST`.

---

## 6. Security Verification Summary

| Security Check | Result |
|---------------|--------|
| Unauthenticated provider access blocked (401) | PASS |
| Post-logout access blocked (401) | PASS |
| httpOnly cookie flag | PASS |
| DV-safe message redaction | PASS |
| Sensitive text NOT echoed in response | PASS |
| No PII in evidence files | PASS |
| No message content in audit meta | PASS |
| Privacy headers (Cache-Control, X-Robots-Tag, Referrer-Policy) | PASS |
| Token/cookie redacted in evidence JSON | PASS |

---

## 7. Reproduction Commands

```powershell
# Full suite (production)
$env:PROVIDER_DASHBOARD_TOKEN = "[your-token]"
.\scripts\smoke\test-phase10-complete-prod.ps1 `
    -ApiBase "https://api.care2connects.org" -ThrottleMs 600

# Chat only
.\scripts\smoke\test-chat-pipeline-prod.ps1 `
    -ApiBase "https://api.care2connects.org"

# Provider only
.\scripts\smoke\test-provider-dashboard-prod.ps1 `
    -ApiBase "https://api.care2connects.org"

# Local development
.\scripts\smoke\test-phase10-complete-prod.ps1 `
    -ApiBase "http://localhost:3001" -ThrottleMs 200
```

---

*Generated: 2026-02-20 19:41 EST*  
*Evidence pack produced by Phase 10 Complete Smoke Test Suite*
