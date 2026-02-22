# Realistic Transcript Testing Analysis - Jan 27, 2026

**Date:** January 27, 2026  
**Agent:** AI Assistant  
**Context:** Urgency pattern validation using synthetic realistic transcripts

---

## 📋 Executive Summary

Created 50 realistic conversational transcripts using natural speech patterns to test urgency assessment without needing production data. Results reveal significant gaps beyond just urgency assessment.

**Key Findings:**
- ✅ **Realistic transcript generator created**: Generates natural conversational speech with varied urgency scenarios
- ⚠️ **Pass rate: 32%** (16/50) - Much worse than core30 baseline (56.67%)
- ⚠️ **Category classification is biggest issue**: 38% wrong category (19/50 cases)
- ⚠️ **Name extraction failing**: 24% wrong names (12/50 cases)
- ⚠️ **Urgency assessment**: 14% over-assessed, 10% under-assessed (similar to core30)

---

## 🎯 Comparison: Core30 vs. Realistic50

| Metric | Core30 (Baseline) | Realistic50 (New) | Delta |
|--------|-------------------|-------------------|-------|
| **Pass Rate** | 56.67% (17/30) | 32.00% (16/50) | -24.67% |
| **Category Issues** | 0% | 38% (19 cases) | +38% |
| **Name Issues** | 0% | 24% (12 cases) | +24% |
| **Urgency Over** | 10% (3 cases) | 14% (7 cases) | +4% |
| **Urgency Under** | 33.3% (10 cases) | 10% (5 cases) | -23.3% |
| **Amount Issues** | 0% | 8% (4 cases) | +8% |

**Analysis:**
- Core30 tests are **too simple** - clean transcripts with clear signals
- Realistic50 exposes **upstream parsing issues** (category, name extraction)
- Urgency patterns actually perform **relatively well** compared to other fields
- Natural speech patterns (fillers, pauses) break category/name extraction

---

## 🔧 Realistic Transcript Generator

**Created:** `backend/eval/v4plus/generators/generate_realistic_transcripts.js`

**Features:**
- **Natural speech patterns**: Fillers ("um", "you know"), pauses ("..."), repetition
- **Varied name formats**: Common, Hispanic, Asian, hyphenated, apostrophes
- **Urgency distribution**: 15% CRITICAL, 35% HIGH, 40% MEDIUM, 10% LOW
- **Scenario templates**: SAFETY (violence, abuse), HEALTHCARE (emergency surgery), HOUSING (eviction), EMPLOYMENT (job loss), FAMILY (celebrations)
- **Deterministic generation**: Seeded RNG for reproducibility

**Usage:**
```bash
# Generate 50 realistic transcripts (default)
npm run eval:v4plus:generate-realistic

# Generate custom count with specific seed
npm run eval:v4plus:generate-realistic -- --count=100 --seed=2026

# Run evaluation on realistic transcripts
npm run eval:v4plus:realistic
```

**Sample Generated Transcript:**
```
Um, hi, I'm Michael Smith... There's an emergency. Someone is hurting my 
kids and we need to flee immediately. We need about $3,000 to get to a 
somewhere safe.
```

---

## 📊 Detailed Failure Analysis

### **1. Category Classification (38% failure rate)**

**Examples of failures:**
- SAFETY scenarios misclassified as HOUSING/EMERGENCY
- HEALTHCARE scenarios misclassified as EMERGENCY/FAMILY
- EMPLOYMENT scenarios misclassified as HOUSING

**Root Cause Hypothesis:**
- Natural speech patterns confuse category keywords
- Multiple categories mentioned (safety + housing) - unclear priority
- Filler words break pattern matching

**Impact:** HIGH - Category is critical for routing cases to correct resources

**Recommendation:** 
- Add category classification robustness to fillers/pauses
- Implement category priority hierarchy (SAFETY > HEALTHCARE > HOUSING)
- Test with more realistic speech patterns

---

### **2. Name Extraction (24% failure rate)**

**Examples of failures:**
- Names with fillers: "Um, hi, I'm... John Smith" → Extracts "Um John Smith"
- Names with pauses: "My name is... Sarah... Johnson" → Extracts partial name
- Names in context: "This is Maria calling" → Misses or extracts wrong text

