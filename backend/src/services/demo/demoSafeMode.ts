/**
 * Demo Safe Mode
 *
 * Automatically finds available port when default is taken.
 * Provides demo-friendly startup with clear status output.
 */

import net from "net";

export interface DemoConfig {
  enabled: boolean;
  portRangeStart: number;
  portRangeEnd: number;
  requestedPort: number;
}

export interface PortSelectionResult {
  port: number;
  wasRequested: boolean;
  attemptedPorts: number[];
}

class DemoSafeModeManager {
  private config: DemoConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): DemoConfig {
    const enabled = process.env.DEMO_SAFE_MODE === "true";
    const requestedPort = parseInt(process.env.PORT || "3001", 10);

    return {
      enabled,
      portRangeStart: parseInt(process.env.DEMO_PORT_RANGE_START || "3001", 10),
      portRangeEnd: parseInt(process.env.DEMO_PORT_RANGE_END || "3010", 10),
      requestedPort,
    };
  }

  public async findAvailablePort(): Promise<PortSelectionResult> {
    if (!this.config.enabled) {
      // Demo mode disabled, use requested port
      return {
        port: this.config.requestedPort,
        wasRequested: true,
        attemptedPorts: [],
      };
    }

    const attemptedPorts: number[] = [];

    // Try requested port first
    if (await this.isPortAvailable(this.config.requestedPort)) {
      return {
        port: this.config.requestedPort,
        wasRequested: true,
        attemptedPorts: [this.config.requestedPort],
      };
    }

    attemptedPorts.push(this.config.requestedPort);

    // Try ports in range
    for (
      let port = this.config.portRangeStart;
      port <= this.config.portRangeEnd;
      port++
    ) {
      if (port === this.config.requestedPort) continue; // Already tried

      attemptedPorts.push(port);

      if (await this.isPortAvailable(port)) {
        return {
          port,
          wasRequested: false,
          attemptedPorts,
        };
      }
    }

    // No port available in range
    throw new Error(
      `No available port found in range ${this.config.portRangeStart}-${this.config.portRangeEnd}. ` +
        `Tried: ${attemptedPorts.join(", ")}`,
    );
  }

  private isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          resolve(false);
        } else {
          resolve(false);
        }
      });

      server.once("listening", () => {
        server.close();
        resolve(true);
      });

      server.listen(port);
    });
  }

  public printDemoBanner(
    port: number,
    wasRequested: boolean,
    integrityStatus: any,
  ): void {
    if (!this.config.enabled) return;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const backendUrl = `http://localhost:${port}`;

    console.log("\n");
    console.log(
      "╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  🎭 DEMO SAFE MODE ACTIVE                                 ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝",
    );
    console.log("");
    console.log(`📊 Backend:  ${backendUrl}`);
    console.log(`🌐 Frontend: ${frontendUrl}`);
    console.log("");
    console.log(`🔧 Integrity Mode: ${integrityStatus.mode}`);
    console.log(`✅ Ready: ${integrityStatus.ready ? "YES" : "NO"}`);

    if (!wasRequested) {
      console.log(
        `\n⚠️  Requested port ${this.config.requestedPort} was taken`,
      );
      console.log(`   → Auto-selected port ${port} instead`);
    }

    if (integrityStatus.blockingReasons?.length > 0) {
      console.log("\n⚠️  Blocking Reasons:");
      integrityStatus.blockingReasons.forEach((reason: string) => {
        console.log(`   • ${reason}`);
      });
    }

    console.log("\n📋 Enabled Features:");
    Object.entries(integrityStatus.enabledFeatures).forEach(
      ([feature, enabled]) => {
        const icon = enabled ? "✓" : "✗";
        console.log(`   ${icon} ${feature}`);
      },
    );

    console.log("\n🚀 Server ready for demo");
    console.log(
      "════════════════════════════════════════════════════════════\n",
    );
  }

  public getDemoStatus(port: number, integrityStatus: any): object {
    return {
      demoMode: this.config.enabled,
      backend: {
        url: `http://localhost:${port}`,
        port,
        requestedPort: this.config.requestedPort,
        portWasAvailable: port === this.config.requestedPort,
      },
      frontend: {
        url: process.env.FRONTEND_URL || "http://localhost:3000",
      },
      integrity: {
        mode: integrityStatus.mode,
        ready: integrityStatus.ready,
        blockingReasons: integrityStatus.blockingReasons,
        enabledFeatures: integrityStatus.enabledFeatures,
      },
      timestamp: new Date().toISOString(),
    };
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public getConfig(): DemoConfig {
    return this.config;
  }
}

// Singleton instance
export const demoSafeModeManager = new DemoSafeModeManager();
