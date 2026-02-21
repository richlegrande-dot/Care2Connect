import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createSession } from "../services/adminSession";
import { systemAuthMiddleware } from "../middleware/systemAuth";
import { healthMonitor } from "../monitoring/healthMonitor";
import { promises as fs } from "fs";
import path from "path";
import { analyzeRootCause } from "../services/rootCause/rootCauseAnalyzer";
import { resolveStripeKeysFromEnv } from "../utils/stripeKeyDetector";
import { prisma } from "../utils/database";
import envProof from "../utils/envProof";

const router = Router();

/**
 * POST /admin/auth
 * Authenticate with system password and receive JWT token
 */
router.post("/auth", async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ ok: false, error: "Password is required" });
    }

    const correctPassword =
      process.env.SYSTEM_PANEL_PASSWORD || "blueberry:y22";

    if (password !== correctPassword) {
      // Log failed attempt
      console.warn(`[SYSTEM AUTH] Failed login attempt from ${req.ip}`);
      return res.status(401).json({ ok: false, error: "Invalid password" });
    }

    // If JWT secret exists, issue JWT; otherwise issue opaque server-side session token
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET;
    if (secret) {
      const token = jwt.sign({ type: "system-admin", ip: req.ip }, secret, {
        expiresIn: "30m",
      });
      console.log(`[SYSTEM AUTH] Successful login (JWT) from ${req.ip}`);
      return res.json({ ok: true, token, expiresIn: 1800 });
    }

    const token = createSession(30 * 60);
    console.log(
      `[SYSTEM AUTH] Successful login (session token) from ${req.ip}`,
    );
    return res.json({ ok: true, token, expiresIn: 1800 });
  } catch (error: any) {
    console.error("[SYSTEM AUTH] Error:", error);
    res.status(500).json({ ok: false, error: "Authentication failed" });
  }
});

/**
 * GET /admin/diagnostics/env
 * Return presence and safe fingerprints for critical env vars (no raw values)
 */
router.get(
  "/diagnostics/env",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const keys = [
        "OPENAI_API_KEY",
        "DATABASE_URL",
        "STRIPE_SECRET_KEY",
        "STRIPE_PUBLISHABLE_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "JWT_SECRET",
      ];
      const proof = envProof.getEnvProof(keys);
      res.json({ ok: true, proof });
    } catch (error: any) {
      console.error("[ENV DIAGNOSTICS] Error:", error);
      res
        .status(500)
        .json({ ok: false, error: "Failed to generate env diagnostics" });
    }
  },
);

/**
 * POST /admin/run-tests
 * Run safe integrity tests (not full Jest suite)
 */
