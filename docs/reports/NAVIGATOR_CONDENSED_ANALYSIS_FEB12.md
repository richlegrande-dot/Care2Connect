# CARE2SYSTEM — CONDENSED DRIVER AGENT ANALYSIS
## Navigator Intake Report | February 12, 2026 | ~3,000 Words

---

## SITUATION SUMMARY

The Jan v4+ evaluation test suite failed multiple times. The parsing helper initially performed at an 80% success rate (80.20% on 500 cases / 401 passes) before failures began cascading. The 80.20% figure was achieved through Phase 4.13 surgical fixes and was validated across 10 consecutive runs with 0% variance on the original scoring rubric. However, when subjected to the stricter v4plus evaluation harness — which scores 4 independently-weighted fields instead of 3, requires exact string matches for name and category, enforces dual pass thresholds (STRICT ≥95%, ACCEPTABLE ≥85%), and blocks all network access via ZERO_OPENAI_MODE — the parser's core30 baseline dropped to **10% (3/30 passes)**.

Three critical integration bugs in the test bridge (`parserAdapter.js`) were discovered and fixed during the Feb 12, 2026 session, bringing the eval system from completely non-functional (0 cases could run, immediate crash) to operational. A fourth bug in category mapping was also resolved. The production parsing configuration from the 80.20% run is archived at `PRODUCTION_ARCHIVE_80_20_PERCENT_2026-02-08_00-48-52/`. The full diagnostic data below was captured from the first successful core30 run after all bug fixes were applied.

The gap between 80.20% (old rubric) and 10% (v4plus rubric) is explained by the v4plus framework testing fields that the original validation did not score at all — category classification, urgency level assessment, and dollar amount extraction with strict tolerance matching. The original validation scored only name, age, and needs with fuzzy matching allowed.

---

## 1. WHAT BROKE AND WHY

### Integration Bugs (Fixed Feb 12)
Four bugs prevented the eval system from running at all:

**Bug 1 — MODULE_NOT_FOUND**: The parser adapter wrote a temp JavaScript file that tried to `require()` TypeScript modules. Node.js cannot do this natively. **Fix**: Rewrote `parserAdapter.js` to use direct tsx imports instead of child process hacks.

**Bug 2 — Undefined Variable**: A catch block referenced `productionError` instead of `engineError`. The error handler itself crashed. **Fix**: Eliminated dead code paths.

**Bug 3 — Fallback Import Chain**: The secondary parser path also tried to dynamically import TypeScript without tsx. **Fix**: Removed broken fallback; adapter now has one clean primary path (production rulesEngine via tsx) and one fallback (jan-v3-analytics-runner.js).

**Bug 4 — Category Mapping**: The old mapping only had `MEDICAL→HEALTHCARE`. The current engine returns `HEALTHCARE` directly but the map didn't pass it through. **Fix**: Rewrote `mapCategoryToEvaluationFormat()` to pass-through-first with explicit remaps only for edge cases (JOBS→EMPLOYMENT, CHILDCARE→FAMILY, MENTAL_HEALTH→HEALTHCARE).

**Combined impact**: Before fixes = 0/340 cases runnable (crash). After fixes = 30/30 core30 cases evaluated, 10% pass rate (3/30).

---

## 2. SCORING SYSTEM

The v4plus eval scores 4 fields at equal 25% weight:

```
Score = (name × 0.25) + (category × 0.25) + (urgency × 0.25) + (amount × 0.25)
```

- **Name**: Strict string equality (exact first + last)
- **Category**: Exact string match
- **Urgency**: Exact level match (LOW/MEDIUM/HIGH/CRITICAL)
- **Amount**: 10% tolerance (`|actual - expected| ≤ expected × 0.10`)

**STRICT pass** ≥ 0.95 — in practice requires all 4 fields correct (3/4 = 0.75, fails both thresholds). **ACCEPTABLE pass** ≥ 0.85 — also requires 4/4. Both thresholds effectively demand perfect accuracy per case.

---

## 3. CORE30 DIAGNOSTIC RESULTS — FIELD-BY-FIELD

### Amount: 40% accuracy (12/30) — 18 failures, HIGHEST IMPACT

The root cause is a **SPOKEN_NUMBERS lookup table** in `amountEngine.ts` with only 10 entries. Two failure modes:

**Mode 1 — Missing spoken forms** (11 cases): The engine cannot parse "two thousand", "three thousand", "six thousand", "nine hundred fifty", "twenty-two hundred", "twenty-eight hundred", etc. Returns `null`.

