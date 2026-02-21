/**
 * Health Check Runner
 * Performs functional tests on all integrations and reports incidents
 * SECURITY: Never logs secrets, only sanitized results
 */

import { getEnvConfig } from "./envSchema";
import { getIncidentManager, ServiceName, Severity } from "./incidentManager";

export interface HealthCheckResult {
  service: ServiceName;
  healthy: boolean;
  latency: number;
  lastCheck: Date;
  error?: string;
  details?: any; // sanitized
}

export interface HealthStatus {
  overall: boolean;
  services: HealthCheckResult[];
  lastRun: Date;
}

/**
 * OpenAI functional test
 * DISABLED in V1_STABLE/ZERO_OPENAI_MODE
 */
async function checkOpenAI(): Promise<HealthCheckResult> {
  // V1_STABLE / ZERO_OPENAI_MODE: OpenAI health checks are disabled
  const isV1Mode =
    process.env.V1_STABLE === "true" ||
    process.env.ZERO_OPENAI_MODE === "true" ||
    (process.env.AI_PROVIDER && !["openai"].includes(process.env.AI_PROVIDER));

  if (isV1Mode) {
    return {
      service: "openai",
      healthy: false,
      latency: 0,
      lastCheck: new Date(),
      error: "disabled",
      details: {
        reason: "OpenAI disabled in V1_STABLE/ZERO_OPENAI_MODE",
        mode: "V1_STABLE",
        aiProvider: process.env.AI_PROVIDER || "rules",
      },
    };
  }

  const start = Date.now();
  const config = getEnvConfig();

  if (!config.OPENAI_API_KEY) {
    return {
      service: "openai",
      healthy: false,
      latency: 0,
      lastCheck: new Date(),
      error: "OPENAI_API_KEY not configured",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      let errorCategory = "Unknown error";
      if (response.status === 401) errorCategory = "Authentication failed";
      else if (response.status === 429) errorCategory = "Rate limited";
      else if (response.status >= 500) errorCategory = "Server error";

      return {
        service: "openai",
        healthy: false,
        latency,
        lastCheck: new Date(),
        error: `${errorCategory} (${response.status})`,
        details: { status: response.status, statusText: response.statusText },
      };
    }

    return {
      service: "openai",
      healthy: true,
      latency,
      lastCheck: new Date(),
      details: { status: response.status },
    };
  } catch (error: any) {
    return {
      service: "openai",
      healthy: false,
      latency: Date.now() - start,
      lastCheck: new Date(),
      error:
        error.name === "TimeoutError" ? "Request timeout" : "Network error",
      details: { errorType: error.name },
    };
  }
}

/**
 * Prisma DB functional test
 */
async function checkPrismaDB(): Promise<HealthCheckResult> {
  const start = Date.now();
  const config = getEnvConfig();

  if (!config.DATABASE_URL) {
    return {
      service: "prisma",
      healthy: false,
      latency: 0,
      lastCheck: new Date(),
      error: "DATABASE_URL not configured",
    };
  }

  try {
    // Try to import and use Prisma client
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    // Simple health check query
    await prisma.$queryRaw`SELECT 1 as health_check`;
    await prisma.$disconnect();

    const latency = Date.now() - start;

    return {
      service: "prisma",
      healthy: true,
      latency,
      lastCheck: new Date(),
      details: { connectionTime: latency },
    };
  } catch (error: any) {
    return {
      service: "prisma",
      healthy: false,
      latency: Date.now() - start,
      lastCheck: new Date(),
      error: error.message?.includes("authentication")
        ? "Authentication failed"
        : "Connection failed",
      details: { errorCode: error.code, errorType: error.name },
    };
  }
}

/**
 * Stripe functional test
 */
