/**
 * Test Environment Configuration
 * 
 * Central configuration for all parsing tests to prevent environment drift
 */

export function configureTestEnvironment(): void {
  // Core test environment settings
  process.env.NODE_ENV = 'test';
  process.env.ZERO_OPENAI_MODE = 'true';
  process.env.TRANSCRIPTION_PROVIDER = 'stub';
  
  // Database settings for tests
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';
  
  // Disable external services in tests
  process.env.DISABLE_HEALTH_CHECKS = 'true';
  process.env.DISABLE_AUTO_RECOVERY = 'true';
  
  // Telemetry settings for tests
  process.env.TELEMETRY_ENABLED = 'true';
  process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
}

/**
 * Reset environment after tests
 */
export function resetTestEnvironment(): void {
  delete process.env.NODE_ENV;
  delete process.env.ZERO_OPENAI_MODE;
  delete process.env.TRANSCRIPTION_PROVIDER;
  delete process.env.DISABLE_HEALTH_CHECKS;
  delete process.env.DISABLE_AUTO_RECOVERY;
  delete process.env.TELEMETRY_ENABLED;
  delete process.env.LOG_LEVEL;
}

/**
 * Verify test environment is properly configured
 */
export function verifyTestEnvironment(): void {
  const required = [
    'NODE_ENV',
    'ZERO_OPENAI_MODE',
    'TRANSCRIPTION_PROVIDER'
  ];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Test environment variable ${envVar} is not set. Call configureTestEnvironment() first.`);
    }
  }
  
  if (process.env.ZERO_OPENAI_MODE !== 'true') {
    throw new Error('Tests must run with ZERO_OPENAI_MODE=true to ensure deterministic results');
  }
}