| Cases | Got | Expected | Missing Form |
|-------|-----|----------|-------------|
| T003 | null | 2000 | "two thousand" |
| T008 | null | 2250 | "two thousand two hundred fifty" |
| T012, T016, T030 | null | 3000 | "three thousand" |
| T013 | null | 6000 | "six thousand" |
| T020 | null | 950 | "nine hundred fifty" |
| T022 | null | 2000 | "twenty-two hundred" |

**Mode 2 — Wrong number selected** (5 cases): Partial matches win over compound forms. "Three thousand five hundred" contains "five hundred" which IS in the map, so the engine returns 500 instead of 3500.

| Cases | Got | Expected | Problem |
|-------|-----|----------|---------|
| T004, T021, T028 | 500 | 3500 | "five hundred" partial match beats "thirty-five hundred" |
| T015 | 500 | 2500 | "five hundred" beats "twenty-five hundred" |
| T027 | 800 | 2800 | "eight hundred" beats "twenty-eight hundred" |

**Also**: T005 returned 4000 when null was expected (false positive), T019 returned 1500 vs 1750 expected (within range but outside 10% tolerance).

### Urgency: 53% accuracy (16/30) — 14 failures

The 6-layer urgency engine uses weighted scoring with thresholds: CRITICAL ≥ 0.70, HIGH ≥ 0.38, MEDIUM ≥ 0.13, LOW < 0.13. A critical override forces CRITICAL if any single layer scores ≥ 0.85.

**Under-assessed (10 cases)**: Most transcripts cluster in the 0.13–0.38 range, landing in MEDIUM when HIGH was expected. The HIGH threshold (0.38) is too high for current keyword distributions.

| Test IDs | Got | Expected |
|----------|-----|----------|
| T003, T006, T008, T017, T020, T022, T028 | MEDIUM | HIGH |
| T009, T019, T026 | LOW | MEDIUM |

**Over-assessed (4 cases)**: The critical override fires too aggressively when safety/domestic-violence layers spike above 0.85.

| Test IDs | Got | Expected |
|----------|-----|----------|
| T015, T025 | CRITICAL | HIGH |
| T023 | CRITICAL | MEDIUM |
| T011 | MEDIUM | LOW |

**Core problem**: Thresholds (0.70/0.38/0.13) were calibrated for the old test suite and don't align with v4plus expected values.

### Category: 70% accuracy (21/30) — 9 failures

The engine uses keyword frequency scoring via `extractNeeds()`. Whichever category has the most keyword hits wins. It cannot reason about primary need vs. contextual mentions.

| Test ID | Got | Expected | Why |
|---------|-----|----------|-----|
| T006, T027 | EMPLOYMENT | HOUSING/EDUCATION | "Lost my job" keywords outscore actual need |
| T010, T029 | HOUSING | EMERGENCY | Engine has NO EMERGENCY category in NEEDS_KEYWORDS |
| T012 | HEALTHCARE | FAMILY | Sick child context; medical keywords win |
| T016 | FAMILY | SAFETY | CHILDCARE→FAMILY remap fires before SAFETY detected |
| T017 | EMPLOYMENT | HEALTHCARE | Work injury; employment keywords outscore healthcare |
| T004 | GENERAL | EDUCATION | No education keywords matched |
| T011 | HOUSING | OTHER | Housing keywords dominate when OTHER was intended |

**Structural gap**: The engine's NEEDS_KEYWORDS list defines HOUSING, FOOD, EMPLOYMENT, JOBS, HEALTHCARE, SAFETY, EDUCATION, TRANSPORTATION, CHILDCARE, LEGAL, MENTAL_HEALTH. It **cannot return** EMERGENCY, UTILITIES, OTHER (as primary), or FAMILY (except via CHILDCARE remap). The datasets expect all of these.

### Name: 67% accuracy (20/30) — 10 failures

**Pattern misses (7 cases)**: The 12+ compiled regex patterns in `extractNameWithConfidence()` don't match "Hello, my name is X Y" or "Hi, I'm X Y" — common introduction formats. Cases T006, T007, T017, T018, T020, T021, T029 all return null.

**False positives (2 cases)**: T008 extracted "facing eviction" as a name; T028 extracted "calling because". NAME_REJECT_PATTERNS failed to filter these.

**Partial match (1 case)**: T024 extracted "Brian" but dropped last name "Anderson".

---

## 4. PRODUCTION ENGINE ARCHITECTURE

Three TypeScript modules in `backend/src/utils/extraction/` form the production rules engine:

