# Pipeline Testing Guide

**Purpose**: Comprehensive automated testing for the Care2Connect speech-to-revenue-documents pipeline

## Overview

This test suite validates the complete pipeline from audio recording to revenue-generating documents:

```
Audio → AssemblyAI → Transcript → Signal Extraction → GoFundMe Draft → Word Document + QR Code
```

## Test Categories

### 1. **Pipeline Tests** (`tests/pipeline/`)
End-to-end validation of the complete speech-to-revenue pipeline.

| Test File | Focus | Tests |
|-----------|-------|-------|
| `speechToDraft.pipeline.test.ts` | Transcript → Draft generation | 25+ |
| `speechToDocx.pipeline.test.ts` | Draft → Word document export | 20+ |
| `speechToQR.pipeline.test.ts` | QR + Stripe checkout integration | 30+ |
| `speechEdgeCases.pipeline.test.ts` | Edge cases and error conditions | 20+ |

### 2. **Unit Tests** (`tests/unit/`)
Isolated component testing.

- `transcriptSignalExtractor.unit.test.ts` - Signal extraction logic (21 tests)
- `assemblyaiParser.unit.test.ts` - AssemblyAI payload parsing
- `docxGenerator.unit.test.ts` - Document generation helpers
- `qrGenerator.unit.test.ts` - QR code generation utilities

### 3. **Integration Tests** (`tests/integration/`)
External service integration (optional, gated by env vars).

- AssemblyAI real transcription (RUN_ASSEMBLYAI_IT=true)
- Stripe real checkout sessions (RUN_STRIPE_IT=true)

---

## Running Tests

### Quick Start
```bash
# All pipeline tests
npm run test:pipeline

# Specific test suite
npm run test:pipeline:speech    # Transcript → Draft
npm run test:pipeline:docx      # Draft → Word doc
npm run test:pipeline:qr        # QR + Stripe
npm run test:pipeline:edges     # Edge cases

# All tests (unit + integration + pipeline)
npm run test:all

# Watch mode for development
npm run test:watch
```

### By Category
```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# With coverage report
npm run test:coverage
```

### Integration Tests (External APIs)
```bash
# Enable AssemblyAI integration tests (requires API key)
RUN_ASSEMBLYAI_IT=true npm run test:assemblyai-it

# All integration tests (not recommended without review)
RUN_ALL_INTEGRATION_TESTS=true npm test
```

---

## Test Mode Configuration

### Default Mode (Recommended)
- **AssemblyAI**: Mocked/stubbed with fixture transcripts
- **Stripe**: Mocked SDK with deterministic responses
- **OpenAI**: Disabled (V1_STABLE=true, AI_PROVIDER=rules)
- **Database**: Test database or in-memory
- **Background Services**: Disabled (START_BACKGROUND_SERVICES=false)

**Environment:**
```bash
NODE_ENV=test
V1_STABLE=true
AI_PROVIDER=rules
ZERO_OPENAI_MODE=true
START_BACKGROUND_SERVICES=false
```

### Integration Mode (Optional)
Requires real API keys and network access.

**Environment:**
```bash
RUN_ASSEMBLYAI_IT=true
ASSEMBLYAI_API_KEY=<real_key>
```

---

## Fixtures

### Transcript Fixtures
Location: `tests/fixtures/transcripts/pipeline/`

| Fixture | Description | Use Case |
|---------|-------------|----------|
| `COMPLETE_TRANSCRIPT` | Full data (name, age, contact, goal) | Happy path testing |
| `PARTIAL_TRANSCRIPT` | Missing some fields (no email, no age) | Partial data handling |
| `DRY_RECORDING` | Minimal/no speech ("...") | Empty input validation |
| `EMERGENCY_HOUSING_TRANSCRIPT` | High urgency keywords | Emergency detection |
| `RENTAL_ASSISTANCE_TRANSCRIPT` | Specific housing need | Category classification |
| `NO_NAME_TRANSCRIPT` | Missing name field | Critical field validation |

