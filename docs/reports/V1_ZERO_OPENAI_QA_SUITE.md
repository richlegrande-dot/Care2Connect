# V1 ZERO-OPENAI MODE - QA TEST SUITE

**Test Plan Version:** 1.0  
**Target Release:** V1 Stabilization  
**Test Environment:** Zero-OpenAI Mode (rules-based extraction, template-based generation)  
**Prerequisites:** Backend configured with AI_PROVIDER=rules, TRANSCRIPTION_PROVIDER=assemblyai

---

## 🎯 TEST OBJECTIVES

1. **Functional Completeness:** Verify all V1 flows work without OpenAI
2. **Quality Acceptance:** Validate 85-92% accuracy targets met
3. **Graceful Degradation:** Confirm no hard failures, only quality reduction
4. **Performance:** Verify latency improvements (12-30x faster than OpenAI)
5. **Cost Validation:** Confirm zero OpenAI API calls

---

## 📋 TEST MATRIX

### Critical User Flows (Must Pass 100%)

| Test ID | Flow | Provider | Success Criteria | Priority |
|---------|------|----------|------------------|----------|
| TC-001 | Profile Creation | Rules Engine | Profile created with name/age/needs | P0 |
| TC-002 | Story Recording | AssemblyAI + Rules | Transcript + extracted data | P0 |
| TC-003 | GoFundMe Draft | Template Library | Draft with title/story/goal | P0 |
| TC-004 | Donation Pitch | Template Library | Dignity-preserving 2-3 sentences | P0 |
| TC-005 | Profile Viewing | N/A | All fields display correctly | P0 |

### Quality Validation Tests (Target 85-92%)

| Test ID | Feature | Metric | Target | Measurement |
|---------|---------|--------|--------|-------------|
| TC-101 | Name Extraction | Accuracy | ≥92% | 50 sample transcripts |
| TC-102 | Age Extraction | Accuracy | ≥88% | 50 sample transcripts |
| TC-103 | Contact Extraction | Accuracy | ≥95% | 50 sample transcripts |
| TC-104 | Needs Classification | Accuracy | ≥85% | 50 sample transcripts |
| TC-105 | Story Quality | Rating | ≥3.8/5.0 | Human review (n=20) |

### Performance Tests (Target: 12-30x faster)

| Test ID | Operation | Target Latency | Baseline (OpenAI) | Pass Criteria |
|---------|-----------|----------------|-------------------|---------------|
| TC-201 | Profile Extraction | <100ms | 1,500ms | <200ms |
| TC-202 | Story Generation | <50ms | 1,000ms | <100ms |
| TC-203 | Classification | <30ms | 800ms | <50ms |
| TC-204 | Full Profile Flow | <2s | 3-5s | <3s |

### Stress Tests (Target: Zero API calls)

| Test ID | Scenario | Load | Duration | Pass Criteria |
|---------|----------|------|----------|---------------|
| TC-301 | Concurrent Profiles | 20 req/s | 2 min | 100% success, 0 API calls |
| TC-302 | Peak Load | 50 req/s | 5 min | ≥95% success, 0 API calls |
| TC-303 | Sustained Load | 10 req/s | 30 min | 100% success, 0 API calls |

---

## 🧪 TEST CASES

### TC-001: Profile Creation (Critical Path)

**Objective:** Verify complete profile creation flow without OpenAI

**Preconditions:**
- Backend running with AI_PROVIDER=rules
- User logged in with operator privileges

**Test Data:**
```
Transcript: "Hi, my name is Sarah Mitchell and I'm 34 years old. 
I live in Austin, Texas. I'm a single mother of two kids, ages 7 and 9. 
I lost my job as a retail manager three months ago due to store closure. 
I need help with rent, we're about to be evicted. I'm good at customer service 
and inventory management. My phone is 512-555-1234. I just want stability for my kids."
```

**Test Steps:**
1. Navigate to Create Profile page
2. Upload or paste transcript
3. Click "Create Profile" button
4. Wait for processing (should be <2 seconds)
5. Review generated profile fields

**Expected Results:**
```json
{
  "name": "Sarah Mitchell",
  "age": 34,
  "location": "Austin, Texas",
  "primaryNeeds": ["HOUSING", "EMPLOYMENT"],
  "skills": ["customer service", "inventory management"],
  "phone": "512-555-1234",
  "summary": "34-year-old single mother seeking housing and employment",
  "confidence": "high"
}
```

