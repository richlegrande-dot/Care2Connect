/**
 * Metrics Endpoint (Prometheus-compatible)
 * 
 * Exposes operational metrics for monitoring.
 */

import express, { Request, Response, Router } from 'express';
import { integrityManager } from '../integrity/featureIntegrity';

export interface MetricsData {
  uptime_seconds: number;
  health_ready_ok: number;
  integrity_ready: number;
  db_connected: number;
  storage_connected: number;
  memory_usage_bytes: number;
  memory_usage_mb: number;
  requests_total: Record<string, number>;
  errors_total: number;
  last_updated: string;
}

class MetricsManager {
  private startTime: number = Date.now();
  private requestCounts: Record<string, number> = {};
  private errorCount: number = 0;
  private lastHealthReady: boolean = false;
  private lastDbConnected: boolean = false;
  private lastStorageConnected: boolean = false;

  public recordRequest(routeGroup: string): void {
    this.requestCounts[routeGroup] = (this.requestCounts[routeGroup] || 0) + 1;
  }

  public recordError(): void {
    this.errorCount++;
  }

  public updateHealthStatus(ready: boolean, dbConnected: boolean, storageConnected: boolean): void {
    this.lastHealthReady = ready;
    this.lastDbConnected = dbConnected;
    this.lastStorageConnected = storageConnected;
  }

  public getMetrics(): MetricsData {
    const uptime = (Date.now() - this.startTime) / 1000;
    const memUsage = process.memoryUsage();
    const integrityStatus = integrityManager.getIntegrityStatus();

    return {
      uptime_seconds: Math.floor(uptime),
      health_ready_ok: this.lastHealthReady ? 1 : 0,
      integrity_ready: integrityStatus.ready ? 1 : 0,
      db_connected: this.lastDbConnected ? 1 : 0,
      storage_connected: this.lastStorageConnected ? 1 : 0,
      memory_usage_bytes: memUsage.heapUsed,
      memory_usage_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      requests_total: { ...this.requestCounts },
      errors_total: this.errorCount,
      last_updated: new Date().toISOString(),
    };
  }

  public getPrometheusFormat(): string {
    const metrics = this.getMetrics();
    let output = '';

    // Uptime
    output += `# HELP careconnect_uptime_seconds Server uptime in seconds\n`;
    output += `# TYPE careconnect_uptime_seconds counter\n`;
    output += `careconnect_uptime_seconds ${metrics.uptime_seconds}\n\n`;

    // Health ready
    output += `# HELP careconnect_health_ready_ok Health endpoint ready status (1=ready, 0=not ready)\n`;
    output += `# TYPE careconnect_health_ready_ok gauge\n`;
    output += `careconnect_health_ready_ok ${metrics.health_ready_ok}\n\n`;

    // Integrity ready
    output += `# HELP careconnect_integrity_ready Integrity system ready status (1=ready, 0=not ready)\n`;
    output += `# TYPE careconnect_integrity_ready gauge\n`;
    output += `careconnect_integrity_ready ${metrics.integrity_ready}\n\n`;

    // DB connected
    output += `# HELP careconnect_db_connected Database connection status (1=connected, 0=disconnected)\n`;
    output += `# TYPE careconnect_db_connected gauge\n`;
    output += `careconnect_db_connected ${metrics.db_connected}\n\n`;

    // Storage connected
    output += `# HELP careconnect_storage_connected Storage connection status (1=connected, 0=disconnected)\n`;
    output += `# TYPE careconnect_storage_connected gauge\n`;
    output += `careconnect_storage_connected ${metrics.storage_connected}\n\n`;

    // Memory usage
    output += `# HELP careconnect_memory_usage_bytes Memory usage in bytes\n`;
    output += `# TYPE careconnect_memory_usage_bytes gauge\n`;
    output += `careconnect_memory_usage_bytes ${metrics.memory_usage_bytes}\n\n`;

    // Requests by route group
    output += `# HELP careconnect_requests_total Total HTTP requests by route group\n`;
    output += `# TYPE careconnect_requests_total counter\n`;
    Object.entries(metrics.requests_total).forEach(([route, count]) => {
      output += `careconnect_requests_total{route="${route}"} ${count}\n`;
    });
    output += '\n';

    // Errors
    output += `# HELP careconnect_errors_total Total errors encountered\n`;
    output += `# TYPE careconnect_errors_total counter\n`;
    output += `careconnect_errors_total ${metrics.errors_total}\n\n`;

    return output;
  }

  public reset(): void {
    this.requestCounts = {};
    this.errorCount = 0;
  }
}

// Singleton instance
export const metricsManager = new MetricsManager();

// Metrics middleware
export function metricsMiddleware(req: Request, res: Response, next: Function) {
  const routeGroup = req.path.split('/')[1] || 'root';
  metricsManager.recordRequest(routeGroup);
  next();
}

// Token authentication middleware
function metricsAuthMiddleware(req: Request, res: Response, next: Function) {
  const enabled = process.env.METRICS_ENABLED === 'true';
  
  if (!enabled) {
    return res.status(404).json({
      error: 'Metrics endpoint not enabled. Set METRICS_ENABLED=true',
    });
  }

  const token = process.env.METRICS_TOKEN;
  
  // If no token is configured, allow access (dev mode)
  if (!token) {
    return next();
  }

  // Check Authorization header or query param
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;

  if (authHeader === `Bearer ${token}` || queryToken === token) {
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized. Provide METRICS_TOKEN via Authorization header or ?token= query param',
  });
}

// Metrics router
export function createMetricsRouter(): Router {
  const router = Router();

  router.get('/metrics', metricsAuthMiddleware, (req: Request, res: Response) => {
    const format = req.query.format as string;

    if (format === 'prometheus') {
      res.set('Content-Type', 'text/plain; version=0.0.4');
      res.send(metricsManager.getPrometheusFormat());
    } else {
      res.json(metricsManager.getMetrics());
    }
  });

  return router;
}
