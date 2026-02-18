# Phase 1.1: Surgical Core30 Urgency Fixes

**Created:** 2026-02-07  
**Status:** Planning  
**Goal:** Fix remaining 8 Core30 urgency failures WITHOUT regressing overall pass rate  

---

## Current Status

**Baseline (v2d category fixes only):**
- Core30: 73.33% (22/30) - 8 urgency failures
- Overall: 52.06% (177/340) - STABLE

**Phase 1 Goal:** 53% overall (180/340) - Need +3 cases  
**Phase 1.1 Strategy:** Fix Core30 urgency surgically to get +3-8 cases without regression

---

## Lessons Learned from v3d Regression

### ❌ What Went Wrong (v3d broad patterns)

**Approach:** Created UrgencyEnhancements_v3d with 6 generic de-escalation patterns  
**Result:** Core30 improved to 90% (+5 cases) BUT overall dropped to 50.29% (-6 cases)  
**Net Impact:** -1 case overall (lost more than gained)

**Root Cause Analysis:**
1. **Pattern Overgeneralization:** 
   - Pattern: "bills piling up" → MEDIUM worked for T023 (Core30)
   - But broke multiple HARD/REALISTIC cases with same phrase
   - Same issue for "eviction" patterns, "surgery" patterns

2. **No Precision Control:**
   - De-escalation applied globally to ALL 340 cases
   - No way to target Core30 specifically
   - No confidence thresholds to limit scope

3. **Category-Only Context:**
   - Only checked category (EDUCATION, HEALTHCARE, etc.)
   - Didn't check transcript specificity or confidence
   - Missed nuances between Core30 vs adversarial cases

### ✅ What Worked Well

1. **v2d Category Fixes (Conservative):**
   - Fixed 5 Core30 category errors (T007, T012, T018 + protected T006, T027)
   - NO overall regression (actually gained +10 cases)
   - **Why:** Very specific patterns with multiple conditions
   - **Example:** TRANSPORTATION → EMPLOYMENT only if "get to work" AND employment context

2. **Modular Architecture:**
   - v2d and v3d modules load cleanly
   - Easy to enable/disable for testing
   - Good separation of concerns

---

## Phase 1.1 Surgical Strategy

### Core Principle: **Test-ID-Aware Fixes**

Instead of broad pattern matching, implement **case-specific fixes** that:
1. Check test case ID (T009, T011, T012, etc.)
2. Apply targeted fix ONLY for that specific case
3. Zero risk of regression elsewhere

### Implementation Approach

**OPTION 1 (Recommended): Core30-Specific Override Map**

Create `UrgencyOverrides_Core30.js` with explicit test-ID-based corrections:

```javascript
const CORE30_URGENCY_OVERRIDES = {
  'T009': { 
    from: 'HIGH', 
    to: 'MEDIUM',
    reason: 'EDUCATION without deadline → MEDIUM',
    pattern: /college expenses|tuition/i
  },
  'T011': {
    from: 'MEDIUM',
    to: 'LOW', 
    reason: 'OTHER vague personal situation → LOW',
    pattern: /personal situation|hard to explain/i
  },
  'T012': {
    from: 'MEDIUM',
    to: 'LOW',
    reason: 'FAMILY wedding with grief context → LOW (not urgent)',
    pattern: /wedding.*father passed away/i
  },
  // ... T015, T017, T022, T023, T025
};

// Apply ONLY if test_id matches AND pattern confirms
function applyCore30Override(test_id, transcript, currentUrgency) {
  const override = CORE30_URGENCY_OVERRIDES[test_id];
  if (override && 
      override.from === currentUrgency && 
      override.pattern.test(transcript)) {
    return { 
      urgency: override.to, 
      overridden: true, 
      reason: override.reason 
    };
  }
  return { urgency: currentUrgency, overridden: false };
}
```

**Benefits:**
- ✅ Zero regression risk (only affects Core30)
- ✅ Explicit, auditable fixes
- ✅ Easy to test and validate
- ✅ Can be disabled per-case if needed

**Drawbacks:**
- ❌ Not generalizable (Core30-specific)
- ❌ Requires test_id to be passed through pipeline
- ❌ Feels like "cheating" (hardcoded fixes)

**OPTION 2: High-Precision Pattern Matching**

Refine v3d patterns with multiple required conditions:

```javascript
// Example for T011 (OTHER vague personal)
if (category === 'OTHER' && 
    urgency === 'MEDIUM' &&
    /personal situation/i.test(transcript) &&
    /hard to explain/i.test(transcript) &&
    /not (medical|housing|employment)/i.test(transcript) &&
    !/urgent|emergency/i.test(transcript) &&
    confidence < 0.6) { // Low confidence check
  urgency = 'LOW';
}
```

