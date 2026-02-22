# FEB v1.5 — TOP 10 FIXES PLAN
## Prioritized by Projected Yield on 840-Case STRICT Pass Rate
### Baseline: 5.36% STRICT (45/840) | February 12, 2026

---

## HOW STRICT SCORING WORKS (Critical for Yield Math)

A case passes STRICT (≥0.95) only if **all 4 fields** are correct (each field = 25%, so 3/4 = 0.75 = FAIL). This means:

- Fixing a field failure **only produces a STRICT pass if the other 3 fields were already correct**.
- The highest-yield fixes are those targeting fields where the **OTHER three fields already pass** — i.e., the fixed field is the **sole remaining blocker**.
- Cross-cutting fixes that improve multiple fields per case have multiplicative value.

### Current Field Accuracy (840 cases)

| Field | Correct | Accuracy | Failures |
|-------|---------|----------|----------|
| Name | 480 | 57.1% | 360 |
| Category | 518 | 61.7% | 322 |
| Urgency | 342 | 40.7% | 498 |
| Amount | 598 | 71.2% | 242 |

**Key Insight**: Urgency is by far the weakest field at 40.7%. Even if name, category, and amount were all perfect, only 40.7% of cases could pass STRICT. This makes urgency the rate-limiting field for the entire system.

---

## THE TOP 10 FIXES

---

### FIX #1: Lower HIGH Urgency Threshold (0.38 → 0.30)
**Bucket**: `urgency_threshold_miss` (416 failures — 29.3% of ALL failures)
**File**: `urgencyEngine.ts` — `scoreToLevel()` function
**Complexity**: LOW | **Risk**: MEDIUM | **Experiment**: `urgency_threshold_032` / `urgency_threshold_028`

#### The Problem
416 cases score between 0.13 and 0.38, landing in MEDIUM when HIGH was expected. The HIGH threshold at 0.38 is miscalibrated for v4plus expected values. In core30, 7 of 10 urgency under-assessments are MEDIUM→HIGH misses.

#### The Fix
Change the HIGH threshold from 0.38 to ~0.30. This is a single constant change:
```typescript
// urgencyEngine.ts scoreToLevel()
// BEFORE:  HIGH >= 0.38
// AFTER:   HIGH >= 0.30
```

#### Yield Projection
- **Direct field fixes**: ~250-300 of the 416 threshold_miss cases (conservative: cases scoring 0.30-0.38 flip from MEDIUM→HIGH)
- **STRICT yield**: Depends on how many of those 250-300 cases have all other fields correct. Estimated 30-50 new STRICT passes.
- **Urgency accuracy**: 40.7% → ~65-70%
- **Risk**: May over-promote some MEDIUM cases that should stay MEDIUM. Must validate against hard60 edge cases and the 82 over-assessed cases already present.

#### Execution Plan
1. Run `--experiment urgency_threshold_032` on core30 to test 0.32
2. Run `--experiment urgency_threshold_028` on core30 to test 0.28
3. Try 0.30 as a custom experiment
4. Compare all three against hard60 for regression detection
5. Select the threshold that maximizes core30 gains without hard60 regressions
6. Commit to production engine

#### Dependencies
None — standalone change.

---

### FIX #2: Expand SPOKEN_NUMBERS Map (10 → 43 entries)
**Bucket**: `amount_null_extraction` (227) + `amount_partial_match_override` (6) + `amount_spoken_number_failure` (5) = **238 failures**
**File**: `amountEngine.ts` — `ExplicitAmountPass.SPOKEN_NUMBERS`
**Complexity**: LOW | **Risk**: LOW | **Experiment**: `amount_v2`

#### The Problem
The BASELINE_SPOKEN_NUMBERS map has only 10 entries. "Two thousand", "three thousand five hundred", "twenty-eight hundred" etc. are all missing. Partial matches cause "five hundred" (500) to win over "three thousand five hundred" (3500).

