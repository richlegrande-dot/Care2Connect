/**
 * Self-Heal Admin Routes
 * Provides automated healing capabilities for system issues
 */

import express, { Request, Response } from 'express';
import { prisma } from '../../utils/database';
import { healthCheckScheduler } from '../../services/healthCheckScheduler';
import { performance } from 'perf_hooks';

const router = express.Router();

interface HealAction {
  component: string;
  action: string;
  success: boolean;
  error?: string;
}

/**
 * POST /admin/self-heal/run
 * Trigger self-healing procedures
 */
router.post('/run', async (req: Request, res: Response) => {
  console.log('[Self-Heal] Starting self-heal run...');

  const startTime = performance.now();
  const actions: HealAction[] = [];
  let overallSuccess = true;

  try {
    // 1. Restart health check scheduler
    try {
      healthCheckScheduler.stop();
      healthCheckScheduler.start();
      actions.push({
        component: 'healthCheckScheduler',
        action: 'restart',
        success: true,
      });
    } catch (error) {
      actions.push({
        component: 'healthCheckScheduler',
        action: 'restart',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      overallSuccess = false;
    }

    // 2. Test database connectivity
    if (!process.env.DATABASE_URL) {
      // FileStore mode - no database to test
      actions.push({
        component: 'database',
        action: 'connectivity_test',
        success: true,
        error: 'FileStore mode (no database)',
      });
    } else {
      try {
        await prisma.$queryRaw`SELECT 1`;
        actions.push({
          component: 'database',
          action: 'connectivity_test',
          success: true,
        });
      } catch (error) {
        actions.push({
          component: 'database',
          action: 'connectivity_test',
          success: false,
          error: error instanceof Error ? error.message : 'Database unreachable',
        });
        overallSuccess = false;
      }
    }

    // 3. Clean up old health check records
    if (!process.env.DATABASE_URL) {
      // FileStore mode - no database records to clean
      actions.push({
        component: 'database',
        action: 'cleanup',
        success: true,
        error: 'FileStore mode (no cleanup needed)',
      });
    } else {
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

          actions.push({
            component: 'database',
            action: `cleanup_${toDelete}_old_records`,
            success: true,
          });
        } else {
          actions.push({
            component: 'database',
            action: 'cleanup_not_needed',
            success: true,
          });
        }
      } catch (error) {
        actions.push({
          component: 'database',
          action: 'cleanup',
          success: false,
          error: error instanceof Error ? error.message : 'Cleanup failed',
        });
      }
    }

    // 4. Clean up old ProfileTickets (older than 90 days with no activity)
    if (!process.env.DATABASE_URL) {
      // FileStore mode - no profile tickets to clean
      actions.push({
        component: 'profileTickets',
        action: 'cleanup',
        success: true,
        error: 'FileStore mode (no cleanup needed)',
      });
    } else {
      try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const deleted = await prisma.profileTicket.deleteMany({
          where: {
            createdAt: {
              lt: ninetyDaysAgo,
            },
            status: {
              in: ['ERROR', 'COMPLETED'],
            },
          },
        });

        actions.push({
          component: 'profileTickets',
          action: `cleanup_${deleted.count}_old_tickets`,
          success: true,
        });
      } catch (error) {
        actions.push({
          component: 'profileTickets',
          action: 'cleanup',
          success: false,
          error: error instanceof Error ? error.message : 'Ticket cleanup failed',
        });
      }
    }

    // 5. Check tunnel connectivity
    try {
      const axios = require('axios');
      const domain = process.env.CLOUDFLARE_DOMAIN || 'care2connects.org';

      await axios.get(`https://api.${domain}/health/live`, {
        timeout: 5000,
      });

      actions.push({
        component: 'tunnel',
        action: 'connectivity_test',
        success: true,
      });
    } catch (error) {
      actions.push({
        component: 'tunnel',
        action: 'connectivity_test',
        success: false,
        error: 'Tunnel not reachable from public internet',
      });
      overallSuccess = false;
    }

    // 6. Validate critical environment variables
    const requiredEnvVars = process.env.FEATURE_INTEGRITY_MODE === 'demo' 
      ? ['JWT_SECRET']  // In demo mode, DATABASE_URL is optional
      : ['DATABASE_URL', 'JWT_SECRET'];
    const missingEnvVars: string[] = [];

    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        missingEnvVars.push(varName);
      }
    }

    if (missingEnvVars.length > 0) {
      actions.push({
        component: 'environment',
        action: 'validate_env_vars',
        success: false,
        error: `Missing: ${missingEnvVars.join(', ')}`,
      });
      overallSuccess = false;
    } else {
      actions.push({
        component: 'environment',
        action: 'validate_env_vars',
        success: true,
      });
    }

    // 7. Trigger immediate health check
    try {
      await healthCheckScheduler.runHealthCheck();
      actions.push({
        component: 'healthCheck',
        action: 'run_immediate_check',
        success: true,
      });
    } catch (error) {
      actions.push({
        component: 'healthCheck',
        action: 'run_immediate_check',
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      });
    }

    const duration = Math.round(performance.now() - startTime);

    // Log incident if healing failed
    if (!overallSuccess) {
      console.error('[Self-Heal] Healing completed with failures:', actions.filter((a) => !a.success));

      // Create incident record
      try {
        await prisma.supportTicket.create({
          data: {
            type: 'GENERAL',
            priority: 'HIGH',
            subject: 'Self-heal completed with failures',
            description: JSON.stringify(actions, null, 2),
            status: 'OPEN',
            source: 'SYSTEM',
          },
        });
      } catch (error) {
        console.error('[Self-Heal] Failed to create incident ticket:', error);
      }
    }

    res.json({
      success: overallSuccess,
      duration,
      actions,
      timestamp: new Date().toISOString(),
      message: overallSuccess
        ? 'Self-healing completed successfully'
        : 'Self-healing completed with some failures - incident created',
    });
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);

    console.error('[Self-Heal] Critical error during self-heal:', error);

    res.status(500).json({
      success: false,
      duration,
      actions,
      error: error instanceof Error ? error.message : 'Self-heal failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /admin/self-heal/status
 * Get current self-heal capability status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Check if all healing components are available
    const status = {
      healthCheckScheduler: {
        available: true,
      },
      database: {
        available: false,
        connected: false,
      },
      tunnel: {
        available: true,
        reachable: false,
      },
      environment: {
        available: true,
        valid: false,
      },
    };

    // Test database
    try {
      await prisma.$queryRaw`SELECT 1`;
      status.database.available = true;
      status.database.connected = true;
    } catch (error) {
      status.database.available = true;
      status.database.connected = false;
    }

    // Check environment
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
    const allPresent = requiredEnvVars.every((v) => !!process.env[v]);
    status.environment.valid = allPresent;

    // Check tunnel
    try {
      const axios = require('axios');
      const domain = process.env.CLOUDFLARE_DOMAIN || 'care2connects.org';

      await axios.get(`https://api.${domain}/health/live`, {
        timeout: 5000,
      });

      status.tunnel.reachable = true;
    } catch (error) {
      status.tunnel.reachable = false;
    }

    const overallReady =
      status.healthCheckScheduler.available &&
      status.database.available &&
      status.tunnel.available &&
      status.environment.available;

    res.json({
      ready: overallReady,
      components: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      ready: false,
      error: error instanceof Error ? error.message : 'Status check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
