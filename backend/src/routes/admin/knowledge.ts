/**
 * Knowledge Vault Admin Routes
 * Password-protected CRUD operations for KnowledgeSource and KnowledgeChunk
 * All changes are logged via audit system
 */

import express, { Request, Response } from 'express';
import { requireAdminAuth, AdminAuthRequest } from '../../middleware/adminAuth';
import { logAudit } from '../../services/auditLogger';
import {
  PrismaClient,
  AuditAction,
  AuditEntityType,
  KnowledgeSourceType,
} from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require admin authentication
router.use(requireAdminAuth);

// ============================================
// KNOWLEDGE SOURCES
// ============================================

/**
 * GET /admin/knowledge/sources
 * List knowledge sources with pagination and filtering
 */
router.get('/sources', async (req: AdminAuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      type,
      search,
      includeDeleted = 'false',
    } = req.query;

    const where: any = {};

    // Filter by source type
    if (type) {
      where.sourceType = type as KnowledgeSourceType;
    }

    // Include/exclude deleted items
    if (includeDeleted !== 'true') {
      where.isDeleted = false;
    }

    // Search by title or URL
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch sources with chunk count (excluding soft-deleted chunks)
    const [sources, total] = await Promise.all([
      prisma.knowledgeSource.findMany({
        where,
        include: {
          _count: {
            select: { 
              chunks: {
                where: { isDeleted: false }
              }
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.knowledgeSource.count({ where }),
    ]);

    res.json({
      sources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[Knowledge Vault] Error listing sources:', error);
    res.status(500).json({
      error: 'Failed to fetch sources',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /admin/knowledge/sources
 * Create a new knowledge source
 */
router.post('/sources', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { title, description, sourceType, url, licenseNote, metadata, reason } = req.body;

    // Validate required fields
    if (!title || !sourceType) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'title and sourceType are required',
      });
    }

    // Create source
    const source = await prisma.knowledgeSource.create({
      data: {
        title,
        description: description || null,
        sourceType,
        url: url || null,
        licenseNote: licenseNote || null,
        metadata: metadata || null,
      },
    });

    // Log audit event
    await logAudit({
      actor: req.adminUser || 'admin',
      action: AuditAction.CREATE,
      entityType: AuditEntityType.KNOWLEDGE_SOURCE,
      entityId: source.id,
      after: source,
      reason: reason || 'Created via Knowledge Vault Admin',
    });

    console.log(
      `[Knowledge Vault] Created source: ${source.id} (${source.title})`
    );

    res.status(201).json(source);
  } catch (error) {
    console.error('[Knowledge Vault] Error creating source:', error);
    res.status(500).json({
      error: 'Failed to create source',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /admin/knowledge/sources/:id
 * Get a single knowledge source with all its chunks
 */
router.get('/sources/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const source = await prisma.knowledgeSource.findUnique({
      where: { id },
      include: {
        chunks: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!source) {
      return res.status(404).json({
        error: 'Source not found',
        message: `No knowledge source found with id: ${id}`,
      });
    }

    res.json(source);
  } catch (error) {
    console.error('[Knowledge Vault] Error fetching source:', error);
    res.status(500).json({
      error: 'Failed to fetch source',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /admin/knowledge/sources/:id
 * Update a knowledge source
 */
router.patch('/sources/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, sourceType, url, licenseNote, metadata, reason } = req.body;

    // Get current state for audit log
    const before = await prisma.knowledgeSource.findUnique({
      where: { id },
    });

    if (!before) {
      return res.status(404).json({
        error: 'Source not found',
        message: `No knowledge source found with id: ${id}`,
      });
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (sourceType !== undefined) updateData.sourceType = sourceType;
    if (url !== undefined) updateData.url = url;
    if (licenseNote !== undefined) updateData.licenseNote = licenseNote;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Update source
    const after = await prisma.knowledgeSource.update({
      where: { id },
      data: updateData,
    });

    // Log audit event
    await logAudit({
      actor: req.adminUser || 'admin',
      action: AuditAction.UPDATE,
      entityType: AuditEntityType.KNOWLEDGE_SOURCE,
      entityId: after.id,
      before,
      after,
      reason: reason || 'Updated via Knowledge Vault Admin',
    });

    console.log(
      `[Knowledge Vault] Updated source: ${after.id} (${after.title})`
    );

    res.json(after);
  } catch (error) {
    console.error('[Knowledge Vault] Error updating source:', error);
    res.status(500).json({
      error: 'Failed to update source',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /admin/knowledge/sources/:id
 * Soft delete a knowledge source
 */
router.delete('/sources/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get current state for audit log
    const before = await prisma.knowledgeSource.findUnique({
      where: { id },
    });

    if (!before) {
      return res.status(404).json({
        error: 'Source not found',
        message: `No knowledge source found with id: ${id}`,
      });
    }

    if (before.isDeleted) {
      return res.status(400).json({
        error: 'Source already deleted',
        message: `Knowledge source ${id} is already marked as deleted`,
      });
    }

    // Soft delete (mark as deleted, keep data)
    const after = await prisma.knowledgeSource.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Log audit event
    await logAudit({
      actor: req.adminUser || 'admin',
      action: AuditAction.DELETE,
      entityType: AuditEntityType.KNOWLEDGE_SOURCE,
      entityId: after.id,
      before,
      reason: reason || 'Deleted via Knowledge Vault Admin',
    });

    console.log(
      `[Knowledge Vault] Deleted source: ${after.id} (${after.title})`
    );

    res.json({
      message: 'Source deleted successfully',
      id: after.id,
    });
  } catch (error) {
    console.error('[Knowledge Vault] Error deleting source:', error);
    res.status(500).json({
      error: 'Failed to delete source',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// KNOWLEDGE CHUNKS
// ============================================

/**
 * GET /admin/knowledge/sources/:sourceId/chunks
 * List chunks for a knowledge source with pagination
 */
router.get(
  '/sources/:sourceId/chunks',
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const { sourceId } = req.params;
      const {
        page = '1',
        limit = '20',
        includeDeleted = 'false',
        query = '',
      } = req.query;

      // Verify source exists
      const source = await prisma.knowledgeSource.findUnique({
        where: { id: sourceId },
      });

      if (!source) {
        return res.status(404).json({
          error: 'Source not found',
          message: `No knowledge source found with id: ${sourceId}`,
        });
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = { sourceId };
      
      if (includeDeleted !== 'true') {
        where.isDeleted = false;
      }

      // Add text search if query provided
      if (query && typeof query === 'string' && query.length > 0) {
        where.chunkText = { contains: query, mode: 'insensitive' };
      }

      // Fetch chunks with pagination
      const [chunks, total] = await Promise.all([
        prisma.knowledgeChunk.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'asc' },
        }),
        prisma.knowledgeChunk.count({ where }),
      ]);

      res.json({
        chunks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('[Knowledge Vault] Error fetching chunks:', error);
      res.status(500).json({
        error: 'Failed to fetch chunks',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /admin/knowledge/sources/:sourceId/chunks
 * Create a new chunk for a knowledge source
 */
router.post(
  '/sources/:sourceId/chunks',
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const { sourceId } = req.params;
      const { chunkText, tags, language, metadata, reason } = req.body;

      // Validate required fields
      if (!chunkText) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'chunkText is required',
        });
      }

      // Verify source exists
      const source = await prisma.knowledgeSource.findUnique({
        where: { id: sourceId },
      });

      if (!source) {
        return res.status(404).json({
          error: 'Source not found',
          message: `No knowledge source found with id: ${sourceId}`,
        });
      }

      // Create chunk
      const chunk = await prisma.knowledgeChunk.create({
        data: {
          sourceId,
          chunkText,
          tags: tags || [],
          language: language || null,
          metadata: metadata || null,
        },
      });

      // Log audit event
      await logAudit({
        actor: req.adminUser || 'admin',
        action: AuditAction.CREATE,
        entityType: AuditEntityType.KNOWLEDGE_CHUNK,
        entityId: chunk.id,
        after: chunk,
        reason: reason || `Added chunk to source: ${source.title}`,
      });

      console.log(
        `[Knowledge Vault] Created chunk: ${chunk.id} for source ${sourceId}`
      );

      res.status(201).json(chunk);
    } catch (error) {
      console.error('[Knowledge Vault] Error creating chunk:', error);
      res.status(500).json({
        error: 'Failed to create chunk',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * PATCH /admin/knowledge/chunks/:id
 * Update a knowledge chunk
 */
router.patch('/chunks/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { chunkText, tags, language, metadata, reason } = req.body;

    // Get current state for audit log
    const before = await prisma.knowledgeChunk.findUnique({
      where: { id },
    });

    if (!before) {
      return res.status(404).json({
        error: 'Chunk not found',
        message: `No knowledge chunk found with id: ${id}`,
      });
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    if (chunkText !== undefined) updateData.chunkText = chunkText;
    if (tags !== undefined) updateData.tags = tags;
    if (language !== undefined) updateData.language = language;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Update chunk
    const after = await prisma.knowledgeChunk.update({
      where: { id },
      data: updateData,
    });

    // Log audit event
    await logAudit({
      actor: req.adminUser || 'admin',
      action: AuditAction.UPDATE,
      entityType: AuditEntityType.KNOWLEDGE_CHUNK,
      entityId: after.id,
      before,
      after,
      reason: reason || 'Updated via Knowledge Vault Admin',
    });

    console.log(`[Knowledge Vault] Updated chunk: ${after.id}`);

    res.json(after);
  } catch (error) {
    console.error('[Knowledge Vault] Error updating chunk:', error);
    res.status(500).json({
      error: 'Failed to update chunk',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /admin/knowledge/chunks/:id
 * Soft delete a knowledge chunk
 */
router.delete('/chunks/:id', async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get current state for audit log
    const before = await prisma.knowledgeChunk.findUnique({
      where: { id },
    });

    if (!before) {
      return res.status(404).json({
        error: 'Chunk not found',
        message: `No knowledge chunk found with id: ${id}`,
      });
    }

    if (before.isDeleted) {
      return res.status(400).json({
        error: 'Chunk already deleted',
        message: `Knowledge chunk ${id} is already marked as deleted`,
      });
    }

    // Soft delete
    const after = await prisma.knowledgeChunk.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Log audit event
    await logAudit({
      actor: req.adminUser || 'admin',
      action: AuditAction.DELETE,
      entityType: AuditEntityType.KNOWLEDGE_CHUNK,
      entityId: after.id,
      before,
      reason: reason || 'Deleted via Knowledge Vault Admin',
    });

    console.log(`[Knowledge Vault] Deleted chunk: ${after.id}`);

    res.json({
      message: 'Chunk deleted successfully',
      id: after.id,
    });
  } catch (error) {
    console.error('[Knowledge Vault] Error deleting chunk:', error);
    res.status(500).json({
      error: 'Failed to delete chunk',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================
// DATABASE OVERVIEW
// ============================================

/**
 * GET /admin/knowledge/database/overview
 * Get safe database statistics (counts only, no PII)
 */
router.get(
  '/database/overview',
  async (req: AdminAuthRequest, res: Response) => {
    try {
      // Get counts for all major tables
      const [
        knowledgeSourceCount,
        knowledgeSourceDeletedCount,
        knowledgeChunkCount,
        knowledgeChunkDeletedCount,
        recordingTicketCount,
        supportTicketCount,
        stripeAttributionCount,
        auditLogCount,
      ] = await Promise.all([
        prisma.knowledgeSource.count({ where: { isDeleted: false } }),
        prisma.knowledgeSource.count({ where: { isDeleted: true } }),
        prisma.knowledgeChunk.count({ where: { isDeleted: false } }),
        prisma.knowledgeChunk.count({ where: { isDeleted: true } }),
        prisma.recordingTicket.count(),
        prisma.supportTicket.count(),
        prisma.stripeAttribution.count(),
        prisma.knowledgeAuditLog.count(),
      ]);

      res.json({
        tables: [
          {
            name: 'KnowledgeSource',
            count: knowledgeSourceCount,
            deleted: knowledgeSourceDeletedCount,
          },
          {
            name: 'KnowledgeChunk',
            count: knowledgeChunkCount,
            deleted: knowledgeChunkDeletedCount,
          },
          {
            name: 'RecordingTicket',
            count: recordingTicketCount,
          },
          {
            name: 'SupportTicket',
            count: supportTicketCount,
          },
          {
            name: 'StripeAttribution',
            count: stripeAttributionCount,
          },
          {
            name: 'KnowledgeAuditLog',
            count: auditLogCount,
          },
        ],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Knowledge Vault] Error fetching database overview:', error);
      res.status(500).json({
        error: 'Failed to fetch database overview',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
