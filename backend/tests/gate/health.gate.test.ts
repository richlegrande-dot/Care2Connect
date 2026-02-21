/**
 * GATE TEST SUITE - V1 Manual Testing Readiness
 * 
 * These tests MUST be 100% passing before manual testing begins.
 * They validate the critical path for V1 functionality.
 * 
 * NO REAL API CALLS - All external services are mocked/stubbed.
 */

import request from 'supertest';
import express from 'express';
import healthRoutes from '../../src/routes/health';

describe('[GATE] Backend Liveness', () => {
  let app: express.Application;

  beforeEach(() => {
    // Set up minimal app with health routes only
    app = express();
    app.use(express.json());
    app.use('/health', healthRoutes);
    
    // Ensure ZERO_OPENAI_MODE is set for V1
    process.env.ZERO_OPENAI_MODE = 'true';
    process.env.V1_STABLE = 'true';
  });

  test('GET /health/live returns 200', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('alive');
  });

  test('GET /health/status returns 200', async () => {
    const res = await request(app).get('/health/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok');
  });

  test('In ZERO_OPENAI_MODE, OpenAI status is disabled', async () => {
    const res = await request(app).get('/health/status');
    expect(res.status).toBe(200);
    
    // In V1, OpenAI should be disabled or not required
    if (res.body.services?.openai) {
      expect(res.body.services.openai.ok).toBe(false);
      expect(res.body.services.openai.message).toMatch(/disabled|not.*required|zero.*openai/i);
    }
  });
});
