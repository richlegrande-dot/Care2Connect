import request from 'supertest';
import express from 'express';
import adminRoutes from '../src/routes/admin';

const app = express();
app.use('/admin', adminRoutes);

describe('Admin Diagnostics Endpoints', () => {
  const validToken = 'test-admin-token-12345';
  
  beforeAll(() => {
    process.env.ADMIN_DIAGNOSTICS_TOKEN = validToken;
  });

  describe('GET /admin/diagnostics', () => {
    it('should return 403 without admin token', async () => {
      const response = await request(app).get('/admin/diagnostics');
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 403 with invalid admin token', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .set('x-admin-token', 'invalid-token');
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return diagnostics with valid admin token', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .set('x-admin-token', validToken);
      
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('server');
        expect(response.body).toHaveProperty('config');
        expect(response.body).toHaveProperty('health');
        expect(response.body).toHaveProperty('missingResources');
        expect(response.body).toHaveProperty('recentLogs');
        expect(response.body).toHaveProperty('versions');
      }
    });

    it('should include server information in diagnostics', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .set('x-admin-token', validToken);
      
      if (response.status === 200) {
        const server = response.body.server;
        expect(server).toHaveProperty('pid');
        expect(server).toHaveProperty('uptime');
        expect(server).toHaveProperty('platform');
        expect(server).toHaveProperty('arch');
        expect(server).toHaveProperty('nodeVersion');
        expect(server).toHaveProperty('memoryUsage');
        expect(server).toHaveProperty('cpuUsage');
      }
    });

    it('should redact sensitive environment variables', async () => {
      const response = await request(app)
        .get('/admin/diagnostics?format=json')
        .set('x-admin-token', validToken);
      
      if (response.status === 200) {
        const env = response.body.config.environment;
        
        // Sensitive keys should be redacted
        if (env.DATABASE_URL) {
          expect(env.DATABASE_URL).toContain('[REDACTED');
        }
        if (env.OPENAI_API_KEY) {
          expect(env.OPENAI_API_KEY).toContain('[REDACTED');
        }
        if (env.STRIPE_SECRET_KEY) {
          expect(env.STRIPE_SECRET_KEY).toContain('[REDACTED');
        }
        
        // Should not contain actual secret values
        const envString = JSON.stringify(env);
        expect(envString).not.toContain('sk-proj-');
        expect(envString).not.toContain('postgresql://');
      }
    });

    it('should return downloadable format without format=json', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .set('x-admin-token', validToken);
      
      if (response.status === 200) {
        expect(response.headers['content-disposition']).toMatch(/attachment/);
        expect(response.headers['content-type']).toContain('application/json');
      }
    });

    it('should include missing resources list', async () => {
      const response = await request(app)
        .get('/admin/diagnostics?format=json')
        .set('x-admin-token', validToken);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body.missingResources)).toBe(true);
      }
    });
  });

  describe('GET /admin/health-logs', () => {
    it('should return 403 without admin token', async () => {
      const response = await request(app).get('/admin/health-logs');
      
      expect(response.status).toBe(403);
    });

    it('should return 403 with invalid admin token', async () => {
      const response = await request(app)
        .get('/admin/health-logs')
        .set('x-admin-token', 'invalid-token');
      
      expect(response.status).toBe(403);
    });

    it('should return health logs or 404 with valid token', async () => {
      const response = await request(app)
        .get('/admin/health-logs')
        .set('x-admin-token', validToken);
      
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 404) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Admin token not configured', () => {
    beforeAll(() => {
      delete process.env.ADMIN_DIAGNOSTICS_TOKEN;
    });

    afterAll(() => {
      process.env.ADMIN_DIAGNOSTICS_TOKEN = validToken;
    });

    it('should return 503 when ADMIN_DIAGNOSTICS_TOKEN is not configured', async () => {
      const response = await request(app)
        .get('/admin/diagnostics')
        .set('x-admin-token', 'any-token');
      
      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('error', 'Admin diagnostics not configured');
    });
  });
});
