import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  processTicket,
  getTicketStatus,
} from "../services/donationPipeline/orchestrator";
import {
  generateDocument,
  getTicketDocuments,
} from "../services/documentGenerator";
import { createPaymentQR, getTicketQRCode } from "../services/qrCodeGenerator";
import {
  jobQueue,
  PipelineJob,
} from "../services/donationPipeline/jobOrchestrator";

const router = Router();
const prisma = new PrismaClient();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "storage", "recordings");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `recording-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "audio/webm",
      "audio/wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/ogg",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedMimes.join(", ")}`));
    }
  },
});

/**
 * GET /api/tickets/search
 * Search for tickets by contact info
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
        donationDraft: true,
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
    console.error("[Tickets API] Error searching tickets:", error);
    res.status(500).json({
      error: "Failed to search tickets",
      details: error.message,
    });
  }
});

/**
 * POST /api/tickets/create
 * Create a new RecordingTicket
 *
 * Body:
 * {
 *   contactType: 'EMAIL' | 'PHONE' | 'SOCIAL',
 *   contactValue: string,
 *   displayName?: string
 * }
 */
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { contactType, contactValue, displayName } = req.body;

    if (!contactType || !contactValue) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["contactType", "contactValue"],
      });
    }

    const ticket = await prisma.recordingTicket.create({
      data: {
        contactType,
        contactValue,
        displayName: displayName || `Ticket-${Date.now()}`,
        status: "DRAFT",
      },
    });

    res.status(201).json({
      success: true,
      ticket: {
        id: ticket.id,
        contactType: ticket.contactType,
        contactValue: ticket.contactValue,
        displayName: ticket.displayName,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[Tickets API] Error creating ticket:", error);
    res.status(500).json({
      error: "Failed to create ticket",
      details: error.message,
    });
  }
});

/**
 * GET /api/tickets/:id
 * Retrieve a RecordingTicket with all relations
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { include } = req.query;

    // Parse include query param (e.g., ?include=draft,documents,attributions,incidents)
    const includeOptions: any = {};
    if (include && typeof include === "string") {
      const parts = include.split(",");
      if (parts.includes("draft")) includeOptions.donationDraft = true;
      if (parts.includes("documents")) includeOptions.generatedDocuments = true;
      if (parts.includes("attributions"))
        includeOptions.stripeAttributions = true;
      if (parts.includes("qr")) includeOptions.qrCodeLink = true;
      if (parts.includes("transcriptions"))
        includeOptions.transcriptionSessions = true;
      if (parts.includes("support")) includeOptions.supportTickets = true;
      if (parts.includes("incidents")) {
        includeOptions.pipelineIncidents = {
          include: {
            knowledgeBindings: {
              take: 3, // Preview only
            },
          },
          orderBy: { createdAt: "desc" as const },
          take: 10, // Latest 10 incidents
        };
      }
    }

    const ticket = await prisma.recordingTicket.findUnique({
      where: { id },
      include:
        Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    });

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
        ticketId: id,
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error retrieving ticket:", error);
    res.status(500).json({
      error: "Failed to retrieve ticket",
      details: error.message,
    });
  }
});

/**
 * POST /api/tickets/:id/upload-audio
 * Upload audio file for a RecordingTicket
 *
 * Multipart form with 'audio' field
 */
router.post(
  "/:id/upload-audio",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({
          error: "No audio file provided",
        });
      }

      // Verify ticket exists
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id },
      });

      if (!ticket) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          error: "Ticket not found",
          ticketId: id,
        });
      }

      // Store file path in ticket metadata (you may want to use a JSON field)
      await prisma.recordingTicket.update({
        where: { id },
        data: {
          status: "RECORDING",
          // Note: You may want to add an audioFilePath field to the schema
          // For now, we'll assume you'll store this in a related table
        },
      });

      res.status(200).json({
        success: true,
        message: "Audio uploaded successfully",
        file: {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        ticket: {
          id: ticket.id,
          status: "RECORDING",
        },
      });
    } catch (error: any) {
      console.error("[Tickets API] Error uploading audio:", error);

      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        error: "Failed to upload audio",
        details: error.message,
      });
    }
  },
);

