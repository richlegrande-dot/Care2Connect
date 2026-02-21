/**
 * Configuration Drift Immunity Validation (TypeScript Module)
 * PRODUCTION INVARIANT: Prevents configuration drift across components
 *
 * This module provides programmatic validation of configuration consistency
 * for use in startup processes, CI/CD, and automated monitoring.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface ConfigIssue {
  component: string;
  message: string;
  severity: "CRITICAL" | "ERROR" | "WARNING";
  fixAction?: string;
}

export interface ConfigDriftResult {
  valid: boolean;
  issues: ConfigIssue[];
  timestamp: Date;
  checksRun: string[];
}

/**
 * Read JSON file safely
 */
function readJsonFile(filePath: string): any | null {
  try {
    if (!existsSync(filePath)) return null;
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Read environment file safely
 */
function readEnvFile(filePath: string): Record<string, string> {
  try {
    if (!existsSync(filePath)) return {};
    const content = readFileSync(filePath, "utf-8");
    const vars: Record<string, string> = {};

    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
      if (match) {
        vars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    });

    return vars;
  } catch {
    return {};
  }
}

/**
 * Validate port configuration consistency
 */
function validatePortConsistency(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  try {
    // Get current runtime port configuration
    const currentBackendPort = parseInt(process.env.PORT || "3001", 10);
    const expectedBackendPort = 3001;
    const expectedFrontendPort = 3000;

    // Check backend port consistency with ecosystem config
    const ecosystemPath = join(process.cwd(), "..", "ecosystem.prod.config.js");
    if (existsSync(ecosystemPath)) {
      const ecosystemContent = readFileSync(ecosystemPath, "utf-8");
      const portMatch = ecosystemContent.match(/PORT:\s*(\d+)/);
      if (portMatch) {
        const ecosystemPort = parseInt(portMatch[1], 10);
        if (currentBackendPort !== ecosystemPort) {
          issues.push({
            component: "Backend Port Configuration",
            message: `Runtime port ${currentBackendPort} differs from ecosystem port ${ecosystemPort}`,
            severity: "ERROR",
            fixAction:
              "Update PORT environment variable or ecosystem.prod.config.js",
          });
        }
      }
    }

    // Check frontend configuration
    const frontendConfigPath = join(
      process.cwd(),
      "..",
      "frontend",
      "src",
      "lib",
      "frontendConfig.ts",
    );
    if (existsSync(frontendConfigPath)) {
      const frontendConfig = readFileSync(frontendConfigPath, "utf-8");
      const backendPortMatch = frontendConfig.match(
        /backendPort:\s*parseInt.*?(\d+)/,
      );
      if (backendPortMatch) {
        const frontendExpectedBackendPort = parseInt(backendPortMatch[1], 10);
        if (frontendExpectedBackendPort !== currentBackendPort) {
          issues.push({
            component: "Frontend-Backend Port Consistency",
            message: `Frontend expects backend on port ${frontendExpectedBackendPort}, backend uses ${currentBackendPort}`,
            severity: "CRITICAL",
            fixAction:
              "Update frontendConfig.ts to match backend port configuration",
          });
        }
      }
    }

    // Validate ports are not conflicting
    if (currentBackendPort === expectedFrontendPort) {
      issues.push({
        component: "Port Conflict",
        message: "Backend and frontend configured to use the same port",
        severity: "CRITICAL",
        fixAction: "Assign different ports to backend and frontend services",
      });
    }
  } catch (error) {
    issues.push({
      component: "Port Validation System",
      message: `Port consistency validation failed: ${error}`,
      severity: "WARNING",
    });
  }

  return issues;
}

/**
 * Validate environment variable consistency
 */
function validateEnvironmentConsistency(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  try {
    // Check critical production environment variables
    const requiredProdVars = ["V1_STABLE", "ZERO_OPENAI_MODE", "NODE_ENV"];

    for (const varName of requiredProdVars) {
      const value = process.env[varName];

      if (!value) {
        issues.push({
          component: "Environment Variables",
          message: `Critical environment variable ${varName} is not set`,
          severity: "ERROR",
          fixAction: `Set ${varName} environment variable`,
        });
      }

      // Validate specific variable values
      if (varName === "V1_STABLE" && value !== "true") {
        issues.push({
          component: "Production Hardening",
          message: "V1_STABLE should be true for production hardening mode",
          severity: "WARNING",
          fixAction: "Set V1_STABLE=true for production hardening",
        });
      }

      if (varName === "ZERO_OPENAI_MODE" && value !== "true") {
        issues.push({
          component: "AI Configuration",
          message:
            "ZERO_OPENAI_MODE should be true to prevent OpenAI dependency",
          severity: "WARNING",
          fixAction: "Set ZERO_OPENAI_MODE=true to use rules-based AI",
        });
      }
    }
  } catch (error) {
    issues.push({
      component: "Environment Validation System",
      message: `Environment consistency validation failed: ${error}`,
      severity: "WARNING",
    });
  }

  return issues;
}

/**
 * Validate API URL consistency
 */
function validateApiUrlConsistency(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  try {
    // Check if frontend configuration has hardcoded URLs that might be incorrect
    const frontendConfigPath = join(
      process.cwd(),
      "..",
      "frontend",
      "src",
      "lib",
      "frontendConfig.ts",
    );
    if (existsSync(frontendConfigPath)) {
      const frontendConfig = readFileSync(frontendConfigPath, "utf-8");

      // Look for hardcoded production URLs
      const urlMatches = frontendConfig.match(/https?:\/\/[^\/\s'"]+/g);
      if (urlMatches) {
        const expectedProductionUrl = "https://api.care2connects.org";
        const unexpectedUrls = urlMatches.filter(
          (url) =>
            url !== expectedProductionUrl &&
            url !== "http://localhost:3001" &&
            !url.includes("localhost"),
        );

        if (unexpectedUrls.length > 0) {
          issues.push({
            component: "Frontend API Configuration",
            message: `Unexpected hardcoded URLs found: ${unexpectedUrls.join(", ")}`,
            severity: "WARNING",
            fixAction: "Review hardcoded URLs and ensure they are correct",
          });
        }
      }
    }
  } catch (error) {
    issues.push({
      component: "API URL Validation System",
      message: `API URL consistency validation failed: ${error}`,
      severity: "WARNING",
    });
  }

  return issues;
}

/**
 * Main configuration drift validation function
 */
export async function validateConfigDrift(): Promise<ConfigDriftResult> {
  const startTime = new Date();
  const allIssues: ConfigIssue[] = [];
  const checksRun: string[] = [];

  // Run all validation checks
  try {
    const portIssues = validatePortConsistency();
    allIssues.push(...portIssues);
    checksRun.push("Port Consistency");

    const envIssues = validateEnvironmentConsistency();
    allIssues.push(...envIssues);
    checksRun.push("Environment Variables");

    const apiIssues = validateApiUrlConsistency();
    allIssues.push(...apiIssues);
    checksRun.push("API URL Consistency");
  } catch (error) {
    allIssues.push({
      component: "Configuration Drift Validation System",
      message: `Validation system error: ${error}`,
      severity: "ERROR",
    });
  }

  // Determine if configuration is valid (no CRITICAL issues)
  const criticalIssues = allIssues.filter(
    (issue) => issue.severity === "CRITICAL",
  );
  const valid = criticalIssues.length === 0;

  return {
    valid,
    issues: allIssues,
    timestamp: startTime,
    checksRun,
  };
}

/**
 * Quick validation for use in health checks
 */
export async function validateConfigDriftQuick(): Promise<{
  valid: boolean;
  criticalCount: number;
  errorCount: number;
}> {
  const result = await validateConfigDrift();

  const criticalCount = result.issues.filter(
    (i) => i.severity === "CRITICAL",
  ).length;
  const errorCount = result.issues.filter((i) => i.severity === "ERROR").length;

  return {
    valid: result.valid,
    criticalCount,
    errorCount,
  };
}
