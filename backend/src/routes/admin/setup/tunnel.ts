import { Router, Request, Response } from "express";
import { exec } from "child_process";

const router = Router();

interface TunnelPreflightResult {
  timestamp: string;
  system: {
    platform: string;
    arch: string;
    nodeVersion: string;
  };
  cloudflared: {
    installed: boolean;
    version?: string | null;
    isLatest?: boolean;
    latestVersion?: string;
  };
  warnings: string[];
  recommendations: string[];
  status: string;
}

// Check if cloudflared is installed and get version
async function checkCloudflared(): Promise<{
  installed: boolean;
  version?: string | null;
  path?: string;
  error?: string;
  hasBuildInfo?: boolean;
}> {
  return new Promise((resolve) => {
    // Set a timeout to handle cases where callback is never called
    const timeout = setTimeout(() => {
      resolve({
        installed: false,
        version: null,
        error: "Command timeout",
      });
    }, 5000);

    // Try to get cloudflared version
    exec("cloudflared --version", (error, stdout, stderr) => {
      clearTimeout(timeout);

      if (!error && stdout) {
        // Extract version number from various formats
        let version: string | undefined;
        const hasBuildInfo =
          stdout.includes("built") || stdout.includes("commit");

        // Try different version patterns
        let versionMatch = stdout.match(
          /cloudflared version v?(\d+\.\d+\.\d+[^\s]*)/,
        );
        if (versionMatch) {
          version = versionMatch[1];
        } else {
          // Try alternative format "Version: X.X.X"
          const altMatch = stdout.match(
            /Version:\s*v?(\d+\.\d+\.\d+[\w\-\.]*)/i,
          );
          if (altMatch) {
            version = altMatch[1].replace(/^v/, "");
          } else {
            // Try simple version number pattern
            const simpleMatch = stdout.match(/(\d+\.\d+\.\d+(?:-\w+)?)/);
            version = simpleMatch ? simpleMatch[1] : undefined;
          }
        }

        // If no version found but there's output, mark as unknown
        if (!version && stdout.trim()) {
          version = "unknown";
        }

        resolve({
          installed: true,
          version: version || "unknown",
          hasBuildInfo,
        });
      } else if (error) {
        // Try alternative method - check if executable exists in PATH
        const whereTimeout = setTimeout(() => {
          resolve({
            installed: false,
            version: null,
            error: error.message,
          });
        }, 2000);

        exec("where cloudflared", (whereError, whereStdout) => {
          clearTimeout(whereTimeout);

          if (!whereError && whereStdout) {
            resolve({
              installed: true,
              path: whereStdout.trim(),
              version: "unknown",
            });
          } else {
            resolve({
              installed: false,
              version: null,
              error: error.message,
            });
          }
        });
      } else {
        // Empty output case
        resolve({
          installed: true,
          version: "unknown",
        });
      }
    });
  });
}

// Compare version strings
function isVersionOutdated(current: string, minimum: string): boolean {
  try {
    const currentParts = current.split(".").map(Number);
    const minimumParts = minimum.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      const currentPart = currentParts[i] || 0;
      const minimumPart = minimumParts[i] || 0;

      if (currentPart < minimumPart) return true;
      if (currentPart > minimumPart) return false;
    }

    return false; // Equal versions
  } catch {
    return true; // If parsing fails, assume outdated
  }
}

// GET /cloudflare/preflight
router.get("/cloudflare/preflight", async (req: Request, res: Response) => {
  try {
    const latestVersion = "2025.11.1"; // Latest known stable version
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check cloudflared installation
    const cloudflaredCheck = await checkCloudflared();

    // Determine if installed version is latest
    let isLatest = false;
    if (cloudflaredCheck.installed && cloudflaredCheck.version) {
      // Check if version is known
      if (cloudflaredCheck.version === "unknown") {
        isLatest = false;
      } else {
        // Version is latest if it matches or is newer
        isLatest = !isVersionOutdated(cloudflaredCheck.version, latestVersion);
      }

      if (cloudflaredCheck.version === "unknown") {
        warnings.push("Could not parse version from cloudflared output");
        recommendations.push("Verify cloudflared installation");
      } else if (isVersionOutdated(cloudflaredCheck.version, latestVersion)) {
        const versionParts = cloudflaredCheck.version.split(".").map(Number);
        const latestParts = latestVersion.split(".").map(Number);
        const isVeryOutdated =
          versionParts[0] < latestParts[0] ||
          (versionParts[0] === latestParts[0] &&
            versionParts[1] < latestParts[1] - 2);

        warnings.push(
          `Cloudflared version ${cloudflaredCheck.version} is outdated version (recommended: ${latestVersion}+)`,
        );

        if (isVeryOutdated) {
          recommendations.push(
            "critical upgrade required - upgrade cloudflared immediately using: winget upgrade cloudflare.cloudflared",
          );
        } else {
          recommendations.push(
            "upgrade cloudflared using: winget upgrade cloudflare.cloudflared",
          );
        }

        // Add Windows service recommendation for upgrades
        if (process.platform === "win32") {
          recommendations.push(
            "Windows service: Restart cloudflared service after upgrade (service restart required)",
          );
        }
      } else {
        // Latest version - provide minimal operational recommendations only if no build info
        // Build info indicates production-ready installation
        if (process.platform === "win32" && !cloudflaredCheck.hasBuildInfo) {
          recommendations.push(
            "Windows service: Configure cloudflared to run as a service for production",
          );
          recommendations.push(
            "Setup monitoring for tunnel health and connectivity",
          );
        }
      }
    } else {
      // Not installed - include error details in warning if available
      if (cloudflaredCheck.error) {
        if (cloudflaredCheck.error.toLowerCase().includes("timeout")) {
          warnings.push(
            `Command execution timeout - cloudflared check timed out`,
          );
        } else if (
          cloudflaredCheck.error.toLowerCase().includes("permission") ||
          cloudflaredCheck.error.toLowerCase().includes("access")
        ) {
          warnings.push(
            `permission denied - cannot execute cloudflared command`,
          );
        } else {
          warnings.push(
            "Cloudflared is not installed or not accessible in PATH",
          );
        }
      } else {
        warnings.push("Cloudflared is not installed or not accessible in PATH");
      }

      recommendations.push(
        "Install cloudflared using: winget install cloudflare.cloudflared",
      );

      // Add installation guidance
      if (process.platform === "win32") {
        recommendations.push(
          "Configure cloudflared as a Windows service after installation",
        );
        recommendations.push(
          "See CLOUDFLARED_WINDOWS_PRODUCTION.md for setup instructions",
        );
      }
    }

    // System information
    const system = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    };

    // Determine overall status
    let status = "ready";
    if (!cloudflaredCheck.installed) {
      status = "error";
    } else if (cloudflaredCheck.version === "unknown" || !isLatest) {
      status = "warning";
    }

    const result: TunnelPreflightResult = {
      timestamp: new Date().toISOString(),
      system,
      cloudflared: {
        installed: cloudflaredCheck.installed,
        version: cloudflaredCheck.version || null,
        isLatest,
        latestVersion: latestVersion,
      },
      warnings,
      recommendations,
      status,
    };

    res.json(result);
  } catch (error) {
    console.error("Tunnel preflight check failed:", error);
    res.status(500).json({
      error: "Failed to run tunnel preflight check",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
