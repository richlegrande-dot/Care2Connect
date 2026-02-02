# Automated Testing README
## Care2Connects V1 Test Suite

---

## 🎯 OVERVIEW

This comprehensive automated testing suite validates all major components of the Care2Connects system, with special focus on:
- AssemblyAI transcription and provider abstraction
- Speech analysis and signal extraction
- Full donation pipeline (transcription → analysis → draft → QR)
- Admin operations and health monitoring
- Frontend critical user journeys

**Testing Philosophy:**
- **Deterministic by default**: All tests use mocked/stub providers unless explicitly enabled
- **No external dependencies**: Tests don't rely on unstable external services
- **CI-friendly**: Fast, repeatable, and suitable for continuous integration
- **Comprehensive fixtures**: 15 transcript fixtures covering edge cases

---

## 📁 TEST STRUCTURE

```
backend/
├── tests/
│   ├── unit/                           # Unit tests
│   │   ├── transcriptionProvider.test.ts    # Provider abstraction tests
│   │   ├── speechAnalysis.test.ts           # Signal extraction tests
│   │   └── healthAndAdminOps.test.ts        # Health/admin tests
│   ├── integration/                    # Integration tests
│   │   └── pipeline/
│   │       └── pipelineIntegration.test.ts  # End-to-end pipeline tests
│   ├── fixtures/                       # Test data
│   │   └── transcripts/               # 15 transcript fixtures
│   │       ├── 01-normal-complete.json
│   │       ├── 02-short-incomplete.json
│   │       ├── 03-no-name.json
│   │       └── ... (12 more)
│   ├── helpers/                        # Test utilities
│   │   └── testHelpers.ts             # Shared helper functions
│   └── setup.ts                        # Jest setup

frontend/
├── tests/
│   └── e2e/                           # Playwright E2E tests
│       └── criticalJourneys.spec.ts   # 5 critical user journeys
```

---

## 🚀 QUICK START

### Backend Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run specific test suites
npm run test:transcription
npm run test:speech-analysis
npm run test:pipeline
npm run test:health

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Frontend E2E Tests

```bash
cd frontend

# Install Playwright (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/criticalJourneys.spec.ts
```

---

## 🔧 CONFIGURATION

### Environment Variables

**Required for all tests:**
```bash
TRANSCRIPTION_PROVIDER=stub          # Use stub provider (default for tests)
ENABLE_STRESS_TEST_MODE=true         # Enable stub provider
ZERO_OPENAI_MODE=true                # Disable OpenAI dependencies
NODE_ENV=test                        # Test environment
```

**Optional for integration tests:**
```bash
RUN_ASSEMBLYAI_IT=true               # Enable AssemblyAI integration tests
ASSEMBLYAI_API_KEY=your_key          # Required if RUN_ASSEMBLYAI_IT=true
STUB_TRANSCRIPTION_DELAY_MS=0        # Simulate slow transcription (milliseconds)
```

**Database configuration:**
```bash
DATABASE_URL=your_test_database_url  # Use dedicated test database
```

### Jest Configuration

Tests are configured in `backend/jest.config.json`:
- Test timeout: 10 seconds (default), 30 seconds for pipeline tests
- Setup file: `tests/setup.ts`
- Coverage: Excludes `server.ts`, `app.ts`, type definitions

---

## 📊 TEST COVERAGE

### Backend Tests

**Unit Tests (tests/unit/):**
1. **Transcription Provider** (60+ assertions)
   - Provider factory and caching
   - Stub provider determinism
   - AssemblyAI provider configuration
   - Error handling and conversion
   - Optional integration tests

2. **Speech Analysis** (80+ assertions)
   - Name extraction (multiple patterns)
   - Contact info extraction (email, phone)
   - Location detection (city, state)
   - Needs categorization (7 categories)
   - Urgency scoring (0.0-1.0)
   - Key points extraction (5-10 sentences)
   - Language detection
   - Missing fields identification
   - Database persistence

3. **Health and Admin Ops** (50+ assertions)
   - /health/live endpoint
   - /health/status with service checks
   - OpenAI exclusion in zero-openai mode
   - Incident creation and resolution
   - Secret redaction
   - Port configuration validation

**Integration Tests (tests/integration/):**
1. **Pipeline Integration** (100+ assertions)
   - Full ticket processing (DRAFT → READY)
   - Transcription session creation
   - Speech analysis execution
   - Draft generation
   - NEEDS_INFO gating
   - QR code and Stripe integration (mocked)
   - Error handling and incident logging
   - Status tracking
   - Multiple transcript scenarios
   - Slow provider simulation

### Frontend Tests

**E2E Tests (frontend/tests/e2e/):**
1. Home page and navigation
2. Upload/record flow (simulated)
3. Find My Story search
4. Generate Donation Tools page
5. Admin login and story browser
6. Accessibility and performance checks

---

## 🔬 TESTING FIXTURES

### Transcript Fixtures (15 scenarios)

