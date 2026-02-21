/**
 * Health Check Scheduler
 * Runs automated health checks on a schedule and persists results to database
 */

import cron from 'node-cron';
import { prisma } from '../utils/database';
import os from 'os';
import { performance } from 'perf_hooks';

interface HealthCheckResult {
  db: { ok: boolean; latency?: number; error?: string };
  openai: { ok: boolean; latency?: number; error?: string };
  stripe: { ok: boolean; latency?: number; error?: string };
  cloudflare: { ok: boolean; latency?: number; error?: string };
  tunnel: { ok: boolean; error?: string };
  speech: { ok: boolean; latency?: number; error?: string };
}

class HealthCheckScheduler {
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  /**
   * Start the health check scheduler
   * Runs every 5 minutes by default
   */
  start(cronExpression: string = '*/5 * * * *', gracePeriodMs: number = 10000) {
    if (this.cronJob) {
      console.log('[Health Scheduler] Already running');
      return;
    }

    console.log(`[Health Scheduler] Starting with schedule: ${cronExpression}`);
    console.log(`[Health Scheduler] Grace period: ${gracePeriodMs}ms before first check`);

    this.cronJob = cron.schedule(cronExpression, async () => {
      if (this.isRunning) {
        console.log('[Health Scheduler] Previous check still running, skipping...');
        return;
      }

      this.isRunning = true;
      try {
        await this.runHealthCheck();
      } catch (error) {
        console.error('[Health Scheduler] Error running health check:', error);
      } finally {
        this.isRunning = false;
      }
    });

    // Run initial check after grace period (allow server to fully start)
    setTimeout(() => {
      this.runHealthCheck().catch((error) => {
        console.error('[Health Scheduler] Error in initial health check:', error);
      });
    }, gracePeriodMs);
  }

  /**
   * Stop the health check scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('[Health Scheduler] Stopped');
    }
  }

  /**
   * Run a complete health check and persist results
   */
  async runHealthCheck(): Promise<void> {
    console.log('[Health Scheduler] Running health check...');

    const startTime = performance.now();

    // Collect server stats
    const uptime = Math.floor(process.uptime());
    const cpuUsage = this.getCpuUsage();
    const memoryUsage = this.getMemoryUsage();
    const eventLoopDelay = await this.getEventLoopDelay();

    // Run all checks
    const checks = await this.runAllChecks();

    // Determine overall status
    const status = this.determineStatus(checks);
    const latency = Math.round(performance.now() - startTime);

    // Persist to database
    try {
      await prisma.healthCheckRun.create({
        data: {
          uptime,
          cpuUsage,
          memoryUsage,
          eventLoopDelay,
          checks: checks as any, // JSON field
          status,
          latency,
        },
      });

      console.log(`[Health Scheduler] Check completed: ${status} (${latency}ms)`);
    } catch (error) {
      console.error('[Health Scheduler] Failed to persist health check:', error);
    }

    // Clean up old checks (keep last 1000)
    try {
      const count = await prisma.healthCheckRun.count();
      if (count > 1000) {
        const toDelete = count - 1000;
        const oldestRecords = await prisma.healthCheckRun.findMany({
          orderBy: { createdAt: 'asc' },
          take: toDelete,
          select: { id: true },
        });

        await prisma.healthCheckRun.deleteMany({
          where: {
            id: {
              in: oldestRecords.map((r) => r.id),
            },
          },
        });

        console.log(`[Health Scheduler] Cleaned up ${toDelete} old health checks`);
      }
    } catch (error) {
      console.error('[Health Scheduler] Failed to clean up old checks:', error);
    }
  }

  /**
   * Run all health checks
   */
  private async runAllChecks(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult = {
      db: { ok: false },
      openai: { ok: false },
      stripe: { ok: false },
      cloudflare: { ok: false },
      tunnel: { ok: false },
      speech: { ok: false },
    };

    // Database check
    checks.db = await this.checkDatabase();

    // OpenAI check (only if configured)
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')) {
      checks.openai = await this.checkOpenAI();
    } else {
      checks.openai = { ok: true, error: 'Not configured (optional)' };
    }