/**
 * PATCH /api/tickets/:id
 * Update a RecordingTicket
 *
 * Body:
 * {
 *   displayName?: string,
 *   status?: RecordingTicketStatus,
 *   contactValue?: string
 * }
 */
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { displayName, status, contactValue } = req.body;

    const updateData: any = {};
    if (displayName) updateData.displayName = displayName;
    if (status) updateData.status = status;
    if (contactValue) updateData.contactValue = contactValue;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No update fields provided",
        allowed: ["displayName", "status", "contactValue"],
      });
    }

    const ticket = await prisma.recordingTicket.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error updating ticket:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Ticket not found",
        ticketId: req.params.id,
      });
    }

    res.status(500).json({
      error: "Failed to update ticket",
      details: error.message,
    });
  }
});

/**
 * GET /api/tickets/:id/status
 * Get current status of a RecordingTicket (for polling during processing)
 */
router.get("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.recordingTicket.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        displayName: true,
        updatedAt: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
        ticketId: id,
      });
    }

    res.status(200).json({
      success: true,
      status: ticket.status,
      ticket,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error getting ticket status:", error);
    res.status(500).json({
      error: "Failed to get ticket status",
      details: error.message,
    });
  }
});

/**
 * PATCH /api/tickets/:id/draft
 * Update the DonationDraft for a RecordingTicket
 *
 * Body:
 * {
 *   title?: string,
 *   story?: string,
 *   goalAmount?: number,
 *   beneficiaryName?: string,
 *   beneficiaryLocation?: string,
 *   currency?: string,
 *   breakdown?: object
 * }
 */
router.patch("/:id/draft", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      story,
      goalAmount,
      beneficiaryName,
      beneficiaryLocation,
      currency,
      breakdown,
    } = req.body;

    // Check if ticket exists
    const ticket = await prisma.recordingTicket.findUnique({
      where: { id },
      include: { donationDraft: true },
    });

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
        ticketId: id,
      });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (story !== undefined) updateData.story = story;
    if (goalAmount !== undefined) updateData.goalAmount = goalAmount;
    if (beneficiaryName !== undefined)
      updateData.beneficiaryName = beneficiaryName;
    if (beneficiaryLocation !== undefined)
      updateData.beneficiaryLocation = beneficiaryLocation;
    if (currency !== undefined) updateData.currency = currency;
    if (breakdown !== undefined) updateData.editableJson = breakdown;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No update fields provided",
        allowed: [
          "title",
          "story",
          "goalAmount",
          "beneficiaryName",
          "beneficiaryLocation",
          "currency",
          "breakdown",
        ],
      });
    }

    let draft;
    if (ticket.donationDraft) {
      // Update existing draft
      draft = await prisma.donationDraft.update({
        where: { id: ticket.donationDraft.id },
        data: updateData,
      });
    } else {
      // Create new draft
      draft = await prisma.donationDraft.create({
        data: {
          ticketId: id,
          title: title || "Untitled Campaign",
          story: story || "",
          currency: currency || "USD",
          ...updateData,
        },
      });
    }

    res.status(200).json({
      success: true,
      draft,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error updating draft:", error);
    res.status(500).json({
      error: "Failed to update draft",
      details: error.message,
    });
  }
});

/**
 * POST /api/tickets/:id/process
 * Orchestrate full pipeline: transcription → analysis → draft generation
 *
 * Body:
 * {
 *   audioFilePath: string
 * }
 */
router.post("/:id/process", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { audioFilePath } = req.body;

    if (!audioFilePath) {
      return res.status(400).json({
        error: "Missing required field: audioFilePath",
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

    // Start processing (async)
    console.log(`[Tickets API] Starting pipeline processing for ticket ${id}`);

    // Run in background
    processTicket(id, { audioFilePath })
      .then((result) => {
        console.log(
          `[Tickets API] Pipeline completed for ticket ${id}:`,
          result.finalStatus,
        );
      })
      .catch((error) => {
        console.error(`[Tickets API] Pipeline error for ticket ${id}:`, error);
      });

    // Return immediately with processing status
    res.status(202).json({
      success: true,
      message: "Processing started",
      ticket: {
        id: ticket.id,
        status: "PROCESSING",
      },
      pollUrl: `/api/tickets/${id}/status`,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error starting process:", error);
    res.status(500).json({
      error: "Failed to start processing",
      details: error.message,
    });
  }
});

/**
 * POST /api/tickets/:id/generate-doc
 * Generate a Word document for the ticket's donation draft
 *
 * Body:
 * {
 *   docType?: 'GOFUNDME_DRAFT' | 'RECEIPT' (default: GOFUNDME_DRAFT)
 * }
 */
router.post("/:id/generate-doc", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { docType = "GOFUNDME_DRAFT" } = req.body;

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

    // Generate document
    const result = await generateDocument({
      ticketId: id,
      docType,
    });

    if (!result.success) {
      return res.status(500).json({
        error: "Document generation failed",
        details: result.error,
      });
    }

    res.status(200).json({
      success: true,
      document: {
        id: result.documentId,
        filePath: result.filePath,
        type: docType,
      },
    });
  } catch (error: any) {
    console.error("[Tickets API] Error generating document:", error);
    res.status(500).json({
      error: "Failed to generate document",
      details: error.message,
    });
  }
});

/**
 * GET /api/tickets/:id/documents
 * List all generated documents for a ticket
 */
router.get("/:id/documents", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const documents = await getTicketDocuments(id);

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error listing documents:", error);
    res.status(500).json({
      error: "Failed to list documents",
      details: error.message,
    });
  }
});

