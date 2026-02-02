import { promises as fs } from 'fs';
import path from 'path';
import { healthMonitor } from '../src/monitoring/healthMonitor';

describe('Health Monitor', () => {
  const testHealthDir = path.join(process.cwd(), 'data', 'health-test');
  
  beforeAll(async () => {
    // Create test directory
    await fs.mkdir(testHealthDir, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testHealthDir, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('performHealthCheck', () => {
    it('should return health snapshot with all required fields', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      expect(snapshot).toHaveProperty('ok');
      expect(snapshot).toHaveProperty('timestamp');
      expect(snapshot).toHaveProperty('uptimeSec');
      expect(snapshot).toHaveProperty('mode');
      expect(snapshot).toHaveProperty('build');
      expect(snapshot).toHaveProperty('services');
      expect(snapshot).toHaveProperty('degraded');
      
      expect(typeof snapshot.ok).toBe('boolean');
      expect(typeof snapshot.timestamp).toBe('string');
      expect(typeof snapshot.uptimeSec).toBe('number');
    });

    it('should include build information', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      expect(snapshot.build).toHaveProperty('commit');
      expect(snapshot.build).toHaveProperty('node');
      expect(snapshot.build).toHaveProperty('tsTranspileOnly');
      
      expect(typeof snapshot.build.tsTranspileOnly).toBe('boolean');
      expect(snapshot.build.node).toContain('v');
    });

    it('should check all required services', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      expect(snapshot.services).toHaveProperty('db');
      expect(snapshot.services).toHaveProperty('storage');
      expect(snapshot.services).toHaveProperty('speech');
      expect(snapshot.services).toHaveProperty('stripe');
      // Note: SMTP has been archived and is no longer a service dependency
      
      // Each service should have required fields
      expect(snapshot.services.db).toHaveProperty('ok');
      expect(snapshot.services.db).toHaveProperty('detail');
    });

    it('should detect degraded mode when services are missing', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      expect(snapshot.degraded).toHaveProperty('enabled');
      expect(snapshot.degraded).toHaveProperty('reasons');
      expect(Array.isArray(snapshot.degraded.reasons)).toBe(true);
      
      // If any service is degraded, reasons should not be empty
      if (snapshot.degraded.enabled) {
        expect(snapshot.degraded.reasons.length).toBeGreaterThan(0);
      }
    });

    it('should include timestamp in ISO format', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      const timestamp = new Date(snapshot.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should increment uptime over time', async () => {
      const snapshot1 = await healthMonitor.performHealthCheck();
      
      await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1+ second
      
      const snapshot2 = await healthMonitor.performHealthCheck();
      
      expect(snapshot2.uptimeSec).toBeGreaterThan(snapshot1.uptimeSec);
    });
  });

  describe('getHistory', () => {
    it('should return array of snapshots', () => {
      const history = healthMonitor.getHistory();
      
      expect(Array.isArray(history)).toBe(true);
    });

    it('should respect limit parameter', () => {
      const limit = 5;
      const history = healthMonitor.getHistory(limit);
      
      expect(history.length).toBeLessThanOrEqual(limit);
    });

    it('should return most recent snapshots', () => {
      const history = healthMonitor.getHistory(10);
      
      if (history.length > 1) {
        // Timestamps should be in ascending order (oldest to newest)
        for (let i = 1; i < history.length; i++) {
          const prev = new Date(history[i - 1].timestamp);
          const curr = new Date(history[i].timestamp);
          expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
        }
      }
    });
  });

  describe('Folder auto-creation', () => {
    it('should create missing required directories', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      // Storage check should create directories if missing
      expect(snapshot.services.storage.ok).toBe(true);
      
      // Verify directories exist
      const requiredDirs = ['receipts', 'uploads', 'data/support-tickets', 'data/health'];
      
      for (const dir of requiredDirs) {
        const dirPath = path.join(process.cwd(), dir);
        await expect(fs.access(dirPath)).resolves.not.toThrow();
      }
    });

    it('should report auto-created directories in storage detail', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      expect(snapshot.services.storage.detail).toBeDefined();
      expect(typeof snapshot.services.storage.detail).toBe('string');
    });
  });

  describe('Speech system detection', () => {
    it('should detect NVT availability (browser-only)', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      expect(snapshot.services.speech.nvtAvailable).toBe(true);
    });

    it('should detect EVTS model installation status', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      expect(typeof snapshot.services.speech.evtsAvailable).toBe('boolean');
      expect(typeof snapshot.services.speech.modelInstalled).toBe('boolean');
    });

    it('should include degraded reason if EVTS model missing', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      if (!snapshot.services.speech.evtsAvailable) {
        expect(snapshot.degraded.reasons).toContain('EVTS_MODEL_MISSING');
      }
    });
  });

  describe('Stripe configuration detection', () => {
    it('should detect Stripe configuration status', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      expect(typeof snapshot.services.stripe.configured).toBe('boolean');
      expect(snapshot.services.stripe.detail).toBeDefined();
    });

    it('should include degraded reason if Stripe not configured', async () => {
      const snapshot = await healthMonitor.performHealthCheck();
      
      if (!snapshot.services.stripe.configured) {
        expect(snapshot.degraded.reasons).toContain('STRIPE_KEYS_MISSING');
      }
    });
  });

  // SMTP configuration detection removed - SMTP has been archived.
  // Support tickets are now persisted to data/support-tickets instead.
});