**Acceptance Criteria:**
- ✅ Profile created successfully (no errors)
- ✅ Name extracted correctly (100%)
- ✅ Age extracted correctly (100%)
- ✅ Location extracted correctly (100%)
- ✅ At least 1 need identified (priority: HOUSING)
- ✅ Phone number extracted and validated
- ✅ Process completes in <2 seconds

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### TC-002: Story Recording & Transcription

**Objective:** Verify audio transcription via AssemblyAI and profile extraction

**Preconditions:**
- Backend running with TRANSCRIPTION_PROVIDER=assemblyai
- ASSEMBLYAI_API_KEY configured
- Test audio file available (30-60 seconds)

**Test Data:**
- Audio file: `test-audio-housing-crisis.wav` (sample story)

**Test Steps:**
1. Navigate to Record Story page
2. Upload test audio file
3. Submit for transcription
4. Wait for AssemblyAI processing (~5-10 seconds)
5. Verify transcript appears
6. Trigger profile extraction
7. Review extracted data

**Expected Results:**
- ✅ Audio transcribed successfully
- ✅ Transcript text contains key information
- ✅ Profile data extracted from transcript
- ✅ Total time: <15 seconds (transcription + extraction)

**Acceptance Criteria:**
- ✅ No OpenAI API calls (check logs)
- ✅ AssemblyAI transcription confidence >85%
- ✅ Profile extraction completes without errors
- ✅ All available data extracted (name, age, needs)

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### TC-003: GoFundMe Draft Generation

**Objective:** Verify template-based GoFundMe draft generation

**Preconditions:**
- Profile created with minimum data (name, primary need, goal amount)
- User on GoFundMe draft page

**Test Data:**
```json
{
  "name": "Sarah Mitchell",
  "age": 34,
  "primaryNeed": "HOUSING",
  "description": "Single mother facing eviction, needs rent assistance",
  "goalAmount": 3500,
  "location": "Austin, Texas"
}
```

**Test Steps:**
1. Navigate to Generate GoFundMe Draft
2. Fill form with test data
3. Click "Generate Draft"
4. Review generated draft

**Expected Results:**
```
Title: "Help Sarah Mitchell with Housing"

Story: "Hi, I'm Sarah Mitchell, a 34-year-old Austin, Texas resident facing 
an urgent housing crisis. As a single mother, I'm working hard to secure 
stable housing and provide for my family.

Right now, I need help with rent assistance to avoid eviction. This is 
critical for maintaining stability for my children.

With your support of $3,500, I can secure housing and get back on my feet. 
This will allow me to focus on employment and rebuilding our lives.

Every donation, no matter the size, brings me one step closer to stability. 
Thank you for considering my story and helping me through this challenging time."

Category: Housing
Goal: $3,500
```

**Acceptance Criteria:**
- ✅ Draft generated in <100ms
- ✅ Title is dignity-preserving and specific
- ✅ Story has 3-4 paragraphs minimum
- ✅ Goal amount matches input
- ✅ Category auto-assigned correctly (HOUSING)
- ✅ No placeholder text like "[Please add details]" (if form filled)

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### TC-101: Name Extraction Accuracy

**Objective:** Validate rules engine achieves ≥92% name extraction accuracy

**Preconditions:**
- 50 test transcripts with known ground truth names
- Transcripts cover diverse patterns (formats, ethnicities, etc.)

**Test Data:** Use `backend/fixtures/name-extraction-test-set.json`

**Test Steps:**
1. Run batch extraction on 50 transcripts
2. Compare extracted names to ground truth
3. Calculate accuracy: (correct / total) * 100
4. Analyze failure patterns

**Expected Results:**
- ✅ Accuracy ≥92% (46+ correct out of 50)
- ✅ Failures are edge cases (nicknames, unusual formats)
- ✅ No complete misses on standard formats

**Sample Test Cases:**
```
1. "My name is John Smith" → PASS (standard format)
2. "Hi, I'm Maria Garcia" → PASS (informal format)
3. "This is Dr. James Wilson" → PASS (title format)
4. "Call me Mike" (full name Michael Thompson earlier) → EXPECTED FAIL (nickname)
5. "I go by 'Big Tony'" → EXPECTED FAIL (street name)
```

