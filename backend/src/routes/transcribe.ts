import { Router } from 'express';
import { TranscribeController } from '../controllers/transcribeController';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

/**
 * POST /api/transcribe
 * Upload and transcribe audio file
 */
router.post(
  '/',
  TranscribeController.uploadAudio,
  [
    body('userId').optional().isString().withMessage('User ID must be a string'),
  ],
  validateRequest,
  TranscribeController.transcribeAudio
);

/**
 * GET /api/transcribe/:audioFileId/status
 * Get transcription status
 */
router.get(
  '/:audioFileId/status',
  [
    param('audioFileId').isString().withMessage('Audio file ID is required'),
  ],
  validateRequest,
  TranscribeController.getTranscriptionStatus
);

/**
 * POST /api/transcribe/:audioFileId/reprocess
 * Re-process transcript to extract profile data
 */
router.post(
  '/:audioFileId?/reprocess',
  [
    param('audioFileId').optional().isString().withMessage('Audio file ID must be a string'),
    body('transcript').isString().notEmpty().withMessage('Transcript is required'),
  ],
  validateRequest,
  TranscribeController.reprocessTranscript
);

/**
 * POST /api/transcribe/test-parser
 * Test parser functionality without audio file
 */
router.post(
  '/test-parser',
  [
    body('transcript').isString().notEmpty().withMessage('Transcript is required'),
  ],
  validateRequest,
  TranscribeController.reprocessTranscript
);

export default router;