/**
 * Port Configuration - Single Source of Truth
 * 
 * Centralizes port configuration and validation to prevent:
 * - Port conflicts
 * - Silent port switching in production
 * - Mismatched frontend/backend port configuration
 * 
 * Environment variables (priority order):
 *   1. BACKEND_PORT (preferred, explicit)
 *   2. PORT (legacy fallback)
 * 
 * Modes:
 *   - STRICT_PORT_MODE=true: Exit if port occupied (production default)
 *   - STRICT_PORT_MODE=false: Try alternative ports (development)
 */

import { execSync } from 'child_process';

export interface PortConfig {
  port: number;
  strictMode: boolean;
  maxFailoverAttempts: number;
  source: 'BACKEND_PORT' | 'PORT' | 'default';
}

/**
 * Get port configuration from environment
 */
export function getPortConfig(): PortConfig {
  // Prefer BACKEND_PORT over PORT
  let port: number;
  let source: 'BACKEND_PORT' | 'PORT' | 'default';

  if (process.env.BACKEND_PORT) {
    port = parseInt(process.env.BACKEND_PORT, 10);
    source = 'BACKEND_PORT';
  } else if (process.env.PORT) {
    port = parseInt(process.env.PORT, 10);
    source = 'PORT';
  } else {
    port = 3001; // Default
    source = 'default';
  }

  // Validate port number
  if (isNaN(port) || port < 1024 || port > 65535) {
    console.error(`❌ Invalid port number: ${port}`);
    console.error('   Port must be between 1024 and 65535');
    throw new Error(`Invalid port: ${port}`);
  }

  // Strict mode in production or when explicitly enabled
  const strictMode = 
    process.env.STRICT_PORT_MODE === 'true' || 
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'development'; // Also strict in dev to catch issues early

  const maxFailoverAttempts = strictMode ? 0 : parseInt(process.env.PORT_FAILOVER_RANGE || '5', 10);

  return {
    port,
    strictMode,
    maxFailoverAttempts,
    source
  };
}

/**
 * Check if a port is in use
 */
export function isPortInUse(port: number): boolean {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const lines = output.trim().split('\n');
    const listening = lines.some(line => 
      line.includes('LISTENING') && line.includes(`:${port}`)
    );

    return listening;
  } catch (error) {
    // netstat returns error if no matches found
    return false;
  }
}

/**
 * Get PID of process using a port
 */
export function getPortOwner(port: number): number | null {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const lines = output.trim().split('\n');
    const listeningLine = lines.find(line => 
      line.includes('LISTENING') && line.includes(`:${port}`)
    );

    if (listeningLine) {
      const parts = listeningLine.trim().split(/\s+/);
      const pid = parseInt(parts[parts.length - 1], 10);
      return isNaN(pid) ? null : pid;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Preflight port check - exits if port is occupied in strict mode
 */
export function preflightPortCheck(config: PortConfig): void {
  if (isPortInUse(config.port)) {
    const pid = getPortOwner(config.port);
    
    console.error(`\n❌ PORT ${config.port} IS OCCUPIED!`);
    if (pid) {
      console.error(`   Process using port: PID ${pid}`);
      console.error(`   Kill process: taskkill /F /PID ${pid}`);
    }
    console.error(`   Or run: .\\scripts\\check-port.ps1 ${config.port}`);
    console.error('');

    if (config.strictMode) {
      console.error('🚨 STRICT_PORT_MODE is enabled - cannot start with occupied port');
      console.error('   Options:');
      console.error('     1. Kill the conflicting process');
      console.error('     2. Change BACKEND_PORT in .env');
      console.error('     3. Set STRICT_PORT_MODE=false (not recommended for production)');
      console.error('');
      process.exit(1);
    } else {
      console.warn('⚠️  Will attempt to bind to alternative port...');
    }
  } else {
    console.log(`✅ Port ${config.port} is available`);
  }
}

/**
 * Validate frontend/backend port consistency
 */
export function validatePortConsistency(): void {
  const backendPort = process.env.BACKEND_PORT || process.env.PORT || '3001';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  if (apiUrl && !apiUrl.includes(backendPort) && !apiUrl.includes('care2connect')) {
    console.warn('\n⚠️  PORT CONFIGURATION WARNING:');
    console.warn(`   Backend port: ${backendPort}`);
    console.warn(`   Frontend API URL: ${apiUrl}`);
    console.warn('   These may not match! Frontend requests may fail.');
    console.warn('   Update NEXT_PUBLIC_API_URL in frontend/.env');
    console.warn('');
  }
}

/**
 * Print port configuration summary
 */
export function printPortConfig(config: PortConfig): void {
  console.log('\n🔌 PORT CONFIGURATION');
  console.log('====================');
  console.log(`Port: ${config.port} (from ${config.source})`);
  console.log(`Strict Mode: ${config.strictMode ? 'ENABLED' : 'DISABLED'}`);
  if (!config.strictMode) {
    console.log(`Failover Attempts: ${config.maxFailoverAttempts}`);
  }
  console.log('');
}
