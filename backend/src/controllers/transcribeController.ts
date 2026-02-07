import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { TranscriptionService } from '../services/transcriptionService';
import { prisma } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/webm',
      'audio/ogg',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type'));
    }
  },
});

const transcriptionService = new TranscriptionService();

export class TranscribeController {
  /**
   * Upload and transcribe audio file
   */
  static uploadAudio = upload.single('audio');

  static async transcribeAudio(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          error: 'No audio file uploaded',
          message: 'Please provide an audio file',
        });
      }

      // Save audio file record to database
      const audioFile = await prisma.audioFile.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filePath: file.path,
          uploadedBy: req.body.userId || null,
        },
      });

      // Transcribe audio
      const transcriptResult = await transcriptionService.transcribeAudio(file.path);

      // Extract profile data from transcript
      const profileData = await transcriptionService.extractProfileData(transcriptResult.transcript);

      // Update audio file with transcript
      await prisma.audioFile.update({
        where: { id: audioFile.id },
        data: {
          transcribed: true,
          transcript: transcriptResult.transcript,
          processed: true,
        },
      });

      // Clean up uploaded file (optional - keep for debugging in development)
      if (process.env.NODE_ENV === 'production') {
        fs.unlinkSync(file.path);
      }

      res.status(200).json({
        success: true,
        data: {
          audioFileId: audioFile.id,
          transcript: transcriptResult,
          profileData,
        },
      });
    } catch (error) {
      console.error('Transcription error:', error);
      
      // Clean up file if it exists
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }

      res.status(500).json({
        error: 'Transcription failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get transcription status
   */
  static async getTranscriptionStatus(req: Request, res: Response) {
    try {
      const { audioFileId } = req.params;

      const audioFile = await prisma.audioFile.findUnique({
        where: { id: audioFileId },
        select: {
          id: true,
          filename: true,
          transcribed: true,
          processed: true,
          transcript: true,
          createdAt: true,
        },
      });

      if (!audioFile) {
        return res.status(404).json({
          error: 'Audio file not found',
        });
      }

      res.status(200).json({
        success: true,
        data: audioFile,
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({
        error: 'Failed to check transcription status',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Re-process transcript to extract profile data
   */
  static async reprocessTranscript(req: Request, res: Response) {
    try {
      const { audioFileId } = req.params;
      const { transcript } = req.body;

      if (!transcript) {
        return res.status(400).json({
          error: 'Transcript required',
          message: 'Please provide a transcript to process',
        });
      }

      // Extract profile data from transcript
      const profileData = await transcriptionService.extractProfileData(transcript);

      // Update audio file record
      if (audioFileId) {
        await prisma.audioFile.update({
          where: { id: audioFileId },
          data: {
            transcript,
            processed: true,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          profileData,
        },
      });
    } catch (error) {
      console.error('Reprocessing error:', error);
      res.status(500).json({
        error: 'Failed to reprocess transcript',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
}