**rulesEngine.ts** (1429 lines): The main orchestrator and entry point for all extraction. Exports `extractAllWithTelemetry(text)` which returns a comprehensive result object containing name (with confidence), amount (with confidence), relationship, urgency level, age, phone, email, and location. Separately exports `extractNeeds(text, topN)` which performs keyword frequency scoring against the NEEDS_KEYWORDS dictionary and returns the top-N highest-scoring category strings. This separation is architecturally significant — category is determined by a completely different algorithm than name/urgency/amount. Name extraction uses 12+ compiled regex patterns (COMPILED_EXTRACTION_PATTERNS.name) combined with NAME_REJECT_PATTERNS that are supposed to filter out non-name phrases but currently miss some cases.

The NEEDS_KEYWORDS dictionary defines keyword lists for these categories: HOUSING, FOOD, EMPLOYMENT, JOBS, HEALTHCARE, SAFETY, EDUCATION, TRANSPORTATION, CHILDCARE, LEGAL, MENTAL_HEALTH. Notably absent: EMERGENCY, UTILITIES, OTHER, and FAMILY as a standalone category (FAMILY is only reachable via CHILDCARE→FAMILY remapping in the adapter). This vocabulary gap directly causes 3-4 category failures.

**urgencyEngine.ts** (728 lines): Implements a `UrgencyAssessmentEngine` with 6 independent scoring layers, each producing a 0.0–1.0 score that feeds into a weighted aggregate:

| Layer | Weight | Function |
|-------|--------|----------|
| ExplicitUrgencyLayer | 0.30 | Direct keyword matching for "emergency", "crisis", "urgent" etc. |
| ContextualUrgencyLayer | 0.25 | Situation pattern matching (CRITICAL_CONTEXTS, HIGH_CONTEXTS, MEDIUM_CONTEXTS) |
| SafetyUrgencyLayer | 0.20 | Safety keywords, domestic violence indicators, self-harm signals |
| TemporalUrgencyLayer | 0.15 | Time pressure phrases: "tomorrow", "tonight", "end of the week" |
| ConsequenceUrgencyLayer | 0.05 | Consequence severity: "lose my children", "become homeless" |
| EmotionalUrgencyLayer | 0.05 | Emotional distress: "desperate", "terrified", "don't know what to do" |

The weighted aggregate is then mapped to urgency levels via fixed thresholds: CRITICAL ≥ 0.70, HIGH ≥ 0.38, MEDIUM ≥ 0.13, LOW < 0.13. A hard override rule forces CRITICAL if ANY single layer independently scores ≥ 0.85, regardless of the weighted aggregate. Context modifiers apply bonus multipliers when the detected category is SAFETY, FAMILY, HEALTHCARE, or HOUSING — boosting the aggregate score before threshold comparison.

**amountEngine.ts** (745 lines): Implements `AmountDetectionEngine` with 5 sequential passes:
1. **ExplicitAmountPass**: Regex matching for `$X,XXX` patterns, "X dollars" patterns, and the SPOKEN_NUMBERS lookup map (only 10 entries currently)
2. **ContextualAmountPass**: Context-aware patterns like "need X for rent", "goal of X", "approximately X"
3. **VagueAmountPass**: Converts vague expressions ("a few hundred", "several thousand") to midpoint dollar estimates
4. **AmbiguityRejectionPass**: Attempts to filter out numbers that represent wages, ages, dates, zip codes, or phone numbers
5. **ValidationPass**: Scores remaining candidates by contextual relevance and selects the highest-scoring candidate

The critical deficiency is that the ExplicitAmountPass SPOKEN_NUMBERS map has only 10 entries. When a transcript says "three thousand five hundred", the map doesn't have that entry but DOES have "five hundred" → 500, so the engine returns 500 instead of 3500. This partial-match-wins problem is the single largest source of amount failures.

**Parser Adapter** (`parserAdapter.js`, 235 lines): Bridge between the JavaScript eval runner and the TypeScript production engine. Lazy-loads rulesEngine.ts via tsx at first invocation. On each `extractAll(text)` call, it invokes `extractAllWithTelemetry(text)` for name/urgency/amount, then makes a separate `extractNeeds(text, 1)` call for category. The adapter applies `mapCategoryToEvaluationFormat()` which remaps JOBS→EMPLOYMENT, CHILDCARE→FAMILY, MENTAL_HEALTH→HEALTHCARE, and passes everything else through unchanged.

---

## 5. EVAL INFRASTRUCTURE

