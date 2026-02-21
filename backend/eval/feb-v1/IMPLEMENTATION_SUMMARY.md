# Jan v4.0+ Test Suite - Implementation Summary

**Date:** January 25, 2026  
**Status:** ✅ COMPLETE - Ready for evaluation (DO NOT RUN)

---

## 📦 Deliverables

### **1. Folder Structure**
```
backend/eval/v4plus/
├── datasets/
│   ├── core30.jsonl        ✅ 30 baseline cases (copied from v3.0)
│   ├── hard60.jsonl        ✅ 60 difficult curated cases
│   └── fuzz200.jsonl       🔧 Generated on-demand with seed
├── runners/
│   └── run_eval_v4plus.js  ✅ Main evaluation runner
├── generators/
│   └── generate_fuzz_cases.js ✅ Deterministic fuzz generator
└── reports/
    └── (auto-generated)     📊 JSON + Markdown reports
```

### **2. Datasets**

#### **core30.jsonl** ✅
- **Source:** Copied from `backend/eval/datasets/transcripts_golden_v1.jsonl`
- **Count:** 30 cases
- **Purpose:** Regression baseline (Jan v3.0 achieved 100% pass rate)
- **Difficulty:** 6 EASY, 10 MEDIUM, 9 HARD, 5 ADVERSARIAL

#### **hard60.jsonl** ✅
- **Count:** 60 cases
- **Purpose:** Stress testing beyond baseline
- **Breakdown:**
  - Multi-number ambiguity: 20 cases (HARD_001 to HARD_020)
  - Conflicting urgency signals: 10 cases (HARD_021 to HARD_030)
  - Multi-category conflicts: 15 cases (HARD_031 to HARD_045)
  - Name edge cases: 10 cases (HARD_046 to HARD_055)
  - Noisy/fragmented speech: 5 cases (HARD_056 to HARD_060)
