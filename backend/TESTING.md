# Testing Guide

## PM2 Usage in Tests

**PM2 is not used for tests.** Tests run against isolated Express app instances created by `createTestApp()` factory, which mounts all routes but disables background services.

### Test App Factory
- Location: `backend/tests/helpers/createTestApp.ts`
- Creates Express app with all routes mounted
- Background services (health schedulers, monitoring) are disabled
- No PM2 process management required

### Running Tests
```bash
# Backend tests
npm run test

# Integration tests
npm run test:integration

# Pipeline tests
npm run test:pipeline
```

### Test Environment
- Tests use `.env.test` for isolated database configuration
- Background services are mocked in `tests/setup.ts`
- No tunnel or domain requirements for tests