| ID | Name | Description | Key Features |
|----|------|-------------|--------------|
| 01 | Normal Complete | Complete story with all fields | Name, contact, location, multiple needs |
| 02 | Short Incomplete | Very short transcript | Missing critical information |
| 03 | No Name | Complete story without name | Contact info but no introduction |
| 04 | Urgent Crisis | High urgency situation | Safety keywords, emergency markers |
| 05 | Medical Needs | Healthcare-focused story | Medical terminology, treatment needs |
| 06 | Multiple Needs | Overlapping need categories | 5+ need categories |
| 07 | Noisy Transcript | Background noise and fillers | [noise], [unclear], "um", "uh" |
| 08 | Family with Children | Single parent story | Childcare, family needs |
| 09 | Positive Hopeful | Low urgency, positive tone | Hopeful language, recent employment |
| 10 | No Contact | Missing contact information | Location but no email/phone |
| 11 | Mixed Language | Few English words | Language detection edge case |
| 12 | Elder Care | Senior citizen needs | Mobility, medication, home care |
| 13 | Long Detailed | Comprehensive background | 300+ words, detailed context |
| 14 | Youth/Student | College student needs | Education, dorm, tuition |
| 15 | Transportation | Transportation-focused | Car repair, commute, rural access |

**Usage:**
```typescript
import { loadTranscriptFixture } from '../helpers/testHelpers';

const fixture = loadTranscriptFixture(1); // Load by number
const fixture = loadTranscriptFixture('01-normal-complete'); // Load by name
```

---

## 🧪 ASSEMBLYAI INTEGRATION TESTS

By default, all transcription tests use the **stub provider** for deterministic results. To test actual AssemblyAI integration:

```bash
# Set environment variables
export RUN_ASSEMBLYAI_IT=true
export ASSEMBLYAI_API_KEY=your_actual_api_key

# Run integration tests
npm run test:assemblyai-it
```

**Note:** These tests will:
- Make real API calls to AssemblyAI
- Cost money ($0.0075/minute)
- Take longer to execute (30-60 seconds)
- Require real audio files

---

## 🎭 MOCKING STRATEGY

### Default Mocks (Enabled Automatically)

1. **Transcription**: Stub provider returns fixture data
2. **Stripe**: Mock checkout session creation
3. **QR Code**: Deterministic QR data generation
4. **Cloudflare Tunnel**: Tunnel health checks skipped
5. **OpenAI**: Completely disabled in ZERO_OPENAI_MODE

### Custom Mocks

```typescript
import { mockStripeService, mockQRCodeGenerator } from '../helpers/testHelpers';

// Use in your tests
mockStripeService.createCheckoutSession.mockResolvedValue({
  checkoutSessionId: 'cs_test_123',
  checkoutUrl: 'https://checkout.stripe.com/test',
  // ...
});
```

---

## 📈 COVERAGE GOALS

**Target Coverage:**
- Overall: 80%+
- Critical paths: 90%+
- Service layer: 85%+
- Controllers/routes: 75%+

**Generate Coverage Report:**
```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## 🐛 TROUBLESHOOTING

### Common Issues

**1. "Database connection failed"**
- Ensure `DATABASE_URL` points to test database
- Verify Prisma client is generated: `npm run db:generate`

**2. "Transcription provider not available"**
- Set `ENABLE_STRESS_TEST_MODE=true`
- Set `TRANSCRIPTION_PROVIDER=stub`

**3. "Tests timing out"**
- Pipeline tests have 30s timeout (normal)
- Check for infinite loops or unresolved promises
- Increase timeout in test file if needed

**4. "Port already in use"**
- Tests should not require running server
- If needed, use unique test port: `PORT=3099 npm test`

**5. "Playwright not installed"**
```bash
cd frontend
npx playwright install
```

---

## 🔄 CI/CD INTEGRATION

### GitHub Actions Example

```yaml
name: Automated Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Generate Prisma Client
        run: cd backend && npm run db:generate
      
      - name: Run tests
        run: cd backend && npm run test:all
        env:
          TRANSCRIPTION_PROVIDER: stub
          ENABLE_STRESS_TEST_MODE: true
          ZERO_OPENAI_MODE: true
          NODE_ENV: test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  frontend-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps
      
      - name: Run E2E tests
        run: cd frontend && npm run test:e2e
```

---

## 📝 WRITING NEW TESTS

### Test Template

```typescript
import { loadTranscriptFixture, TestFactory } from '../helpers/testHelpers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('My New Feature', () => {
  let testTicketId: string;

  beforeEach(async () => {
    // Setup
    const ticket = await TestFactory.createTicket(prisma);
    testTicketId = ticket.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.recordingTicket.deleteMany({ where: { id: testTicketId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should do something', async () => {
    // Test implementation
    expect(true).toBe(true);
  });
});
```

---

## 🎯 BEST PRACTICES

1. **Use fixtures for transcript data** - Don't hardcode transcripts in tests
2. **Clean up test data** - Always delete created records in `afterEach`
3. **Mock external services** - Use stub providers by default
4. **Test edge cases** - Use fixtures like short, noisy, mixed language
5. **Assert error handling** - Test failure paths, not just success
6. **Use descriptive test names** - "should create draft when transcript is complete"
7. **Keep tests isolated** - Each test should work independently
8. **Avoid flaky tests** - Don't rely on timing or external state

---

## 📚 RELATED DOCUMENTATION

- [TEST_MATRIX.md](./TEST_MATRIX.md) - Detailed test coverage matrix
- [SAMPLE_TEST_REPORT.md](./SAMPLE_TEST_REPORT.md) - Example test run output
- [STATUS_UPDATE_2026-01-07.md](../STATUS_UPDATE_2026-01-07.md) - System status

---

## 🆘 SUPPORT

For issues or questions about the test suite:
1. Check existing tests for examples
2. Review test helper functions in `tests/helpers/testHelpers.ts`
3. Examine fixtures in `tests/fixtures/transcripts/`
4. Refer to this README for configuration options

---

**Last Updated:** January 7, 2026  
**Test Suite Version:** 1.0  
**Coverage Target:** 80%+
