import { PrismaClient } from '@prisma/client';

/**
 * Database Startup Gate
 * Validates DATABASE_URL and ensures DB connection before server starts
 * Enforces DB_MODE flag for local vs remote database strategy
 */

interface StartupCheckResult {
  success: boolean;
  error?: string;
  details?: any;
}

/**
 * Validate DB_MODE and DATABASE_URL alignment
 */
export function validateDbMode(): StartupCheckResult {
  const dbMode = process.env.DB_MODE;
  const dbUrl = process.env.DATABASE_URL;

  // DB_MODE is required
  if (!dbMode) {
    return {
      success: false,
      error: 'DB_MODE environment variable is not set',
      details: {
        action: 'Set DB_MODE=local or DB_MODE=remote in backend/.env file',
        recommendation: 'Use DB_MODE=local for development with Docker PostgreSQL',
      },
    };
  }

  // Validate DB_MODE value
  if (dbMode !== 'local' && dbMode !== 'remote') {
    return {
      success: false,
      error: `Invalid DB_MODE value: "${dbMode}"`,
      details: {
        allowed: ['local', 'remote'],
        found: dbMode,
      },
    };
  }

  // DATABASE_URL is required
  if (!dbUrl) {
    return {
      success: false,
      error: 'DATABASE_URL environment variable is not set',
      details: {
        action: 'Set DATABASE_URL in backend/.env file',
        format: 'postgresql://user:password@host:port/database',
      },
    };
  }

  // Enforce local mode constraints
  if (dbMode === 'local') {
    const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    if (!isLocalhost) {
      return {
        success: false,
        error: 'DB_MODE=local requires DATABASE_URL to point to localhost',
        details: {
          dbMode: 'local',
          databaseUrl: dbUrl.substring(0, 40) + '...',
          action: 'Either change DB_MODE=remote or update DATABASE_URL to localhost',
        },
      };
    }
  }

  // Warn about remote mode
  if (dbMode === 'remote') {
    const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    if (isLocalhost) {
      return {
        success: false,
        error: 'DB_MODE=remote but DATABASE_URL points to localhost',
        details: {
          dbMode: 'remote',
          databaseUrl: 'localhost',
          action: 'Either change DB_MODE=local or update DATABASE_URL to remote host',
        },
      };
    }

    // Emit loud warning for remote mode
    console.warn('\n' + '='.repeat(80));
    console.warn('⚠️  DATABASE MODE: REMOTE');
    console.warn('='.repeat(80));
    console.warn('Using remote database:', extractDbHost(dbUrl));
    console.warn('This is acceptable for cloud deployments but NOT recommended for local dev');
    console.warn('Recommendation: Use DB_MODE=local with Docker PostgreSQL for development');
    console.warn('='.repeat(80) + '\n');
  }

  return { success: true };
}

/**
 * Extract database host from connection string (for logging only)
 */
function extractDbHost(dbUrl: string): string {
  try {
    const match = dbUrl.match(/@([^:\/]+)/);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Validate DATABASE_URL format
 */
export function validateDatabaseUrl(): StartupCheckResult {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return {
      success: false,
      error: 'DATABASE_URL environment variable is not set',
      details: {
        action: 'Set DATABASE_URL in backend/.env file',
        format: 'postgresql://user:password@host:port/database',
      },
    };
  }

  // Validate format
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    return {
      success: false,
      error: 'DATABASE_URL must start with postgresql:// or postgres://',
      details: {
        found: dbUrl.substring(0, 20) + '...',
      },
    };
  }

  return { success: true };
}

/**
 * Test database connection with retries
 */
