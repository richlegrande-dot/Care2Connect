import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import DataProtectionService from '../middleware/dataProtectionService';
import { TranscriptionService, TranscriptionResult } from '../services/transcriptionService';
import StoryExtractionService from '../services/storyExtractionService';
import FollowUpMergeService from '../services/followUpMergeService';

const router = Router();

// Configure multer for audio upload
const upload = multer({
  dest: 'uploads/audio/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
      'audio/mp4'
    ];
    
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|webm|ogg|m4a|mp4)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

const transcriptionService = new TranscriptionService();
const extractionService = new StoryExtractionService();
const followUpService = new FollowUpMergeService();

/**
 * POST /api/transcription/audio
 * Upload and transcribe audio file
 */
router.post(
  '/audio',
  upload.single('audio'),
  DataProtectionService.sanitizeRequest(),
  DataProtectionService.auditDataAccess(),
  [
    body('userId').optional().isString().withMessage('User ID must be a string'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file uploaded'
        });
      }

      const audioPath = req.file.path;
      
      try {
        // Check if AssemblyAI is available
        if (!transcriptionService.isAssemblyAIAvailable()) {
          return res.status(503).json({
            success: false,
            error: 'AssemblyAI API not available',
            fallbackMode: true,
            message: 'Please use manual transcript entry instead'
          });
        }

        // Transcribe audio
        const transcriptionResult = await transcriptionService.transcribeAudio(audioPath);
        // Sanitize transcript to redact sensitive content before returning
        transcriptionResult.transcript = DataProtectionService.sanitizeTranscript(transcriptionResult.transcript);

        // Extract structured data
        const extractionResult = await extractionService.extractGoFundMeData(transcriptionResult.transcript);

        res.json({
          success: true,
          data: {
            transcription: transcriptionResult,
            extraction: extractionResult
          }
        });

      } catch (error) {
        console.error('Processing error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Processing failed',
          fallbackMode: true
        });
      } finally {
        // Clean up uploaded file
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'File upload failed'
      });
    }
  }
);

/**
 * POST /api/transcription/text
 * Process manual transcript (fallback mode)
 */
router.post(
  '/text',
  DataProtectionService.sanitizeRequest(),
  DataProtectionService.validateConsent(),
  [
    body('transcript').isString().notEmpty().withMessage('Transcript is required'),
    body('userId').optional().isString().withMessage('User ID must be a string'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { transcript } = req.body;

      // Process manual transcript
      const transcriptionResult = await transcriptionService.processManualTranscript(transcript);
      // Sanitize transcript content to redact sensitive data
      transcriptionResult.transcript = DataProtectionService.sanitizeTranscript(transcriptionResult.transcript);

      // Extract structured data
      const extractionResult = await extractionService.extractGoFundMeData(transcriptionResult.transcript);

      res.json({
        success: true,
        data: {
          transcription: transcriptionResult,
          extraction: extractionResult
        }
      });

    } catch (error) {
      console.error('Manual transcript processing error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      });
    }
  }
);

/**
 * POST /api/transcription/followup/start
 * Start follow-up question session
 */
router.post(
  '/followup/start',
  [
    body('draftId').isString().notEmpty().withMessage('Draft ID is required'),
    body('userId').isString().notEmpty().withMessage('User ID is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { draftId, userId } = req.body;
      
      const sessionId = followUpService.startSession(draftId, userId);
      
      res.json({
        success: true,
        data: {
          sessionId
        }
      });

    } catch (error) {
      console.error('Follow-up start error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start follow-up session'
      });
    }
  }
);

/**
 * GET /api/transcription/followup/:sessionId/question
 * Get current follow-up question
 */
router.get(
  '/followup/:sessionId/question',
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { draft } = req.query;
      
      if (!draft) {
        return res.status(400).json({
          success: false,
          error: 'Draft data is required'
        });
      }

      const parsedDraft = JSON.parse(draft as string);
      const question = followUpService.getCurrentQuestion(sessionId, parsedDraft);
      
      if (!question) {
        return res.json({
          success: true,
          data: {
            completed: true,
            message: 'No more questions remaining'
          }
        });
      }

      const progress = followUpService.getSessionProgress(sessionId, parsedDraft.followUpQuestions?.length || 0);

      res.json({
        success: true,
        data: {
          question,
          progress,
          completed: false
        }
      });

    } catch (error) {
      console.error('Get question error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get question'
      });
    }
  }
);

/**
 * POST /api/transcription/followup/:sessionId/answer
 * Submit answer to follow-up question
 */
router.post(
  '/followup/:sessionId/answer',
  [
    body('answer').isString().notEmpty().withMessage('Answer is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { answer } = req.body;
      
      const success = followUpService.submitAnswer(sessionId, answer);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      res.json({
        success: true,
        data: {
          message: 'Answer submitted successfully'
        }
      });

    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit answer'
      });
    }
  }
);

/**
 * POST /api/transcription/followup/:sessionId/complete
 * Complete follow-up session and merge answers
 */
router.post(
  '/followup/:sessionId/complete',
  [
    body('draft').isObject().withMessage('Draft object is required'),
    body('answers').isArray().withMessage('Answers array is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { draft, answers } = req.body;
      
      // Merge answers into draft
      const updatedDraft = followUpService.mergeAnswersIntoDraft(draft, answers);
      
      // Complete session
      followUpService.completeSession(sessionId);

      res.json({
        success: true,
        data: {
          draft: updatedDraft
        }
      });

    } catch (error) {
      console.error('Complete session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete session'
      });
    }
  }
);

/**
 * GET /api/transcription/status
 * Check transcription service status
 */
router.get('/status', (req, res) => {
  const assemblyaiAvailable = transcriptionService.isAssemblyAIAvailable();
  const openaiAvailable = transcriptionService.isOpenAIAvailable();
  
  res.json({
    success: true,
    data: {
      assemblyaiAvailable,
      openaiAvailable,
      fallbackMode: !assemblyaiAvailable,
      services: {
        assemblyai: assemblyaiAvailable,
        whisper: openaiAvailable,
        manualTranscript: true,
        extraction: true,
        followUp: true
      }
    }
  });
});

export default router;