router.post(
  "/run-tests",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const startedAt = new Date().toISOString();
      const results: Array<{
        name: string;
        ok: boolean;
        message?: string;
        duration?: number;
      }> = [];

      // Test 1: Storage directories writable
      const testStart1 = Date.now();
      try {
        const testDirs = [
          "data/support-tickets",
          "data/user-errors",
          "receipts",
          "uploads",
        ];
        for (const dir of testDirs) {
          const dirPath = path.join(process.cwd(), dir);
          await fs.mkdir(dirPath, { recursive: true });
          const testFile = path.join(dirPath, ".test-write");
          await fs.writeFile(testFile, "test");
          await fs.unlink(testFile);
        }
        results.push({
          name: "storageWritable",
          ok: true,
          duration: Date.now() - testStart1,
        });
      } catch (error: any) {
        results.push({
          name: "storageWritable",
          ok: false,
          message: error.message,
          duration: Date.now() - testStart1,
        });
      }

      // Test 2: Health endpoint ready
      const testStart2 = Date.now();
      try {
        const health = await healthMonitor.performHealthCheck();
        results.push({
          name: "healthReady",
          ok: health.status === "ready" || health.status === "degraded",
          message: health.status,
          duration: Date.now() - testStart2,
        });
      } catch (error: any) {
        results.push({
          name: "healthReady",
          ok: false,
          message: error.message,
          duration: Date.now() - testStart2,
        });
      }

      // Test 3: QR generation check
      const testStart3 = Date.now();
      try {
        const qrCode = await import("qrcode");
        const testQr = await qrCode.toDataURL("test-data");
        results.push({
          name: "qrGeneration",
          ok: testQr.startsWith("data:image"),
          duration: Date.now() - testStart3,
        });
      } catch (error: any) {
        results.push({
          name: "qrGeneration",
          ok: false,
          message: error.message,
          duration: Date.now() - testStart3,
        });
      }

      // Test 4: Word export check (basic)
      const testStart4 = Date.now();
      try {
        const docx = await import("docx");
        const doc = new docx.Document({ sections: [] });
        results.push({
          name: "wordExport",
          ok: true,
          duration: Date.now() - testStart4,
        });
      } catch (error: any) {
        results.push({
          name: "wordExport",
          ok: false,
          message: error.message,
          duration: Date.now() - testStart4,
        });
      }

      // Test 5: Support ticket write path
      const testStart5 = Date.now();
      try {
        const ticketPath = path.join(
          process.cwd(),
          "data/support-tickets/.test",
        );
        await fs.writeFile(ticketPath, JSON.stringify({ test: true }));
        await fs.unlink(ticketPath);
        results.push({
          name: "supportTicketWrite",
          ok: true,
          duration: Date.now() - testStart5,
        });
      } catch (error: any) {
        results.push({
          name: "supportTicketWrite",
          ok: false,
          message: error.message,
          duration: Date.now() - testStart5,
        });
      }

      const finishedAt = new Date().toISOString();
      const allOk = results.every((r) => r.ok);

      res.json({
        ok: allOk,
        startedAt,
        finishedAt,
        results,
      });
    } catch (error: any) {
      console.error("[RUN TESTS] Error:", error);
      res.status(500).json({ ok: false, error: "Test execution failed" });
    }
  },
);

/**
 * GET /admin/user-errors
 * List user-reported errors with root cause analysis
 */
router.get(
  "/user-errors",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const errorsDir = path.join(process.cwd(), "data/user-errors");
      await fs.mkdir(errorsDir, { recursive: true });

      const files = await fs.readdir(errorsDir);
      const jsonlFiles = files.filter((f) => f.endsWith(".jsonl"));

      const allErrors: any[] = [];

      for (const file of jsonlFiles) {
        const filePath = path.join(errorsDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const lines = content.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          try {
            const error = JSON.parse(line);
            // Add root cause analysis
            error.rootCause = analyzeRootCause(error);
            allErrors.push(error);
          } catch {
            // Skip malformed lines
          }
        }
      }

      // Sort by timestamp (newest first)
      allErrors.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      // Limit to last 100
      const limited = allErrors.slice(0, 100);

      res.json({
        count: limited.length,
        errors: limited,
      });
    } catch (error: any) {
      console.error("[USER ERRORS] Error:", error);
      res.status(500).json({ error: "Failed to load user errors" });
    }
  },
);

/**
 * GET /admin/user-errors/:id
 * Get detailed error entry
 */
router.get(
  "/user-errors/:id",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const errorsDir = path.join(process.cwd(), "data/user-errors");
      const files = await fs.readdir(errorsDir);

      for (const file of files) {
        if (!file.endsWith(".jsonl")) continue;

        const filePath = path.join(errorsDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const lines = content.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          try {
            const error = JSON.parse(line);
            if (error.id === id) {
              error.rootCause = analyzeRootCause(error);
              return res.json(error);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      res.status(404).json({ error: "Error entry not found" });
    } catch (error: any) {
      console.error("[USER ERROR DETAIL] Error:", error);
      res.status(500).json({ error: "Failed to load error detail" });
    }
  },
);

/**
 * GET /health/history
 * Get health check history
 */
router.get(
  "/history",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = healthMonitor.getHistory(limit);

      res.json({
        count: history.length,
        history,
      });
    } catch (error: any) {
      console.error("[HEALTH HISTORY] Error:", error);
      res.status(500).json({ error: "Failed to load health history" });
    }
  },
);

