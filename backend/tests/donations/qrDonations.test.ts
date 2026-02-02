import request from 'supertest';
import QRCode from 'qrcode';
import app from '../../src/server';

// Mock QRCode to avoid actual image generation in tests
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
  toBuffer: jest.fn()
}));

const mockToDataURL = (QRCode.toDataURL as jest.Mock);
const mockToBuffer = (QRCode.toBuffer as jest.Mock);

describe('QR Code and Donations Tests', () => {

  describe('GET /api/qr/status', () => {
    it('should return Stripe configuration status', async () => {
      const response = await request(app)
        .get('/api/qr/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('configured');
      expect(response.body.data).toHaveProperty('testMode');
      expect(response.body.data).toHaveProperty('requirements');
    });
  });

  describe('POST /api/qr/generate', () => {
    beforeEach(() => {
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockqrcode');
    });

    it('should generate QR code for valid URL', async () => {
      const testUrl = 'https://example.com/donate/test-user';
      
      const response = await request(app)
        .post('/api/qr/generate')
        .send({
          url: testUrl,
          publicSlug: 'test-user'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qrCodeUrl).toBe('data:image/png;base64,mockqrcode');
      expect(response.body.data.donationUrl).toBe(testUrl);
      expect(response.body.data.publicSlug).toBe('test-user');
      expect(response.body.data.instructions).toHaveLength(4);
    });

    it('should reject invalid URL', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .send({
          url: 'not-a-valid-url',
          publicSlug: 'test-user'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing publicSlug', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .send({
          url: 'https://example.com/donate/test'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/qr/donation-page', () => {
    beforeEach(() => {
      mockToDataURL.mockResolvedValue('data:image/png;base64,mockqrcode');
    });

    it('should generate QR code for donation page', async () => {
      const response = await request(app)
        .post('/api/qr/donation-page')
        .send({
          publicSlug: 'john-smith'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.qrCodeUrl).toBe('data:image/png;base64,mockqrcode');
      expect(response.body.data.donationUrl).toContain('/donate/john-smith');
      expect(response.body.data.publicSlug).toBe('john-smith');
    });

    it('should handle QR generation errors', async () => {
      mockToDataURL.mockRejectedValue(new Error('QR generation failed'));

      const response = await request(app)
        .post('/api/qr/donation-page')
        .send({
          publicSlug: 'test-user'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to generate');
    });
  });

  describe('POST /api/qr/checkout', () => {
    it('should validate minimum donation amount', async () => {
      const response = await request(app)
        .post('/api/qr/checkout')
        .send({
          publicSlug: 'test-user',
          amount: 0.25 // Below minimum
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Minimum donation');
    });

    it('should validate maximum donation amount', async () => {
      const response = await request(app)
        .post('/api/qr/checkout')
        .send({
          publicSlug: 'test-user',
          amount: 6000 // Above maximum
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Maximum donation');
    });

    it('should handle missing Stripe configuration', async () => {
      // Temporarily remove Stripe configuration
      const originalStripeKey = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      
      const response = await request(app)
        .post('/api/qr/checkout')
        .send({
          publicSlug: 'test-user',
          amount: 25.00
        })
        .expect(200); // Demo mode returns mock data even without Stripe

      expect(response.body.success).toBe(true);
      expect(response.body.data.checkoutUrl).toBeDefined();
      
      // Restore original configuration
      if (originalStripeKey) {
        process.env.STRIPE_SECRET_KEY = originalStripeKey;
      }
    });

    it('should validate email format if provided', async () => {
      const response = await request(app)
        .post('/api/qr/checkout')
        .send({
          publicSlug: 'test-user',
          amount: 25.00,
          donorEmail: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept valid donation parameters', async () => {
      const response = await request(app)
        .post('/api/qr/checkout')
        .send({
          publicSlug: 'test-user',
          amount: 25.00,
          donorEmail: 'donor@example.com'
        })
        .expect(200); // Demo mode returns success with mock data

      expect(response.body.success).toBe(true);
      expect(response.body.data.checkoutUrl).toBeDefined();
      expect(response.body.data.sessionId).toBeDefined();
    });
  });

  describe('QRCode Integration', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call QRCode with correct parameters', async () => {
      mockToDataURL.mockResolvedValue('data:image/png;base64,test');

      await request(app)
        .post('/api/qr/generate')
        .send({
          url: 'https://example.com/test',
          publicSlug: 'test'
        });

      expect(mockToDataURL).toHaveBeenCalledWith(
        'https://example.com/test',
        expect.objectContaining({
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'M'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed request bodies gracefully', async () => {
      const response = await request(app)
        .post('/api/qr/generate')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle server errors gracefully', async () => {
      mockToDataURL.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .post('/api/qr/generate')
        .send({
          url: 'https://example.com/test',
          publicSlug: 'test'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});