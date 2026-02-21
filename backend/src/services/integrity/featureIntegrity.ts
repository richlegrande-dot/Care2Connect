/**
 * Feature Integrity System
 * 
 * Enforces strict feature dependency checking and prevents silent degradation.
 * Three modes: strict (fail on missing deps), demo (warn but allow), dev (permissive)
 */

export type IntegrityMode = 'strict' | 'demo' | 'dev';

export interface FeatureConfig {
  donations: boolean;
  email: boolean;
  transcription: boolean;
  storage: boolean;
  database: boolean;
}

export interface ServiceStatus {
  available: boolean;
  connectedSince?: string;
  lastCheck?: string;
  lastError?: string;
  required: boolean;
}

export interface IntegrityStatus {
  mode: IntegrityMode;
  ready: boolean;
  blockingReasons: string[];
  enabledFeatures: FeatureConfig;
  services: {
    database: ServiceStatus;
    storage: ServiceStatus;
    stripe: ServiceStatus;
    evtsModel: ServiceStatus;
  };
}

export class FeatureIntegrityManager {
  private mode: IntegrityMode;
  private features: FeatureConfig;
  private servicesStatus: IntegrityStatus['services'];
  private connectedSince: Record<string, string> = {};

  constructor() {
    this.mode = this.getIntegrityMode();
    this.features = this.getFeatureConfig();
    this.servicesStatus = this.initializeServicesStatus();
  }

  private getIntegrityMode(): IntegrityMode {
    const mode = (process.env.FEATURE_INTEGRITY_MODE || 'dev').toLowerCase() as IntegrityMode;
    if (!['strict', 'demo', 'dev'].includes(mode)) {
      console.warn(`⚠️  Invalid FEATURE_INTEGRITY_MODE: ${mode}. Defaulting to 'dev'.`);
      return 'dev';
    }
    return mode;
  }

  private getFeatureConfig(): FeatureConfig {
    // In dev/demo mode, make all features optional by default except core ones
    const isDevMode = this.mode === 'dev' || this.mode === 'demo';
    
    return {
      donations: process.env.FEATURE_DONATIONS_ENABLED !== 'false' && !isDevMode, // Optional in dev
      email: process.env.FEATURE_EMAIL_ENABLED !== 'false' && !isDevMode, // Optional in dev
      transcription: process.env.FEATURE_TRANSCRIPTION_ENABLED !== 'false',
      storage: process.env.FEATURE_STORAGE_ENABLED !== 'false',
      database: process.env.FEATURE_DATABASE_ENABLED !== 'false',
    };
  }

  private initializeServicesStatus(): IntegrityStatus['services'] {
    return {
      database: {
        available: false,
        // If DATABASE_URL not provided, do not mark database as required (FileStore mode)
        required: this.features.database && !!process.env.DATABASE_URL,
      },
      storage: {
        available: false,
        required: this.features.storage,
      },
      stripe: {
        available: false,
        required: this.features.donations,
      },
      evtsModel: {
        available: false,
        required: this.features.transcription,
      },
    };
  }

  public updateServiceStatus(
    service: keyof IntegrityStatus['services'],
    available: boolean,
    error?: string
  ) {
    const now = new Date().toISOString();
    
    if (available && !this.servicesStatus[service].available) {
      // Service just became available
      this.connectedSince[service] = now;
      this.servicesStatus[service].connectedSince = now;
    }

    this.servicesStatus[service].available = available;
    this.servicesStatus[service].lastCheck = now;
    
    if (error) {
      this.servicesStatus[service].lastError = error;
    }
  }

  public getIntegrityStatus(): IntegrityStatus {
    const blockingReasons: string[] = [];

    // Check each required service
    Object.entries(this.servicesStatus).forEach(([service, status]) => {
      if (status.required && !status.available) {
        const featureName = this.getFeatureNameForService(service);
        blockingReasons.push(
          `${service}: Required for ${featureName} feature but unavailable${status.lastError ? ` (${status.lastError})` : ''}`
        );
      }
    });

    const ready = blockingReasons.length === 0;

    return {
      mode: this.mode,
      ready,
      blockingReasons,
      enabledFeatures: this.features,
      services: this.servicesStatus,
    };
  }

  private getFeatureNameForService(service: string): string {
    const mapping: Record<string, string> = {
      database: 'database operations',
      storage: 'file storage',
      stripe: 'donations',
      evtsModel: 'transcription',
    };
    return mapping[service] || service;
  }

  public shouldFailOnMissingDeps(): boolean {
    const status = this.getIntegrityStatus();
    const allowPartialStart = process.env.ALLOW_PARTIAL_START === 'true';
    
    return this.mode === 'strict' && !status.ready && !allowPartialStart;
  }

  public getStartupBehavior(): {
    shouldExit: boolean;
    exitCode: number;
    message: string;
  } {
    const status = this.getIntegrityStatus();

    if (this.mode === 'strict' && !status.ready) {
      const allowPartialStart = process.env.ALLOW_PARTIAL_START === 'true';
      
      if (!allowPartialStart) {
        return {
          shouldExit: true,
          exitCode: 1,
          message: `
╔════════════════════════════════════════════════════════════╗
║  ❌ STRICT MODE: Required services missing                ║
╚════════════════════════════════════════════════════════════╝

Blocking reasons:
${status.blockingReasons.map(r => `  • ${r}`).join('\n')}

To fix:
1. Configure missing services (see .env.example)
2. OR set FEATURE_INTEGRITY_MODE=demo for partial boot
3. OR set ALLOW_PARTIAL_START=true (not recommended for production)

Server refusing to start.
`,
        };
      }
    }

    return {
      shouldExit: false,
      exitCode: 0,
      message: '',
    };
  }

  public getMode(): IntegrityMode {
    return this.mode;
  }

  public getFeatures(): FeatureConfig {
    return this.features;
  }

  public isFeatureEnabled(feature: keyof FeatureConfig): boolean {
    return this.features[feature];
  }

  public getConnectedSince(service: keyof IntegrityStatus['services']): string | undefined {
    return this.connectedSince[service];
  }
}

// Singleton instance
export const integrityManager = new FeatureIntegrityManager();