/**
 * GET /admin/setup/stripe
 * Return only presence flags and guidance for Stripe setup.
 * MUST NOT return any secret or partial secret values.
 */
router.get(
  "/setup/stripe",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const keys = resolveStripeKeysFromEnv();
      const hasSecret = !!keys.secret;
      const hasPublishable = !!keys.publishable;
      const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;

      res.json({
        ok: true,
        stripe: {
          configured: hasSecret && hasPublishable,
          hasSecret,
          hasPublishable,
          hasWebhookSecret,
          guidance: {
            envVars: [
              "STRIPE_SECRET_KEY",
              "STRIPE_PUBLISHABLE_KEY",
              "STRIPE_WEBHOOK_SECRET",
            ],
            note: "This endpoint never returns secret values. Set environment variables and re-run this check.",
          },
        },
      });
    } catch (error: any) {
      console.error("[SETUP STRIPE] Error:", error);
      res
        .status(500)
        .json({ ok: false, error: "Failed to evaluate stripe configuration" });
    }
  },
);

/**
 * GET /admin/setup/stripe-webhook
 * Returns presence-only guidance for setting up local Stripe webhooks (no secrets)
 */
router.get(
  "/setup/stripe-webhook",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const localEndpoint = "http://localhost:3001/api/payments/stripe-webhook";
      const keys = resolveStripeKeysFromEnv();
      const hasSecret = !!keys.secret;
      const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
      const checkoutMode = (
        process.env.STRIPE_CHECKOUT_MODE || "redirect_only"
      ).toLowerCase();

      res.json({
        ok: true,
        docs: "https://docs.stripe.com/webhooks/quickstart",
        localEndpoint,
        configured: {
          stripeSecretKey: hasSecret,
          stripeWebhookSecret: hasWebhookSecret,
        },
        checkoutMode,
        recommendedLocalCommands: {
          login: "stripe login",
          listen: `stripe listen --forward-to ${localEndpoint}`,
        },
        platformEnvPack: [
          "STRIPE_SECRET_KEY=PASTE_YOUR_SK_HERE",
          "STRIPE_WEBHOOK_SECRET=PASTE_YOUR_WHSEC_HERE",
          `STRIPE_CHECKOUT_MODE=${checkoutMode}`,
        ],
      });
    } catch (error: any) {
      console.error("[SETUP STRIPE WEBHOOK] Error:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to evaluate stripe webhook configuration",
      });
    }
  },
);

/**
 * POST /admin/setup/stripe-webhook/preflight
 * Optionally run a safe preflight to detect Stripe CLI if ALLOW_SYSTEM_COMMANDS=true
 */
router.post(
  "/setup/stripe-webhook/preflight",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (process.env.ALLOW_SYSTEM_COMMANDS !== "true") {
        return res.json({
          cliInstalled: "unknown",
          reason: "ALLOW_SYSTEM_COMMANDS=false",
        });
      }

      const { exec } = await import("child_process");
      exec("stripe --version", (err, stdout, stderr) => {
        if (err) {
          return res.json({ cliInstalled: false, reason: String(err.message) });
        }

        return res.json({
          cliInstalled: true,
          version: (stdout || stderr).toString().trim(),
        });
      });
    } catch (error: any) {
      console.error("[STRIPE CLI PREFLIGHT] Error:", error);
      res.status(500).json({ ok: false, error: "Preflight failed" });
    }
  },
);

/**
 * GET /admin/setup/tunnel/cloudflare
 * Provide safe guidance and computed commands for Cloudflare Tunnel usage.
 * This endpoint MUST NOT reveal any secret values.
 */