#### The Fix
Already implemented as conditional logic in amountEngine.ts. The EXTENDED_SPOKEN_NUMBERS map (43 entries) activates when `USE_AMOUNT_V2=true`. Includes:
- All basic thousands (one thousand through ten thousand)
- Compound forms (three thousand five hundred, two thousand two hundred fifty)
- Teen hundreds (eleven hundred through nineteen hundred)
- Twenty-X and thirty-X hundred patterns
- Length-sorted matching with break-on-first-match to prevent partial match wins

#### Yield Projection
- **Direct field fixes**: ~150-180 of the 227 null extraction cases + most of the 6 partial match cases
- **STRICT yield**: Amount is the strongest field (71.2%), so many of these fixed cases likely have OTHER field failures too. Estimated 15-25 new STRICT passes.
- **Amount accuracy**: 71.2% → ~88-92%
- **Risk**: Very low — expanding a lookup table can't break existing matches (all baseline entries preserved in extended map).

#### Execution Plan
1. Run `--experiment amount_v2` on core30 — verify amount accuracy jumps to ~85%+
2. Run on hard60 to verify no amount regressions
3. Run on all to get full yield measurement
4. If gains confirmed, promote to production (make EXTENDED the new baseline)

#### Dependencies
None — standalone change. Already coded, just needs experiment validation.

---

### FIX #3: Add EMERGENCY + UTILITIES + OTHER Categories to NEEDS_KEYWORDS
**Bucket**: `category_vocabulary_gap` (76 failures — 5.3%)
**File**: `rulesEngine.ts` — `NEEDS_KEYWORDS` dictionary
**Complexity**: LOW | **Risk**: LOW | **Experiment**: `category_emergency`

#### The Problem
The NEEDS_KEYWORDS dictionary has 11 categories but the datasets expect EMERGENCY, UTILITIES, OTHER, and FAMILY (as standalone). When a transcript describes a house fire (EMERGENCY), the engine can't return EMERGENCY — it defaults to HOUSING because "housing" keywords appear in fire/shelter context.

#### The Fix
Add three new keyword lists to NEEDS_KEYWORDS:
```typescript
EMERGENCY: ['emergency', 'crisis', 'fire', 'flood', 'disaster', 'emergency shelter',
            'natural disaster', 'tornado', 'hurricane', 'earthquake', 'displaced',
            'evacuation', 'red cross', 'fema', 'catastrophe', 'sudden'],
UTILITIES: ['utilities', 'electric', 'electricity', 'gas', 'water', 'power',
            'heating', 'utility bill', 'shut off', 'disconnection', 'energy assistance',
            'LIHEAP', 'weatherization'],
OTHER: ['other', 'general', 'miscellaneous', 'various', 'multiple needs',
        'different things', 'several issues']
```
Also add FAMILY as standalone (not just via CHILDCARE remap):
```typescript
FAMILY: ['family', 'children', 'kids', 'child', 'parenting', 'custody',
         'family support', 'family services', 'reunification', 'foster']
```

#### Yield Projection
- **Direct field fixes**: ~50-60 of the 76 vocabulary gap cases
- **STRICT yield**: 8-15 new STRICT passes (category fixes only yield STRICT if other 3 fields already pass)
- **Category accuracy**: 61.7% → ~68-72%
- **Risk**: Low for EMERGENCY/UTILITIES (new categories, no overlap issues). FAMILY might create conflicts with existing CHILDCARE detection. OTHER needs careful keyword selection to avoid being a catchall.

#### Execution Plan
1. Add EMERGENCY keywords first (most clear-cut, 2 core30 cases: T010, T029)
2. Run core30 to verify T010, T029 now return EMERGENCY
3. Add UTILITIES keywords
4. Add FAMILY as standalone
5. Run hard60 + fuzz200 for regression check
6. Handle OTHER carefully — may need priority rules rather than just keywords

#### Dependencies
Fix #5 (category priority rules) may be needed to prevent EMERGENCY vs. HOUSING conflicts where both keyword sets match.

---

