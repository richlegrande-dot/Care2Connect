import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import tunnelRouter from '../../src/routes/admin/setup/tunnel';

// Mock child_process - use wrapper function to avoid hoisting issues
let mockExec = jest.fn();
jest.mock('child_process', () => ({
  exec: (...args: any[]) => mockExec(...args),
}));

describe('Tunnel Routes - Basic Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/admin/setup/tunnel', tunnelRouter);
    
    jest.clearAllMocks();
  });

  describe('GET /cloudflare/preflight', () => {
    it('should return preflight check structure', async () => {
      // Mock successful cloudflared version check
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command?.includes('cloudflared --version')) {
          callback(null, 'cloudflared version 2025.11.1 (built 2025-11-15-1234 UTC)', '');
        }
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('cloudflared');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('warnings');
      expect(response.body).toHaveProperty('status');

      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('arch');
      expect(response.body.system).toHaveProperty('nodeVersion');

      expect(response.body.cloudflared).toHaveProperty('installed');
      expect(response.body.cloudflared).toHaveProperty('version');
      expect(response.body.cloudflared).toHaveProperty('isLatest');
      expect(response.body.cloudflared).toHaveProperty('latestVersion');
    });

    it('should detect when cloudflared is installed with latest version', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command?.includes('cloudflared --version')) {
          callback(null, 'cloudflared version 2025.11.1 (built 2025-11-15-1234 UTC)', '');
        }
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(true);
      expect(response.body.cloudflared.version).toBe('2025.11.1');
      expect(response.body.cloudflared.isLatest).toBe(true);
      expect(response.body.status).toBe('ready');
      expect(response.body.warnings).toHaveLength(0);
    });

    it('should detect outdated cloudflared version', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command?.includes('cloudflared --version')) {
          callback(null, 'cloudflared version 2025.8.1 (built 2025-08-15-1234 UTC)', '');
        }
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(true);
      expect(response.body.cloudflared.version).toBe('2025.8.1');
      expect(response.body.cloudflared.isLatest).toBe(false);
      expect(response.body.status).toBe('warning');
      expect(response.body.warnings.length).toBeGreaterThan(0);
      expect(response.body.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle cloudflared not installed', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command?.includes('cloudflared --version')) {
          const error = new Error('Command not found') as any;
          error.code = 'ENOENT';
          callback(error, '', 'cloudflared: command not found');
        }
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(false);
      expect(response.body.cloudflared.version).toBeNull();
      expect(response.body.cloudflared.isLatest).toBe(false);
      expect(response.body.status).toBe('error');
      expect(response.body.warnings.length).toBeGreaterThan(0);
      expect(response.body.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle malformed version output', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        if (command?.includes('cloudflared --version')) {
          callback(null, 'some unexpected output format', '');
        }
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(true);
      expect(response.body.cloudflared.version).toBe('unknown');
      expect(response.body.cloudflared.isLatest).toBe(false);
      expect(response.body.status).toBe('warning');
    });

    it('should include system information', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, 'cloudflared version 2025.11.1', '');
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.system.platform).toBe('win32');
      expect(response.body.system.arch).toBeDefined();
      expect(response.body.system.nodeVersion).toMatch(/v?\d+\.\d+\.\d+/);
    });

    it('should provide Windows-specific recommendations', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        const error = new Error('Command not found') as any;
        error.code = 'ENOENT';
        callback(error, '', '');
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      const recommendationText = response.body.recommendations.join(' ');
      expect(recommendationText).toContain('winget install');
      expect(recommendationText).toContain('Windows service');
      expect(recommendationText).toContain('CLOUDFLARED_WINDOWS_PRODUCTION.md');
    });

    it('should handle command execution errors gracefully', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        const error = new Error('Permission denied') as any;
        error.code = 'EACCES';
        callback(error, '', 'Access denied');
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.installed).toBe(false);
      expect(response.body.status).toBe('error');
      expect(response.body.warnings.some((w: string) => w.includes('permission'))).toBe(true);
    });
  });

  describe('Version parsing', () => {
    it('should parse different version formats correctly', async () => {
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
        mockExec.mockImplementation((command: string, callback: any) => {
          callback(null, testCase.output, '');
        });

        const response = await request(app)
          .get('/admin/setup/tunnel/cloudflare/preflight')
          .expect(200);

        expect(response.body.cloudflared.version).toBe(testCase.expectedVersion);
      }
    });

    it('should handle empty version output', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, '', '');
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.cloudflared.version).toBe('unknown');
      expect(response.body.status).toBe('warning');
    });
  });

  describe('Response validation', () => {
    it('should return consistent timestamps', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, 'cloudflared version 2025.11.1', '');
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should return proper data types', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, 'cloudflared version 2025.11.1', '');
      });

      const response = await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      expect(typeof response.body.cloudflared.installed).toBe('boolean');
      expect(typeof response.body.cloudflared.isLatest).toBe('boolean');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      expect(Array.isArray(response.body.warnings)).toBe(true);
      expect(typeof response.body.status).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should complete preflight check within reasonable time', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        // Simulate realistic command execution time
        setTimeout(() => {
          callback(null, 'cloudflared version 2025.11.1', '');
        }, 50);
      });

      const startTime = Date.now();
      
      await request(app)
        .get('/admin/setup/tunnel/cloudflare/preflight')
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});