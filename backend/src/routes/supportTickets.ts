/**
 * Support Ticket Routes
 * Handles support ticket creation with email notifications and local file storage
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/database';
import { systemAuthMiddleware as systemAuth } from '../middleware/systemAuth';
import { resolveCreateTransport } from '../lib/emailTransport';
import fs from 'fs';
import path from 'path';

const router = Router();

// Check if SMTP is configured
function isSMTPConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

// Create email transporter if SMTP is configured
function createEmailTransporter() {
  if (!isSMTPConfigured()) {
    return null;
  }

  const createTransport = resolveCreateTransport();
  return createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * POST /api/support/tickets
 * Submit a support ticket with optional email notification
 */
router.post(
  '/tickets',
  [
    body('issueType')
      .notEmpty().withMessage('issueType is required')
      .isString()
      .isIn(['gofundme_blocked', 'qr_problem', 'other', 'transcription_problem', 'download_problem', 'missing_fields'])
      .withMessage('Invalid issueType'),
    body('description')
      .notEmpty().withMessage('description is required')
      .isString()
      .trim()
      .notEmpty().withMessage('description cannot be empty'),
    body('contactEmail').optional().isEmail(),
    body('contactPhone').optional().isString(),
    body('context').optional().isString(),
    body('clientId').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array().map(e => e.msg).join(', '),
        errors: errors.array(),
      });
    }

    const { issueType, description, contactEmail, contactPhone, context, clientId } = req.body;

    try {
      // Generate ticket ID
      const timestamp = Date.now();
      const ticketId = `TICKET-${timestamp}`;

      // Check if SMTP is configured to determine initial status
      const smtpConfigured = isSMTPConfigured();

      // Create ticket data
      const ticketData = {
        id: ticketId,
        issueType,
        description,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        context: context || null,
        clientId: clientId || null,
        createdAt: new Date(),
        status: smtpConfigured ? 'OPEN' : 'pending',
      };

      // Save ticket to local file (using sync to match test expectations)
      const ticketsDir = path.join(process.cwd(), 'data', 'support-tickets');
      if (!fs.existsSync(ticketsDir)) {
        fs.mkdirSync(ticketsDir, { recursive: true });
      }
      const ticketFilePath = path.join(ticketsDir, `${ticketId}.json`);
      fs.writeFileSync(ticketFilePath, JSON.stringify(ticketData, null, 2));

      // Try to send email if SMTP is configured
      let emailSent = false;
      let emailError = null;

      if (smtpConfigured) {
        try {
          const transporter = createEmailTransporter();
          if (!transporter || typeof transporter.sendMail !== 'function') {
            throw new Error('Transporter not available');
          }

          const supportEmail = process.env.SUPPORT_EMAIL_TO || 'support@example.com';

          const emailText = `
Support Ticket: ${ticketId}

Issue Type: ${issueType}
Description: ${description}
Contact Email: ${contactEmail || 'Not provided'}
Contact Phone: ${contactPhone || 'Not provided'}
Context: ${context || 'Not provided'}
Client ID: ${clientId || 'Not provided'}
Created: ${new Date().toISOString()}
          `.trim();

          const emailHtml = `
<h2>Support Ticket: ${ticketId}</h2>
<p><strong>Issue Type:</strong> ${issueType}</p>
<p><strong>Description:</strong> ${description}</p>
<p><strong>Contact Email:</strong> ${contactEmail || 'Not provided'}</p>
<p><strong>Contact Phone:</strong> ${contactPhone || 'Not provided'}</p>
<p><strong>Context:</strong> ${context || 'Not provided'}</p>
<p><strong>Client ID:</strong> ${clientId || 'Not provided'}</p>
<p><strong>Created:</strong> ${new Date().toISOString()}</p>
          `.trim();

          await transporter!.sendMail({
            from: process.env.SMTP_USER,
            to: supportEmail,
            subject: `${ticketId} - ${issueType}`,
            text: emailText,
            html: emailHtml,
          });

          emailSent = true;
          // Update status to 'sent' in ticket file
          ticketData.status = 'sent';
          fs.writeFileSync(ticketFilePath, JSON.stringify(ticketData, null, 2));
        } catch (emailErr: any) {
          emailError = emailErr.message;
          console.error('Failed to send support ticket email:', emailErr);
          // Update status to 'failed' in ticket file
          ticketData.status = 'failed';
          fs.writeFileSync(ticketFilePath, JSON.stringify(ticketData, null, 2));
        }
      }

      // Prepare response
      const response: any = {
        success: true,
        ticket: ticketData,
      };

      if (smtpConfigured) {
        if (emailSent) {
          response.message = 'Ticket saved and sent via email';
          response.emailSent = true;
        } else {
          response.message = 'Ticket saved locally (email failed)';
          response.emailSent = false;
          response.fallback = {
            mailto: `mailto:${process.env.SUPPORT_EMAIL_TO || 'support@example.com'}?subject=${encodeURIComponent(`${ticketId} - ${issueType}`)}&body=${encodeURIComponent(description)}`,
          };
        }
      } else {
        response.message = 'Ticket saved locally';
        response.smtpConfigured = false;
        response.fallback = {
          mailto: `mailto:${process.env.SUPPORT_EMAIL_TO || 'support@example.com'}?subject=Support Ticket&body=${encodeURIComponent(description)}`,
        };
      }

      return res.status(200).json(response);
    } catch (error: any) {
      console.error('[Support] Error creating ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create support ticket',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/support/config
 * Get SMTP configuration status
 */
router.get('/config', async (req: Request, res: Response) => {
  const configured = isSMTPConfigured();
  
  res.status(200).json({
    success: true,
    smtpConfigured: configured,
    supportEmail: process.env.SUPPORT_EMAIL_TO || null,
  });
});

/**
 * GET /api/support/tickets
 * List all support tickets
 */
router.get('/tickets', (req: any, res: any) => {
  try {
    // Read tickets from local files
    const ticketsDir = path.join(process.cwd(), 'data', 'support-tickets');
    
    if (!fs.existsSync(ticketsDir)) {
      return res.status(200).json({
        success: true,
        count: 0,
        tickets: [],
      });
    }

    const files = fs.readdirSync(ticketsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const tickets = jsonFiles.map((file) => {
      const content = fs.readFileSync(path.join(ticketsDir, file), 'utf-8');
      return JSON.parse(content);
    });

    // Sort by createdAt descending
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error('[Support] Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch support tickets',
    });
  }
});

/**
 * GET /api/support/tickets/:id
 * Get specific ticket details
 */
router.get('/tickets/:id', (req: any, res: any) => {
  try {
    const ticketFilePath = path.join(process.cwd(), 'data', 'support-tickets', `${req.params.id}.json`);
    
    if (!fs.existsSync(ticketFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
      });
    }

    const content = fs.readFileSync(ticketFilePath, 'utf-8');
    const ticket = JSON.parse(content);
    
    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('[Support] Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket',
    });
  }
});

export default router;