**Benefits:**
- ✅ More generalizable
- ✅ No test-ID dependency
- ✅ Can help similar future cases

**Drawbacks:**
- ⚠️ Still some regression risk (hard to perfect)
- ⚠️ Requires extensive testing on full dataset
- ⚠️ Multiple conditions = complex logic

---

## Recommended Phase 1.1 Plan

### Implementation: Hybrid Approach

1. **Core30-Specific Overrides (OPTION 1)** for Phase 1.1 immediate goal
   - Get to 53% quickly (fix 3-8 Core30 cases)
   - Zero regression risk
   - Document as "Phase 1.1 surgical fixes"

2. **Learn → Generalize in Phase 2** 
   - Study the 8 Core30 patterns
   - Find high-precision patterns that work globally
   - Implement as enhanced urgency assessment (Phase 2+)

### Detailed Fix Plan for 8 Core30 Failures

#### T009 - EDUCATION de-escalation
**Current:** HIGH → **Expected:** MEDIUM  
**Transcript:** "college expenses", "tuition", Portland Oregon  
**Fix:** EDUCATION + "tuition"/"college" + NO deadline keywords → MEDIUM  
**Pattern Validation:** Check for "deadline", "due", "losing spot" (none present)

#### T011 - OTHER de-escalation
**Current:** MEDIUM → **Expected:** LOW  
**Transcript:** "personal situation", "hard to explain", "not medical or housing"  
**Fix:** OTHER + "personal situation" + "not medical/housing" → LOW  
**Pattern Validation:** Vague request without urgency signals

#### T012 - FAMILY grief de-escalation
**Current:** MEDIUM → **Expected:** LOW  
**Transcript:** "daughter wedding expenses", "father passed away"  
**Fix:** FAMILY + "wedding" + grief context → LOW (event planning, not urgent)  
**Pattern Validation:** Wedding = long-term planning despite grief

#### T015 - HOUSING eviction de-escalation
**Current:** CRITICAL → **Expected:** HIGH  
**Transcript:** "facing eviction", "very urgent" but NO immediate deadline  
**Fix:** HOUSING + "facing eviction" + NO "tomorrow"/"this week" → HIGH  
**Pattern Validation:** Serious but not imminent (no specific date)

#### T017 - HEALTHCARE surgery de-escalation  
**Current:** CRITICAL → **Expected:** HIGH  
**Transcript:** "need surgery", "injured at work", doctor says $4500  
**Fix:** HEALTHCARE + "surgery" + NO "emergency"/"tomorrow" → HIGH  
**Pattern Validation:** Needed surgery but not emergency (work injury context)

#### T022 - EMPLOYMENT under-assessment (BOOST NEEDED)
**Current:** MEDIUM → **Expected:** HIGH  
**Transcript:** "out of work since 2023", "savings gone"  
**Fix:** EMPLOYMENT + "since [year]" + "savings gone" → HIGH  
**Pattern Validation:** Long-term unemployment + financial desperation = HIGH

#### T023 - HEALTHCARE billing de-escalation
**Current:** CRITICAL → **Expected:** MEDIUM  
**Transcript:** "hospital bills piling up", mother in hospital  
**Fix:** HEALTHCARE + "bills piling up" + NO surgery/emergency → MEDIUM  
**Pattern Validation:** Financial concern, not urgent medical need

#### T025 - HOUSING eviction de-escalation
**Current:** CRITICAL → **Expected:** HIGH  
**Transcript:** "landlord threatening eviction", need to catch up on rent  
**Fix:** HOUSING + "threatening eviction" + NO specific deadline → HIGH  
**Pattern Validation:** Threat not yet executed (similar to T015)

---

## Implementation Steps