**Root Cause Hypothesis:**
- Name extraction regex too strict (doesn't handle pauses)
- Filler words included in name tokens
- Positional assumptions (expects "My name is X" exact format)

**Impact:** HIGH - Name is required field, wrong name = wrong beneficiary

**Recommendation:**
- Add name cleaning phase (strip fillers, pauses, extra words)
- Support varied introduction formats ("This is X", "X calling", "I'm X")
- Test with realistic speech patterns and diverse name formats

---

### **3. Urgency Assessment (24% combined failure rate)**

**Over-assessed (14%, 7 cases):**
- HIGH urgency scenarios escalated to CRITICAL
- MEDIUM urgency scenarios escalated to HIGH/CRITICAL
- Likely due to emotional language + category boost interaction

**Under-assessed (10%, 5 cases):**
- CRITICAL urgency scenarios downgraded to HIGH
- Safety/violence scenarios not triggering CRITICAL patterns
- Likely missing urgency keywords or patterns not matching natural speech

**Root Cause (Confirmed from previous session):**
- Pattern matching works on clean text
- Natural speech breaks word boundaries or adds noise
- Category boosts may over-escalate when combined with certain keywords

**Impact:** MEDIUM - Already known issue, stable at ~24% combined failure

**Recommendation:**
- Continue with production transcript validation (original plan)
- Pattern enhancements from previous session are sound
- Focus on upstream issues (category, name) first

---

### **4. Amount Detection (8% failure rate)**

**Missing amounts (6%, 3 cases):**
- Amounts expressed in written form: "three thousand dollars"
- Amounts with context: "about $2,000 or so" → Extracts "2000 or so"
- Amounts with noise: "I need, um, $1,500" → May miss

**Outside tolerance (2%, 1 case):**
- Amount extracted but not exact (e.g., $2,000 vs $2,100)

**Impact:** LOW - Relatively small failure rate

**Recommendation:**
- Add written number parsing ("three thousand" → 3000)
- Improve amount extraction to handle fillers/pauses
- Lower priority than category/name issues

---

## 🎯 Prioritized Action Plan

### **PHASE 1: Fix Category Classification (HIGH PRIORITY)**

**Problem:** 38% of realistic transcripts have wrong category

**Actions:**
1. Analyze failing cases: REALISTIC_5, REALISTIC_8, REALISTIC_10
2. Add category priority hierarchy (SAFETY > HEALTHCARE > HOUSING > EMPLOYMENT)
3. Make category patterns robust to fillers ("um", "you know", pauses)
4. Test with realistic50 until <10% failure rate

**Expected Impact:** +30% pass rate improvement

---

### **PHASE 2: Fix Name Extraction (HIGH PRIORITY)**

**Problem:** 24% of realistic transcripts have wrong name

**Actions:**
1. Analyze failing cases: REALISTIC_5, REALISTIC_9, REALISTIC_18
2. Add name cleaning phase (strip fillers, pauses, extra tokens)
3. Support varied introduction formats (not just "My name is X")
4. Test with diverse name formats (hyphenated, apostrophes, titles)
5. Test with realistic50 until <5% failure rate

**Expected Impact:** +20% pass rate improvement

---

### **PHASE 3: Refine Urgency Patterns (MEDIUM PRIORITY)**

**Problem:** 24% urgency failures (14% over, 10% under)

**Actions:**
1. Already completed pattern enhancements (previous session)
2. Focus on under-assessed CRITICAL cases (REALISTIC_2, REALISTIC_7, REALISTIC_15)
3. Validate patterns handle natural speech (fillers, pauses)
4. Test with realistic50 until <15% combined failure rate

**Expected Impact:** +10% pass rate improvement

---

### **PHASE 4: Improve Amount Detection (LOW PRIORITY)**

**Problem:** 8% amount failures (missing or tolerance)

**Actions:**
1. Add written number parsing ("three thousand" → 3000)
2. Make amount extraction robust to fillers/noise
3. Test with realistic50 until <5% failure rate

**Expected Impact:** +5% pass rate improvement

---

## 📈 Expected Pass Rate Progression

| Phase | Focus | Expected Pass Rate | Cumulative Improvement |
|-------|-------|-------------------|------------------------|
| **Baseline** | Current state | 32% | - |
| **Phase 1** | Category classification | 62% | +30% |
| **Phase 2** | Name extraction | 82% | +50% |
| **Phase 3** | Urgency patterns | 92% | +60% |
| **Phase 4** | Amount detection | 97% | +65% |

**Target:** 95% pass rate on realistic50 (STRICT threshold)

---

## 🔬 Technical Details

### **Generator Configuration**

**Seed:** 2026 (for reproducibility)
**Count:** 50 transcripts
**Distribution:**
- CRITICAL: 8 cases (16%)
- HIGH: 18 cases (36%)
- MEDIUM: 20 cases (40%)
- LOW: 4 cases (8%)

**Categories Covered:**
- SAFETY (violence, abuse, threats, fleeing)
- HEALTHCARE (emergency surgery, accidents, critical conditions)
- HOUSING (eviction, homelessness, rent due)
- EMPLOYMENT (job loss, unemployment, layoff)
- TRANSPORTATION (car repairs, commute issues)
- FAMILY (weddings, celebrations, personal matters)

**Natural Speech Features:**
- Filler words: "um", "uh", "like", "you know", "I mean"
- Pauses: "...", "..", empty
- Repetition: "I need, I need", "emergency... emergency"
- Varied intros: "Hi, my name is...", "This is X calling", "Um, I'm X"

---

## 📦 Deliverables

| File | Description | Status |
|------|-------------|--------|
| `backend/eval/v4plus/generators/generate_realistic_transcripts.js` | Realistic transcript generator (~650 lines) | ✅ Created |
| `backend/eval/v4plus/datasets/realistic50.jsonl` | 50 realistic test transcripts | ✅ Generated |
| `backend/package.json` | Added npm scripts for generation/evaluation | ✅ Updated |
| `backend/eval/v4plus/runners/run_eval_v4plus.js` | Added realistic50 dataset support | ✅ Updated |
| `REALISTIC_TRANSCRIPT_ANALYSIS_JAN27_2026.md` | This analysis document | ✅ Created |

---

## 💡 Key Insights

### **What Realistic Transcripts Revealed:**

1. **Core30 is too easy**: Clean, simple transcripts don't reflect real speech patterns
2. **Upstream parsing is weak**: Category and name extraction fail on natural speech
3. **Urgency patterns are relatively strong**: 24% failure vs. 38% category, 24% name
4. **Fillers/pauses break parsing**: Most failures involve "um", "...", "you know"
5. **Natural variation matters**: Real people don't say "My name is John Smith" cleanly

### **Why This Matters:**

- **Production transcripts will be worse**: Real AssemblyAI output has disfluencies
- **Testing should reflect reality**: Core30 gives false confidence
- **Holistic view needed**: Can't fix urgency in isolation from category/name
- **Synthetic data is valuable**: Can generate edge cases without PII concerns

---

## 🚀 Next Steps

### **Immediate Actions:**

1. ✅ **COMPLETE**: Created realistic transcript generator
2. ✅ **COMPLETE**: Generated 50 realistic transcripts with natural speech
3. ✅ **COMPLETE**: Ran evaluation baseline (32% pass rate)
4. ✅ **COMPLETE**: Analyzed failure patterns and prioritized fixes

### **Next Agent Actions:**

**Option A: Fix Category Classification First (Recommended)**
- Biggest impact (38% of failures)
- Blocking issue for correct case routing
- Start with Phase 1 action plan above

**Option B: Fix Name Extraction First**
- Second biggest impact (24% of failures)
- Critical for beneficiary identification
- Start with Phase 2 action plan above

**Option C: Continue Urgency Focus**
- User's original goal
- Already 56.67% on core30 (stable)
- Need to understand why realistic50 shows different distribution (14% over vs. 10% over on core30)

---

## 📝 Recommendations

### **For Urgency Assessment Specifically:**

**Current Status:**
- Core30: 56.67% pass rate (10 under, 3 over)
- Realistic50: 12 urgency failures out of 50 total (24% urgency-specific failure rate)
- Pattern enhancements completed (previous session): 56 patterns, cumulative scoring, word boundaries

**Key Question:** Why does realistic50 show 7 over-assessed vs. core30's 3 over-assessed?

**Hypothesis:**
1. **Natural speech triggers more patterns**: "um, this is an emergency" → both filler AND emergency keyword
2. **Category boost interaction**: Natural speech may hit category + urgency boost simultaneously
3. **Cumulative scoring over-counts**: Multiple weak signals in noisy speech add up to false positive

**Validation Needed:**
1. Examine specific over-assessed cases: REALISTIC_13, REALISTIC_20, REALISTIC_23
2. Check if fillers/pauses causing double-counting
3. Verify category boost not triggering on noise

**Action:**
- Generate detailed debug logs for failing realistic50 urgency cases
- Compare with equivalent core30 cases
- Adjust cumulative scoring weights or category boost logic if needed

---

## ✅ Conclusion

The realistic transcript testing approach successfully validates urgency patterns on more realistic data **and** exposes critical upstream parsing issues. Rather than just improving urgency from 56.67% to 95%, we now see the full picture:

**Reality Check:**
- Category classification: 38% failure (major blocker)
- Name extraction: 24% failure (major blocker)
- Urgency assessment: 24% failure (original focus)
- Amount detection: 8% failure (minor issue)

**Strategic Decision Point:**
Should we continue focused urgency improvements (user's original goal) or address holistic parsing quality first?

**Recommendation:** 
- Fix category classification first (Phase 1) - biggest impact
- Fix name extraction second (Phase 2) - critical for correct beneficiary
- Refine urgency patterns third (Phase 3) - builds on previous enhancements
- Then validate entire pipeline on production transcripts

**Value of Synthetic Realistic Transcripts:**
- ✅ No PII concerns
- ✅ Reproducible (seeded generation)
- ✅ Edge case coverage (natural speech patterns)
- ✅ Fast iteration (generate new cases on demand)
- ✅ Exposes real-world parsing weaknesses

---

**Generated by:** AI Assistant  
**Date:** January 27, 2026  
**Session Focus:** Realistic transcript generation for urgency pattern validation  
**Key Achievement:** Created synthetic testing approach that exposes upstream parsing issues beyond urgency assessment  
**Status:** ✅ Generator complete, baseline established, next steps identified
