import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.ADMIN_DIAGNOSTICS_TOKEN = 'test-admin-token';
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock Prisma client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Mock OpenAI
const mockCreate = jest.fn();
const mockTranscriptionsCreate = jest.fn();

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: mockTranscriptionsCreate
        }
      },
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }))
  };
});

// Export mocks for use in tests
export const mockOpenAICreate = mockCreate;
export const mockOpenAITranscriptionsCreate = mockTranscriptionsCreate;

// Mock file system operations (but allow fixture loading to work)
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    // Only mock write operations, keep read operations real for fixtures
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    unlinkSync: jest.fn(),
  };
});

// Mock multer for file uploads
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req: any, res: any, next: any) => {
      req.file = {
        filename: 'test-audio.mp3',
        path: '/tmp/test-audio.mp3',
        size: 1024,
        mimetype: 'audio/mpeg',
        originalname: 'test-audio.mp3'
      };
      next();
    }
  });
  multer.memoryStorage = jest.fn();
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});

// Mock health scheduler to prevent background tasks during tests
jest.mock('../src/utils/healthCheckScheduler', () => ({
  initializeHealthScheduler: jest.fn(),
  stopHealthScheduler: jest.fn(),
}));

// Mock health check runner to prevent background tasks
jest.mock('../src/ops/healthCheckRunner', () => ({
  healthCheckRunner: {
    start: jest.fn(),
    stop: jest.fn(),
    getStatus: jest.fn(() => ({ running: false })),
  },
}));

// Mock self-healing to prevent background tasks
jest.mock('../src/monitoring/selfHealing', () => ({
  selfHealing: {
    reconnectDatabase: jest.fn().mockResolvedValue(true),
    startDatabaseMonitoring: jest.fn(),
    setupGracefulShutdown: jest.fn(),
    setupErrorHandlers: jest.fn(),
  },
  SelfHealing: jest.fn().mockImplementation(() => ({
    reconnectDatabase: jest.fn().mockResolvedValue(true),
    startDatabaseMonitoring: jest.fn(),
    setupGracefulShutdown: jest.fn(),
    setupErrorHandlers: jest.fn(),
  })),
}));

