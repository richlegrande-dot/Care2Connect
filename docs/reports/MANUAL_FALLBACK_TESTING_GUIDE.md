# Manual Fallback Testing Guide

## Overview
Comprehensive test suite for the Manual Fundraising Fallback Flow feature.

## Test Structure

### Unit Tests (`backend/tests/fallback/`)
- **pipelineFailureHandler.test.ts** - Tests for failure handling and incident logging (38 tests)
- **manualDraft.test.ts** - Tests for manual draft endpoints (32 tests)
- **orchestrator.test.ts** - Tests for pipeline orchestration and fallback triggers (28 tests)
- **qrGeneration.test.ts** - Tests for QR generation with generation mode tracking (24 tests)

**Total Unit Tests**: ~122 tests

### Integration Tests (`backend/tests/integration/`)
- **manualFallback.integration.test.ts** - End-to-end flow testing (10 scenarios, ~50 tests)

**Total Integration Tests**: ~50 tests

### Test Fixtures (`backend/tests/fixtures/`)
- **manualFallbackFixtures.ts** - Reusable test data, mocks, and helper functions

## Test Coverage

### Components Tested
1. ✅ Pipeline failure detection (6 failure types)
2. ✅ Automatic fallback triggers
3. ✅ Incident logging (SystemIncident creation)
4. ✅ Manual draft save/retrieve API
5. ✅ QR code generation with generationMode
6. ✅ Stripe metadata tracking
7. ✅ Partial data preservation
8. ✅ Edge cases (Unicode, long text, invalid input)
9. ✅ Performance (timing, concurrency)
10. ✅ RecordingTicket integration

### Scenarios Covered

#### Scenario 1: Transcription Success → Extraction Failure
- Pipeline fails at signal extraction
- Fallback triggered with partial data
- User saves manual draft
- QR code generated successfully

#### Scenario 2: Dry Recording
- Immediate fallback for < 10 char transcripts
- No partial data available
- User creates draft from scratch

#### Scenario 3: System Degradation
- Health check shows degraded status
- All requests fallback automatically
- Transcript preserved for manual editing

#### Scenario 4: Partial Extraction
- Some fields extracted, others missing
- Fallback with pre-filled data
- User completes missing fields

#### Scenario 5: Multiple Edits
- Draft updated multiple times
- Only latest version persisted
- Timestamps updated correctly

#### Scenario 6: Draft Retrieval
- Load existing draft for editing
- 404 for non-existent drafts

#### Scenario 7: Analytics
- All fallback types logged
- DebugId tracking
- Stripe metadata validation

#### Scenario 8: Edge Cases
- Long text (10,000+ chars)
- Unicode and emojis
- Invalid amounts
- Missing required fields

#### Scenario 9: Performance
- Rapid successive saves
- Full flow timing < 2 seconds

#### Scenario 10: RecordingTicket Integration
- End-to-end from recording to manual draft

## Running Tests

### Run All Manual Fallback Tests
```bash
cd backend
npm test -- --testPathPattern=fallback
```

### Run Unit Tests Only
```bash
npm test -- tests/fallback
```

### Run Integration Tests Only
```bash
npm test -- tests/integration/manualFallback
```

### Run Specific Test File
```bash
npm test -- tests/fallback/pipelineFailureHandler.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage --testPathPattern=fallback
```

### Run in Watch Mode
```bash
npm test -- --watch --testPathPattern=fallback
```

### Run with Verbose Output
```bash
npm test -- --verbose --testPathPattern=fallback
```

## Test Configuration

### Environment Variables Required
```env
DATABASE_URL=postgresql://user:password@localhost:5432/test_db
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=test
```

### Mock Services
The test suite mocks:
- ✅ Stripe API
- ✅ Signal extraction (extractSignals)
- ✅ Health checks (getHealthStatus)

### Database State
Tests use a real database connection but:
- Clean up after each test
- Use unique ticket IDs (prefixed with `test-` or `integration-test-`)
- Don't interfere with production data

## Expected Results

### Success Criteria
- ✅ All unit tests pass (122/122)
- ✅ All integration tests pass (50/50)
- ✅ No database connection errors
- ✅ All mocks working correctly
- ✅ Coverage > 80% for all components