### FIX #4: Add Name Introduction Patterns ("Hello/Hi, I'm X Y")
**Bucket**: `name_intro_pattern_missing` (77 failures — 5.4%) + `name_null_extraction` (231) = **up to 308 failures**
**File**: `rulesEngine.ts` — `COMPILED_EXTRACTION_PATTERNS.name`
**Complexity**: LOW-MEDIUM | **Risk**: MEDIUM | **Experiment**: `name_v2`

#### The Problem
The 12 existing name patterns don't match several common introduction forms:
- "Hello, my name is X Y" (missing "Hello" prefix)
- "Hi, I'm X Y" (may fail due to contraction + comma handling)
- "Yeah, so my name is X Y" (hesitation prefixes)
- "Um, I'm X Y" (filler words before introduction)

77 cases are classified as `name_intro_pattern_missing` specifically. Another 231 are `name_null_extraction` which may include both pattern-missing and other causes.

#### The Fix
Add 5-7 new patterns:
```typescript
// Filler/hesitation-tolerant patterns
/(?:(?:hello|hey|hi|yeah|yes|okay|ok|so|well|um|uh),?\s*)?(?:my (?:full )?name(?:'s| is))\s+([A-ZÀ-ÿ]...)/i
/(?:(?:hello|hey|hi|yeah|yes|okay|ok|so|well|um|uh),?\s*)?(?:i'm|i am)\s+([A-ZÀ-ÿ]...)/i

// "I go by X" / "people call me X"
/(?:i go by|people call me|everyone calls me)\s+([A-ZÀ-ÿ]...)/i

// Standalone name at sentence start: "Sarah Johnson here"   
/^([A-ZÀ-ÿ][a-zÀ-ÿ'-]+\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+)\s+here\b/im
```

#### Yield Projection
- **Direct field fixes**: ~50-70 of the 77 intro pattern cases, plus ~30-50 of the 231 null extraction cases
- **STRICT yield**: 15-25 new STRICT passes
- **Name accuracy**: 57.1% → ~67-72%
- **Risk**: New patterns can introduce false positives if too broad. Each pattern needs careful anchoring. Must test against NAME_REJECT_PATTERNS.

#### Execution Plan
1. Analyze the 77 intro_pattern_missing transcripts to catalog the exact introduction forms
2. Write patterns covering the top 5 forms by frequency
3. Run core30 with `--experiment name_v2`
4. Check for false positives (no new name_reject_filter_failure cases)
5. Run hard60 for edge case validation
6. Run full suite for regression check

#### Dependencies
Fix #6 (NAME_REJECT_PATTERNS) should be done concurrently to prevent false positives from broader patterns.

---

### FIX #5: Category Priority Rules (Primary Need vs. Contextual Mentions)
**Bucket**: `category_priority_conflict` (235 failures — 16.5%)
**File**: `rulesEngine.ts` — `extractNeeds()` and `scoreKeywords()` functions
**Complexity**: MEDIUM-HIGH | **Risk**: HIGH | **Experiment**: None yet (needs new experiment)

#### The Problem
The category engine uses pure keyword frequency counting. "Lost my job and can't pay rent" scores EMPLOYMENT higher than HOUSING because "lost my job", "work", etc. produce more keyword hits — even though the PRIMARY need is housing. 235 cases have this wrong-priority problem.

In core30: T006 (EMPLOYMENT→HOUSING), T017 (EMPLOYMENT→HEALTHCARE), T027 (EMPLOYMENT→EDUCATION) all show employment keywords overshadowing the actual need.

#### The Fix
Three possible approaches (test all, pick best):

**Approach A — Contextual Weighting**: Weight keywords that appear near "need", "help with", "looking for" at 2× vs. background mentions. "Lost my job" is context, "need help with rent" is primary need.
```typescript
// Score = base_keyword_count + (2 × keywords_near_need_phrases)
```

**Approach B — Sentence-Level Scoring**: Score each sentence independently, return the category from the sentence with the highest urgency signal rather than the document-level keyword sum.

**Approach C — Priority Hierarchy**: Define a fixed priority order — EMERGENCY > SAFETY > HEALTHCARE > HOUSING > FOOD > EDUCATION > EMPLOYMENT > TRANSPORTATION > LEGAL > OTHER. When two categories score within 20% of each other, the higher-priority one wins.

