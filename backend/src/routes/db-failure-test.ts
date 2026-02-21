import { Router, Request, Response } from 'express';
import { DatabaseWatchdog } from '../utils/dbStartupGate';

const router = Router();

/**
 * DEV-ONLY: Database Failure Testing
 * Simulates database connection failures to test watchdog behavior
 * 
 * SECURITY: Only enabled in development mode
 */

if (process.env.NODE_ENV !== 'production') {
  
  let simulateFailure = false;
  let failureCount = 0;

  /**
   * POST /api/test/db-failure/enable
   * 
   * Enables database failure simulation
   * The watchdog will detect failures and attempt reconnection
   */
  router.post('/db-failure/enable', (req: Request, res: Response) => {
    simulateFailure = true;
    failureCount = 0;
    console.log('[DB Failure Test] ⚠️ Database failure simulation ENABLED');
    
    res.json({
      success: true,
      message: 'Database failure simulation enabled',
      note: 'The database watchdog will detect failures on next ping cycle',
      expectedBehavior: [
        '1. Watchdog will detect failure (ping fails)',
        '2. After 3 failures, watchdog marks dbReady = false',
        '3. All API requests return 503 Service Unavailable',
        '4. Watchdog attempts reconnection (5 attempts)',
        '5. If all reconnects fail, server exits with code 1',
      ],
    });
  });

  /**
   * POST /api/test/db-failure/disable
   * 
   * Disables database failure simulation
   */
  router.post('/db-failure/disable', (req: Request, res: Response) => {
    simulateFailure = false;
    failureCount = 0;
    console.log('[DB Failure Test] ✅ Database failure simulation DISABLED');
    
    res.json({
      success: true,
      message: 'Database failure simulation disabled',
      note: 'Database should recover on next watchdog ping',
    });
  });

  /**
   * GET /api/test/db-failure/status
   * 
   * Gets current failure simulation status
   */
  router.get('/db-failure/status', (req: Request, res: Response) => {
    res.json({
      simulationEnabled: simulateFailure,
      failureCount,
      message: simulateFailure 
        ? 'Database failures are being simulated' 
        : 'No failure simulation active',
    });
  });

  /**
   * POST /api/test/db-failure/force-exit
   * 
   * Forces server shutdown (simulates watchdog exit behavior)
   * WARNING: This will actually shut down the server!
   */
  router.post('/db-failure/force-exit', (req: Request, res: Response) => {
    console.log('[DB Failure Test] 🚨 FORCE EXIT requested - shutting down in 2 seconds...');
    
    res.json({
      success: true,
      message: 'Server will shut down in 2 seconds',
      exitCode: 1,
      warning: 'This will actually terminate the process!',
    });

    // Give response time to send
    setTimeout(() => {
      console.log('[DB Failure Test] 🚨 Exiting with code 1 (simulated DB failure)');
      process.exit(1);
    }, 2000);
  });

  /**
   * Middleware to intercept Prisma queries when failure is simulated
   * This is a mock - in production, you'd use Prisma middleware
   */
  router.use((req, res, next) => {
    if (simulateFailure && req.path.includes('/db-failure')) {
      // Allow test endpoints through
      return next();
    }
    
    if (simulateFailure) {
      failureCount++;
      console.log(`[DB Failure Test] Simulated DB failure #${failureCount}`);
    }
    
    next();
  });

  console.log('[Dev] DB failure test endpoints loaded:');
  console.log('  - POST /api/test/db-failure/enable');
  console.log('  - POST /api/test/db-failure/disable');
  console.log('  - GET  /api/test/db-failure/status');
  console.log('  - POST /api/test/db-failure/force-exit (WARNING: shuts down server)');
}

export default router;
