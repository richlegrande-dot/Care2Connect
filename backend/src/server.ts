// PRODUCTION HARDENING: Early environment bootstrapping
// Inline bootstrap to avoid ESM/CommonJS loader conflicts
import path from "path";
const envProof = require("./utils/envProof").default;
const envPath = path.resolve(__dirname, "..", ".env");
const loaded = envProof.loadDotenvFile(envPath);
console.log(
  `[startup] dotenv loaded: ${loaded.loaded ? "yes" : "no"} path=${loaded.path} parsed=${loaded.parsed ? Object.keys(loaded.parsed).length : 0}`,
);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Boot configuration and banner
import {
  getBootConfig,
  printBootBanner,
  validateBootConfig,
} from "./utils/bootConfig";

// Correlation ID middleware for distributed tracing
import { correlationIdMiddleware } from "./middleware/correlationId";

// PRODUCTION HARDENING: Port configuration and validation
import {
  validatePorts,
  logPortConfiguration,
  getPortConfig,
} from "./config/runtimePorts";

// PRODUCTION HARDENING: Configuration validation and startup logging
import {
  validateConfiguration,
  logStartupConfigSummary,
} from "./config/configValidation";

// Initialize environment validation and health monitoring
import { validateEnvironment, logEnvironmentStatus } from "./config/envSchema";
import { getEnvConfig } from "./utils/envSchema";
import { healthCheckRunner } from "./ops/healthCheckRunner";
import { initializeHealthScheduler } from "./utils/healthCheckScheduler";

// Print structured boot banner FIRST
const bootConfig = getBootConfig();
printBootBanner(bootConfig);

// Validate boot configuration
const bootValidation = validateBootConfig(bootConfig);
if (!bootValidation.valid) {
  console.error("❌ [BOOT] Configuration validation failed:");
  bootValidation.errors.forEach((err) => console.error(`   - ${err}`));
  if (bootConfig.runMode === "prod" || bootConfig.v1Stable) {
    console.error(
      "🚨 [BOOT] Cannot start in prod/V1 mode with invalid configuration",
    );
    process.exit(1);
  } else {
    console.warn("⚠️  [BOOT] Proceeding in dev mode despite validation errors");
  }
}

// Log environment status on startup
logEnvironmentStatus();

// **PRODUCTION HARDENING: Environment validation with fail-fast behavior**
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.error(
    "❌ [STARTUP] Environment validation FAILED:",
    envValidation.errors,
  );

  // FAIL-FAST: Critical environment issues block startup in production
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.V1_STABLE === "true";
  if (isProduction) {
    console.error(
      "🚨 [STARTUP] PRODUCTION MODE: Cannot start with environment validation errors",
    );
    console.error(
      "🔧 [STARTUP] IMMEDIATE ACTION: Fix environment configuration before restart",
    );
    process.exit(1);
  } else {
    console.warn(
      "⚠️  [STARTUP] Development mode: Continuing despite environment validation errors",
    );
  }
}

// **PRODUCTION HARDENING: Configuration drift immunity validation**
console.log("🔍 [STARTUP] Validating configuration consistency...");
// TEMPORARY: Commented out top-level await to fix startup - will be moved to async wrapper
/*
try {
  // Validate critical configuration consistency
  const configValidation = await import('./config/configDriftValidation');
  const driftCheck = await configValidation.validateConfigDrift();
  
  if (!driftCheck.valid) {
    console.error('❌ [STARTUP] Configuration drift detected:', driftCheck.issues);
    
    const criticalIssues = driftCheck.issues.filter((issue: any) => issue.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      console.error('🚨 [STARTUP] CRITICAL configuration drift - cannot continue');
      criticalIssues.forEach((issue: any) => {
        console.error(`   - ${issue.component}: ${issue.message}`);
      });
      process.exit(1);
    } else {
      console.warn('⚠️  [STARTUP] Non-critical configuration drift detected, proceeding...');
      driftCheck.issues.forEach((issue: any) => {
        console.warn(`   - ${issue.component}: ${issue.message}`);
      });
    }
  } else {
    console.log('✅ [STARTUP] Configuration consistency validated');
  }
} catch (error) {
  console.warn('⚠️  [STARTUP] Configuration drift validation failed:', error);
  // Don't block startup if drift validation itself fails
}
*/
console.log(
  "⚠️  [STARTUP] Config drift validation temporarily disabled for startup fix",
);

