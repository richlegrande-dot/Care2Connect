import request from 'supertest';
import express from 'express';
import adminRoutes from '../../src/routes/admin';

// Mock dependencies
jest.mock('../../src/monitoring/healthMonitor', () => ({
  healthMonitor: {
    performHealthCheck: jest.fn().mockResolvedValue({
      timestamp: new Date().toISOString(),
      status: 'ready',
      services: {
        db: { ok: true, message: 'Connected' },
        storage: { ok: true, message: 'Connected' },
      },
      degradedReasons: [],
    }),
    getHistory: jest.fn().mockReturnValue([
      {
        timestamp: new Date().toISOString(),
        status: 'ready',
        degradedReasons: [],
      },
    ]),
  },
}));

jest.mock('../../src/monitoring/alertManager', () => ({
  alertManager: {
    getRecentErrors: jest.fn().mockReturnValue([
      {
        timestamp: new Date().toISOString(),
        message: 'Test error',
        stack: 'Error: Test error\n  at Test.js:10\n  at async run()',
      },
    ]),
  },
}));

describe('Enhanced Diagnostics Endpoint', () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Ensure healthMonitor mocks are properly configured
    const { healthMonitor } = require('../../src/monitoring/healthMonitor');
    healthMonitor.performHealthCheck.mockResolvedValue({
      timestamp: new Date().toISOString(),
      status: 'ready',
      services: {
        db: { ok: true, message: 'Connected' },
        storage: { ok: true, message: 'Connected' },
      },
      degradedReasons: [],
    });
    healthMonitor.getHistory.mockReturnValue([
      {
        timestamp: new Date().toISOString(),
        status: 'ready',
        degradedReasons: [],
      },
    ]);
    
    // Ensure alertManager mock is properly configured
    const { alertManager } = require('../../src/monitoring/alertManager');
    alertManager.getRecentErrors.mockReturnValue([
      {
        timestamp: new Date().toISOString(),
        message: 'Test error',
        stack: 'Error: Test error\n  at Test.js:10\n  at async run()',
      },
    ]);
    
    app = express();
    app.use(express.json());
    app.use('/admin', adminRoutes);
    
    process.env.ADMIN_DIAGNOSTICS_TOKEN = 'test-token';
    process.env.DEMO_SAFE_MODE = 'false';
    process.env.ALERT_MODE = 'email';
    process.env.METRICS_ENABLED = 'true';
  });

  describe('GET /admin/diagnostics', () => {
    it('should require authentication token', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ format: 'json' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'wrong-token', format: 'json' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('should return diagnostics with valid token', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('server');
      expect(response.body).toHaveProperty('config');
      expect(response.body).toHaveProperty('health');
    });

    it('should include health history', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('healthHistory');
      expect(Array.isArray(response.body.healthHistory)).toBe(true);
    });

    it('should include recent errors', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('recentErrors');
      expect(Array.isArray(response.body.recentErrors)).toBe(true);
      expect(response.body.recentErrors[0]).toHaveProperty('timestamp');
      expect(response.body.recentErrors[0]).toHaveProperty('message');
      expect(response.body.recentErrors[0]).toHaveProperty('stack');
    });

    it('should include most likely causes', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mostLikelyCauses');
      expect(Array.isArray(response.body.mostLikelyCauses)).toBe(true);
    });

    it('should include ops config in config section', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.config).toHaveProperty('demoSafeMode');
      expect(response.body.config).toHaveProperty('alertMode');
      expect(response.body.config).toHaveProperty('metricsEnabled');
    });

    it('should include PID in server info', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.server).toHaveProperty('pid');
      expect(response.body.server).toHaveProperty('port');
    });

    it('should analyze database connection failures', async () => {
      const { healthMonitor } = require('../../src/monitoring/healthMonitor');
      healthMonitor.performHealthCheck.mockResolvedValue({
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          db: { ok: false, message: 'Connection failed' },
          storage: { ok: true, message: 'Connected' },
        },
        degradedReasons: [],
      });

      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.mostLikelyCauses).toContainEqual(
        expect.objectContaining({
          symptom: 'Database connection failed',
          cause: expect.any(String),
          fix: expect.any(String),
        })
      );
    });

    it('should analyze storage connection failures', async () => {
      const { healthMonitor } = require('../../src/monitoring/healthMonitor');
      healthMonitor.performHealthCheck.mockResolvedValue({
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          db: { ok: true, message: 'Connected' },
          storage: { ok: false, message: 'Connection failed' },
        },
        degradedReasons: [],
      });

      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.mostLikelyCauses).toContainEqual(
        expect.objectContaining({
          symptom: 'Storage connection failed',
          cause: expect.any(String),
          fix: expect.any(String),
        })
      );
    });

    it('should analyze port conflicts from error log', async () => {
      const { alertManager } = require('../../src/monitoring/alertManager');
      alertManager.getRecentErrors.mockReturnValue([
        {
          timestamp: new Date().toISOString(),
          message: 'EADDRINUSE: address already in use',
          stack: 'Error: EADDRINUSE...',
        },
      ]);

      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.mostLikelyCauses).toContainEqual(
        expect.objectContaining({
          symptom: 'Port already in use',
          cause: expect.any(String),
          fix: expect.stringContaining('DEMO_SAFE_MODE'),
        })
      );
    });

    it('should analyze TypeScript compilation errors', async () => {
      const { alertManager } = require('../../src/monitoring/alertManager');
      alertManager.getRecentErrors.mockReturnValue([
        {
          timestamp: new Date().toISOString(),
          message: 'TS2304: Cannot find name',
          stack: 'Error: TS2304...',
        },
      ]);

      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      expect(response.body.mostLikelyCauses).toContainEqual(
        expect.objectContaining({
          symptom: 'TypeScript compilation errors',
          cause: expect.any(String),
          fix: expect.stringContaining('npm run typecheck'),
        })
      );
    });

    it('should truncate error stack traces', async () => {
      const { alertManager } = require('../../src/monitoring/alertManager');
      alertManager.getRecentErrors.mockReturnValue([
        {
          timestamp: new Date().toISOString(),
          message: 'Long error',
          stack: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6',
        },
      ]);

      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token', format: 'json' });

      expect(response.status).toBe(200);
      
      // Stack should be truncated to first 3 lines
      const errorStack = response.body.recentErrors[0].stack;
      const lineCount = errorStack.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(3);
    });

    it('should download diagnostics as file without format param', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .query({ token: 'test-token' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="diagnostics-\d+\.json"/);
    });
  });
});
