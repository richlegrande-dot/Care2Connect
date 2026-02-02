import request from 'supertest';
import express from 'express';
import adminRoutes from '../src/routes/admin';

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin Fix Endpoints (manual command responses)', () => {
  const validToken = 'test-admin-token-12345';

  beforeAll(() => {
    process.env.ADMIN_DIAGNOSTICS_TOKEN = validToken;
    // Ensure system commands are disabled for these tests
    delete process.env.ALLOW_SYSTEM_COMMANDS;
  });

  afterAll(() => {
    delete process.env.ADMIN_DIAGNOSTICS_TOKEN;
  });

  it('POST /admin/fix/db should return manual command when commands disabled (using x-admin-token)', async () => {
    const res = await request(app)
      .post('/admin/fix/db')
      .set('x-admin-token', validToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('command');
    expect(res.body.command).toContain('docker compose');
  });

  it('POST /admin/fix/email-inbox should return manual command when commands disabled (using Authorization Bearer)', async () => {
    const res = await request(app)
      .post('/admin/fix/email-inbox')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('command');
    expect(res.body.command).toContain('docker compose');
  });

  it('POST /admin/fix/install-evts should return manual command when commands disabled', async () => {
    const res = await request(app)
      .post('/admin/fix/install-evts')
      .set('x-admin-token', validToken);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/System commands disabled|Run:/i);
  });

  it('POST /admin/fix/stripe-webhook should return manual command when commands disabled', async () => {
    const res = await request(app)
      .post('/admin/fix/stripe-webhook')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/System commands disabled|Run:/i);
  });
});
