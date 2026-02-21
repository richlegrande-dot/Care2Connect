import { Request, Response, NextFunction } from "express";
import { DatabaseWatchdog } from "../utils/dbStartupGate";

/**
 * Middleware to check database availability before processing requests
 * Returns 503 Service Unavailable if database is not ready
 */
export function createDbReadyMiddleware(watchdog: DatabaseWatchdog) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Always allow health checks
    if (
      req.path === "/health" ||
      req.path === "/health/db" ||
      req.path === "/health/ping"
    ) {
      return next();
    }

    // Check database status
    if (!watchdog.isReady()) {
      const status = watchdog.getStatus();

      return res.status(503).json({
        error: "Service Unavailable",
        message: "Database connection is currently unavailable",
        details: {
          ready: false,
          lastPingAt: status.lastPingAt,
          // Don't expose raw error messages to clients
          hasError: !!status.lastError,
        },
        retryAfter: 30, // Suggest retry after 30 seconds
      });
    }

    next();
  };
}
