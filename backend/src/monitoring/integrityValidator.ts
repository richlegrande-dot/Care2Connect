import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface IntegrityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    envVariables: { passed: boolean; missing: string[] };
    typescript: { passed: boolean; errors: string[] };
    dependencies: { passed: boolean; missing: string[] };
    directories: { passed: boolean; missing: string[] };
  };
}

/**
 * Startup integrity validation
 */
export class IntegrityValidator {
  /**
   * Check required environment variables
   */
  private checkEnvVariables(): { passed: boolean; missing: string[] } {
    // DATABASE_URL is required only when database feature is enabled
    const required: string[] = [];
    const dbEnabled = process.env.FEATURE_DATABASE_ENABLED !== "false";
    if (dbEnabled) required.push("DATABASE_URL");

    // Determine optional expectations based on feature flags
    const optional: string[] = [];

    // Stripe expectations
    const checkoutMode = (
      process.env.STRIPE_CHECKOUT_MODE || "redirect_only"
    ).toLowerCase();
    if (checkoutMode === "stripe_js") {
      optional.push("STRIPE_SECRET_KEY", "STRIPE_PUBLIC_KEY");
    } else {
      // redirect_only requires only secret key
      optional.push("STRIPE_SECRET_KEY");
    }

    // Email/SPI delivery mode is deprecated/archived. SMTP checks removed.

    // OpenAI optional
    optional.push("OPENAI_API_KEY");

    const missing = required.filter((key) => !process.env[key]);
    const optionalMissing = optional.filter((key) => !process.env[key]);

    // Log service-aware missing messages
    optionalMissing.forEach((key) => {
      if (key.startsWith("STRIPE")) {
        if (checkoutMode === "redirect_only" && key === "STRIPE_PUBLIC_KEY") {
          return;
        }
      }
      // Do not warn about SMTP env vars; SMTP support has been archived.
      if (key.startsWith("SMTP")) return;
      console.warn(`⚠️  Optional environment variable missing: ${key}`);
    });

    return {
      passed: missing.length === 0,
      missing,
    };
  }

  /**
   * Check if running in transpile-only mode
   */
  private isTranspileOnly(): boolean {
    return (
      process.env.TS_NODE_TRANSPILE_ONLY === "true" ||
      process.execArgv.some((arg) => arg.includes("--transpile-only")) ||
      process.argv.some((arg) => arg.includes("--transpile-only"))
    );
  }

  /**
   * Check if TypeScript compilation would pass
   * Enforced in production mode
   * Exposed publicly for tests to call directly.
   */
  public checkTypeScript(): { passed: boolean; errors: string[] } {
    const isProduction = process.env.NODE_ENV === "production";
    const transpileOnly = this.isTranspileOnly();

    // PRODUCTION POLICY: Refuse to start with transpile-only
    if (isProduction && transpileOnly) {
      return {
        passed: false,
        errors: [
          "❌ CRITICAL: Cannot run production server with --transpile-only",
          "TypeScript errors are being masked, which is unsafe for production.",
          "",
          "Required actions:",
          "1. Fix all TypeScript errors: npm run typecheck",
          "2. Build compiled version: npm run build",
          "3. Start production server: npm run start:prod",
        ],
      };
    }

    // PRODUCTION POLICY: Must run from compiled dist/
    if (isProduction) {
      const isCompiledDist = __dirname.includes("dist");

      if (!isCompiledDist) {
        return {
          passed: false,
          errors: [
            "❌ CRITICAL: Production mode requires compiled dist/ directory",
            "",
            "Required actions:",
            "1. Build the application: npm run build",
            "2. Start from dist: npm run start:prod",
            "",
            "Current __dirname: " + __dirname,
          ],
        };
      }
    }

    // DEV POLICY: Allow transpile-only but warn
    if (!isProduction && transpileOnly) {
      console.warn("\n⚠️  WARNING: Running in TypeScript transpile-only mode");
      console.warn(
        "   Type errors may be masked. Use npm run typecheck for validation.\n",
      );
    }

    return { passed: true, errors: [] };
  }

