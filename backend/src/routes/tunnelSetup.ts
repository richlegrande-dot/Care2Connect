import { Router, Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = Router();

/**
 * Cloudflared tunnel setup and management endpoints
 */

/**
 * Check if cloudflared is installed
 */
router.get("/cloudflare/preflight", async (req: Request, res: Response) => {
  try {
    const { stdout } = await execAsync("cloudflared --version");
    const version = stdout.trim();

    res.json({
      installed: true,
      version,
      status: "ready",
    });
  } catch (error: any) {
    res.json({
      installed: false,
      status: "not-installed",
      error: error.message,
      instructions: {
        windows: {
          method1:
            "Download from https://github.com/cloudflare/cloudflared/releases/latest",
          method2: "winget install --id Cloudflare.cloudflared",
          method3: "scoop install cloudflared",
        },
        macos: {
          method1: "brew install cloudflared",
          method2:
            "Download from https://github.com/cloudflare/cloudflared/releases/latest",
        },
        linux: {
          method1:
            "curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared.deb",
          method2:
            "Download from https://github.com/cloudflare/cloudflared/releases/latest",
        },
      },
    });
  }
});

/**
 * Generate tunnel command and webhook URL
 */
router.post("/cloudflare/generate-command", (req: Request, res: Response) => {
  const { publicUrl } = req.body;
  const currentPort = process.env.PORT || "3001";

  if (!publicUrl) {
    return res.status(400).json({
      error: "Missing publicUrl in request body",
      example: { publicUrl: "https://abc-123.trycloudflare.com" },
    });
  }

  // Validate URL format
  try {
    const url = new URL(publicUrl);
    if (!url.hostname.includes("trycloudflare.com")) {
      return res.status(400).json({
        error: "Invalid cloudflare URL format",
        expected: "https://[subdomain].trycloudflare.com",
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: "Invalid URL format",
    });
  }

  const webhookEndpoint = `${publicUrl}/api/payments/stripe-webhook`;

  res.json({
    tunnel: {
      command: `cloudflared tunnel --url http://localhost:${currentPort}`,
      localPort: currentPort,
      publicUrl,
    },
    stripe: {
      webhookEndpoint,
      events: [
        "checkout.session.completed",
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
      ],
      instructions: [
        "1. Go to Stripe Dashboard → Developers → Webhooks",
        '2. Click "Add endpoint"',
        `3. Paste this URL: ${webhookEndpoint}`,
        "4. Select events: checkout.session.completed (minimum)",
        '5. Click "Add endpoint"',
        "6. Copy the webhook signing secret (whsec_...)",
        "7. Update STRIPE_WEBHOOK_SECRET in your .env file",
      ],
    },
    testing: {
      healthCheck: `${publicUrl}/health/live`,
      statusCheck: `${publicUrl}/health/status`,
    },
  });
});

/**
 * Validate webhook endpoint accessibility
 */
router.post(
  "/cloudflare/validate-webhook",
  async (req: Request, res: Response) => {
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({
        error: "Missing webhookUrl in request body",
      });
    }

    try {
      const fetch = await import("node-fetch").then((m) => m.default);

      // Test if the webhook endpoint is reachable
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "CareConnect-Webhook-Validator/1.0",
        },
        body: JSON.stringify({ test: true }),
      });

      res.json({
        reachable: true,
        status: response.status,
        statusText: response.statusText,
        message:
          response.status === 400
            ? "Endpoint reachable (400 expected for test request)"
            : "Endpoint responding",
      });
    } catch (error: any) {
      res.json({
        reachable: false,
        error: error.message,
        suggestion:
          "Check if cloudflared tunnel is running and public URL is correct",
      });
    }
  },
);

export default router;
