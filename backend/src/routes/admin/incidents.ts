/**
 * Incident Management API Routes
 *
 * Password-protected admin endpoints for:
 * - Listing and filtering pipeline incidents
 * - Viewing incident details with knowledge recommendations
 * - Investigating incidents (re-run diagnostics)
 * - Self-healing incidents (safe automated fixes)
 *
 * All routes protected with adminAuth middleware
 */

import express from "express";
import {
  PrismaClient,
  PipelineStage,
  IncidentSeverity,
  IncidentStatus,
} from "@prisma/client";
import { requireAdminAuth } from "../../middleware/adminAuth";
import {
  investigateIncident,
  attemptSelfHeal,
  getIncidentStats,
} from "../../services/troubleshooting/pipelineTroubleshooter";

const router = express.Router();
const prisma = new PrismaClient();

// Apply admin authentication to all routes
router.use(requireAdminAuth);

/**
 * GET /admin/incidents
 * List all incidents with optional filters
 */
router.get("/", async (req, res) => {
  try {
    const {
      status,
      stage,
      severity,
      ticketId,
      page = "1",
      limit = "50",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status as IncidentStatus;
    }

    if (stage) {
      where.stage = stage as PipelineStage;
    }

    if (severity) {
      where.severity = severity as IncidentSeverity;
    }

    if (ticketId) {
      where.ticketId = ticketId as string;
    }

    // Fetch incidents with pagination
    const [incidents, total] = await Promise.all([
      prisma.pipelineIncident.findMany({
        where,
        include: {
          ticket: {
            select: {
              id: true,
              displayName: true,
              contactType: true,
              status: true,
            },
          },
          knowledgeBindings: {
            include: {
              incident: false,
            },
            take: 3, // Preview only
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.pipelineIncident.count({ where }),
    ]);

    res.json({
      incidents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("[Admin] Error listing incidents:", error);
    res.status(500).json({ error: "Failed to list incidents" });
  }
});

/**
 * GET /admin/incidents/stats
 * Get incident statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const { startDate, endDate, ticketId } = req.query;

    const stats = await getIncidentStats({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      ticketId: ticketId as string | undefined,
    });

    res.json(stats);
  } catch (error) {
    console.error("[Admin] Error getting incident stats:", error);
    res.status(500).json({ error: "Failed to get incident statistics" });
  }
});

/**
 * GET /admin/incidents/:id
 * Get detailed incident information including knowledge matches
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await prisma.pipelineIncident.findUnique({
      where: { id },
      include: {
        ticket: {
          select: {
            id: true,
            displayName: true,
            contactType: true,
            contactValue: true,
            status: true,
            createdAt: true,
            audioUrl: true,
          },
        },
        knowledgeBindings: {
          include: {
            incident: false,
          },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    // Fetch full knowledge chunks
    const chunkIds = incident.knowledgeBindings.map((b) => b.knowledgeChunkId);
    const chunks = await prisma.knowledgeChunk.findMany({
      where: {
        id: { in: chunkIds },
      },
      include: {
        source: {
          select: {
            id: true,
            title: true,
            sourceType: true,
          },
        },
      },
    });

    res.json({
      ...incident,
      matchedKnowledge: chunks,
    });
  } catch (error) {
    console.error("[Admin] Error getting incident detail:", error);
    res.status(500).json({ error: "Failed to get incident detail" });
  }
});

/**
 * POST /admin/incidents/:id/investigate
 * Re-run diagnostics and update recommendations
 */
router.post("/:id/investigate", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[Admin] Investigating incident ${id}...`);

    const result = await investigateIncident(id);

    res.json({
      success: true,
      message: "Investigation completed",
      incident: result,
    });
  } catch (error) {
    console.error("[Admin] Error investigating incident:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not found")) {
      return res.status(404).json({ error: message });
    }

    res.status(500).json({ error: "Failed to investigate incident" });
  }
});

/**
 * POST /admin/incidents/:id/self-heal
 * Attempt automated fix using whitelisted actions
 */
router.post("/:id/self-heal", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[Admin] Attempting self-heal for incident ${id}...`);

    const result = await attemptSelfHeal(id);

    res.json(result);
  } catch (error) {
    console.error("[Admin] Error during self-heal:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("not found")) {
      return res.status(404).json({ error: message });
    }

    res.status(500).json({ error: "Failed to execute self-heal" });
  }
});

/**
 * PATCH /admin/incidents/:id
 * Manually update incident status or add notes
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const data: any = {};

    if (status) {
      data.status = status as IncidentStatus;

      if (
        status === IncidentStatus.RESOLVED ||
        status === IncidentStatus.AUTO_RESOLVED
      ) {
        data.resolvedAt = new Date();
      }
    }

    if (notes) {
      const existing = await prisma.pipelineIncident.findUnique({
        where: { id },
        select: { contextJson: true },
      });

      data.contextJson = {
        ...((existing?.contextJson as object) || {}),
        adminNotes: notes,
        updatedAt: new Date().toISOString(),
      };
    }

    const updated = await prisma.pipelineIncident.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      incident: updated,
    });
  } catch (error) {
    console.error("[Admin] Error updating incident:", error);
    res.status(500).json({ error: "Failed to update incident" });
  }
});

export default router;
