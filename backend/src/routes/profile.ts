import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

/**
 * POST /api/profile
 * Create a new profile from extracted data
 */
router.post(
  '/',
  [
    body('transcript').isString().notEmpty().withMessage('Transcript is required'),
    body('profileData').isObject().withMessage('Profile data is required'),
    body('consentGiven').optional().isBoolean().withMessage('Consent must be boolean'),
    body('isProfilePublic').optional().isBoolean().withMessage('Public visibility must be boolean'),
    body('userId').optional().isString().withMessage('User ID must be a string'),
  ],
  validateRequest,
  ProfileController.createProfile
);

/**
 * GET /api/profile/:profileId
 * Get public profile by ID
 */
router.get(
  '/:profileId',
  [
    param('profileId').isString().notEmpty().withMessage('Profile ID is required'),
  ],
  validateRequest,
  ProfileController.getProfile
);

/**
 * PUT /api/profile/:profileId
 * Update profile information
 */
router.put(
  '/:profileId',
  [
    param('profileId').isString().notEmpty().withMessage('Profile ID is required'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('urgentNeeds').optional().isArray().withMessage('Urgent needs must be an array'),
    body('longTermGoals').optional().isArray().withMessage('Long term goals must be an array'),
    body('cashtag').optional().isString().withMessage('Cashtag must be a string'),
    body('gofundmeUrl').optional().isURL().withMessage('GoFundMe URL must be valid'),
    body('isProfilePublic').optional().isBoolean().withMessage('Public visibility must be boolean'),
  ],
  validateRequest,
  ProfileController.updateProfile
);

/**
 * DELETE /api/profile/:profileId
 * Delete profile and associated user data
 */
router.delete(
  '/:profileId',
  [
    param('profileId').isString().notEmpty().withMessage('Profile ID is required'),
    body('confirmDelete').isBoolean().equals('true').withMessage('Confirmation required'),
  ],
  validateRequest,
  ProfileController.deleteProfile
);

/**
 * GET /api/profile
 * Search profiles (admin/caseworker functionality)
 */
router.get(
  '/',
  [
    query('query').optional().isString().withMessage('Query must be a string'),
    query('tags').optional().isString().withMessage('Tags must be a comma-separated string'),
    query('location').optional().isString().withMessage('Location must be a string'),
    query('skills').optional().isString().withMessage('Skills must be a comma-separated string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  ],
  validateRequest,
  ProfileController.searchProfiles
);

/**
 * GET /api/profile/:ticketId/qrcode.png
 * Get QR code for a profile ticket
 */
router.get('/:ticketId/qrcode.png', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { prisma } = require('../utils/database');

    const ticket = await prisma.profileTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || !ticket.qrCodeUrl) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // If it's a data URL, extract and send the image
    if (ticket.qrCodeUrl.startsWith('data:image/png;base64,')) {
      const base64Data = ticket.qrCodeUrl.replace('data:image/png;base64,', '');
      const buffer = Buffer.from(base64Data, 'base64');

      res.set('Content-Type', 'image/png');
      res.set('Content-Disposition', `inline; filename="qr-${ticketId}.png"`);
      res.send(buffer);
    } else {
      return res.status(404).json({ error: 'QR code format not supported' });
    }
  } catch (error) {
    console.error('Error serving QR code:', error);
    res.status(500).json({
      error: 'Failed to serve QR code',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/profile/:ticketId/gofundme-draft.docx
 * Download GoFundMe draft document
 */
router.get('/:ticketId/gofundme-draft.docx', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { prisma } = require('../utils/database');
    const fs = require('fs/promises');
    const path = require('path');

    const ticket = await prisma.profileTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || !ticket.gofundmeDraftUrl) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filepath = path.join(
      process.cwd(),
      'uploads',
      'gofundme-drafts',
      `gofundme-draft-${ticketId}.docx`
    );

    try {
      const fileBuffer = await fs.readFile(filepath);

      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.set('Content-Disposition', `attachment; filename="gofundme-draft-${ticketId}.docx"`);
      res.send(fileBuffer);
    } catch (fileError) {
      return res.status(404).json({ error: 'Document file not found on server' });
    }
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({
      error: 'Failed to serve document',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