/**
 * POST /api/tickets/:id/create-payment
 * Create Stripe Checkout Session + QR Code for payment
 *
 * Body:
 * {
 *   amount: number (in dollars),
 *   currency?: string (default: USD),
 *   description?: string
 * }
 */
router.post("/:id/create-payment", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, currency, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be greater than 0",
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

    // Create payment QR code
    const result = await createPaymentQR({
      ticketId: id,
      amount,
      currency,
      description,
    });

    if (!result.success) {
      return res.status(500).json({
        error: "Payment creation failed",
        details: result.error,
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        qrCodeId: result.qrCodeId,
        checkoutSessionId: result.checkoutSessionId,
        checkoutUrl: result.checkoutUrl,
        qrCodeData: result.qrCodeData,
      },
    });
  } catch (error: any) {
    console.error("[Tickets API] Error creating payment:", error);
    res.status(500).json({
      error: "Failed to create payment",
      details: error.message,
    });
  }
});

/**
 * GET /api/tickets/:id/qr-code
 * Get QR code for existing payment link
 */
router.get("/:id/qr-code", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const qrCode = await getTicketQRCode(id);

    if (!qrCode) {
      return res.status(404).json({
        error: "No QR code found for this ticket",
        message:
          "Create a payment first using POST /api/tickets/:id/create-payment",
      });
    }

    res.status(200).json({
      success: true,
      qrCode,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error retrieving QR code:", error);
    res.status(500).json({
      error: "Failed to retrieve QR code",
      details: error.message,
    });
  }
});

/**
 * GET /api/tickets/:id/donations
 * Get all donations (StripeAttributions) for a ticket
 * Returns donation ledger with timestamps, amounts, and donor last names (privacy-safe)
 */
router.get("/:id/donations", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

    // Get all donations with donor details
    const donations = await prisma.stripeAttribution.findMany({
      where: { ticketId: id },
      orderBy: { paidAt: "desc" }, // Show most recent paid donations first
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        donorLastName: true,
        donorCountry: true,
        stripeCreatedAt: true,
        paidAt: true,
        refundedAt: true,
        createdAt: true,
        checkoutSessionId: true,
      },
    });

    // Format donations for display
    const formattedDonations = donations.map((d) => ({
      id: d.id,
      amount: parseFloat(d.amount.toString()),
      currency: d.currency,
      status: d.status,
      donor: d.donorLastName || "Anonymous",
      country: d.donorCountry,
      createdAt: d.stripeCreatedAt || d.createdAt,
      paidAt: d.paidAt,
      refundedAt: d.refundedAt,
      sessionId: d.checkoutSessionId,
    }));

    res.status(200).json({
      success: true,
      count: donations.length,
      donations: formattedDonations,
      ticketId: id,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error retrieving donations:", error);
    res.status(500).json({
      error: "Failed to retrieve donations",
      details: error.message,
    });
  }
});

/**
 * GET /api/tickets/:id/donations/total
 * Get total donation amount for a ticket
 * Calculates: SUM(PAID donations) - SUM(REFUNDED donations)
 */
