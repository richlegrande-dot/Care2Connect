/**
 * Admin Operations API Routes
 * Protected endpoints for system monitoring and incident management
 */

import express from "express";
import { incidentStore } from "../ops/incidentStore";
import { healthCheckRunner } from "../ops/healthCheckRunner";

const router = express.Router();

// GET /admin/ops/status - Get current system status
router.get("/status", async (req, res) => {
  try {
    const healthResults = healthCheckRunner.getSanitizedResults();
    const openIncidents = await incidentStore.getOpenIncidents();

    const status = {
      overall: Object.values(healthResults).every(
        (result: any) => result.healthy,
      ),
      services: healthResults,
      openIncidents: openIncidents.length,
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      ok: true,
      status,
    });
  } catch (error) {
    console.error("Error fetching ops status:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch system status",
    });
  }
});

// GET /admin/ops/incidents - Get incidents with optional status filter
router.get("/incidents", async (req, res) => {
  try {
    const { status } = req.query;
    const incidents = await incidentStore.getIncidents(status as any);

    // Sanitize incidents for frontend (remove potentially sensitive details)
    const sanitized = incidents.map((incident) => ({
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
      // Don't send raw lastCheckPayload to frontend
      hasCheckData: !!incident.lastCheckPayload,
    }));

    res.json({
      ok: true,
      incidents: sanitized,
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch incidents",
    });
  }
});

// POST /admin/ops/incidents/:id/resolve - Resolve an incident
router.post("/incidents/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const resolvedIncident = await incidentStore.resolveIncident(id);

    if (!resolvedIncident) {
      return res.status(404).json({
        ok: false,
        error: "Incident not found",
      });
    }

    res.json({
      ok: true,
      incident: {
        id: resolvedIncident.id,
        status: resolvedIncident.status,
        resolvedAt: resolvedIncident.resolvedAt,
      },
    });
  } catch (error) {
    console.error("Error resolving incident:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to resolve incident",
    });
  }
});

// POST /admin/ops/run-checks - Manually trigger health checks
router.post("/run-checks", async (req, res) => {
  try {
    const results = await healthCheckRunner.runAllChecks();
    const sanitized = healthCheckRunner.getSanitizedResults();

    res.json({
      ok: true,
      message: "Health checks completed",
      results: sanitized,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error running health checks:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to run health checks",
    });
  }
});

// GET /admin/ops/health-history - Get recent health check history
router.get("/health-history", async (req, res) => {
  try {
    const results = healthCheckRunner.getResults();
    const history: Record<string, any> = {};

    results.forEach((result, service) => {
      history[service] = {
        service,
        healthy: result.healthy,
        lastChecked: result.lastChecked,
        latency: result.latency,
        error: result.error,
      };
    });

    res.json({
      ok: true,
      history,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching health history:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch health history",
    });
  }
});

export default router;
