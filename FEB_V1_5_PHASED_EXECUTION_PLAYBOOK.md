# FEB v1.5 — PHASED EXECUTION PLAYBOOK
## 10 High-Yield Fixes → 4 Phases → Gate-Controlled Promotion
### Baseline: 5.36% STRICT (45/840) | Target: ≥45% STRICT

---

## DOCUMENT PURPOSE

This is the **operational playbook** for executing the 10 fixes identified in `FEB_V1_5_TOP_10_FIXES_PLAN.md`. Each fix has:
- Exact commands to run
- Gate criteria that must pass before moving forward
- Rollback procedure if a gate fails
- Dependency map showing what must be done first

**Rule**: Never skip a gate. Never start the next fix until the current fix's gate passes.

---

## PRE-FLIGHT CHECKLIST (Do Once Before Starting)

### 1. Archive the Baseline Report
```powershell
cd backend
copy eval\v1_5\reports\LATEST_core30_hard60_fuzz200_fuzz500_realistic50.json eval\v1_5\reports\BASELINE_FEB_V1_5.json
```

### 2. Record Baseline Engine Hash
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --dry-run 2>&1 | Select-String "engine_hash"
```
Save this hash. Every phase gate compares against it to track which engine version produced which results.

### 3. Verify Experiment System Works
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --list-experiments
```
Confirm all 9 experiments appear. If not, the experiment engine is misconfigured.

### 4. Identify Missing Experiment Registrations
The following fixes need NEW experiments registered in `experiment_engine.js` before they can be tested:

| Fix | Needs Experiment | Env Variable | Status |
|-----|-----------------|--------------|--------|
| #1  | `urgency_threshold_030` | `URGENCY_HIGH_THRESHOLD_OVERRIDE=0.30` | **NEEDS CREATION** |
| #5  | `category_priority_v2` | `USE_CATEGORY_PRIORITY=true` | **NEEDS CREATION** |
| #7  | `name_partial_fix` | `USE_NAME_PARTIAL_FIX=true` | **NEEDS CREATION** |
| #8  | `urgency_override_strict` | `USE_URGENCY_OVERRIDE_STRICT=true` | **NEEDS CREATION** |
| #9  | `urgency_modifier_audit` | `USE_URGENCY_MODIFIER_AUDIT=true` | **NEEDS CREATION** |

These will be registered at the start of the relevant phase.

### 5. Identify Missing Conditional Logic in Engine Files
The experiment system sets env variables, but the **engine code** must CHECK those variables. Current status:

| Env Variable | Engine File | Conditional Logic Exists? |
|-------------|-------------|--------------------------|
| `USE_AMOUNT_V2` | amountEngine.ts | ✅ YES (getter switches SPOKEN_NUMBERS map) |
| `USE_NAME_V2` | rulesEngine.ts | ❓ NEEDS VERIFICATION |
| `URGENCY_HIGH_THRESHOLD_OVERRIDE` | urgencyEngine.ts | ❓ NEEDS VERIFICATION |
| `USE_EMERGENCY_CATEGORY` | rulesEngine.ts | ❓ NEEDS VERIFICATION |
| `USE_STRICT_NAME_REJECT` | rulesEngine.ts | ❓ NEEDS VERIFICATION |

**Action**: Before each phase, verify the engine code actually reads the relevant env variable. If not, add the conditional logic as part of the fix implementation.

---

## PHASE 1: ZERO-RISK TABLE EXPANSIONS
### Fixes #2, #10, #3 | Complexity: LOW | Risk: LOW
### Expected: 5.36% → 12-15% STRICT

**Rationale**: These three fixes only add/remove entries from lookup tables. No algorithm changes. No threshold tuning. The lowest possible risk for the highest initial gains.

---

### STEP 1A — Activate Amount V2 (Fix #2)
**File**: `amountEngine.ts` (already implemented)
**What**: Verify the EXTENDED_SPOKEN_NUMBERS map activates via `--experiment amount_v2`

#### Pre-Check
Confirm the conditional getter exists:
```powershell
cd backend
Select-String -Path src\utils\extraction\amountEngine.ts -Pattern "USE_AMOUNT_V2" | Format-Table -AutoSize
```
If no results, the conditional logic is missing and must be added before proceeding.

