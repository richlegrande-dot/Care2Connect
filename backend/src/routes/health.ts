import { Router, Request, Response } from "express";
import { healthMonitor } from "../monitoring/healthMonitor";
import { getHealthScheduler } from "../utils/healthCheckScheduler";
import { healthCheckRunner } from "../ops/healthCheckRunner";
import { incidentStore } from "../ops/incidentStore";
import { getEnvProof } from "../utils/envProof";

const router = Router();

/**
 * Extract database host from connection string (for logging only)
 */
function extractDbHost(dbUrl: string): string {
  try {
    const match = dbUrl.match(/@([^:\/]+)/);
    return match ? match[1] : "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * GET /health/live
 * Liveness probe - returns 200 if server process is running
 */
router.get("/live", (req: Request, res: Response) => {
  const configuredPort = process.env.PORT || "3001";
  const actualPort = (req.socket.localPort || "").toString();
  const portMismatch = actualPort && actualPort !== configuredPort;

  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
    port: {
      configured: configuredPort,
      actual: actualPort || configuredPort,
      mismatch: portMismatch,
    },
    warning: portMismatch
      ? "Server is running on a different port than configured"
      : undefined,
    message: "Server is running and accepting connections",
  });
});

/**
 * GET /health/db
 * Database health check - returns 200 if database is accessible
 */
