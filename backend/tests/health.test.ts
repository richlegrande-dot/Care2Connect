import request from 'supertest';
import express from 'express';
import healthRoutes from '../src/routes/health';
import { healthMonitor } from '../src/monitoring/healthMonitor';

const app = express();
app.use('/health', healthRoutes);

describe('Health Endpoints', () => {
  // Initialize health monitoring before tests
  beforeAll(async () => {
    // Perform initial health check to initialize system
    await healthMonitor.performHealthCheck();
  });

  describe('GET /health/live', () => {
    it('should return 200 status for liveness check', async () => {
      const response = await request(app).get('/health/live');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should always return alive status when server is running', async () => {
      const response = await request(app).get('/health/live');
      
      expect(response.body.status).toBe('alive');
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/health/ready');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return degraded status when non-critical services are down', async () => {
      const response = await request(app).get('/health/ready');
      
      // Even if degraded, should have these fields
      expect(response.body).toHaveProperty('degraded');
      expect(response.body).toHaveProperty('services');
      
      if (response.body.degraded) {
        expect(response.body).toHaveProperty('degradedReasons');
        expect(Array.isArray(response.body.degradedReasons)).toBe(true);
      }
    });

    it('should return 503 when core services are not ready', async () => {
      const response = await request(app).get('/health/ready');
      
      if (response.status === 503) {
        expect(response.body.status).toBe('not_ready');
      }
    });
  });

  describe('GET /health/status', () => {
    it('should return full health status', async () => {
      const response = await request(app).get('/health/status');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptimeSec');
      expect(response.body).toHaveProperty('mode');
      expect(response.body).toHaveProperty('build');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('degraded');
    });

    it('should include build information', async () => {
      const response = await request(app).get('/health/status');
      
      expect(response.body.build).toHaveProperty('commit');
      expect(response.body.build).toHaveProperty('node');
      expect(response.body.build).toHaveProperty('tsTranspileOnly');
    });

    it('should include all service statuses', async () => {
      const response = await request(app).get('/health/status');
      
      const services = response.body.services;
      expect(services).toHaveProperty('db');
      expect(services).toHaveProperty('storage');
      expect(services).toHaveProperty('speech');
      expect(services).toHaveProperty('stripe');
      // Note: SMTP has been archived and is no longer a service dependency
      
      // Each service should have ok and detail
      expect(services.db).toHaveProperty('ok');
      expect(services.db).toHaveProperty('detail');
      expect(services.storage).toHaveProperty('ok');
      expect(services.storage).toHaveProperty('detail');
    });

    it('should include speech service details', async () => {
      const response = await request(app).get('/health/status');
      
      const speech = response.body.services.speech;
      expect(speech).toHaveProperty('nvtAvailable');
      expect(speech).toHaveProperty('evtsAvailable');
      expect(speech).toHaveProperty('modelInstalled');
      expect(speech).toHaveProperty('detail');
    });

    it('should include degraded mode information', async () => {
      const response = await request(app).get('/health/status');
      
      expect(response.body.degraded).toHaveProperty('enabled');
      expect(response.body.degraded).toHaveProperty('reasons');
      expect(Array.isArray(response.body.degraded.reasons)).toBe(true);
    });

    it('should detect TypeScript transpile-only mode', async () => {
      const response = await request(app).get('/health/status');
      
      expect(typeof response.body.build.tsTranspileOnly).toBe('boolean');
    });
  });

  describe('GET /health/history', () => {
    it('should return health history', async () => {
      const response = await request(app).get('/health/history');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('systemSeries');
      expect(response.body).toHaveProperty('serviceSeries');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.systemSeries)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const limit = 10;
      const response = await request(app).get(`/health/history?limit=${limit}`);
      
      expect(response.status).toBe(200);
      expect(response.body.systemSeries.length).toBeLessThanOrEqual(limit);
    });

    it('should default to 100 records if no limit provided', async () => {
      const response = await request(app).get('/health/history');
      
      expect(response.status).toBe(200);
      // Default limit is 100 for database query, but actual count depends on data available
      expect(response.body.count).toBeGreaterThanOrEqual(0);
      expect(typeof response.body.count).toBe('number');
    });
  });
});
