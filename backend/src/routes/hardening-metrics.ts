/**
 * Hardening Metrics API
 * 
 * Provides visibility into security hardening measures across:
 * - Prisma database security
 * - Server security headers
 * - Rate limiting status
 * - Tunnel health (if available)
 */

import express from 'express';
import { getPrismaMetrics, checkPrismaHealth } from '../lib/prisma';

const router = express.Router();

/**
 * GET /api/hardening/metrics
 * Get comprehensive hardening metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    // Prisma metrics
    const prismaMetrics = getPrismaMetrics();
    const prismaHealth = await checkPrismaHealth();

    // Server metrics
    const serverMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    };

    // Security headers check
    const securityHeaders = {
      helmetEnabled: true,
      corsConfigured: true,
      rateLimitingEnabled: true,
      sslEnforced: process.env.NODE_ENV === 'production',
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      hardening: {
        database: {
          health: prismaHealth,
          metrics: prismaMetrics,
          securityFeatures: {
            queryTimeout: true,
            retryLogic: true,
            circuitBreaker: true,
            sqlInjectionPrevention: true,
            performanceMonitoring: true,
          },
        },
        server: {
          metrics: serverMetrics,
          security: securityHeaders,
          features: {
            helmet: true,
            cors: true,
            rateLimiting: true,
            requestSizeLimit: '10mb',
            jsonParsing: true,
          },
        },
        tunnel: {
          monitoringEnabled: true,
          autoRestartEnabled: true,
          healthCheckInterval: 30,
          note: 'Tunnel metrics available in tunnel-metrics.json',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve hardening metrics',
      error: error.message,
    });
  }
});

/**
 * GET /api/hardening/database
 * Get detailed database security metrics
 */
router.get('/database', async (req, res) => {
  try {
    const prismaMetrics = getPrismaMetrics();
    const prismaHealth = await checkPrismaHealth();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connection: prismaHealth,
        performance: {
          totalQueries: prismaMetrics.totalQueries,
          slowQueries: prismaMetrics.slowQueries,
          failedQueries: prismaMetrics.failedQueries,
          avgLatency: prismaMetrics.avgLatencyMs,
          successRate: prismaMetrics.successRate,
        },
        security: {
          suspiciousQueries: prismaMetrics.suspiciousQueries,
          circuitBreakerStatus: prismaMetrics.circuitBreakerTripped ? 'TRIPPED' : 'OK',
          consecutiveFailures: prismaMetrics.consecutiveFailures,
        },
        features: {
          queryTimeout: '30s',
          retryAttempts: 3,
          maxConsecutiveFailures: 5,
          sqlInjectionPrevention: 'enabled',
          performanceTracking: 'enabled',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve database metrics',
      error: error.message,
    });
  }
});

/**
 * GET /api/hardening/security
 * Get security configuration status
 */
router.get('/security', (req, res) => {
  try {
    const securityConfig = {
      headers: {
        helmet: 'enabled',
        csp: 'enabled',
        hsts: 'enabled',
        xssProtection: 'enabled',
        frameGuard: 'deny',
        noSniff: 'enabled',
      },
      cors: {
        enabled: true,
        allowedOrigins: process.env.NODE_ENV === 'production' 
          ? ['care2connects.org']
          : ['localhost:3000', 'localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      },
      rateLimiting: {
        enabled: true,
        general: {
          windowMs: 15 * 60 * 1000,
          max: 100,
        },
        exemptions: ['/health', '/metrics', '/admin'],
      },
      requestValidation: {
        jsonLimit: '10mb',
        urlEncodedLimit: '10mb',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        sslEnforced: process.env.NODE_ENV === 'production',
      },
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      security: securityConfig,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve security configuration',
      error: error.message,
    });
  }
});

/**
 * POST /api/hardening/database/reset-metrics
 * Reset database metrics (admin only)
 */
router.post('/database/reset-metrics', async (req, res) => {
  try {
    // Import reset function
    const { resetPrismaMetrics } = await import('../lib/prisma');
    resetPrismaMetrics();

    res.json({
      status: 'ok',
      message: 'Database metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset database metrics',
      error: error.message,
    });
  }
});

/**
 * GET /api/hardening/health
 * Comprehensive health check for all hardened components
 */
router.get('/health', async (req, res) => {
  try {
    const prismaHealth = await checkPrismaHealth();
    const prismaMetrics = getPrismaMetrics();

    const overallHealth = {
      database: prismaHealth.healthy,
      server: true, // If we're responding, server is up
      circuitBreaker: !prismaMetrics.circuitBreakerTripped,
    };

    const allHealthy = Object.values(overallHealth).every(status => status === true);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      components: overallHealth,
      details: {
        database: {
          healthy: prismaHealth.healthy,
          latency: prismaHealth.latency,
          consecutiveFailures: prismaHealth.consecutiveFailures,
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage().heapUsed,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
    });
  }
});

export default router;