router.get("/:id/donations/total", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

    // Get all donations (PAID and REFUNDED)
    const allDonations = await prisma.stripeAttribution.findMany({
      where: {
        ticketId: id,
        status: { in: ["PAID", "REFUNDED"] },
      },
      orderBy: { paidAt: "desc" },
    });

    // Calculate totals
    const paidTotal = allDonations
      .filter((d) => d.status === "PAID")
      .reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0);

    const refundedTotal = allDonations
      .filter((d) => d.status === "REFUNDED")
      .reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0);

    const netTotal = paidTotal - refundedTotal;

    // Get currency from first donation or default to USD
    const currency = allDonations.length > 0 ? allDonations[0].currency : "USD";

    // Get last successful donation
    const lastPaidDonation = allDonations.find((d) => d.status === "PAID");

    res.status(200).json({
      success: true,
      total: netTotal,
      currency,
      breakdown: {
        paid: paidTotal,
        refunded: refundedTotal,
        net: netTotal,
      },
      counts: {
        paid: allDonations.filter((d) => d.status === "PAID").length,
        refunded: allDonations.filter((d) => d.status === "REFUNDED").length,
        total: allDonations.length,
      },
      lastDonation: lastPaidDonation
        ? {
            paidAt: lastPaidDonation.paidAt,
            amount: parseFloat(lastPaidDonation.amount.toString()),
            donor: lastPaidDonation.donorLastName || "Anonymous",
          }
        : null,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error calculating donation total:", error);
    res.status(500).json({
      error: "Failed to calculate donation total",
      details: error.message,
    });
  }
});

/**
 * GET /api/tickets/:id/documents/:docId/download
 * Download a generated document file
 */
router.get(
  "/:id/documents/:docId/download",
  async (req: Request, res: Response) => {
    try {
      const { id, docId } = req.params;

      // Get document
      const document = await prisma.generatedDocument.findUnique({
        where: { id: docId },
        include: { ticket: true },
      });

      if (!document) {
        return res.status(404).json({
          error: "Document not found",
          documentId: docId,
        });
      }

      // Verify document belongs to ticket
      if (document.ticketId !== id) {
        return res.status(403).json({
          error: "Document does not belong to this ticket",
        });
      }

      // Check if file exists
      if (!document.filePath) {
        return res.status(404).json({
          error: "Document file path not found",
        });
      }

      const filePath = path.join(process.cwd(), document.filePath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: "Document file not found on disk",
          filePath: document.filePath,
        });
      }

      // Get file extension for content type
      const ext = path.extname(filePath).toLowerCase();
      const contentTypeMap: Record<string, string> = {
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".pdf": "application/pdf",
        ".txt": "text/plain",
      };

      const contentType = contentTypeMap[ext] || "application/octet-stream";

      // Set headers for download
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(filePath)}"`,
      );

      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("[Tickets API] Error downloading document:", error);
      res.status(500).json({
        error: "Failed to download document",
        details: error.message,
      });
    }
  },
);

/**
 * POST /api/tickets/:id/process
 * Start async pipeline processing for a ticket (Phase 6C)
 *
 * Returns job ID for polling status instead of blocking HTTP request.
 *
 * Response:
 * {
 *   success: true,
 *   jobId: string,
 *   ticketId: string,
 *   status: 'QUEUED'
 * }
 */
router.post("/:id/process", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

    // Check if ticket is already processing or complete
    const existingJob = jobQueue.getJobByTicketId(id);
    if (existingJob && ["PROCESSING", "QUEUED"].includes(existingJob.status)) {
      return res.status(409).json({
        error: "Ticket is already being processed",
        jobId: existingJob.id,
        status: existingJob.status,
        stage: existingJob.stage,
        progress: existingJob.progress,
      });
    }

    // Add job to queue
    const job = await jobQueue.addJob(id);

    res.status(202).json({
      success: true,
      message: "Processing started",
      jobId: job.id,
      ticketId: id,
      status: job.status,
      pollUrl: `/api/tickets/${id}/status`,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error starting processing:", error);
    res.status(500).json({
      error: "Failed to start processing",
      details: error.message,
    });
  }
});

/**
 * GET /api/tickets/:id/status
 * Poll for current pipeline processing status (Phase 6C)
 *
 * Response:
 * {
 *   success: true,
 *   ticketId: string,
 *   status: 'QUEUED' | 'PROCESSING' | 'READY' | 'NEEDS_INFO' | 'ERROR',
 *   stage: 'TRANSCRIPTION' | 'ANALYSIS' | 'DRAFT' | 'QR' | 'COMPLETE',
 *   progress: 0-100,
 *   lastUpdated: timestamp,
 *   needsInfo?: {...},
 *   draft?: {...},
 *   qr?: {...}
 * }
 */
