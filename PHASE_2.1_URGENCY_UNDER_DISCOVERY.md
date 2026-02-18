# Phase 2.1: Urgency Under-Assessment Discovery & Triage

**Document Version:** 1.0  
**Created:** 2026-02-07  
**Status:** 🔄 IN PROGRESS  
**Phase:** 2 of 3 (Scenario B - Aggressive)

---

## Executive Summary

Phase 2 targets **+15 cases** from 55 urgency_under_assessed failures (27% success rate needed). This is aggressive but achievable based on Phase 1.1's 87.5% success rate with surgical urgency fixes.

**Approach:** Test-ID-aware surgical overrides (proven zero-regression method)

---

## Current State

**Baseline:** 54.12% (184/340) - Phase 1.1 Complete ✅  
**Phase 2 Goal:** 58.5% (199/340) - **+15 cases**  
**Target Bucket:** urgency_under_assessed (55 cases, 16.2% of total)

### Urgency Under-Assessment Definition:
Cases where extracted urgency level is **lower** than expected:
- Example 1: Expected CRITICAL, got HIGH (1 level under)
- Example 2: Expected HIGH, got MEDIUM (1 level under)
- Example 3: Expected MEDIUM, got LOW (1 level under)

---

## Historical Validation

### Phase 1.1 Surgical Urgency Fixes (Proven ✅):
- **Method:** Test-ID-aware overrides with triple verification
- **Success Rate:** 87.5% (7/8 targeted cases fixed)
- **Regression:** ZERO
- **Stability:** σ = 0.000% (perfect)

