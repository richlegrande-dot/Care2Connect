# CareConnect Testing Guide

## Overview

CareConnect uses a comprehensive testing strategy covering both backend and frontend components. Our testing stack includes unit tests, integration tests, and end-to-end testing capabilities.

## Testing Stack

### Backend Testing
- **Jest** - JavaScript testing framework
- **Supertest** - HTTP assertion library for testing Express APIs
- **Prisma Mock** - Database mocking for isolated testing
- **jest-mock-extended** - Enhanced mocking capabilities

### Frontend Testing
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing utilities
- **Jest DOM** - Custom Jest matchers for DOM testing
- **User Event** - Utilities for simulating user interactions

## Test Structure

```
backend/
├── tests/
│   ├── __mocks__/           # Mock implementations
│   ├── services/            # Service layer tests
│   ├── routes/              # API endpoint tests
│   ├── utils/               # Utility function tests
│   └── setup.ts             # Test setup and configuration

frontend/
├── __tests__/
│   ├── components/          # Component tests
│   ├── hooks/               # Custom hook tests
│   ├── lib/                 # Library/utility tests
│   ├── pages/               # Page component tests
│   └── utils/               # Utility function tests
├── jest.config.js           # Jest configuration
└── jest.setup.js            # Test setup file
```

## Running Tests

### Individual Test Suites

**Backend Tests:**
```bash
cd backend
npm test                     # Run all tests
npm run test:watch          # Run tests in watch mode
npm test -- --coverage     # Run with coverage report
```

**Frontend Tests:**
```bash
cd frontend
npm test                     # Run all tests
npm run test:watch          # Run tests in watch mode
npm test -- --coverage     # Run with coverage report
```

### Comprehensive Test Runner

**All Tests (Cross-platform):**
```bash
# Windows
test.bat

# Linux/macOS
./test.sh

# With options
./test.sh --coverage        # Run with coverage
./test.sh --backend-only    # Backend tests only
./test.sh --frontend-only   # Frontend tests only
```

## Test Categories

### 1. Unit Tests

#### Backend Services
- **ProfileService** - Profile creation, retrieval, updates
- **TranscriptionService** - Audio transcription and validation
- **ChatAssistantService** - AI chat functionality
- **JobSearchService** - Job search integration
- **ResourceFinderService** - Resource discovery
- **DonationService** - Donation processing

#### Frontend Components
- **AudioRecorder** - Audio recording functionality
- **ProfileCard** - Profile display component
- **ChatInterface** - Chat UI component
- **JobSearchResults** - Job search display

#### Custom Hooks
- **useProfile** - Profile data management
- **useAudioRecorder** - Audio recording state
- **useChat** - Chat state management

### 2. Integration Tests

#### API Endpoints
- **Profile Routes** - `/api/profile/*`
- **Transcription Routes** - `/api/transcribe/*`
- **Chat Routes** - `/api/chat/*`
- **Job Search Routes** - `/api/jobs/*`
- **Resource Routes** - `/api/resources/*`
- **Donation Routes** - `/api/donations/*`

#### Database Integration
- **Prisma Queries** - Database operations
- **Data Validation** - Input validation
- **Error Handling** - Error response testing

### 3. Component Tests

#### React Components
- **Rendering** - Component renders correctly
- **Props** - Props are handled properly
- **User Interactions** - Click, input, form submission
- **State Management** - Component state updates
- **Error States** - Error handling and display

## Testing Patterns

### Backend Testing Patterns

#### Service Testing
```typescript
describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create profile successfully', async () => {
    // Arrange
    const mockData = { /* test data */ };
    prismaMock.profile.create.mockResolvedValue(mockProfile);

    // Act
    const result = await ProfileService.createProfile(mockData);

    // Assert
    expect(result).toEqual(mockProfile);
    expect(prismaMock.profile.create).toHaveBeenCalledWith(mockData);
  });
});
```

#### API Route Testing
```typescript
describe('Profile Routes', () => {
  it('should create a new profile', async () => {
    const response = await request(app)
      .post('/api/profile')
      .send(profileData)
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      data: expect.objectContaining({
        name: 'John Doe'
      })
    });
  });
});
```

### Frontend Testing Patterns

#### Component Testing
```typescript
describe('ProfileCard', () => {
  it('renders profile information correctly', () => {
    render(<ProfileCard profile={mockProfile} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Construction worker')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const mockOnClick = jest.fn();
    render(<ProfileCard profile={mockProfile} onClick={mockOnClick} />);

    fireEvent.click(screen.getByText('View Profile'));
    expect(mockOnClick).toHaveBeenCalled();
  });
});
```

