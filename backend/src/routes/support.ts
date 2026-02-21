/**
 * Support Ticket Submission API
 * Public endpoint for users to submit support tickets
 * Optionally links to RecordingTicket profiles
 */

import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/support/tickets
 * Create a new support ticket
 */
router.post("/tickets", async (req, res) => {
  try {
    const {
      reporterName,
      isGuest,
      message,
      recordingTicketId,
      contactValue,
      contactType,
      pageUrl,
    } = req.body;

    // Validation
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Message is required",
      });
    }

    if (!isGuest && (!reporterName || reporterName.trim().length === 0)) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Name is required for non-guest submissions",
      });
    }

    // If recordingTicketId provided, verify it exists
    if (recordingTicketId) {
      const recordingTicket = await prisma.recordingTicket.findUnique({
        where: { id: recordingTicketId },
        select: { id: true },
      });

      if (!recordingTicket) {
        return res.status(404).json({
          error: "Not found",
          message: "Recording ticket not found",
        });
      }
    }

    // Create support ticket
    const supportTicket = await prisma.supportTicket.create({
      data: {
        reporterName: isGuest ? "Guest" : reporterName.trim(),
        isGuest: Boolean(isGuest),
        message: message.trim(),
        status: "OPEN",
        recordingTicketId: recordingTicketId || null,
        contactValue: contactValue?.trim() || null,
        contactType: contactType || null,
        pageUrl: pageUrl || null,
      },
      select: {
        id: true,
        reporterName: true,
        isGuest: true,
        message: true,
        status: true,
        createdAt: true,
        recordingTicketId: true,
      },
    });

    console.log(
      `[Support] New ticket created: ${supportTicket.id} by ${supportTicket.reporterName}`,
    );

    return res.status(201).json(supportTicket);
  } catch (error: any) {
    console.error("[Support] Error creating ticket:", error);

    // Check for DB connectivity issues
    if (error.code === "P1001" || error.code === "P1017") {
      return res.status(503).json({
        error: "Service unavailable",
        message: "Database is not available",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to create support ticket",
    });
  }
});

/**
 * GET /api/support/tickets/:id
 * Get a specific support ticket (for reference)
 */
router.get("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        recordingTicket: {
          select: {
            id: true,
            displayName: true,
            status: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        error: "Not found",
        message: "Support ticket not found",
      });
    }

    return res.json(ticket);
  } catch (error: any) {
    console.error("[Support] Error fetching ticket:", error);

    if (error.code === "P1001" || error.code === "P1017") {
      return res.status(503).json({
        error: "Service unavailable",
        message: "Database is not available",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch support ticket",
    });
  }
});

export default router;