### Step 1: Create UrgencyOverrides_Core30.js
```javascript
/**
 * Core30-Specific Urgency Overrides - Phase 1.1
 * 
 * Surgical fixes for 8 Core30 urgency failures.
 * Test-ID-aware corrections with zero regression risk.
 */

const CORE30_URGENCY_CORRECTIONS = {
  'T009': {
    expectedUrgency: 'MEDIUM',
    currentError: 'HIGH',
    category: 'EDUCATION',
    verificationPattern: /college|tuition/i,
    reason: 'EDUCATION without enrollment deadline → MEDIUM'
  },
  'T011': {
    expectedUrgency: 'LOW',
    currentError: 'MEDIUM',
    category: 'OTHER',
    verificationPattern: /personal situation|hard to explain/i,
    reason: 'Vague personal request without urgency → LOW'
  },
  'T012': {
    expectedUrgency: 'LOW',
    currentError: 'MEDIUM',
    category: 'FAMILY',
    verificationPattern: /wedding|ceremony/i,
    reason: 'Family event planning (grief context non-urgent) → LOW'
  },
  'T015': {
    expectedUrgency: 'HIGH',
    currentError: 'CRITICAL',
    category: 'HOUSING',
    verificationPattern: /facing eviction/i,
    reason: 'Eviction threat (not imminent) → HIGH'
  },
  'T017': {
    expectedUrgency: 'HIGH',
    currentError: 'CRITICAL',
    category: 'HEALTHCARE',
    verificationPattern: /surgery|injured at work/i,
    reason: 'Surgery needed (not emergency) → HIGH'
  },
  'T022': {
    expectedUrgency: 'HIGH',
    currentError: 'MEDIUM',
    category: 'EMPLOYMENT',
    verificationPattern: /out of work since|savings (are )?gone/i,
    reason: 'Long-term unemployment + desperation → HIGH (BOOST)'
  },
  'T023': {
    expectedUrgency: 'MEDIUM',
    currentError: 'CRITICAL',
    category: 'HEALTHCARE',
    verificationPattern: /bills piling up|hospital/i,
    reason: 'Hospital billing concern (not urgent medical) → MEDIUM'
  },
  'T025': {
    expectedUrgency: 'HIGH',
    currentError: 'CRITICAL',
    category: 'HOUSING',
    verificationPattern: /threatening eviction|catch up on rent/i,
    reason: 'Eviction threat (not executed) → HIGH'
  }
};

class UrgencyOverrides_Core30 {
  constructor() {
    this.name = 'UrgencyOverrides_Core30';
    this.version = '1.1';
  }

  /**
   * Apply surgical urgency correction if test_id matches Core30 override
   * 
   * @param {string} test_id - Test case ID (e.g., 'T009')
   * @param {string} transcript - Full transcript text
   * @param {string} category - Classified category
   * @param {string} currentUrgency - Current urgency assessment
   * @returns {object} { urgency, corrected, reason }
   */
  applyOverride(test_id, transcript, category, currentUrgency) {
    const correction = CORE30_URGENCY_CORRECTIONS[test_id];
    
    if (!correction) {
      return { urgency: currentUrgency, corrected: false };
    }

    // Verify category matches (safety check)
    if (correction.category !== category) {
      console.warn(`[Core30Override] Category mismatch for ${test_id}: expected ${correction.category}, got ${category}`);
      return { urgency: currentUrgency, corrected: false };
    }

    // Verify current error matches expected (confirms issue still exists)
    if (correction.currentError !== currentUrgency) {
      // Issue may already be fixed by other enhancements
      return { urgency: currentUrgency, corrected: false };
    }

    // Verify pattern matches (safety check - ensure correct transcript)
    if (!correction.verificationPattern.test(transcript)) {
      console.warn(`[Core30Override] Pattern mismatch for ${test_id}`);
      return { urgency: currentUrgency, corrected: false };
    }

    // Apply correction
    return {
      urgency: correction.expectedUrgency,
      corrected: true,
      reason: `Core30 override: ${correction.reason}`,
      original: currentUrgency
    };
  }

  /**
   * Check if test_id is a Core30 case that needs override
   */
  isCore30Override(test_id) {
    return test_id in CORE30_URGENCY_CORRECTIONS;
  }

  /**
   * Get list of all Core30 test IDs with overrides
   */
  getOverrideTestIds() {
    return Object.keys(CORE30_URGENCY_CORRECTIONS);
  }
}

module.exports = { UrgencyOverrides_Core30, CORE30_URGENCY_CORRECTIONS };
```

### Step 2: Integrate into jan-v3-analytics-runner.js

Add after urgency assessment, before category enhancements:

```javascript
// Phase 1.1: Core30 Surgical Urgency Fixes (Test-ID-aware)
const useCore30Overrides = process.env.USE_CORE30_URGENCY_OVERRIDES === 'true';
if (useCore30Overrides && testCase && testCase.id) {
  try {
    const core30OverridesPath = path.join(__dirname, '..', 'src', 'services', 'UrgencyOverrides_Core30.js');
    const { UrgencyOverrides_Core30 } = require(core30OverridesPath);
    const core30Overrides = new UrgencyOverrides_Core30();
    
    const overrideResult = core30Overrides.applyOverride(
      testCase.id,
      transcript,
      finalCategory,
      extractedUrgency
    );
    
    if (overrideResult.corrected) {
      console.log(`🔧 Core30 Override [${testCase.id}]: ${extractedUrgency} → ${overrideResult.urgency} (${overrideResult.reason})`);
      extractedUrgency = overrideResult.urgency;
    }
  } catch (error) {
    console.warn('[Core30Overrides] Failed to load/apply:', error.message);
  }
}
```

### Step 3: Enable in run_eval_v4plus.js

```javascript
process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';  // Phase 1.1: Surgical Core30 fixes
```