#### Hook Testing
```typescript
describe('useProfile', () => {
  it('fetches profile data successfully', async () => {
    const { result } = renderHook(() => useProfile('profile-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProfile);
  });
});
```

## Test Configuration

### Jest Configuration (Backend)

```javascript
// jest.config.json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts"
  ]
}
```

### Jest Configuration (Frontend)

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

## Mocking Strategies

### Backend Mocking

#### Prisma Database
```typescript
// tests/__mocks__/prisma.ts
export const prismaMock = mockDeep<PrismaClient>();
```

#### OpenAI API
```typescript
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    audio: { transcriptions: { create: jest.fn() } },
    chat: { completions: { create: jest.fn() } }
  }))
}));
```

#### File System
```typescript
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn(() => true)
}));
```

### Frontend Mocking

#### Next.js Navigation
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn()
  }),
  usePathname: () => '/'
}));
```

#### Web APIs
```typescript
Object.defineProperty(window, 'MediaRecorder', {
  value: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn()
  }))
});
```

#### API Client
```typescript
jest.mock('../lib/api-client', () => ({
  api: {
    profile: {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}));
```

## Coverage Goals

### Coverage Targets
- **Overall Coverage**: 80%+
- **Critical Services**: 90%+
- **API Routes**: 85%+
- **React Components**: 75%+

### Coverage Reports
Coverage reports are generated in:
- `backend/coverage/` - Backend coverage
- `frontend/coverage/` - Frontend coverage

View coverage reports:
```bash
# Backend
cd backend && npm test -- --coverage
open coverage/lcov-report/index.html

# Frontend
cd frontend && npm test -- --coverage
open coverage/lcov-report/index.html
```

## Continuous Integration

### GitHub Actions (Example)
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install Backend Dependencies
        run: cd backend && npm ci
      
      - name: Install Frontend Dependencies
        run: cd frontend && npm ci
      
      - name: Run Backend Tests
        run: cd backend && npm test -- --coverage
      
      - name: Run Frontend Tests
        run: cd frontend && npm test -- --coverage
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./coverage
```

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should explain what is being tested
3. **Test Behavior, Not Implementation**: Focus on what the code does, not how
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Mock External Dependencies**: Use mocks for external APIs, databases, etc.

### Test Organization

1. **Group Related Tests**: Use `describe` blocks to group related tests
2. **Setup and Teardown**: Use `beforeEach`/`afterEach` for test setup
3. **Shared Test Data**: Create factories or fixtures for test data
4. **Clear Test Scenarios**: Each test should test one specific scenario

### Performance

1. **Parallel Execution**: Jest runs tests in parallel by default
2. **Mock Heavy Operations**: Mock expensive operations like API calls
3. **Selective Testing**: Use `--testPathPattern` for specific test files
4. **Watch Mode**: Use watch mode during development

## Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor` for async operations
2. **Mock Cleanup**: Clear mocks between tests
3. **DOM Cleanup**: React Testing Library cleans up automatically
4. **Test Isolation**: Ensure tests don't affect each other

### Debugging Tools

```typescript
// Debug rendered component
screen.debug();

// Debug specific element
screen.debug(screen.getByText('Profile'));

// Console log in tests
console.log('Test data:', testData);
```

## Test Data Management

### Factories
```typescript
// tests/factories/profileFactory.ts
export const createMockProfile = (overrides = {}) => ({
  id: 'profile-123',
  name: 'John Doe',
  bio: 'Construction worker',
  skills: ['construction'],
  ...overrides
});
```

### Fixtures
```typescript
// tests/fixtures/profiles.json
{
  "basicProfile": {
    "id": "profile-123",
    "name": "John Doe",
    "bio": "Looking for work"
  }
}
```

## Contributing to Tests

1. **Write Tests for New Features**: All new features should include tests
2. **Update Tests for Changes**: Modify tests when changing existing functionality
3. **Maintain Coverage**: Don't decrease overall test coverage
4. **Review Test Code**: Test code should be reviewed like production code
5. **Document Complex Tests**: Add comments for complex test scenarios

## Troubleshooting

### Common Test Failures

1. **Module Not Found**: Check import paths and mocks
2. **Async Timeout**: Increase timeout or fix async handling
3. **DOM Not Found**: Ensure component is rendered before assertions
4. **Mock Not Called**: Verify mock setup and call conditions

### Performance Issues

1. **Slow Tests**: Profile tests to identify bottlenecks
2. **Memory Leaks**: Clear mocks and cleanup properly
3. **File Watching**: Exclude large directories from watch mode

For more help with testing, see the [Developer Guide](./DEVELOPER_GUIDE.md) or create an issue.