#### Execute
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment amount_v2
```

#### Gate Criteria
| Metric | Baseline | Required | Stretch |
|--------|----------|----------|---------|
| Amount accuracy (core30) | 46.7% | ≥80% | ≥90% |
| Amount nulls (core30) | 9 | ≤3 | 0 |
| Other fields (core30) | — | No regression | — |

#### If Gate PASSES
```powershell
# Run hard60 for edge case validation
npx tsx eval/v1_5/runners/run_v1_5.js --dataset hard60 --experiment amount_v2

# Confirm no amount regressions on hard60
# Then run full suite
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50 --experiment amount_v2
```
Record the full-suite STRICT score. Save report.

#### If Gate FAILS
- Check that `USE_AMOUNT_V2` env variable is being set (log it in the engine)
- Check that the getter is actually returning EXTENDED_SPOKEN_NUMBERS
- Add console.log inside detect() to trace which map is active
- Do NOT proceed to Step 1B until this is resolved

#### Promotion Decision
If full-suite shows ≥2% STRICT improvement over baseline with no regressions:
- Make EXTENDED_SPOKEN_NUMBERS the permanent default (remove the conditional)
- Delete the BASELINE_SPOKEN_NUMBERS map
- Update the engine hash

---

### STEP 1B — Remove JOBS Duplicate Category (Fix #10)
**File**: `rulesEngine.ts` — `NEEDS_KEYWORDS` dictionary
**What**: Delete the JOBS entry entirely. Merge any unique keywords into EMPLOYMENT.

#### Pre-Analysis
```powershell
cd backend
Select-String -Path src\utils\extraction\rulesEngine.ts -Pattern "JOBS:|EMPLOYMENT:" | Format-Table -AutoSize
```
Examine both keyword lists side by side. Identify any keyword in JOBS that is NOT in EMPLOYMENT.

#### Execute
1. Delete the `JOBS: [...]` entry from NEEDS_KEYWORDS
2. Verify `mapCategoryToEvaluationFormat()` or equivalent still maps JOBS→EMPLOYMENT for any legacy path
3. Run evaluation:
```powershell
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30
```
(No experiment flag needed — this is a direct production change)

#### Gate Criteria
| Metric | Baseline | Required |
|--------|----------|----------|
| Category accuracy (core30) | 70.0% | ≥70.0% (no regression) |
| T006 category | EMPLOYMENT ❌ | HOUSING ✅ or closer |
| T017 category | EMPLOYMENT ❌ | Improved or same |
| STRICT (core30) | Baseline | ≥ Baseline |

#### If Gate FAILS
```powershell
# Revert the JOBS deletion
git checkout -- src/utils/extraction/rulesEngine.ts
```
Investigate why removing JOBS worsened results (shouldn't be possible if it's truly duplicated).

#### Promotion
Direct commit — this is a table cleanup, not an experiment.

---

### STEP 1C — Add EMERGENCY / UTILITIES / FAMILY Keywords (Fix #3)
**File**: `rulesEngine.ts` — `NEEDS_KEYWORDS` dictionary
**What**: Add three new category keyword lists

#### Pre-Check
Verify `USE_EMERGENCY_CATEGORY` conditional logic exists in `extractNeeds()`:
```powershell
cd backend
Select-String -Path src\utils\extraction\rulesEngine.ts -Pattern "USE_EMERGENCY_CATEGORY|EMERGENCY" | Format-Table -AutoSize
```
If no conditional logic exists, implement it:
- When `USE_EMERGENCY_CATEGORY=true`, include EMERGENCY/UTILITIES/FAMILY in keyword scoring
- When `false`, skip them (baseline behavior)

#### Execute (Experiment Mode)
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment category_emergency
```

#### Keywords to Add
```
EMERGENCY: ['emergency', 'crisis', 'fire', 'flood', 'disaster', 'emergency shelter',
            'natural disaster', 'tornado', 'hurricane', 'earthquake', 'displaced',
            'evacuation', 'red cross', 'fema', 'catastrophe']
UTILITIES: ['utilities', 'electric', 'electricity', 'gas bill', 'water bill', 'power',
            'heating', 'utility bill', 'shut off', 'disconnection', 'energy assistance',
            'LIHEAP', 'weatherization']
FAMILY:    ['family', 'children', 'kids', 'child', 'parenting', 'custody',
            'family support', 'family services', 'reunification', 'foster']
```

#### Gate Criteria
| Metric | Post-1B | Required | Stretch |
|--------|---------|----------|---------|
| Category accuracy (core30) | ~70% | ≥75% | ≥80% |
| T010 category | Wrong | EMERGENCY ✅ |
| T029 category | Wrong | EMERGENCY ✅ |
| STRICT (core30) | Post-1B | ≥ Post-1B |

