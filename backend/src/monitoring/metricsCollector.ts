import { Request, Response, NextFunction } from 'express';
import { healthMonitor } from './healthMonitor';
import { integrityManager } from '../services/integrity/featureIntegrity';

export interface MetricsData {
  // snake_case (legacy)
  uptime_seconds: number;
  health_ready_ok: 0 | 1;
  health_degraded: 0 | 1;
  db_reconnect_attempts: number;
  memory_usage_bytes: number;
  memory_usage_heap_bytes: number;
  request_count_health: number;
  request_count_analysis: number;
  request_count_export: number;
  request_count_support: number;
  request_count_api: number;
  request_count_total: number;

  // camelCase aliases (used by tests)
  uptime?: number;
  healthReadyOk?: 0 | 1;
  healthDegraded?: 0 | 1;
  dbReconnectAttempts?: number;
  memoryUsageBytes?: number;
  memoryUsageHeapBytes?: number;
  requestCounts: {
    health: number;
    analysis: number;
    export: number;
    support: number;
    api: number;
    total: number;
  };
}

class MetricsCollector {
  private enabled: boolean;
  private token: string | undefined;
  private dbReconnectAttempts: number = 0;
  private startTime: number = Date.now();
  private requestCounts: {
    health: number;
    analysis: number;
    export: number;
    support: number;
    api: number;
    total: number;
  } = {
    health: 0,
    analysis: 0,
    export: 0,
    support: 0,
    api: 0,
    total: 0,
  };

  constructor() {
    // Enabled by default unless explicitly disabled for tests/environments
    this.enabled = process.env.METRICS_ENABLED !== 'false';
    this.token = process.env.METRICS_TOKEN;
  }

  /**
   * Check if metrics are enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Increment DB reconnect attempts
   */
  public incrementDbReconnectAttempts(): void {
    this.dbReconnectAttempts++;
  }

  /**
   * Reset DB reconnect attempts (on successful connection)
   */
  public resetDbReconnectAttempts(): void {
    this.dbReconnectAttempts = 0;
  }

  /**
   * Middleware to track request counts by route
   */
  public trackRequest(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      // Always count requests so tests and diagnostics can inspect traffic

      const path = req.path;

      // Categorize by route prefix
      if (path.startsWith('/health')) {
        this.requestCounts.health++;
      } else if (path.startsWith('/api/analysis')) {
        this.requestCounts.analysis++;
      } else if (path.startsWith('/api/export')) {
        this.requestCounts.export++;
      } else if (path.startsWith('/api/support')) {
        this.requestCounts.support++;
      } else if (path.startsWith('/api')) {
        this.requestCounts.api++;
      }

      this.requestCounts.total++;

      next();
    };
  }

  /**
   * Verify metrics token
   */
  public verifyToken(providedToken: string | undefined): boolean {
    // Allow dynamic token changes during tests by falling back to process.env
    if (!this.token) {
      this.token = process.env.METRICS_TOKEN;
    }
    if (!this.token) return false;
    return providedToken === this.token;
  }

  /**
   * Collect all metrics
   */
  public async collect(): Promise<MetricsData> {
    const health = await healthMonitor.performHealthCheck();
    const integrity = integrityManager.getIntegrityStatus();
    const memUsage = process.memoryUsage();
    const computedUptime = Math.floor((Date.now() - this.startTime) / 1000);

    // Determine readiness: prefer integrity.ready, fallback to health.status
    const readyFlag = integrity?.ready || health?.status === 'ready';
    const degradedFlag = (health?.status === 'degraded') || (health?.degraded?.enabled ? true : false);

    const metrics: MetricsData = {
      uptime_seconds: health?.uptimeSec ?? health?.uptime ?? computedUptime,
      health_ready_ok: readyFlag ? 1 : 0,
      health_degraded: degradedFlag ? 1 : 0,
      db_reconnect_attempts: this.dbReconnectAttempts,
      memory_usage_bytes: memUsage.rss,
      memory_usage_heap_bytes: memUsage.heapUsed,
      request_count_health: this.requestCounts.health,
      request_count_analysis: this.requestCounts.analysis,
      request_count_export: this.requestCounts.export,
      request_count_support: this.requestCounts.support,
      request_count_api: this.requestCounts.api,
      request_count_total: this.requestCounts.total,

      // camelCase aliases
      uptime: health?.uptimeSec ?? health?.uptime ?? computedUptime,
      healthReadyOk: integrity?.ready ? 1 : 0,
      healthDegraded: health?.degraded?.enabled ? 1 : 0,
      dbReconnectAttempts: this.dbReconnectAttempts,
      memoryUsageBytes: memUsage.rss,
      memoryUsageHeapBytes: memUsage.heapUsed,
      requestCounts: { ...this.requestCounts },
    };

    return metrics;
  }

  /**
   * Format metrics in Prometheus exposition format
   */
  public formatPrometheus(metrics: MetricsData): string {
    const lines: string[] = [];

    // Add HELP and TYPE for each metric
    lines.push('# HELP care2system_uptime_seconds Server uptime in seconds');
    lines.push('# TYPE care2system_uptime_seconds gauge');
    lines.push(`care2system_uptime_seconds ${metrics.uptime_seconds}`);
    lines.push('');

    lines.push('# HELP care2system_health_ready_ok Health check ready status (1=ready, 0=not ready)');
    lines.push('# TYPE care2system_health_ready_ok gauge');
    lines.push(`care2system_health_ready_ok ${metrics.health_ready_ok}`);
    lines.push('');

    lines.push('# HELP care2system_health_degraded Health check degraded status (1=degraded, 0=normal)');
    lines.push('# TYPE care2system_health_degraded gauge');
    lines.push(`care2system_health_degraded ${metrics.health_degraded}`);
    lines.push('');

    lines.push('# HELP care2system_db_reconnect_attempts Database reconnection attempts');
    lines.push('# TYPE care2system_db_reconnect_attempts counter');
    lines.push(`care2system_db_reconnect_attempts ${metrics.db_reconnect_attempts}`);
    lines.push('');

    lines.push('# HELP care2system_memory_usage_bytes Memory usage in bytes (RSS)');
    lines.push('# TYPE care2system_memory_usage_bytes gauge');
    lines.push(`care2system_memory_usage_bytes ${metrics.memory_usage_bytes}`);
    lines.push('');

    lines.push('# HELP care2system_memory_usage_heap_bytes Heap memory usage in bytes');
    lines.push('# TYPE care2system_memory_usage_heap_bytes gauge');
    lines.push(`care2system_memory_usage_heap_bytes ${metrics.memory_usage_heap_bytes}`);
    lines.push('');

    lines.push('# HELP care2system_request_count_total Total HTTP requests by route group');
    lines.push('# TYPE care2system_request_count_total counter');
    lines.push(`care2system_request_count_total{route="health"} ${metrics.request_count_health}`);
    lines.push(`care2system_request_count_total{route="analysis"} ${metrics.request_count_analysis}`);
    lines.push(`care2system_request_count_total{route="export"} ${metrics.request_count_export}`);
    lines.push(`care2system_request_count_total{route="support"} ${metrics.request_count_support}`);
    lines.push(`care2system_request_count_total{route="api"} ${metrics.request_count_api}`);
    lines.push(`care2system_request_count_total{route="total"} ${metrics.request_count_total}`);

    return lines.join('\n');
  }

  /**
   * Get request counts
   */
  public getRequestCounts() {
    return { ...this.requestCounts };
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();