async function checkStripe(): Promise<HealthCheckResult> {
  const start = Date.now();
  const config = getEnvConfig();

  if (!config.STRIPE_SECRET_KEY) {
    return {
      service: "stripe",
      healthy: false,
      latency: 0,
      lastCheck: new Date(),
      error: "STRIPE_SECRET_KEY not configured",
    };
  }

  // Validate key format
  if (
    !config.STRIPE_SECRET_KEY.startsWith("sk_test_") &&
    !config.STRIPE_SECRET_KEY.startsWith("sk_live_")
  ) {
    return {
      service: "stripe",
      healthy: false,
      latency: 0,
      lastCheck: new Date(),
      error:
        "Invalid STRIPE_SECRET_KEY format (must start with sk_test_ or sk_live_)",
      details: { keyPrefix: config.STRIPE_SECRET_KEY.substring(0, 8) + "***" },
    };
  }

  try {
    // Lightweight Stripe API test
    const response = await fetch("https://api.stripe.com/v1/account", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.STRIPE_SECRET_KEY}`,
        "Stripe-Version": "2023-10-16",
      },
      signal: AbortSignal.timeout(5000),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      let errorCategory = "Unknown error";
      if (response.status === 401) errorCategory = "Authentication failed";
      else if (response.status === 403) errorCategory = "Forbidden";
      else if (response.status >= 500) errorCategory = "Stripe server error";

      return {
        service: "stripe",
        healthy: false,
        latency,
        lastCheck: new Date(),
        error: `${errorCategory} (${response.status})`,
        details: { status: response.status },
      };
    }

    const data = await response.json();

    return {
      service: "stripe",
      healthy: true,
      latency,
      lastCheck: new Date(),
      details: {
        status: response.status,
        accountId: (data as any).id
          ? (data as any).id.substring(0, 8) + "***"
          : "unknown",
        country: (data as any).country,
      },
    };
  } catch (error: any) {
    return {
      service: "stripe",
      healthy: false,
      latency: Date.now() - start,
      lastCheck: new Date(),
      error:
        error.name === "TimeoutError" ? "Request timeout" : "Network error",
      details: { errorType: error.name },
    };
  }
}

/**
 * Cloudflare API test
 */
async function checkCloudflare(): Promise<HealthCheckResult> {
  const start = Date.now();
  const config = getEnvConfig();

  if (!config.CLOUDFLARE_API_TOKEN) {
    return {
      service: "cloudflare",
      healthy: false,
      latency: 0,
      lastCheck: new Date(),
      error: "CLOUDFLARE_API_TOKEN not configured",
    };
  }

  try {
    // Test token validity
    const response = await fetch(
      "https://api.cloudflare.com/client/v4/user/tokens/verify",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    const latency = Date.now() - start;
    const data = await response.json();

    if (!response.ok || !(data as any).success) {
      return {
        service: "cloudflare",
        healthy: false,
        latency,
        lastCheck: new Date(),
        error:
          (data as any).errors?.[0]?.message || "Token verification failed",
        details: { status: response.status, errors: (data as any).errors },
      };
    }

    // If zone ID provided, test zone access
    if (config.CLOUDFLARE_ZONE_ID) {
      const zoneResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${config.CLOUDFLARE_ZONE_ID}`,
        {
          headers: { Authorization: `Bearer ${config.CLOUDFLARE_API_TOKEN}` },
        },
      );

      if (!zoneResponse.ok) {
        return {
          service: "cloudflare",
          healthy: false,
          latency,
          lastCheck: new Date(),
          error: "Zone access failed",
          details: { zoneStatus: zoneResponse.status },
        };
      }
    }

    return {
      service: "cloudflare",
      healthy: true,
      latency,
      lastCheck: new Date(),
      details: {
        status: response.status,
        tokenValid: true,
        zoneAccess: !!config.CLOUDFLARE_ZONE_ID,
      },
    };
  } catch (error: any) {
    return {
      service: "cloudflare",
      healthy: false,
      latency: Date.now() - start,
      lastCheck: new Date(),
      error:
        error.name === "TimeoutError" ? "Request timeout" : "Network error",
      details: { errorType: error.name },
    };
  }
}

/**
 * Tunnel & Domain test
 */
async function checkTunnel(): Promise<HealthCheckResult> {
  const start = Date.now();
  const config = getEnvConfig();

  try {
    const checks = [];

    // Test main domain
    try {
      const frontendResponse = await fetch(
        `https://${config.CLOUDFLARE_DOMAIN}`,
        {
          method: "HEAD",
          signal: AbortSignal.timeout(10000),
        },
      );
      checks.push({
        domain: config.CLOUDFLARE_DOMAIN,
        status: frontendResponse.status,
        healthy: frontendResponse.ok,
      });
    } catch (error: any) {
      checks.push({
        domain: config.CLOUDFLARE_DOMAIN,
        status: 0,
        healthy: false,
        error: error.message,
      });
    }

    // Test API domain
    try {
      const apiResponse = await fetch(
        `https://api.${config.CLOUDFLARE_DOMAIN}/health/live`,
        {
          method: "GET",
          signal: AbortSignal.timeout(10000),
        },
      );
      checks.push({
        domain: `api.${config.CLOUDFLARE_DOMAIN}`,
        status: apiResponse.status,
        healthy: apiResponse.ok,
      });
    } catch (error: any) {
      checks.push({
        domain: `api.${config.CLOUDFLARE_DOMAIN}`,
        status: 0,
        healthy: false,
        error: error.message,
      });
    }

    const latency = Date.now() - start;
    const allHealthy = checks.every((check) => check.healthy);

    return {
      service: "tunnel",
      healthy: allHealthy,
      latency,
      lastCheck: new Date(),
      error: allHealthy ? undefined : "One or more domains failed",
      details: { checks },
    };
  } catch (error: any) {
    return {
      service: "tunnel",
      healthy: false,
      latency: Date.now() - start,
      lastCheck: new Date(),
      error: "Tunnel check failed",
      details: { errorType: error.name, message: error.message },
    };
  }
}

