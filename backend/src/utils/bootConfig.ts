/**
 * System Configuration Boot Banner
 * Displays all critical environment flags on server startup
 */

export interface BootConfig {
  runMode: 'dev' | 'prod' | 'test';
  v1Stable: boolean;
  zeroOpenAI: boolean;
  aiProvider: string;
  transcriptionProvider: string;
  dbMode: 'local' | 'remote' | 'unknown';
  port: number;
  nodeEnv: string;
}

export function getBootConfig(): BootConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Determine run mode
  let runMode: 'dev' | 'prod' | 'test' = 'dev';
  if (nodeEnv === 'test') {
    runMode = 'test';
  } else if (process.env.RUN_MODE === 'prod' || nodeEnv === 'production') {
    runMode = 'prod';
  }

  return {
    runMode,
    v1Stable: process.env.V1_STABLE === 'true',
    zeroOpenAI: process.env.ZERO_OPENAI_MODE === 'true',
    aiProvider: process.env.AI_PROVIDER || 'rules',
    transcriptionProvider: process.env.TRANSCRIPTION_PROVIDER || process.env.TRANSCRIPTION_PREFERENCE || 'assemblyai',
    dbMode: (process.env.DB_MODE as 'local' | 'remote') || 'unknown',
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv
  };
}

export function printBootBanner(config: BootConfig): void {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    CARECONNECT BACKEND v1.0                    ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║ [BOOT] runMode=${config.runMode.padEnd(4)} v1Stable=${String(config.v1Stable).padEnd(5)} zeroOpenAI=${String(config.zeroOpenAI).padEnd(5)}       ║`);
  console.log(`║        aiProvider=${config.aiProvider.padEnd(10)} transcription=${config.transcriptionProvider.padEnd(10)}    ║`);
  console.log(`║        dbMode=${config.dbMode.padEnd(7)} port=${String(config.port).padEnd(4)} nodeEnv=${config.nodeEnv.padEnd(11)}  ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Warnings for production-critical settings
  if (config.runMode === 'prod' && config.dbMode === 'remote') {
    console.warn('⚠️  [BOOT] Running in production mode with remote database');
  }
  
  if (!config.v1Stable && config.runMode === 'prod') {
    console.warn('⚠️  [BOOT] V1_STABLE=false in production mode - not recommended');
  }
  
  if (!config.zeroOpenAI && (config.v1Stable || config.runMode === 'prod')) {
    console.warn('⚠️  [BOOT] ZERO_OPENAI_MODE not enabled - OpenAI may be called');
  }
  
  if (config.dbMode === 'unknown') {
    console.warn('⚠️  [BOOT] DB_MODE not set - database connectivity may be unpredictable');
  }
}

export function validateBootConfig(config: BootConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // V1 Stable mode validations
  if (config.v1Stable) {
    if (!config.zeroOpenAI) {
      errors.push('V1_STABLE=true requires ZERO_OPENAI_MODE=true');
    }
    if (config.aiProvider !== 'rules' && config.aiProvider !== 'none') {
      errors.push(`V1_STABLE=true requires AI_PROVIDER=rules or none, got: ${config.aiProvider}`);
    }
  }
  
  // Zero OpenAI mode validations
  if (config.zeroOpenAI) {
    if (config.aiProvider === 'openai') {
      errors.push('ZERO_OPENAI_MODE=true but AI_PROVIDER=openai - conflict');
    }
    if (config.transcriptionProvider === 'openai') {
      errors.push('ZERO_OPENAI_MODE=true but TRANSCRIPTION_PROVIDER=openai - conflict');
    }
  }
  
  // Database mode validations
  if (config.dbMode === 'unknown') {
    errors.push('DB_MODE must be set to "local" or "remote"');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
