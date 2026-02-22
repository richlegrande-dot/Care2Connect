# Enhanced Parsing Tests - Quick Reference Guide

## 📋 What Was Created

### New Test Files
1. **adversarial-phase4.test.ts** (~800 lines, 250+ tests)
   - Adversarial name extraction (names that look like words)
   - Adversarial amount extraction (confusing monetary contexts)
   - Real-world messy transcripts (filler words, corrections)
   - Security testing (ReDoS, injection attacks)
   - Performance under stress

2. **extreme-edge-cases-phase5.test.ts** (~900 lines, 200+ tests)
   - Psychological manipulation attempts
   - Linguistic complexity (double negatives, sarcasm)
   - Numerical complexity (scientific notation, roman numerals)
   - Cultural/multilingual challenges
   - Semantic paradoxes
   - Total chaos integration test

3. **ENHANCED_PARSING_TEST_SUITE_DOCUMENTATION.md**
   - Complete documentation of all test categories
   - Expected behaviors and success criteria
   - Maintenance guidelines

## 🎯 Test Difficulty Levels

### Phase 1-3 (Existing) - BASELINE
- ✅ Standard correctness tests
- ✅ Performance benchmarks
- ✅ Basic reliability

### Phase 4 (New) - HARD
- 🔥 Intentionally deceptive inputs
- 🔥 Real-world messy speech
- 🔥 Edge cases and ambiguity
- 🔥 Security attack patterns

### Phase 5 (New) - EXTREME
- 🔥🔥🔥 Near-impossible scenarios
- 🔥🔥🔥 Pathological cases
- 🔥🔥🔥 Total chaos
- 🔥🔥🔥 Maximum stress

## 🚀 Quick Start

### Run Just the New Tests
```powershell
# Phase 4: Adversarial tests
cd backend
npm test adversarial-phase4.test.ts

# Phase 5: Extreme edge cases  
npm test extreme-edge-cases-phase5.test.ts
```

### Run All Parsing Tests
```powershell
cd backend
npm test -- --testPathPattern="parsing"
```

### Run With Verbose Output
```powershell
npm test -- --verbose adversarial-phase4.test.ts
```

### Run With Coverage
```powershell
npm test -- --coverage --testPathPattern="parsing"
```

## 📊 Expected Results

### Success Criteria
- **Minimum**: 70% pass rate
- **Target**: 85% pass rate  
- **Stretch**: 95% pass rate

### Performance Targets
- Single extraction: <10ms
- Full transcript: <100ms
- Batch 10,000: <3 seconds (>3000 ops/sec)

### Confidence Accuracy
- Clear cases: >0.8 confidence
- Ambiguous: <0.7 confidence
- All scores: 0.0 to 1.0 range

## 🔍 Key Test Categories

### Most Challenging Tests

#### 1. **Double Negatives** (Phase 5)
```typescript
"I'm not saying I don't need $2,000 but I'm also not not saying..."
// Expected: Extract $2,000 with low confidence (<0.7)
```

#### 2. **Multiple Contradictions** (Phase 4)
```typescript
"My name is Sarah but everyone calls me Jennifer but legally I'm Sarah Elizabeth..."
// Expected: Extract "Sarah Johnson" (first clear mention)
```

#### 3. **Context Injection** (Phase 4)
```typescript
"I owe $25,000 but I'm trying to raise $3,000 to make a payment"
// Expected: Extract $3,000 (has "raise" context, not debt)
```

#### 4. **Total Chaos** (Phase 5)
```typescript
// 500+ word transcript with:
// - Static, coughs, crying
// - Name contradictions
// - Multiple amounts
// - Urgency flip-flops
// - Number confusions
// Expected: Extract something reasonable, <500ms, quality score <70
```

## 🐛 What Each Phase Tests

### Phase 4: Adversarial Stress
| Category | Tests | Difficulty |
|----------|-------|------------|
| Name extraction | 60+ | 🔥🔥🔥 |
| Amount extraction | 70+ | 🔥🔥🔥 |
| Messy transcripts | 50+ | 🔥🔥 |
| Security | 15+ | 🔥🔥🔥 |
| Performance | 30+ | 🔥🔥 |

### Phase 5: Extreme Edge Cases
| Category | Tests | Difficulty |
|----------|-------|------------|
| Psychological manipulation | 30+ | 🔥🔥 |
| Linguistic complexity | 50+ | 🔥🔥🔥🔥 |
| Numerical formats | 40+ | 🔥🔥🔥 |
| Multilingual | 50+ | 🔥🔥🔥 |
| Total chaos | 1 | 🔥🔥🔥🔥🔥 |

## 🛠️ Interpreting Results

### If Many Tests Fail
**Common Causes**:
1. Helper function names changed
2. Confidence thresholds need adjustment
3. New patterns broke existing logic
4. Test expectations too strict

