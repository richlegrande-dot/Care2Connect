/**
 * Audit Log Viewer Routes
 * Password-protected endpoints to view audit logs
 */

import express, { Response } from "express";
import { requireAdminAuth, AdminAuthRequest } from "../../middleware/adminAuth";
import { PrismaClient, AuditAction, AuditEntityType } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// All routes require admin authentication
router.use(requireAdminAuth);

/**
 * GET /admin/knowledge/audit
 * List audit logs with pagination and filtering
 */
router.get("/", async (req: AdminAuthRequest, res: Response) => {
  try {
    const {
      page = "1",
      limit = "50",
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      actor,
    } = req.query;

    const where: any = {};

    // Filter by action
    if (action) {
      where.action = action as AuditAction;
    }

    // Filter by entity type
    if (entityType) {
      where.entityType = entityType as AuditEntityType;
    }

    // Filter by entity ID
    if (entityId && typeof entityId === "string") {
      where.entityId = entityId;
    }

    // Filter by actor
    if (actor && typeof actor === "string") {
      where.actor = actor;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && typeof startDate === "string") {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch audit logs
    const [logs, total] = await Promise.all([
      prisma.knowledgeAuditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.knowledgeAuditLog.count({ where }),
    ]);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("[Audit Viewer] Error listing audit logs:", error);
    res.status(500).json({
      error: "Failed to fetch audit logs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /admin/knowledge/audit/:id
 * Get a single audit log with full details
 */
router.get("/:id", async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.knowledgeAuditLog.findUnique({
      where: { id },
    });

    if (!log) {
      return res.status(404).json({
        error: "Audit log not found",
        message: `No audit log found with id: ${id}`,
      });
    }

    // Optionally fetch related entity for context
    let relatedEntity = null;
    try {
      if (log.entityType === AuditEntityType.KNOWLEDGE_SOURCE) {
        relatedEntity = await prisma.knowledgeSource.findUnique({
          where: { id: log.entityId },
          select: { id: true, title: true, sourceType: true, isDeleted: true },
        });
      } else if (log.entityType === AuditEntityType.KNOWLEDGE_CHUNK) {
        relatedEntity = await prisma.knowledgeChunk.findUnique({
          where: { id: log.entityId },
          select: {
            id: true,
            sourceId: true,
            isDeleted: true,
            source: {
              select: { title: true },
            },
          },
        });
      }
    } catch (entityError) {
      // Entity might not exist anymore (hard deleted) - this is ok
      console.log("[Audit Viewer] Related entity not found:", entityError);
    }

    res.json({
      ...log,
      relatedEntity,
    });
  } catch (error) {
    console.error("[Audit Viewer] Error fetching audit log:", error);
    res.status(500).json({
      error: "Failed to fetch audit log",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /admin/knowledge/audit/entity/:entityType/:entityId
 * Get all audit logs for a specific entity
 */
router.get(
  "/entity/:entityType/:entityId",
  async (req: AdminAuthRequest, res: Response) => {
    try {
      const { entityType, entityId } = req.params;

      // Validate entity type
      if (
        entityType !== AuditEntityType.KNOWLEDGE_SOURCE &&
        entityType !== AuditEntityType.KNOWLEDGE_CHUNK
      ) {
        return res.status(400).json({
          error: "Invalid entity type",
          message: `Entity type must be ${AuditEntityType.KNOWLEDGE_SOURCE} or ${AuditEntityType.KNOWLEDGE_CHUNK}`,
        });
      }

      const logs = await prisma.knowledgeAuditLog.findMany({
        where: {
          entityType: entityType as AuditEntityType,
          entityId,
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        entityType,
        entityId,
        logs,
        count: logs.length,
      });
    } catch (error) {
      console.error("[Audit Viewer] Error fetching entity audit logs:", error);
      res.status(500).json({
        error: "Failed to fetch entity audit logs",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * GET /admin/knowledge/audit/stats
 * Get audit log statistics
 */
router.get("/stats/summary", async (req: AdminAuthRequest, res: Response) => {
  try {
    const [
      totalLogs,
      createCount,
      updateCount,
      deleteCount,
      sourceCount,
      chunkCount,
    ] = await Promise.all([
      prisma.knowledgeAuditLog.count(),
      prisma.knowledgeAuditLog.count({ where: { action: AuditAction.CREATE } }),
      prisma.knowledgeAuditLog.count({ where: { action: AuditAction.UPDATE } }),
      prisma.knowledgeAuditLog.count({ where: { action: AuditAction.DELETE } }),
      prisma.knowledgeAuditLog.count({
        where: { entityType: AuditEntityType.KNOWLEDGE_SOURCE },
      }),
      prisma.knowledgeAuditLog.count({
        where: { entityType: AuditEntityType.KNOWLEDGE_CHUNK },
      }),
    ]);

    res.json({
      total: totalLogs,
      byAction: {
        create: createCount,
        update: updateCount,
        delete: deleteCount,
      },
      byEntityType: {
        knowledgeSource: sourceCount,
        knowledgeChunk: chunkCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Audit Viewer] Error fetching audit stats:", error);
    res.status(500).json({
      error: "Failed to fetch audit statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
