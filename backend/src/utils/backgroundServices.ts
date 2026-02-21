/**
 * Background Services Manager
 * 
 * Centralized control for all background services, schedulers, and watchdogs.
 * Prevents services from starting automatically at module import time in test/stable modes.
 * 
 * Services managed:
 * - Health check scheduler (periodic health checks)
 * - Database watchdog (connection monitoring)
 * - Health monitor (system monitoring)
 * - Tunnel ping (Cloudflare tunnel keepalive)
 * 
 * Usage:
 *   // In server.ts after successful startup
 *   if (shouldStartBackgroundServices()) {
 *     await startBackgroundServices();
 *   }
 * 
 * Environment controls:
 *   START_BACKGROUND_SERVICES=true|false (explicit override)
 *   NODE_ENV=test (auto-disables)
 *   V1_STABLE=true (requires explicit enable)
 */

import { getEnvConfig } from './envSchema';
import { healthMonitor } from '../monitoring/healthMonitor';
import { getHealthScheduler } from './healthCheckScheduler';
import type { DatabaseWatchdog } from './dbStartupGate';
import type { PrismaClient } from '@prisma/client';

interface BackgroundServicesState {
  healthScheduler: boolean;
  dbWatchdog: boolean;
  healthMonitor: boolean;
  tunnelPing: boolean;
}

class BackgroundServicesManager {
  private started = false;
  private state: BackgroundServicesState = {
    healthScheduler: false,
    dbWatchdog: false,
    healthMonitor: false,
    tunnelPing: false
  };
  
  private dbWatchdog: DatabaseWatchdog | null = null;
  private tunnelPingInterval: NodeJS.Timeout | null = null;

  /**
   * Check if background services should start based on environment
   */
  shouldStart(): boolean {
    // Explicit override
    if (process.env.START_BACKGROUND_SERVICES !== undefined) {
      return process.env.START_BACKGROUND_SERVICES === 'true';
    }

    // Never start in test mode
    if (process.env.NODE_ENV === 'test') {
      return false;
    }

    // In V1 stable mode, require explicit enable
    if (process.env.V1_STABLE === 'true') {
      return false; // Default off in stable mode
    }

    // Default: start in development and production
    return true;
  }

  /**
   * Start all background services
   */
  async start(prisma?: PrismaClient): Promise<void> {
    if (this.started) {
      console.log('[BACKGROUND SERVICES] Already started');
      return;
    }

    if (!this.shouldStart()) {
      console.log('[BACKGROUND SERVICES] Disabled by configuration');
      return;
    }

    console.log('[BACKGROUND SERVICES] Starting...');
    const config = getEnvConfig();

    // 1. Health Check Scheduler
    try {
      if (config.HEALTHCHECKS_ENABLED) {
        const scheduler = getHealthScheduler();
        scheduler.start();
        this.state.healthScheduler = true;
        console.log('[BACKGROUND SERVICES] ✅ Health scheduler started');
      } else {
        console.log('[BACKGROUND SERVICES] Health scheduler disabled by config');
      }
    } catch (error) {
      console.error('[BACKGROUND SERVICES] ❌ Health scheduler failed:', error);
    }

    // 2. Database Watchdog
    if (prisma) {
      try {
        const { DatabaseWatchdog } = await import('./dbStartupGate');
        this.dbWatchdog = new DatabaseWatchdog(prisma, 30000);
        this.state.dbWatchdog = true;
        console.log('[BACKGROUND SERVICES] ✅ Database watchdog started');
      } catch (error) {
        console.error('[BACKGROUND SERVICES] ❌ Database watchdog failed:', error);
      }
    }

    // 3. Health Monitor
    try {
      healthMonitor.start(30000);
      this.state.healthMonitor = true;
      console.log('[BACKGROUND SERVICES] ✅ Health monitor started');
    } catch (error) {
      console.error('[BACKGROUND SERVICES] ❌ Health monitor failed:', error);
    }

    // 4. Tunnel Ping (if tunnel configured)
    if (process.env.CLOUDFLARE_TUNNEL_URL) {
      try {
        await this.startTunnelPing();
        this.state.tunnelPing = true;
        console.log('[BACKGROUND SERVICES] ✅ Tunnel ping started');
      } catch (error) {
        console.error('[BACKGROUND SERVICES] ❌ Tunnel ping failed:', error);
      }
    }

    this.started = true;
    
    const activeCount = Object.values(this.state).filter(Boolean).length;
    console.log(`[BACKGROUND SERVICES] Started ${activeCount}/4 services`);
  }

  /**
   * Start tunnel keepalive ping
   */
  private async startTunnelPing(): Promise<void> {
    const tunnelUrl = process.env.CLOUDFLARE_TUNNEL_URL;
    if (!tunnelUrl) return;

    // Ping every 5 minutes
    this.tunnelPingInterval = setInterval(async () => {
      try {
        const response = await fetch(`${tunnelUrl}/health/live`);
        if (response.ok) {
          console.log('[TUNNEL PING] ✅ Keepalive successful');
        } else {
          console.warn(`[TUNNEL PING] ⚠️  Returned ${response.status}`);
        }
      } catch (error) {
        console.error('[TUNNEL PING] ❌ Failed:', error);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop all background services (for graceful shutdown)
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    console.log('[BACKGROUND SERVICES] Stopping...');

    // Stop health scheduler
    if (this.state.healthScheduler) {
      try {
        getHealthScheduler().stop();
        this.state.healthScheduler = false;
      } catch (error) {
        console.error('[BACKGROUND SERVICES] Error stopping health scheduler:', error);
      }
    }

    // Stop database watchdog
    if (this.dbWatchdog) {
      try {
        this.dbWatchdog.stop();
        this.state.dbWatchdog = false;
      } catch (error) {
        console.error('[BACKGROUND SERVICES] Error stopping database watchdog:', error);
      }
    }

    // Stop health monitor
    if (this.state.healthMonitor) {
      try {
        healthMonitor.stop();
        this.state.healthMonitor = false;
      } catch (error) {
        console.error('[BACKGROUND SERVICES] Error stopping health monitor:', error);
      }
    }

    // Stop tunnel ping
    if (this.tunnelPingInterval) {
      clearInterval(this.tunnelPingInterval);
      this.tunnelPingInterval = null;
      this.state.tunnelPing = false;
    }

    this.started = false;
    console.log('[BACKGROUND SERVICES] Stopped');
  }

  /**
   * Get current state
   */
  getState(): BackgroundServicesState {
    return { ...this.state };
  }

  /**
   * Get database watchdog instance (if started)
   */
  getDbWatchdog(): DatabaseWatchdog | null {
    return this.dbWatchdog;
  }

  /**
   * Check if services are running
   */
  isRunning(): boolean {
    return this.started;
  }
}

// Global singleton
export const backgroundServices = new BackgroundServicesManager();

// Convenience exports
export const startBackgroundServices = (prisma?: PrismaClient) => backgroundServices.start(prisma);
export const stopBackgroundServices = () => backgroundServices.stop();
export const shouldStartBackgroundServices = () => backgroundServices.shouldStart();
export const getBackgroundServicesState = () => backgroundServices.getState();
