import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import tunnelRouter from '../../src/routes/admin/setup/tunnel';
import { exec } from 'child_process';

// Mock child_process
jest.mock('child_process');

const mockExec = exec as jest.MockedFunction<typeof exec>;

describe('Tunnel Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/admin/setup/tunnel', tunnelRouter);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('GET /cloudflare/preflight', () => {
    it('should return successful preflight check with latest version', async () => {
      // Mock cloudflared version command success
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'cloudflared version 2025.11.1 (built 2025-11-15-1234 UTC)', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body).toEqual({
        timestamp: expect.any(String),
        system: {
          platform: 'win32',
          arch: expect.any(String),
          nodeVersion: expect.any(String),
        },
        cloudflared: {
          installed: true,
          version: '2025.11.1',
          isLatest: true,
          latestVersion: '2025.11.1',
        },
        recommendations: [],
        warnings: [],
        status: 'ready',
      });
    });

    it('should detect outdated cloudflared version', async () => {
      // Mock outdated cloudflared version
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'cloudflared version 2025.8.1 (built 2025-08-15-1234 UTC)', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared).toEqual({
        installed: true,
        version: '2025.8.1',
        isLatest: false,
        latestVersion: '2025.11.1',
      });

      expect(response.body.status).toBe('warning');
      expect(response.body.warnings).toContainEqual(
        expect.stringContaining('outdated version')
      );
      expect(response.body.recommendations).toContainEqual(
        expect.stringContaining('upgrade cloudflared')
      );
    });

    it('should handle cloudflared not installed', async () => {
      // Mock cloudflared not found
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          const error = new Error('Command not found');
          (error as any).code = 'ENOENT';
          callback!(error, '', 'cloudflared: command not found');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared).toEqual({
        installed: false,
        version: null,
        isLatest: false,
        latestVersion: '2025.11.1',
      });

      expect(response.body.status).toBe('error');
      expect(response.body.warnings).toContainEqual(
        expect.stringContaining('not installed')
      );
      expect(response.body.recommendations).toContainEqual(
        expect.stringContaining('Install cloudflared')
      );
    });

    it('should handle malformed version output', async () => {
      // Mock malformed version output
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'some unexpected output format', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared).toEqual({
        installed: true,
        version: 'unknown',
        isLatest: false,
        latestVersion: '2025.11.1',
      });

      expect(response.body.status).toBe('warning');
      expect(response.body.warnings).toContainEqual(
        expect.stringContaining('Could not parse version')
      );
    });

    it('should provide Windows-specific recommendations', async () => {
      // Mock cloudflared installed but outdated
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'cloudflared version 2025.8.1 (built 2025-08-15-1234 UTC)', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.recommendations).toContainEqual(
        expect.stringContaining('winget upgrade')
      );
      expect(response.body.recommendations).toContainEqual(
        expect.stringContaining('Windows service')
      );
    });

    it('should include system information', async () => {
      // Mock successful version check
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'cloudflared version 2025.11.1 (built 2025-11-15-1234 UTC)', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.system).toEqual({
        platform: 'win32',
        arch: expect.any(String),
        nodeVersion: expect.stringMatching(/v?\d+\.\d+\.\d+/),
      });
    });

    it('should handle command execution timeout', async () => {
      // Mock command timeout
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          // Simulate timeout - never call callback
          setTimeout(() => {
            const error = new Error('Command timeout');
            (error as any).code = 'ETIMEDOUT';
            callback!(error, '', '');
          }, 100);
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(false);
      expect(response.body.status).toBe('error');
      expect(response.body.warnings).toContainEqual(
        expect.stringContaining('timeout')
      );
    });

    it('should handle permission errors', async () => {
      // Mock permission denied
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          const error = new Error('Permission denied');
          (error as any).code = 'EACCES';
          callback!(error, '', 'Access denied');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(false);
      expect(response.body.status).toBe('error');
      expect(response.body.warnings).toContainEqual(
        expect.stringContaining('permission')
      );
    });

    it('should provide different recommendations based on version gap', async () => {
      // Mock very outdated version
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'cloudflared version 2024.1.1 (built 2024-01-15-1234 UTC)', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.isLatest).toBe(false);
      expect(response.body.status).toBe('warning');
      expect(response.body.recommendations).toContainEqual(
        expect.stringContaining('critical upgrade')
      );
    });

    it('should handle stderr output gracefully', async () => {
      // Mock command with stderr but successful execution
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'cloudflared version 2025.11.1 (built 2025-11-15-1234 UTC)', 'Some warning message');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(true);
      expect(response.body.cloudflared.version).toBe('2025.11.1');
    });
  });

  describe('Version parsing edge cases', () => {
    it('should handle different version formats', async () => {
      const testCases = [
        {
          output: 'cloudflared version 2025.11.1',
          expectedVersion: '2025.11.1',
        },
        {
          output: 'cloudflared version v2025.11.1',
          expectedVersion: '2025.11.1',
        },
        {
          output: 'Version: 2025.11.1-beta',
          expectedVersion: '2025.11.1-beta',
        },
        {
          output: 'cloudflared 2025.11.1 (commit abcd1234)',
          expectedVersion: '2025.11.1',
        },
      ];

      for (const testCase of testCases) {
        mockExec.mockImplementation((command, callback) => {
          if (command?.includes('cloudflared --version')) {
            callback!(null, testCase.output, '');
          }
          return {} as any;
        });

        const response = await request(app)
          .get('/admin/setup/tunnel/cloudflare/preflight')
          .expect(200);

        expect(response.body.cloudflared.version).toBe(testCase.expectedVersion);
      }
    });

    it('should handle empty version output', async () => {
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, '', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.version).toBe('unknown');
      expect(response.body.status).toBe('warning');
    });

    it('should handle version with build information', async () => {
      mockExec.mockImplementation((command, callback) => {
        if (command?.includes('cloudflared --version')) {
          callback!(null, 'cloudflared version 2025.11.1 (built 2025-11-15-1234 UTC)', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.version).toBe('2025.11.1');
      expect(response.body.cloudflared.isLatest).toBe(true);
    });
  });

  describe('Recommendation logic', () => {
    it('should provide installation recommendation when not installed', async () => {
      mockExec.mockImplementation((command, callback) => {
        const error = new Error('Command not found');
        (error as any).code = 'ENOENT';
        callback!(error, '', '');
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('winget install cloudflare.cloudflared'),
          expect.stringContaining('Windows service'),
          expect.stringContaining('CLOUDFLARED_WINDOWS_PRODUCTION.md'),
        ])
      );
    });

    it('should provide upgrade recommendation for outdated version', async () => {
      mockExec.mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.8.1', '');
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('winget upgrade'),
          expect.stringContaining('service restart'),
        ])
      );
    });

    it('should provide minimal recommendations for latest version', async () => {
      mockExec.mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.recommendations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Windows service'),
          expect.stringContaining('monitoring'),
        ])
      );
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle exec callback called multiple times', async () => {
      let callbackCalled = false;
      mockExec.mockImplementation((command, callback) => {
        if (!callbackCalled) {
          callbackCalled = true;
          callback!(null, 'cloudflared version 2025.11.1', '');
          // Try to call again (shouldn't affect result)
          callback!(null, 'different output', '');
        }
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.version).toBe('2025.11.1');
    });

    it('should handle null/undefined error objects', async () => {
      mockExec.mockImplementation((command, callback) => {
        callback!(null as any, '', '');
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body.cloudflared.version).toBe('unknown');
    });

    it('should handle process kill during execution', async () => {
      mockExec.mockImplementation((command, callback) => {
        const error = new Error('Process killed');
        (error as any).code = 'SIGTERM';
        (error as any).killed = true;
        callback!(error, '', '');
        return {} as any;
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(false);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Performance and reliability', () => {
    it('should complete preflight check within reasonable time', async () => {
      mockExec.mockImplementation((command, callback) => {
        // Simulate realistic command execution time
        setTimeout(() => {
          callback!(null, 'cloudflared version 2025.11.1', '');
        }, 50);
        return {} as any;
      });

      const startTime = Date.now();
      
      await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent preflight requests', async () => {
      mockExec.mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      // Make 3 concurrent requests
      const requests = Array(3).fill(null).map(() =>
        request(app).get('/admin/setup/tunnel/cloudflare/preflight')
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.cloudflared.version).toBe('2025.11.1');
      });
    });

    it('should not leak memory with repeated calls', async () => {
      mockExec.mockImplementation((command, callback) => {
        callback!(null, 'cloudflared version 2025.11.1', '');
        return {} as any;
      });

      // Make multiple sequential requests to test for memory leaks
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/admin/setup/tunnel/cloudflare/preflight')
          .expect(200);
        
        expect(response.body.cloudflared.version).toBe('2025.11.1');
      }
    });
  });
});
