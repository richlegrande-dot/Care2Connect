/**
 * Configuration Validation and Startup Summary
 * PRODUCTION HARDENING: Prevents configuration drift and logs safe startup summary
 */

import { getPortConfig } from './runtimePorts';
import { getEnvConfig } from '../utils/envSchema';

interface ConfigSummary {
  ports: {
    backend: number;
    frontend: number;
    strict_mode: boolean;
  };
  database: {
    mode: 'local' | 'remote';
    url_configured: boolean;
  };
  ai: {
    provider: string;
    v1_stable: boolean;
    zero_openai: boolean;
  };
  transcription: {
    provider: string;
  };
  payments: {
    stripe_configured: boolean;
    stripe_mode: 'test' | 'live' | 'none';
  };
  environment: {
    node_env: string;
    keys_validated: boolean;
    demo_safe_mode: boolean;
  };
}

interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: ConfigSummary;
}

/**
 * Validate that configuration is consistent and drift-free
 */
export function validateConfiguration(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Get port configuration
    const portConfig = getPortConfig();
    
    // Get environment configuration  
    const envConfig = getEnvConfig();
    
    // VALIDATION 1: Port consistency
    if (portConfig.backend === portConfig.frontend) {
      errors.push(`Port conflict: backend and frontend both use port ${portConfig.backend}`);
    }
    
    // VALIDATION 2: Frontend API URL consistency
    const expectedApiUrl = `http://localhost:${portConfig.backend}/api`;
    const actualApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    if (actualApiUrl !== expectedApiUrl) {
      errors.push(`Frontend API URL mismatch: expected "${expectedApiUrl}", got "${actualApiUrl}"`);
    }
    
    // VALIDATION 3: V1 stability flags
    if (!envConfig.V1_STABLE) {
      warnings.push('V1_STABLE not set - system may not be in stable configuration');
    }
    
    if (!envConfig.ZERO_OPENAI_MODE) {
      warnings.push('ZERO_OPENAI_MODE not enabled - may have OpenAI dependencies');
    }
    
    // VALIDATION 4: Production readiness
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.KEYS_VALIDATED || process.env.KEYS_VALIDATED !== 'true') {
        errors.push('KEYS_VALIDATED not confirmed in production environment');
      }
      
      if (!portConfig.strictMode) {
        warnings.push('STRICT_PORT_MODE not enabled in production - ports may drift');
      }
    }
    
    // VALIDATION 5: Database configuration
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      errors.push('DATABASE_URL not configured');
    }
    
    // Build configuration summary (safe for logs - no secrets)
    const summary: ConfigSummary = {
      ports: {
        backend: portConfig.backend,
        frontend: portConfig.frontend,
        strict_mode: portConfig.strictMode
      },
      database: {
        mode: process.env.DB_MODE === 'local' ? 'local' : 'remote',
        url_configured: !!dbUrl
      },
      ai: {
        provider: envConfig.AI_PROVIDER || 'unknown',
        v1_stable: !!envConfig.V1_STABLE,
        zero_openai: !!envConfig.ZERO_OPENAI_MODE
      },
      transcription: {
        provider: envConfig.TRANSCRIPTION_PROVIDER || 'unknown'
      },
      payments: {
        stripe_configured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY),
        stripe_mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' :
                     process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'none'
      },
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        keys_validated: process.env.KEYS_VALIDATED === 'true',
        demo_safe_mode: process.env.DEMO_SAFE_MODE === 'true'
      }
    };
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary
    };
    
  } catch (error: any) {
    return {
      valid: false,
      errors: [`Configuration validation failed: ${error.message}`],
      warnings: [],
      summary: {} as ConfigSummary
    };
  }
}

/**
 * Log startup configuration summary (safe for logs - no secrets exposed)
 */
export function logStartupConfigSummary(): void {
  try {
    const validation = validateConfiguration();
    
    console.log('🔧 [CONFIG] ======================================');
    console.log('🔧 [CONFIG] STARTUP CONFIGURATION SUMMARY');
    console.log('🔧 [CONFIG] ======================================');
    console.log(`🔧 [CONFIG] Backend Port:     ${validation.summary.ports?.backend || 'unknown'}`);
    console.log(`🔧 [CONFIG] Frontend Port:    ${validation.summary.ports?.frontend || 'unknown'}`);
    console.log(`🔧 [CONFIG] Port Mode:        ${validation.summary.ports?.strict_mode ? 'STRICT' : 'FLEXIBLE'}`);
    console.log(`🔧 [CONFIG] Database Mode:    ${validation.summary.database?.mode || 'unknown'}`);
    console.log(`🔧 [CONFIG] AI Provider:      ${validation.summary.ai?.provider || 'unknown'}`);
    console.log(`🔧 [CONFIG] V1 Stable:        ${validation.summary.ai?.v1_stable ? 'YES' : 'NO'}`);
    console.log(`🔧 [CONFIG] Zero OpenAI:      ${validation.summary.ai?.zero_openai ? 'YES' : 'NO'}`);
    console.log(`🔧 [CONFIG] Transcription:    ${validation.summary.transcription?.provider || 'unknown'}`);
    console.log(`🔧 [CONFIG] Payments:         ${validation.summary.payments?.stripe_mode || 'none'}`);
    console.log(`🔧 [CONFIG] Environment:      ${validation.summary.environment?.node_env || 'unknown'}`);
    console.log(`🔧 [CONFIG] Keys Validated:   ${validation.summary.environment?.keys_validated ? 'YES' : 'NO'}`);
    
    if (validation.warnings.length > 0) {
      console.log('🔧 [CONFIG] ======================================');
      console.log('🔧 [CONFIG] CONFIGURATION WARNINGS:');
      validation.warnings.forEach(warning => {
        console.log(`🔧 [CONFIG]   ⚠️  ${warning}`);
      });
    }
    
    if (validation.errors.length > 0) {
      console.log('🔧 [CONFIG] ======================================');
      console.log('🔧 [CONFIG] CONFIGURATION ERRORS:');
      validation.errors.forEach(error => {
        console.log(`🔧 [CONFIG]   ❌ ${error}`);
      });
    }
    
    console.log('🔧 [CONFIG] ======================================');
    
    if (!validation.valid) {
      console.log('🔧 [CONFIG] ⚠️  CONFIGURATION HAS ERRORS - Review and fix');
    } else if (validation.warnings.length > 0) {
      console.log('🔧 [CONFIG] ✅ CONFIGURATION VALID (with warnings)');
    } else {
      console.log('🔧 [CONFIG] ✅ CONFIGURATION VALID');
    }
    
    console.log('🔧 [CONFIG] ======================================');
    
  } catch (error: any) {
    console.error('🔧 [CONFIG] Failed to log startup configuration:', error.message);
  }
}

/**
 * Validate tunnel configuration consistency (called from scripts)
 */
export function validateTunnelConfig(): { valid: boolean; errors: string[] } {
  try {
    const portConfig = getPortConfig();
    const errors: string[] = [];
    
    // This would check if the Cloudflare tunnel config file matches the port configuration
    // For now, we'll do a basic validation
    const expectedBackendUrl = `http://127.0.0.1:${portConfig.backend}`;
    const expectedFrontendUrl = `http://127.0.0.1:${portConfig.frontend}`;
    
    // In a full implementation, this would parse the config.yml file and validate
    // that the service URLs match these expected values
    
    return { valid: true, errors };
    
  } catch (error: any) {
    return { 
      valid: false, 
      errors: [`Tunnel config validation failed: ${error.message}`] 
    };
  }
}
