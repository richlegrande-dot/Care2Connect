/**
 * Profile Search API
 * Public endpoint for searching RecordingTicket profiles
 * Allows donors to find profiles to support
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/profiles/search?contact=...&type=...
 * Search for RecordingTicket profiles by contact info
 */
router.get('/search', async (req, res) => {
  try {
    const { contact, type } = req.query;

    if (!contact || typeof contact !== 'string') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Contact value is required'
      });
    }

    const contactValue = contact.trim();
    
    if (contactValue.length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Contact value cannot be empty'
      });
    }

    // Search for tickets by contact value
    // Use case-insensitive search
    const tickets = await prisma.recordingTicket.findMany({
      where: {
        contactValue: {
          contains: contactValue,
          mode: 'insensitive',
        },
        // Optionally filter by contact type if provided
        ...(type && { contactType: type as 'EMAIL' | 'PHONE' | 'SMS' }),
      },
      select: {
        id: true,
        displayName: true,
        contactValue: true,
        contactType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50, // Limit results
    });

    console.log(`[Profiles] Search for "${contactValue}": ${tickets.length} results`);

    return res.json(tickets);
  } catch (error: any) {
    console.error('[Profiles] Error searching:', error);
    
    // Check for DB connectivity issues
    if (error.code === 'P1001' || error.code === 'P1017') {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Database is not available'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search profiles'
    });
  }
});

/**
 * GET /api/profiles/:id
 * Get a specific profile (alias for /api/tickets/:id for convenience)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.recordingTicket.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        contactValue: true,
        contactType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Don't expose sensitive fields like transcript, audio files, etc.
      }
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Profile not found'
      });
    }

    return res.json(ticket);
  } catch (error: any) {
    console.error('[Profiles] Error fetching profile:', error);
    
    if (error.code === 'P1001' || error.code === 'P1017') {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Database is not available'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch profile'
    });
  }
});

export default router;