#### If Gate FAILS
- Check if EMERGENCY keywords are conflicting with HOUSING (both fire-related)
- May need a priority rule: if `emergency` or `disaster` present, EMERGENCY wins over HOUSING
- This is a preview of Fix #5 — note it as a dependency but don't implement full priority logic yet

#### Promotion Decision
If experiment shows improvement: merge EMERGENCY/UTILITIES keywords into production NEEDS_KEYWORDS. Hold FAMILY if it conflicts with CHILDCARE.

---

### PHASE 1 GATE — Full Regression Test
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50
```

#### Phase 1 Gate Criteria
| Metric | Baseline | Phase 1 Required | Phase 1 Target |
|--------|----------|------------------|----------------|
| STRICT (840) | 5.36% (45) | ≥9% (76) | 12-15% (101-126) |
| Amount accuracy | 71.2% | ≥85% | ≥90% |
| Category accuracy | 61.7% | ≥65% | ≥70% |
| Name accuracy | 57.1% | ≥57.1% (no regression) | — |
| Urgency accuracy | 40.7% | ≥40.7% (no regression) | — |

#### Phase 1 Checkpoint Report
Save the report:
```powershell
copy eval\v1_5\reports\LATEST_core30_hard60_fuzz200_fuzz500_realistic50.json eval\v1_5\reports\PHASE1_COMPLETE.json
```

#### Phase 1 Rollback (Nuclear Option)
If Phase 1 gate fails catastrophically:
```powershell
git stash save "Phase 1 rollback - pre-investigation"
# Re-run baseline to confirm we're back to 5.36%
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50
```

---

## PHASE 2: NAME EXTRACTION IMPROVEMENTS
### Fixes #6, #4, #7 | Complexity: LOW-MEDIUM | Risk: MEDIUM
### Expected: 12-15% → 18-22% STRICT

**Rationale**: Name accuracy is at 57.1% — the second-weakest field. These three fixes work together: #6 tightens rejection (prevents false positives), #4 broadens extraction (catches more intros), and #7 fixes partial captures (gets full names). Order matters — reject patterns first, then new extraction patterns.

**Critical dependency**: Fix #6 MUST go before Fix #4. Broader extraction patterns without stronger rejection = more false positives.

---

### STEP 2A — Strengthen NAME_REJECT_PATTERNS (Fix #6)
**File**: `rulesEngine.ts` — `NAME_REJECT_PATTERNS`
**What**: Add reject patterns for common false positives

#### Pre-Check
Verify `USE_STRICT_NAME_REJECT` conditional logic exists:
```powershell
cd backend
Select-String -Path src\utils\extraction\rulesEngine.ts -Pattern "USE_STRICT_NAME_REJECT|NAME_REJECT" | Format-Table -AutoSize
```
If no conditional logic: implement a toggle that uses BASELINE reject patterns when `USE_STRICT_NAME_REJECT` is not set, and EXTENDED reject patterns when it is.

#### New Reject Patterns to Add
```typescript
// Action phrases commonly extracted as names  
/^(facing|calling|dealing|struggling|trying|getting|having|living|working)\s/i
/\b(eviction|foreclosure|emergency|because|about|regarding)\b/i

// Common non-name verb phrases
/^(need|want|help|just|been|have|can|will|going|looking|asking)\s/i

// Single-word fragments (names must be ≥2 words)
/^[a-zA-Z]+$/  // single word only — reject
```

#### Execute
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment strict_name_reject
```

#### Gate Criteria
| Metric | Post-Phase1 | Required |
|--------|-------------|----------|
| T008 name | "Facing Eviction" ❌ | null ✅ |
| T028 name | "Calling Because" ❌ | null ✅ |
| Name accuracy (core30) | ~66.7% | ≥66.7% (may drop slightly as garbage→null is accuracy-neutral) |
| No good names rejected | — | Verify manually on 5 known-correct cases |

#### If Gate FAILS
- A good name is being rejected → the new pattern is too broad
- Narrow the offending pattern with word-boundary anchors or minimum-length constraints
- Do NOT proceed to Step 2B with leaky reject patterns

---

### STEP 2B — Add Introduction Patterns (Fix #4)
**File**: `rulesEngine.ts` — `COMPILED_EXTRACTION_PATTERNS.name`
**What**: Add filler-tolerant and greeting-prefixed name patterns

