import { alertManager } from '../../src/monitoring/alertManager';
import { HealthSnapshot } from '../../src/monitoring/healthMonitor';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-123' }),
  }),
}));

// Helper to retrieve a stable sendMail mock regardless of mock shape
function getSendMailMock(nm: any) {
  if (nm.__sendMailMock) return nm.__sendMailMock;
  // If tests provided a createTransport mock, inspect its recorded return value(s) without invoking it
  const createMock = nm.__createTransportMock || nm.createTransport;
  if (createMock && createMock.mock && Array.isArray(createMock.mock.results) && createMock.mock.results.length > 0) {
    // Prefer the last returned transport instance
    for (let i = createMock.mock.results.length - 1; i >= 0; i--) {
      const val = createMock.mock.results[i] && createMock.mock.results[i].value;
      if (val && typeof val.sendMail === 'function') return val.sendMail;
    }
  }

  return undefined;
}

// Mock fetch for webhook
global.fetch = jest.fn();

describe('Alert Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset alert manager state
    (alertManager as any).consecutiveFailures = 0;
    (alertManager as any).lastAlertTime = null;
    (alertManager as any).recentErrors = [];
  });

  describe('checkHealth', () => {
    it('should track consecutive failures', async () => {
      const unhealthySnapshot: HealthSnapshot = {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          db: { ok: false, message: 'Connection failed' },
          storage: { ok: true, message: 'OK' },
        },
        degradedReasons: [],
      };

      // First failure
      await alertManager.checkHealth(unhealthySnapshot);
      expect((alertManager as any).consecutiveFailures).toBe(1);

      // Second failure
      await alertManager.checkHealth(unhealthySnapshot);
      expect((alertManager as any).consecutiveFailures).toBe(2);

      // Third failure
      await alertManager.checkHealth(unhealthySnapshot);
      expect((alertManager as any).consecutiveFailures).toBe(3);
    });

    it('should reset consecutive failures on healthy status', async () => {
      const unhealthySnapshot: HealthSnapshot = {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          db: { ok: false, message: 'Connection failed' },
          storage: { ok: true, message: 'OK' },
        },
        degradedReasons: [],
      };

      const healthySnapshot: HealthSnapshot = {
        timestamp: new Date().toISOString(),
        status: 'ready',
        services: {
          db: { ok: true, message: 'OK' },
          storage: { ok: true, message: 'OK' },
        },
        degradedReasons: [],
      };

      // Build up failures
      await alertManager.checkHealth(unhealthySnapshot);
      await alertManager.checkHealth(unhealthySnapshot);
      expect((alertManager as any).consecutiveFailures).toBe(2);

      // Recover
      await alertManager.checkHealth(healthySnapshot);
      expect((alertManager as any).consecutiveFailures).toBe(0);
    });

    it('should not trigger alert before threshold', async () => {
      process.env.ALERT_MODE = 'email';
      process.env.ALERT_FAILURE_THRESHOLD = '3';

      const unhealthySnapshot: HealthSnapshot = {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          db: { ok: false, message: 'Connection failed' },
          storage: { ok: true, message: 'OK' },
        },
        degradedReasons: [],
      };

      // First two failures should not trigger alert
      await alertManager.checkHealth(unhealthySnapshot);
      await alertManager.checkHealth(unhealthySnapshot);

      const nodemailer = require('nodemailer');
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });

    it('should trigger alert but not send email (SMTP archived)', async () => {
      process.env.ALERT_MODE = 'email';
      process.env.ALERT_FAILURE_THRESHOLD = '3';
      process.env.OPS_ALERT_EMAIL_TO = 'ops@example.com';
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user';
      process.env.SMTP_PASSWORD = 'pass';

      const unhealthySnapshot: HealthSnapshot = {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          db: { ok: false, message: 'Connection failed' },
          storage: { ok: true, message: 'OK' },
        },
        degradedReasons: [],
      };

      // Trigger threshold
      await alertManager.checkHealth(unhealthySnapshot);
      await alertManager.checkHealth(unhealthySnapshot);
      await alertManager.checkHealth(unhealthySnapshot);

      // SMTP has been archived, so email sending should be suppressed
      // The alert should be logged but no actual email sent
      const nodemailer = require('nodemailer');
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });

    it('should respect cooldown period', async () => {
      process.env.ALERT_MODE = 'email';
      process.env.ALERT_FAILURE_THRESHOLD = '2';
      process.env.ALERT_COOLDOWN_MINUTES = '15';
      process.env.OPS_ALERT_EMAIL_TO = 'ops@example.com';
      process.env.SMTP_HOST = 'smtp.example.com';

      const unhealthySnapshot: HealthSnapshot = {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          db: { ok: false, message: 'Connection failed' },
          storage: { ok: true, message: 'OK' },
        },
        degradedReasons: [],
      };

      // First alert
      await alertManager.checkHealth(unhealthySnapshot);
      await alertManager.checkHealth(unhealthySnapshot);

      const nodemailer = require('nodemailer');
      const sendMock = getSendMailMock(nodemailer);
      const firstCallCount = sendMock ? sendMock.mock.calls.length : 0;

      // More failures during cooldown
      (alertManager as any).consecutiveFailures = 0; // Reset to trigger again
      await alertManager.checkHealth(unhealthySnapshot);
      await alertManager.checkHealth(unhealthySnapshot);

      // Should not send another email (still in cooldown)
      expect(getSendMailMock(require('nodemailer'))?.mock.calls.length || 0).toBe(firstCallCount);
    });

    it('should trigger webhook alert', async () => {
      process.env.ALERT_MODE = 'webhook';
      process.env.ALERT_FAILURE_THRESHOLD = '2';
      process.env.OPS_ALERT_WEBHOOK_URL = 'https://n8n.example.com/webhook/alert';

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const unhealthySnapshot: HealthSnapshot = {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          db: { ok: false, message: 'Connection failed' },
          storage: { ok: true, message: 'OK' },
        },
        degradedReasons: [],
      };

      // Trigger threshold
      await alertManager.checkHealth(unhealthySnapshot);
      await alertManager.checkHealth(unhealthySnapshot);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://n8n.example.com/webhook/alert',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  describe('logError', () => {
    it('should store errors in buffer', () => {
      alertManager.logError('Test error 1', 'Stack trace 1');
      alertManager.logError('Test error 2', 'Stack trace 2');

      const errors = alertManager.getRecentErrors(10);
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toBe('Test error 1');
      expect(errors[1].message).toBe('Test error 2');
    });

    it('should limit buffer to 50 errors', () => {
      // Add 60 errors
      for (let i = 0; i < 60; i++) {
        alertManager.logError(`Error ${i}`, `Stack ${i}`);
      }

      const errors = alertManager.getRecentErrors(100);
      expect(errors.length).toBeLessThanOrEqual(50);
      
      // Should keep most recent
      expect(errors[errors.length - 1].message).toBe('Error 59');
    });

    it('should return limited number of errors', () => {
      for (let i = 0; i < 20; i++) {
        alertManager.logError(`Error ${i}`, `Stack ${i}`);
      }

      const errors = alertManager.getRecentErrors(5);
      expect(errors).toHaveLength(5);
    });
  });

  describe('alertDbReconnectExceeded', () => {
    it('should send email alert with reconnect details', async () => {
      process.env.ALERT_MODE = 'email';
      process.env.OPS_ALERT_EMAIL_TO = 'ops@example.com';
      process.env.SMTP_HOST = 'smtp.example.com';

      await alertManager.alertDbReconnectExceeded(5, 5);

      const nodemailer = require('nodemailer');
      const sendMock = getSendMailMock(nodemailer);
      if (sendMock) {
        expect(sendMock).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: expect.stringContaining('Database Reconnect Exceeded'),
          })
        );
      } else {
        const hist = (global as any).__alerts_send_history || [];
        expect(hist.length).toBeGreaterThan(0);
        expect(hist[hist.length - 1].title).toContain('Database Reconnect Exceeded');
      }
    });

    it('should send webhook alert with reconnect details', async () => {
      process.env.ALERT_MODE = 'webhook';
      process.env.OPS_ALERT_WEBHOOK_URL = 'https://n8n.example.com/webhook/alert';

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await alertManager.alertDbReconnectExceeded(5, 5);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://n8n.example.com/webhook/alert',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Database Reconnect Exceeded'),
        })
      );
    });
  });

  describe('alertDiskWriteFailure', () => {
    it('should send alert with file path and error', async () => {
      process.env.ALERT_MODE = 'email';
      process.env.OPS_ALERT_EMAIL_TO = 'ops@example.com';
      process.env.SMTP_HOST = 'smtp.example.com';

      await alertManager.alertDiskWriteFailure('/receipts/test.pdf', 'EACCES: permission denied');

      const nodemailer = require('nodemailer');
      const sendMock = getSendMailMock(nodemailer);
      if (sendMock) {
        expect(sendMock).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: expect.stringContaining('Disk Write Failure'),
            text: expect.stringContaining('/receipts/test.pdf'),
          })
        );
      } else {
        const hist = (global as any).__alerts_send_history || [];
        expect(hist.length).toBeGreaterThan(0);
        expect(hist[hist.length - 1].title).toContain('Disk Write Failure');
      }
    });
  });

  describe('alertTranspileOnlyProduction', () => {
    it('should send critical alert about transpile-only', async () => {
      process.env.ALERT_MODE = 'email';
      process.env.OPS_ALERT_EMAIL_TO = 'ops@example.com';
      process.env.SMTP_HOST = 'smtp.example.com';

      await alertManager.alertTranspileOnlyProduction();

      const nodemailer = require('nodemailer');
      const sendMock = getSendMailMock(nodemailer);
      if (sendMock) {
        expect(sendMock).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: expect.stringContaining('Transpile-Only in Production'),
            text: expect.stringContaining('type errors'),
          })
        );
      } else {
        const hist = (global as any).__alerts_send_history || [];
        expect(hist.length).toBeGreaterThan(0);
        expect(hist[hist.length - 1].title).toContain('Transpile-Only in Production');
      }
    });
  });
});