**Acceptance Criteria:**
- ✅ ≥92% accuracy on test set
- ✅ All standard formats extracted correctly
- ✅ Failure analysis documented for V2 improvement

**Pass/Fail:** _______

**Accuracy:** _____ / 50 = _____% 

**Notes:** _______________________________________

---

### TC-102: Age Extraction Accuracy

**Objective:** Validate ≥88% age extraction accuracy

**Preconditions:**
- 50 test transcripts with known ages
- Various age formats ("34 years old", "I'm 34", "age 34")

**Test Steps:**
1. Run batch extraction on 50 transcripts
2. Compare extracted ages to ground truth
3. Calculate accuracy
4. Verify age validation (18-100 range)

**Expected Results:**
- ✅ Accuracy ≥88% (44+ correct out of 50)
- ✅ Invalid ages rejected (<18, >100)
- ✅ Ambiguous cases handled gracefully (return null)

**Sample Test Cases:**
```
1. "I'm 34 years old" → PASS
2. "age is 42" → PASS
3. "I'm in my mid-30s" → EXPECTED FAIL (ambiguous)
4. "I'm 150 years old" → PASS (validation rejects)
5. "I'm a 25-year-old veteran" → PASS
```

**Acceptance Criteria:**
- ✅ ≥88% accuracy
- ✅ All standard formats extracted
- ✅ Age validation working correctly

**Pass/Fail:** _______

**Accuracy:** _____ / 50 = _____% 

---

### TC-103: Contact Extraction Accuracy

**Objective:** Validate ≥95% phone/email extraction accuracy

**Preconditions:**
- 50 transcripts with phone numbers and/or emails
- US phone formats, standard email formats

**Test Steps:**
1. Run extraction on 50 transcripts
2. Validate phone format: (XXX) XXX-XXXX or XXX-XXX-XXXX
3. Validate email format: RFC-compliant
4. Calculate accuracy

**Expected Results:**
- ✅ Accuracy ≥95% (48+ correct out of 50)
- ✅ Phone numbers normalized to standard format
- ✅ Invalid formats rejected

**Sample Test Cases:**
```
Phone:
1. "512-555-1234" → PASS
2. "(512) 555-1234" → PASS
3. "512.555.1234" → PASS (normalize to dashes)
4. "call me at 5125551234" → PASS (add formatting)
5. "555-1234" → EXPECTED FAIL (incomplete)

Email:
1. "sarah@email.com" → PASS
2. "contact_me@example.org" → PASS
3. "my email is sarah.mitchell@gmail.com" → PASS
4. "sarah at email dot com" → EXPECTED FAIL (not standard format)
```

**Acceptance Criteria:**
- ✅ ≥95% accuracy
- ✅ Phone normalization working
- ✅ Email validation working

**Pass/Fail:** _______

**Accuracy:** _____ / 50 = _____% 

---

### TC-104: Needs Classification Accuracy

**Objective:** Validate ≥85% needs classification accuracy (10 categories)

**Preconditions:**
- 50 transcripts with labeled ground truth needs
- Categories: HOUSING, FOOD, EMPLOYMENT, HEALTHCARE, etc.

**Test Steps:**
1. Run classification on 50 transcripts
2. Compare top 1-2 needs to ground truth
3. Calculate accuracy (match if ANY top need matches ground truth)
4. Analyze keyword scoring effectiveness

**Expected Results:**
- ✅ Accuracy ≥85% (43+ correct out of 50)
- ✅ Urgent keywords properly weighted
- ✅ Multi-need cases handled (can have 2-3 needs)

**Sample Test Cases:**
```
1. "I'm homeless and need shelter" → HOUSING (urgent)
2. "I can't afford food for my kids" → FOOD (urgent)
3. "Lost my job, need employment help" → EMPLOYMENT
4. "Need medication but no insurance" → HEALTHCARE
5. "Need housing and a job" → HOUSING + EMPLOYMENT (both)
```

**Acceptance Criteria:**
- ✅ ≥85% primary need accuracy
- ✅ Urgent cases flagged correctly
- ✅ Multi-need detection working

**Pass/Fail:** _______

**Accuracy:** _____ / 50 = _____% 

---

### TC-105: Story Quality Assessment

