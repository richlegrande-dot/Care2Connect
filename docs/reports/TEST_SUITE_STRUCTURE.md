# Test Suite Structure Report
**Date**: January 14, 2026  
**Agent**: GitHub Copilot (Claude Sonnet 4)  
**Purpose**: Organization of parsing test suite into core vs extended coverage

## TEST SUITE REORGANIZATION COMPLETE

### Core 30 Test Suite - Production Essential
**File**: `backend/src/tests/unit/parsing/core30.test.ts`  
**Purpose**: Minimum viable test coverage for production deployment  
**Test Count**: Exactly 30 tests  

#### Test Distribution:
- **Name Extraction** (8 tests): Core patterns, false positive prevention, edge cases
- **Amount Extraction** (8 tests): Dollar amounts, written numbers, context validation  
- **Relationship Classification** (6 tests): Self/family/other detection
- **Urgency Classification** (6 tests): Critical/high/medium/low with keywords
- **Integration & Reliability** (2 tests): Full pipeline + never-fail guarantee

#### Critical Coverage Areas:
✅ **False Positive Prevention**: Rejects place names, companies, age references  
✅ **Amount Context Validation**: Requires context, rejects hourly rates  
✅ **Range Handling**: Midpoint calculation for "between X and Y"  
✅ **Written Numbers**: "fifteen hundred dollars" → 1500  
✅ **Bounding**: Caps amounts at reasonable limits  
✅ **Never-Fail**: Empty input returns valid structure with fallbacks  
✅ **Full Pipeline**: Complete transcript with all extractions + telemetry

### Extended Test Suite - Regression & Edge Cases
**Directory**: `backend/src/tests/unit/parsing/extended/`  
**Purpose**: Comprehensive edge case coverage and regression prevention  

#### Files Moved to Extended:
- `comprehensive-phase6.test.ts` (50+ comprehensive scenarios)
- `observability-phase5.test.ts` (Telemetry validation)  
- `document-generation-phase4.test.ts` (DOCX generation hardening)

#### Remaining Core Tests:
- `correctness-phase1.test.ts` (20+ correctness tests)
- `performance-phase2.test.ts` (Performance benchmarks)  
- `reliability-phase3.test.ts` (Reliability validation)

## NPM SCRIPT COMMANDS ADDED

### Core 30 Test Execution:
```bash
npm run test:parsing:core30
```
**Purpose**: Run only the essential 30 tests for CI/CD pipeline  
**Execution Time**: <30 seconds  
**Coverage**: Production-critical functionality

### Extended Test Execution:
```bash
npm run test:parsing:extended
```
**Purpose**: Run comprehensive regression and edge case testing  
**Execution Time**: 2-5 minutes  
**Coverage**: All edge cases, performance validation, observability

## RATIONALE FOR CORE 30 SELECTION

### Why These 30 Tests?
1. **Production Readiness**: Each test validates critical business functionality
2. **Revenue Pipeline**: Direct impact on document generation and QR creation
3. **Never-Fail Guarantee**: Validates fallback mechanisms work correctly
4. **False Positive Prevention**: Prevents incorrect extractions that could harm user experience
5. **Performance**: Tests complete without external dependencies

### Why Extended Tests Are Separate?
1. **Scope Creep Control**: 50+ tests exceeded original 30-test requirement
2. **CI/CD Efficiency**: Core tests run faster for rapid feedback
3. **Maintenance**: Extended tests can evolve without affecting core validation
4. **Observability**: Telemetry tests are important but not core business logic

## TEST EXECUTION STRATEGY

### Development Workflow:
1. **During Development**: Run `test:parsing:core30` for rapid feedback
2. **Pre-commit**: Run both core30 and extended for full validation
3. **CI/CD Pipeline**: Core30 in main pipeline, extended in nightly builds
4. **Production Deployment**: Both suites must pass

### Performance Expectations:
- **Core 30**: <30 seconds execution time
- **Extended**: 2-5 minutes with performance benchmarks
- **Integration**: Additional 30-60 seconds for end-to-end pipeline

## CORE VS EXTENDED BREAKDOWN

### Core 30 Focus Areas:
- Business-critical extraction accuracy
- Revenue pipeline compatibility  
- Production error handling
- Never-fail guarantee validation
- Essential performance requirements

### Extended Suite Focus Areas:
- Comprehensive edge case coverage
- Performance benchmarking and optimization
- Observability and telemetry validation
- Document generation hardening
- Regression prevention for rare scenarios

## MAINTENANCE GUIDELINES

### Adding New Tests:
- **Core**: Only add if business-critical or replaces existing test
- **Extended**: Add freely for new features or edge cases discovered

### Test Quality Standards:
- **Core**: Must be deterministic, fast, no external dependencies
- **Extended**: Can include performance tests, integration scenarios

### Review Process:
- Core test changes require architecture review
- Extended test additions can follow normal PR process

## CONCLUSION

The test suite is now properly organized with a lean, fast core of 30 essential tests that provide production confidence, backed by comprehensive extended testing for edge cases and performance validation.

**Total Test Coverage**:
- **Core 30**: Production-critical functionality ✅
- **Extended 50+**: Comprehensive edge cases ✅  
- **Integration**: End-to-end pipeline validation ✅
- **Performance**: Benchmarking and optimization ✅

**Execution Strategy**: Core tests for rapid development feedback, extended tests for comprehensive validation before production deployment.