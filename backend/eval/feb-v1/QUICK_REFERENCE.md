# Jan v4.0+ Quick Reference Guide

**Last Updated:** January 25, 2026

---

## ⚡ Quick Commands

### **Development (Fast Feedback)**
```bash
npm run eval:v4plus:quick              # 0.3s - Core30 only
npm run eval:v4plus:progressive        # Variable - Stops on failure
```

### **Full Validation**
```bash
npm run eval:v4plus:all                # 290 cases (~3s)
npm run eval:v4plus:all500             # 590 cases (~6s)
npm run eval:v4plus:all10k             # 10,590 cases (~105s)
```

### **Analysis & Reporting**
```bash
npm run eval:v4plus:html-report        # Visual charts
npm run eval:v4plus:analyze-failures   # Pattern analysis
npm run eval:v4plus:baseline-compare   # Regression check
```

---

## 📊 Test Suite Sizes

| Suite | Cases | Runtime | Use Case |
|-------|-------|---------|----------|
| core30 | 30 | 0.3s | Smoke test, baseline validation |
| hard60 | 60 | 0.6s | Edge case testing |
| fuzz200 | 200 | 2s | Quick generalization check |
| fuzz500 | 500 | 5s | Standard development testing |
| fuzz10k | 10,500 | 105s | Comprehensive stress test |
| **all** | **290** | **3s** | **Daily development** |
| **all500** | **590** | **6s** | **Pre-commit validation** |
| **all10k** | **10,590** | **105s** | **Release validation** |

---

## 🎯 Common Scenarios

### "I just changed the parser, is it broken?"
```bash
npm run eval:v4plus:quick
```
✅ 100% = Clean  
❌ <100% = Regression detected

---

### "I want to commit this change"
```bash
npm run eval:v4plus:progressive --stop-on-regression
```
✅ All passed = Safe to commit  
❌ Stopped early = Fix before commit

---

### "What's failing and why?"
```bash
npm run eval:v4plus:all10k
npm run eval:v4plus:analyze-failures
```
📊 Shows patterns, root causes, suggested fixes

---

### "Did I introduce a regression?"
```bash
npm run eval:v4plus:all10k
npm run eval:v4plus:baseline-compare
```
📈 Compares accuracy and performance to baseline

---

### "I need a report for stakeholders"
```bash
npm run eval:v4plus:all10k
npm run eval:v4plus:html-report
```
🎨 Opens beautiful HTML report with charts

---

## 🔄 Recommended Daily Workflow

```bash
# 1. Quick check (every code change)
npm run eval:v4plus:quick

# 2. Progressive test (before commit)
npm run eval:v4plus:progressive

# 3. Full validation (end of day)
npm run eval:v4plus:all500

# 4. Weekly comprehensive
npm run eval:v4plus:all10k
npm run eval:v4plus:baseline-compare
```

---

## 🚨 Pass Rate Thresholds

### **Strict Pass (≥95% target)**
- All fields must match exactly
- Amount within 2-5% tolerance
- Name exact token match

### **Acceptable Pass (≥85% target)**
- Minor deviations allowed
- Fuzzy name matching enabled
- Amount within 10% tolerance

### **Progressive Thresholds**
- **core30**: 100% strict (required)
- **hard60**: ≥85% acceptable
- **fuzz200**: ≥80% acceptable
- **fuzz500**: ≥75% acceptable
- **fuzz10k**: ≥70% acceptable

---

## 📁 File Locations

### **Datasets**
- `backend/eval/v4plus/datasets/core30.jsonl` - 30 baseline cases
- `backend/eval/v4plus/datasets/hard60.jsonl` - 60 edge cases
- `backend/eval/v4plus/datasets/fuzz200.jsonl` - 200 fuzz (auto-generated)
- `backend/eval/v4plus/datasets/fuzz500.jsonl` - 500 fuzz (auto-generated)
- `backend/eval/v4plus/datasets/fuzz10k.jsonl` - 10,500 fuzz (auto-generated)

### **Reports**
- `backend/eval/v4plus/reports/latest.json` - Most recent run
- `backend/eval/v4plus/reports/latest.html` - Visual report
- `backend/eval/v4plus/reports/latest.md` - Markdown summary

### **Baselines**
- `backend/eval/v4plus/baselines.json` - Saved baselines for regression detection

### **Utilities**
- `backend/eval/v4plus/runners/run_progressive.js` - Progressive runner
- `backend/eval/v4plus/runners/quick_validate.js` - Quick validation
- `backend/eval/v4plus/utils/baseline_manager.js` - Baseline management
- `backend/eval/v4plus/utils/generate_html_report.js` - HTML generator
- `backend/eval/v4plus/utils/failure_analyzer.js` - Pattern analyzer

---

## 🛠️ Troubleshooting

### "Quick validation failed"
```bash
# Get details
npm run eval:v4plus:core

# Check which test failed
# Look at reports/latest.json for case IDs
```

### "Baseline comparison shows regression"
```bash
# See detailed diff
npm run eval:v4plus:baseline-compare

# Investigate specific failures
npm run eval:v4plus:analyze-failures

# If intentional, update baseline
npm run eval:v4plus:baseline-save
```

### "Too many failures, where do I start?"
```bash
# Get prioritized fix list
npm run eval:v4plus:analyze-failures

# Focus on HIGH priority patterns first
# Look at "Suggested Fixes" section
```

### "Tests running slow"
- ✅ Use `quick_validate` for rapid iteration
- ✅ Use `progressive` to stop early on failure
- ✅ Reserve `all10k` for weekly validation only

---

## 📊 Mutation Coverage (fuzz10k)

| Mutation Type | Cases | Coverage |
|---------------|-------|----------|
| Filler Words | 7,398 | 70.5% |
| Irrelevant Numbers | 6,354 | 60.5% |
| Clause Reordering | 5,195 | 49.5% |
| Irrelevant Keywords | 5,247 | 50.0% |
| Punctuation Chaos | 4,203 | 40.0% |
| Adversarial Tokens | 507 | 4.8% |
| **Total Mutations** | **27,404** | **Average 2.61 per case** |

---

## 🎯 Success Criteria

### **Ready for Commit**
- ✅ `npm run eval:v4plus:quick` = 100%
- ✅ `npm run eval:v4plus:progressive` = All passed

### **Ready for Release**
- ✅ `npm run eval:v4plus:all10k` ≥ 85% acceptable
- ✅ `npm run eval:v4plus:baseline-compare` = No critical regressions
- ✅ No HIGH priority failure patterns with >5% occurrence

### **Production Ready**
- ✅ All release criteria met
- ✅ HTML report reviewed by team
- ✅ Baseline updated and saved
- ✅ All HIGH priority patterns < 2% occurrence

---

**Need more details?** See [ENHANCEMENTS_COMPLETE.md](./ENHANCEMENTS_COMPLETE.md)
