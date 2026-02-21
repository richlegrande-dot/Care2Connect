# Jan v4.0+ Evaluation Suite - README

## Overview

The Jan v4.0+ evaluation suite is a **stress testing and robustness framework** designed to validate generalization beyond the baseline 30-case test suite. Jan v3.0 achieved **100% pass rate at 98.5% weighted score** on the original suite, demonstrating that those cases are no longer adversarial enough to drive improvements.

This suite focuses on:
- **Generalization** beyond curated cases
- **Robustness** to noise, filler speech, and adversarial inputs
- **Scale validation** (100-500 cases)
- **Deterministic reproducibility** (seeded randomness)
- **ZERO_OPENAI_MODE** and no-network guarantees

## 🎯 Goals

The v4.0+ suite measures:
1. **Robustness** to noise and filler speech
2. **Correct amount selection** among multiple competing numbers
3. **Correct urgency assessment** under conflicting signals
4. **Correct category priority** in multi-category conflicts (SAFETY > HEALTHCARE > HOUSING > etc.)
5. **Strict name cleanliness** (no sentence fragments)
6. **No regressions** in adversarial defenses (injection, weird tokens)
7. **Performance** remains within budget with larger datasets

## 📂 Directory Structure

```
backend/eval/v4plus/
├── datasets/
│   ├── core30.jsonl          # Original 30 baseline cases (from v3.0)
│   ├── hard60.jsonl          # 60 difficult curated cases
│   └── fuzz200.jsonl         # 200 generated fuzz cases (create with generator)
├── runners/
│   └── run_eval_v4plus.js    # Main evaluation runner
├── generators/
│   └── generate_fuzz_cases.js # Deterministic fuzz case generator
└── reports/
    └── (auto-generated)       # JSON and Markdown reports
```

## 📊 Datasets

### **core30.jsonl** (30 cases)
Original baseline test suite from Jan v3.0. These cases represent the **regression baseline** - any strict failures here indicate a regression from the 100% pass rate achieved by Jan v3.0.

**Difficulty Distribution:**
- EASY: 6 cases
- MEDIUM: 10 cases
- HARD: 9 cases
- ADVERSARIAL: 5 cases

### **hard60.jsonl** (60 cases)
Manually curated difficult cases targeting known failure modes:

**Breakdown:**
- **Multi-number ambiguity (20 cases):** Transcripts with wage + rent + deposit + child age + dates. Parser must select the correct goal amount, not irrelevant numbers.
- **Conflicting urgency signals (10 cases):** "Urgent but not emergency" or "not urgent but eviction tomorrow" - must resolve correctly.
- **Multi-category conflicts (15 cases):** SAFETY + HEALTHCARE + HOUSING present - must follow priority rules.
- **Name edge cases (10 cases):** Hyphenated names, apostrophes, titles, "This is an emergency! My name is..." conflicts.
- **Noisy/fragmented speech (5 cases):** Heavy filler words, ellipses, dashes, broken sentences.