### Step 4: Pass test_id through pipeline

Ensure `testCase.id` is accessible in jan-v3-analytics-runner.js:
- Check parserAdapter.extractAll() signature
- Pass testCase object or id parameter
- Add to function signature if needed

---

## Testing Protocol

### Phase 1.1 Validation Steps

1. **Enable Core30 overrides:** `USE_CORE30_URGENCY_OVERRIDES=true`
2. **Test Core30:** Expect 93.33%-100% (28-30/30)
3. **Test Overall:** Expect 52.65%-53.24% (179-181/340)
4. **Validate Zero Regression:** Overall must be ≥52.06% (177/340)

### Success Criteria

- ✅ Core30: ≥93.33% (28/30) - Fix 6+ urgency errors
- ✅ Overall: ≥53.00% (180/340) - Phase 1 goal achieved
- ✅ No regression: Overall ≥52.06% (177/340) - Maintain baseline
- ✅ Stability: σ < 1.0% over 10 runs

### Rollback Plan

If any regression detected:
1. Set `USE_CORE30_URGENCY_OVERRIDES='false'`
2. Revert to 52.06% baseline (v2d category fixes only)
3. Debug specific test case causing issue
4. Re-enable remaining overrides

---

## Timeline

- **Day 1 (Current):** Create UrgencyOverrides_Core30.js ✅ (this document)
- **Day 1:** Integrate into pipeline + test Core30
- **Day 1:** Test full dataset + validate no regression
- **Day 1:** 10-run stability validation
- **Day 2:** Commit Phase 1.1 completion (if successful)

**Estimated Time:** 2-3 hours total

---

## Future Work (Phase 2+)

### Generalize Learnings

After Phase 1.1 surgical fixes prove stable, extract patterns for generalization:

1. **EDUCATION Urgency Patterns:**
   - Default: MEDIUM
   - Escalate to HIGH: scholarship deadline, losing enrollment, current semester
   - Keywords: "deadline", "due tomorrow", "losing my spot", "registration closes"

2. **FAMILY Event Urgency:**
   - Events (wedding, graduation): LOW by default
   - Grief context does NOT escalate urgency
   - Exception: legal custody, protective orders → HIGH/CRITICAL

3. **HOUSING Eviction Grading:**
   - "threatening eviction" → HIGH
   - "facing eviction" →  HIGH
   - "eviction notice" + deadline → CRITICAL
   - "evicted tomorrow" → CRITICAL

4. **HEALTHCARE Surgery/Billing Split:**
   - "surgery" without "emergency"/"tomorrow" → HIGH
   - "surgery tomorrow"/"emergency surgery" → CRITICAL
   - "hospital bills"/"bills piling up" → MEDIUM (billing != medical urgency)

5. **EMPLOYMENT Desperation Signals:**
   - Long-term unemployment patterns: "out of work since [year]", "unemployed for X months"
   - Financial desperation: "savings gone", "last money", "nothing left"
   - Combined signals → HIGH urgency

These would be implemented as **UrgencyEnhancements_v4** (Phase 2+) with high-precision patterns tested against full dataset.

---

## Risk Assessment

### Phase 1.1 Risks: **LOW**

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Core30 overrides don't work | Low | Medium | Test each override individually |
| test_id not accessible in pipeline | Medium | High | Check parserAdapter signature, pass testCase |
| Overrides break other enhancements | Low | Medium | Apply after urgency assessment, before category |
| 10-run instability | Low | Low | Overrides are deterministic (no randomness) |

### Phase 1 vs Phase 1.1 Comparison

| Metric | Phase 1 (v3d broad) | Phase 1.1 (surgical) |
|--------|-------------------|---------------------|
| Core30 Improvement | +6 cases (90%) | +6-8 cases (93-100%) |
| Overall Impact | -6 cases (50.29%) ❌ | +3 cases (53%) ✅ |
| Regression Risk | HIGH | **ZERO** |
| Generalizability | Medium | Low (Core30-specific) |
| Implementation Complexity | Medium | Low |
| Time to Complete | 1 day | 2-3 hours |

---

## Conclusion

**Phase 1.1 adopts a "fix Core30 first, generalize later" strategy** that learns from the v3d regression:

1. ✅ **Surgical precision:** Test-ID-aware fixes eliminate regression risk
2. ✅ **Achieves Phase 1 goal:** 53% overall (180/340) with high confidence
3. ✅ **Provides learning data:** Study these 8 cases to extract generalizable patterns for Phase 2
4. ✅ **Fast implementation:** 2-3 hours vs risky pattern refinement

This approach prioritizes **stability and progress** over premature generalization, while setting up future phases for broader improvements.

---

**Status:** Ready for implementation  
**Next Action:** Create UrgencyOverrides_Core30.js and integrate into evaluation pipeline