// Mock metrics collector to prevent background tasks
jest.mock('../src/monitoring/metricsCollector', () => {
  // Create state that can be manipulated by tests
  const mockState = {
    dbReconnectAttempts: 0,
    requestCounts: {
      health: 0,
      analysis: 0,
      export: 0,
      support: 0,
      api: 0,
      total: 0,
    },
    startTime: Date.now(),
  };

  return {
    metricsCollector: {
      // Public API methods
      start: jest.fn(),
      stop: jest.fn(),
      recordMetric: jest.fn(),
      getMetrics: jest.fn(() => ({})),
      
      // trackRequest should return a function that can be called as middleware  
      trackRequest: () => (req: any, res: any, next: any) => {
        // Track requests by updating the mock state
        const path = req.path;
        if (path.startsWith('/health')) {
          mockState.requestCounts.health++;
        } else if (path.startsWith('/api/analysis')) {
          mockState.requestCounts.analysis++;
        } else if (path.startsWith('/api/export')) {
          mockState.requestCounts.export++;
        } else if (path.startsWith('/api/support')) {
          mockState.requestCounts.support++;
        } else if (path.startsWith('/api')) {
          mockState.requestCounts.api++;
        }
        mockState.requestCounts.total++;
        next();
      },

      // DB reconnect methods
      incrementDbReconnectAttempts: () => {
        mockState.dbReconnectAttempts++;
      },
      resetDbReconnectAttempts: () => {
        mockState.dbReconnectAttempts = 0;
      },

      // collect method returns metrics based on current state
      collect: async () => {
        // Get health status from the mocked healthMonitor
        const { healthMonitor } = require('../src/monitoring/healthMonitor');
        const health = await healthMonitor.performHealthCheck();
        
        const readyFlag = health?.status === 'ready' ? 1 : 0;
        const degradedFlag = health?.status === 'degraded' ? 1 : 0;
        
        return {
          uptime_seconds: Math.floor((Date.now() - mockState.startTime) / 1000),
          health_ready_ok: readyFlag,
          health_degraded: degradedFlag,
          db_reconnect_attempts: mockState.dbReconnectAttempts,
          memory_usage_bytes: 1024,
          memory_usage_heap_bytes: 512,
          request_count_health: mockState.requestCounts.health,
          request_count_analysis: mockState.requestCounts.analysis,
          request_count_export: mockState.requestCounts.export,
          request_count_support: mockState.requestCounts.support,
          request_count_api: mockState.requestCounts.api,
          request_count_total: mockState.requestCounts.total,
          // camelCase aliases
          uptime: Math.floor((Date.now() - mockState.startTime) / 1000),
          healthReadyOk: readyFlag,
          healthDegraded: degradedFlag,
          dbReconnectAttempts: mockState.dbReconnectAttempts,
          memoryUsageBytes: 1024,
          memoryUsageHeapBytes: 512,
          requestCounts: { ...mockState.requestCounts },
        };
      },

      // Token verification
      verifyToken: (token) => {
        if (!process.env.METRICS_TOKEN) return false;
        return token === process.env.METRICS_TOKEN;
      },

      // Prometheus formatter
      formatPrometheus: (metrics) => {
        return `# HELP care2system_uptime_seconds Server uptime in seconds
# TYPE care2system_uptime_seconds gauge
care2system_uptime_seconds ${metrics.uptime_seconds}

# HELP care2system_health_ready_ok Health check ready status (1=ready, 0=not ready)
# TYPE care2system_health_ready_ok gauge
care2system_health_ready_ok ${metrics.health_ready_ok}

# HELP care2system_health_degraded Health check degraded status (1=degraded, 0=normal)
# TYPE care2system_health_degraded gauge
care2system_health_degraded ${metrics.health_degraded}

# HELP care2system_db_reconnect_attempts Database reconnection attempts
# TYPE care2system_db_reconnect_attempts counter
care2system_db_reconnect_attempts ${metrics.db_reconnect_attempts}

# HELP care2system_memory_usage_bytes Memory usage in bytes (RSS)
# TYPE care2system_memory_usage_bytes gauge
care2system_memory_usage_bytes ${metrics.memory_usage_bytes}

# HELP care2system_memory_usage_heap_bytes Heap memory usage in bytes
# TYPE care2system_memory_usage_heap_bytes gauge
care2system_memory_usage_heap_bytes ${metrics.memory_usage_heap_bytes}

# HELP care2system_request_count_total Total HTTP requests by route group
# TYPE care2system_request_count_total counter
care2system_request_count_total{route="health"} ${metrics.request_count_health}
care2system_request_count_total{route="analysis"} ${metrics.request_count_analysis}
care2system_request_count_total{route="export"} ${metrics.request_count_export}
care2system_request_count_total{route="support"} ${metrics.request_count_support}
care2system_request_count_total{route="api"} ${metrics.request_count_api}
care2system_request_count_total{route="total"} ${metrics.request_count_total}`;
      },

      isEnabled: () => true,
      getRequestCounts: () => ({ ...mockState.requestCounts }),

      // Expose internal state for test access (with getters that return live references)
      get dbReconnectAttempts() { return mockState.dbReconnectAttempts; },
      get requestCounts() { return mockState.requestCounts; },
      get startTime() { return mockState.startTime; },
      set dbReconnectAttempts(value) { mockState.dbReconnectAttempts = value; },
      set requestCounts(value) { Object.assign(mockState.requestCounts, value); },
      set startTime(value) { mockState.startTime = value; },
    },
  };
});

beforeEach(() => {
  mockReset(prismaMock);
});

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};