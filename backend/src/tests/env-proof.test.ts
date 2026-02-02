import request from 'supertest';
import app from '../server';

describe('Environment Proof Endpoint', () => {
  const adminToken = 'test-admin-token-12345';

  beforeAll(() => {
    process.env.ADMIN_DIAGNOSTICS_TOKEN = adminToken;
  });

  afterAll(() => {
    delete process.env.ADMIN_DIAGNOSTICS_TOKEN;
  });

  it('should require admin authentication', async () => {
    const response = await request(app)
      .get('/admin/env-proof')
      .expect(403);

    expect(response.body).toHaveProperty('error');
  });

  it('should return environment fingerprints without exposing secrets', async () => {
    const response = await request(app)
      .get('/admin/env-proof')
      .set('x-admin-token', adminToken)
      .expect(200);

    expect(response.body).toHaveProperty('dotenv');
    expect(response.body).toHaveProperty('keys');
    expect(response.body).toHaveProperty('modes');

    // Check that keys are fingerprinted, not exposed
    const keys = response.body.keys;
    if (keys.STRIPE_SECRET_KEY?.present) {
      expect(keys.STRIPE_SECRET_KEY.fingerprint).toMatch(/^.{8}\.\.\..{4}$/);
      expect(keys.STRIPE_SECRET_KEY).not.toHaveProperty('value');
    }

    if (keys.OPENAI_API_KEY?.present) {
      expect(keys.OPENAI_API_KEY.fingerprint).toMatch(/^.{8}\.\.\..{4}$/);
      expect(keys.OPENAI_API_KEY).not.toHaveProperty('value');
    }

    // Check modes
    expect(response.body.modes).toHaveProperty('FEATURE_INTEGRITY_MODE');
    expect(response.body.modes).toHaveProperty('NO_KEYS_MODE');
  });

  it('should validate Stripe key formats correctly', async () => {
    // Temporarily set test keys
    const originalSecret = process.env.STRIPE_SECRET_KEY;
    const originalPublishable = process.env.STRIPE_PUBLISHABLE_KEY;

    process.env.STRIPE_SECRET_KEY = 'sk_test_51234567890abcdef';
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdef';

    const response = await request(app)
      .get('/admin/env-proof')
      .set('x-admin-token', adminToken)
      .expect(200);

    const keys = response.body.keys;
    expect(keys.STRIPE_SECRET_KEY.valid).toBe(true);
    expect(keys.STRIPE_SECRET_KEY.format).toBe('stripe-secret');
    expect(keys.STRIPE_PUBLISHABLE_KEY.valid).toBe(true);
    expect(keys.STRIPE_PUBLISHABLE_KEY.format).toBe('stripe-publishable');

    // Restore original keys
    if (originalSecret) process.env.STRIPE_SECRET_KEY = originalSecret;
    else delete process.env.STRIPE_SECRET_KEY;
    if (originalPublishable) process.env.STRIPE_PUBLISHABLE_KEY = originalPublishable;
    else delete process.env.STRIPE_PUBLISHABLE_KEY;
  });
});