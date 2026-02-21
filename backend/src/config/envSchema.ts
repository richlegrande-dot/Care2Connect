/**
 * Environment Schema Validation
 * Validates required environment variables without exposing values
 */

export interface EnvConfig {
  // Core
  PORT: number;
  NODE_ENV: string;
  JWT_SECRET: string;
  
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
  
  // Health Checks
  HEALTHCHECKS_ENABLED: boolean;
  HEALTHCHECKS_INTERVAL_SEC: number;
  
  // System
  SYSTEM_PANEL_PASSWORD?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvConfig>;
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required for basic operation
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required for authentication');
  }
  
  // Stripe key format validation
  if (process.env.STRIPE_SECRET_KEY) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
      warnings.push('STRIPE_SECRET_KEY should start with sk_test_ or sk_live_');
    }
  }
  
  if (process.env.STRIPE_PUBLIC_KEY) {
    const publicKey = process.env.STRIPE_PUBLIC_KEY;
    if (!publicKey.startsWith('pk_test_') && !publicKey.startsWith('pk_live_')) {
      warnings.push('STRIPE_PUBLIC_KEY should start with pk_test_ or pk_live_');
    }
  }
  
  // Database URL format validation
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      warnings.push('DATABASE_URL should be a valid PostgreSQL connection string');
    }
  }
  
  // Optional but recommended
  const optionalVars = [
    'OPENAI_API_KEY',
    'DATABASE_URL', 
    'STRIPE_SECRET_KEY',
    'CLOUDFLARE_API_TOKEN'
  ];
  
  optionalVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`${varName} not set - service will be marked as unavailable`);
    }
  });

  const config: Partial<EnvConfig> = {
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET,
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
    HEALTHCHECKS_INTERVAL_SEC: parseInt(process.env.HEALTHCHECKS_INTERVAL_SEC || '300', 10),
    SYSTEM_PANEL_PASSWORD: process.env.SYSTEM_PANEL_PASSWORD
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

export function maskSecret(secret?: string): string {
  if (!secret) return 'not_set';
  if (secret.length < 8) return '***';
  return `${secret.substring(0, 4)}...${secret.slice(-4)}`;
}

export function logEnvironmentStatus(): void {
  const result = validateEnvironment();
  
  console.log('\n🔒 Environment Validation:');
  console.log(`Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log('\n🔐 Secret Status:');
  console.log(`  JWT_SECRET: ${maskSecret(result.config.JWT_SECRET)}`);
  console.log(`  DATABASE_URL: ${maskSecret(result.config.DATABASE_URL)}`);
  console.log(`  OPENAI_API_KEY: ${maskSecret(result.config.OPENAI_API_KEY)}`);
  console.log(`  STRIPE_SECRET_KEY: ${maskSecret(result.config.STRIPE_SECRET_KEY)}`);
  console.log(`  CLOUDFLARE_API_TOKEN: ${maskSecret(result.config.CLOUDFLARE_API_TOKEN)}`);
  
  console.log(`\n🏥 Health Checks: ${result.config.HEALTHCHECKS_ENABLED ? 'Enabled' : 'Disabled'}`);
  if (result.config.HEALTHCHECKS_ENABLED) {
    console.log(`  Interval: ${result.config.HEALTHCHECKS_INTERVAL_SEC}s`);
  }
  console.log('');
}
