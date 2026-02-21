/**
 * Manual Draft Save Endpoint
 * POST /api/donations/manual-draft
 *
 * Allows users to save manually entered fundraising campaign data
 * when automated pipeline fails
 */

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  ManualDraftRequest,
  ManualDraftResponse,
  DonationDraftData,
} from "../types/fallback";

const router = Router();
const prisma = new PrismaClient();

/**
 * Save or update manual draft
 */
router.post("/manual-draft", async (req: Request, res: Response) => {
  try {
    const {
      ticketId,
      title,
      story,
      goalAmount,
      currency = "USD",
    }: ManualDraftRequest = req.body;

    // Minimal validation only
    if (!ticketId || !ticketId.trim()) {
      return res.status(400).json({
        success: false,
        error: "Ticket ID is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Campaign title is required",
      });
    }

    if (!story || !story.trim()) {
      return res.status(400).json({
        success: false,
        error: "Campaign story is required",
      });
    }

    if (!goalAmount || goalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Goal amount must be greater than zero",
      });
    }

    // Verify ticket exists
    const ticket = await prisma.recordingTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Recording ticket not found",
      });
    }

    // Check for existing draft
    const existingDraft = await prisma.donationDraft.findFirst({
      where: { ticketId },
    });

    let draft;
    const now = new Date();

    if (existingDraft) {
      // Update existing draft
      draft = await prisma.donationDraft.update({
        where: { id: existingDraft.id },
        data: {
          title: title.trim(),
          story: story.trim(),
          goalAmount,
          currency,
          generationMode: "MANUAL_FALLBACK",
          manuallyEditedAt: now,
          updatedAt: now,
        },
      });
    } else {
      // Create new draft
      draft = await prisma.donationDraft.create({
        data: {
          ticketId,
          title: title.trim(),
          story: story.trim(),
          goalAmount,
          currency,
          generationMode: "MANUAL_FALLBACK",
          extractedAt: now,
          manuallyEditedAt: now,
        },
      });
    }

    console.log(`[Manual Draft] Saved for ticket ${ticketId}: ${draft.id}`);

    const response: ManualDraftResponse = {
      success: true,
      draft: {
        id: draft.id,
        ticketId: draft.ticketId,
        title: draft.title,
        story: draft.story,
        goalAmount: draft.goalAmount ? Number(draft.goalAmount) : null,
        currency: draft.currency || "USD",
        generationMode: "MANUAL_FALLBACK",
        extractedAt: draft.extractedAt || undefined,
        manuallyEditedAt: draft.manuallyEditedAt || undefined,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("[Manual Draft] Save failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save draft",
    });
  }
});

/**
 * Get existing manual draft
 */
router.get("/manual-draft/:ticketId", async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const draft = await prisma.donationDraft.findFirst({
      where: { ticketId },
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: "Draft not found",
      });
    }

    const response: ManualDraftResponse = {
      success: true,
      draft: {
        id: draft.id,
        ticketId: draft.ticketId,
        title: draft.title,
        story: draft.story,
        goalAmount: draft.goalAmount ? Number(draft.goalAmount) : null,
        currency: draft.currency || "USD",
        generationMode: (draft.generationMode as any) || "AUTOMATED",
        extractedAt: draft.extractedAt || undefined,
        manuallyEditedAt: draft.manuallyEditedAt || undefined,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("[Manual Draft] Get failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve draft",
    });
  }
});

export default router;
