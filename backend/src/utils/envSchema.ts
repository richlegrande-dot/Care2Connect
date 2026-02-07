/**
 * Environment Schema Validation
 * Validates presence and format of environment variables at runtime
 * SECURITY: Never logs or prints actual secret values
 */

export interface EnvConfig {
  // Core application
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  JWT_SECRET?: string;
  SYSTEM_PANEL_PASSWORD?: string;

  // Database
  DATABASE_URL?: string;

  // OpenAI
  OPENAI_API_KEY?: string;

  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLIC_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;

  // Cloudflare
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ZONE_ID?: string;
  CLOUDFLARE_TUNNEL_ID?: string;
  CLOUDFLARE_DOMAIN?: string;

  // Health checks
  HEALTHCHECKS_ENABLED: boolean;
  HEALTHCHECKS_INTERVAL_SEC: number;

  // Frontend URLs
  FRONTEND_URL?: string;
}

export interface ValidationResult {
  isValid: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
  config: EnvConfig;
}

/**
 * Validate environment variable format without exposing values
 */
function validateFormat(key: string, value: string): { valid: boolean; error?: string } {
  switch (key) {
    case 'OPENAI_API_KEY':
      if (!value.startsWith('sk-')) {
        return { valid: false, error: 'Must start with sk-' };
      }
      if (value.length < 20) {
        return { valid: false, error: 'Invalid length' };
      }
      break;

    case 'STRIPE_SECRET_KEY':
      if (!value.startsWith('sk_test_') && !value.startsWith('sk_live_')) {
        return { valid: false, error: 'Must start with sk_test_ or sk_live_' };
      }
      break;

    case 'STRIPE_PUBLIC_KEY':
      if (!value.startsWith('pk_test_') && !value.startsWith('pk_live_')) {
        return { valid: false, error: 'Must start with pk_test_ or pk_live_' };
      }
      break;

    case 'DATABASE_URL':
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        return { valid: false, error: 'Must be PostgreSQL connection string' };
      }
      break;

    case 'CLOUDFLARE_API_TOKEN':
      if (value.length < 20) {
        return { valid: false, error: 'Invalid token length' };
      }
      break;

    case 'JWT_SECRET':
      if (value.length < 32) {
        return { valid: false, error: 'Must be at least 32 characters' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Mask sensitive values for logging (show only last 4 chars)
 */
function maskValue(value: string): string {
  if (value.length <= 4) return '****';
  return '****' + value.slice(-4);
}

/**
 * Validate all environment variables
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  // Required for production readiness (but server can start without)
  const optionalSecrets = [
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY', 
    'STRIPE_PUBLIC_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'DATABASE_URL',
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ZONE_ID',
    'CLOUDFLARE_TUNNEL_ID'
  ];

  // Check all optional secrets
  for (const key of optionalSecrets) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      const validation = validateFormat(key, value);
      if (!validation.valid) {
        invalid.push(`${key}: ${validation.error}`);
      }
    }
  }

  // Validate JWT_SECRET (warn if missing, error if invalid format)
  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET missing - using default (not secure for production)');
  } else {
    const jwtValidation = validateFormat('JWT_SECRET', process.env.JWT_SECRET);
    if (!jwtValidation.valid) {
      invalid.push(`JWT_SECRET: ${jwtValidation.error}`);
    }
  }

  // Build config
  const config: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    PORT: parseInt(process.env.PORT || '3001'),
    JWT_SECRET: process.env.JWT_SECRET,
    SYSTEM_PANEL_PASSWORD: process.env.SYSTEM_PANEL_PASSWORD,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
    CLOUDFLARE_TUNNEL_ID: process.env.CLOUDFLARE_TUNNEL_ID,
    CLOUDFLARE_DOMAIN: process.env.CLOUDFLARE_DOMAIN || 'care2connects.org',
    HEALTHCHECKS_ENABLED: process.env.HEALTHCHECKS_ENABLED === 'true',
    HEALTHCHECKS_INTERVAL_SEC: parseInt(process.env.HEALTHCHECKS_INTERVAL_SEC || '300'),
    FRONTEND_URL: process.env.FRONTEND_URL
  };

  // Log validation results (without secrets)
  if (missing.length > 0) {
    console.log(`[ENV] Missing optional secrets: ${missing.join(', ')}`);
    console.log('[ENV] Server will run in demo mode for missing integrations');
  }

  if (invalid.length > 0) {
    console.warn(`[ENV] Invalid format: ${invalid.join(', ')}`);
  }

  if (warnings.length > 0) {
    console.warn(`[ENV] Warnings: ${warnings.join(', ')}`);
  }

  // Show presence summary (masked)
  const presenceLog = optionalSecrets
    .map(key => {
      const value = process.env[key];
      return `${key}: ${value ? `present (${maskValue(value)})` : 'missing'}`;
    })
    .join(', ');
  
  console.log(`[ENV] Secrets summary: ${presenceLog}`);

  return {
    isValid: invalid.length === 0,
    missing,
    invalid,
    warnings,
    config
  };
}

/**
 * Global environment config (validated on startup)
 */
let _envConfig: EnvConfig;

export function getEnvConfig(): EnvConfig {
  if (!_envConfig) {
    const validation = validateEnvironment();
    _envConfig = validation.config;
    
    if (!validation.isValid) {
      console.error('[ENV] Environment validation failed, but server will continue in demo mode');
    }
  }
  return _envConfig;
}