// Production invariant: Hard failure enforcement
if (!envValidation.isValid) {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.V1_STABLE === "true";

  if (isProduction) {
    console.error(
      "🚨 [STARTUP] Cannot start in production mode with invalid environment",
    );
    console.error("   Fix environment configuration and restart");
    process.exit(1);
  } else {
    console.warn(
      "⚠️  [STARTUP] Proceeding in dev mode despite validation errors",
    );
  }
}
if (envValidation.warnings.length > 0) {
  console.log("[STARTUP] Environment warnings:", envValidation.warnings);
  console.log("[STARTUP] Server will run in demo mode for missing services");
}

// Import routes
import authRoutes from "./routes/auth";
import transcribeRoutes from "./routes/transcribe";
import transcriptionRoutes from "./routes/transcription";
import qrDonationRoutes from "./routes/qrDonations";
import exportRoutes from "./routes/exports";
import profileRoutes from "./routes/profile";
import profilesRoutes from "./routes/profiles"; // Phase 6: Profile search + admin reset
import chatRoutes from "./routes/chat";
import jobRoutes from "./routes/jobs";
import resourceRoutes from "./routes/resources";
import donationRoutes from "./routes/donations";
import manualDraftRoutes from "./routes/manualDraft";

// Funding Wizard routes
import qrRoutes from "./routes/qr";
import exportWordRoutes from "./routes/export";
import analysisRoutes from "./routes/analysis";
import supportTicketRoutes from "./routes/supportTickets";
import ticketsRoutes from "./routes/tickets"; // Phase 6: RecordingTicket CRUD
import supportRoutes from "./routes/support"; // Phase 6N: Public support tickets
import profileSearchRoutes from "./routes/profileSearch"; // Phase 6N: Profile search

// Stripe webhook routes
import stripeWebhookRoutes from "./routes/stripe-webhook";

// Test routes (dev-only)
import stripeWebhookTestRoutes from "./routes/stripe-webhook-test";
import dbFailureTestRoutes from "./routes/db-failure-test";

// Knowledge Vault Admin routes (Phase 6M)
import adminKnowledgeRoutes from "./routes/admin/knowledge";

// PRODUCTION HARDENING: Operations and readiness routes
import opsRoutes from "./routes/ops";
import adminAuditRoutes from "./routes/admin/audit";
import adminDbRoutes from "./routes/admin/db";

// Health and admin routes
import healthRoutes from "./routes/health";
import opsAdminRoutes from "./routes/adminOps";
import healthDashboardRoutes from "./routes/health-dashboard";
import adminRoutes from "./routes/admin";
import demoRoutes from "./routes/demo";
import metricsRoutes from "./routes/metrics";
import systemAdminRoutes from "./routes/systemAdmin";
import errorReportingRoutes from "./routes/errorReporting";
import tunnelSetupRoutes from "./routes/admin/setup/tunnel";
import hardeningMetricsRoutes from "./routes/hardening-metrics";

// V2 Intake routes (gated by ENABLE_V2_INTAKE)
import intakeV2Routes from "./intake/v2/routes/intakeV2";
import providerRoutes from "./intake/v2/routes/providerRoutes";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./utils/database";

// Import monitoring
import { healthMonitor } from "./monitoring/healthMonitor";
import { selfHealing } from "./monitoring/selfHealing";
import { integrityValidator } from "./monitoring/integrityValidator";
import { alertManager } from "./monitoring/alertManager";
import { demoSafeMode } from "./monitoring/demoSafeMode";
import { metricsCollector } from "./monitoring/metricsCollector";
import { integrityManager } from "./services/integrity/featureIntegrity";
import { checkDatabaseStartup } from "./utils/dbStartupCheck";

// Import database hardening (Phase 6L)
import { runStartupGate, DatabaseWatchdog } from "./utils/dbStartupGate";
import { createDbReadyMiddleware } from "./middleware/dbReadyCheck";

// Import background services manager (Phase 1: Startup hardening)
import {
  backgroundServices,
  startBackgroundServices,
  shouldStartBackgroundServices,
} from "./utils/backgroundServices";
import {
  preflightPortCheck,
  printPortConfig,
  validatePortConsistency,
} from "./utils/portConfig";

// Import AI provider abstraction (V1 Zero-OpenAI Mode)
import {
  getAIProvider,
  isAIProviderAvailable,
  getProviderConfig,
} from "./providers/ai";
import {
  getTranscriptionProvider,
  isTranscriptionProviderAvailable,
  getTranscriptionProviderConfig,
} from "./providers/transcription";

// dotenv already loaded at module top