**Objective:** Validate template-generated stories achieve ≥3.8/5.0 rating

**Preconditions:**
- 20 generated stories from various categories
- Human reviewers (3 reviewers per story)
- Rating rubric: dignity (0-1), clarity (0-1), completeness (0-1), impact (0-2)

**Rating Rubric:**
- **Dignity (0-1):** Story maintains person's dignity, not exploitative
- **Clarity (0-1):** Story is clear and easy to understand
- **Completeness (0-1):** Story includes key elements (who, what, why, how)
- **Impact (0-2):** Story is compelling and motivates action

**Test Steps:**
1. Generate 20 stories (various needs categories)
2. Have 3 reviewers independently rate each (blind)
3. Average scores per story
4. Calculate overall average
5. Compare to OpenAI baseline (assumed 4.5/5.0)

**Expected Results:**
- ✅ Average rating ≥3.8/5.0
- ✅ No story rated <3.0/5.0 (minimum quality)
- ✅ Dignity score ≥0.9/1.0 (critical for mission)
- ✅ Acceptable quality reduction vs OpenAI (0.7 point drop)

**Sample Categories:**
1. HOUSING (eviction crisis) → Target: 4.0/5.0
2. FOOD (food insecurity) → Target: 3.8/5.0
3. EMPLOYMENT (job loss) → Target: 3.7/5.0
4. HEALTHCARE (medical bills) → Target: 3.9/5.0
5. VETERANS (service-related) → Target: 4.2/5.0
6. DOMESTIC_VIOLENCE (emergency) → Target: 4.0/5.0
7. GENERAL (mixed needs) → Target: 3.5/5.0

**Acceptance Criteria:**
- ✅ Overall average ≥3.8/5.0
- ✅ All stories ≥3.0/5.0 minimum
- ✅ Dignity maintained across all categories
- ✅ Stories are editable (operators can improve)

**Pass/Fail:** _______

**Average Rating:** _____ / 5.0

---

### TC-201: Profile Extraction Latency

**Objective:** Verify profile extraction is 12-30x faster than OpenAI

**Preconditions:**
- Backend in rules mode (AI_PROVIDER=rules)
- Test transcript ready (~500 words)

**Test Steps:**
1. Measure baseline: Run 10 extractions, calculate average latency
2. Compare to OpenAI baseline (1,500ms documented)
3. Verify p50, p95, p99 latencies
4. Ensure <200ms target met

**Expected Results:**
- ✅ p50 latency: <100ms (target: 50-100ms)
- ✅ p95 latency: <150ms (target: <200ms)
- ✅ p99 latency: <200ms (target: <300ms)
- ✅ 15x faster than OpenAI (1,500ms → 100ms)

**Test Data:**
```
Run 1: ___ ms
Run 2: ___ ms
Run 3: ___ ms
Run 4: ___ ms
Run 5: ___ ms
Run 6: ___ ms
Run 7: ___ ms
Run 8: ___ ms
Run 9: ___ ms
Run 10: ___ ms

Average: ___ ms
p50: ___ ms
p95: ___ ms
p99: ___ ms
```

**Acceptance Criteria:**
- ✅ Average <100ms
- ✅ p95 <200ms
- ✅ No outliers >300ms

**Pass/Fail:** _______

---

### TC-202: Story Generation Latency

**Objective:** Verify template generation is 20-50x faster than OpenAI

**Preconditions:**
- Backend in template mode
- Profile data ready

**Test Steps:**
1. Run 10 story generations
2. Measure latency each time
3. Calculate p50/p95/p99
4. Compare to OpenAI baseline (1,000ms)

**Expected Results:**
- ✅ p50 latency: <50ms (target: 20-50ms)
- ✅ p95 latency: <100ms (target: <100ms)
- ✅ p99 latency: <150ms (target: <200ms)
- ✅ 20x faster than OpenAI (1,000ms → 50ms)

**Test Data:**
```
Run 1: ___ ms
Run 2: ___ ms
...
Run 10: ___ ms

Average: ___ ms
p50: ___ ms
p95: ___ ms
```

**Acceptance Criteria:**
- ✅ Average <50ms
- ✅ p95 <100ms

**Pass/Fail:** _______

---

### TC-301: Concurrent Load Test (20 req/s)

**Objective:** Verify system handles 20 concurrent profile creations/second

