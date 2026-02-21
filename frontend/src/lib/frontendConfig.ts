/**
 * Frontend Port Configuration and Validation
 * PRODUCTION HARDENING: Single source of truth for frontend configuration
 *
 * Ensures frontend can connect to backend before starting.
 * FAIL-FAST: Exit immediately if backend is unreachable.
 */

interface FrontendConfig {
  port: number;
  backendUrl: string;
  backendApiUrl: string;
  strictMode: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Get frontend configuration from environment with validation
 */
export function getFrontendConfig(): FrontendConfig {
  const port = parseInt(process.env.PORT || "3000", 10);
  const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || "3001";
  const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || "localhost";
  const backendUrl = `http://${backendHost}:${backendPort}`;
  const backendApiUrl = `${backendUrl}/api`;

  // Force strict mode in production
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.V1_STABLE === "true";
  const strictMode = process.env.STRICT_MODE === "true" || isProduction;

  // Validate port numbers
  if (isNaN(port) || port < 1024 || port > 65535) {
    console.error(
      `❌ CRITICAL: Invalid frontend port: ${process.env.PORT || "3000"}`,
    );
    console.error("   PORT must be a number between 1024-65535");
    process.exit(1);
  }

  const backendPortNum = parseInt(backendPort, 10);
  if (
    isNaN(backendPortNum) ||
    backendPortNum < 1024 ||
    backendPortNum > 65535
  ) {
    console.error(`❌ CRITICAL: Invalid backend port: ${backendPort}`);
    console.error(
      "   NEXT_PUBLIC_BACKEND_PORT must be a number between 1024-65535",
    );
    process.exit(1);
  }

  if (port === backendPortNum) {
    console.error(
      `❌ CRITICAL: Frontend and backend ports cannot be the same: ${port}`,
    );
    console.error(
      "   Set different values for PORT and NEXT_PUBLIC_BACKEND_PORT",
    );
    process.exit(1);
  }

  return { port, backendUrl, backendApiUrl, strictMode };
}

/**
 * Validate backend connectivity
 * FAIL-FAST: Exit immediately if backend is unreachable in strict mode
 */
export async function validateBackendConnectivity(
  config: FrontendConfig,
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    console.log(
      `🔍 [FRONTEND] Testing backend connectivity: ${config.backendUrl}/health/live`,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${config.backendUrl}/health/live`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      errors.push(`Backend health check failed: HTTP ${response.status}`);
    } else {
      const healthData = await response.json();
      if (healthData.status !== "alive") {
        errors.push(`Backend unhealthy: status = ${healthData.status}`);
      } else {
        console.log(`✅ [FRONTEND] Backend is healthy (${healthData.port})`);
      }
    }
  } catch (error: any) {
    const errorMessage =
      error.name === "AbortError"
        ? "Backend connection timeout (10 seconds)"
        : error.message || "Unknown connection error";

    errors.push(`Backend unreachable: ${errorMessage}`);
  }

  const isValid = errors.length === 0;

  // FAIL-FAST in strict mode
  if (!isValid && config.strictMode) {
    console.error(
      "\n❌ CRITICAL: Frontend startup validation failed in STRICT MODE",
    );
    console.error("   Backend connectivity issues detected:");

    for (const error of errors) {
      console.error(`   - ${error}`);
    }

    console.error("\n📋 ACTIONS REQUIRED:");
    console.error("   • Ensure backend is running: npm run dev:backend");
    console.error(
      "   • Check backend health: curl http://localhost:3001/health/live",
    );
    console.error(`   • Verify backend URL: ${config.backendUrl}`);

    console.error("\n🚨 Frontend cannot start without backend connectivity.");
    process.exit(1);
  }

  return { isValid, errors, warnings };
}

/**
 * Print frontend configuration summary (safe for logs)
 */
export function logFrontendConfiguration(config: FrontendConfig): void {
  console.log("📋 [FRONTEND CONFIG] Frontend Configuration:");
  console.log(`📋 [FRONTEND CONFIG]   Port:        ${config.port}`);
  console.log(`📋 [FRONTEND CONFIG]   Backend URL: ${config.backendUrl}`);
  console.log(`📋 [FRONTEND CONFIG]   API URL:     ${config.backendApiUrl}`);
  console.log(
    `📋 [FRONTEND CONFIG]   Mode:        ${config.strictMode ? "STRICT" : "FLEXIBLE"}`,
  );
  console.log("📋 [FRONTEND CONFIG] ====================================");
}
