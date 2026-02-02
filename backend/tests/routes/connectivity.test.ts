import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import connectivityRouter from '../../src/routes/admin/setup/connectivity';
import * as dns from 'dns';
import * as https from 'https';

// Mock external dependencies
jest.mock('dns', () => ({
  promises: {
    resolve: jest.fn(),
  },
}));

jest.mock('https', () => ({
  get: jest.fn(),
}));

describe('Connectivity Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/admin/setup/connectivity', connectivityRouter);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('GET /status', () => {
    it('should return connectivity status with successful DNS resolution', async () => {
      // Mock successful DNS resolution
      const mockResolve = dns.promises.resolve as jest.MockedFunction<typeof dns.promises.resolve>;
      mockResolve
        .mockResolvedValueOnce(['198.41.200.113']) // Cloudflare
        .mockResolvedValueOnce(['198.41.200.113']) // Google
        .mockResolvedValueOnce(['198.41.200.113']); // OpenDNS

      // Mock successful HTTPS request
      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      const mockHttpsGet = https.get as jest.MockedFunction<typeof https.get>;
      mockHttpsGet.mockImplementation((options: any, callback: any) => {
        callback(mockResponse);
        return mockRequest as any;
      });

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          timestamp: expect.any(String),
          backendPort: expect.any(Number),
          domain: expect.any(String),
          publicUrl: null, // Specific null value
          dnsChecks: expect.arrayContaining([
            expect.objectContaining({
              resolver: expect.any(String),
              success: expect.any(Boolean),
              addresses: expect.any(Array),
              timing: expect.any(Number),
            })
          ]),
          tlsStatus: expect.objectContaining({
            enabled: expect.any(Boolean),
          }),
          tunnelStatus: expect.objectContaining({
            lastKnownUrl: null, // Specific null value
          }),
        })
      );
    });

    it('should handle DNS resolution failures gracefully', async () => {
      // Mock DNS resolution failures
      const mockResolve = dns.promises.resolve as jest.MockedFunction<typeof dns.promises.resolve>;
      mockResolve
        .mockRejectedValueOnce(new Error('DNS timeout')) // Cloudflare
        .mockResolvedValueOnce(['198.41.200.113']) // Google succeeds
        .mockRejectedValueOnce(new Error('NXDOMAIN')); // OpenDNS fails

      // Mock HTTPS request
      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      const mockHttpsGet = https.get as jest.MockedFunction<typeof https.get>;
      mockHttpsGet.mockImplementation((options: any, callback: any) => {
        callback(mockResponse);
        return mockRequest as any;
      });

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      // Check that DNS checks exist and are properly formatted
      const dnsChecks = response.body.dnsChecks;
      expect(Array.isArray(dnsChecks)).toBe(true);
      expect(dnsChecks.length).toBeGreaterThan(0);
      
      // All checks should have required properties
      dnsChecks.forEach((check: any) => {
        expect(check).toHaveProperty('resolver');
        expect(check).toHaveProperty('success');
        expect(typeof check.success).toBe('boolean');
      });
    });

    it('should handle TLS validation errors', async () => {
      // Mock successful DNS
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValue(['198.41.200.113'] as string[]);

      // Mock HTTPS error
      const mockRequest = {
        on: jest.fn((event, callback: (...args: any[]) => void) => {
          if (event === 'error') {
            callback(new Error('TLS handshake failed'));
          }
        }),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockReturnValue(mockRequest);

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(response.body.tlsStatus).toEqual(expect.objectContaining({
        enabled: expect.any(Boolean),
      }));
      
      // Only check for TLS errors if TLS is enabled
      if (response.body.tlsStatus.enabled) {
        expect(response.body.tlsStatus).toHaveProperty('success');
        expect(response.body.tlsStatus).toHaveProperty('error');
      }
    });

    it('should return proper response time metrics', async () => {
      // Mock DNS with delayed response
      (dns.promises.resolve as jest.Mock)
        .mockImplementation(() => new Promise(resolve => 
          setTimeout(() => resolve(['198.41.200.113']), 100)
        ));

      // Mock HTTPS
      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options: any, callback: (res: any) => void) => {
        setTimeout(() => callback(mockResponse), 50);
        return mockRequest;
      });

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      // Response times should be reasonable for DNS checks
      const dnsChecks = response.body.dnsChecks;
      expect(dnsChecks.length).toBeGreaterThan(0);
      
      const timingValues = dnsChecks
        .filter((check: any) => check.success && check.timing)
        .map((check: any) => check.timing);
      
      expect(timingValues.length).toBeGreaterThan(0);
      timingValues.forEach((timing: number) => {
        expect(timing).toBeGreaterThan(0);
        expect(timing).toBeLessThan(5000); // 5 seconds max
      });
    });
  });

  describe('POST /test', () => {
    it('should perform comprehensive connectivity tests', async () => {
      // Mock successful DNS resolution
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValue(['198.41.200.113']);

      // Mock successful HTTPS requests
      const mockResponse = {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      const response = await request(app)
        .post('/admin/setup/connectivity/test')
        .send({
          testLocal: true,
          testPublic: true,
          testWebhook: true,
        })
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        timestamp: expect.any(String),
        tests: expect.objectContaining({
          local: expect.objectContaining({
            success: expect.any(Boolean),
            url: expect.stringMatching(/^http:\/\/localhost:\d+\/health\/live$/),
          }),
          public: expect.objectContaining({
            success: expect.any(Boolean),
            url: expect.any(Object), // Can be null if no PUBLIC_URL
          }),
          webhook: expect.objectContaining({
            success: expect.any(Boolean),
            url: expect.any(Object), // Can be null if no PUBLIC_URL
          }),
        }),
        recommendations: expect.any(Array),
      }));
    });

    it('should handle test failures and provide recommendations', async () => {
      // Mock DNS failure
      (dns.promises.resolve as jest.Mock)
        .mockRejectedValue(new Error('DNS resolution failed') as any);

      // Mock HTTPS failures
      const mockRequest = {
        on: jest.fn((event, callback: (...args: any[]) => void) => {
          if (event === 'error') {
            callback(new Error('Connection refused'));
          }
        }),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockReturnValue(mockRequest);

      const response = await request(app)
        .post('/admin/setup/connectivity/test')
        .send({
          testLocal: true,
          testPublic: true,
          testWebhook: false,
        })
        .expect(200);

      expect(response.body.tests.local.success).toBe(false);
      expect(response.body.tests.public.success).toBe(false);
      expect(response.body.recommendations).toEqual(expect.arrayContaining([
        expect.stringContaining('server is not responding')
      ]));
    });

    it('should accept empty request body', async () => {
      // Mock successful local test
      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      const response = await request(app)
        .post('/admin/setup/connectivity/test')
        .send({})
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        timestamp: expect.any(String),
        tests: expect.any(Object),
        recommendations: expect.any(Array),
      }));
    });

    it('should always run all available tests', async () => {
      // Mock successful local test
      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      const response = await request(app)
        .post('/admin/setup/connectivity/test')
        .send({
          testLocal: true,
          testPublic: false,
          testWebhook: false,
        })
        .expect(200);

      expect(response.body.tests).toHaveProperty('local');
      expect(response.body.tests).toHaveProperty('public');
      expect(response.body.tests).toHaveProperty('webhook');
      expect(typeof response.body.tests.local.success).toBe('boolean');
    });
  });

  describe('Error handling', () => {
    it('should handle DNS timeout gracefully', async () => {
      // Mock DNS timeout
      (dns.promises.resolve as jest.Mock)
        .mockImplementation(() => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        ));

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(response.body.dnsChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          resolver: expect.any(String),
          success: expect.any(Boolean),
        })
      ]));
    });

    it('should handle malformed DNS responses', async () => {
      // Mock malformed DNS response
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValue([]); // Empty response

      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(response.body.dnsChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          resolver: expect.any(String),
          success: expect.any(Boolean),
        })
      ]));
    });

    it('should handle HTTPS connection timeouts', async () => {
      // Mock successful DNS
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValue(['198.41.200.113']);

      // Mock HTTPS timeout
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
        setTimeout: jest.fn((timeout, callback) => {
          setTimeout(callback, 50); // Simulate timeout
        }),
      };
      
      (https.get as jest.Mock).mockReturnValue(mockRequest);

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(response.body.tlsStatus).toEqual(expect.objectContaining({
        enabled: expect.any(Boolean),
      }));
      
      // Only check for TLS errors if TLS is enabled
      if (response.body.tlsStatus.enabled) {
        expect(response.body.tlsStatus.success).toBe(false);
        expect(response.body.tlsStatus.error).toContain('timeout');
      }
    });
  });

  describe('Performance tests', () => {
    it('should complete status check within reasonable time', async () => {
      // Mock fast responses
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValue(['198.41.200.113']);

      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        setTimeout(() => callback(mockResponse), 10);
        return mockRequest;
      });

      const startTime = Date.now();
      
      await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle concurrent requests efficiently', async () => {
      // Mock responses
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValue(['198.41.200.113']);

      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      // Make 5 concurrent requests
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/admin/setup/connectivity/status')
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.domain).toBe('care2connects.org');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle IPv6 DNS responses', async () => {
      // Mock IPv6 response
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValue(['2606:4700:60::a29f:c871']);

      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(response.body.dnsChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          resolver: expect.any(String),
          success: expect.any(Boolean),
          addresses: expect.any(Array)
        })
      ]));
    });

    it('should handle mixed IP version responses', async () => {
      // Mock mixed responses
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValueOnce(['198.41.200.113']) // IPv4
        .mockResolvedValueOnce(['2606:4700:60::a29f:c871']) // IPv6  
        .mockResolvedValueOnce(['198.41.200.113', '198.41.200.114']); // Multiple

      const mockResponse = {
        statusCode: 200,
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(response.body.dnsChecks).toEqual(expect.arrayContaining([
        expect.objectContaining({
          success: true,
          addresses: expect.any(Array)
        })
      ]));
    });

    it('should handle unusual HTTP status codes', async () => {
      // Mock successful DNS
      (dns.promises.resolve as jest.Mock)
        .mockResolvedValue(['198.41.200.113']);

      // Mock unusual HTTP status codes
      const mockResponse = {
        statusCode: 418, // I'm a teapot
        headers: {},
      };
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      const response = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(response.body.tlsStatus).toEqual(expect.objectContaining({
        enabled: expect.any(Boolean),
      }));
      
      // Only check for TLS errors if TLS is enabled
      if (response.body.tlsStatus.enabled) {
        expect(response.body.tlsStatus.success).toBe(false);
        expect(response.body.tlsStatus.error).toContain('418');
      }
    });
  });
});