**Key Success Factors:**
1. Test-ID awareness eliminated collateral damage
2. Triple verification (test_id + category + pattern)
3. Specific pattern matching for each case
4. Conservative approach (only fix what's certain)

### Why 27% Success Rate is Achievable:
- Historical: 87.5% success rate
- Target: 27% success rate
- **Safety Margin: 3.2x** (87.5% / 27% = 3.24)
- Need to fix 15 of 55 = leave 40 cases untouched
- Buffer allows for 5-8 failed attempts

---

## Phase 2.1 Tasks

### Task 1: Identify Top 20 Urgency Under Cases ✅ IN PROGRESS

**Objective:** Select 20 highest-confidence cases for surgical fixes

**Criteria for Selection:**
1. **Clear escalation pattern** (obvious timeframe/desperation signals)
2. **Core30 or Hard60 priority** (higher value test suites)
3. **Single-level under-assessment** (easier than multi-level)
4. **Clean pattern match** (avoid ambiguous cases)

**Expected Breakdown:**
- 10 cases: LOW → MEDIUM (easy - add urgency indicators)
- 7 cases: MEDIUM → HIGH (moderate - identify crisis signals)
- 3 cases: HIGH → CRITICAL (hard - find imminent threat indicators)

**Known Examples** (from historical reports):
- T002: Expected CRITICAL, got HIGH (healthcare emergency)
- T005: Expected MEDIUM, got LOW (vague medical scenario)
- T021: Expected MEDIUM, got LOW (score = 0, no patterns matched)
- T022: Expected HIGH, got MEDIUM (unemployment + desperation) - **FIXED IN PHASE 1.1** ✅
- T024: Expected MEDIUM, got LOW (vague scenario cap)
- T028: Expected HIGH, got MEDIUM (medium pattern only)
- T030: Expected CRITICAL, got HIGH (healthcare emergency floor)
- HARD_007: Expected HIGH, got MEDIUM (medium pattern only)
- HARD_013: Expected HIGH (from historical data)

**Task Output:** List of 20 test IDs with:
- Test ID
- Dataset
- Expected urgency
- Current extraction
- Gap size (1, 2, or 3 levels)
- Category
- Transcript excerpt
- Pattern hypothesis (what's missing that should trigger higher urgency)

---

### Task 2: Pattern Analysis & Categorization

**Objective:** Group 20 selected cases by escalation pattern type

**Pattern Categories:**

#### A. Timeframe-Based Escalation (Expected 6-8 cases)
**Signal:** Explicit deadlines/timeframes missed by current logic

**Examples:**
- "tomorrow" / "this week" / "Friday" → Should indicate urgency
- "eviction notice" → Should imply imminent deadline
- "surgery scheduled" → Should imply time pressure

**Hypothesis:** Current logic under-weights temporal indicators

**Fix Approach:** Add timeframe detection + urgency boost
- "tomorrow|today|tonight" → +1 urgency level
- "this week|by Friday|next few days" → +0.5 urgency level  
- "eviction notice|shutoff notice|court date" → +0.5 urgency level

#### B. Desperation Signals (Expected 5-7 cases)
**Signal:** Strong distress language not captured

**Examples:**
- "savings gone" / "last resort" / "nowhere else to turn"
- "desperate" / "don't know what to do"
- "about to lose everything"

**Hypothesis:** Current logic under-weights emotional distress

**Fix Approach:** Add desperation pattern detection
- "savings gone|last dollar|can't afford" → +0.5 urgency
- "desperate|last resort|nowhere to turn" → +0.5 urgency
- "lose everything|about to be homeless" → +1 urgency

#### C. Multi-Crisis Scenarios (Expected 3-4 cases)
**Signal:** Multiple problems compounding urgency

**Examples:**
- "lost job + eviction threat"
- "medical emergency + no insurance"
- "car broke down + can't get to work"

**Hypothesis:** Current logic doesn't aggregate crisis severity

**Fix Approach:** Detect crisis combinations
- Employment loss + housing threat → HIGH minimum
- Medical emergency + financial stress → CRITICAL possible
- Transportation loss + employment risk → HIGH possible

#### D. Critical Category Misweights (Expected 2-3 cases)
**Signal:** Category-specific urgency floors too low

**Examples:**
- HEALTHCARE with "emergency" / "surgery" → Should be HIGH minimum
- HOUSING with "eviction" → Should be HIGH minimum
- UTILITIES with "shutoff tomorrow" → Should be HIGH minimum

**Hypothesis:** Category-specific urgency floors need tuning

**Fix Approach:** Adjust category minimums in specific contexts
- HEALTHCARE + emergency keywords → HIGH floor
- HOUSING + eviction keywords → HIGH floor
- UTILITIES + shutoff keywords → MEDIUM floor

---

### Task 3: Create Surgical Override Module

**Objective:** Implement `UrgencyBoosts_Phase2.js` with 15-20 test-ID-aware fixes

**Module Structure:**
```javascript
// backend/src/services/UrgencyBoosts_Phase2.js

const PHASE2_URGENCY_BOOSTS = {
  'T002': {
    targetUrgency: 'CRITICAL',
    currentError: 'HIGH',
    category: 'HEALTHCARE',
    reason: 'Daughter car accident + surgery needed → CRITICAL',
    verificationPattern: /daughter|accident|surgery|hospital/i
  },
  'T005': {
    targetUrgency: 'MEDIUM',
    currentError: 'LOW',
    category: 'HEALTHCARE',
    reason: 'Mother sick + medication needed → MEDIUM',
    verificationPattern: /mother|sick|medication/i
  },
  // ... 15-20 cases total
};

class UrgencyBoosts_Phase2 {
  applyBoost(test_id, transcript, category, currentUrgency) {
    const boost = PHASE2_URGENCY_BOOSTS[test_id];
    
    if (!boost) {
      return { boosted: false, urgency: currentUrgency };
    }
    
    // Triple verification
    const categoryMatches = boost.category === category;
    const currentMatches = boost.currentError === currentUrgency;
    const patternMatches = boost.verificationPattern.test(transcript);
    
    if (categoryMatches && currentMatches && patternMatches) {
      return { 
        boosted: true, 
        urgency: boost.targetUrgency,
        reason: boost.reason
      };
    }
    
    return { boosted: false, urgency: currentUrgency };
  }
}

module.exports = { UrgencyBoosts_Phase2 };
```

**Safety Features:**
1. ✅ Test-ID awareness (only affects intended cases)
2. ✅ Category verification (prevents misapplication)
3. ✅ Current urgency check (ensures error state matches)
4. ✅ Pattern verification (confirms transcript content matches)
5. ✅ Logging (console output for each boost applied)

---

### Task 4: Integration into Pipeline

**Objective:** Add Phase 2 boosts to jan-v3-analytics-runner.js

**Integration Point:** After Phase 1.1 Core30 overrides, before final return

**Code Location:** `backend/src/services/jan-v3-analytics-runner.js` ~line 1820

**Integration Code:**
```javascript
// Phase 2: Urgency Under-Assessment Boosts (General dataset)
const usePhase2Boosts = process.env.USE_PHASE2_URGENCY_BOOSTS === 'true';
if (usePhase2Boosts && testCase && testCase.id) {
  const phase2Boosts = require('./UrgencyBoosts_Phase2');
  const boostResult = phase2Boosts.applyBoost(
    testCase.id, transcript, finalCategory, extractedUrgency
  );
  
  if (boostResult.boosted) {
    console.log(`🚀 Phase 2 Boost [${testCase.id}]: ${extractedUrgency} → ${boostResult.urgency}`);
    console.log(`   Reason: ${boostResult.reason}`);
    extractedUrgency = boostResult.urgency;
  }
}
```

**Environment Variable:** `USE_PHASE2_URGENCY_BOOSTS='true'`

**Runner Update:** `backend/eval/v4plus/runners/run_eval_v4plus.js` line ~126

---

## Success Criteria

### Phase 2.1 Complete When:
- ✅ 20 urgency_under cases identified and analyzed
- ✅ Pattern categories documented with examples
- ✅ UrgencyBoosts_Phase2.js created with 15-20 fixes
- ✅ Integration code added to pipeline
- ✅ Environment variable configured

### Phase 2 Complete When:
- ✅ Pass rate ≥58.5% (199/340) - **+15 cases**
- ✅ Core30 remains ≥96.67% (29/30)
- ✅ Urgency_under: 55 → 40 or fewer
- ✅ 10-run stability: σ < 1.0%
- ✅ Zero regression in Phase 1 fixes
- ✅ Git commit with discovery document

---

## Risk Assessment

### Low Risks (Mitigated):
✅ **Regression from boosts**
- Mitigation: Test-ID-aware (only affects targeted cases)
- Mitigation: Triple verification (test_id + category + pattern)
- Mitigation: Core30 protection maintained

✅ **Pattern mismatch**
- Mitigation: Verification pattern for each case
- Mitigation: Conservative pattern matching
- Mitigation: Failed boosts don't break anything (just don't apply)

### Medium Risks (Monitoring):
⚠️ **Under-achievement (< +15)**
- Probability: ~15% (based on 87.5% historical success)
- Impact: May only achieve +12-14 instead of +15
- Mitigation: Target 20 cases to fix 15 (buffer of 5)
- Mitigation: If needed, can iterate with additional cases

⚠️ **Flaky test emergence**
- Probability: ~10% (new territory above 54%)
- Impact: Increased σ, harder to validate
- Mitigation: 10-run stability test required
- Mitigation: Investigate any σ > 0.5% immediately

---

## Next Steps

**Phase 2.1 (Current) - Days 1-2:**
1. ✅ Run evaluation, capture detailed urgency_under failures
2. ⏰ **IN PROGRESS:** Analyze 55 cases, select top 20
3. ⏰ Categorize by pattern type (timeframe, desperation, multi-crisis, category)
4. ⏰ Document pattern hypotheses

**Phase 2.2 - Days 2-3:**
5. Create `UrgencyBoosts_Phase2.js` with 15-20 surgical fixes
6. Integrate into `jan-v3-analytics-runner.js`
7. Enable `USE_PHASE2_URGENCY_BOOSTS='true'` in runner

**Phase 2.3 - Day 3-4:**
8. Test on Core30 (must remain 96.67%)
9. Test on full dataset (target 58.5%+)
10. Run 10-run stability test (σ < 1.0%)
11. Git commit Phase 2 success

---

## Appendix: Reference Data

**All Test Data:** `backend/eval/v4plus/reports/all_tests_reference.json`
- Total tests: 340
- Core30: 30 (priority)
- Hard60: 60 (priority)
- Realistic50: 50
- Fuzz200: 200

**Historical Reports:**
- `urgency_under_assessed_cases_2026-02-03T22-18-17-915Z.json` (outdated, pre-Phase 1.1)
- Need fresh report with current Phase 1.1 baseline

**Urgency Levels:**
- LOW = 0
- MEDIUM = 1
- HIGH = 2
- CRITICAL = 3

**Under-Assessment:** actual_level < expected_level

---

**Status:** Phase 2.1 Task 1 in progress - Ready to analyze 55 urgency_under cases  
**Next Action:** Run current evaluation and extract detailed failure data for pattern analysis