#### Yield Projection
- **Direct field fixes**: ~100-150 of the 235 priority conflict cases (conservative — many are genuinely ambiguous)
- **STRICT yield**: 20-35 new STRICT passes
- **Category accuracy**: 61.7% → ~73-78%
- **Risk**: HIGH — changing the fundamental category scoring algorithm affects every case. Must be tested extensively across all datasets. Approach C is lowest risk, Approach A is most accurate but hardest to calibrate.

#### Execution Plan
1. Create a new experiment `category_priority_v2` with env flag `USE_CATEGORY_PRIORITY`
2. Implement Approach C first (simplest, safest)
3. Test on core30 — verify T006, T017, T027 flip correctly
4. Test on hard60 — watch for the 11 `category_multi_signal_conflict` cases
5. If Approach C achieves <50% of target, implement Approach A
6. Full regression test before promotion

#### Dependencies
Fix #3 (vocabulary gap) should be done FIRST — there's no point fixing priority logic for categories that don't exist yet.

---

### FIX #6: Strengthen NAME_REJECT_PATTERNS
**Bucket**: `name_reject_filter_failure` (7 failures — 0.5%)
**File**: `rulesEngine.ts` — `NAME_REJECT_PATTERNS`
**Complexity**: LOW | **Risk**: LOW | **Experiment**: `strict_name_reject`

#### The Problem
Current NAME_REJECT_PATTERNS have 10 entries but miss common false positives. "Facing eviction" (T008) and "calling because" (T028) both pass through as names. The broader `name_null_extraction` bucket (231 cases) likely includes cases where garbage was extracted and should have been rejected.

#### The Fix
Add targeted reject patterns:
```typescript
// Action phrases commonly extracted as names
/^(facing|calling|dealing|struggling|trying|getting|having|living|working)\s/i
/\b(eviction|foreclosure|emergency|because|about|regarding)\b/i

// Common non-name verb phrases
/^(need|want|help|just|been|have|can|will|going|looking|asking)\s/i

// Add minimum name validation: must contain at least 2 words, each ≥2 chars
// Reject single-word "names" and very short fragments
```

#### Yield Projection
- **Direct field fixes**: 5-7 of the 7 reject_filter cases + ~10-20 cases from larger null_extraction bucket
- **STRICT yield**: 3-5 new STRICT passes (small count but high precision)
- **Name accuracy improvement**: ~1-2% (57.1% → ~59%)
- **Risk**: Very low — reject patterns only block bad matches, don't affect good ones.

#### Execution Plan
1. Catalog all 7 `name_reject_filter_failure` cases to identify exact patterns
2. Write targeted reject patterns for each
3. Run core30 with `--experiment strict_name_reject`
4. Verify T008 and T028 now return null (better than wrong name)
5. Run full suite to confirm no good names are being rejected

#### Dependencies
Should be implemented alongside Fix #4 (new intro patterns) to prevent new patterns from producing new false positives.

---

### FIX #7: Fix Name Partial Capture (First Name Only)
**Bucket**: `name_partial_capture` (45 failures — 3.2%)
**File**: `rulesEngine.ts` — name pattern capture groups and post-processing
**Complexity**: MEDIUM | **Risk**: MEDIUM | **Experiment**: Needs new experiment

#### The Problem
45 cases extract only the first name ("Brian" instead of "Brian Anderson"). This happens when:
- The regex capture group stops after the first word
- Name post-processing truncates at a word boundary it misidentifies
- Suffix/title stripping removes the last name

In core30: T024 extracts "Brian" but drops "Anderson".

#### The Fix
Two changes needed:

**A — Pattern capture group audit**: Review all 12 patterns to ensure capture groups extend to 2-4 words:
```typescript
// Ensure patterns capture: FirstName LastName [OptionalMiddle] [OptionalSuffix]
([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){1,3})
```

**B — Post-processing fix**: The `stripTitles()` function and any name truncation logic needs review to ensure it doesn't drop valid last names. Add minimum 2-word validation after stripping.

