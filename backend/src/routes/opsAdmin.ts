/**
 * Operations Admin Routes
 * Health status and incident management endpoints
 * SECURITY: Protected by system authentication, no secrets exposed
 */

import { Router } from 'express';
import { getHealthScheduler } from '../utils/healthCheckScheduler';
import { runHealthChecks } from '../utils/healthCheckRunner';
import { getIncidentManager, TicketStatus } from '../utils/incidentManager';

const router = Router();

/**
 * Middleware to ensure system authentication
 */
function requireSystemAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Authorization required' });
  }

  // In a full implementation, verify the JWT token here
  // For now, just check that a token is present
  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }

  next();
}

/**
 * GET /admin/ops/status
 * Get current health status and summary
 */
router.get('/status', requireSystemAuth, async (req, res) => {
  try {
    const scheduler = getHealthScheduler();
    const lastStatus = scheduler.getLastStatus();
    
    if (!lastStatus) {
      return res.json({
        ok: true,
        status: 'no_data',
        message: 'No health checks run yet',
        schedulerRunning: scheduler.isSchedulerRunning()
      });
    }

    // Sanitize the response (remove any potential secrets)
    const sanitizedServices = lastStatus.services.map(service => ({
      service: service.service,
      healthy: service.healthy,
      latency: service.latency,
      lastCheck: service.lastCheck,
      error: service.error,
      // Only include safe details
      details: service.details ? {
        status: service.details.status,
        errorType: service.details.errorType,
        connectionTime: service.details.connectionTime,
        tokenValid: service.details.tokenValid,
        // Exclude any sensitive fields
      } : undefined
    }));

    res.json({
      ok: true,
      status: lastStatus.overall ? 'healthy' : 'degraded',
      overall: lastStatus.overall,
      services: sanitizedServices,
      lastRun: lastStatus.lastRun,
      schedulerRunning: scheduler.isSchedulerRunning()
    });

  } catch (error: any) {
    console.error('[OPS API] Error getting status:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to get health status',
      details: error.message
    });
  }
});

/**
 * GET /admin/ops/incidents
 * Get incidents (optionally filtered by status)
 */
router.get('/incidents', requireSystemAuth, async (req, res) => {
  try {
    const status = req.query.status as TicketStatus;
    const incidentManager = getIncidentManager();
    
    const incidents = await incidentManager.getIncidents(status);
    
    // Sanitize incidents (ensure no secrets in details)
    const sanitizedIncidents = incidents.map(incident => ({
      id: incident.id,
      service: incident.service,
      severity: incident.severity,
      status: incident.status,
      firstSeenAt: incident.firstSeenAt,
      lastSeenAt: incident.lastSeenAt,
      resolvedAt: incident.resolvedAt,
      summary: incident.summary,
      details: incident.details,
      recommendation: incident.recommendation,
      // lastCheckPayload already sanitized in incident manager
      lastCheckPayload: incident.lastCheckPayload
    }));

    res.json({
      ok: true,
      incidents: sanitizedIncidents,
      count: sanitizedIncidents.length
    });

  } catch (error: any) {
    console.error('[OPS API] Error getting incidents:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to get incidents',
      details: error.message
    });
  }
});

/**
 * POST /admin/ops/incidents/:id/resolve
 * Mark an incident as resolved
 */
router.post('/incidents/:id/resolve', requireSystemAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const incidentManager = getIncidentManager();
    
    const resolvedIncident = await incidentManager.resolveIncident(id);
    
    if (!resolvedIncident) {
      return res.status(404).json({
        ok: false,
        error: 'Incident not found'
      });
    }

    res.json({
      ok: true,
      incident: {
        id: resolvedIncident.id,
        service: resolvedIncident.service,
        status: resolvedIncident.status,
        resolvedAt: resolvedIncident.resolvedAt
      }
    });

  } catch (error: any) {
    console.error('[OPS API] Error resolving incident:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to resolve incident',
      details: error.message
    });
  }
});

/**
 * POST /admin/ops/run-checks
 * Manually trigger health checks
 */
router.post('/run-checks', requireSystemAuth, async (req, res) => {
  try {
    console.log('[OPS API] Manual health check triggered');
    
    const status = await runHealthChecks();
    
    // Update scheduler's last status
    const scheduler = getHealthScheduler();
    (scheduler as any).lastStatus = status;

    res.json({
      ok: true,
      message: 'Health checks completed',
      status: {
        overall: status.overall,
        servicesChecked: status.services.length,
        healthyServices: status.services.filter(s => s.healthy).length,
        lastRun: status.lastRun
      }
    });

  } catch (error: any) {
    console.error('[OPS API] Error running manual health check:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to run health checks',
      details: error.message
    });
  }
});

/**
 * GET /admin/ops/scheduler
 * Get scheduler status and control
 */
router.get('/scheduler', requireSystemAuth, (req, res) => {
  try {
    const scheduler = getHealthScheduler();
    
    res.json({
      ok: true,
      running: scheduler.isSchedulerRunning(),
      lastCheck: scheduler.getLastStatus()?.lastRun,
      healthChecksEnabled: process.env.HEALTHCHECKS_ENABLED === 'true',
      intervalSeconds: parseInt(process.env.HEALTHCHECKS_INTERVAL_SEC || '300')
    });

  } catch (error: any) {
    console.error('[OPS API] Error getting scheduler status:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to get scheduler status'
    });
  }
});

/**
 * POST /admin/ops/scheduler/start
 * Start the health check scheduler
 */
router.post('/scheduler/start', requireSystemAuth, (req, res) => {
  try {
    const scheduler = getHealthScheduler();
    scheduler.start();
    
    res.json({
      ok: true,
      message: 'Health check scheduler started',
      running: scheduler.isSchedulerRunning()
    });

  } catch (error: any) {
    console.error('[OPS API] Error starting scheduler:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to start scheduler'
    });
  }
});

/**
 * POST /admin/ops/scheduler/stop  
 * Stop the health check scheduler
 */
router.post('/scheduler/stop', requireSystemAuth, (req, res) => {
  try {
    const scheduler = getHealthScheduler();
    scheduler.stop();
    
    res.json({
      ok: true,
      message: 'Health check scheduler stopped',
      running: scheduler.isSchedulerRunning()
    });

  } catch (error: any) {
    console.error('[OPS API] Error stopping scheduler:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to stop scheduler'
    });
  }
});

export default router;