export async function testDatabaseConnection(
  prisma: PrismaClient,
  maxRetries: number = 3,
  retryDelayMs: number = 2000
): Promise<StartupCheckResult> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DB Startup] Attempting connection (attempt ${attempt}/${maxRetries})...`);

      // Simple ping query
      await prisma.$queryRaw`SELECT 1`;

      console.log(`[DB Startup] ✅ Connection successful`);
      return { success: true };

    } catch (error: any) {
      lastError = error;
      console.error(`[DB Startup] ❌ Connection attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(`[DB Startup] Retrying in ${retryDelayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  return {
    success: false,
    error: 'Failed to connect to database after multiple attempts',
    details: {
      attempts: maxRetries,
      lastError: lastError?.message || String(lastError),
      code: lastError?.code,
    },
  };
}

/**
 * Test schema integrity - verify critical tables exist
 */
export async function testSchemaIntegrity(prisma: PrismaClient): Promise<StartupCheckResult> {
  try {
    console.log('[DB Startup] Verifying schema integrity...');

    // Test critical tables exist
    await prisma.$queryRaw`SELECT 1 FROM "health_check_runs" LIMIT 1`;
    await prisma.$queryRaw`SELECT 1 FROM "stripe_events" LIMIT 1`;
    await prisma.$queryRaw`SELECT 1 FROM "stripe_attributions" LIMIT 1`;
    await prisma.$queryRaw`SELECT 1 FROM "recording_tickets" LIMIT 1`;

    console.log('[DB Startup] ✅ Schema integrity verified');
    return { success: true };

  } catch (error: any) {
    console.error('[DB Startup] ❌ Schema integrity check failed:', error.message);

    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      return {
        success: false,
        error: 'Database schema is out of sync',
        details: {
          message: error.message,
          action: 'Run: cd backend && npx prisma migrate deploy',
          note: 'This usually means migrations have not been applied',
        },
      };
    }

    return {
      success: false,
      error: 'Schema integrity check failed',
      details: {
        message: error.message,
        code: error.code,
      },
    };
  }
}

/**
 * Complete startup gate - run all checks
 */
export async function runStartupGate(prisma: PrismaClient): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🔒 DATABASE STARTUP GATE');
  console.log('='.repeat(60) + '\n');

  // Step 1: Validate DB_MODE configuration
  const dbModeValidation = validateDbMode();
  if (!dbModeValidation.success) {
    console.error('[DB Startup] ❌ DB_MODE validation failed');
    console.error('Error:', dbModeValidation.error);
    if (dbModeValidation.details) {
      console.error('Details:', JSON.stringify(dbModeValidation.details, null, 2));
    }
    console.error('\n🚨 SERVER CANNOT START WITHOUT VALID DB_MODE CONFIGURATION');
    process.exit(1);
  }

  console.log(`[DB Startup] ✅ DB_MODE=${process.env.DB_MODE} configuration valid`);

  // Step 2: Validate DATABASE_URL
  const urlValidation = validateDatabaseUrl();
  if (!urlValidation.success) {
    console.error('[DB Startup] ❌ DATABASE_URL validation failed');
    console.error('Error:', urlValidation.error);
    if (urlValidation.details) {
      console.error('Details:', JSON.stringify(urlValidation.details, null, 2));
    }
    console.error('\n🚨 SERVER CANNOT START WITHOUT VALID DATABASE CONNECTION');
    process.exit(1);
  }

  console.log('[DB Startup] ✅ DATABASE_URL format valid');

  // Step 2: Test connection
  const connectionTest = await testDatabaseConnection(prisma);
  if (!connectionTest.success) {
    console.error('[DB Startup] ❌ Database connection failed');
    console.error('Error:', connectionTest.error);
    if (connectionTest.details) {
      console.error('Details:', JSON.stringify(connectionTest.details, null, 2));
    }
    console.error('\n🚨 SERVER CANNOT START WITHOUT DATABASE CONNECTION');
    process.exit(1);
  }

  // Step 3: Test schema integrity
  const schemaTest = await testSchemaIntegrity(prisma);
  if (!schemaTest.success) {
    console.error('[DB Startup] ❌ Schema integrity check failed');
    console.error('Error:', schemaTest.error);
    if (schemaTest.details) {
      console.error('Details:', JSON.stringify(schemaTest.details, null, 2));
    }
    console.error('\n🚨 SERVER CANNOT START WITH INVALID SCHEMA');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ DATABASE STARTUP GATE: PASSED');
  console.log('='.repeat(60) + '\n');
}

/**
 * Runtime database watchdog state
 */
export class DatabaseWatchdog {
  private prisma: PrismaClient;
  private dbReady: boolean = true;
  private lastPingAt: Date | null = null;
  private lastError: string | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private failureCount: number = 0;
  private maxFailures: number = 3;

  constructor(prisma: PrismaClient, intervalMs: number = 30000) {
    this.prisma = prisma;
    this.startWatchdog(intervalMs);
  }

  private startWatchdog(intervalMs: number) {
    console.log(`[DB Watchdog] Starting (interval: ${intervalMs}ms)`);

    this.pingInterval = setInterval(async () => {
      await this.ping();
    }, intervalMs);
  }

  private async ping(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      
      if (!this.dbReady) {
        console.log('[DB Watchdog] ✅ Database connection restored');
      }

      this.dbReady = true;
      this.lastPingAt = new Date();
      this.lastError = null;
      this.failureCount = 0;

    } catch (error: any) {
      this.failureCount++;
      this.lastError = error.message;
      
      console.error(`[DB Watchdog] ❌ Ping failed (${this.failureCount}/${this.maxFailures}):`, error.message);

      if (this.failureCount >= this.maxFailures) {
        console.error('[DB Watchdog] 🚨 Maximum failures reached - marking database as unavailable');
        this.dbReady = false;

        // Attempt reconnect
        await this.attemptReconnect();
      }
    }
  }

  private async attemptReconnect(): Promise<void> {
    const maxRetries = 5;
    const retryDelayMs = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[DB Watchdog] Attempting reconnect (${attempt}/${maxRetries})...`);

      try {
        await this.prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.prisma.$connect();
        await this.prisma.$queryRaw`SELECT 1`;

        console.log('[DB Watchdog] ✅ Reconnect successful');
        this.dbReady = true;
        this.failureCount = 0;
        this.lastError = null;
        return;

      } catch (error: any) {
        console.error(`[DB Watchdog] Reconnect attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
      }
    }

    // All reconnect attempts failed
    console.error('[DB Watchdog] 🚨 CRITICAL: Database reconnection failed after all attempts');
    console.error('[DB Watchdog] Server will shut down to allow supervisor restart');
    
    // Log incident
    console.error(JSON.stringify({
      event: 'DATABASE_FAILURE',
      timestamp: new Date().toISOString(),
      failureCount: this.failureCount,
      lastError: this.lastError,
      action: 'SERVER_SHUTDOWN',
    }));

    // Graceful shutdown
    process.exit(1);
  }

  public isReady(): boolean {
    return this.dbReady;
  }

  public getStatus() {
    return {
      ready: this.dbReady,
      lastPingAt: this.lastPingAt,
      lastError: this.lastError,
      failureCount: this.failureCount,
    };
  }

  public stop() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      console.log('[DB Watchdog] Stopped');
    }
  }
}