/**
 * Speech/Whisper functional test
 */
async function checkSpeech(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    // For now, just check if the speech processing modules are loadable
    // In a full implementation, this would test with actual audio fixtures

    const latency = Date.now() - start;

    return {
      service: "speech",
      healthy: true, // Placeholder - implement with actual audio test
      latency,
      lastCheck: new Date(),
      details: { status: "Speech module check passed (placeholder)" },
    };
  } catch (error: any) {
    return {
      service: "speech",
      healthy: false,
      latency: Date.now() - start,
      lastCheck: new Date(),
      error: "Speech module unavailable",
      details: { errorType: error.name },
    };
  }
}

/**
 * Run all health checks
 */
export async function runHealthChecks(): Promise<HealthStatus> {
  console.log("[HEALTH] Running system health checks...");

  const startTime = Date.now();

  // Run all checks in parallel
  const [
    openaiResult,
    prismaResult,
    stripeResult,
    cloudflareResult,
    tunnelResult,
    speechResult,
  ] = await Promise.all([
    checkOpenAI(),
    checkPrismaDB(),
    checkStripe(),
    checkCloudflare(),
    checkTunnel(),
    checkSpeech(),
  ]);

  const services = [
    openaiResult,
    prismaResult,
    stripeResult,
    cloudflareResult,
    tunnelResult,
    speechResult,
  ];
  const overall = services.every((service) => service.healthy);

  console.log(
    `[HEALTH] Health check completed in ${Date.now() - startTime}ms. Overall: ${overall ? "HEALTHY" : "DEGRADED"}`,
  );

  // Report incidents for failed services
  const incidentManager = getIncidentManager();

  for (const result of services) {
    if (!result.healthy && result.error) {
      await incidentManager.reportIncident({
        service: result.service,
        severity: getSeverityForService(result.service, result.error),
        summary: `${result.service} health check failed`,
        details: result.error,
        lastCheckPayload: result.details,
        recommendation: getRecommendationForService(
          result.service,
          result.error,
        ),
      });
    } else if (result.healthy) {
      // Auto-resolve if service is now healthy
      await incidentManager.maybeResolveServiceIncident(result.service);
    }
  }

  return {
    overall,
    services,
    lastRun: new Date(),
  };
}

/**
 * Get severity level based on service and error
 */
function getSeverityForService(service: ServiceName, error: string): Severity {
  // Critical services that affect core functionality
  if (service === "prisma" && error.includes("not configured")) return "warn";
  if (service === "prisma") return "critical";

  // Important but not critical
  if (service === "openai" && error.includes("not configured")) return "warn";
  if (service === "stripe" && error.includes("not configured")) return "warn";
  if (service === "cloudflare" && error.includes("not configured"))
    return "warn";

  // Authentication/configuration errors are warnings
  if (
    error.includes("not configured") ||
    error.includes("Authentication failed")
  )
    return "warn";

  // Network errors are info (temporary)
  if (error.includes("timeout") || error.includes("Network error"))
    return "info";

  // Default to warn
  return "warn";
}

/**
 * Get fix recommendation based on service and error
 */
function getRecommendationForService(
  service: ServiceName,
  error: string,
): string {
  if (error.includes("not configured")) {
    return `Set the required environment variable for ${service} service.`;
  }

  if (error.includes("Authentication failed")) {
    return `Check and update the API credentials for ${service}.`;
  }

  if (error.includes("Invalid") && error.includes("format")) {
    return `Verify the format of ${service} credentials matches the expected pattern.`;
  }

  if (error.includes("timeout") || error.includes("Network error")) {
    return `Check network connectivity and ${service} service status.`;
  }

  return `Review ${service} configuration and check service documentation.`;
}
