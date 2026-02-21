import { Router, Request, Response } from "express";
import { query } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";
import GofundmeDocxExporter from "../exports/generateGofundmeDocx";

const router = Router();

/**
 * Recursively convert ISO date-like strings to Date objects for known keys
 */
function coerceDates(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(coerceDates);

  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") {
      // common date keys
      if (
        /extractedAt|lastUpdated|dateOfBirth|dob|createdAt|updatedAt/i.test(k)
      ) {
        const parsed = Date.parse(v);
        if (!isNaN(parsed)) {
          out[k] = new Date(v);
          continue;
        }
      }
      out[k] = v;
    } else if (typeof v === "object" && v !== null) {
      out[k] = coerceDates(v);
    } else {
      out[k] = v;
    }
  }

  return out;
}

/**
 * GET /api/exports/gofundme-docx
 * Generate and download GoFundMe Word document
 */
router.get("/gofundme-docx", async (req: Request, res: Response) => {
  try {
    const { draft: draftString, filename } = req.query;

    if (!draftString) {
      return res.status(400).json({
        success: false,
        error: "Draft data is required",
      });
    }

    // Parse draft data
    let draft;
    try {
      draft = JSON.parse(draftString as string);
      draft = coerceDates(draft);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid draft data format",
      });
    }

    // Generate document
    const documentBuffer = await GofundmeDocxExporter.generateDocument(draft, {
      includeInstructions: true,
      includePasteMap: true,
    });

    // Set appropriate headers for file download
    const documentFilename =
      (filename as string) || `GoFundMe_Draft_${Date.now()}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${documentFilename}"`,
    );
    res.setHeader("Content-Length", documentBuffer.length);

    // Send the document
    res.send(documentBuffer);
  } catch (error) {
    console.error("Document generation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate document",
    });
  }
});

/**
 * POST /api/exports/gofundme-docx
 * Generate GoFundMe Word document with POST data
 */
router.post("/gofundme-docx", async (req, res) => {
  try {
    const { draft: incomingDraft, filename, options = {} } = req.body;

    if (!incomingDraft) {
      return res.status(400).json({
        success: false,
        error: "Draft data is required",
      });
    }
    const draft = coerceDates(incomingDraft);

    // Generate document
    const documentBuffer = await GofundmeDocxExporter.generateDocument(draft, {
      includeInstructions: true,
      includePasteMap: true,
      ...options,
    });

    // Set appropriate headers for file download
    const documentFilename = filename || `GoFundMe_Draft_${Date.now()}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${documentFilename}"`,
    );
    res.setHeader("Content-Length", documentBuffer.length);

    // Send the document
    res.send(documentBuffer);
  } catch (error) {
    // Phase 4: Enhanced error handling with detailed logging for POST route
    console.error("[EXPORT_ERROR] POST Document generation failed:", {
      error: error.message,
      stackTrace: error.stack?.slice(0, 500),
      requestData: {
        hasDraft: !!req.body.draft,
        filename: req.body.filename || "not_provided",
        optionsProvided: Object.keys(req.body.options || {}),
      },
      timestamp: new Date().toISOString(),
    });

    // Determine appropriate error response
    let statusCode = 500;
    let errorMessage = "Failed to generate document";

    if (error.message.includes("Draft data is required")) {
      statusCode = 400;
      errorMessage = "Invalid or missing draft data";
    } else if (error.message.includes("completely failed")) {
      statusCode = 503; // Service Unavailable
      errorMessage = "Document generation service temporarily unavailable";
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
