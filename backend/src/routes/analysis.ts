import { Router, Request, Response } from 'express';

const router = Router();

// Mock analysis data store (replace with actual database)
const analysisCache = new Map<string, any>();

/**
 * Get analysis results for a client
 * GET /api/analysis/:clientId
 */
router.get('/:clientId', (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    // Try to get from cache or database
    const analysisData = analysisCache.get(clientId);

    if (!analysisData) {
      // Return empty structure if not found
      return res.status(200).json({
        clientId,
        extractedFields: {},
        missingFields: [],
        followUpQuestions: [],
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json(analysisData);
  } catch (error: any) {
    console.error('[Analysis] Get error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve analysis data',
      message: error.message
    });
  }
});

/**
 * Save analysis results for a client
 * POST /api/analysis/:clientId
 * Body: { extractedFields, missingFields, followUpQuestions, transcript, sentiment }
 */
router.post('/:clientId', (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const analysisData = {
      clientId,
      ...req.body,
      timestamp: new Date().toISOString()
    };

    // Store in cache (in production, save to database)
    analysisCache.set(clientId, analysisData);

    return res.status(200).json({
      success: true,
      message: 'Analysis data saved',
      clientId
    });
  } catch (error: any) {
    console.error('[Analysis] Save error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save analysis data',
      message: error.message
    });
  }
});

/**
 * Delete analysis data for a client
 * DELETE /api/analysis/:clientId
 */
router.delete('/:clientId', (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    analysisCache.delete(clientId);

    return res.status(200).json({
      success: true,
      message: 'Analysis data deleted'
    });
  } catch (error: any) {
    console.error('[Analysis] Delete error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete analysis data',
      message: error.message
    });
  }
});

export default router;
