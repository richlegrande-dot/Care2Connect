import { metricsCollector } from '../../src/monitoring/metricsCollector';
import { Request, Response, NextFunction } from 'express';

// Mock healthMonitor
jest.mock('../../src/monitoring/healthMonitor', () => ({
  healthMonitor: {
    performHealthCheck: jest.fn().mockResolvedValue({
      status: 'ready',
      services: {
        db: { ok: true },
        storage: { ok: true },
      },
      degradedReasons: [],
    }),
  },
}));

describe('Metrics Collector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset metrics
    (metricsCollector as any).startTime = Date.now();
    (metricsCollector as any).dbReconnectAttempts = 0;
    (metricsCollector as any).requestCounts = {
      health: 0,
      analysis: 0,
      export: 0,
      support: 0,
      api: 0,
      total: 0,
    };
  });

  describe('trackRequest middleware', () => {
    it('should track health endpoint requests', () => {
      const middleware = metricsCollector.trackRequest();
      
      const mockReq = { path: '/health/status' } as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      middleware(mockReq, mockRes, mockNext);

      const counts = (metricsCollector as any).requestCounts;
      expect(counts.health).toBe(1);
      expect(counts.total).toBe(1);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should track analysis endpoint requests', () => {
      const middleware = metricsCollector.trackRequest();
      
      const mockReq = { path: '/api/analysis' } as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      middleware(mockReq, mockRes, mockNext);

      const counts = (metricsCollector as any).requestCounts;
      expect(counts.analysis).toBe(1);
      expect(counts.total).toBe(1);
    });

    it('should track export endpoint requests', () => {
      const middleware = metricsCollector.trackRequest();
      
      const mockReq = { path: '/api/export' } as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      middleware(mockReq, mockRes, mockNext);

      const counts = (metricsCollector as any).requestCounts;
      expect(counts.export).toBe(1);
      expect(counts.total).toBe(1);
    });

    it('should track support endpoint requests', () => {
      const middleware = metricsCollector.trackRequest();
      
      const mockReq = { path: '/api/support' } as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      middleware(mockReq, mockRes, mockNext);

      const counts = (metricsCollector as any).requestCounts;
      expect(counts.support).toBe(1);
      expect(counts.total).toBe(1);
    });

    it('should track generic API requests', () => {
      const middleware = metricsCollector.trackRequest();
      
      const mockReq = { path: '/api/donations' } as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      middleware(mockReq, mockRes, mockNext);

      const counts = (metricsCollector as any).requestCounts;
      expect(counts.api).toBe(1);
      expect(counts.total).toBe(1);
    });

    it('should accumulate multiple requests', () => {
      const middleware = metricsCollector.trackRequest();
      const mockRes = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      // Health request
      middleware({ path: '/health/status' } as Request, mockRes, mockNext);
      
      // Analysis requests
      middleware({ path: '/api/analysis' } as Request, mockRes, mockNext);
      middleware({ path: '/api/analysis/123' } as Request, mockRes, mockNext);
      
      // Export request
      middleware({ path: '/api/export' } as Request, mockRes, mockNext);

      const counts = (metricsCollector as any).requestCounts;
      expect(counts.health).toBe(1);
      expect(counts.analysis).toBe(2);
      expect(counts.export).toBe(1);
      expect(counts.total).toBe(4);
    });
  });

  describe('DB reconnect tracking', () => {
    it('should increment DB reconnect attempts', () => {
      metricsCollector.incrementDbReconnectAttempts();
      metricsCollector.incrementDbReconnectAttempts();

      expect((metricsCollector as any).dbReconnectAttempts).toBe(2);
    });

    it('should reset DB reconnect attempts', () => {
      metricsCollector.incrementDbReconnectAttempts();
      metricsCollector.incrementDbReconnectAttempts();
      metricsCollector.resetDbReconnectAttempts();

      expect((metricsCollector as any).dbReconnectAttempts).toBe(0);
    });
  });

  describe('collect', () => {
    it('should collect all metrics', async () => {
      // Setup some metrics
      (metricsCollector as any).startTime = Date.now() - 60000; // 60 seconds ago
      metricsCollector.incrementDbReconnectAttempts();
      
      const middleware = metricsCollector.trackRequest();
      middleware({ path: '/health/status' } as Request, {} as Response, jest.fn());
      middleware({ path: '/api/analysis' } as Request, {} as Response, jest.fn());

      const metrics = await metricsCollector.collect();

      expect(metrics.uptime).toBeGreaterThanOrEqual(60);
      expect(metrics.healthReadyOk).toBe(1); // ready status
      expect(metrics.healthDegraded).toBe(0);
      expect(metrics.dbReconnectAttempts).toBe(1);
      expect(metrics.memoryUsageBytes).toBeGreaterThan(0);
      expect(metrics.memoryUsageHeapBytes).toBeGreaterThan(0);
      expect(metrics.requestCounts.health).toBe(1);
      expect(metrics.requestCounts.analysis).toBe(1);
    });

    it('should handle degraded health status', async () => {
      const { healthMonitor } = require('../../src/monitoring/healthMonitor');
      healthMonitor.performHealthCheck.mockResolvedValue({
        status: 'degraded',
        services: {
          db: { ok: true },
          storage: { ok: true },
        },
        degradedReasons: ['stripe-not-configured'],
      });

      const metrics = await metricsCollector.collect();

      expect(metrics.healthReadyOk).toBe(0);
      expect(metrics.healthDegraded).toBe(1);
    });

    it('should handle unhealthy status', async () => {
      const { healthMonitor } = require('../../src/monitoring/healthMonitor');
      healthMonitor.performHealthCheck.mockResolvedValue({
        status: 'unhealthy',
        services: {
          db: { ok: false },
          storage: { ok: true },
        },
        degradedReasons: [],
      });

      const metrics = await metricsCollector.collect();

      expect(metrics.healthReadyOk).toBe(0);
      expect(metrics.healthDegraded).toBe(0);
    });
  });

  describe('formatPrometheus', () => {
    it('should format metrics in Prometheus exposition format', async () => {
      const metrics = await metricsCollector.collect();
      const formatted = metricsCollector.formatPrometheus(metrics);

      // Check for Prometheus format elements
      expect(formatted).toContain('# HELP care2system_uptime_seconds');
      expect(formatted).toContain('# TYPE care2system_uptime_seconds gauge');
      expect(formatted).toContain('care2system_uptime_seconds');
      
      expect(formatted).toContain('# HELP care2system_health_ready_ok');
      expect(formatted).toContain('care2system_health_ready_ok');
      
      expect(formatted).toContain('# HELP care2system_db_reconnect_attempts');
      expect(formatted).toContain('care2system_db_reconnect_attempts');
      
      expect(formatted).toContain('# HELP care2system_memory_usage_bytes');
      expect(formatted).toContain('care2system_memory_usage_bytes');
      
      expect(formatted).toContain('# HELP care2system_request_count_total');
      expect(formatted).toContain('care2system_request_count_total{route="health"}');
      expect(formatted).toContain('care2system_request_count_total{route="analysis"}');
      expect(formatted).toContain('care2system_request_count_total{route="export"}');
      expect(formatted).toContain('care2system_request_count_total{route="support"}');
      expect(formatted).toContain('care2system_request_count_total{route="api"}');
      expect(formatted).toContain('care2system_request_count_total{route="total"}');
    });

    it('should format values correctly', async () => {
      (metricsCollector as any).startTime = Date.now() - 120000; // 120 seconds ago
      metricsCollector.incrementDbReconnectAttempts();
      metricsCollector.incrementDbReconnectAttempts();

      const metrics = await metricsCollector.collect();
      const formatted = metricsCollector.formatPrometheus(metrics);

      // Check uptime value
      expect(formatted).toMatch(/care2system_uptime_seconds 1[12]\d/); // ~120 seconds
      
      // Check DB reconnect attempts
      expect(formatted).toContain('care2system_db_reconnect_attempts 2');
    });
  });
});
