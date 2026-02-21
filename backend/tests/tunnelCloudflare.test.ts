import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import systemAdminRoutes from '../src/routes/systemAdmin';

describe('Cloudflare Tunnel Setup endpoints', () => {
  let app: express.Application;
  let token: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/admin', systemAdminRoutes);
    process.env.JWT_SECRET = 'test-secret';

    token = jwt.sign({ type: 'system-admin' }, process.env.JWT_SECRET!, { expiresIn: '30m' });
  });

  it('GET /admin/setup/tunnel/cloudflare returns computed port and commands without secrets', async () => {
    // Add a fake secret to ensure response doesn't echo it
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake_secret_value';

    const res = await request(app)
      .get('/admin/setup/tunnel/cloudflare')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(typeof res.body.backendPort).toBe('number');
    expect(res.body.quickTunnelCommand).toContain('localhost');
    expect(res.body.quickTunnelCommand).toContain(String(res.body.backendPort));

    // Must not include any env secret values
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toMatch(/sk_test_fake_secret_value/);
  });

  it('POST /admin/setup/tunnel/cloudflare/preflight respects ALLOW_SYSTEM_COMMANDS', async () => {
    delete process.env.ALLOW_SYSTEM_COMMANDS;

    const res = await request(app)
      .post('/admin/setup/tunnel/cloudflare/preflight')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.allowed).toBe(false);
  });
});
