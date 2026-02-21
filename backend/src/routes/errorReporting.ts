import { Router, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /errors/report
 * Public endpoint for user error reporting
 */
router.post('/report', async (req: Request, res: Response) => {
  try {
    const { message, stack, context, page, userAgent } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Create error entry
    const errorEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      message,
      stack: stack || null,
      page: page || null,
      userAgent: userAgent || req.get('User-Agent'),
      ip: req.ip,
      context: context || {},
      status: 'new',
    };

    // Ensure directory exists
    const errorsDir = path.join(process.cwd(), 'data/user-errors');
    await fs.mkdir(errorsDir, { recursive: true });

    // Write to JSONL file (one error per line)
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(errorsDir, `errors-${date}.jsonl`);

    await fs.appendFile(logFile, JSON.stringify(errorEntry) + '\n');

    console.log(`[ERROR REPORT] Logged user error: ${errorEntry.id}`);

    res.json({
      ok: true,
      errorId: errorEntry.id,
    });
  } catch (error: any) {
    console.error('[ERROR REPORT] Failed to log error:', error);
    res.status(500).json({ error: 'Failed to log error report' });
  }
});

export default router;
