import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import connectivityRouter from '../../src/routes/admin/setup/connectivity';
import tunnelRouter from '../../src/routes/admin/setup/tunnel';
import dns from 'dns';
import https from 'https';
import { exec } from 'child_process';

// Mock external dependencies for integration tests
// connectivity.ts uses 'dns/promises' which exports resolve4 directly
jest.mock('dns/promises', () => ({
  resolve4: jest.fn(),
  getServers: jest.fn().mockReturnValue(['8.8.8.8']),
  setServers: jest.fn(),
}));

jest.mock('dns', () => ({
  getServers: jest.fn().mockReturnValue(['8.8.8.8']),
  setServers: jest.fn(),
}));

jest.mock('https', () => ({
  get: jest.fn(),
}));

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

// Get the mocked dns/promises module
const dnsPromises = jest.requireMock('dns/promises') as any;

describe('Connectivity System Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/admin/setup/connectivity', connectivityRouter);
    app.use('/admin/setup/tunnel', tunnelRouter);
    
    jest.clearAllMocks();
  });

  describe('Complete connectivity workflow', () => {
    it('should perform end-to-end connectivity validation', async () => {
      // Setup mocks for successful scenario
      (dnsPromises.resolve4 as jest.Mock)
        .mockResolvedValue(['198.41.200.113']);

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

      (exec as jest.Mock).mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'cloudflared version 2025.11.1 (built 2025-11-15-1234 UTC)', '');
        }
        return {} as any;
      });

      // 1. Check tunnel preflight
      const preflightResponse = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(preflightResponse.body.status).toBe('ready');
      expect(preflightResponse.body.cloudflared.installed).toBe(true);

      // 2. Check connectivity status
      const statusResponse = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(statusResponse.body.dns.cloudflare.resolved).toBe(true);
      expect(statusResponse.body.tls.valid).toBe(true);

      // 3. Run comprehensive connectivity test
      const testResponse = await request(app)
        .post('/admin/setup/connectivity/test')
        .send({
          testLocal: true,
          testPublic: true,
          testWebhook: true,
        })
        .expect(200);

      expect(testResponse.body.overallStatus).toBe('success');
      expect(testResponse.body.testResults.dns.status).toBe('success');
      expect(testResponse.body.testResults.local.status).toBe('success');
      expect(testResponse.body.testResults.public.status).toBe('success');

      // Validate that all components work together
      expect(preflightResponse.body.cloudflared.version).toBe('2025.11.1');
      expect(statusResponse.body.dns.cloudflare.ip).toBe('198.41.200.113');
      expect(testResponse.body.testResults.local.statusCode).toBe(200);
    });

    it('should handle mixed success/failure scenarios', async () => {
      // Setup mixed scenario: tunnel OK, DNS fails, HTTPS works
      (dnsPromises.resolve4 as jest.Mock)
        .mockRejectedValueOnce(new Error('DNS timeout')) // Cloudflare fails
        .mockResolvedValueOnce(['198.41.200.113']) // Google succeeds
        .mockResolvedValueOnce(['198.41.200.113']) // OpenDNS succeeds
        .mockResolvedValue(['198.41.200.113']); // Additional calls succeed

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

      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.8.1', ''); // Outdated version
        return {} as any;
      });

      // 1. Preflight shows warning (outdated)
      const preflightResponse = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(preflightResponse.body.status).toBe('warning');
      expect(preflightResponse.body.cloudflared.isLatest).toBe(false);

      // 2. Status shows partial DNS failure
      const statusResponse = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(statusResponse.body.dns.cloudflare.resolved).toBe(false);
      expect(statusResponse.body.dns.google.resolved).toBe(true);
      expect(statusResponse.body.tls.valid).toBe(true);

      // 3. Test shows partial success
      const testResponse = await request(app)
        .post('/admin/setup/connectivity/test')
        .send({
          testLocal: true,
          testPublic: true,
          testWebhook: false,
        })
        .expect(200);

      expect(testResponse.body.overallStatus).toBe('partial');
      expect(testResponse.body.recommendations).toContain(
        expect.stringContaining('DNS')
      );
    });

    it('should provide coordinated recommendations across components', async () => {
      // Setup scenario where both tunnel and connectivity have issues
      (dnsPromises.resolve4 as jest.Mock)
        .mockRejectedValue(new Error('NXDOMAIN'));

      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Connection refused'));
          }
        }),
        end: jest.fn(),
      };
      
      (https.get as jest.Mock).mockReturnValue(mockRequest);

      (exec as jest.Mock).mockImplementation((command, callback) => {
        const error = new Error('Command not found');
        (error as any).code = 'ENOENT';
        callback!(error, '', '');
        return {} as any;
      });

      // Get recommendations from both endpoints
      const preflightResponse = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      const testResponse = await request(app)
        .post('/admin/setup/connectivity/test')
        .send({
          testLocal: true,
          testPublic: true,
          testWebhook: true,
        })
        .expect(200);

      // Verify coordinated recommendations
      expect(preflightResponse.body.status).toBe('error');
      expect(preflightResponse.body.recommendations).toContainEqual(
        expect.stringContaining('Install cloudflared')
      );

      expect(testResponse.body.overallStatus).toBe('failure');
      expect(testResponse.body.recommendations).toContainEqual(
        expect.stringContaining('DNS resolution')
      );

      // Both should reference the same documentation
      const preflightDocs = preflightResponse.body.recommendations.join(' ');
      const testDocs = testResponse.body.recommendations.join(' ');
      
      expect(preflightDocs).toContain('CLOUDFLARED_WINDOWS_PRODUCTION.md');
      expect(testDocs).toContain('DNS_PROPAGATION_PLAYBOOK.md');
    });
  });

  describe('Performance under load', () => {
    it('should handle concurrent requests across all endpoints', async () => {
      // Setup successful responses
      (dnsPromises.resolve4 as jest.Mock)
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

      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      // Create concurrent requests to all endpoints
      const requests = [
        request(app).get('/admin/setup/tunnel/cloudflare/preflight'),
        request(app).get('/admin/setup/connectivity/status'),
        request(app).post('/admin/setup/connectivity/test').send({
          testLocal: true,
          testPublic: false,
          testWebhook: false,
        }),
        request(app).get('/admin/setup/tunnel/cloudflare/preflight'),
        request(app).get('/admin/setup/connectivity/status'),
      ];

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time even under load
      expect(duration).toBeLessThan(3000);

      // Verify specific responses
      expect(responses[0].body.cloudflared.version).toBe('2025.11.1'); // preflight
      expect(responses[1].body.domain).toBe('care2connects.org'); // status
      expect(responses[2].body.testResults).toBeDefined(); // test
    });

    it('should maintain response quality under rapid sequential requests', async () => {
      // Setup responses
      (dnsPromises.resolve4 as jest.Mock)
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

      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      // Make rapid sequential requests
      const results = [];
      for (let i = 0; i < 5; i++) {
        const statusResponse = await request(app)
          .get('/admin/setup/connectivity/status')
          .expect(200);

        results.push(statusResponse.body);
      }

      // All responses should be consistent
      results.forEach((result, index) => {
        expect(result.domain).toBe('care2connects.org');
        expect(result.dns.cloudflare.resolved).toBe(true);
        expect(result.dns.cloudflare.ip).toBe('198.41.200.113');
      });
    });
  });

  describe('Error propagation and recovery', () => {
    it('should gracefully handle partial system failures', async () => {
      // Simulate DNS working but tunnel failing
      (dnsPromises.resolve4 as jest.Mock)
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

      // Tunnel command fails
      (exec as jest.Mock).mockImplementation((command, callback) => {
        const error = new Error('Service unavailable');
        callback!(error, '', '');
        return {} as any;
      });

      // Status should still work (doesn't depend on tunnel command)
      const statusResponse = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(statusResponse.body.dns.cloudflare.resolved).toBe(true);

      // Preflight should fail gracefully
      const preflightResponse = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(preflightResponse.body.status).toBe('error');
      expect(preflightResponse.body.cloudflared.installed).toBe(false);

      // Test should provide useful diagnostics despite tunnel issues
      const testResponse = await request(app)
        .post('/admin/setup/connectivity/test')
        .send({
          testLocal: true,
          testPublic: true,
          testWebhook: false,
        })
        .expect(200);

      expect(testResponse.body.testResults.dns.status).toBe('success');
      expect(testResponse.body.recommendations).toContain(
        expect.stringContaining('tunnel')
      );
    });

    it('should recover from temporary network issues', async () => {
      let callCount = 0;

      // First call fails, subsequent calls succeed
      (dnsPromises.resolve4 as jest.Mock)
        .mockImplementation(() => {
          callCount++;
          if (callCount <= 3) {
            return Promise.reject(new Error('Network timeout'));
          }
          return Promise.resolve(['198.41.200.113']);
        });

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

      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      // First few requests should show failures
      const failureResponse = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(failureResponse.body.dns.cloudflare.resolved).toBe(false);

      // Later request should show recovery
      const successResponse = await request(app)
        .get('/admin/setup/connectivity/status')
        .expect(200);

      expect(successResponse.body.dns.cloudflare.resolved).toBe(true);
    });
  });

  describe('Data consistency and validation', () => {
    it('should maintain consistent timestamps across rapid requests', async () => {
      // Setup mocks
      (dnsPromises.resolve4 as jest.Mock)
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

      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      // Make rapid requests
      const responses = await Promise.all([
        request(app).get('/admin/setup/connectivity/status'),
        request(app).get('/admin/setup/tunnel/cloudflare/preflight'),
        request(app).post('/admin/setup/connectivity/test').send({
          testLocal: true,
          testPublic: false,
          testWebhook: false,
        }),
      ]);

      // All timestamps should be recent and within reasonable range
      const timestamps = responses.map(r => new Date(r.body.timestamp));
      const now = new Date();
      const fiveSecondsAgo = new Date(now.getTime() - 5000);

      timestamps.forEach(timestamp => {
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).toBeGreaterThan(fiveSecondsAgo.getTime());
        expect(timestamp.getTime()).toBeLessThanOrEqual(now.getTime());
      });
    });

    it('should validate request/response data integrity', async () => {
      // Setup mocks
      (dnsPromises.resolve4 as jest.Mock)
        .mockResolvedValue(['198.41.200.113']);

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

      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      // Test with various request bodies
      const testCases = [
        { testLocal: true, testPublic: false, testWebhook: false },
        { testLocal: false, testPublic: true, testWebhook: false },
        { testLocal: false, testPublic: false, testWebhook: true },
        { testLocal: true, testPublic: true, testWebhook: true },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/admin/setup/connectivity/test')
          .send(testCase)
          .expect(200);

        // Validate response structure
        expect(response.body).toHaveProperty('testResults');
        expect(response.body).toHaveProperty('overallStatus');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('recommendations');

        // Validate that only requested tests are included
        if (testCase.testLocal) {
          expect(response.body.testResults).toHaveProperty('local');
        } else {
          expect(response.body.testResults).not.toHaveProperty('local');
        }

        if (testCase.testPublic) {
          expect(response.body.testResults).toHaveProperty('public');
        } else {
          expect(response.body.testResults).not.toHaveProperty('public');
        }

        if (testCase.testWebhook) {
          expect(response.body.testResults).toHaveProperty('webhook');
        } else {
          expect(response.body.testResults).not.toHaveProperty('webhook');
        }
      }
    });
  });

  describe('Cross-component compatibility', () => {
    it('should provide compatible data formats across all endpoints', async () => {
      // Setup mocks
      (dnsPromises.resolve4 as jest.Mock)
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

      (exec as jest.Mock).mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      // Get responses from all endpoints
      const [statusResponse, preflightResponse, testResponse] = await Promise.all([
        request(app).get('/admin/setup/connectivity/status'),
        request(app).get('/admin/setup/tunnel/cloudflare/preflight'),
        request(app).post('/admin/setup/connectivity/test').send({
          testLocal: true,
          testPublic: true,
          testWebhook: false,
        }),
      ]);

      // All should use ISO timestamp format
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(statusResponse.body.timestamp).toMatch(timestampRegex);
      expect(preflightResponse.body.timestamp).toMatch(timestampRegex);
      expect(testResponse.body.timestamp).toMatch(timestampRegex);

      // Status codes should be consistent
      expect(typeof statusResponse.body.tls.valid).toBe('boolean');
      expect(typeof preflightResponse.body.cloudflared.installed).toBe('boolean');
      
      // Response times should be numbers where present
      if (statusResponse.body.dns.cloudflare.responseTime !== undefined) {
        expect(typeof statusResponse.body.dns.cloudflare.responseTime).toBe('number');
      }
    });
  });
});