**Strictness:**
- Amount tolerance: 2-5% (stricter than v3.0's 10%)
- Fuzzy name matching: disabled for most cases

### **fuzz200.jsonl** (200 generated cases)
Deterministic mutation-based fuzz cases generated from 12 base templates.

**Mutation Operations:**
- `insertFillerWords`: Inject "um", "uh", "well", "so", "like", etc.
- `reorderClauses`: Shuffle sentence order
- `insertIrrelevantNumbers`: Add wage/age/date numbers
- `insertIrrelevantKeywords`: Add keywords from other categories
- `insertPunctuationChaos`: Add "...", "—", "!!", etc.
- `insertAdversarialToken`: Rare injection of `<script>`, JSON, SQL, etc.

**Generation:**
```bash
npm run eval:v4plus:generate-fuzz
# or with custom seed:
node backend/eval/v4plus/generators/generate_fuzz_cases.js --seed 5678 --count 200
```

## 🚀 Usage

### **Install Dependencies**
```bash
npm install
```

### **Generate Fuzz Cases**
```bash
npm run eval:v4plus:generate-fuzz
```

This creates `backend/eval/v4plus/datasets/fuzz200.jsonl` using seed `1234` (deterministic).

### **Run Evaluations**

**Core30 (baseline regression check):**
```bash
npm run eval:v4plus:core
```

**Hard60 (difficult curated cases):**
```bash
npm run eval:v4plus:hard
```

**Fuzz200 (robustness testing):**
```bash
npm run eval:v4plus:fuzz
```

**All datasets (290 total cases):**
```bash
npm run eval:v4plus:all
```

## 📈 Scoring & Thresholds

### **Dual Threshold System**

The v4.0+ suite uses **two pass thresholds**:

| Threshold | Score | Description |
|-----------|-------|-------------|
| **STRICT** | ≥95% | High bar for production readiness |
| **ACCEPTABLE** | ≥85% | Acceptable but needs improvement |

**Weighted Scoring:**
- Name: 25%
- Category: 25%
- Urgency: 25%
- Amount: 25%

### **Stricter Amount Tolerance**

**Default:** 5% (vs. v3.0's 10%)

Test cases can override with case-specific `amountTolerance` in strictness settings.

## 📊 Reports

After running evaluations, reports are generated in `backend/eval/v4plus/reports/`:

### **JSON Report** (`v4plus_{dataset}_{timestamp}.json`)
Machine-readable format with:
- Summary statistics
- Performance metrics
- Failure buckets
- Regression detection
- Recommended worklist

### **Markdown Report** (`v4plus_{dataset}_{timestamp}.md`)
Human-readable format with:
- Pass rates (strict & acceptable)
- Performance metrics
- Top failure buckets
- Recommended fixes

## 🔍 Failure Buckets

The runner automatically classifies failures into actionable buckets:

### **Name Extraction**
- `name_missing`: Name extracted as "Unknown" when present
- `name_fragment`: Name includes sentence fragments
- `name_title_included`: Title (Dr/Mr/Mrs) not cleaned
- `name_suffix_included`: Suffix (Jr/III) not cleaned

### **Category**
- `category_wrong`: Incorrect category selected
- `category_priority_violated`: Multi-category priority rule violated
- `category_too_generic`: Defaulted to OTHER incorrectly

### **Urgency**
- `urgency_under_assessed`: Level too low (CRITICAL → HIGH)
- `urgency_over_assessed`: Level too high (MEDIUM → CRITICAL)
- `urgency_conflicting_signals`: Failed to resolve conflicts

### **Amount**
- `amount_missing`: Amount not extracted when present
- `amount_wrong_selection`: Wrong amount from multiple numbers
- `amount_irrelevant_number`: Selected age/wage/date instead of goal

### **Robustness**
- `filler_words_broke_parsing`: Excessive fillers caused failure
- `punctuation_broke_parsing`: Punctuation chaos caused failure
- `reordering_broke_parsing`: Clause reordering caused failure
- `adversarial_not_blocked`: Adversarial token not sanitized

## 🎯 Success Criteria

| Metric | Jan v3.0 | Jan v4.0+ Target |
|--------|----------|------------------|
| **Pass Rate (core30)** | 100% | 100% (no regressions) |
| **Pass Rate (hard60)** | N/A | ≥90% strict |
| **Pass Rate (fuzz200)** | N/A | ≥85% acceptable |
| **Pass Rate (all 290)** | N/A | ≥90% acceptable |
| **Latency (p95)** | 0.6ms | <100ms per case |
| **Total Time (290 cases)** | N/A | <3000ms |
| **No Network Calls** | ✅ | ✅ Enforced |

## ⚠️ Regression Detection

Any strict failures in **core30** are flagged as **regressions** since Jan v3.0 achieved 100% on those cases.

Regression report includes:
- Test ID
- Expected score (100%)
- Actual score
- Failed fields

## 🛠️ Recommended Worklist

The runner generates a prioritized worklist for failures:

**For each failure bucket:**
- Priority (HIGH/MEDIUM/LOW based on frequency)
- Affected case count
- Suggested fix (specific actionable guidance)
- Target file (where to make changes)

## 🧪 Environment Enforcement

The runner enforces:
- **ZERO_OPENAI_MODE:** No OpenAI API calls
- **No Network:** HTTP/HTTPS requests blocked
- **PII Scan:** (placeholder for future implementation)

## 📝 Customization

### **Change Amount Tolerance**
Edit test case `strictness.amountTolerance` in dataset files.

### **Change Pass Thresholds**
Edit `CONFIG` in `runners/run_eval_v4plus.js`:
```javascript
const CONFIG = {
  STRICT_PASS_THRESHOLD: 0.95,      // Change to 0.98 for 98%
  ACCEPTABLE_PASS_THRESHOLD: 0.85,  // Change to 0.90 for 90%
  ...
};
```

### **Generate More Fuzz Cases**
```bash
node backend/eval/v4plus/generators/generate_fuzz_cases.js --seed 1234 --count 500
```

### **Use Different Seed**
```bash
node backend/eval/v4plus/generators/generate_fuzz_cases.js --seed 9999
```

## 🔧 Troubleshooting

### **"Dataset not found" error**
Ensure you've generated fuzz cases:
```bash
npm run eval:v4plus:generate-fuzz
```

### **Network violation error**
The runner blocks network calls. If you see this error, there's a bug in the parser making external requests.

### **Parser not found error**
Ensure Jan v3.0 parser exists at:
```
backend/eval/jan-v3-analytics-runner.js
```

## 📚 References

- **Jan v3.0 Baseline:** See `JAN_V4_STRATEGIC_ARCHITECTURE_RECOMMENDATIONS.md`
- **Original Test Suite:** `backend/eval/datasets/transcripts_golden_v1.jsonl`
- **Jan v3.0 Runner:** `backend/eval/jan-v3-analytics-runner.js`

## 🚀 Next Steps

1. **Generate fuzz cases:** `npm run eval:v4plus:generate-fuzz`
2. **Run baseline check:** `npm run eval:v4plus:core` (should be 100%)
3. **Run full suite:** `npm run eval:v4plus:all`
4. **Review reports** in `backend/eval/v4plus/reports/`
5. **Address top failure buckets** using recommended worklist
6. **Re-run** to validate fixes

## ⚡ Quick Start

```bash
# 1. Generate fuzz cases
npm run eval:v4plus:generate-fuzz

# 2. Quick validation (30 cases, 0.3s)
npm run eval:v4plus:quick

# 3. Progressive test (stops on failure)
npm run eval:v4plus:progressive

# 4. Full comprehensive evaluation (10,590 cases)
npm run eval:v4plus:all10k

# 5. Generate HTML report with charts
npm run eval:v4plus:html-report

# 6. Analyze failure patterns
npm run eval:v4plus:analyze-failures
```

## 🛠️ Enhanced Tools

The v4.0+ suite includes 5 powerful analysis and automation tools:

### 1. **Progressive Test Runner** 🚀
Runs tests incrementally (core30 → hard60 → fuzz200 → fuzz500 → fuzz10k), stopping on critical failures for fast feedback.
```bash
npm run eval:v4plus:progressive
```

### 2. **Baseline Comparison** 📊
Tracks performance and accuracy baselines to detect regressions automatically.
```bash
npm run eval:v4plus:baseline-save       # Save current as baseline
npm run eval:v4plus:baseline-compare    # Compare to baseline
```

### 3. **HTML Report Generator** 🎨
Creates interactive visual reports with charts and graphs.
```bash
npm run eval:v4plus:html-report
```

### 4. **Quick Validation** ⚡
Fast smoke test (core30 only, ~0.3s) for rapid development iteration.
```bash
npm run eval:v4plus:quick
```

### 5. **Failure Pattern Analyzer** 🔍
Identifies common failure patterns and suggests specific parser improvements.
```bash
npm run eval:v4plus:analyze-failures
```

**For complete details**, see:
- [ENHANCEMENTS_COMPLETE.md](./ENHANCEMENTS_COMPLETE.md) - Full documentation
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick command reference

---

**Built:** January 25, 2026  
**Version:** 4.0+  
**Total Test Cases:** 10,590 (30 core + 60 hard + 10,500 fuzz)  
**Enhancement Tools:** 5  
**Status:** ✅ PRODUCTION READY
