#!/usr/bin/env node

/**
 * Frontend Startup Validation
 * PRODUCTION HARDENING: Validates configuration and backend connectivity before Next.js starts
 *
 * This script runs before Next.js dev server to ensure:
 * 1. Port configuration is valid
 * 2. Backend is reachable and healthy
 * 3. Configuration consistency is maintained
 */

const {
  getFrontendConfig,
  validateBackendConnectivity,
  logFrontendConfiguration,
} = require("../src/lib/frontendConfig");

async function main() {
  console.log("=== FRONTEND STARTUP VALIDATION ===");
  console.log("Validating configuration and backend connectivity...\n");

  try {
    // Get and validate configuration
    const config = getFrontendConfig();
    logFrontendConfiguration(config);

    // Validate backend connectivity (fail-fast in strict mode)
    console.log("\n🔍 [VALIDATION] Checking backend connectivity...");
    const validation = await validateBackendConnectivity(config);

    if (!validation.isValid) {
      console.warn("\n⚠️  [VALIDATION] Backend connectivity issues detected:");
      validation.errors.forEach((error) => console.warn(`   - ${error}`));

      if (config.strictMode) {
        console.error("\n🚨 [VALIDATION] STRICT MODE: Cannot start frontend");
        process.exit(1);
      } else {
        console.warn(
          "\n📋 [VALIDATION] FLEXIBLE MODE: Starting anyway (not recommended)",
        );
        console.warn("   Frontend may not function properly without backend");
      }
    } else {
      console.log("\n✅ [VALIDATION] All validation checks passed");
    }

    if (validation.warnings.length > 0) {
      console.log("\n⚠️  [VALIDATION] Warnings:");
      validation.warnings.forEach((warning) => console.warn(`   - ${warning}`));
    }

    console.log("\n🚀 [VALIDATION] Frontend startup validation complete");
    console.log("====================================\n");
  } catch (error) {
    console.error("\n❌ [VALIDATION] Startup validation failed:");
    console.error(`   ${error.message}`);
    console.error("\n🚨 [VALIDATION] Cannot continue with startup");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Validation script error:", error);
  process.exit(1);
});
