/**
 * Production Runtime Ports Configuration
 *
 * CRITICAL: This is the single source of truth for all port configuration.
 * All services must reference these values. NO port drift allowed.
 *
 * Fail-fast behavior: If a port is occupied, show actionable error and exit immediately.
 */

import * as net from "net";
import { spawn } from "child_process";

export interface PortConfig {
  backend: number;
  frontend: number;
  strictMode: boolean;
}

export interface PortValidationResult {
  isValid: boolean;
  errors: string[];
  occupiedPorts: Array<{ port: number; pid?: number; process?: string }>;
}

/**
 * Get port configuration from environment with validation
 */
export function getPortConfig(): PortConfig {
  const backend = parseInt(process.env.PORT || "3001", 10);
  const frontend = parseInt(process.env.FRONTEND_PORT || "3000", 10);
  const strictMode = process.env.STRICT_PORT_MODE === "true";

  // Validate port numbers
  if (isNaN(backend) || backend < 1024 || backend > 65535) {
    console.error(
      `❌ CRITICAL: Invalid backend port: ${process.env.PORT || "3001"}`,
    );
    console.error("   PORT must be a number between 1024-65535");
    process.exit(1);
  }

  if (isNaN(frontend) || frontend < 1024 || frontend > 65535) {
    console.error(
      `❌ CRITICAL: Invalid frontend port: ${process.env.FRONTEND_PORT || "3000"}`,
    );
    console.error("   FRONTEND_PORT must be a number between 1024-65535");
    process.exit(1);
  }

  if (backend === frontend) {
    console.error(
      `❌ CRITICAL: Backend and frontend ports cannot be the same: ${backend}`,
    );
    console.error("   Set different values for PORT and FRONTEND_PORT");
    process.exit(1);
  }

  return { backend, frontend, strictMode };
}

/**
 * Check if a port is occupied and get process information
 */
async function getPortOccupant(
  port: number,
): Promise<{ pid?: number; process?: string } | null> {
  return new Promise((resolve) => {
    // Try to bind to the port to check if it's available
    const testServer = net.createServer();

    testServer.listen(port, "127.0.0.1", () => {
      testServer.close();
      resolve(null); // Port is available
    });

    testServer.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        // Port is occupied, try to find which process
        const netstat = spawn("netstat", ["-ano"], { shell: true });
        let output = "";

        netstat.stdout?.on("data", (data) => {
          output += data.toString();
        });

        netstat.on("close", () => {
          try {
            const lines = output.split("\n");
            const portLine = lines.find(
              (line) =>
                line.includes(`:${port} `) && line.includes("LISTENING"),
            );

            if (portLine) {
              const parts = portLine.trim().split(/\s+/);
              const pid = parseInt(parts[parts.length - 1], 10);

              if (!isNaN(pid)) {
                // Try to get process name
                const tasklist = spawn(
                  "tasklist",
                  ["/FI", `PID eq ${pid}`, "/FO", "CSV"],
                  { shell: true },
                );
                let taskOutput = "";

                tasklist.stdout?.on("data", (data) => {
                  taskOutput += data.toString();
                });

                tasklist.on("close", () => {
                  try {
                    const taskLines = taskOutput.split("\n");
                    if (taskLines.length > 1) {
                      const processInfo = taskLines[1].split(",");
                      const processName =
                        processInfo[0]?.replace(/"/g, "") || "unknown";
                      resolve({ pid, process: processName });
                    } else {
                      resolve({ pid });
                    }
                  } catch {
                    resolve({ pid });
                  }
                });

                return;
              }
            }
            resolve({}); // Port occupied but can't identify process
          } catch {
            resolve({}); // Port occupied but can't identify process
          }
        });
      } else {
        resolve(null); // Other error, assume available
      }
    });
  });
}

/**
 * Validate that required ports are available
 * FAIL-FAST: Exit immediately if ports are occupied in strict mode
 */
export async function validatePorts(
  config: PortConfig,
): Promise<PortValidationResult> {
  const errors: string[] = [];
  const occupiedPorts: Array<{ port: number; pid?: number; process?: string }> =
    [];

  // Check backend port
  const backendOccupant = await getPortOccupant(config.backend);
  if (backendOccupant !== null) {
    const backendInfo = { port: config.backend, ...backendOccupant };
    occupiedPorts.push(backendInfo);

    let errorMsg = `Backend port ${config.backend} is occupied`;
    if (backendOccupant.pid) {
      errorMsg += ` by PID ${backendOccupant.pid}`;
      if (backendOccupant.process) {
        errorMsg += ` (${backendOccupant.process})`;
      }
    }
    errors.push(errorMsg);
  }

  // Check frontend port
  const frontendOccupant = await getPortOccupant(config.frontend);
  if (frontendOccupant !== null) {
    const frontendInfo = { port: config.frontend, ...frontendOccupant };
    occupiedPorts.push(frontendInfo);

    let errorMsg = `Frontend port ${config.frontend} is occupied`;
    if (frontendOccupant.pid) {
      errorMsg += ` by PID ${frontendOccupant.pid}`;
      if (frontendOccupant.process) {
        errorMsg += ` (${frontendOccupant.process})`;
      }
    }
    errors.push(errorMsg);
  }

  const isValid = errors.length === 0;

  // FAIL-FAST in strict mode
  if (!isValid && config.strictMode) {
    console.error("\n❌ CRITICAL: Port validation failed in STRICT_PORT_MODE");
    console.error("   Occupied ports detected:");

    for (const occupied of occupiedPorts) {
      console.error(
        `   - Port ${occupied.port}: PID ${occupied.pid || "unknown"}${occupied.process ? ` (${occupied.process})` : ""}`,
      );
    }

    console.error("\n📋 ACTIONS REQUIRED:");
    for (const occupied of occupiedPorts) {
      if (occupied.pid) {
        console.error(`   • Kill process: taskkill /PID ${occupied.pid} /F`);
      } else {
        console.error(
          `   • Check what's using port ${occupied.port}: netstat -ano | findstr :${occupied.port}`,
        );
      }
    }

    console.error("\n🚨 Server cannot start. Fix port conflicts first.");
    process.exit(1);
  }

  return { isValid, errors, occupiedPorts };
}

/**
 * Print port configuration summary (safe for logs)
 */
export function logPortConfiguration(config: PortConfig): void {
  console.log("📋 [PORT CONFIG] Port Configuration:");
  console.log(`📋 [PORT CONFIG]   Backend:  ${config.backend}`);
  console.log(`📋 [PORT CONFIG]   Frontend: ${config.frontend}`);
  console.log(
    `📋 [PORT CONFIG]   Mode:     ${config.strictMode ? "STRICT" : "FLEXIBLE"}`,
  );
  console.log("📋 [PORT CONFIG] ====================================");
}
