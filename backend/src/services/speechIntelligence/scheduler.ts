/**
 * Speech Intelligence - Scheduled Jobs
 * Handles periodic tasks like cleanup and profile computation
 */

import { RuntimeTuning } from './runtimeTuning';
import { RetentionManager } from './retention';
import { SmokeTestRunner } from './smokeTest';

export class SpeechIntelligenceScheduler {
  private runtimeTuning: RuntimeTuning;
  private retentionManager: RetentionManager;
  private smokeTestRunner: SmokeTestRunner;
  
  private cleanupInterval?: NodeJS.Timeout;
  private profileComputeInterval?: NodeJS.Timeout;
  private smokeTestInterval?: NodeJS.Timeout;

  private lastSmokeTestResult?: any;
  private lastCleanupAt?: Date;
  private lastProfileComputeAt?: Date;
  private recentErrors: string[] = [];

  constructor() {
    this.runtimeTuning = new RuntimeTuning();
    this.retentionManager = new RetentionManager();
    this.smokeTestRunner = new SmokeTestRunner();
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    // Run retention cleanup daily at 2am
    this.scheduleDaily(2, 0, async () => {
      console.log('[SpeechIntel] Running retention cleanup...');
      try {
        const results = await this.retentionManager.cleanupExpiredSessions();
        this.lastCleanupAt = new Date();
        console.log(`[SpeechIntel] Cleanup: ${results.deleted} sessions deleted, ${results.errors.length} errors`);
      } catch (error) {
        this.addError(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown'}`);
        console.error('[SpeechIntel] Cleanup error:', error);
      }
    });

    // Compute tuning profiles daily at 3am
    this.scheduleDaily(3, 0, async () => {
      console.log('[SpeechIntel] Computing tuning profiles...');
      try {
        const results = await this.runtimeTuning.computeProfiles();
        this.lastProfileComputeAt = new Date();
        console.log(`[SpeechIntel] Profiles: ${results.updated} updated, ${results.skipped} skipped, ${results.errors.length} errors`);
      } catch (error) {
        this.addError(`Profile compute failed: ${error instanceof Error ? error.message : 'Unknown'}`);
        console.error('[SpeechIntel] Profile compute error:', error);
      }
    });

    // Run smoke tests every 6 hours (default), configurable via SPEECH_SMOKE_INTERVAL_HOURS
    const smokeTestHours = parseInt(process.env.SPEECH_SMOKE_INTERVAL_HOURS || '6');
    
    // Mutex to prevent overlapping smoke test runs
    let smokeTestRunning = false;
    
    this.smokeTestInterval = setInterval(async () => {
      if (smokeTestRunning) {
        console.warn('[SpeechIntel] Smoke test already running, skipping this interval');
        return;
      }
      
      console.log('[SpeechIntel] Running smoke tests...');
      smokeTestRunning = true;
      try {
        this.lastSmokeTestResult = await this.smokeTestRunner.runTests();
        console.log(`[SpeechIntel] Smoke test: ${this.lastSmokeTestResult.success ? 'PASSED' : 'FAILED'}`, {
          engineUsed: this.lastSmokeTestResult.engineUsed,
          fallbackUsed: this.lastSmokeTestResult.fallbackUsed,
          latencyMs: this.lastSmokeTestResult.latencyMs
        });
      } catch (error) {
        console.error('[SpeechIntel] Smoke test error:', error);
        this.lastSmokeTestResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        };
      } finally {
        smokeTestRunning = false;
      }
    }, smokeTestHours * 60 * 60 * 1000);

    // Run initial smoke test after 30 seconds
    setTimeout(async () => {
      smokeTestRunning = true;
      try {
        this.lastSmokeTestResult = await this.smokeTestRunner.runTests();
      } catch (error) {
        console.error('[SpeechIntel] Initial smoke test failed:', error);
      } finally {
        smokeTestRunning = false;
      }
    }, 30000);

    console.log('[SpeechIntel] Scheduler started');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.profileComputeInterval) clearInterval(this.profileComputeInterval);
    if (this.smokeTestInterval) clearInterval(this.smokeTestInterval);
    
    console.log('[SpeechIntel] Scheduler stopped');
  }

  /**
   * Get last smoke test result
   */
  getLastSmokeTestResult() {
    return this.lastSmokeTestResult;
  }

  /**
   * Manually trigger smoke tests (for admin endpoint)
   */
  async runSmokeTestsNow(): Promise<any> {
    console.log('[SpeechIntel] Manual smoke test triggered...');
    try {
      this.lastSmokeTestResult = await this.smokeTestRunner.runTests();
      console.log(`[SpeechIntel] Manual smoke test: ${this.lastSmokeTestResult.success ? 'PASSED' : 'FAILED'}`);
      return this.lastSmokeTestResult;
    } catch (error) {
      console.error('[SpeechIntel] Manual smoke test error:', error);
      this.lastSmokeTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
      this.addError(`Smoke test failed: ${error instanceof Error ? error.message : 'Unknown'}`);
      throw error;
    }
  }

  /**
   * Get scheduler health/status
   */
  getSchedulerHealth() {
    return {
      running: this.smokeTestInterval !== undefined,
      lastCleanupAt: this.lastCleanupAt,
      lastProfileComputeAt: this.lastProfileComputeAt,
      lastSmokeTestAt: this.lastSmokeTestResult?.timestamp,
      lastSmokeTestSuccess: this.lastSmokeTestResult?.success,
      recentErrors: this.recentErrors.slice(-5)
    };
  }

  /**
   * Add error to recent errors list (keep last 10)
   */
  private addError(error: string) {
    this.recentErrors.push(`${new Date().toISOString()}: ${error}`);
    if (this.recentErrors.length > 10) {
      this.recentErrors.shift();
    }
  }

  /**
   * Schedule a task to run daily at a specific time
   */
  private scheduleDaily(hour: number, minute: number, task: () => Promise<void>) {
    const runTask = async () => {
      try {
        await task();
      } catch (error) {
        console.error('[SpeechIntel] Scheduled task error:', error);
      }
      
      // Schedule next run
      const now = new Date();
      const next = new Date();
      next.setHours(hour, minute, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      const msUntilNext = next.getTime() - now.getTime();
      setTimeout(runTask, msUntilNext);
    };

    // Schedule first run
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    const msUntilNext = next.getTime() - now.getTime();
    setTimeout(runTask, msUntilNext);
  }
}

// Singleton instance
let scheduler: SpeechIntelligenceScheduler | null = null;

export function startSpeechIntelligenceScheduler() {
  if (!scheduler) {
    scheduler = new SpeechIntelligenceScheduler();
    scheduler.start();
  }
  return scheduler;
}

export function getSpeechIntelligenceScheduler() {
  return scheduler;
}

export function stopSpeechIntelligenceScheduler() {
  if (scheduler) {
    scheduler.stop();
    scheduler = null;
  }
}