// Manual API key confirmation guard — WARN but do NOT exit. Server must boot even
// if real keys present. This avoids blocking the startup critical path.
if (process.env.NODE_ENV !== "test") {
  const KEYS_MANUAL_CONFIRM = process.env.KEYS_MANUAL_CONFIRM ?? "true";
  if (KEYS_MANUAL_CONFIRM === "true") {
    const suspiciousPattern = /placeholder|your_|xxxx|sk-placeholder/i;
    const candidateKeys: Array<{ name: string; value?: string }> = [
      { name: "OPENAI_API_KEY", value: process.env.OPENAI_API_KEY },
      { name: "STRIPE_SECRET_KEY", value: process.env.STRIPE_SECRET_KEY },
      {
        name: "STRIPE_PUBLISHABLE_KEY",
        value: process.env.STRIPE_PUBLISHABLE_KEY,
      },
      {
        name: "STRIPE_WEBHOOK_SECRET",
        value: process.env.STRIPE_WEBHOOK_SECRET,
      },
    ];

    const presentRealKeys = candidateKeys.filter(
      (k) => k.value && !suspiciousPattern.test(k.value),
    );
    if (presentRealKeys.length > 0 && process.env.KEYS_VALIDATED !== "true") {
      console.warn(
        "[KEYS VALIDATION NOTICE] Detected API keys present that appear real: " +
          presentRealKeys.map((k) => k.name).join(", "),
      );
      console.warn(
        "Server will still start. To remove this notice set KEYS_VALIDATED=true after reviewing backend/.env.",
      );
    }
  }
}

// Run startup integrity checks (skip automatic startup when running tests)
if (process.env.NODE_ENV !== "test") {
  (async () => {
    // Log AI provider configuration
    try {
      const aiConfig = getProviderConfig();
      const transcriptionConfig = getTranscriptionProviderConfig();

      console.log("[AI_MODE] ========================================");
      console.log(`[AI_MODE] AI Provider: ${aiConfig.aiProvider}`);
      console.log(
        `[AI_MODE] Story Analysis Mode: ${aiConfig.storyAnalysisMode}`,
      );
      console.log(
        `[AI_MODE] Transcription Provider: ${transcriptionConfig.provider}`,
      );
      console.log(
        `[AI_MODE] Stress Test Mode: ${aiConfig.enableStressTestMode ? "ENABLED" : "DISABLED"}`,
      );

      // Validate OpenAI not used in V1 mode
      if (aiConfig.aiProvider === "none" || aiConfig.aiProvider === "rules") {
        if (
          process.env.OPENAI_API_KEY &&
          !process.env.OPENAI_API_KEY.includes("placeholder")
        ) {
          console.warn(
            "[AI_MODE] ⚠️  OPENAI_API_KEY is set but AI_PROVIDER=" +
              aiConfig.aiProvider,
          );
          console.warn("[AI_MODE] ⚠️  OpenAI key will be IGNORED in V1 mode");
        }
        console.log(
          "[AI_MODE] ✅ OpenAI disabled - V1 rules/template mode active",
        );
      }

      // Initialize providers
      const aiProvider = getAIProvider();
      const transcriptionProvider = getTranscriptionProvider();

      console.log(`[AI_MODE] ✅ AI Provider initialized: ${aiProvider.name}`);
      console.log(
        `[AI_MODE] ✅ Transcription Provider initialized: ${transcriptionProvider.name}`,
      );
      console.log("[AI_MODE] ========================================");
    } catch (error) {
      console.error("[AI_MODE] ❌ Error initializing providers:", error);
      console.error(
        "[AI_MODE] Server will continue but AI features may not work",
      );
    }

    // Run integrity checks but do not exit the process here. Any blocking
    // decisions are handled by integrityManager.getStartupBehavior but we
    // avoid crashing the whole server for missing optional services.
    try {
      const result = await integrityValidator.validate();
      if (!result.passed) {
        console.warn(
          "Integrity check returned issues; server will continue in degraded mode",
        );
      }
    } catch (e) {
      const error = e as Error;
      console.warn(
        "Integrity validation failed to run:",
        error?.message || String(e),
      );
    }

    // Evaluate feature integrity startup behavior early and log, but do NOT exit
    try {
      const startup = integrityManager.getStartupBehavior();
      if (startup.shouldExit) {
        console.warn(
          "Startup behavior requests exit in strict mode:",
          startup.message,
        );
        console.warn(
          "Proceeding without exit to maintain non-blocking startup in this environment.",
        );
      }
    } catch (e) {
      const error = e as Error;
      console.warn(
        "IntegrityManager startup behavior check failed:",
        error?.message || String(e),
      );
    }
  })();
}

const app = express();

// Security middleware — use comprehensive helmetConfig with full CSP
import { helmetConfig, additionalSecurity } from "./config/helmet";
app.use(helmetConfig);
app.use(additionalSecurity);