### Expected Outputs
Location: `tests/fixtures/expected/`

- `EXPECTED_SIGNALS` - Expected extracted data for each fixture
- `EXPECTED_DRAFTS` - Expected GoFundMe draft content
- `EXPECTED_MISSING_FIELDS` - Expected missing field lists
- `EXPECTED_FOLLOWUP_QUESTIONS` - Expected follow-up prompts

### Audio Fixtures (Optional)
Location: `tests/fixtures/audio/pipeline/`

Small audio files (5-15 seconds) for optional integration tests only.

---

## What Each Test Suite Validates

### Speech-to-Draft Tests
**File:** `speechToDraft.pipeline.test.ts`

✅ **Complete Data Pipeline**
- Extracts all signals (name, age, email, phone, location, goal, urgency)
- Validates high-quality signal detection
- Generates complete draft with all fields
- Includes all key points in story

✅ **Partial Data Pipeline**
- Extracts available fields, marks others as null
- Validates medium-quality signal detection
- Generates draft with defaults for missing fields
- Identifies missing fields correctly

✅ **Dry Recording Pipeline**
- Extracts no signals from empty transcript
- Validates low-quality signal detection
- Returns null draft (when allowPartial=false)
- Generates comprehensive follow-up questions

✅ **Performance**
- Signal extraction < 100ms
- Draft generation < 500ms (rules-based)
- Batch processing without degradation

---

### DOCX Generation Tests
**File:** `speechToDocx.pipeline.test.ts`

✅ **Document Structure**
- Valid DOCX file (ZIP structure)
- Required XML files present
- Document opens without corruption

✅ **Content Accuracy**
- Campaign title included
- Story content included
- Goal amount formatted correctly ($1,500)
- Category information present
- Location included
- Contact information included

✅ **Instructions & Metadata**
- Instructions included by default
- Can be excluded via options
- Paste map included by default
- Date stamp present

✅ **QR Code Embedding**
- QR image embedded when available
- Media files in DOCX package
- Document valid without QR
- QR instructions present

✅ **Special Characters**
- Unicode characters (María José, €, 🏠)
- HTML entities (&amp;, quotes)
- Line breaks preserved
- Very long text handled

✅ **Performance**
- Document generation < 2 seconds
- Batch generation (5 docs) without memory issues
- Reasonable file size (< 100KB without images)

---

### QR + Stripe Tests
**File:** `speechToQR.pipeline.test.ts`

✅ **QR Code Generation**
- Valid PNG data URL format
- Consistent output for same URL
- Different QR for different URLs
- Long URLs supported
- Performance < 500ms

✅ **Stripe Checkout (Mocked)**
- Session created with correct parameters
- Metadata included (ticketId, recordingId)
- Deterministic session ID in test mode
- URL format consistent

✅ **Database Persistence**
- QRCodeLink record created
- All fields populated correctly
- QR data URL stored
- Metadata preserved
- Unique links per ticket

✅ **Metadata Attribution**
- ticketId correctly attributed
- recordingId included in metadata
- Custom fields preserved
- Nested data supported

✅ **Error Handling**
- Stripe API errors caught
- Invalid ticket ID rejected
- Zero/negative amounts rejected

---

### Edge Cases Tests
**File:** `speechEdgeCases.pipeline.test.ts`

✅ **Dry Recordings**
- Empty transcript handled
- Only punctuation handled
- Very short meaningless recordings

✅ **Noisy/Unclear Audio**
- Partial data extracted despite [inaudible] markers
- Quality marked as low/medium
- Follow-up questions generated

✅ **Missing Critical Fields**
- No name handled gracefully
- Follow-up questions generated
- Other fields still extracted

✅ **Provider Failures**
- Null transcript handled
- Undefined input handled
- Non-string input handled

✅ **Special Characters**
- Unicode characters (María José)
- Emojis in transcript (👋, 😊, 🏠)
- HTML entities (&amp;)