### Test Output Example
```
PASS  tests/fallback/pipelineFailureHandler.test.ts
  Pipeline Failure Handler
    createPipelineFailure
      ✓ should create TRANSCRIPTION_FAILED failure with incident (125ms)
      ✓ should create PARSING_INCOMPLETE failure with partial data (98ms)
      ✓ should create SYSTEM_DEGRADED failure (87ms)
      ...
    executePipelineWithFallback
      ✓ should return success when operation succeeds (45ms)
      ✓ should return failure when operation throws (52ms)
      ...
    Incident Logging
      ✓ should create unique debugId for each failure (78ms)
      ✓ should store metadata in incident (102ms)
      ...

Test Suites: 1 passed, 1 total
Tests:       38 passed, 38 total
Snapshots:   0 total
Time:        8.241 s
```

## Debugging Failed Tests

### Common Issues

#### 1. Database Connection Errors
```bash
# Ensure Prisma client is generated
npx prisma generate

# Check database is accessible
npx prisma db push
```

#### 2. Mock Not Working
```typescript
// Ensure mocks are reset before each test
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### 3. Timing Issues
```typescript
// Increase timeout for slow operations
jest.setTimeout(30000);

// Add explicit waits
await new Promise(resolve => setTimeout(resolve, 100));
```

#### 4. Cleanup Issues
```bash
# Manually clean test data
npm run prisma:studio
# Delete records with ticketId starting with 'test-'
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Manual Fallback Tests
  run: |
    cd backend
    npm test -- --testPathPattern=fallback --coverage
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
    STRIPE_SECRET_KEY: ${{ secrets.TEST_STRIPE_KEY }}
```

### Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test -- --testPathPattern=fallback --bail"
    }
  }
}
```

## Test Maintenance

### Adding New Tests
1. Create test file in appropriate directory
2. Import fixtures and helpers
3. Follow existing test patterns
4. Update this documentation

### Updating Fixtures
Edit `backend/tests/fixtures/manualFallbackFixtures.ts` to add:
- New test transcripts
- New manual draft templates
- New helper functions

### Performance Monitoring
Tests include performance checks:
- Full flow should complete < 2 seconds
- Individual operations should complete < 500ms
- QR generation should complete < 1 second

## Reporting Issues

If tests fail unexpectedly:
1. Check test output for specific failure
2. Review logs: `npm test -- --verbose`
3. Check database state
4. Verify mocks are configured correctly
5. Ensure environment variables are set

## Coverage Goals

Current coverage targets:
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Files Covered
- `src/services/pipelineFailureHandler.ts`
- `src/services/donationPipelineOrchestrator.ts`
- `src/services/qrCodeGeneratorEnhanced.ts`
- `src/routes/manualDraft.ts`
- `src/types/fallback.ts`

## Best Practices

### Writing Tests
1. ✅ Use descriptive test names
2. ✅ Follow AAA pattern (Arrange, Act, Assert)
3. ✅ Clean up after tests
4. ✅ Use fixtures for test data
5. ✅ Mock external dependencies
6. ✅ Test happy path and error cases
7. ✅ Include edge cases
8. ✅ Verify database state
9. ✅ Check incident logging
10. ✅ Test performance

### Test Organization
```
backend/tests/
├── fallback/           # Unit tests
│   ├── pipelineFailureHandler.test.ts
│   ├── manualDraft.test.ts
│   ├── orchestrator.test.ts
│   └── qrGeneration.test.ts
├── integration/        # Integration tests
│   └── manualFallback.integration.test.ts
├── fixtures/           # Test data
│   └── manualFallbackFixtures.ts
├── setup/              # Test setup
│   └── fallback.setup.ts
└── config/             # Test config
    └── manualFallback.jest.config.ts
```

## Quick Reference

### Run All Tests
```bash
npm test -- --testPathPattern=fallback
```

### Run Specific Scenario
```bash
npm test -- -t "Scenario 1"
```

### Run Single Test
```bash
npm test -- -t "should trigger fallback when signal extraction fails"
```

### Check Coverage
```bash
npm test -- --coverage --testPathPattern=fallback
```

### Update Snapshots (if needed)
```bash
npm test -- --updateSnapshot
```

## Success Validation

After running tests, verify:
- ✅ All tests pass
- ✅ No database connection errors
- ✅ Coverage meets thresholds
- ✅ No console errors (except expected test errors)
- ✅ Performance benchmarks met
- ✅ All incidents cleaned up

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Support

For questions or issues:
1. Check this guide
2. Review test output
3. Check implementation files
4. Review [MANUAL_FALLBACK_IMPLEMENTATION_COMPLETE.md](../MANUAL_FALLBACK_IMPLEMENTATION_COMPLETE.md)
