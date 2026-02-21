/**
 * Request Performance Middleware — tracks per-route latency baselines
 * @module middleware/requestPerformance
 */

import { Request, Response, NextFunction } from "express";

interface RouteMetrics {
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  latencies: number[];
}

const routeMetrics = new Map<string, RouteMetrics>();
const MAX_LATENCIES = 1000; // Keep last N latencies for percentile calc

/**
 * Middleware that records request latency per route.
 */
export function requestPerformanceMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const durationNs = Number(process.hrtime.bigint() - start);
      const durationMs = durationNs / 1e6;

      // Normalize route key: METHOD + route path (use matched route if available)
      const routePath = (req.route?.path as string) || req.path;
      const key = `${req.method} ${routePath}`;

      let metrics = routeMetrics.get(key);
      if (!metrics) {
        metrics = {
          count: 0,
          totalMs: 0,
          minMs: Infinity,
          maxMs: 0,
          p95Ms: 0,
          latencies: [],
        };
        routeMetrics.set(key, metrics);
      }

      metrics.count++;
      metrics.totalMs += durationMs;
      metrics.minMs = Math.min(metrics.minMs, durationMs);
      metrics.maxMs = Math.max(metrics.maxMs, durationMs);

      // Keep bounded latency window
      metrics.latencies.push(durationMs);
      if (metrics.latencies.length > MAX_LATENCIES) {
        metrics.latencies.shift();
      }

      // Compute p95
      const sorted = [...metrics.latencies].sort((a, b) => a - b);
      const p95Idx = Math.floor(sorted.length * 0.95);
      metrics.p95Ms = sorted[p95Idx] ?? durationMs;
    });

    next();
  };
}

/**
 * GET /metrics/performance — returns per-route performance data
 */
export function performanceMetricsHandler(_req: Request, res: Response) {
  const result: Record<
    string,
    {
      count: number;
      avgMs: number;
      minMs: number;
      maxMs: number;
      p95Ms: number;
    }
  > = {};

  for (const [route, m] of routeMetrics.entries()) {
    result[route] = {
      count: m.count,
      avgMs: m.count > 0 ? Math.round((m.totalMs / m.count) * 100) / 100 : 0,
      minMs: m.minMs === Infinity ? 0 : Math.round(m.minMs * 100) / 100,
      maxMs: Math.round(m.maxMs * 100) / 100,
      p95Ms: Math.round(m.p95Ms * 100) / 100,
    };
  }

  res.json({ routes: result, collectedAt: new Date().toISOString() });
}
