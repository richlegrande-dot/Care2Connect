# Pipeline30 Test Plan
**Comprehensive Test Suite for Speech → Analysis → Parse → Revenue Generation Pipeline**

---

## Overview

The Pipeline30 test suite contains exactly **30 automated tests** that validate the complete "Speech → Analysis → Parse → Revenue Generation Documents" pipeline end-to-end and at each stage boundary.

## Test Architecture

### Test Distribution
- **01_transcriptParsing.unit.test.ts** - Tests 1-10: Transcript input and parsing
- **02_signalExtraction.unit.test.ts** - Tests 11-20: Signal extraction from transcripts  
- **03_draftAndFallback.pipeline.test.ts** - Tests 21-25: Draft generation and fallback handling
- **04_docxAndQR.pipeline.test.ts** - Tests 26-30: Document and payment completion

### Technology Stack
- **Jest** - Test runner and assertion framework
- **Supertest** - HTTP endpoint testing (where applicable)
- **Mock implementations** - For external services (Stripe, AssemblyAI)
- **AdmZip** - DOCX buffer validation and content extraction

---

## Test Categories & Purpose

### Stage A: Transcription Input (Tests 1-10)
**Purpose**: Validate transcript parsing, normalization, and text processing

| Test # | Description | Validation |
|--------|-------------|------------|
| 1 | Basic transcript text parsing | Text extraction and normalization |
| 2 | Segment-based reconstruction | Order preservation from AssemblyAI segments |
| 3 | Empty/dry transcript handling | Graceful handling of "..." or minimal input |
| 4 | Noisy transcript processing | Noise marker and filler word removal |
| 5 | Mixed language detection | Language classification and confidence scoring |
| 6 | Sentence ordering preservation | Sequential integrity from segments |
| 7 | Whitespace normalization | Text cleanup and formatting |
| 8 | Missing segments handling | Graceful fallback when segments unavailable |
| 9 | Long transcript truncation | Character limit enforcement |
| 10 | PII redaction in logs | Safe logging without exposing sensitive data |

### Stage B: Signal Extraction (Tests 11-20)
**Purpose**: Validate extracted signals from transcript content

| Test # | Description | Validation |
|--------|-------------|------------|
| 11 | Explicit name extraction | Name detection from introduction patterns |
| 12 | No name hallucination | Null return when name not present |
| 13 | Housing need detection | HOUSING category from keywords |
| 14 | Healthcare need detection | HEALTHCARE category from medical terms |
| 15 | Food need detection | FOOD category from hunger/grocery references |
| 16 | High urgency scoring | Elevated urgency for crisis keywords |
| 17 | Goal amount extraction | Monetary value detection (spoken/numeric) |
| 18 | Key points extraction | 3-5 most important sentences |
| 19 | Missing fields detection | Gap identification with follow-up questions |
| 20 | Quality confidence scoring | Confidence levels based on content completeness |

### Stage C: Draft Generation & Fallback (Tests 21-25)
**Purpose**: Validate draft creation, quality assessment, and fallback logic

| Test # | Description | Validation |
|--------|-------------|------------|
| 21 | Deterministic title generation | Consistent title from key points |
| 22 | Story body with character limits | 5000 character cap with smart truncation |
| 23 | EditableJson structure | Breakdown, categories, quality score generation |
| 24 | NEEDS_INFO status trigger | Status when required fields missing |
| 25 | Manual fallback response | MANUAL_FALLBACK status on pipeline exceptions |

### Stage D: Revenue Generation (Tests 26-30)
**Purpose**: Validate document creation and payment integration

| Test # | Description | Validation |
|--------|-------------|------------|
| 26 | DOCX buffer generation | Valid document buffer creation |
| 27 | DOCX content validation | Title and story content inclusion |
| 28 | Key points in document | Bullet points or structured sections |
| 29 | Mocked payment integration | Stripe checkout and QR code generation |
| 30 | Complete revenue package | End-to-end assembly without errors |

---

## Running Tests

### Basic Execution
```bash
# Run all Pipeline30 tests
npm run test:pipeline30

# Run with coverage report  
npm run test:pipeline30:coverage

# Run individual test files
npx jest tests/pipeline30/01_transcriptParsing.unit.test.ts
npx jest tests/pipeline30/02_signalExtraction.unit.test.ts
npx jest tests/pipeline30/03_draftAndFallback.pipeline.test.ts
npx jest tests/pipeline30/04_docxAndQR.pipeline.test.ts
```

### Environment Configuration
All tests run with:
- `NODE_ENV=test` - Test environment mode
- `LOG_LEVEL=error` - Reduced log noise
- Deterministic mocking - No network calls by default