**Solutions**:
1. Check imports in test files
2. Review confidence calculation
3. Run baseline tests (phases 1-3) first
4. Adjust test expectations if reasonable

### If Performance Tests Fail
**Common Causes**:
1. Catastrophic backtracking in regex
2. Cache not working correctly
3. Inefficient pattern ordering
4. Memory leaks

**Solutions**:
1. Profile with Node.js inspector
2. Check cache hit rates
3. Reorder patterns (most common first)
4. Add pattern optimization

### If Confidence Scores Are Off
**Common Causes**:
1. Context windows too narrow
2. Reject patterns too aggressive
3. Confidence weights miscalibrated

**Solutions**:
1. Expand context extraction
2. Review reject pattern matches
3. Adjust confidence calculation

## 📈 Metrics to Watch

### During Test Run
```bash
# Look for these in output:
- Extraction time per transcript
- Throughput (ops/sec)
- Confidence score distribution
- Quality score patterns
```

### After Test Run
```bash
# Check these metrics:
- Pass/fail ratio by category
- Average processing time
- Memory usage growth
- Failed test patterns
```

## 🎓 Learning From Failures

### Expected Failures
Some tests WILL fail legitimately:
- **Sarcasm detection**: "Oh sure, I totally DON'T need $3,000"
- **Deep semantic understanding**: Requires AI/ML
- **Multi-sentence context**: Beyond regex capabilities

### Unexpected Failures
These indicate bugs:
- **Crashes/hangs**: Should never happen
- **Invalid data structures**: Should always return valid objects
- **Wildly incorrect extractions**: Basic cases should work
- **Severe performance issues**: Should be reasonably fast

## 🔧 Troubleshooting

### Import Errors
```typescript
// If you see: "Cannot find module..."
// Check that these functions exist in rulesEngine.ts:
- extractNameWithConfidence
- extractGoalAmountWithConfidence
- extractBeneficiaryRelationship
- extractUrgency
- extractAllWithTelemetry
```

### Timeout Errors
```typescript
// If tests timeout, increase Jest timeout:
jest.setTimeout(10000); // 10 seconds
```

### Memory Errors
```typescript
// If Node runs out of memory:
node --max-old-space-size=4096 node_modules/.bin/jest
```

## 📝 Next Steps After Running

### 1. Analyze Results
- Which categories had most failures?
- Were there performance bottlenecks?
- Did confidence scores make sense?

### 2. Prioritize Improvements
- Fix crashes first (highest priority)
- Optimize performance second
- Improve accuracy third
- Enhance edge cases last

### 3. Document Findings
- Create issue for each bug found
- Note patterns that consistently fail
- Track improvement ideas

### 4. Iterate
- Fix high-priority issues
- Re-run tests
- Adjust test expectations if needed
- Add regression tests

## 💡 Pro Tips

### Running Specific Tests
```powershell
# Run only name extraction tests
npm test -- -t "Adversarial Name Extraction"

# Run only performance tests
npm test -- -t "Performance"

# Run single test
npm test -- -t "should handle double negatives"
```

### Debug Mode
```powershell
# Run with Node inspector
node --inspect-brk node_modules/.bin/jest adversarial-phase4.test.ts

# Then open chrome://inspect in Chrome
```

### Watch Mode
```powershell
# Auto-rerun on file changes
npm test -- --watch adversarial-phase4.test.ts
```

## 🎯 Success Indicators

### Your Tests Are Valuable If...
✅ They reveal bugs you didn't know about  
✅ They prevent regressions in future changes  
✅ They document expected behavior clearly  
✅ They run fast enough for CI/CD  
✅ They fail for the right reasons

### Your Tests Need Work If...
❌ They're flaky (pass/fail randomly)  
❌ They take too long to run  
❌ They fail when code is correct  
❌ They're hard to understand  
❌ They duplicate other tests

## 📚 Additional Resources

- **Full Documentation**: `ENHANCED_PARSING_TEST_SUITE_DOCUMENTATION.md`
- **Parser Code**: `backend/src/utils/extraction/rulesEngine.ts`
- **Baseline Tests**: `backend/src/tests/unit/parsing/` (phases 1-3)
- **Fixtures**: `backend/tests/fixtures/transcripts/`

---

## 🚦 Ready to Run?

### Pre-Flight Checklist
- [ ] Backend dependencies installed (`npm install`)
- [ ] TypeScript compiled (`npm run build` or `tsc`)
- [ ] All imports in test files valid
- [ ] Helper functions match current API

### Run Command
```powershell
cd c:\Users\richl\Care2system\backend
npm test adversarial-phase4.test.ts
npm test extreme-edge-cases-phase5.test.ts
```

---

**Remember**: These tests are DESIGNED TO BE HARD. Don't be discouraged by failures - use them to improve the system! 🚀

**Status**: ⏳ Ready to run (awaiting user approval)  
**Created**: 2026-01-14