router.get("/db", async (req: Request, res: Response) => {
  try {
    const { prisma } = require("../utils/database");

    // Quick database ping
    await prisma.$queryRaw`SELECT 1 as test`;

    res.status(200).json({
      ready: true,
      message: "Database is accessible",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Health] Database check failed:", error.message);

    res.status(503).json({
      ready: false,
      message: "Database is not accessible",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/*
 * DEPRECATED: First /status endpoint that used healthCheckRunner
 * Commented out to avoid conflict with simpler healthMonitor-based endpoint below
 * 
 * GET /health/status
 * Comprehensive health status with service monitoring
 
router.get('/status', async (req: Request, res: Response) => {
  try {
    const healthResults = healthCheckRunner.getSanitizedResults();
    const openIncidents = await incidentStore.getOpenIncidents();
    
    // Get Speech Intelligence scheduler health
    let speechIntelligence: any = { enabled: false };
    if (process.env.SPEECH_TELEMETRY_ENABLED === 'true') {
      try {
        const { getSpeechIntelligenceScheduler } = require('../services/speechIntelligence');
        const scheduler = getSpeechIntelligenceScheduler();
        
        if (scheduler) {
          const health = scheduler.getSchedulerHealth();
          const lastResult = scheduler.getLastSmokeTestResult();
          
          speechIntelligence = {
            enabled: true,
            running: health.running,
            lastSmokeTestAt: health.lastSmokeTestAt,
            lastSmokeTestSuccess: health.lastSmokeTestSuccess,
            lastCleanupAt: health.lastCleanupAt,
            lastProfileComputeAt: health.lastProfileComputeAt,
            recentErrors: health.recentErrors,
            status: health.lastSmokeTestSuccess === false ? 'degraded' : 'healthy'
          };
        }
      } catch (error) {
        speechIntelligence = {
          enabled: true,
          error: 'Failed to get scheduler health',
          status: 'unknown'
        };
      }
    }
    
    // Only consider CRITICAL services for overall health status
    // Critical: prisma, assemblyai, stripe (core functionality)
    // Optional: openai (kept for GPT analysis), cloudflare API, tunnel (monitoring only), speech (nice-to-have)
    const criticalServices = ['prisma', 'assemblyai', 'stripe'];
    const criticalHealthy = Object.entries(healthResults)
      .filter(([service]) => criticalServices.includes(service))
      .every(([_, result]: [string, any]) => result.healthy);
    
    // Speech Intelligence smoke test is informational only - don't degrade system status
    // The smoke test validates end-to-end transcription which is nice-to-have monitoring
    // System can operate normally even if smoke tests fail
    const speechDegraded = false; // Was: speechIntelligence.status === 'degraded'
    
    // Extract database host for reporting (mask sensitive info)
    const dbHost = process.env.DATABASE_URL 
      ? extractDbHost(process.env.DATABASE_URL)
      : 'not configured';
    
    res.status(200).json({
      ok: true,
      status: (criticalHealthy && !speechDegraded) ? 'healthy' : 'degraded',
      server: {
        alive: true,
        uptime: process.uptime(),
        pid: process.pid,
        port: process.env.PORT || '3001'
      },
      database: {
        mode: process.env.DB_MODE || 'not set',
        host: dbHost
      },
      services: healthResults,
      speechIntelligence,
      incidents: {
        open: openIncidents.length,
        total: (await incidentStore.getIncidents()).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Always return 200 for status endpoint - don't fail on monitoring errors
    res.status(200).json({
      ok: false,
      status: 'monitoring_unavailable',
      server: {
        alive: true,
        uptime: process.uptime(),
        pid: process.pid
      },
      error: 'Health monitoring system unavailable',
      timestamp: new Date().toISOString()
    });
  }
});
*/

/**
 * GET /health/test
 * Simple HTML page for browser testing
 */
router.get("/test", (req: Request, res: Response) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>CareConnect Server - Health Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; font-size: 24px; font-weight: bold; }
        .info { color: #666; margin: 10px 0; }
        .badge { background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✅ CareConnect Backend Server</div>
        <div class="info">🚀 Status: <span class="badge">ONLINE</span></div>
        <div class="info">📊 Process ID: ${process.pid}</div>
        <div class="info">⏱️ Uptime: ${Math.round(process.uptime())} seconds</div>
        <div class="info">🌐 Port: ${process.env.PORT || "3002"}</div>
        <div class="info">📅 Timestamp: ${new Date().toISOString()}</div>
        <div class="info">🎯 Ready for Stripe webhook creation!</div>
        <hr style="margin: 20px 0;">
        <div class="info">
            <strong>Webhook URL:</strong><br>
            <code>https://[your-tunnel-domain]/api/payments/stripe-webhook</code>
        </div>
    </div>
</body>
</html>`;

  res.status(200).send(html);
});

/**
 * GET /health/ready
 * Readiness probe - returns 200 if server is ready to handle requests
 * Returns degraded status if non-critical services are down
 */
router.get("/ready", async (req: Request, res: Response) => {
  try {
    const snapshot = await healthMonitor.performHealthCheck();

    // Readiness requires both core services OK and integrity indicating readiness
    const integrityReady = snapshot?.integrity?.ready === true;
    const isReady = snapshot?.ok === true && integrityReady;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? "ready" : "not_ready",
      integrity: snapshot?.integrity || null,
      connectedSince: snapshot?.connectedSince || {},
      degraded: snapshot?.degraded?.enabled ?? false,
      timestamp: snapshot?.timestamp || new Date().toISOString(),
      services: {
        database: snapshot?.services?.db?.ok ?? false,
        storage: snapshot?.services?.storage?.ok ?? false,
      },
      degradedReasons: snapshot?.degraded?.reasons || [],
    });
  } catch (error: any) {
    res.status(503).json({
      status: "not_ready",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/status
 * Full health status with all subsystems
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const snapshot = await healthMonitor.performHealthCheck();
    res.status(200).json(snapshot);
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/status
 * Returns comprehensive health status including integration checks
 * Always returns 200 (liveness) with detailed status information
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    // Get current health check results
    const scheduler = getHealthScheduler();
    const healthStatus = scheduler.getLastStatus();

    // Get legacy health monitor results
    const legacySnapshot = await healthMonitor.performHealthCheck();

    // Get env proof
    const envProof = getEnvProof([
      "DATABASE_URL",
      "OPENAI_API_KEY",
      "ASSEMBLYAI_API_KEY",
    ]);

    // Combine results
    const response = {
      ok: healthStatus?.overall ?? true, // Default to true if no checks run yet
      status: healthStatus?.overall ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      envProof,

      // Integration health checks
      integrations: healthStatus
        ? {
            overall: healthStatus.overall,
            services: healthStatus.services.map((s) => ({
              service: s.service,
              healthy: s.healthy,
              latency: s.latency,
              lastCheck: s.lastCheck,
              error: s.error,
            })),
            lastRun: healthStatus.lastRun,
          }
        : {
            overall: true,
            services: [],
            message: "No health checks run yet",
          },

      // Legacy monitoring (for backward compatibility)
      legacy: {
        integrity: legacySnapshot?.integrity || null,
        connectedSince: legacySnapshot?.connectedSince || {},
        degraded: legacySnapshot?.degraded?.enabled ?? false,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    // Always return 200 for liveness, but indicate error in response
    res.status(200).json({
      ok: false,
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
});

/**
 * GET /health/history
 * Returns health check history from database (graph-ready format)
 */
router.get("/history", async (req: Request, res: Response) => {
  const { prisma } = require("../utils/database");

  try {
    const windowParam = (req.query.window as string) || "24h";
    const limitParam = parseInt(req.query.limit as string) || 100;

    // Parse window parameter (e.g., "24h", "7d", "30d")
    let hoursBack = 24;
    const windowMatch = windowParam.match(/^(\d+)([hd])$/);
    if (windowMatch) {
      const value = parseInt(windowMatch[1]);
      const unit = windowMatch[2];
      hoursBack = unit === "h" ? value : value * 24;
    }

    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const healthChecks = await prisma.healthCheckRun.findMany({
      where: {
        createdAt: {
          gte: startTime,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limitParam,
    });

    // Transform for graph rendering
    const systemSeries = healthChecks.map((check: any) => ({
      timestamp: check.createdAt,
      status: check.status,
      latency: check.latency,
      cpuUsage: check.cpuUsage,
      memoryUsage: check.memoryUsage,
      eventLoopDelay: check.eventLoopDelay,
    }));

    // Extract service-specific data
    const serviceSeries: any = {};
    for (const check of healthChecks) {
      const checks = check.checks as any;
      if (checks && typeof checks === "object") {
        Object.entries(checks).forEach(([service, result]: [string, any]) => {
          if (!serviceSeries[service]) {
            serviceSeries[service] = [];
          }
          serviceSeries[service].push({
            timestamp: check.createdAt,
            healthy: result.ok || false,
            latency: result.latency || null,
            error: result.error || null,
          });
        });
      }
    }

    res.status(200).json({
      window: windowParam,
      startTime,
      endTime: new Date(),
      count: healthChecks.length,
      systemSeries,
      serviceSeries,
      summary: {
        totalChecks: healthChecks.length,
        healthyChecks: healthChecks.filter((c: any) => c.status === "healthy")
          .length,
        degradedChecks: healthChecks.filter((c: any) => c.status === "degraded")
          .length,
        avgLatency:
          healthChecks.length > 0
            ? healthChecks.reduce(
                (sum: number, c: any) => sum + (c.latency || 0),
                0,
              ) / healthChecks.length
            : 0,
      },
    });
  } catch (error) {
    res.status(200).json({
      error: "Failed to retrieve health history",
      details: error instanceof Error ? error.message : String(error),
      fallback: "Using in-memory history",
      memory: healthMonitor.getHistory(
        parseInt(req.query.limit as string) || 50,
      ),
    });
  }
});

/**
 * GET /health/speech-smoke-test
 * Returns latest Speech Intelligence smoke test results
 * Includes EVTS-first strategy details (engineUsed, fallbackUsed)
 */
router.get("/speech-smoke-test", (req: Request, res: Response) => {
  try {
    const {
      getSpeechIntelligenceScheduler,
    } = require("../services/speechIntelligence");
    const scheduler = getSpeechIntelligenceScheduler();

    if (!scheduler) {
      return res.status(200).json({
        enabled: false,
        message: "Speech Intelligence scheduler not running",
        hint: "Check SPEECH_TELEMETRY_ENABLED environment variable",
      });
    }

    const lastResult = scheduler.getLastSmokeTestResult();
    const health = scheduler.getSchedulerHealth();

    if (!lastResult) {
      return res.status(200).json({
        enabled: true,
        status: "pending",
        message: "No smoke test has run yet",
        nextRunEstimate: "Within 6 hours of scheduler start (default interval)",
        intervalHours: parseInt(process.env.SPEECH_SMOKE_INTERVAL_HOURS || "6"),
      });
    }

    res.status(200).json({
      enabled: true,
      success: lastResult.success,
      timestamp: lastResult.timestamp,
      duration: lastResult.duration,
      tests: lastResult.tests,
      sessionId: lastResult.sessionId,
      engineAttempted: lastResult.engineAttempted,
      engineUsed: lastResult.engineUsed,
      fallbackUsed: lastResult.fallbackUsed,
      latencyMs: lastResult.latencyMs,
      detectedLanguage: lastResult.detectedLanguage,
      wordCount: lastResult.wordCount,
      schedulerHealth: {
        running: health.running,
        recentErrors: health.recentErrors,
      },
      config: {
        intervalHours: parseInt(process.env.SPEECH_SMOKE_INTERVAL_HOURS || "6"),
        preferEVTS: process.env.SPEECH_SMOKE_PREFER_EVTS !== "false",
        fallbackOpenAI: process.env.SPEECH_SMOKE_FALLBACK_OPENAI !== "false",
      },
    });
  } catch (error) {
    res.status(200).json({
      enabled: false,
      error: "Failed to retrieve smoke test results",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /health/dns
 * DNS validation endpoint - reports expected vs actual hostnames
 */
router.get("/dns", (req: Request, res: Response) => {
  const expectedHostnames = [
    "care2connects.org",
    "www.care2connects.org",
    "api.care2connects.org",
  ];

  const tunnelId =
    process.env.CLOUDFLARE_TUNNEL_ID || "07e7c160-451b-4d41-875c-a58f79700ae8";
  const tunnelHostname = `${tunnelId}.cfargotunnel.com`;

  const currentHostname = req.hostname || req.get("host") || "localhost";
  const baseUrl = `${req.protocol}://${currentHostname}`;

  // Check if Cloudflare config is consistent
  const hasCloudflareToken = !!process.env.CLOUDFLARE_API_TOKEN;
  const hasTunnelId = !!process.env.CLOUDFLARE_TUNNEL_ID;

  res.status(200).json({
    status: "dns_validation",
    expected: {
      hostnames: expectedHostnames,
      tunnelTarget: tunnelHostname,
      recordType: "CNAME",
      proxyEnabled: true,
    },
    current: {
      hostname: currentHostname,
      baseUrl,
      requestHeaders: {
        host: req.get("host"),
        "x-forwarded-host": req.get("x-forwarded-host"),
        "x-forwarded-proto": req.get("x-forwarded-proto"),
      },
    },
    cloudflareConfig: {
      tokenConfigured: hasCloudflareToken,
      tunnelIdConfigured: hasTunnelId,
      consistent: hasCloudflareToken && hasTunnelId,
    },
    note: "This endpoint cannot change nameservers. Manual registrar configuration required.",
    recommendation:
      currentHostname === "localhost"
        ? "Domain not reaching tunnel - check nameserver delegation at registrar"
        : "Domain routing through Cloudflare successfully",
  });
});

/**
 * GET /health/cloudflare
 * Cloudflare API health check
 */
router.get("/cloudflare", async (req: Request, res: Response) => {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const tunnelId = process.env.CLOUDFLARE_TUNNEL_ID;

  if (!token) {
    return res.status(200).json({
      healthy: false,
      error: "CLOUDFLARE_API_TOKEN not configured",
      recommendation: "Set CLOUDFLARE_API_TOKEN environment variable",
    });
  }

  try {
    const response = await fetch(
      "https://api.cloudflare.com/v4/user/tokens/verify",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(200).json({
        healthy: false,
        error: `Cloudflare API returned ${response.status}: ${response.statusText}`,
        details: error,
        recommendation:
          "Check if CLOUDFLARE_API_TOKEN is valid and has correct permissions",
      });
    }

    const data = (await response.json()) as any;

    res.status(200).json({
      healthy: true,
      tokenValid: data.success,
      tokenStatus: data.result?.status || "unknown",
      tunnelIdConfigured: !!tunnelId,
      message: "Cloudflare API connection successful",
    });
  } catch (error) {
    res.status(200).json({
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
      recommendation: "Check network connectivity to Cloudflare API",
    });
  }
});

/**
 * POST /health/recover
 * PHASE 6M HARDENING: Trigger auto-recovery for unhealthy services
 * Requires admin password
 */
router.post("/recover", async (req: Request, res: Response) => {
  // Check admin password
  const adminPassword = req.headers["x-admin-password"];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Admin password required",
    });
  }

  try {
    const { autoRecoveryService } = await import("../ops/autoRecoveryService");

    // Check if recovery is needed
    const needsRecovery = await autoRecoveryService.needsRecovery();

    if (!needsRecovery.needed) {
      return res.status(200).json({
        message: "All services healthy - no recovery needed",
        services: [],
        attempted: false,
      });
    }

    // Attempt recovery
    const result = await autoRecoveryService.attemptRecovery();

    res.status(200).json({
      message: "Recovery attempted",
      ...result,
      stats: autoRecoveryService.getRecoveryStats(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Recovery failed",
      message: error.message,
    });
  }
});

/**
 * GET /health/recovery-stats
 * PHASE 6M HARDENING: Get auto-recovery statistics
 */
router.get("/recovery-stats", async (req: Request, res: Response) => {
  try {
    const { autoRecoveryService } = await import("../ops/autoRecoveryService");

    const stats = autoRecoveryService.getRecoveryStats();
    const history = autoRecoveryService.getRecoveryHistory(20);
    const needsRecovery = await autoRecoveryService.needsRecovery();

    res.status(200).json({
      stats,
      history,
      needsRecovery,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to get recovery stats",
      message: error.message,
    });
  }
});

/**
 * GET /health/pm2-diagnostics
 * PM2 process manager diagnostics and health status
 */
router.get("/pm2-diagnostics", async (req: Request, res: Response) => {
  try {
    const { execSync } = require("child_process");
    const os = require("os");

    let pm2Status = { installed: false, processes: [], daemon: null };

    try {
      // Check if PM2 is installed
      const pm2Version = execSync("pm2 --version", {
        encoding: "utf8",
        timeout: 5000,
      }).trim();
      pm2Status.installed = true;

      // Get PM2 process list
      const pm2List = execSync("pm2 jlist", {
        encoding: "utf8",
        timeout: 5000,
      });
      const processes = JSON.parse(pm2List);

      pm2Status.processes = processes.map((p: any) => ({
        name: p.name,
        pid: p.pid,
        status: p.pm2_env?.status,
        uptime: p.pm2_env?.pm_uptime,
        restarts: p.pm2_env?.restart_time,
        memory: p.monit?.memory,
        cpu: p.monit?.cpu,
        pm_id: p.pm_id,
      }));

      // Get daemon info
      pm2Status.daemon = {
        version: pm2Version,
        processCount: processes.length,
        onlineCount: processes.filter(
          (p: any) => p.pm2_env?.status === "online",
        ).length,
        stoppedCount: processes.filter(
          (p: any) => p.pm2_env?.status === "stopped",
        ).length,
        errorCount: processes.filter(
          (p: any) => p.pm2_env?.status === "errored",
        ).length,
      };
    } catch (error: any) {
      pm2Status = {
        installed: false,
        processes: [],
        daemon: { error: error.message },
      };
    }

    // Check if current process is managed by PM2
    const isUnderPM2 = !!process.env.PM2_HOME;

    // Get Node.js info
    const nodeInfo = {
      version: process.version,
      platform: os.platform(),
      arch: os.arch(),
      pid: process.pid,
      uptime: process.uptime(),
      managedByPM2: isUnderPM2,
    };

    // Assess overall health
    let health = "unknown";
    let issues = [];

    if (!pm2Status.installed) {
      health = "error";
      issues.push("PM2 not installed or not accessible");
    } else if (pm2Status.daemon) {
      if (pm2Status.daemon.errorCount > 0) {
        health = "degraded";
        issues.push(`${pm2Status.daemon.errorCount} processes in error state`);
      } else if (pm2Status.daemon.stoppedCount > 0) {
        health = "degraded";
        issues.push(`${pm2Status.daemon.stoppedCount} processes stopped`);
      } else if (
        pm2Status.daemon.onlineCount === pm2Status.daemon.processCount
      ) {
        health = "healthy";
      } else {
        health = "warning";
        issues.push("Some processes not in expected state");
      }
    }

    res.status(200).json({
      health,
      issues,
      pm2: pm2Status,
      node: nodeInfo,
      recommendations:
        issues.length > 0
          ? [
              "Run: pm2 restart all",
              "Check: pm2 logs for error details",
              "Validate: \\scripts\\validate-pm2-config.ps1 -AutoFix",
            ]
          : [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to get PM2 diagnostics",
      message: error.message,
      recommendation: "PM2 may not be installed. Run: npm install -g pm2",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