#### Yield Projection
- **Direct field fixes**: ~30-35 of 45 partial capture cases
- **STRICT yield**: 8-12 new STRICT passes
- **Name accuracy**: ~3-4% improvement (57.1% → ~61%)
- **Risk**: Widening capture groups can pull in non-name words. Must test against reject patterns.

#### Execution Plan
1. Read the 45 partial capture case IDs from the report
2. Sample 10 cases to identify the dominant partial capture pattern
3. Fix the specific capture group(s) causing truncation
4. Test on core30 (T024 should now return "Brian Anderson")
5. Test on hard60 and fuzz200 for regression

#### Dependencies
Best done after Fix #4 and Fix #6 so the new patterns and reject filters are already in place.

---

### FIX #8: Tame the Critical Override (Single Layer ≥ 0.85)
**Bucket**: `urgency_engine_conflict` (80 failures — 5.6%)
**File**: `urgencyEngine.ts` — critical override logic
**Complexity**: MEDIUM | **Risk**: HIGH | **Experiment**: Needs new experiment

#### The Problem
When ANY single layer (contextual, safety, or explicit) reaches ≥0.85, the engine ignores the weighted average and uses the maximum layer score. This causes aggressive over-assessment — 80 cases are pushed to CRITICAL or HIGH when they should be MEDIUM or HIGH.

In core30: T015 and T025 get CRITICAL when HIGH was expected. T023 gets CRITICAL when MEDIUM was expected. The safety layer fires on domestic violence keywords in non-DV contexts.

#### The Fix
Two options:

**Option A — Raise the override threshold**: Change from 0.85 to 0.92 so only truly extreme signals trigger the override.

**Option B — Require 2 layers above threshold**: Instead of single-layer override, require that at least 2 of the 3 layers (contextual, safety, explicit) score above 0.85 before overriding the weighted average.

**Option C — Remove the override entirely**: Let the weighted average do its job. The CRITICAL threshold (0.70) is already high enough that truly critical cases will reach it through normal weighting.

