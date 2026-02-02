import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import systemAdminRoutes from '../src/routes/systemAdmin';

describe('System Authentication', () => {
  let app: express.Application;
  const correctPassword = 'blueberry:y22';
  const wrongPassword = 'wrongpassword';

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/admin', systemAdminRoutes);
    process.env.SYSTEM_PANEL_PASSWORD = correctPassword;
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('POST /admin/auth', () => {
    it('should return JWT token with correct password', async () => {
      const response = await request(app)
        .post('/admin/auth')
        .send({ password: correctPassword })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresIn', 1800);

      // Verify token is valid JWT
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!) as any;
      expect(decoded).toHaveProperty('type', 'system-admin');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/admin/auth')
        .send({ password: wrongPassword })
        .expect(401);

      expect(response.body).toHaveProperty('ok', false);
      expect(response.body).toHaveProperty('error', 'Invalid password');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/admin/auth')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('ok', false);
      expect(response.body).toHaveProperty('error', 'Password is required');
    });
  });

  describe('Protected Endpoints', () => {
    let validToken: string;
    let expiredToken: string;

    beforeAll(() => {
      // Create valid token
      validToken = jwt.sign(
        { type: 'system-admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '30m' }
      );

      // Create expired token
      expiredToken = jwt.sign(
        { type: 'system-admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' }
      );
    });

    it('should accept valid Bearer token', async () => {
      const response = await request(app)
        .post('/admin/run-tests')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
    });

    it('should reject missing Authorization header', async () => {
      const response = await request(app)
        .post('/admin/run-tests')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authorization required');
    });

    it('should reject expired token', async () => {
      const response = await request(app)
        .post('/admin/run-tests')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid token format', async () => {
      const response = await request(app)
        .post('/admin/run-tests')
        .set('Authorization', 'Bearer invalid-token-format')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject wrong token type', async () => {
      const wrongTypeToken = jwt.sign(
        { type: 'regular-user' },
        process.env.JWT_SECRET!,
        { expiresIn: '30m' }
      );

      const response = await request(app)
        .post('/admin/run-tests')
        .set('Authorization', `Bearer ${wrongTypeToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid token type');
    });
  });
});