// Correlation ID middleware for distributed tracing
app.use(correlationIdMiddleware);

// CORS configuration - allow both local and production domains
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  // Production care2connects.org domain
  "https://care2connects.org",
  "https://www.care2connects.org",
  "https://api.care2connects.org",
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

// Origin marker middleware (for deterministic routing verification)
app.use((req, res, next) => {
  res.setHeader("X-Care2-Origin", "backend");
  res.setHeader("X-Care2-Port", process.env.PORT || "3001");
  next();
});

// Metrics tracking middleware (before routes)
app.use(metricsCollector.trackRequest());

// Request performance tracking (per-route latency baseline)
import {
  requestPerformanceMiddleware,
  performanceMetricsHandler,
} from "./middleware/requestPerformance";
app.use(requestPerformanceMiddleware());

// Database watchdog will be managed by background services manager
const dbReadyCheck = (req: any, res: any, next: any) => {
  const dbWatchdog = backgroundServices.getDbWatchdog();
  if (!dbWatchdog) return next(); // During startup, allow through
  const middleware = createDbReadyMiddleware(dbWatchdog);
  return middleware(req, res, next);
};
app.use(dbReadyCheck);

// Rate limiting (exempt health, metrics, admin, and test endpoints)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  skip: (req) =>
    req.path.startsWith("/health") ||
    req.path.startsWith("/metrics") ||
    req.path.startsWith("/admin") || // Exempt admin portal (password-protected)
    req.headers["x-c2c-test"] === "1", // Exempt automated test traffic
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing middleware (for provider authentication)
app.use(cookieParser());

// Critical health endpoint - ALWAYS responds, even if other services are down
app.get("/health/live", (req, res) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
    port: process.env.PORT || "3001",
    message: "Server is running and accepting connections",
  });
});

// Production readiness endpoint - checks static asset routing through Caddy
app.get("/ops/health", async (req, res) => {
  const checks: {
    backend: { status: string; port: string };
    caddy: {
      status: string;
      tested: boolean;
      httpStatus?: number;
      error?: string;
    };
    frontend: {
      status: string;
      tested: boolean;
      mimeType?: string | null;
      httpStatus?: number;
    };
    tunnel: { status: string; tested: boolean };
  } = {
    backend: { status: "ok", port: process.env.PORT || "3001" },
    caddy: { status: "unknown", tested: false },
    frontend: { status: "unknown", tested: false },
    tunnel: { status: "unknown", tested: false },
  };

  try {
    // Check if Caddy is routing static assets correctly
    const proxyPort = 8080;
    const staticAssetPath = "/_next/static/chunks/webpack.js"; // Known Next.js asset

    const staticProbe = await fetch(
      `http://localhost:${proxyPort}${staticAssetPath}`,
      {
        headers: { Host: "care2connects.org" },
        signal: AbortSignal.timeout(3000),
      },
    );

    checks.frontend.tested = true;
    checks.frontend.status =
      staticProbe.ok &&
      staticProbe.headers.get("content-type")?.includes("javascript")
        ? "ok"
        : "degraded";
    checks.frontend.mimeType = staticProbe.headers.get("content-type");
    checks.frontend.httpStatus = staticProbe.status;

    // Check if Caddy is routing API correctly
    const apiProbe = await fetch(`http://localhost:${proxyPort}/health/live`, {
      headers: { Host: "api.care2connects.org" },
      signal: AbortSignal.timeout(3000),
    });

    checks.caddy.tested = true;
    checks.caddy.status =
      apiProbe.ok && apiProbe.headers.get("content-type")?.includes("json")
        ? "ok"
        : "degraded";
    checks.caddy.httpStatus = apiProbe.status;
  } catch (err: any) {
    checks.caddy.status = "error";
    checks.caddy.error = err.message;
  }

  // Overall status
  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const statusCode = allOk ? 200 : 503;

  res.status(statusCode).json({
    status: allOk ? "ready" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  });
});

