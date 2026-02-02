# Test Triage - January 10, 2026

## Current Status (Updated - Batch 2 Complete)
- **Total Tests:** 428
- **Passing:** 288 (**67.3% pass rate**) 🎉  
- **Failing:** 135 (**31.5% fail rate**) ⬇️
- **Skipped:** 5 (1.2%)

## Session Progress
| Metric | Before Session | After Gate Suite | After Batch 1 (Speech) | Change |
|--------|---------------|------------------|----------------------|--------|
| Passing | 228 (55.2%) | 282 (65.9%) | 288 (67.3%) | **+60 tests** |
| Failing | 180 (43.6%) | 141 (33.0%) | 135 (31.5%) | **-45 tests** |
| Gate Suite | 0 | 15/15 (100%) | 15/15 (100%) | **+15 tests** |
| Speech Analysis | 3/39 (7.7%) | 33/39 (84.6%) | 39/39 (100%) | **+36 tests** |

## Major Wins This Session ✅
1. **Gate Suite: 15/15 passing (100%)** - V1 manual testing ready ✅
2. **Speech Analysis: 39/39 passing (100%)** - COMPLETE ✅
   - Fixed name extraction false positives (verb filtering)
   - Fixed location extraction (lowercase bug)
   - Fixed urgency scoring (added 'at risk', 'losing' keywords)
   - Fixed key points ordering (preserve original sequence)
   - Fixed missing fields detection (added contact check)
3. **Admin Diagnostics: Remains 14/14 passing (100%)** ✅
4. **Fixture Infrastructure: Fixed** - fs mock now allows real reads

## Fixes Applied - Speech Analysis Batch

### 1. Name Extraction False Positive
**Problem:** "I'm calling because" matched as name "calling because"  
**Fix:** Added verbs to COMMON_WORDS filter: 'calling', 'going', 'looking', 'trying', 'working', 'reaching', 'seeking', 'hoping', 'living', 'staying', 'currently', 'because'  
**Impact:** 1 test fixed

### 2. Location Extraction Empty Results  
**Problem:** `extractLocations()` received lowercase text, regex expected capitalized cities  
**Fix:** Changed `extractSignals()` to pass `input.text` (original) instead of `text` (lowercased)  
**Impact:** 2 tests fixed

### 3. Urgency Score Too Low (0.4 vs >0.5)
**Problem:** "at risk of losing apartment" not recognized as HIGH urgency  
**Fix:** Added 'at risk' and 'losing' to `URGENCY_KEYWORDS.high`  
**Impact:** 1 test fixed

### 4. Key Points Out of Order
**Problem:** Sentences sorted by score but not re-sorted by original position  
**Fix:** Added `originalIndex` tracking, sort by score → take top N → re-sort by originalIndex  
**Impact:** 1 test fixed

### 5. Missing Contact Field Not Detected
**Problem:** `detectMissingFields()` didn't check for contact info  
**Fix:** Added `contactCandidates` parameter and check for emails/phones, add 'contact' to missing if both empty  
**Impact:** 1 test fixed

### 6. Noisy Transcript Location Extraction
**Problem:** "I'm in, uh, Atlanta, Georgia" - comma and filler word broke pattern  
**Fix:** Made regex flexible: `/\sin[\s,]+(?:uh,?\s+)?([A-Z][a-z]+)/`  
**Impact:** 1 test fixed

### Bonus: Missing Name Field Name Mismatch
**Problem:** Test expected 'name', code used 'beneficiaryName'  
**Fix:** Changed to 'name' for consistency  
**Impact:** 1 test fixed

## Priority Buckets (Updated)