- **Strictness:** 2-5% amount tolerance (vs. v3.0's 10%)

#### **fuzz200.jsonl** 🔧
- **Count:** 200 generated cases (on-demand)
- **Generation:** `npm run eval:v4plus:generate-fuzz`
- **Seed:** 1234 (deterministic)
- **Base Templates:** 12 templates covering all major categories
- **Mutations:**
  - Insert filler words (um, uh, well, so, like)
  - Reorder clauses
  - Insert irrelevant numbers (age, wage, dates)
  - Insert irrelevant keywords from other categories
  - Insert punctuation chaos (..., —, !!)
  - Insert adversarial tokens (<script>, JSON, SQL) - 5% of cases

### **3. Evaluation Runner** ✅

**File:** `backend/eval/v4plus/runners/run_eval_v4plus.js`

**Features:**
- **Dual Threshold Scoring:**
  - STRICT: ≥95% (production-ready)
  - ACCEPTABLE: ≥85% (needs improvement)
- **Stricter Amount Tolerance:** 5% default (vs. 10%)
- **Performance Monitoring:**
  - Per-case latency tracking
  - Total runtime vs. budget (3000ms target)
  - Memory usage tracking
- **Enhanced Reporting:**
  - Top 10 failure buckets with descriptions
  - Regression detection (core30 failures)
  - Recommended worklist with priority + suggested fixes
  - JSON + Markdown output
- **Environment Enforcement:**
  - ZERO_OPENAI_MODE
  - Network blocking (HTTP/HTTPS requests rejected)
  - PII scan (placeholder for future)

**Failure Bucket Classification:**
- Name extraction (6 buckets)
- Category (3 buckets)
- Urgency (4 buckets)
- Amount (5 buckets)
- Robustness (4 buckets)

### **4. Fuzz Generator** ✅

**File:** `backend/eval/v4plus/generators/generate_fuzz_cases.js`

**Features:**
- **Deterministic:** Same seed → same output
- **Seeded Random:** Mulberry32 PRNG implementation
- **12 Base Templates:** Cover HOUSING, HEALTHCARE, EMPLOYMENT, UTILITIES, FOOD, TRANSPORTATION, EDUCATION, LEGAL, FAMILY
- **6 Mutation Operations:**
  1. Insert filler words (60% probability)
  2. Reorder clauses (50% probability)
  3. Insert irrelevant numbers (60% probability)
  4. Insert irrelevant keywords (40% probability)
  5. Insert punctuation chaos (30% probability)
  6. Insert adversarial tokens (5% probability)
- **Mutation Tracking:** Each case records applied mutations for debugging
- **Expected Outputs:** Derived from base template (not unsupervised fuzz)

**Usage:**
```bash
npm run eval:v4plus:generate-fuzz
# or with custom parameters:
node backend/eval/v4plus/generators/generate_fuzz_cases.js --seed 5678 --count 500
```

### **5. NPM Scripts** ✅

Added to `package.json`:
```json
"eval:v4plus:generate-fuzz": "node backend/eval/v4plus/generators/generate_fuzz_cases.js --seed 1234 --count 200",
"eval:v4plus:core": "node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset core30",
"eval:v4plus:hard": "node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset hard60",
"eval:v4plus:fuzz": "node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset fuzz200",
"eval:v4plus:all": "node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset all"
```

### **6. Documentation** ✅

**File:** `backend/eval/v4plus/V4PLUS_EVAL_README.md`

**Contents:**
- Overview and goals
- Directory structure
- Dataset descriptions
- Usage instructions
- Scoring and thresholds explanation
- Report format documentation
- Failure bucket definitions
- Success criteria
- Customization guide
- Troubleshooting
- Quick start guide

---

## 📊 Test Case Counts

| Dataset | Count | Type | Purpose |
|---------|-------|------|---------|
| **core30** | 30 | Baseline | Regression detection |
| **hard60** | 60 | Curated | Stress testing |
| **fuzz200** | 200 | Generated | Robustness + Scale |
| **TOTAL** | **290** | Combined | Full evaluation |

---

## 🎯 Expected Outcomes

When running `npm run eval:v4plus:all`:

### **Best Case (No Parser Changes)**
- **core30:** 100% strict pass (no regressions from v3.0)
- **hard60:** 60-80% strict pass (new difficult cases)
- **fuzz200:** 70-85% acceptable pass (robustness validation)
- **Total:** ~80-90% acceptable pass across 290 cases

### **If Regressions Found**
- Runner will highlight core30 failures as **REGRESSIONS**
- Each regression shows: Test ID, expected 100%, actual score, failed fields
- This indicates Jan v3.0 patterns were broken

### **Failure Bucket Analysis**
- Top 10 failure types ranked by frequency
- Each bucket includes:
  - Count and percentage
  - Description of issue
  - Example test case IDs
  - Suggested fix
  - Target file to change

### **Recommended Worklist**
- Prioritized list (HIGH/MEDIUM/LOW)
- Specific actionable guidance per bucket
- Maps to Jan v3.0 architecture (TIER 1-5 engines)

---

## 🚀 How to Run (Later)

### **Step 1: Generate Fuzz Cases**
```bash
npm run eval:v4plus:generate-fuzz
```

**Expected Output:**
```
✅ Generated 200 fuzz test cases
📁 Written to: backend/eval/v4plus/datasets/fuzz200.jsonl

Mutation Statistics:
  insertFillerWords: 140 cases
  reorderClauses: 100 cases
  insertIrrelevantNumbers: 120 cases
  insertIrrelevantKeywords: 80 cases
  insertPunctuationChaos: 60 cases
  insertAdversarialToken: 10 cases
```

### **Step 2: Run Baseline Check**
```bash
npm run eval:v4plus:core
```

**Expected:** 100% strict pass (30/30) - confirms no regressions

### **Step 3: Run Full Suite**
```bash
npm run eval:v4plus:all
```

**Expected:** ~80-90% acceptable pass (230-260/290)

### **Step 4: Review Reports**
```bash
cat backend/eval/v4plus/reports/v4plus_all_*.md
```

---

## 🔍 Key Design Decisions

### **1. Why Deterministic Fuzz?**
- Reproducibility across runs
- Can debug specific fuzz cases
- Can version control expected outputs
- Enables CI/CD integration

### **2. Why Dual Thresholds?**
- STRICT (95%): Production-ready bar
- ACCEPTABLE (85%): Development progress tracking
- Avoids binary pass/fail - shows gradual improvement

### **3. Why Stricter Amount Tolerance?**
- v3.0's 10% was too permissive
- 5% default catches more precision errors
- Individual cases can override if needed

### **4. Why Failure Buckets?**
- Transforms "30 failures" into "5 name_fragment, 3 urgency_conflicting_signals"
- Enables prioritization (fix 1 bucket → 10 cases pass)
- Maps to specific code changes

### **5. Why 60 Hard + 200 Fuzz?**
- 60 hard: Manual curation targets known gaps
- 200 fuzz: Automated coverage of mutation space
- 290 total: Large enough for statistical significance, small enough to run quickly

---

## ⚠️ Assumptions & Limitations

### **Assumptions**
1. **Jan v3.0 parser available** at `backend/eval/jan-v3-analytics-runner.js`
2. **No parser changes** made during this task (only test suite created)
3. **Expected outputs for fuzz cases** are derived from base templates (accurate baseline assumption)

### **Limitations**
1. **Fuzz expected outputs** assume template expectations hold after mutations (may need manual review)
2. **Adversarial token detection** relies on parser's existing sanitization (not tested in v3.0)
3. **PII scan** is placeholder (not implemented in runner)
4. **Memory tracking** is basic (not detailed profiling)

### **Future Enhancements**
1. Add mutation validators (ensure expected outputs remain valid after mutations)
2. Implement actual PII scanning
3. Add performance profiling (per-tier latency)
4. Add mutation severity weighting (some mutations harder than others)
5. Add cross-validation (multiple expected answers per case)

---

## 📝 Notes for Next Agent

### **DO NOT Change Parser**
This task was to BUILD the test suite, not fix failures. If you run the suite and see failures, that's expected - the suite is intentionally harder.

### **Fuzz Case Expected Outputs**
The fuzz generator assumes that base template expectations hold after mutations. For example:
- Template: "My name is {NAME}. I need ${AMOUNT} for rent."
- Expected: name=John Smith, amount=1200, category=HOUSING
- After mutation: "Um, well, my name is, like, John Smith. I'm 25 years old. I need, uh, $1200 for rent."
- Expected STILL: name=John Smith, amount=1200, category=HOUSING (age 25 should be ignored)

If parser fails this, it's a real robustness issue.

### **Regression vs. New Failures**
- **Regression:** core30 case fails (Jan v3.0 passed this)
- **New Failure:** hard60 or fuzz200 case fails (new challenge)

Only regressions indicate broken parser. New failures indicate areas for improvement.

### **Recommended First Run**
```bash
# Generate fuzz cases
npm run eval:v4plus:generate-fuzz

# Sanity check: core30 should be 100%
npm run eval:v4plus:core

# If core30 = 100%, proceed to full suite
npm run eval:v4plus:all
```

---

## ✅ Completion Checklist

- [x] Created `backend/eval/v4plus/` folder structure
- [x] Created `datasets/core30.jsonl` (30 baseline cases)
- [x] Created `datasets/hard60.jsonl` (60 difficult cases)
- [x] Created `generators/generate_fuzz_cases.js` (deterministic generator)
- [x] Created `runners/run_eval_v4plus.js` (evaluation runner)
- [x] Added npm scripts to `package.json`
- [x] Created `V4PLUS_EVAL_README.md` (comprehensive documentation)
- [x] Did NOT run any evaluations (as instructed)
- [x] Did NOT change parser logic (as instructed)

---

**Status:** ✅ **READY FOR EVALUATION**

When you're ready to run:
```bash
npm run eval:v4plus:generate-fuzz && npm run eval:v4plus:all
```

Expected runtime: ~3 seconds for 290 cases.
