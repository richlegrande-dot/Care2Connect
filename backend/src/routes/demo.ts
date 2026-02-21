import { Router, Request, Response } from 'express';
import { demoSafeMode } from '../monitoring/demoSafeMode';

const router = Router();

/**
 * GET /demo/status
 * Returns demo readiness information
 */
router.get('/status', (req: Request, res: Response) => {
  const status = demoSafeMode.getStatus();
  
  res.status(200).json(status);
});

export default router;