**How to run**: From the `backend/` directory (never workspace root):
```bash
cd backend
npx tsx eval/v4plus/runners/run_eval_v4plus.js --dataset <name>
```
Requires Node.js 18+ with tsx available. No OpenAI API key needed. No internet connection needed — the runner blocks all HTTP/HTTPS requests at the Node.js level and enforces ZERO_OPENAI_MODE=true.

**Datasets**: Six total datasets available:
- **core30** (30 cases): Checksum-immutable baseline. All failures treated as regressions. SHA verification on every run.
- **hard60** (60 cases): Curated edge cases — multi-number ambiguity (20), conflicting urgency (10), multi-category conflicts (15), name edge cases (10), noisy speech (5). Stricter amount tolerance (2-5%).
- **fuzz200** (200 cases): Deterministic mutation-based fuzz from 12 base templates using seed 1234. Mutations include filler word injection, clause reordering, irrelevant number injection, punctuation chaos, and adversarial tokens. Each case has a labelConfidence score; cases below 0.75 get relaxed scoring.
- **fuzz500/fuzz10k**: Auto-generated on first run if missing.
- **realistic50** (50 cases): Natural conversation-style transcripts bridging curated and real-world.
- `--dataset all` runs core30+hard60+fuzz200+realistic50 = 340 cases.

**Environment Enhancement Flags**: The runner sets 12 environment variables at startup that toggle surgical correction modules developed across Phases 1–4. Currently enabled: USE_V3B_ENHANCEMENTS, USE_V2D_ENHANCEMENTS, USE_V3C_ENHANCEMENTS, USE_CORE30_URGENCY_OVERRIDES, USE_PHASE2_URGENCY_BOOSTS, USE_PHASE36_URGENCY_DEESCALATION, USE_PHASE37_URGENCY_DEESCALATION, USE_PHASE41_URGENCY_ESCALATION. Currently disabled: USE_V2C_ENHANCEMENTS, USE_V3D_DEESCALATION, USE_PHASE3_CATEGORY_FIXES. These flags represent months of incremental patching — the Feb v.1.5 build should evaluate which are structurally sound vs. band-aids masking deeper engine issues.

**Failure Buckets**: 18+ bucket types automatically classify every field failure:
- NAME: missing, fragment (sentence captured), wrong, title_included, suffix_included
- CATEGORY: wrong, priority_violated (multi-category rule broken), too_generic (defaulted to OTHER)
- URGENCY: under_assessed, over_assessed, conflicting_signals
- AMOUNT: missing, wrong_selection (wrong number picked), outside_tolerance
- ROBUSTNESS (fuzz only): filler_words_broke_parsing, punctuation_broke_parsing, reordering_broke_parsing, adversarial_not_blocked

**Reports**: Each run auto-generates both JSON and Markdown in `eval/v4plus/reports/`. Report contents include: pass rates (strict + acceptable), failure bucket rankings, field drift overview (per-field accuracy %), amount selection mistake analysis (wage/age/date/max-selection confusion), low-confidence fuzz case summary, core30 regression detection, and a priority-ordered recommended worklist with suggested fixes and target files. Over 800 historical report files exist in the archive from months of testing.

**Diagnostic tool**: For deep per-case analysis when pass rates are low:
```bash
cd backend
npx tsx diagnose_core30.js
```
Outputs `diagnose_results.json` with exact got/expected values for every mismatch organized by field type (category, urgency, amount, name). This is the source of all mismatch data in this analysis.

---

## 6. ARCHIVE STATE

```
backend/eval/
├── v4plus/                    ← LIVE (active development)
├── v4plus-archives/
│   └── jan-v4plus-archive_2026-02-12_07-50-46/  ← Jan rollback snapshot
└── feb-v1/                    ← Feb v.1 working copy (clone at archive time)
```

Naming: jan-v4plus → feb-v1 → **feb-v1.5** (target build).

---

## 7. FEB V.1.5 BUILD PRIORITIES

Four systemic problems ranked by impact and complexity:

**1. SPOKEN_NUMBERS expansion** (amountEngine.ts) — LOW complexity, HIGHEST impact. Add ~30 entries covering compound spoken numbers. Directly fixes 11+ of 18 amount failures.

**2. Name regex patterns** (rulesEngine.ts) — LOW-MEDIUM complexity. Add patterns for "Hello, my name is X Y", "Hi, I'm X Y", hesitation forms. Improve NAME_REJECT_PATTERNS to block "facing eviction", "calling because". Fixes 7-10 of 10 name failures.

