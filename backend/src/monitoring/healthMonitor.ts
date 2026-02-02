import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '../utils/database';
import envProof from '../utils/envProof';
import { integrityManager } from '../services/integrity/featureIntegrity';
import { alertManager } from './alertManager';
import { resolveStripeKeysFromEnv } from '../utils/stripeKeyDetector';
import { getWebhookState } from '../utils/webhookTracker';
import { isWebhookRouteMounted } from '../routes/stripe-webhook';

export interface ServiceStatus {
  ok: boolean;
  detail?: string;
  // Backwards compatibility: some tests and callers expect `message`
  message?: string;
}

export type HealthSnapshot = any;

class HealthMonitor {
  private startTime: number = Date.now();
  private healthHistory: HealthSnapshot[] = [];
  private maxHistorySize: number = 50;
  private pollInterval: NodeJS.Timeout | null = null;
  private healthDir: string = path.join(process.cwd(), 'data', 'health');
  private healthLogFile: string = path.join(this.healthDir, 'health-history.jsonl');

  constructor() {
    this.ensureHealthDirectory();
  }

  private async ensureHealthDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.healthDir, { recursive: true });
    } catch (error: any) {
      console.warn('Could not ensure health directory exists:', error?.message || error);
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<ServiceStatus> {
    // If no DATABASE_URL is configured, operate in FileStore mode
    if (!process.env.DATABASE_URL) {
      return { ok: true, detail: 'FileStore mode (no DATABASE_URL)' };
    }

    try {
      // Lazy-load prisma to avoid startup failures when not configured
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { prisma } = require('../utils/database');
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true, detail: 'Connected' };
    } catch (error: any) {
      return { ok: false, detail: `DB connection failed: ${error?.message || error}` };
    }
  }

  /**
   * Detect whether TypeScript is running in transpile-only mode (best-effort)
   */
  private isTranspileOnly(): boolean {
    // Honor an explicit env var for tests; otherwise assume false
    return (process.env.TS_NODE_TRANSPILE_ONLY === 'true') || false;
  }

  /**
   * Check storage directories exist and are writable
   */
  private async checkStorage(): Promise<ServiceStatus> {
    const requiredDirs = [
      'receipts',
      'uploads',
      'data/support-tickets',
      'models',
      'data/health'
    ];

    const missingDirs: string[] = [];
    const createdDirs: string[] = [];

    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      try {
        await fs.access(dirPath);
      } catch {
        missingDirs.push(dir);
        try {
          await fs.mkdir(dirPath, { recursive: true });
          createdDirs.push(dir);
        } catch (error: any) {
          return { ok: false, detail: `Failed to create ${dir}: ${error.message}` };
        }
      }
    }

    if (createdDirs.length > 0) {
      return { ok: true, detail: `Auto-created: ${createdDirs.join(', ')}` };
    }

    return { ok: true, detail: 'All directories exist' };
  }

  /**
   * Check speech system availability
   */
  private async checkSpeech(): Promise<{
    nvtAvailable: boolean;
    evtsAvailable: boolean;
    modelInstalled: boolean;
    detail: string;
  }> {
    // NVT is browser-only, always mark as available but note it's client-side
    const nvtAvailable = true;

    // Check if EVTS model exists (Whisper/Vosk)
    const modelPaths = [
      path.join(process.cwd(), 'models', 'vosk-model'),
      path.join(process.cwd(), 'models', 'whisper'),
    ];

    let modelInstalled = false;
    for (const modelPath of modelPaths) {
      try {
        await fs.access(modelPath);
        modelInstalled = true;
        break;
      } catch {
        // Model not found at this path
      }
    }

    const evtsAvailable = modelInstalled;

    let detail = 'NVT: browser-only (available)';
    if (evtsAvailable) {
      detail += ', EVTS: model installed';
    } else {
      detail += ', EVTS: model missing (degraded to NVT/manual)';
    }

    return { nvtAvailable, evtsAvailable, modelInstalled, detail };
  }

  /**
   * Check Stripe configuration
   */
  private checkStripe(): { configured: boolean; detail: string; webhookEndpointMounted: boolean; webhookSecretConfigured: boolean } {
    const { secret, publishable } = resolveStripeKeysFromEnv();
    const checkoutMode = (process.env.STRIPE_CHECKOUT_MODE || 'redirect_only').toLowerCase();

    let configured = false;
    let detail = '';
    if (checkoutMode === 'redirect_only') {
      configured = !!secret;
      detail = configured ? 'Secret key provided (redirect-only mode)' : 'Missing secret key (redirect-only requires secret key)';
    } else {
      configured = !!secret && !!publishable;
      detail = configured ? 'Secret and publishable keys provided' : 'Missing Stripe keys for stripe_js mode';
    }

    // Check webhook endpoint registration
    const webhookEndpointMounted = (() => {
      try {
        return isWebhookRouteMounted();
      } catch (e) {
        return false;
      }
    })();

    const webhookSecretConfigured = !!process.env.STRIPE_WEBHOOK_SECRET;

    return { configured, detail, webhookEndpointMounted, webhookSecretConfigured };
  }

  // SMTP/email delivery has been archived. Support tickets are persisted to
  // `data/support-tickets` and surfaced on the admin health pages. This method
  // intentionally omitted to avoid reporting SMTP as a service dependency.

  /**
   * Perform full health check
   */
  public async performHealthCheck(): Promise<HealthSnapshot> {
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const tsTranspileOnly = this.isTranspileOnly();

    // Perform all checks
    const [db, storage, speech] = await Promise.all([
      this.checkDatabase(),
      this.checkStorage(),
      this.checkSpeech(),
    ]);

    const stripe = this.checkStripe();

    // Update integrity manager service statuses
    try {
      integrityManager.updateServiceStatus('database', db.ok, db.ok ? undefined : db.detail);
      integrityManager.updateServiceStatus('storage', storage.ok, storage.ok ? undefined : storage.detail);
      integrityManager.updateServiceStatus('stripe', stripe.configured, stripe.configured ? undefined : stripe.detail);
      integrityManager.updateServiceStatus('evtsModel', speech.evtsAvailable, speech.evtsAvailable ? undefined : speech.detail);
    } catch (e) {
      console.warn('Failed to update integrity manager:', e);
    }

    // Determine degraded reasons
    const degradedReasons: string[] = [];
    if (!speech.evtsAvailable) degradedReasons.push('EVTS_MODEL_MISSING');
    if (!stripe.configured) degradedReasons.push('STRIPE_KEYS_MISSING');
    if (tsTranspileOnly) degradedReasons.push('TYPESCRIPT_TRANSPILE_ONLY');

    const status = (db.ok && storage.ok) ? 'ready' : (degradedReasons.length > 0 ? 'degraded' : 'unhealthy');

    const snapshot: HealthSnapshot = {
      ok: db.ok && storage.ok,
      timestamp: new Date().toISOString(),
      uptimeSec,
      mode: process.env.NODE_ENV || 'development',
      build: {
        commit: process.env.GIT_COMMIT || 'unknown',
        node: process.version,
        tsTranspileOnly,
      },
      services: {
        db,
        storage,
        speech,
        stripe,
      },
      envProof: envProof.getEnvProof([
        'OPENAI_API_KEY',
        'DATABASE_URL',
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'JWT_SECRET',
      ]),
      // webhook tracking (in-memory, sanitized)
      webhook: getWebhookState(),
      degraded: {
        enabled: degradedReasons.length > 0,
        reasons: degradedReasons,
      },
      status,
      degradedReasons,
      integrity: integrityManager.getIntegrityStatus(),
      connectedSince: {
        backend: new Date(this.startTime).toISOString(),
        storage: integrityManager.getConnectedSince('storage') || '',
        db: integrityManager.getConnectedSince('database') || '',
        healthMonitor: new Date(this.startTime).toISOString(),
      }
    };

    return snapshot;
  }

  /**
   * Store snapshot in history (memory + disk)
   */
  private async storeSnapshot(snapshot: HealthSnapshot): Promise<void> {
    // Add to in-memory ring buffer
    this.healthHistory.push(snapshot);
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory.shift();
    }

    // Append to disk (JSONL format)
    try {
      await fs.appendFile(
        this.healthLogFile,
        JSON.stringify(snapshot) + '\n',
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to write health snapshot to disk:', error);
    }
  }

  /**
   * Get recent health history
   */
  public getHistory(limit: number = 50): HealthSnapshot[] {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Start periodic health monitoring
   */
  public start(intervalMs: number = 30000): void {
    if (this.pollInterval) {
      console.warn('Health monitor already started');
      return;
    }

    console.log(`🏥 Health monitor starting (polling every ${intervalMs}ms)`);

    // Perform initial check
    this.performHealthCheck()
      .then(async (snapshot) => {
        await this.storeSnapshot(snapshot);
        // Trigger alerts if health failing
        try { await alertManager.checkHealth(snapshot); } catch (e) { console.error('Alert check failed:', e); }
      })
      .catch(error => console.error('Initial health check failed:', error));

    // Start periodic checks
    this.pollInterval = setInterval(async () => {
      try {
        const snapshot = await this.performHealthCheck();
        await this.storeSnapshot(snapshot);
        try { await alertManager.checkHealth(snapshot); } catch (e) { console.error('Alert check failed:', e); }
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop periodic monitoring
   */
  public stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log('Health monitor stopped');
    }
  }

  /**
   * Log startup banner with system status
   */
  public async logStartupBanner(port: number): Promise<void> {
    const snapshot = await this.performHealthCheck();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🚀 CareConnect Backend Server                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`📊 Port:        ${port}`);
    console.log(`📊 Environment: ${snapshot.mode}`);
    console.log(`📊 Node:        ${snapshot.build?.node || process.version}`);
    console.log(`🌐 Frontend:    ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    
    if (snapshot.build?.tsTranspileOnly) {
      console.log('\n⚠️  WARNING: Running in TypeScript transpile-only mode');
      console.log('   Type errors may be masked. Use npm run typecheck for validation.');
    }

    if (snapshot.degraded?.enabled) {
      console.log('\n⚠️  DEGRADED MODE ACTIVE:');
        (snapshot.degraded.reasons || []).forEach((reason: string) => {
        console.log(`   • ${reason}`);
      });
    }

    console.log(`\n📦 Services:`);
    console.log(`   Database:    ${(snapshot.services?.db?.ok ? '✅' : '❌')} ${snapshot.services?.db?.detail || ''}`);
    console.log(`   Storage:     ${(snapshot.services?.storage?.ok ? '✅' : '❌')} ${snapshot.services?.storage?.detail || ''}`);
    console.log(`   Speech:      ${snapshot.services?.speech?.detail || ''}`);
    console.log(`   Stripe:      ${(snapshot.services?.stripe?.configured ? '✅' : '⚠️ ')} ${snapshot.services?.stripe?.detail || ''}`);
    // SMTP row intentionally removed (archived). Support tickets are stored under data/support-tickets.
    
    // Integrity-aware readiness
    const integrity = integrityManager.getIntegrityStatus();
    console.log('\n🔐 Integrity: mode=' + integrity.mode + ' ready=' + (integrity.ready ? 'YES' : 'NO'));
    if (!integrity.ready) {
      console.log('\n❌ SERVER NOT READY: Blocking reasons:');
      integrity.blockingReasons.forEach(r => console.log('   • ' + r));
      console.log('\nTo fix: see admin diagnostics or set FEATURE_INTEGRITY_MODE=demo for partial startup');
    } else {
      console.log('\n✨ Server ready for requests\n');
    }
  }
}

// Singleton instance
export const healthMonitor = new HealthMonitor();
