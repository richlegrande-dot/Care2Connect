import net from 'net';
import { integrityManager } from '../services/integrity/featureIntegrity';

export interface DemoModeConfig {
  enabled: boolean;
  requestedPort: number;
  actualPort: number;
  portAutoSelected: boolean;
  disabledServices: string[];
}

class DemoSafeMode {
  private config: DemoModeConfig = {
    enabled: false,
    requestedPort: 3001,
    actualPort: 3001,
    portAutoSelected: false,
    disabledServices: [],
  };

  constructor() {
    this.config.enabled = process.env.DEMO_SAFE_MODE === 'true';
    this.config.requestedPort = parseInt(process.env.PORT || '3001');
  }

  /**
   * Check if demo safe mode is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Find an available port starting from the requested port
   */
  public async findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
    let port = startPort;

    for (let i = 0; i < maxAttempts; i++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
      port++;
    }

    throw new Error(`Could not find available port after ${maxAttempts} attempts starting from ${startPort}`);
  }

  /**
   * Check if a port is available
   */
  private isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve(true);
      });

      server.listen(port);
    });
  }

  /**
   * Setup demo safe mode and return the port to use
   */
  public async setup(): Promise<number> {
    if (!this.config.enabled) {
      this.config.actualPort = this.config.requestedPort;
      return this.config.requestedPort;
    }

    console.log('\n🛡️  DEMO SAFE MODE ENABLED');
    console.log('═══════════════════════════════════════\n');

    // Check if requested port is available
    const portAvailable = await this.isPortAvailable(this.config.requestedPort);

    if (portAvailable) {
      this.config.actualPort = this.config.requestedPort;
      console.log(`✅ Requested port ${this.config.requestedPort} is available`);
    } else {
      console.log(`⚠️  Requested port ${this.config.requestedPort} is in use`);
      console.log('   Finding next available port...');

      const newPort = await this.findAvailablePort(this.config.requestedPort + 1);
      this.config.actualPort = newPort;
      this.config.portAutoSelected = true;

      console.log(`✅ Auto-selected port ${newPort}`);
    }

    // Check optional services
    this.checkOptionalServices();

    return this.config.actualPort;
  }

  /**
   * Check and log status of optional services
   */
  private checkOptionalServices(): void {
    const disabled: string[] = [];

    // Stripe
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_')) {
      disabled.push('Stripe (card payments) - QR donations will work');
    }

    // SMTP
    // SMTP/email delivery archived — not considered an optional service anymore

    // EVTS
    // Check is done in healthMonitor, we just note it here

    this.config.disabledServices = disabled;

    if (disabled.length > 0) {
      console.log('\n⚠️  Optional Services (Running in No-Keys Mode):');
      disabled.forEach(service => {
        console.log(`   • ${service}`);
      });
    }
  }

  /**
   * Display demo mode banner
   */
  public displayBanner(): void {
    if (!this.config.enabled) return;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = `http://localhost:${this.config.actualPort}`;

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  🎬 DEMO MODE ACTIVE 🎬                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📍 URLs:');
    console.log(`   Frontend:  ${frontendUrl}`);
    console.log(`   Backend:   ${backendUrl}`);
    console.log(`   Health:    ${backendUrl}/health/status`);
    console.log(`   Demo Info: ${backendUrl}/demo/status`);
    console.log('');

    if (this.config.portAutoSelected) {
      console.log('⚠️  Port Auto-Selection:');
      console.log(`   Requested: ${this.config.requestedPort} (in use)`);
      console.log(`   Using:     ${this.config.actualPort} (auto-selected)`);
      console.log('');
    }

    if (this.config.disabledServices.length > 0) {
      console.log('⚠️  Services in No-Keys Mode:');
      this.config.disabledServices.forEach(service => {
        console.log(`   • ${service}`);
      });
      console.log('');
    }

    const integrity = integrityManager.getIntegrityStatus();
    console.log('📊 Demo Readiness: ' + (integrity.ready ? 'Ready for presentation' : 'NOT READY — see blocking reasons'));
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  }

  /**
   * Get demo mode configuration
   */
  public getConfig(): DemoModeConfig {
    return { ...this.config };
  }

  /**
   * Get demo status for API endpoint
   */
  public getStatus(): {
    demoMode: boolean;
    demoModeEnabled: boolean;
    ready: boolean;
    urls: {
      frontend: string;
      backend: string;
      health: string;
      demoStatus: string;
    };
    requestedPort: number;
    actualPort: number;
    portAutoSelected: boolean;
    port: {
      requested: number;
      actual: number;
      autoSelected: boolean;
    };
    services: {
      available: string[];
      disabled: string[];
      stripe?: { enabled: boolean; reason?: string };
      smtp?: { enabled: boolean; reason?: string };
    };
    warnings: string[];
    integrity?: any;
  } {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = `http://localhost:${this.config.actualPort}`;

    const availableServices: string[] = [];
    const warnings: string[] = [];

    // Check what's available
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_')) {
      availableServices.push('Stripe card payments');
    }

    // SMTP archived; support tickets are always available via support log

    // Core services always available
    availableServices.push('QR code donations');
    availableServices.push('Word document export');
    availableServices.push('Support tickets');
    availableServices.push('Browser-based speech recognition');

    // Add warnings
    if (this.config.portAutoSelected) {
      warnings.push(`Port auto-selected: ${this.config.actualPort} (requested ${this.config.requestedPort} was in use)`);
    }

    if (this.config.disabledServices.length > 0) {
      warnings.push('Running in no-keys mode for some services');
    }

    const integrity = integrityManager.getIntegrityStatus();

    return {
      demoMode: this.config.enabled,
      demoModeEnabled: this.config.enabled,
      ready: integrity.ready,
      urls: {
        frontend: frontendUrl,
        backend: backendUrl,
        health: `${backendUrl}/health/status`,
        demoStatus: `${backendUrl}/demo/status`,
      },
      requestedPort: this.config.requestedPort,
      actualPort: this.config.actualPort,
      portAutoSelected: this.config.portAutoSelected,
      port: {
        requested: this.config.requestedPort,
        actual: this.config.actualPort,
        autoSelected: this.config.portAutoSelected,
      },
      services: {
        available: availableServices,
        disabled: this.config.disabledServices,
        stripe: {
          enabled: !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_')),
          reason: !(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_')) ? 'NO_KEYS_MODE' : undefined,
        },
        // smtp archived
      },
      warnings,
      integrity,
    };
  }
}

// Singleton instance
export const demoSafeMode = new DemoSafeMode();
