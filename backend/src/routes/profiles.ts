import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { systemAuthMiddleware } from "../middleware/systemAuth";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/profiles/search
 * Search for profiles/tickets by contact info (public)
 *
 * Query params:
 * - contact: email or phone to search for
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { contact } = req.query;

    if (!contact || typeof contact !== "string") {
      return res.status(400).json({
        error: "Missing required query parameter: contact",
      });
    }

    // Search by contactValue (case-insensitive, trimmed)
    const tickets = await prisma.recordingTicket.findMany({
      where: {
        contactValue: {
          equals: contact.trim(),
          mode: "insensitive",
        },
      },
      include: {
        donationDraft: {
          select: {
            title: true,
            goalAmount: true,
            currency: true,
          },
        },
        _count: {
          select: {
            stripeAttributions: true,
            generatedDocuments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error: any) {
    console.error("[Profiles API] Error searching profiles:", error);
    res.status(500).json({
      error: "Failed to search profiles",
      details: error.message,
    });
  }
});

/**
 * POST /admin/profiles/:id/approve-reset
 * Admin endpoint to approve profile reset request
 * Updates contactValue for a ticket (requires auth)
 *
 * Body:
 * {
 *   newContactValue: string
 * }
 */
router.post(
  "/:id/approve-reset",
  systemAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { newContactValue } = req.body;

      if (!newContactValue) {
        return res.status(400).json({
          error: "Missing required field: newContactValue",
        });
      }

      // Verify ticket exists
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id },
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
          ticketId: id,
        });
      }

      // Update contactValue (does NOT delete recordings)
      const updated = await prisma.recordingTicket.update({
        where: { id },
        data: {
          contactValue: newContactValue.trim(),
          updatedAt: new Date(),
        },
      });

      // Find and update associated support ticket if exists
      const supportTicket = await prisma.supportTicket.findFirst({
        where: {
          recordingTicketId: id,
          category: "PROFILE_RESET",
          status: "PENDING",
        },
      });

      if (supportTicket) {
        await prisma.supportTicket.update({
          where: { id: supportTicket.id },
          data: { status: "RESOLVED" },
        });
      }

      res.status(200).json({
        success: true,
        ticket: updated,
        message: "Profile contact info updated successfully",
      });
    } catch (error: any) {
      console.error("[Profiles API] Error approving reset:", error);
      res.status(500).json({
        error: "Failed to approve reset",
        details: error.message,
      });
    }
  },
);

export default router;