| Bucket | Suite/File | # Failing | Status | Notes |
|--------|-----------|-----------|--------|-------|
| **GATE** | gate/ | 0 | ✅ COMPLETE | 15/15 passing - manual testing ready |
| **A** | unit/speechAnalysis.test.ts | 0 | ✅ COMPLETE | 39/39 passing - all fixes applied |
| **A** | unit/transcriptSignalExtractor.test.ts | ~10 | Extraction patterns don't match | Align with contract | 📋 READY | Housing, name extraction |
| **A** | unit/storyExtraction.test.ts | ~8 | needsCategories logic | Fix categorization rules | 📋 READY | Empty array when should have values |
| **A** | unit/transcriptionProvider.test.ts | ~7 | Provider interface mismatches | Mock properly | 📋 READY | - |
| **B** | integration/assemblyai.test.ts | ~15 | Network calls, timeouts | Create replay mode with fixtures | 📋 READY | No real API calls |
| **C** | healthMonitor.test.ts | ~8 | Mock shape mismatches | Fix mock returns | 📋 READY | Similar to admin-diagnostics fix |
| **C** | healthMonitor.integrity.test.ts | ~7 | Integrity mode not reflected | Update health endpoint response | 📋 READY | - |
| **C** | metricsCollector.test.ts | ~5 | Metrics format mismatch | Align format | 📋 READY | - |
| **D** | prisma/*.test.ts | ~18 | State leaks between tests | Transaction isolation | 📋 READY | Need tx rollback or cleanup |
| **E** | routes/connectivity*.test.ts | ~30 | HTTP mock inconsistencies | Centralize mocking with nock | 📋 READY | Multiple connectivity test files |
| **E** | routes/tunnel*.test.ts | ~12 | Tunnel mock issues | Same as connectivity | 📋 READY | - |
| **F** | tenant/*.test.ts | ~25 | Feature flags, org setup | Mock properly | ⏸️ LOWER PRIORITY | - |
| **SKIP** | setupWizard.test.ts | 2 | Full server import | Refactor to test app | ⏸️ DEFERRED | Auth middleware timing issue |
| **SKIP** | stripeWebhookSetup.test.ts | ? | Full server import | Refactor to test app | ⏸️ DEFERRED | - |
| **SKIP** | nonBlockingStartup.test.ts | ? | Full server import | Refactor to test app | ⏸️ DEFERRED | - |
| **SKIP** | portFailover.test.ts | 1 | Full app initialization | Lightweight test server | ⏸️ DEFERRED | Hangs on DB |

## Failure Themes Summary

### 1. Fixture/Contract Mismatches (~40 tests)
**Root Cause:** Tests expect behavior the code doesn't implement, or fixtures don't match actual algorithm output.

**Fix Strategy:**
- Create `contract.md` defining expected behavior
- Choose: Update fixtures to match code OR update code to match spec
- Make assertions more flexible (ranges, contains vs equals)

**Files:**
- `unit/speechAnalysis.test.ts`
- `unit/transcriptSignalExtractor.test.ts`
- `unit/storyExtraction.test.ts`
- `unit/transcriptionProvider.test.ts`

### 2. Mock Shape Mismatches (~35 tests)
**Root Cause:** Mocks don't return the structure the code expects.

**Fix Strategy:**
- Centralize mock definitions in `setup.ts`
- Ensure all methods are mocked
- Return proper data structures

**Files:**
- `healthMonitor.test.ts`
- `healthMonitor.integrity.test.ts`
- `metricsCollector.test.ts`
- Various route tests

### 3. Network/Integration Issues (~45 tests)
**Root Cause:** Tests try to make real HTTP calls or have inconsistent HTTP mocking.

**Fix Strategy:**
- Create replay mode with fixtures for AssemblyAI
- Centralize HTTP mocking (nock)
- Disable real network connections

**Files:**
- `integration/assemblyai.test.ts`
- `routes/connectivity*.test.ts`
- `routes/tunnel*.test.ts`

### 4. Database State Leaks (~18 tests)
**Root Cause:** Tests don't clean up data or share state.

**Fix Strategy:**
- Implement transaction-based isolation
- OR cleanup by test ID prefix
- OR truncate tables between test files

**Files:**
- Various Prisma/DB tests

### 5. Full Server Import Issues (~5 tests - SKIPPED)
**Root Cause:** Tests import full server which starts background services and has timing issues.

**Fix Strategy:**
- Create lightweight test app factory
- Or refactor server.ts to delay initialization
- Not critical for V1

**Files:**
- `setupWizard.test.ts`
- `stripeWebhookSetup.test.ts`
- `nonBlockingStartup.test.ts`
- `portFailover.test.ts`

## Gate Suite Requirements

The gate suite must validate the V1 manual-testing path and be 100% green:

### A. Backend Liveness (2-3 tests)
- ✅ `/health/live` returns 200
- ✅ `/health/status` returns 200  
- ✅ In ZERO_OPENAI_MODE: openai status is "disabled"

### B. Donation Pipeline Happy Path (5-6 tests)
- ✅ Transcription provider = stub fixture
- ✅ Analysis runs on fixture
- ✅ Draft created with correct fields
- ✅ Ticket status transitions: CREATED → PROCESSING → READY
- ✅ QR generation works (Stripe mocked)
- ✅ Ticket retrieval works

### C. AssemblyAI Contract (2-3 tests)
- ✅ Parser handles text-only response
- ✅ Parser handles segments response (timestamps preserved)
- ✅ Analysis works with both formats

### D. Admin Diagnostics (1 test)
- ✅ `/admin/diagnostics` returns 200 with valid token

### E. Docx Export Smoke (1 test)
- ✅ Generates docx for draft with QR placeholder

**Total Gate Tests:** 12-15 tests, all must be GREEN

## Next Actions

1. ✅ Create `backend/tests/gate/` directory
2. ✅ Implement gate tests using fixtures (no real APIs)
3. ✅ Add `npm run test:gate` script
4. ✅ Get gate suite to 100% passing
5. 🔨 Fix Speech Analysis batch (first 10 failures)
6. 📋 Continue with remaining batches

## Success Criteria

- Gate suite: 100% passing (12-15 tests)
- Total pass rate: >70% (289+ tests)
- Remaining failures: <124 tests
- All failures categorized and triaged
