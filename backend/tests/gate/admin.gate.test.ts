/**
 * GATE TEST - Admin Diagnostics Sanity
 */

import request from 'supertest';
import express from 'express';
import adminRoutes from '../../src/routes/admin';

jest.mock('../../src/monitoring/healthMonitor', () => ({
  healthMonitor: {
    performHealthCheck: jest.fn().mockResolvedValue({
      timestamp: new Date().toISOString(),
      status: 'ready',
      services: { db: { ok: true }, storage: { ok: true } },
      degradedReasons: [],
    }),
    getHistory: jest.fn().mockReturnValue([]),
  },
}));

jest.mock('../../src/monitoring/alertManager', () => ({
  alertManager: {
    getRecentErrors: jest.fn().mockReturnValue([]),
  },
}));

describe('[GATE] Admin Diagnostics', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reconfigure mocks
    const { healthMonitor } = require('../../src/monitoring/healthMonitor');
    healthMonitor.performHealthCheck.mockResolvedValue({
      timestamp: new Date().toISOString(),
      status: 'ready',
      services: { db: { ok: true }, storage: { ok: true } },
      degradedReasons: [],
    });
    healthMonitor.getHistory.mockReturnValue([]);
    
    const { alertManager } = require('../../src/monitoring/alertManager');
    alertManager.getRecentErrors.mockReturnValue([]);
    
    app = express();
    app.use(express.json());
    app.use('/admin', adminRoutes);
    process.env.ADMIN_DIAGNOSTICS_TOKEN = 'test-token';
  });

  test('GET /admin/diagnostics returns 200 with valid token', async () => {
    const res = await request(app)
      .get('/admin/diagnostics')
      .query({ token: 'test-token', format: 'json' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('server');
    expect(res.body).toHaveProperty('health');
  });
});