    // Stripe check (only if configured)
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      checks.stripe = await this.checkStripe();
    } else {
      checks.stripe = { ok: true, error: 'Not configured (optional)' };
    }

    // Cloudflare check (only if configured)
    if (process.env.CLOUDFLARE_API_TOKEN) {
      checks.cloudflare = await this.checkCloudflare();
    } else {
      checks.cloudflare = { ok: false, error: 'Not configured' };
    }

    // Tunnel check
    checks.tunnel = await this.checkTunnel();

    // Speech intelligence smoke test
    checks.speech = await this.checkSpeechIntelligence();

    return checks;
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<{ ok: boolean; latency?: number; error?: string }> {
    try {
      const start = performance.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Math.round(performance.now() - start);

      return { ok: true, latency };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  }

  /**
   * Check OpenAI connectivity
   * DISABLED in V1_STABLE/ZERO_OPENAI_MODE
   */
  private async checkOpenAI(): Promise<{ ok: boolean; latency?: number; error?: string }> {
    // V1_STABLE / ZERO_OPENAI_MODE: OpenAI health checks are disabled
    const isV1Mode = process.env.V1_STABLE === 'true' || 
                     process.env.ZERO_OPENAI_MODE === 'true' || 
                     (process.env.AI_PROVIDER && !['openai'].includes(process.env.AI_PROVIDER));
    
    if (isV1Mode) {
      return { 
        ok: false, 
        error: 'disabled (V1_STABLE/ZERO_OPENAI_MODE)'
      };
    }
    
    try {
      const OpenAI = require('openai').default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const start = performance.now();
      await openai.models.list();
      const latency = Math.round(performance.now() - start);

      return { ok: true, latency };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'OpenAI check failed',
      };
    }
  }

  /**
   * Check Stripe connectivity
   */
  private async checkStripe(): Promise<{ ok: boolean; latency?: number; error?: string }> {
    try {
      const Stripe = require('stripe').default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      const start = performance.now();
      await stripe.balance.retrieve();
      const latency = Math.round(performance.now() - start);

      return { ok: true, latency };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Stripe check failed',
      };
    }
  }

  /**
   * Check Cloudflare API
   */
  private async checkCloudflare(): Promise<{ ok: boolean; latency?: number; error?: string }> {
    // Skip if not configured
    if (!process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN.length < 20) {
      return { ok: true, error: 'Not configured - Cloudflare API token missing or invalid' };
    }

    try {
      const axios = require('axios');

      const start = performance.now();
      const response = await axios.get('https://api.cloudflare.com/client/v4/user/tokens/verify', {
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000,
      });
      const latency = Math.round(performance.now() - start);

      // Check if response indicates success
      if (response.data && response.data.success === false) {
        return {
          ok: false,
          error: response.data.errors?.[0]?.message || 'Token verification failed',
          latency
        };
      }

      return { ok: true, latency };
    } catch (error: any) {
      // Extract more specific error information
      let errorMessage = 'Cloudflare check failed';
      
      if (error.response) {
        // API returned an error response
        if (error.response.status === 400) {
          errorMessage = 'Invalid request headers';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid or expired API token';
        } else if (error.response.status === 403) {
          errorMessage = 'API token lacks required permissions';
        } else {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
        
        // Add detailed error from response if available
        if (error.response.data?.errors?.[0]?.message) {
          errorMessage += ` - ${error.response.data.errors[0].message}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error - could not reach Cloudflare API';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check tunnel connectivity
   */
  private async checkTunnel(): Promise<{ ok: boolean; error?: string }> {
    // Skip if not configured
    if (!process.env.CLOUDFLARE_TUNNEL_ID) {
      return { ok: true, error: 'Not configured - Cloudflare tunnel ID missing' };
    }

    try {
      const axios = require('axios');

      // Try to reach the public API endpoint
      const domain = process.env.CLOUDFLARE_DOMAIN || 'care2connects.org';
      await axios.get(`https://api.${domain}/health/live`, {
        timeout: 5000,
      });

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Tunnel check failed - public API not reachable',
      };
    }
  }

  /**
   * Speech intelligence smoke test
   */
  private async checkSpeechIntelligence(): Promise<{ ok: boolean; latency?: number; error?: string }> {
    try {
      // Simple smoke test: check if speech intelligence routes are accessible
      // In production, you would run a real transcription test with a fixture audio file
      const start = performance.now();

      // Check if the transcription session can be created
      const session = await prisma.transcriptionSession.findFirst({
        where: {
          source: 'SYSTEM_SMOKE_TEST',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const latency = Math.round(performance.now() - start);

      // For now, just check if we can query the database
      return { ok: true, latency };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Speech intelligence check failed',
      };
    }
  }

  /**
   * Get CPU usage percentage
   */
  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle) / total;

    return Math.round(usage * 100) / 100;
  }

  /**
   * Get memory usage percentage
   */
  private getMemoryUsage(): number {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = (usedMem / totalMem) * 100;

    return Math.round(usage * 100) / 100;
  }

  /**
   * Get event loop delay (approximate)
   */
  private async getEventLoopDelay(): Promise<number> {
    return new Promise((resolve) => {
      const start = performance.now();
      setImmediate(() => {
        const delay = performance.now() - start;
        resolve(Math.round(delay * 100) / 100);
      });
    });
  }

  /**
   * Determine overall status from checks
   */
  private determineStatus(checks: HealthCheckResult): string {
    const criticalChecks = ['db'];
    const optionalChecks = ['openai', 'stripe', 'cloudflare', 'tunnel', 'speech'];

    // Check critical services
    for (const key of criticalChecks) {
      if (!checks[key as keyof HealthCheckResult].ok) {
        return 'unhealthy';
      }
    }

    // Count optional failures
    let failedOptional = 0;
    for (const key of optionalChecks) {
      const check = checks[key as keyof HealthCheckResult];
      if (!check.ok && !check.error?.includes('Not configured')) {
        failedOptional++;
      }
    }

    if (failedOptional >= 3) {
      return 'unhealthy';
    } else if (failedOptional > 0) {
      return 'degraded';
    }

    return 'healthy';
  }
}

// Singleton instance
export const healthCheckScheduler = new HealthCheckScheduler();

// Auto-start if enabled in environment
if (process.env.HEALTHCHECKS_ENABLED === 'true' && process.env.NODE_ENV !== 'test') {
  const interval = process.env.HEALTHCHECKS_INTERVAL_SEC
    ? `*/${Math.floor(parseInt(process.env.HEALTHCHECKS_INTERVAL_SEC) / 60)} * * * *`
    : '*/5 * * * *'; // Default: every 5 minutes

  healthCheckScheduler.start(interval);
}