router.get(
  "/setup/tunnel/cloudflare",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const backendPort = Number(process.env.PORT) || 3001;
      const localTarget = `http://localhost:${backendPort}`;
      const webhookPath = "/api/payments/stripe-webhook";
      const quickTunnelCommand = `cloudflared tunnel --url ${localTarget}`;
      const installUrl =
        "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/";

      const allow = process.env.ALLOW_SYSTEM_COMMANDS === "true";

      res.json({
        backendPort,
        localTarget,
        webhookPath,
        quickTunnelCommand,
        installUrl,
        notes: [
          "Stripe requires a publicly accessible HTTPS URL. localhost is rejected.",
          "Use the returned public https URL and append /api/payments/stripe-webhook.",
        ],
        publicUrl: process.env.PUBLIC_URL || null,
        computedWebhookEndpoint: process.env.PUBLIC_URL
          ? `${process.env.PUBLIC_URL}${webhookPath}`
          : null,
        cliPreflight: {
          allowed: allow,
          cloudflaredInstalled: "unknown",
        },
      });
    } catch (error: any) {
      console.error("[SETUP TUNNEL CLOUDFLARE] Error:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to evaluate cloudflare tunnel guidance",
      });
    }
  },
);

/**
 * POST /admin/setup/tunnel/cloudflare/preflight
 * Optionally detect `cloudflared` presence when ALLOW_SYSTEM_COMMANDS=true
 */
router.post(
  "/setup/tunnel/cloudflare/preflight",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (process.env.ALLOW_SYSTEM_COMMANDS !== "true") {
        return res.json({ allowed: false });
      }

      const { exec } = await import("child_process");
      exec("cloudflared --version", (err, stdout, stderr) => {
        if (err) {
          return res.json({
            allowed: true,
            cloudflaredInstalled: false,
            reason: String(err.message),
          });
        }

        return res.json({
          allowed: true,
          cloudflaredInstalled: true,
          version: (stdout || stderr).toString().trim(),
        });
      });
    } catch (error: any) {
      console.error("[CLOUDFLARE PREFLIGHT] Error:", error);
      res.status(500).json({ ok: false, error: "Preflight failed" });
    }
  },
);

/**
 * GET /admin/setup/preflight
 * Perform lightweight, safe preflight checks (DB, health, integrations) and return booleans.
 * Do not reveal any secret material.
 */
router.get(
  "/setup/preflight",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      // Health status (reuse healthMonitor but don't expose internal details)
      const health = await healthMonitor.performHealthCheck();

      // DB connectivity check (simple SELECT 1)
      let dbConnected = false;
      try {
        // Prisma $queryRaw requires proper typing; a simple ping
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // @ts-ignore
        await prisma.$queryRaw`SELECT 1`;
        dbConnected = true;
      } catch (dbErr) {
        dbConnected = false;
      }

      // Stripe presence
      const keys = resolveStripeKeysFromEnv();
      const stripePresent = !!(
        keys.secret ||
        keys.publishable ||
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // SMTP/email delivery has been archived. Support tickets and site logs are
      // the canonical source of support data. Report email as archived rather
      // than probing for SMTP environment variables.
      const emailConfigured = false; // archived

      res.json({
        ok: true,
        preflight: {
          health: { status: health.status },
          database: { connected: dbConnected },
          stripe: { present: stripePresent },
          email: {
            configured: emailConfigured,
            archived: true,
            note: "SMTP support removed; use support log in admin health",
          },
          guidance: {
            note: "No secrets are returned. Use /admin/setup/stripe for Stripe-specific guidance.",
          },
        },
      });
    } catch (error: any) {
      console.error("[SETUP PREFLIGHT] Error:", error);
      res.status(500).json({ ok: false, error: "Preflight failed" });
    }
  },
);

export default router;
