/**
 * Health Check Scheduler
 * Runs health checks on a recurring interval
 * SECURITY: Only logs sanitized results, no secrets
 * 
 * PHASE 6M AUTO-RECOVERY:
 * - Automatically triggers recovery when degraded status detected
 * - Rate-limited recovery attempts (max 1 per 5 minutes)
 * - Tracks consecutive failures for escalation
 */

import { getEnvConfig } from './envSchema';
import { runHealthChecks, HealthStatus } from './healthCheckRunner';
import { autoRecoveryService } from '../ops/autoRecoveryService';

class HealthCheckScheduler {
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;
  private lastStatus?: HealthStatus;
  private lastRecoveryAttempt: Date | null = null;
  private consecutiveDegradedChecks = 0;
  private readonly RECOVERY_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
  private readonly AUTO_RECOVERY_ENABLED = process.env.AUTO_RECOVERY_ENABLED !== 'false'; // Enabled by default

  /**
   * Start the scheduler
   */
  start(): void {
    const config = getEnvConfig();
    
    if (!config.HEALTHCHECKS_ENABLED) {
      console.log('[HEALTH SCHEDULER] Health checks disabled by configuration');
      return;
    }

    if (this.isRunning) {
      console.log('[HEALTH SCHEDULER] Already running');
      return;
    }

    console.log(`[HEALTH SCHEDULER] Starting health checks every ${config.HEALTHCHECKS_INTERVAL_SEC} seconds`);
    
    // Run initial check
    this.runCheck();
    
    // Schedule recurring checks
    this.intervalId = setInterval(() => {
      this.runCheck();
    }, config.HEALTHCHECKS_INTERVAL_SEC * 1000);

    this.isRunning = true;
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    this.isRunning = false;
    console.log('[HEALTH SCHEDULER] Stopped');
  }

  /**
   * Get the last health status
   */
  getLastStatus(): HealthStatus | undefined {
    return this.lastStatus;
  }

  /**
   * Run health check manually
   */
  async runCheck(): Promise<HealthStatus> {
    try {
      const status = await runHealthChecks();
      this.lastStatus = status;
      
      // Log summary (no secrets)
      const healthyCount = status.services.filter(s => s.healthy).length;
      const totalCount = status.services.length;
      
      console.log(`[HEALTH SCHEDULER] Check completed: ${healthyCount}/${totalCount} services healthy. Overall: ${status.overall ? 'HEALTHY' : 'DEGRADED'}`);
      
      // Log failed services (sanitized)
      const failed = status.services.filter(s => !s.healthy);
      if (failed.length > 0) {
        const failedNames = failed.map(s => `${s.service}(${s.error || 'unknown'})`).join(', ');
        console.warn(`[HEALTH SCHEDULER] Failed services: ${failedNames}`);
      }
      
      // AUTO-RECOVERY: Trigger automatic recovery on degraded status
      if (!status.overall && this.AUTO_RECOVERY_ENABLED) {
        this.consecutiveDegradedChecks++;
        await this.attemptAutoRecovery(failed);
      } else {
        this.consecutiveDegradedChecks = 0; // Reset on healthy status
      }
      
      return status;
    } catch (error) {
      console.error('[HEALTH SCHEDULER] Health check failed:', error);
      
      // Return a minimal status on error
      const errorStatus: HealthStatus = {
        overall: false,
        services: [],
        lastRun: new Date()
      };
      
      this.lastStatus = errorStatus;
      return errorStatus;
    }
  }

  /**
   * Attempt automatic recovery when degraded status detected
   */
  private async attemptAutoRecovery(failedServices: any[]): Promise<void> {
    // Rate limiting: Don't attempt recovery too frequently
    const now = new Date();
    if (this.lastRecoveryAttempt) {
      const timeSinceLastAttempt = now.getTime() - this.lastRecoveryAttempt.getTime();
      if (timeSinceLastAttempt < this.RECOVERY_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((this.RECOVERY_COOLDOWN_MS - timeSinceLastAttempt) / 1000);
        console.log(`[AUTO-RECOVERY] Cooldown active. Next attempt in ${remainingSeconds}s`);
        return;
      }
    }

    // Only attempt recovery for critical services (not optional ones like tunnel)
    const criticalServices = ['prisma', 'openai', 'stripe'];
    const failedCritical = failedServices.filter(s => criticalServices.includes(s.service));
    
    if (failedCritical.length === 0) {
      console.log('[AUTO-RECOVERY] No critical services failed, skipping recovery');
      return;
    }

    console.log(`[AUTO-RECOVERY] 🔄 Degraded status detected (${this.consecutiveDegradedChecks} consecutive). Attempting automatic recovery...`);
    this.lastRecoveryAttempt = now;

    try {
      const result = await autoRecoveryService.attemptRecovery();
      
      if (result.attempted) {
        const successCount = result.results.filter(r => r.success).length;
        const totalCount = result.results.length;
        
        if (successCount === totalCount) {
          console.log(`[AUTO-RECOVERY] ✅ All services recovered successfully (${successCount}/${totalCount})`);
          this.consecutiveDegradedChecks = 0; // Reset counter on successful recovery
        } else if (successCount > 0) {
          console.log(`[AUTO-RECOVERY] ⚠️  Partial recovery (${successCount}/${totalCount} services recovered)`);
        } else {
          console.warn(`[AUTO-RECOVERY] ❌ Recovery failed for all services (${totalCount})`);
        }
        
        // Log individual results
        result.results.forEach(r => {
          const status = r.success ? '✅' : '❌';
          console.log(`[AUTO-RECOVERY]   ${status} ${r.service}${r.error ? `: ${r.error}` : ''}`);
        });
      } else {
        console.log('[AUTO-RECOVERY] Recovery already in progress, skipping');
      }
    } catch (error: any) {
      console.error('[AUTO-RECOVERY] Failed to trigger recovery:', error?.message || error);
    }
  }

  /**
   * Check if scheduler is running
   */
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }
}

// Global scheduler instance
let _scheduler: HealthCheckScheduler;

export function getHealthScheduler(): HealthCheckScheduler {
  if (!_scheduler) {
    _scheduler = new HealthCheckScheduler();
  }
  return _scheduler;
}

// Auto-start scheduler when module is loaded (if enabled)
export function initializeHealthScheduler(): void {
  const config = getEnvConfig();
  if (config.HEALTHCHECKS_ENABLED) {
    getHealthScheduler().start();
  }
}