import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Multer errors
  if (error.message === 'Invalid audio file type') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Please upload a valid audio file (MP3, WAV, M4A, WebM, OGG)',
    });
  }

  if (error instanceof Error && error.message.includes('File too large')) {
    return res.status(400).json({
      error: 'File too large',
      message: 'Audio file must be smaller than 25MB',
    });
  }

  // Prisma errors
  if (error.message.includes('Unique constraint')) {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists',
    });
  }

  // OpenAI API errors
  if (error.message.includes('OpenAI')) {
    return res.status(503).json({
      error: 'AI service unavailable',
      message: 'Please try again later',
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
};