// Database health endpoint (Phase 6L)
app.get("/health/db", async (req, res) => {
  try {
    // Direct database ping - works even when background services are disabled
    await prisma.$queryRaw`SELECT 1 as test`;

    res.status(200).json({
      ready: true,
      message: "Database is accessible",
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? "configured" : "missing",
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

// Logging
app.use(morgan("combined"));

// Health and admin routes (no /api prefix for standard health checks)
app.use("/health", healthRoutes);
app.use("/health", healthDashboardRoutes);

// PRODUCTION HARDENING: Operations and readiness endpoints
app.use("/ops", opsRoutes);
console.log("[Server] Production operations routes mounted at /ops");

app.use("/admin", adminRoutes);
app.use("/admin", systemAdminRoutes); // System admin endpoints
app.use("/admin/ops", opsAdminRoutes); // Operations monitoring
app.use(
  "/admin/speech-intelligence",
  require("./routes/admin/speechIntelligence").default,
); // Speech Intelligence admin
app.use("/admin/self-heal", require("./routes/admin/selfHeal").default); // Self-healing functionality

// Knowledge Vault Admin routes (Phase 6M)
app.use("/admin/knowledge", adminKnowledgeRoutes); // Knowledge Vault CRUD
app.use("/admin/knowledge/audit", adminAuditRoutes); // Audit log viewer
app.use("/admin/db", adminDbRoutes); // DB diagnostics and self-heal
console.log(
  "[Server] Knowledge Vault Admin routes mounted at /admin/knowledge, /admin/knowledge/audit, /admin/db",
);

// Pipeline Incidents Admin routes (Knowledge-Assisted Compute)
import adminIncidentsRoutes from "./routes/admin/incidents";
app.use("/admin/incidents", adminIncidentsRoutes); // Incident management
console.log(
  "[Server] Pipeline Incidents Admin routes mounted at /admin/incidents",
);

app.use("/demo", demoRoutes);
app.use("/metrics", metricsRoutes);
app.get("/metrics/performance", performanceMetricsHandler);
app.use("/errors", errorReportingRoutes); // Public error reporting

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/api/transcription", transcriptionRoutes);
app.use("/api/qr", qrDonationRoutes); // Full QR functionality with donations
app.use("/api/exports", exportRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/story", require("./routes/story").default); // Story recording pipeline
app.use("/api/chat", chatRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/donations", manualDraftRoutes); // Manual fallback routes

// Stripe webhook endpoint (must be before JSON body parser)
app.use("/api/payments", stripeWebhookRoutes);

// Test routes (dev-only)
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", stripeWebhookTestRoutes);
  app.use("/api/test", dbFailureTestRoutes);
  console.log("[Dev] Test endpoints enabled: /api/test/*");
}

// Funding Wizard API routes
// app.use('/api/qr', qrRoutes); // Basic QR - disabled in favor of qrDonations
app.use("/api/export", exportWordRoutes); // Word document export
app.use("/api/analysis", analysisRoutes); // Analysis data storage

// Phase 6: Donation Pipeline Routes
app.use("/api/tickets", ticketsRoutes); // RecordingTicket CRUD

// Phase 6N: Public Navigation + Profile Search + Donor Flow
app.use("/api/support", supportRoutes); // Public support ticket submission
app.use("/api/profiles", profileSearchRoutes); // Public profile search (find & donate)
app.use("/admin/profiles", profilesRoutes); // Profile admin (POST approve-reset)
app.use("/admin/support", supportTicketRoutes); // Support tickets (admin GET/PATCH)
app.use("/admin/setup/tunnel", tunnelSetupRoutes); // Cloudflare tunnel setup
console.log("[Phase 6N] Public site pages and profile flow endpoints mounted");

// Hardening Metrics API (security monitoring)
app.use("/api/hardening", hardeningMetricsRoutes);
console.log(
  "[Hardening] Security metrics endpoints mounted at /api/hardening/*",
);

// V2 Intake API (Coordinated Entry)
app.use("/api/v2/intake", intakeV2Routes);
if (process.env.ENABLE_V2_INTAKE === "true") {
  const {
    POLICY_PACK_VERSION,
    SCORING_ENGINE_VERSION,
  } = require("./intake/v2/constants");
  console.log(
    `[V2 INTAKE ENABLED] POLICY_PACK=${POLICY_PACK_VERSION} ENGINE=${SCORING_ENGINE_VERSION}`,
  );
} else {
  console.log("[V2 Intake] DISABLED — set ENABLE_V2_INTAKE=true to enable");
}

// V2 Provider Dashboard API (Staff Access)
app.use("/api/v2/provider", providerRoutes);
if (process.env.PROVIDER_DASHBOARD_TOKEN) {
  console.log("[V2 Provider Dashboard] Token authentication enabled");
} else {
  console.log(
    "[V2 Provider Dashboard] DISABLED — set PROVIDER_DASHBOARD_TOKEN to enable",
  );
}

// Root route: serve proper welcome page for browsers
app.get("/", (req, res) => {
  const host = req.get("host") || `localhost:${process.env.PORT || 3001}`;

  // For browsers, serve HTML; for API clients, redirect to status
  const userAgent = req.get("User-Agent") || "";
  const isApi = req.accepts("json") && !req.accepts("html");

  if (isApi || userAgent.includes("curl") || userAgent.includes("wget")) {
    res.redirect(`${req.protocol}://${host}/health/status`);
    return;
  }

  // Serve HTML welcome page for browsers
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>CareConnect System - Welcome</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 40px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container { 
          background: white; 
          padding: 40px; 
          border-radius: 12px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          max-width: 600px;
          text-align: center;
        }
        .header { color: #2c3e50; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 18px; margin-bottom: 30px; }
        .status { background: #27ae60; color: white; padding: 12px 20px; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 20px 0; }
        .info { color: #666; margin: 10px 0; display: flex; align-items: center; justify-content: space-between; }
        .info-label { font-weight: 600; }
        .info-value { 
          background: #f8f9fa; 
          padding: 4px 12px; 
          border-radius: 4px; 
          font-family: 'Courier New', monospace; 
          font-size: 14px;
        }
        .links { margin-top: 30px; }
        .link { 
          display: inline-block; 
          margin: 0 10px; 
          padding: 10px 20px; 
          background: #3498db; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          transition: background 0.3s;
        }
        .link:hover { background: #2980b9; }
        .webhook-info {
          background: #e8f5e8;
          border: 1px solid #27ae60;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .webhook-url {
          background: #f8f9fa;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">🚀 CareConnect Backend</div>
        <div class="subtitle">Healthcare Technology Platform</div>
        
        <div class="status">✅ System Online & Ready</div>
        
        <div class="info">
            <span class="info-label">Process ID:</span>
            <span class="info-value">${process.pid}</span>
        </div>
        
        <div class="info">
            <span class="info-label">Uptime:</span>
            <span class="info-value">${Math.round(process.uptime())}s</span>
        </div>
        
        <div class="info">
            <span class="info-label">Port:</span>
            <span class="info-value">${req.get("host")?.split(":")[1] || process.env.PORT || "3002"}</span>
        </div>
        
        <div class="info">
            <span class="info-label">Environment:</span>
            <span class="info-value">${process.env.NODE_ENV || "development"}</span>
        </div>
        
        <div class="webhook-info">
            <h3>🎯 Stripe Webhook Ready!</h3>
            <p><strong>Webhook Endpoint URL:</strong></p>
            <div class="webhook-url">
                https://[your-cloudflare-tunnel]/api/payments/stripe-webhook
            </div>
            <p><small>Use this URL when creating webhooks in your Stripe Dashboard</small></p>
        </div>
        
        <div class="links">
            <a href="/health/test" class="link">🏥 Health Check</a>
            <a href="/health/status" class="link">📊 Full Status</a>
            <a href="/api" class="link" onclick="alert('API endpoints require authentication'); return false;">🔧 API Docs</a>
        </div>
        
        <div style="margin-top: 30px; color: #999; font-size: 12px;">
            Version 1.0 • Last Updated: ${new Date().toISOString().split("T")[0]}
        </div>
    </div>
</body>
</html>`;

  res.status(200).send(html);
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

// Setup self-healing and error handlers
selfHealing.setupGracefulShutdown();
selfHealing.setupErrorHandlers();
selfHealing.startDatabaseMonitoring();

// Start server (with optional demo safe mode) — only auto-listen when not running tests
if (process.env.NODE_ENV !== "test") {
  (async () => {
    // **PHASE 6L: DATABASE STARTUP GATE**
    // Validate DATABASE_URL, test connection, verify schema integrity
    // Will exit(1) if database is unavailable or schema is invalid
    try {
      await runStartupGate(prisma);
    } catch (error: any) {
      console.error("🚨 DATABASE STARTUP GATE FAILED:", error.message);
      console.error("Server cannot start without valid database connection");
      process.exit(1);
    }

    // **PRODUCTION HARDENING: Configuration Validation and Logging**
    console.log("\n🔒 [HARDENING] Starting configuration validation...");
    const configValidation = validateConfiguration();

    // Log startup configuration summary (safe - no secrets)
    logStartupConfigSummary();

    if (!configValidation.valid) {
      console.error("🚨 [HARDENING] CRITICAL: Configuration validation failed");
      configValidation.errors.forEach((error) =>
        console.error(`   - ${error}`),
      );

      if (
        process.env.NODE_ENV === "production" ||
        process.env.STRICT_PORT_MODE === "true"
      ) {
        console.error(
          "🚨 [HARDENING] Cannot start in production/strict mode with invalid configuration",
        );
        process.exit(1);
      } else {
        console.warn(
          "⚠️  [HARDENING] Proceeding in flexible mode despite configuration errors",
        );
      }
    } else if (configValidation.warnings.length > 0) {
      console.warn(
        "⚠️  [HARDENING] Configuration warnings detected - review startup summary above",
      );
    } else {
      console.log("✅ [HARDENING] Configuration validation passed");
    }

    // **PRODUCTION HARDENING: Port Configuration and Validation**
    console.log("\n🔒 [HARDENING] Validating port configuration...");

    // FORCE STRICT MODE in production or when explicitly set
    const isProduction =
      process.env.NODE_ENV === "production" || process.env.V1_STABLE === "true";
    const portConfig = getPortConfig();
    if (isProduction) {
      portConfig.strictMode = true;
      console.log("🔒 [HARDENING] STRICT PORT MODE enforced for production");
    }

    logPortConfiguration(portConfig);

    // FAIL-FAST: Check port availability before attempting to bind
    console.log("🔍 [HARDENING] Checking port availability...");
    const portValidation = await validatePorts(portConfig);

    if (!portValidation.isValid) {
      console.error("❌ [HARDENING] Port conflicts detected:");
      portValidation.errors.forEach((error) => console.error(`   - ${error}`));

      if (portConfig.strictMode) {
        console.error(
          "🚨 [HARDENING] STRICT MODE: Cannot start with port conflicts",
        );
        process.exit(1);
      } else {
        console.warn(
          "⚠️  [HARDENING] Continuing in flexible mode (not recommended)",
        );
      }
    } else {
      console.log("✅ [HARDENING] All required ports are available");
    }

    // START BACKGROUND SERVICES (if enabled)
    // Includes: health scheduler, database watchdog, health monitor, tunnel ping
    if (shouldStartBackgroundServices()) {
      await startBackgroundServices(prisma);
    } else {
      console.log(
        "⏸️  Background services disabled (test/stable mode or explicit override)",
      );
    }

    const http = await import("http");

    // Use hardened port configuration - NO MORE PORT DRIFT
    const requestedPort = portConfig.backend;
    const strictPortMode =
      portConfig.strictMode || process.env.NODE_ENV === "production";
    const maxAttempts = strictPortMode
      ? 0
      : Number(process.env.PORT_FAILOVER_RANGE || 5);

    console.log(
      `🎯 [HARDENING] Backend will bind to port ${requestedPort} (strict=${strictPortMode})`,
    );

    const server = http.createServer(app);

    let boundPort: number | null = null;
    for (
      let attempt = 0;
      attempt <= (strictPortMode ? 0 : maxAttempts);
      attempt++
    ) {
      const tryPort = requestedPort + attempt;
      try {
        await new Promise<void>((resolve, reject) => {
          server.once("error", (err: any) => reject(err));
          server.once("listening", () => resolve());
          server.listen(tryPort, "0.0.0.0");
        });
        boundPort = tryPort;

        if (attempt > 0) {
          console.warn(
            `⚠️  WARNING: Bound to port ${tryPort} instead of requested ${requestedPort}`,
          );
          console.warn(
            `   Set STRICT_PORT_MODE=true to prevent port switching`,
          );
        }
        break;
      } catch (err: any) {
        if (err && (err.code === "EADDRINUSE" || err.code === "EACCES")) {
          if (strictPortMode) {
            console.error(`\n❌ CRITICAL: Could not bind to port ${tryPort}`);
            console.error("   ERROR CODE: " + err.code);

            // Try to get process information for actionable error
            const occupied = portValidation.occupiedPorts.find(
              (p) => p.port === tryPort,
            );
            if (occupied && occupied.pid) {
              console.error(
                `   OCCUPIED BY: PID ${occupied.pid}${occupied.process ? ` (${occupied.process})` : ""}`,
              );
              console.error(
                `   KILL COMMAND: taskkill /PID ${occupied.pid} /F`,
              );
            } else {
              console.error(
                `   CHECK USAGE: netstat -ano | findstr :${tryPort}`,
              );
            }

            console.error(
              "\n🚨 PRODUCTION HARDENING: Server cannot start with port conflicts.",
            );
            console.error("   Fix the port conflict and restart.");
            process.exit(1);
          }
          console.warn(`Port ${tryPort} unavailable, trying next port`);
          continue;
        }
        console.error("Failed to bind server:", err?.message || err);
        break;
      }
    }

    if (!boundPort) {
      console.error("Failed to bind to any port in range; aborting startup");
      process.exit(1);
    }

    // Log successful binding IMMEDIATELY
    console.log(
      `🚀 HTTP Server successfully bound and listening on http://localhost:${boundPort}`,
    );
    console.log(`✅ Process ID: ${process.pid}`);

    // Initialize health monitoring system
    if (envValidation.config.HEALTHCHECKS_ENABLED) {
      console.log("🏥 Starting health check scheduler...");
      const interval =
        (envValidation.config.HEALTHCHECKS_INTERVAL_SEC ?? 60) * 1000;

      // Run initial health check
      healthCheckRunner
        .runAllChecks()
        .then(() => {
          console.log("✅ Initial health checks completed");
        })
        .catch((error) => {
          console.warn("⚠️  Initial health checks had issues:", error.message);
        });

      // Schedule recurring health checks
      setInterval(async () => {
        try {
          await healthCheckRunner.runAllChecks();
        } catch (error) {
          console.warn("Health check error:", error);
        }
      }, interval);

      console.log(
        `✅ Health checks scheduled every ${envValidation.config.HEALTHCHECKS_INTERVAL_SEC}s`,
      );
    } else {
      console.log("📊 Health checks disabled (HEALTHCHECKS_ENABLED=false)");
    }

    // Add heartbeat to confirm server stays alive
    let startTime = Date.now();
    setInterval(() => {
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      console.log(
        `💗 Server alive on port ${boundPort} (PID: ${process.pid}) - uptime: ${uptime}s`,
      );
    }, 60000); // Every 60 seconds

    // Start Speech Intelligence scheduler if enabled
    if (process.env.SPEECH_TELEMETRY_ENABLED === "true") {
      try {
        const {
          startSpeechIntelligenceScheduler,
        } = require("./services/speechIntelligence");
        startSpeechIntelligenceScheduler();
        console.log("🎙️ Speech Intelligence scheduler started");
      } catch (error) {
        console.warn(
          "⚠️  Speech Intelligence scheduler failed to start:",
          error,
        );
      }
    }

    // Start periodic health monitoring after successful bind
    (async () => {
      try {
        // Targeted DB startup check using lazy prisma getter (non-blocking)
        const dbOk = await checkDatabaseStartup(prisma);
        await healthMonitor.logStartupBanner(boundPort);
        if (
          !dbOk &&
          (process.env.FEATURE_INTEGRITY_MODE || "demo").toLowerCase() ===
            "strict"
        ) {
          console.warn(
            "Database auth failed but server continues in degraded mode",
          );
        }

        if (backgroundServices.isRunning()) {
          const state = backgroundServices.getState();
          const activeServices = Object.entries(state)
            .filter(([_, active]) => active)
            .map(([name]) => name)
            .join(", ");
          console.log(`🔄 Background services: ${activeServices}`);
        }
      } catch (e) {
        const error = e as Error;
        console.warn(
          "Startup checks failed but server continues:",
          error?.message || String(e),
        );
        console.log(
          `\n🎯 Server is LIVE and accepting connections on http://localhost:${boundPort} (degraded mode)`,
        );
      }

      if (process.env.ALERT_MODE && process.env.ALERT_MODE !== "none") {
        console.log(
          `[ALERT] Alert system active: mode=${process.env.ALERT_MODE}`,
        );
      }
    })();

    // PRODUCTION HARDENING: Enhanced graceful shutdown handling
    let isShuttingDown = false;

    const gracefulShutdown = async (signal: string) => {
      if (isShuttingDown) {
        console.log(`[SHUTDOWN] Already shutting down, ignoring ${signal}`);
        return;
      }

      isShuttingDown = true;
      console.log(
        `[SHUTDOWN] Received ${signal}, starting graceful shutdown...`,
      );

      try {
        // 1. Stop accepting new connections
        server.close(() => {
          console.log(
            "[SHUTDOWN] HTTP server stopped accepting new connections",
          );
        });

        // 2. Stop background services
        if (backgroundServices.isRunning()) {
          console.log("[SHUTDOWN] Stopping background services...");
          backgroundServices.stop();
        }

        // 3. Close database connections
        console.log("[SHUTDOWN] Closing database connections...");
        await prisma.$disconnect();

        // 4. Close any other resources
        console.log("[SHUTDOWN] Cleanup completed successfully");
        process.exit(0);
      } catch (error) {
        console.error("[SHUTDOWN] Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    // Handle different termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

    // Handle uncaught exceptions and promise rejections
    process.on("uncaughtException", (error) => {
      console.error("[CRITICAL] Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error(
        "[CRITICAL] Unhandled Promise Rejection at:",
        promise,
        "reason:",
        reason,
      );
      gracefulShutdown("unhandledRejection");
    });
  })();
} else {
  // In test mode we export the express `app` without listening so Supertest can control the server lifecycle.
}

export default app;