#### Yield Projection
- **Direct field fixes**: ~40-50 of the 80 conflict cases
- **STRICT yield**: 10-15 new STRICT passes
- **Urgency accuracy improvement**: ~5-6% (combined with Fix #1)
- **Risk**: HIGH — the override exists to catch genuinely critical safety situations. Removing or weakening it could under-assess real emergencies.

#### Execution Plan
1. Create experiment `urgency_override_strict` with higher threshold (0.92)
2. Test on core30 — verify T015, T023, T025 improve
3. Test on hard60 — watch for genuine safety cases being under-assessed
4. If Option A doesn't work, try Option B (2-layer requirement)
5. Full regression test before promotion

#### Dependencies
Should be done AFTER Fix #1 (threshold adjustment) since both affect urgency scoring and need to be calibrated together.

---

### FIX #9: Category Context Modifier Audit (SAFETY Floor at 0.95)
**Bucket**: `urgency_multiplier_override` (2 failures) + indirect contribution to `urgency_engine_conflict` (80) + `category_priority_conflict` (235)
**File**: `urgencyEngine.ts` — `applyContextModifiers()` function
**Complexity**: MEDIUM | **Risk**: HIGH | **Experiment**: Needs new experiment

#### The Problem
The category modifiers in `applyContextModifiers()` have aggressive floors:
- SAFETY: Floor at **0.95** → always CRITICAL regardless of actual urgency signals
- LEGAL: Floor at **0.50** → always HIGH minimum
- HEALTHCARE: Complex escalation ladder that can reach 0.85 (CRITICAL) quickly

When the category detection is wrong (235 priority_conflict cases), a wrong category modifier fires and pushes urgency to the wrong level. This creates a cascading failure: wrong category → wrong urgency modifier → wrong urgency level. Two fields fail instead of one.

In core30: T016 gets FAMILY (wrong, should be SAFETY), then the FAMILY floor (0.35) applies instead of the SAFETY floor (0.95). Ironically, when category is wrong in the SAFETY direction, urgency gets artificially boosted to CRITICAL.

#### The Fix
1. Lower SAFETY floor from 0.95 to 0.80 (still HIGH minimum, not auto-CRITICAL)
2. Lower LEGAL floor from 0.50 to 0.40
3. Simplify HEALTHCARE ladder — remove the escalation to 0.85
4. Make all category modifiers additive (+0.10, +0.15) instead of floor-based

#### Yield Projection
- **Direct field fixes**: ~20-30 urgency cases + prevents cascading failures from category errors
- **STRICT yield**: 5-10 new STRICT passes directly, but prevents ~20-30 double-failures
- **Risk**: HIGH — these modifiers were calibrated over months of testing. Changing them requires careful validation.

#### Execution Plan
1. Audit which of the 80 `urgency_engine_conflict` cases have wrong category as the upstream cause
2. Test with SAFETY floor lowered to 0.80 on core30
3. Test with additive approach vs. floor approach on hard60
4. Compare against the 82 existing over-assessed cases

#### Dependencies
MUST be done after Fix #5 (category priority rules) — improving category accuracy reduces the number of wrong modifiers that fire.

---

### FIX #10: Merge EMPLOYMENT/JOBS Categories  
**Bucket**: `category_priority_conflict` (235) — sub-cause: duplicate scoring  
**File**: `rulesEngine.ts` — `NEEDS_KEYWORDS` dictionary  
**Complexity**: LOW | **Risk**: LOW | **Experiment**: None needed

#### The Problem
NEEDS_KEYWORDS defines both EMPLOYMENT (15 keywords) and JOBS (11 keywords) with heavy overlap ("job", "work", "employment", "unemployed", "income", "paycheck", "career", "hire", "hiring", "looking for work", "need a job" appear in BOTH). This double-counting inflates employment-related scores, making EMPLOYMENT win category races against HOUSING, EDUCATION, HEALTHCARE etc. even when employment is only mentioned as context.

#### The Fix
Remove the JOBS category entirely and merge any unique keywords into EMPLOYMENT:
```typescript
// BEFORE: EMPLOYMENT (15 keywords) + JOBS (11 keywords, mostly duplicates)
// AFTER:  EMPLOYMENT (15 keywords, no change — JOBS had no unique entries)
```
Also update `mapCategoryToEvaluationFormat()` to map any residual JOBS→EMPLOYMENT.

#### Yield Projection
- **Direct field fixes**: ~15-25 of the 235 priority_conflict cases where employment was artificially boosted by double-counting
- **STRICT yield**: 5-8 new STRICT passes
- **Category accuracy improvement**: ~2-3%
- **Risk**: Very low — JOBS and EMPLOYMENT produce identical outputs and the map already remaps JOBS→EMPLOYMENT.

#### Execution Plan
1. Delete the JOBS entry from NEEDS_KEYWORDS
2. Verify JOBS→EMPLOYMENT mapping still exists in adapter
3. Run core30 — check if T006, T017, T027 improve (employment over-scoring cases)
4. Run full suite for regression check

#### Dependencies
None — standalone change. Should be done early as it reduces noise for Fix #5.

---

## IMPLEMENTATION ORDER (Phased Execution Plan)

### Phase 1: Zero-Risk Table Expansions (Fixes #2, #10, #3)
**Expected cumulative yield**: 5.36% → ~12-15% STRICT

| Order | Fix | Action | Verify |
|-------|-----|--------|--------|
| 1a | #2 | Activate `amount_v2` experiment | core30 amount: 46.7% → 85%+ |
| 1b | #10 | Delete JOBS from NEEDS_KEYWORDS | core30 category: 70% → 73%+ |
| 1c | #3 | Add EMERGENCY/UTILITIES/FAMILY keywords | core30 category: 73% → 78%+ |
| Gate | — | Run `--dataset all` full regression | No metric worse than baseline |

### Phase 2: Name Extraction (Fixes #4, #6, #7)
**Expected cumulative yield**: ~12-15% → ~18-22% STRICT

| Order | Fix | Action | Verify |
|-------|-----|--------|--------|
| 2a | #6 | Add NAME_REJECT_PATTERNS | core30 T008, T028 return null |
| 2b | #4 | Add intro patterns (hello/hi/filler-tolerant) | core30 name: 66.7% → 80%+ |
| 2c | #7 | Fix partial capture (last name dropping) | core30 T024 returns full name |
| Gate | — | Run `--dataset all` full regression | Name accuracy 57% → 70%+ |

### Phase 3: Urgency Recalibration (Fixes #1, #8, #9)
**Expected cumulative yield**: ~18-22% → ~35-45% STRICT

| Order | Fix | Action | Verify |
|-------|-----|--------|--------|
| 3a | #1 | Lower HIGH threshold (0.38 → 0.30) | core30 urgency: 53% → 70%+ |
| 3b | #8 | Raise critical override threshold (0.85 → 0.92) | T015, T023, T025 corrected |
| 3c | #9 | Audit category modifiers (lower SAFETY floor) | Urgency-category cascade reduced |
| Gate | — | Run `--dataset all` full regression | Urgency accuracy 40.7% → 60%+ |

### Phase 4: Algorithmic Category Improvement (Fix #5)
**Expected cumulative yield**: ~35-45% → ~45-55% STRICT

| Order | Fix | Action | Verify |
|-------|-----|--------|--------|
| 4a | #5 | Implement priority hierarchy (Approach C) | core30 category: 78% → 85%+ |
| 4b | #5 | If needed, add contextual weighting (Approach A) | hard60 category accuracy |
| Gate | — | Run `--dataset all --target 45` | STRICT ≥45% on 840 cases |

---

## YIELD SUMMARY TABLE

| Fix # | Target Bucket(s) | Failure Count | Est. Fixes | Est. New STRICT | Complexity | Risk |
|-------|-------------------|---------------|------------|-----------------|------------|------|
| **1** | urgency_threshold_miss | 416 | 250-300 | 30-50 | LOW | MED |
| **2** | amount_null + partial_match | 238 | 150-186 | 15-25 | LOW | LOW |
| **3** | category_vocabulary_gap | 76 | 50-60 | 8-15 | LOW | LOW |
| **4** | name_intro_pattern | 77+231 | 80-120 | 15-25 | LOW-MED | MED |
| **5** | category_priority_conflict | 235 | 100-150 | 20-35 | MED-HIGH | HIGH |
| **6** | name_reject_filter | 7 | 5-7 | 3-5 | LOW | LOW |
| **7** | name_partial_capture | 45 | 30-35 | 8-12 | MED | MED |
| **8** | urgency_engine_conflict | 80 | 40-50 | 10-15 | MED | HIGH |
| **9** | urgency_multiplier_override | 2+indirect | 20-30 | 5-10 | MED | HIGH |
| **10** | category double-counting | 235 sub | 15-25 | 5-8 | LOW | LOW |
| | | **TOTAL** | **740-963** | **119-200** | | |

**Projected final STRICT**: 45 + 119 to 200 = **164-245 / 840 (19.5% - 29.2%)**

> **Note**: These estimates assume independent yields. In practice, many cases have multiple failing fields — fixing one field only yields a STRICT pass when all others are already correct. The actual yield will be lower than the sum of individual estimates. The phased approach with regression gates after each phase will reveal the true cumulative impact.

---

## CRITICAL CONSTRAINTS

1. **One change at a time** — each fix gets implemented, tested on core30, then validated on hard60 before the next fix begins.
2. **No metric regression** — if any dataset's score drops after a fix, STOP and investigate before continuing.
3. **Experiment system** — all changes go through `--experiment` flags first. Only promote to production after full validation.
4. **Engine hash tracking** — the eval system tracks the SHA-256 hash of all 3 engine files. Every report records which engine version produced it.
5. **Report archival** — save the baseline report before starting. After each phase gate, save a snapshot for comparison.

---

*Generated from Feb v1.5 baseline: 5.36% STRICT (45/840) | Engine hash: 5c6ecbf29a68*