**Preconditions:**
- Backend in stress test mode (AI_PROVIDER=none, TRANSCRIPTION_PROVIDER=stub)
- Stress test script ready: `.\scripts\stress-test-v1.ps1`

**Test Steps:**
1. Configure environment for stress test mode
2. Run stress test: `.\scripts\stress-test-v1.ps1 -Scenario recordings -Concurrency 20 -Duration 120`
3. Monitor metrics: success rate, latency, errors
4. Verify zero external API calls (check logs)

**Expected Results:**
- ✅ 100% success rate (0 failures)
- ✅ p95 latency <500ms
- ✅ Total requests: ~2,400 (20 req/s * 120s)
- ✅ Zero OpenAI API calls
- ✅ Zero AssemblyAI API calls (stub mode)

**Metrics:**
```
Total Requests: _______
Successful: _______
Failed: _______
Success Rate: _______% 

Latency:
  p50: ___ ms
  p95: ___ ms
  p99: ___ ms

External API Calls:
  OpenAI: ___ (target: 0)
  AssemblyAI: ___ (target: 0 in stub mode)
```

**Acceptance Criteria:**
- ✅ 100% success rate
- ✅ p95 <500ms
- ✅ 0 external API calls

**Pass/Fail:** _______

---

### TC-302: Peak Load Test (50 req/s)

**Objective:** Verify system handles peak load without degradation

**Test Steps:**
1. Run stress test: `.\scripts\stress-test-v1.ps1 -Scenario all -Concurrency 50 -Duration 300`
2. Monitor system resources (CPU, memory)
3. Track success rate and latency

**Expected Results:**
- ✅ ≥95% success rate (some failures acceptable at peak)
- ✅ p95 latency <1000ms (acceptable degradation at peak)
- ✅ Total requests: ~15,000 (50 req/s * 300s)
- ✅ No system crashes

**Acceptance Criteria:**
- ✅ ≥95% success rate
- ✅ p95 <1000ms
- ✅ System stable throughout test

**Pass/Fail:** _______

---

### TC-303: Sustained Load Test (10 req/s, 30 min)

**Objective:** Verify system stability under sustained load

**Test Steps:**
1. Run stress test: `.\scripts\stress-test-v1.ps1 -Scenario all -Concurrency 10 -Duration 1800`
2. Monitor for memory leaks, performance degradation
3. Track success rate over time

**Expected Results:**
- ✅ 100% success rate (no degradation over time)
- ✅ Consistent latency (no increasing trend)
- ✅ Total requests: ~18,000 (10 req/s * 1800s)
- ✅ No memory leaks

**Acceptance Criteria:**
- ✅ 100% success rate
- ✅ Stable latency throughout test
- ✅ Memory usage stable (<10% increase)

**Pass/Fail:** _______

---

## 🔍 REGRESSION TESTS

### TC-401: Zero OpenAI API Calls (Critical)

**Objective:** Confirm NO OpenAI API calls in V1 mode

**Test Steps:**
1. Configure backend: `AI_PROVIDER=rules`, `TRANSCRIPTION_PROVIDER=assemblyai`
2. Enable API call logging
3. Run complete user flow (record story → create profile → generate GoFundMe draft)
4. Check logs for OpenAI API calls

**Expected Results:**
- ✅ Zero calls to `api.openai.com`
- ✅ Zero OpenAI SDK initialization logs
- ✅ AssemblyAI calls present (transcription)
- ✅ Rules engine logs present (extraction)

**Pass/Fail:** _______

---

### TC-402: Graceful Degradation

**Objective:** Verify system never hard-fails on missing AI

**Test Steps:**
1. Remove ASSEMBLYAI_API_KEY temporarily
2. Attempt profile creation
3. Verify error handling (should return minimal data, not crash)
4. Restore API key