---

## Optional AssemblyAI Integration Tests

### Enabling Live Integration
While the 30 core tests use fixtures and mocks, optional live integration tests can be enabled:

```bash
# Enable AssemblyAI live testing
export RUN_ASSEMBLYAI_IT=true
export ASSEMBLYAI_API_KEY=your_api_key_here

# Run integration tests (not counted in the 30)
npm run test:assemblyai-it
```

### Integration Test Scope
When enabled, these tests will:
- Make real API calls to AssemblyAI
- Use actual audio files from `tests/fixtures/audio/`
- Validate live transcription quality
- **Note**: These are separate from the core 30 tests

---

## Interpreting Test Failures

### Common Failure Patterns

#### Transcript Parsing Failures (Tests 1-10)
- **Cause**: Missing fixture files or path issues
- **Fix**: Verify `tests/fixtures/transcripts/` contains required JSON files
- **Debug**: Check `loadTranscriptFixture()` error messages

#### Signal Extraction Failures (Tests 11-20)  
- **Cause**: Algorithm changes or confidence threshold adjustments
- **Fix**: Update expected values or confidence thresholds
- **Debug**: Log actual vs expected signal extraction results

#### Draft Generation Failures (Tests 21-25)
- **Cause**: Business logic changes in title/story generation
- **Fix**: Update expected patterns or quality score ranges
- **Debug**: Validate draft structure and field mappings

#### Document/Payment Failures (Tests 26-30)
- **Cause**: DOCX library changes or mock configuration issues  
- **Fix**: Verify AdmZip dependency and mock implementations
- **Debug**: Check buffer generation and content validation

### Debugging Commands
```bash
# Run single test with verbose output
npx jest tests/pipeline30/01_transcriptParsing.unit.test.ts --verbose

# Run with debug logging
DEBUG=true npx jest tests/pipeline30/

# Check fixtures availability
ls -la tests/fixtures/transcripts/
```

---

## Test Data & Fixtures

### Transcript Fixtures
Location: `backend/tests/fixtures/transcripts/`

Required fixtures for Pipeline30:
- `01-normal-complete.json` - Complete story with all fields
- `07-noisy-transcript.json` - Background noise and filler words
- `11-mixed-language.json` - Mixed English/Spanish content
- `16-dry-empty.json` - Empty/dry recording
- `17-long-detailed.json` - Long transcript for truncation testing
- `18-mixed-urgency.json` - Mixed urgency keyword patterns

### Helper Utilities
- `tests/helpers/docxTextExtract.ts` - DOCX content validation
- `tests/helpers/testHelpers.ts` - Fixture loading and test utilities

---

## Coverage Goals

### Target Coverage
- **Statement Coverage**: 90%+ for pipeline functions
- **Branch Coverage**: 85%+ for decision logic
- **Function Coverage**: 95%+ for exported functions

### Coverage Exclusions
- External service mocks
- Database connection utilities (tested in integration)
- Development-only utilities

### Viewing Coverage
```bash
npm run test:pipeline30:coverage
open coverage/lcov-report/index.html
```

---

## Maintenance & Updates

### When to Update Tests
- Pipeline business logic changes
- New signal extraction rules
- Document format requirements change
- Payment integration updates

### Test Maintenance Checklist
- [ ] Verify all 30 tests pass
- [ ] Update fixture data for new scenarios
- [ ] Validate mock implementations match real services
- [ ] Check coverage thresholds are met
- [ ] Update documentation for new test patterns

### Performance Benchmarks
- Complete suite execution: < 30 seconds
- Individual test files: < 10 seconds each
- Memory usage: < 512MB during execution
- No test should exceed 5 seconds individually

---

## Integration with CI/CD

### Pre-commit Hooks
```bash
# Run before any commit
npm run test:pipeline30
```

### Build Pipeline Integration
```yaml
test:
  stage: test
  script:
    - npm install
    - npm run test:pipeline30:coverage
  artifacts:
    reports:
      coverage: coverage/cobertura-coverage.xml
```

### Quality Gates
- All 30 tests must pass
- Coverage thresholds must be met
- No test execution time violations
- No memory leaks during test execution

---

## Contact & Support

For questions about the Pipeline30 test suite:
- Review test failure output for specific guidance
- Check fixture files in `tests/fixtures/transcripts/`
- Validate mock implementations in test files
- Ensure all dependencies are installed (`adm-zip`, etc.)

**Next Steps**: Execute `npm run test:pipeline30` to run the complete suite.