#### Pre-Check
Verify `USE_NAME_V2` conditional logic exists:
```powershell
cd backend
Select-String -Path src\utils\extraction\rulesEngine.ts -Pattern "USE_NAME_V2" | Format-Table -AutoSize
```
If no conditional logic: implement a toggle that expands the regex pattern list when `USE_NAME_V2=true`.

#### New Patterns to Add
```typescript
// Filler/hesitation-tolerant "my name is"
/(?:(?:hello|hey|hi|yeah|yes|okay|ok|so|well|um|uh),?\s*)?(?:my\s+(?:full\s+)?name(?:'s|\s+is))\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){1,3})/i

// Filler-tolerant "I'm / I am"
/(?:(?:hello|hey|hi|yeah|yes|okay|ok|so|well|um|uh),?\s*)?(?:i'm|i\s+am)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){1,3})/i

// "I go by X" / "people call me X"
/(?:i\s+go\s+by|people\s+call\s+me|everyone\s+calls\s+me)\s+([A-ZÀ-ÿ][a-zÀ-ÿ'-]+(?:\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+){0,2})/i

// "X Y here" at sentence start
/^([A-ZÀ-ÿ][a-zÀ-ÿ'-]+\s+[A-ZÀ-ÿ][a-zÀ-ÿ'-]+)\s+here\b/im
```

#### Execute
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment name_v2
```

#### Gate Criteria
| Metric | Post-2A | Required | Stretch |
|--------|---------|----------|---------|
| Name accuracy (core30) | ~66.7% | ≥76% | ≥83% |
| Name nulls (core30) | ~8 | ≤4 | ≤2 |
| false positives | 0 | 0 | — |
| STRICT (core30) | Post-2A | > Post-2A | — |

#### If Gate FAILS
- New patterns may capture non-name text after fillers
- Check if reject patterns (Step 2A) are catching the bad outputs
- Tighten the patterns: require uppercase first letter, minimum 2 words, etc.

---

### STEP 2C — Fix Partial Name Capture (Fix #7)
**File**: `rulesEngine.ts` — name capture groups and post-processing
**What**: Ensure all 12+ patterns capture FirstName + LastName (not just FirstName)

#### Pre-Analysis
Register a new experiment first:
```javascript
// Add to EXPERIMENT_REGISTRY in experiment_engine.js:
name_partial_fix: {
  description: 'Fix name capture groups to include full last name',
  envOverrides: { USE_NAME_PARTIAL_FIX: 'true' },
  configOverrides: {}
}
```

#### Execute
1. Audit every name regex capture group — ensure `{1,3}` quantifier on word repetition
2. Audit `stripTitles()` and name post-processing — ensure it doesn't truncate valid last names
3. Add 2-word minimum validation: if extracted name is a single word and the original text has adjacent capitalized words, extend the match

```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment name_partial_fix
```

#### Gate Criteria
| Metric | Post-2B | Required |
|--------|---------|----------|
| T024 name | "Brian" ❌ | "Brian Anderson" ✅ |
| Name accuracy (core30) | ~76% | ≥80% |
| No new truncation | — | Existing full names still full |

#### If Gate FAILS
- Widened capture groups may pull in trailing non-name words ("Brian Anderson said")
- Add word-boundary detection: stop capture at common post-name words (said, told, here, calling, etc.)

---

### PHASE 2 GATE — Full Regression Test
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50
```

#### Phase 2 Gate Criteria
| Metric | Phase 1 End | Phase 2 Required | Phase 2 Target |
|--------|-------------|------------------|----------------|
| STRICT (840) | ~12-15% | ≥16% | 18-22% |
| Name accuracy | 57.1% | ≥67% | ≥72% |
| Amount accuracy | ≥85% | ≥85% (no regression) | — |
| Category accuracy | ≥65% | ≥65% (no regression) | — |
| Urgency accuracy | 40.7% | ≥40.7% (no regression) | — |

#### Phase 2 Checkpoint Report
```powershell
copy eval\v1_5\reports\LATEST_core30_hard60_fuzz200_fuzz500_realistic50.json eval\v1_5\reports\PHASE2_COMPLETE.json
```

#### Phase 2 Rollback
```powershell
git diff --stat HEAD  # See what changed
git stash save "Phase 2 rollback - pre-investigation"
# Restore Phase 1 state and re-verify
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50
```

---