**Expected Results:**
- ✅ No application crashes
- ✅ Error message displayed to user
- ✅ Partial data saved (what's available)
- ✅ Operator can complete profile manually

**Pass/Fail:** _______

---

### TC-403: Provider Switching

**Objective:** Verify easy switching between provider modes

**Test Steps:**
1. Start with `AI_PROVIDER=rules`
2. Create test profile
3. Stop backend
4. Change to `AI_PROVIDER=none`
5. Restart backend
6. Create another test profile
7. Verify different behavior (none = stub data)

**Expected Results:**
- ✅ No code changes required
- ✅ Backend starts successfully with each mode
- ✅ Startup logs confirm provider selection
- ✅ Behavior matches provider mode

**Pass/Fail:** _______

---

## 📊 TEST EXECUTION SUMMARY

### Test Coverage

| Category | Total Tests | Passed | Failed | Pass Rate |
|----------|-------------|--------|--------|-----------|
| Critical Flows | 5 | ___ | ___ | ___% |
| Quality Validation | 5 | ___ | ___ | ___% |
| Performance | 3 | ___ | ___ | ___% |
| Stress Tests | 3 | ___ | ___ | ___% |
| Regression | 3 | ___ | ___ | ___% |
| **TOTAL** | **19** | ___ | ___ | ___% |

### Success Criteria Summary

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Name Extraction | ≥92% | ___% | ⬜ |
| Age Extraction | ≥88% | ___% | ⬜ |
| Contact Extraction | ≥95% | ___% | ⬜ |
| Needs Classification | ≥85% | ___% | ⬜ |
| Story Quality | ≥3.8/5.0 | ___/5.0 | ⬜ |
| Profile Latency | <100ms | ___ms | ⬜ |
| Story Latency | <50ms | ___ms | ⬜ |
| Stress Test Success | 100% | ___% | ⬜ |
| Zero OpenAI Calls | 0 | ___ | ⬜ |

### Overall Assessment

**V1 Zero-OpenAI Mode Readiness:** ⬜ READY / ⬜ NOT READY

**Blockers (if any):**
_____________________________________________

**Recommendations:**
_____________________________________________

**Sign-Off:**
- QA Lead: _________________ Date: _______
- Product Owner: ___________ Date: _______
- Tech Lead: _______________ Date: _______

---

## 📝 TEST DATA PREPARATION

### Required Test Assets

1. **Audio Files** (`backend/fixtures/test-audio/`)
   - `housing-crisis-30s.wav` - Housing need story
   - `food-insecurity-45s.wav` - Food need story
   - `employment-60s.wav` - Job loss story
   - `veterans-45s.wav` - Veteran services story
   - `multi-need-90s.wav` - Complex multi-need story

2. **Transcript Test Set** (`backend/fixtures/test-transcripts/`)
   - `name-extraction-test-set.json` - 50 transcripts with ground truth names
   - `age-extraction-test-set.json` - 50 transcripts with ages
   - `contact-extraction-test-set.json` - 50 transcripts with phone/email
   - `needs-classification-test-set.json` - 50 transcripts with labeled needs

3. **Profile Test Data** (`backend/fixtures/test-profiles/`)
   - `sample-profiles.json` - 20 complete profile samples

4. **Expected Output** (`backend/fixtures/expected-results/`)
   - Ground truth data for validation

---

## 🚀 RUNNING THE QA SUITE

### Automated Testing

```powershell
# Run full QA suite
cd backend
npm run test:qa:v1

# Run specific test category
npm run test:qa:accuracy
npm run test:qa:performance
npm run test:qa:stress
```

### Manual Testing

```powershell
# 1. Configure environment
cp .env.v1-zero-openai-template .env
# Edit .env with your ASSEMBLYAI_API_KEY

# 2. Start backend
npm start

# 3. Run manual test cases
# Follow test cases TC-001 through TC-403 above

# 4. Run stress tests
cd ../scripts
.\stress-test-v1.ps1 -Scenario all -Concurrency 20
```

---

## 📋 EXIT CRITERIA

V1 Zero-OpenAI Mode is approved for production deployment if:

1. ✅ All P0 critical flow tests pass (100%)
2. ✅ Quality targets met:
   - Name extraction ≥92%
   - Needs classification ≥85%
   - Story quality ≥3.8/5.0
3. ✅ Performance targets met:
   - Profile extraction <100ms average
   - Story generation <50ms average
4. ✅ Stress test passes:
   - 100% success rate at 20 req/s
   - p95 latency <500ms
5. ✅ Zero OpenAI API calls confirmed
6. ✅ No P0 or P1 bugs blocking release

**Document Version:** 1.0  
**Last Updated:** January 5, 2026  
**Status:** ⬜ DRAFT / ⬜ IN PROGRESS / ⬜ COMPLETE