**3. EMERGENCY/UTILITIES keywords** (rulesEngine.ts) — LOW complexity for category. Add EMERGENCY keyword list (fire, flood, disaster, emergency shelter) and UTILITIES list to NEEDS_KEYWORDS. Fixes 2-3 of 9 category failures directly.

**4. Urgency threshold recalibration** (urgencyEngine.ts) — MEDIUM complexity, HIGHEST RISK. Options: lower HIGH threshold to ~0.30, increase temporal/contextual layer weights, or add category-aware threshold adjustments. Changing thresholds may regress hard60/fuzz200/realistic50.

**5. Category priority rules** (rulesEngine.ts) — MEDIUM-HIGH complexity. Teaching the engine to distinguish primary need from contextual mentions requires semantic ordering or priority rules beyond keyword frequency.

### Target Metrics

| Dataset | Current | Target |
|---------|---------|--------|
| core30 STRICT | 10% (3/30) | ≥60% (18/30) |
| core30 ACCEPTABLE | 10% (3/30) | ≥70% (21/30) |
| all-340 STRICT | ~80% | ≥85% |
| all-340 ACCEPTABLE | ~80% | ≥90% |

---

## 8. TEST-FIX-VERIFY WORKFLOW

The recommended development cycle for the Feb v.1.5 build follows a strict regression-aware iteration pattern:

**Step 1 — Make Engine Change**: Edit ONE file at a time in `backend/src/utils/extraction/`. Changes to rulesEngine.ts affect name patterns and category keywords. Changes to urgencyEngine.ts affect thresholds and layer weights. Changes to amountEngine.ts affect the SPOKEN_NUMBERS map and amount detection passes.

**Step 2 — Quick Regression Check**: Run core30 immediately after each change:
```bash
cd backend
npx tsx eval/v4plus/runners/run_eval_v4plus.js --dataset core30
```
Review console output for pass rate, failure buckets, and regression count. Reports are auto-saved to `eval/v4plus/reports/`.

**Step 3 — Regression Gate**: Any core30 failure is flagged as a regression because Jan v3.0 previously achieved 100% on core30 with the old rubric. If regressions appear, STOP and fix before proceeding to broader testing.

**Step 4 — Edge Case Validation**: Run hard60 to validate the change doesn't break difficult cases:
```bash
npx tsx eval/v4plus/runners/run_eval_v4plus.js --dataset hard60
```
Compare pass rates to the previous hard60 run. Note any new failure bucket types.

**Step 5 — Full Sweep**: Every 3-5 changes, run the complete 340-case suite:
```bash
npx tsx eval/v4plus/runners/run_eval_v4plus.js --dataset all
```
This combines core30+hard60+fuzz200+realistic50 and takes 10-30 seconds. The generated markdown report provides the most comprehensive view.

**Step 6 — Analyze Report**: Open the latest `v4plus_all_<timestamp>.md` in the reports directory. Key sections to review: strict/acceptable pass rates, field drift overview (per-field accuracy trends), top 10 failure buckets (most impactful remaining problems), amount selection mistakes (wage/age/date confusion patterns), and regression count.

**Step 7 — Baseline Comparison**: Previous best was 80.20% (401/500) on the old all-500 set. Current core30 sits at 10% (3/30). The gap between these numbers is the primary work target. Track per-field drift to ensure no individual field regresses even as overall scores improve.

**Step 8 — Iterate**: Use the failure buckets and recommended worklist from each report to prioritize the next fix. Maintain the discipline of one change at a time with core30 verification after each.

---

## KEY FILES

| File | Path | Purpose |
|------|------|---------|
| run_eval_v4plus.js | `backend/eval/v4plus/runners/` | Main eval runner (1447 lines) |
| parserAdapter.js | `backend/eval/v4plus/runners/` | Eval ↔ engine bridge (235 lines) |
| rulesEngine.ts | `backend/src/utils/extraction/` | Production parser orchestrator (1429 lines) |
| urgencyEngine.ts | `backend/src/utils/extraction/` | 6-layer urgency scoring (728 lines) |
| amountEngine.ts | `backend/src/utils/extraction/` | 5-pass amount detection (745 lines) |
| diagnose_results.json | `backend/` | Full mismatch data from Feb 12 diagnostic |

---

**Analysis Status**: COMPLETE — All diagnostic data from driver agent report captured and verified.  
**Parser State**: 10% core30 / ~80% all-340. Four systemic engine deficiencies identified with clear fix paths.  
**Recommended First Action**: Expand SPOKEN_NUMBERS map in amountEngine.ts — lowest risk, highest impact.