✅ **Boundary Cases**
- Maximum transcript length (1000+ repetitions)
- Minimum viable transcript (2 words)
- Maximum goal amount ($999,999)
- Multiple phone numbers
- Multiple email addresses

---

## Performance Budgets

All tests enforce performance budgets to catch regressions:

| Operation | Budget | Test |
|-----------|--------|------|
| Signal extraction | < 100ms | speechToDraft |
| Draft generation (rules) | < 500ms | speechToDraft |
| DOCX generation | < 2s | speechToDocx |
| QR generation | < 500ms | speechToQR |
| Stripe session (mocked) | < 1s | speechToQR |
| Full pipeline (mocked) | < 5s | All |

---

## Test Coverage Goals

Target coverage for pipeline code:

- **Signal Extraction**: > 90% (critical path)
- **Draft Generation**: > 85%
- **DOCX Export**: > 80%
- **QR Generation**: > 90%
- **Overall Pipeline**: > 80%

Check coverage:
```bash
npm run test:coverage
```

---

## Adding New Tests

### 1. Add Fixture
Create new transcript in `tests/fixtures/transcripts/pipeline/fixtures.ts`:

```typescript
export const NEW_SCENARIO_TRANSCRIPT = {
  id: 'aai_new_001',
  status: 'completed',
  text: 'Your transcript text here...',
  // ... other fields
};
```

### 2. Add Expected Output
Add expected signals in `tests/fixtures/expected/drafts.ts`:

```typescript
export const EXPECTED_SIGNALS = {
  // ...
  newScenario: {
    name: 'Expected Name',
    age: 30,
    // ...
  }
};
```

### 3. Write Test
Add test case in appropriate file:

```typescript
describe('New Scenario', () => {
  test('should handle new scenario correctly', () => {
    const signals = extractSignals(NEW_SCENARIO_TRANSCRIPT.text);
    expect(signals.name).toBe(EXPECTED_SIGNALS.newScenario.name);
  });
});
```

---

## Troubleshooting

### Tests Fail: "Cannot find module"
```bash
cd backend
npm install
npm run db:generate  # Regenerate Prisma client
```

### Tests Timeout
- Increase timeout: `jest.setTimeout(10000)` in test file
- Check for real API calls (should be mocked)
- Check for infinite loops in code

### Background Services Start During Tests
```bash
# Ensure test environment disables services
export NODE_ENV=test
export START_BACKGROUND_SERVICES=false
npm test
```

### Database Connection Errors
```bash
# Ensure test database is accessible
npm run db:up
npm run db:push
```

### Mocks Not Working
- Check mock path matches import path exactly
- Ensure `jest.mock()` before imports
- Clear Jest cache: `jest --clearCache`

---

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Pipeline Tests
  run: |
    cd backend
    npm run test:pipeline
  env:
    NODE_ENV: test
    START_BACKGROUND_SERVICES: false
    V1_STABLE: true
```

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run test:pipeline --bail
```

---

## Best Practices

1. **Always Mock External APIs** in default tests
2. **Use Fixtures** for consistent test data
3. **Test Edge Cases** explicitly (don't rely on happy path)
4. **Enforce Performance Budgets** to catch regressions
5. **Keep Tests Fast** (< 30s total for pipeline suite)
6. **Use Descriptive Test Names** that explain what's being validated
7. **Group Related Tests** with `describe` blocks
8. **Clean Up Test Data** in `afterEach` hooks
9. **Don't Test External APIs** by default (use integration test gates)
10. **Update Fixtures** when schema changes

---

## Related Documentation

- [Test Matrix](./TEST_MATRIX_PIPELINE.md) - Detailed scenario mapping
- [Startup Runbook](../../STARTUP_RUNBOOK.md) - Server startup procedures
- [Jest Config](../jest.config.json) - Test configuration

---

**Last Updated**: January 11, 2026
