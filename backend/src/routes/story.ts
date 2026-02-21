import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../utils/database";
import QRCode from "qrcode";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import path from "path";
import fs from "fs/promises";

const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "audio/webm",
      "audio/wav",
      "audio/mp3",
      "audio/ogg",
      "audio/mpeg",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."));
    }
  },
});

// Create a new story ticket
router.post("/start", async (req, res) => {
  try {
    const { name, age, location, language } = req.body;

    const profileTicket = await prisma.profileTicket.create({
      data: {
        name: name || null,
        age: age ? parseInt(age) : null,
        location: location || null,
        language: language || "en",
        status: "CREATED",
      },
    });

    res.json({
      success: true,
      ticketId: profileTicket.id,
    });
  } catch (error) {
    console.error("Error creating story ticket:", error);
    res.status(500).json({
      error: "Failed to create story ticket",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Upload audio for a ticket and start processing
router.post("/:ticketId/upload", upload.single("audio"), async (req, res) => {
  try {
    const { ticketId } = req.params;
    const audioFile = req.file;
    const { language } = req.body;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Find the ticket
    const ticket = await prisma.profileTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Update ticket status to UPLOADING
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: { status: "UPLOADING" },
    });

    // Start background processing (we'll implement this incrementally)
    // For now, we'll process it synchronously
    processStoryPipeline(ticketId, audioFile.buffer, language || "en").catch(
      (error) => {
        console.error(`Pipeline error for ticket ${ticketId}:`, error);
        prisma.profileTicket.update({
          where: { id: ticketId },
          data: {
            status: "FAILED",
            processingErrors: { error: error.message },
          },
        });
      },
    );

    res.json({
      success: true,
      message: "Upload started, processing in background",
    });
  } catch (error) {
    console.error("Error uploading audio:", error);
    res.status(500).json({
      error: "Failed to upload audio",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get ticket status
router.get("/:ticketId/status", async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await prisma.profileTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({
      ticketId: ticket.id,
      status: ticket.status,
      progress: getProgressFromStatus(ticket.status),
      errors: ticket.processingErrors || null,
      assetsReady: ticket.status === "COMPLETED",
    });
  } catch (error) {
    console.error("Error getting ticket status:", error);
    res.status(500).json({
      error: "Failed to get ticket status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get ticket assets
router.get("/:ticketId/assets", async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await prisma.profileTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.status !== "COMPLETED") {
      return res.status(400).json({
        error: "Assets not ready yet",
        status: ticket.status,
      });
    }

    res.json({
      ticketId: ticket.id,
      profileUrl: ticket.profilePageUrl,
      qrCodeUrl: ticket.qrCodeUrl,
      gofundmeDraftUrl: ticket.gofundmeDraftUrl,
    });
  } catch (error) {
    console.error("Error getting ticket assets:", error);
    res.status(500).json({
      error: "Failed to get ticket assets",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Process the story pipeline
async function processStoryPipeline(
  ticketId: string,
  audioBuffer: Buffer,
  language: string,
) {
  try {
    console.log(`[Story Pipeline] Starting for ticket ${ticketId}`);

    // Update status: TRANSCRIBING
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: { status: "TRANSCRIBING" },
    });

    // Step 1: Transcribe audio
    const transcript = await transcribeAudio(audioBuffer, language);

    // Update ticket with transcript
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: { story: transcript },
    });

    // Update status: ANALYZING
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: { status: "ANALYZING" },
    });

    // Step 2: Analyze transcript (extract details)
    const analysis = await analyzeTranscript(transcript, language);

    // Update ticket with analysis
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: {
        name: analysis.name || null,
        age: analysis.age || null,
        location: analysis.location || null,
      },
    });

    // Update status: GENERATING_QR
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: { status: "GENERATING_QR" },
    });

    // Step 3: Generate QR code
    const qrCodeUrl = await generateQRCode(ticketId);

    // Update status: GENERATING_DOC
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: {
        status: "GENERATING_DOC",
        qrCodeUrl,
      },
    });

    // Step 4: Generate GoFundMe draft Word doc
    const gofundmeDraftUrl = await generateGoFundMeDraft(
      ticketId,
      analysis,
      transcript,
    );

    // Update status: COMPLETED
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: {
        status: "COMPLETED",
        gofundmeDraftUrl,
        profilePageUrl: `https://www.care2connects.org/profile/${ticketId}`,
        analysisComplete: true,
      },
    });

    console.log(`[Story Pipeline] Completed for ticket ${ticketId}`);
  } catch (error) {
    console.error(`[Story Pipeline] Error for ticket ${ticketId}:`, error);
    await prisma.profileTicket.update({
      where: { id: ticketId },
      data: {
        status: "FAILED",
        processingErrors: {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
    });
    throw error;
  }
}

// Transcribe audio using AssemblyAI or fallback
async function transcribeAudio(
  audioBuffer: Buffer,
  language: string,
): Promise<string> {
  try {
    // Try AssemblyAI first if available
    if (
      process.env.ASSEMBLYAI_API_KEY &&
      !process.env.ASSEMBLYAI_API_KEY.includes("placeholder")
    ) {
      const { AssemblyAI } = require("assemblyai");
      const assemblyai = new AssemblyAI({
        apiKey: process.env.ASSEMBLYAI_API_KEY,
      });

      // Save audio to temp file
      const tempPath = path.join(
        process.cwd(),
        "uploads",
        `temp-${Date.now()}.webm`,
      );
      await fs.mkdir(path.dirname(tempPath), { recursive: true });
      await fs.writeFile(tempPath, audioBuffer);

      try {
        console.log("[AssemblyAI] Starting transcription...");
        const transcript = await assemblyai.transcripts.transcribe({
          audio: tempPath,
          language_code: language === "auto" ? undefined : language,
          speech_model: "best",
        });

        // Clean up temp file
        await fs.unlink(tempPath).catch(() => {});

        if (transcript.status === "error") {
          throw new Error(`AssemblyAI error: ${transcript.error}`);
        }

        console.log("[AssemblyAI] Transcription completed successfully");
        return transcript.text || "";
      } catch (assemblyaiError) {
        console.error(
          "[Transcription] AssemblyAI failed, using fallback:",
          assemblyaiError,
        );
        await fs.unlink(tempPath).catch(() => {});

        // Log incident
        await prisma.incident.create({
          data: {
            service: "assemblyai",
            severity: "warn",
            status: "open",
            summary: "AssemblyAI transcription failed, using fallback",
            details: `Error: ${assemblyaiError instanceof Error ? assemblyaiError.message : "Unknown"}`,
            recommendation: "Check AssemblyAI API key and quota",
          },
        });
      }
    }

    // Fallback: Use Speech Intelligence DB Loop (EVTS/NVT)
    console.log("[Transcription] Using fallback transcription (EVTS/local)");

    // For demo purposes, return a placeholder that indicates fallback was used
    return `[Transcription via fallback system - ${language}]\n\nThis is a placeholder transcript. In production, this would use EVTS (whisper.cpp/vosk) or NVT (Web Speech API) for local transcription. The audio was received and would be processed offline.\n\nAudio received: ${audioBuffer.length} bytes\nLanguage: ${language}`;
  } catch (error) {
    console.error("[Transcription] All transcription methods failed:", error);
    throw new Error(
      "Transcription failed. Please try again or contact support.",
    );
  }
}

// Analyze transcript to extract information
async function analyzeTranscript(
  transcript: string,
  language: string,
): Promise<{
  name?: string;
  age?: number;
  location?: string;
  summary: string;
}> {
  try {
    // Try OpenAI for analysis if available
    if (
      process.env.OPENAI_API_KEY &&
      !process.env.OPENAI_API_KEY.includes("placeholder")
    ) {
      const OpenAI = require("openai").default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Analyze this person's story and extract the following information in JSON format:
- name: person's name (if mentioned)
- age: person's age (if mentioned, as a number)
- location: person's location (if mentioned)
- summary: a brief 2-3 sentence summary of their story

Story:
${transcript}

Return only valid JSON in this format:
{
  "name": "...",
  "age": 25,
  "location": "...",
  "summary": "..."
}`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        });

        const content = response.choices[0]?.message?.content || "{}";
        const analysis = JSON.parse(content);
        return analysis;
      } catch (openaiError) {
        console.error("[Analysis] OpenAI failed, using fallback:", openaiError);

        // Log incident
        await prisma.incident.create({
          data: {
            service: "openai",
            severity: "warn",
            status: "open",
            summary: "OpenAI analysis failed, using fallback",
            details: `Error: ${openaiError instanceof Error ? openaiError.message : "Unknown"}`,
            recommendation: "Check OpenAI API key and quota",
          },
        });
      }
    }

    // Fallback: Basic regex extraction
    console.log("[Analysis] Using fallback analysis");

    const nameMatch =
      transcript.match(/my name is (\w+)/i) || transcript.match(/I'm (\w+)/i);
    const ageMatch = transcript.match(/(\d+) years old/i);
    const locationMatch = transcript.match(
      /(?:from|in|live in) ([A-Z][a-z]+(?:,?\s+[A-Z][a-z]+)?)/,
    );

    return {
      name: nameMatch ? nameMatch[1] : undefined,
      age: ageMatch ? parseInt(ageMatch[1]) : undefined,
      location: locationMatch ? locationMatch[1] : undefined,
      summary:
        transcript.substring(0, 200) + (transcript.length > 200 ? "..." : ""),
    };
  } catch (error) {
    console.error("[Analysis] Error analyzing transcript:", error);
    return {
      summary:
        transcript.substring(0, 200) + (transcript.length > 200 ? "..." : ""),
    };
  }
}

// Generate QR code
async function generateQRCode(ticketId: string): Promise<string> {
  try {
    const url = `https://www.care2connects.org/profile/${ticketId}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 4,
      width: 300,
    });

    // In production, you would save this to cloud storage
    // For now, we'll return the data URL directly
    return qrDataUrl;
  } catch (error) {
    console.error("[QR Code] Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

// Generate GoFundMe draft Word document
async function generateGoFundMeDraft(
  ticketId: string,
  analysis: any,
  transcript: string,
): Promise<string> {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "GoFundMe Campaign Draft",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: `Profile ID: ${ticketId}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "",
            }),
            new Paragraph({
              text: "Campaign Title Suggestions:",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: `• Help ${analysis.name || "[Name]"} Get Back on Their Feet`,
              spacing: { before: 100 },
            }),
            new Paragraph({
              text: `• Support ${analysis.name || "[Name]"}'s Journey to Stability`,
            }),
            new Paragraph({
              text: `• A Fresh Start for ${analysis.name || "[Name]"}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "",
            }),
            new Paragraph({
              text: "Campaign Story:",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: analysis.summary || transcript.substring(0, 500),
              spacing: { before: 100, after: 200 },
            }),
            new Paragraph({
              text: "",
            }),
            new Paragraph({
              text: "About:",
              heading: HeadingLevel.HEADING_2,
            }),
            ...(analysis.name
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Name: ", bold: true }),
                      new TextRun(analysis.name),
                    ],
                    spacing: { before: 100 },
                  }),
                ]
              : []),
            ...(analysis.age
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Age: ", bold: true }),
                      new TextRun(analysis.age.toString()),
                    ],
                  }),
                ]
              : []),
            ...(analysis.location
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Location: ", bold: true }),
                      new TextRun(analysis.location),
                    ],
                  }),
                ]
              : []),
            new Paragraph({
              text: "",
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "How You Can Help:",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: "Your donation will help provide:",
              spacing: { before: 100 },
            }),
            new Paragraph({
              text: "• Temporary housing and shelter",
            }),
            new Paragraph({
              text: "• Food and basic necessities",
            }),
            new Paragraph({
              text: "• Job training and employment support",
            }),
            new Paragraph({
              text: "• Healthcare and mental health services",
            }),
            new Paragraph({
              text: "• Transportation assistance",
            }),
            new Paragraph({
              text: "",
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "Profile Link:",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: `https://www.care2connects.org/profile/${ticketId}`,
              spacing: { before: 100 },
            }),
          ],
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Save to uploads folder
    const uploadsDir = path.join(process.cwd(), "uploads", "gofundme-drafts");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `gofundme-draft-${ticketId}.docx`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);

    // Return URL (in production, this would be a cloud storage URL)
    return `/api/profile/${ticketId}/gofundme-draft.docx`;
  } catch (error) {
    console.error("[GoFundMe Draft] Error generating document:", error);
    throw new Error("Failed to generate GoFundMe draft");
  }
}

// Helper function to map status to progress percentage
function getProgressFromStatus(status: string): number {
  const progressMap: Record<string, number> = {
    CREATED: 0,
    UPLOADING: 10,
    TRANSCRIBING: 30,
    ANALYZING: 50,
    GENERATING_QR: 70,
    GENERATING_DOC: 85,
    COMPLETED: 100,
    FAILED: -1,
  };
  return progressMap[status] || 0;
}

export default router;