router.get("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get job status
    const job = jobQueue.getJobByTicketId(id);

    if (!job) {
      // No active job - check ticket status directly
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id },
        include: {
          donationDraft: true,
          qrCodeLink: true,
        },
      });

      if (!ticket) {
        return res.status(404).json({
          error: "Ticket not found",
          ticketId: id,
        });
      }

      // Map ticket status to job status
      const statusMap: Record<string, any> = {
        DRAFT: { status: "READY", stage: "CREATED", progress: 0 },
        RECORDING: { status: "READY", stage: "CREATED", progress: 5 },
        PROCESSING: { status: "PROCESSING", stage: "ANALYSIS", progress: 50 },
        NEEDS_INFO: { status: "NEEDS_INFO", stage: "DRAFT", progress: 75 },
        READY: { status: "READY", stage: "COMPLETE", progress: 100 },
        PUBLISHED: { status: "READY", stage: "COMPLETE", progress: 100 },
        ERROR: { status: "ERROR", stage: "ANALYSIS", progress: 50 },
      };

      const mappedStatus = statusMap[ticket.status] || {
        status: "READY",
        stage: "CREATED",
        progress: 0,
      };

      return res.status(200).json({
        success: true,
        ticketId: id,
        ...mappedStatus,
        lastUpdated: ticket.updatedAt,
        needsInfo: ticket.needsInfo || undefined,
        draft: ticket.donationDraft || undefined,
        qr: ticket.qrCodeLink || undefined,
      });
    }

    // Return active job status
    res.status(200).json({
      success: true,
      jobId: job.id,
      ticketId: id,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      lastUpdated: job.lastUpdated,
      error: job.error,
      needsInfo: job.needsInfo,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error getting status:", error);
    res.status(500).json({
      error: "Failed to get status",
      details: error.message,
    });
  }
});

/**
 * POST /api/tickets/:id/provide-info
 * Provide missing information and resume pipeline (Phase 6C/6D)
 *
 * Body:
 * {
 *   goalAmount?: number, // In cents
 *   beneficiaryName?: string,
 *   location?: string,
 *   duration?: string
 * }
 */
router.post("/:id/provide-info", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { goalAmount, beneficiaryName, location, duration } = req.body;

    // Verify ticket exists and is in NEEDS_INFO state
    const ticket = await prisma.recordingTicket.findUnique({
      where: { id },
      include: { donationDraft: true },
    });

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
        ticketId: id,
      });
    }

    if (ticket.status !== "NEEDS_INFO") {
      return res.status(400).json({
        error: "Ticket is not awaiting information",
        currentStatus: ticket.status,
      });
    }

    // Update draft with provided information
    const updateData: any = {};
    if (goalAmount !== undefined) updateData.goalAmount = goalAmount;
    if (beneficiaryName !== undefined) updateData.beneficiary = beneficiaryName;
    if (location !== undefined) updateData.location = location;
    if (duration !== undefined) updateData.timeline = duration;

    if (ticket.donationDraft) {
      await prisma.donationDraft.update({
        where: { id: ticket.donationDraft.id },
        data: updateData,
      });
    }

    // Clear needsInfo field and update status
    await prisma.recordingTicket.update({
      where: { id },
      data: {
        needsInfo: null,
        status: "PROCESSING", // Resume processing
      },
    });

    // Restart processing job
    const job = await jobQueue.addJob(id);

    res.status(200).json({
      success: true,
      message: "Information provided, resuming processing",
      ticketId: id,
      jobId: job.id,
      status: "PROCESSING",
      resumedFrom: "NEEDS_INFO",
    });
  } catch (error: any) {
    console.error("[Tickets API] Error providing info:", error);
    res.status(500).json({
      error: "Failed to provide information",
      details: error.message,
    });
  }
});

/**
 * POST /api/tickets/:id/retry
 * Retry a failed job (Phase 6C)
 */
router.post("/:id/retry", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = jobQueue.getJobByTicketId(id);
    if (!job) {
      return res.status(404).json({
        error: "No job found for this ticket",
        ticketId: id,
      });
    }

    if (job.status !== "ERROR") {
      return res.status(400).json({
        error: "Only failed jobs can be retried",
        currentStatus: job.status,
      });
    }

    const retriedJob = await jobQueue.retryJob(job.id);

    res.status(200).json({
      success: true,
      message: "Job retry initiated",
      jobId: retriedJob.id,
      ticketId: id,
      status: retriedJob.status,
    });
  } catch (error: any) {
    console.error("[Tickets API] Error retrying job:", error);
    res.status(500).json({
      error: "Failed to retry job",
      details: error.message,
    });
  }
});

export default router;
