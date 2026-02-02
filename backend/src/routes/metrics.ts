import { Router, Request, Response } from 'express';
import { metricsCollector } from '../monitoring/metricsCollector';

const router = Router();

/**
 * Middleware to protect metrics endpoint with token
 */
const metricsAuth = (req: Request, res: Response, next: Function) => {
  if (!metricsCollector.isEnabled()) {
    return res.status(503).json({
      error: 'Metrics not enabled',
      detail: 'Set METRICS_ENABLED=true and METRICS_TOKEN in environment',
    });
  }

  const providedToken = req.headers['authorization']?.replace('Bearer ', '') || 
                       req.query.token as string;

  if (!metricsCollector.verifyToken(providedToken)) {
    return res.status(403).json({
      error: 'Unauthorized',
      detail: 'Invalid or missing metrics token',
    });
  }

  next();
};

/**
 * GET /metrics
 * Returns Prometheus-formatted metrics
 */
router.get('/', metricsAuth, async (req: Request, res: Response) => {
  try {
    const metrics = await metricsCollector.collect();
    const format = req.query.format as string;

    if (format === 'json') {
      res.status(200).json(metrics);
    } else {
      // Default: Prometheus format
      const prometheusText = metricsCollector.formatPrometheus(metrics);
      res.setHeader('Content-Type', 'text/plain; version=0.0.4');
      res.status(200).send(prometheusText);
    }
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to collect metrics',
      detail: error.message,
    });
  }
});

export default router;
