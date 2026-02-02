/**
 * Phase 5: Monitoring and Analytics Routes
 * 
 * Provides endpoints for system observability and metrics dashboard
 */

import { Router, Request, Response } from 'express';
import { TelemetryCollector } from '../services/telemetry';

const router = Router();

/**
 * GET /api/monitoring/dashboard
 * Get aggregated metrics for monitoring dashboard
 */
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const telemetry = TelemetryCollector.getInstance();
    const metrics = telemetry.getDashboardMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MONITORING_ERROR] Failed to get dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/health
 * Health check endpoint for load balancers and monitoring
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const telemetry = TelemetryCollector.getInstance();
    const health = telemetry.getHealthStatus();
    
    const statusCode = health.status === 'healthy' ? 200 :
                      health.status === 'warning' ? 200 :
                      503; // Service Unavailable for critical
    
    res.status(statusCode).json({
      status: health.status,
      checks: health.checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('[HEALTH_CHECK_ERROR] Failed to get health status:', error);
    res.status(503).json({
      status: 'critical',
      error: 'Health check system failure',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/metrics/prometheus
 * Export metrics in Prometheus format for external monitoring
 */
router.get('/metrics/prometheus', (req: Request, res: Response) => {
  try {
    const telemetry = TelemetryCollector.getInstance();
    const prometheusMetrics = telemetry.exportPrometheusMetrics();
    
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(prometheusMetrics);
  } catch (error) {
    console.error('[PROMETHEUS_ERROR] Failed to export Prometheus metrics:', error);
    res.status(500).send('# ERROR: Failed to generate metrics\n');
  }
});

/**
 * GET /api/monitoring/performance
 * Get detailed performance metrics for analysis
 */
router.get('/performance', (req: Request, res: Response) => {
  try {
    const telemetry = TelemetryCollector.getInstance();
    const dashboard = telemetry.getDashboardMetrics();
    
    // Add system performance details
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const performanceData = {
      processing: {
        parsing: {
          totalExtractions: dashboard.parsing.totalExtractions,
          averageConfidence: dashboard.parsing.averageConfidence,
          fallbackRate: dashboard.parsing.fallbackRate
        },
        documents: {
          totalGenerated: dashboard.documents.totalGenerated,
          averageGenerationTime: dashboard.documents.averageGenerationTime,
          fallbackRate: dashboard.documents.fallbackRate
        }
      },
      system: {
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024) // MB
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      },
      cache: {
        effectiveness: dashboard.system.cacheEffectiveness
      }
    };
    
    res.json({
      success: true,
      data: performanceData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[PERFORMANCE_ERROR] Failed to get performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/monitoring/quality
 * Get parsing quality distribution and trends
 */
router.get('/quality', (req: Request, res: Response) => {
  try {
    const telemetry = TelemetryCollector.getInstance();
    const dashboard = telemetry.getDashboardMetrics();
    
    const qualityData = {
      overall: {
        averageConfidence: dashboard.parsing.averageConfidence,
        totalExtractions: dashboard.parsing.totalExtractions
      },
      distribution: dashboard.parsing.qualityDistribution,
      fallback: {
        parsingFallbackRate: dashboard.parsing.fallbackRate,
        documentFallbackRate: dashboard.documents.fallbackRate
      },
      thresholds: {
        excellent: '≥ 80%',
        good: '60% - 79%',
        poor: '< 60%'
      }
    };
    
    res.json({
      success: true,
      data: qualityData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[QUALITY_ERROR] Failed to get quality metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve quality data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/monitoring/alerts/test
 * Test alert system (development/testing only)
 */
router.post('/alerts/test', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Alert testing not available in production'
    });
  }
  
  try {
    const { alertType } = req.body;
    
    // Simulate different alert conditions
    switch (alertType) {
      case 'memory':
        console.warn('[TEST_ALERT] Memory usage alert triggered');
        break;
      case 'error_rate':
        console.error('[TEST_ALERT] High error rate alert triggered');
        break;
      case 'latency':
        console.warn('[TEST_ALERT] High latency alert triggered');
        break;
      default:
        console.log('[TEST_ALERT] Generic test alert triggered');
    }
    
    res.json({
      success: true,
      message: `Test alert '${alertType || 'generic'}' triggered successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ALERT_TEST_ERROR] Failed to trigger test alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger test alert'
    });
  }
});

export default router;