## PHASE 3: URGENCY RECALIBRATION
### Fixes #1, #8, #9 | Complexity: MEDIUM | Risk: HIGH
### Expected: 18-22% → 35-45% STRICT

**Rationale**: Urgency is the rate-limiting field at 40.7%. These three fixes target the 416 threshold misses (Fix #1), 80 override conflicts (Fix #8), and cascading modifier errors (Fix #9). Together they could push urgency from 40.7% to 60-70%.

**Risk warning**: Urgency changes affect every case. Each step requires careful regression testing. Expect this phase to take the longest to calibrate.

**Critical ordering**: Fix #1 (threshold) first, then Fix #8 (override), then Fix #9 (modifiers). Each change shifts the scoring distribution, so later fixes must be calibrated against the post-#1 baseline.

---

### STEP 3A — Lower HIGH Urgency Threshold (Fix #1)
**File**: `urgencyEngine.ts` — `scoreToLevel()` function
**What**: Change HIGH threshold from 0.38 to ~0.30

#### Pre-Check
Verify `URGENCY_HIGH_THRESHOLD_OVERRIDE` conditional logic exists:
```powershell
cd backend
Select-String -Path src\utils\extraction\urgencyEngine.ts -Pattern "URGENCY_HIGH_THRESHOLD_OVERRIDE|scoreToLevel" | Format-Table -AutoSize
```
If no conditional logic: add a check at the top of `scoreToLevel()`:
```typescript
const highThreshold = process.env.URGENCY_HIGH_THRESHOLD_OVERRIDE 
  ? parseFloat(process.env.URGENCY_HIGH_THRESHOLD_OVERRIDE) 
  : 0.38;
```

#### Experiment — Test Three Thresholds
```powershell
cd backend

# Test 0.32
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment urgency_threshold_032

# Test 0.28
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment urgency_threshold_028
```

Register and test 0.30:
```javascript
// Add to EXPERIMENT_REGISTRY:
urgency_threshold_030: {
  description: 'Lower HIGH urgency threshold from 0.38 to 0.30',
  envOverrides: { URGENCY_HIGH_THRESHOLD_OVERRIDE: '0.30' },
  configOverrides: {}
}
```
```powershell
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment urgency_threshold_030
```

#### Decision Matrix
| Threshold | Expected MEDIUM→HIGH fixes | Risk of over-promotion |
|-----------|---------------------------|----------------------|
| 0.32 | ~150-200 cases | LOW |
| 0.30 | ~250-300 cases | MEDIUM |
| 0.28 | ~300-350 cases | HIGH |

Select the threshold that maximizes urgency accuracy on core30 **without increasing over-assessed cases on hard60**.

#### Validation Across Datasets
```powershell
# Run winning threshold on hard60 to check edge cases
npx tsx eval/v1_5/runners/run_v1_5.js --dataset hard60 --experiment urgency_threshold_030

# Check: how many cases that were correctly MEDIUM are now wrongly HIGH?
# Check: how many of the 82 existing over-assessed cases got worse?
```

#### Gate Criteria
| Metric | Phase 2 End | Required | Stretch |
|--------|-------------|----------|---------|
| Urgency accuracy (core30) | ~53% | ≥70% | ≥80% |
| Over-assessed cases (core30) | Count from report | ≤ Baseline count | Fewer |
| Urgency accuracy (hard60) | Check report | No regression | — |

#### If Gate FAILS
- 0.30 may be too aggressive — fall back to 0.32
- If even 0.32 shows regressions, investigate the 82 over-assessed cases to understand mapping
- Last resort: keep 0.38 threshold and focus on Fixes #8 and #9 instead

#### Promotion
Once threshold is chosen, update `scoreToLevel()` directly (not via experiment) and commit.

---

### STEP 3B — Tame the Critical Override (Fix #8)
**File**: `urgencyEngine.ts` — critical override logic
**What**: Prevent single-layer spikes from overriding weighted average

#### Pre-Analysis
Locate the override logic:
```powershell
cd backend
Select-String -Path src\utils\extraction\urgencyEngine.ts -Pattern "override|0\.85|maximum|MAX" -CaseSensitive:$false | Format-Table -AutoSize
```

Register new experiment:
```javascript
// Add to EXPERIMENT_REGISTRY:
urgency_override_strict: {
  description: 'Raise critical override threshold from 0.85 to 0.92',
  envOverrides: { USE_URGENCY_OVERRIDE_STRICT: 'true' },
  configOverrides: {}
}
```

#### Three Options to Test

**Option A — Raise threshold (safest)**:
Change single-layer override threshold from 0.85 to 0.92.
```typescript
// When USE_URGENCY_OVERRIDE_STRICT=true:
const OVERRIDE_THRESHOLD = 0.92;  // was 0.85
```

**Option B — Require 2 layers above threshold**:
Instead of any single layer ≥0.85, require 2 of 3 (contextual, safety, explicit) ≥0.85.

**Option C — Remove override entirely**:
Let the weighted average always determine urgency. The CRITICAL threshold (0.70) should naturally catch extreme cases.

#### Execute
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment urgency_override_strict
```

#### Gate Criteria
| Metric | Post-3A | Required |
|--------|---------|----------|
| T015 urgency | CRITICAL ❌ | HIGH ✅ |
| T023 urgency | CRITICAL ❌ | MEDIUM ✅ |
| T025 urgency | CRITICAL ❌ | HIGH ✅ |
| Genuine safety cases | CRITICAL ✅ | Still CRITICAL ✅ |
| Urgency accuracy (core30) | Post-3A | ≥ Post-3A |

**Critical validation**: Run against hard60 and manually inspect any case where urgency DROPPED from CRITICAL to HIGH. If any genuine emergency was de-escalated, the override change is too aggressive.

#### If Gate FAILS
- Option A doesn't help → try Option B (2-layer requirement)
- Option B doesn't help → try Option C (remove override)
- If all options worsen genuine safety cases → keep the override and accept the 80 conflict cases as a trade-off

---

### STEP 3C — Audit Category Context Modifiers (Fix #9)
**File**: `urgencyEngine.ts` — `applyContextModifiers()` function
**What**: Lower SAFETY floor from 0.95 to 0.80, reduce LEGAL floor, simplify HEALTHCARE ladder

#### Pre-Analysis
```powershell
cd backend
Select-String -Path src\utils\extraction\urgencyEngine.ts -Pattern "0\.95|SAFETY|applyContext|floor|modifier" -CaseSensitive:$false | Format-Table -AutoSize
```

Register experiment:
```javascript
// Add to EXPERIMENT_REGISTRY:
urgency_modifier_audit: {
  description: 'Lower SAFETY floor to 0.80, reduce aggressive category modifiers',
  envOverrides: { USE_URGENCY_MODIFIER_AUDIT: 'true' },
  configOverrides: {}
}
```

#### Changes
When `USE_URGENCY_MODIFIER_AUDIT=true`:
| Modifier | Current | Proposed |
|----------|---------|----------|
| SAFETY floor | 0.95 (always CRITICAL) | 0.80 (HIGH minimum) |
| LEGAL floor | 0.50 (always HIGH) | 0.40 (MEDIUM-HIGH border) |
| HEALTHCARE max escalation | 0.85 (can reach CRITICAL) | 0.70 (caps at HIGH) |

#### Execute
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment urgency_modifier_audit
```

#### Gate Criteria
| Metric | Post-3B | Required |
|--------|---------|----------|
| Urgency accuracy (core30) | Post-3B | ≥ Post-3B |
| T016 urgency | Check current | Improved or same |
| Cascade failures | Count from report | Fewer than before |
| Genuine SAFETY cases | CRITICAL/HIGH | Still HIGH+ |

#### If Gate FAILS
- SAFETY floor at 0.80 may still be too high → try 0.70
- Or switch to additive modifiers (+0.10, +0.15) instead of floors
- If any approach under-assesses real safety situations → abort this fix

---

### PHASE 3 GATE — Full Regression Test
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50
```

#### Phase 3 Gate Criteria
| Metric | Phase 2 End | Phase 3 Required | Phase 3 Target |
|--------|-------------|------------------|----------------|
| STRICT (840) | ~18-22% | ≥28% | 35-45% |
| Urgency accuracy | 40.7% | ≥58% | ≥65% |
| Amount accuracy | ≥85% | ≥85% (no regression) | — |
| Category accuracy | ≥65% | ≥65% (no regression) | — |
| Name accuracy | ≥67% | ≥67% (no regression) | — |

#### Phase 3 Checkpoint Report
```powershell
copy eval\v1_5\reports\LATEST_core30_hard60_fuzz200_fuzz500_realistic50.json eval\v1_5\reports\PHASE3_COMPLETE.json
```

#### Phase 3 Rollback
This phase has the highest rollback risk. If the urgency changes interact badly:
```powershell
# Check which urgency changes were committed
git log --oneline -10

# Revert to Phase 2 state if needed
git stash save "Phase 3 rollback"
# Or selectively revert just urgencyEngine.ts changes
git checkout PHASE2_TAG -- src/utils/extraction/urgencyEngine.ts
```

---

## PHASE 4: ALGORITHMIC CATEGORY IMPROVEMENT
### Fix #5 | Complexity: MEDIUM-HIGH | Risk: HIGH
### Expected: 35-45% → 45-55% STRICT

**Rationale**: This is the hardest fix — it changes the fundamental category scoring algorithm from pure keyword counting to priority-weighted or context-aware scoring. Done last because (a) it benefits from all prior category improvements (#3, #10), and (b) improved urgency from Phase 3 means more cases are STRICT-ready when category flips correct.

---

### STEP 4A — Implement Priority Hierarchy (Approach C — Safest)
**File**: `rulesEngine.ts` — `extractNeeds()` and `scoreKeywords()` functions
**What**: When two categories score within 20% of each other, the higher-priority one winss

Register experiment:
```javascript
// Add to EXPERIMENT_REGISTRY:
category_priority_v2: {
  description: 'Priority hierarchy for category conflicts',
  envOverrides: { USE_CATEGORY_PRIORITY: 'true' },
  configOverrides: {}
}
```

#### Priority Hierarchy
```
EMERGENCY > SAFETY > HEALTHCARE > HOUSING > FOOD > EDUCATION > EMPLOYMENT > TRANSPORTATION > LEGAL > OTHER
```

#### Implementation Logic
```typescript
// In extractNeeds(), after scoreKeywords() returns candidate scores:
if (USE_CATEGORY_PRIORITY) {
  const PRIORITY_ORDER = ['EMERGENCY', 'SAFETY', 'HEALTHCARE', 'HOUSING', 'FOOD',
    'EDUCATION', 'EMPLOYMENT', 'TRANSPORTATION', 'LEGAL', 'OTHER'];
  
  const topScore = Math.max(...Object.values(scores));
  const threshold = topScore * 0.80; // within 20%
  const candidates = Object.entries(scores).filter(([_, s]) => s >= threshold);
  
  // Among tied candidates, pick highest priority
  candidates.sort((a, b) => 
    PRIORITY_ORDER.indexOf(a[0]) - PRIORITY_ORDER.indexOf(b[0])
  );
  return candidates[0][0];
}
```

#### Execute
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment category_priority_v2
```

#### Gate Criteria
| Metric | Phase 3 End | Required | Stretch |
|--------|-------------|----------|---------|
| Category accuracy (core30) | ~78% | ≥83% | ≥90% |
| T006 | EMPLOYMENT ❌ | HOUSING ✅ |
| T017 | EMPLOYMENT ❌ | HEALTHCARE ✅ |
| T027 | EMPLOYMENT ❌ | EDUCATION ✅ |
| Category accuracy (hard60) | Check | No regression |

#### If Gate PASSES but Insufficient
Move to Approach A — Contextual Weighting:
```typescript
// Weight keywords near "need help with", "looking for", "struggling with" at 2x
// This requires sentence-level proximity detection
```

#### If Gate FAILS
- Priority hierarchy may force the wrong category when the lower-priority one is clearly dominant
- Try increasing the threshold from 20% gap to 10% gap (tighter tie-breaking)
- Or add a minimum absolute score for tie-breaking to activate

---

### STEP 4B — Contextual Weighting (If 4A Insufficient) (Approach A)
**File**: `rulesEngine.ts` — `scoreKeywords()` function
**What**: Weight keywords appearing near need-indicator phrases at 2x

Only attempt this if Step 4A doesn't reach the target. This is the most complex change in the entire plan.

#### Execute
```powershell
cd backend
# This needs a new experiment or combined experiment
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment category_priority_v2
```

---

### PHASE 4 (FINAL) GATE — Full Regression Test
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50 --target 45
```

#### Final Gate Criteria
| Metric | Baseline | Phase 4 Target |
|--------|----------|----------------|
| **STRICT (840)** | **5.36% (45)** | **≥45% (378)** |
| Amount accuracy | 71.2% | ≥90% |
| Category accuracy | 61.7% | ≥80% |
| Urgency accuracy | 40.7% | ≥65% |
| Name accuracy | 57.1% | ≥72% |

#### Final Report
```powershell
copy eval\v1_5\reports\LATEST_core30_hard60_fuzz200_fuzz500_realistic50.json eval\v1_5\reports\PHASE4_FINAL.json
```

---

## DEPENDENCY MAP

```
Phase 1 (Table Expansions)
  ├── Fix #2  (Amount V2)       ─── standalone
  ├── Fix #10 (Remove JOBS)     ─── standalone
  └── Fix #3  (EMERGENCY/etc.)  ─── standalone
         │
Phase 2 (Name Extraction)
  ├── Fix #6  (Reject patterns) ─── standalone
  ├── Fix #4  (Intro patterns)  ─── depends on #6 (reject must go first)
  └── Fix #7  (Partial capture) ─── depends on #4 + #6 (new patterns + rejection in place)
         │
Phase 3 (Urgency Recalibration)
  ├── Fix #1  (Threshold 0.30)  ─── standalone
  ├── Fix #8  (Override taming)  ─── calibrate AFTER #1 (new threshold shifts distribution)
  └── Fix #9  (Modifier audit)  ─── depends on #1 + #8 (modifiers interact with threshold + override)
         │                         also benefits from Phase 1 #3 (better EMERGENCY category → fewer wrong modifiers)
Phase 4 (Category Algorithm)
  └── Fix #5  (Priority rules)  ─── depends on #3 + #10 (vocabulary + no duplicates must be in place first)
```

---

## EXPERIMENT REGISTRY ADDITIONS NEEDED

Before starting each phase, register these new experiments in `experiment_engine.js`:

### Before Phase 1 (none needed — all experiments exist)

### Before Phase 2
```javascript
name_partial_fix: {
  description: 'Fix name capture groups to include full last name',
  envOverrides: { USE_NAME_PARTIAL_FIX: 'true' },
  configOverrides: {}
}
```

### Before Phase 3
```javascript
urgency_threshold_030: {
  description: 'Lower HIGH urgency threshold from 0.38 to 0.30',
  envOverrides: { URGENCY_HIGH_THRESHOLD_OVERRIDE: '0.30' },
  configOverrides: {}
},
urgency_override_strict: {
  description: 'Raise critical override threshold from 0.85 to 0.92',
  envOverrides: { USE_URGENCY_OVERRIDE_STRICT: 'true' },
  configOverrides: {}
},
urgency_modifier_audit: {
  description: 'Lower SAFETY floor to 0.80, reduce aggressive category modifiers',
  envOverrides: { USE_URGENCY_MODIFIER_AUDIT: 'true' },
  configOverrides: {}
}
```

### Before Phase 4
```javascript
category_priority_v2: {
  description: 'Priority hierarchy for category conflicts',
  envOverrides: { USE_CATEGORY_PRIORITY: 'true' },
  configOverrides: {}
}
```

---

## TIMELINE ESTIMATE

| Phase | Fixes | Steps | Est. Duration | Cumulative STRICT |
|-------|-------|-------|---------------|-------------------|
| Pre-flight | — | 5 checks | 15 minutes | 5.36% (baseline) |
| **Phase 1** | #2, #10, #3 | 3 + gate | 1-2 hours | 12-15% |
| **Phase 2** | #6, #4, #7 | 3 + gate | 2-3 hours | 18-22% |
| **Phase 3** | #1, #8, #9 | 3 + gate | 3-5 hours | 35-45% |
| **Phase 4** | #5 | 1-2 + gate | 2-4 hours | 45-55% |
| **Total** | 10 fixes | 13-14 steps | 8-14 hours | **≥45% STRICT** |

> Phase 3 has the widest time range because urgency calibration requires testing multiple threshold values and checking for cascading effects across datasets.

---

## QUICK REFERENCE — COMMANDS BY PHASE

### Phase 1
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment amount_v2
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30                          # after JOBS removal
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment category_emergency
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50  # Phase 1 gate
```

### Phase 2
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment strict_name_reject
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment name_v2
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment name_partial_fix
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50  # Phase 2 gate
```

### Phase 3
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment urgency_threshold_030
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment urgency_override_strict
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment urgency_modifier_audit
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50  # Phase 3 gate
```

### Phase 4
```powershell
cd backend
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment category_priority_v2
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 hard60 fuzz200 fuzz500 realistic50 --target 45  # Final gate
```

---

*Playbook generated from FEB_V1_5_TOP_10_FIXES_PLAN.md | Baseline: 5.36% STRICT (45/840)*