  /**
   * Check required directories exist
   */
  private async checkDirectories(): Promise<{
    passed: boolean;
    missing: string[];
  }> {
    const requiredDirs = [
      "receipts",
      "uploads",
      "data/support-tickets",
      "data/health",
    ];

    const missing: string[] = [];

    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      try {
        await fs.access(dirPath);
      } catch {
        missing.push(dir);
      }
    }

    return {
      passed: true, // Don't fail, just report (self-healing will create them)
      missing,
    };
  }

  /**
   * Check critical dependencies are installed
   */
  private async checkDependencies(): Promise<{
    passed: boolean;
    missing: string[];
  }> {
    const criticalDeps = ["express", "@prisma/client", "dotenv"];

    const missing: string[] = [];

    for (const dep of criticalDeps) {
      try {
        require.resolve(dep);
      } catch {
        missing.push(dep);
      }
    }

    // Special check for Prisma CLI (dev dependency)
    try {
      const fs = require("fs");
      const path = require("path");
      const packageJsonPath = path.join(__dirname, "../../package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

      // Check if prisma exists in dependencies or devDependencies
      const hasPrisma =
        (packageJson.dependencies && packageJson.dependencies.prisma) ||
        (packageJson.devDependencies && packageJson.devDependencies.prisma);

      if (!hasPrisma) {
        missing.push("prisma");
      }
    } catch {
      // If we can't read package.json, skip prisma CLI check
      // The important @prisma/client is already checked above
    }

    return {
      passed: missing.length === 0,
      missing,
    };
  }

  /**
   * Run full integrity check
   */
  public async validate(): Promise<IntegrityCheckResult> {
    console.log("\n🔍 Running startup integrity checks...\n");

    const [envCheck, tsCheck, depsCheck, dirsCheck] = await Promise.all([
      Promise.resolve(this.checkEnvVariables()),
      this.checkTypeScript(),
      this.checkDependencies(),
      this.checkDirectories(),
    ]);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Environment variables
    if (!envCheck.passed) {
      errors.push("Missing required environment variables:");
      envCheck.missing.forEach((key) => errors.push(`  • ${key}`));
    }

    // TypeScript
    if (!tsCheck.passed) {
      errors.push("TypeScript validation failed:");
      tsCheck.errors.forEach((err) => errors.push(`  • ${err}`));
    }

    // Dependencies
    if (!depsCheck.passed) {
      errors.push("Missing critical dependencies:");
      depsCheck.missing.forEach((dep) => errors.push(`  • ${dep}`));
      errors.push("Run: npm install");
    }

    // Directories
    if (dirsCheck.missing.length > 0) {
      warnings.push("Missing directories (will be auto-created):");
      dirsCheck.missing.forEach((dir) => warnings.push(`  • ${dir}`));
    }

    const passed = errors.length === 0;

    // Output results
    if (errors.length > 0) {
      console.error("❌ Integrity check FAILED:\n");
      errors.forEach((err) => console.error(err));
      console.error("");
    }

    if (warnings.length > 0) {
      console.warn("⚠️  Warnings:\n");
      warnings.forEach((warn) => console.warn(warn));
      console.warn("");
    }

    if (passed) {
      console.log("✅ Integrity check passed\n");
    }

    return {
      passed,
      errors,
      warnings,
      checks: {
        envVariables: envCheck,
        typescript: tsCheck,
        dependencies: depsCheck,
        directories: dirsCheck,
      },
    };
  }

  /**
   * Validate and exit if critical errors found
   */
  public async validateOrExit(): Promise<void> {
    const result = await this.validate();

    if (!result.passed) {
      console.error("❌ Server cannot start due to integrity check failures");
      console.error("Fix the errors above and try again.\n");
      process.exit(1);
    }
  }
}

// Singleton instance
export const integrityValidator = new IntegrityValidator();
