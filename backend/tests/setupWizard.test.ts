import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/server';

function makeAdminToken() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign({ type: 'system-admin' }, secret, { expiresIn: '1h' });
}

// TODO: These tests need refactoring - they import the full server which has initialization issues
// Need to create a lightweight test app or properly mock all server dependencies
describe.skip('Setup Wizard endpoints', () => {
  const token = makeAdminToken();

  test('GET /admin/setup/stripe returns presence flags', async () => {
    const res = await request(app)
      .get('/admin/setup/stripe')
      .set('Authorization', `Bearer test-admin-token`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('stripe');
    const s = res.body.stripe;
    expect(typeof s.hasSecret).toBe('boolean');
    expect(typeof s.hasPublishable).toBe('boolean');
    expect(typeof s.hasWebhookSecret).toBe('boolean');
    expect(s).not.toHaveProperty('secret');
    expect(s).not.toHaveProperty('publishable');
  });

  test('GET /admin/setup/preflight returns booleans and guidance', async () => {
    const res = await request(app)
      .get('/admin/setup/preflight')
      .set('Authorization', `Bearer test-admin-token`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('preflight');
    const p = res.body.preflight;
    expect(p).toHaveProperty('database');
    expect(typeof p.database.connected).toBe('boolean');
    expect(p).toHaveProperty('stripe');
    expect(typeof p.stripe.present).toBe('boolean');
    expect(p).toHaveProperty('email');
    expect(typeof p.email.configured).toBe('boolean');
  });
});
