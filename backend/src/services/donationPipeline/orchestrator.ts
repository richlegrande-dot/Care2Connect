import {
  PrismaClient,
  TranscriptionSource,
  TranscriptionEngine,
} from "@prisma/client";
import { SessionManager } from "../speechIntelligence/sessionManager";
import { getTranscriptionProvider } from "../../providers/transcription";
import {
  extractSignals,
  validateSignalQuality,
} from "../speechIntelligence/transcriptSignalExtractor";
import { generateDraft as buildDraft, updateDraft } from "./draftBuilder";
import { validateDraftCompleteness } from "../../schemas/donationDraftRequirements";
import { updateJobProgress } from "./jobOrchestrator";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();
const sessionManager = new SessionManager();

/**
 * Phase 6: Donation Pipeline Orchestrator (Enhanced Phase 6B-6D)
 *
 * Coordinates the full pipeline:
 * 1. Audio → Transcription (AssemblyAI only in V1)
 * 2. Signal extraction (Phase 6B: names, needs, urgency, missing fields)
 * 3. Draft generation (Phase 6D: structured, quality-scored)
 * 4. NEEDS_INFO gating when required fields missing
 * 5. Status updates at each step
 */

export interface ProcessTicketOptions {
  audioFilePath: string;
  skipTranscription?: boolean; // For testing with pre-existing transcription
}

export interface ProcessTicketResult {
  success: boolean;
  ticketId: string;
  steps: {
    transcription?: {
      success: boolean;
      sessionId?: string;
      engine?: string;
      duration?: number;
      error?: string;
    };
    analysis?: {
      success: boolean;
      keyPoints?: string[];
      sentiment?: string;
      language?: string;
      error?: string;
    };
    draft?: {
      success: boolean;
      draftId?: string;
      error?: string;
    };
  };
  finalStatus: string;
  error?: string;
}

/**
 * Main orchestration function - processes a RecordingTicket through the pipeline
 * Phase 6B-6D: Enhanced with signal extraction and draft builder
 */
export async function processTicket(
  ticketId: string,
  options?: ProcessTicketOptions,
): Promise<ProcessTicketResult> {
  const result: ProcessTicketResult = {
    success: false,
    ticketId,
    steps: {},
    finalStatus: "ERROR",
  };

  try {
    // Verify ticket exists
    const ticket = await prisma.recordingTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new Error(`RecordingTicket ${ticketId} not found`);
    }

    // Update status to PROCESSING
    await prisma.recordingTicket.update({
      where: { id: ticketId },
      data: { status: "PROCESSING" },
    });

    // Update job progress (if job exists)
    updateJobProgress(ticketId, "TRANSCRIPTION");

    // Step 1: Transcription (AssemblyAI only in V1 - no OpenAI fallback)
    let transcriptionSessionId: string | undefined;
    let transcript: string = "";

    if (!options?.skipTranscription) {
      const audioFilePath = options?.audioFilePath || ticket.audioUrl || "";
      if (!audioFilePath) {
        throw new Error("No audio file path provided");
      }

      result.steps.transcription = await performTranscription(
        ticketId,
        audioFilePath,
      );

      if (!result.steps.transcription.success) {
        throw new Error(
          `Transcription failed: ${result.steps.transcription.error}`,
        );
      }

      transcriptionSessionId = result.steps.transcription.sessionId;

      // Retrieve transcript text
      if (transcriptionSessionId) {
        const session = await prisma.transcriptionSession.findUnique({
          where: { id: transcriptionSessionId },
          include: { segments: true },
        });

        if (session?.segments) {
          transcript = session.segments.map((s) => s.text).join(" ");
        } else {
          transcript = "No transcription available";
        }
      }
    }

    // Update job progress
    updateJobProgress(ticketId, "ANALYSIS");

    // Step 2: Signal Extraction (Phase 6B)
    console.log("[Orchestrator] Extracting signals from transcript");
    const signals = await extractSignals({ text: transcript });
    const signalValidation = validateSignalQuality(signals);

    console.log(
      `[Orchestrator] Extracted signals - Quality: ${signalValidation.qualityScore.toFixed(2)}`,
    );
    console.log(
      `[Orchestrator] Missing fields: ${signals.missingFields.join(", ") || "none"}`,
    );

    // Update job progress
    updateJobProgress(ticketId, "DRAFT");

    // Step 3: Draft Generation (Phase 6D)
    const draftInput = {
      ticketId,
      transcript,
      signals,
      userProvidedData: {}, // Will be populated if user provides info via /provide-info endpoint
    };

    const generatedDraft = await buildDraft(draftInput);

    // Check if draft is complete or needs more info
    if (generatedDraft.missingFields.length > 0) {
      console.log(
        `[Orchestrator] Draft incomplete - missing: ${generatedDraft.missingFields.join(", ")}`,
      );

      // Store needsInfo in ticket
      await prisma.recordingTicket.update({
        where: { id: ticketId },
        data: {
          status: "NEEDS_INFO",
          needsInfo: {
            missingFields: generatedDraft.missingFields,
            suggestedQuestions: generatedDraft.suggestedQuestions,
            currentDraftPreview: {
              title: generatedDraft.title,
              excerpt: generatedDraft.excerpt,
              qualityScore: generatedDraft.qualityScore,
            },
          },
        },
      });

      result.finalStatus = "NEEDS_INFO";
      result.steps.draft = {
        success: true,
        draftId: undefined, // Don't save incomplete draft yet
      };
      result.steps.analysis = {
        success: true,
        keyPoints: signals.keyPoints,
        sentiment: signals.urgencyScore > 0.7 ? "urgent" : "moderate",
        language: "en",
      };

      result.success = true; // Pipeline succeeded, just needs more info
      console.log(`[Orchestrator] Ticket ${ticketId} needs more information`);
      return result;
    }

    // Draft is complete - save to database
    const draft = await prisma.donationDraft.upsert({
      where: { ticketId },
      create: {
        ticketId,
        title: generatedDraft.title,
        story: generatedDraft.story,
        summary: generatedDraft.excerpt,
        goalAmount: generatedDraft.goalAmount,
        currency: "USD",
        beneficiary: generatedDraft.beneficiary,
        location: generatedDraft.location,
        category: generatedDraft.category,
        urgency: generatedDraft.urgency,
        timeline: generatedDraft.timeline,
        tags: generatedDraft.tags,
        editableJson: generatedDraft.editableJson,
      },
      update: {
        title: generatedDraft.title,
        story: generatedDraft.story,
        summary: generatedDraft.excerpt,
        goalAmount: generatedDraft.goalAmount,
        beneficiary: generatedDraft.beneficiary,
        location: generatedDraft.location,
        category: generatedDraft.category,
        urgency: generatedDraft.urgency,
        timeline: generatedDraft.timeline,
        tags: generatedDraft.tags,
        editableJson: generatedDraft.editableJson,
      },
    });

    result.steps.draft = {
      success: true,
      draftId: draft.id,
    };

    // Legacy analysis for backward compatibility
    result.steps.analysis = {
      success: true,
      keyPoints: signals.keyPoints,
      sentiment:
        signals.urgencyScore > 0.7
          ? "urgent"
          : signals.urgencyScore > 0.4
            ? "moderate"
            : "low",
      language: "en",
    };

    // Update status to READY
    await prisma.recordingTicket.update({
      where: { id: ticketId },
      data: { status: "READY" },
    });

    result.success = true;
    result.finalStatus = "READY";

    console.log(`[Orchestrator] Successfully processed ticket ${ticketId}`);
  } catch (error: any) {
    console.error(`[Orchestrator] Error processing ticket ${ticketId}:`, error);

    // Create incident for pipeline failure
    try {
      const { handleFailure } =
        await import("../troubleshooting/pipelineTroubleshooter");
      const { PipelineStage, IncidentSeverity } =
        await import("@prisma/client");

      await handleFailure({
        ticketId,
        stage: PipelineStage.ORCHESTRATION, // Add ORCHESTRATION to enum if needed
        error,
        context: {
          audioFilePath: result.steps.transcription?.audioFilePath,
          currentStage: result.steps.transcription?.success
            ? "draft_generation"
            : "transcription",
          partialResult: result,
        },
        severity: IncidentSeverity.ERROR,
      });
    } catch (incidentError) {
      console.error(
        `[Orchestrator] Failed to create incident for error:`,
        incidentError,
      );
    }

    // Update ticket to ERROR status
    await prisma.recordingTicket.update({
      where: { id: ticketId },
      data: { status: "ERROR" },
    });

    result.error = error.message;
    result.finalStatus = "ERROR";
  }

  return result;
}

/**
 * Step 1: Perform transcription using AssemblyAI only (V1 mode - no OpenAI)
 *
 * V1 uses AssemblyAI as primary transcription provider ($0.0075/min vs OpenAI $0.018/min)
 * No fallback to OpenAI Whisper in V1 stabilization mode
 */
async function performTranscription(
  ticketId: string,
  audioFilePath: string,
): Promise<ProcessTicketResult["steps"]["transcription"]> {
  const startTime = Date.now();

  try {
    // Verify audio file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`[Orchestrator] Starting transcription for ticket ${ticketId}`);
    console.log(`[Orchestrator] Audio file: ${audioFilePath}`);

    // V1: Use transcription provider abstraction (AssemblyAI or stub for stress tests)
    const transcriptionProvider = getTranscriptionProvider();
    console.log(
      `[Orchestrator] Using transcription provider: ${transcriptionProvider.name}`,
    );

    // Create session
    const session = await sessionManager.createSession({
      userId: ticketId,
      source: TranscriptionSource.WEB_RECORDING,
      engine: TranscriptionEngine.ASSEMBLYAI,
      languageHint: "en",
      consentToStoreText: true,
      consentToStoreMetrics: true,
      retentionDays: 365,
    });

    const sessionId = session.id;

    // Link session to ticket
    await prisma.transcriptionSession.update({
      where: { id: sessionId },
      data: { recordingTicketId: ticketId },
    });

    // Transcribe using provider
    const transcriptionResult =
      await transcriptionProvider.transcribe(audioFilePath);
    const transcript = transcriptionResult.transcript;

    console.log(
      `[Orchestrator] ✅ Transcription successful via ${transcriptionResult.source}`,
    );

    // Update session with results
    await sessionManager.updateSession(sessionId, {
      status: "COMPLETED",
      transcriptText: transcript,
      detectedLanguage: "en",
    });

    // Check for quality issues
    if (transcript.length < 10) {
      console.warn("[Orchestrator] Transcript is very short or empty");

      // Import failure handler
      const { handleFailure } =
        await import("../troubleshooting/pipelineTroubleshooter");
      const { PipelineStage, IncidentSeverity } =
        await import("@prisma/client");

      // Create WARN incident
      await handleFailure({
        ticketId,
        stage: PipelineStage.TRANSCRIPTION,
        error: "Transcript is empty or extremely short",
        context: {
          transcriptLength: transcript.length,
          source: transcriptionResult.source,
          audioFilePath,
        },
        severity: IncidentSeverity.WARN,
      });
    }

    // Create segments (split by sentences)
    const sentences = transcript
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    let startMs = 0;
    for (const sentence of sentences) {
      const durationMs = sentence.length * 50; // Rough estimate
      await prisma.transcriptionSegment.create({
        data: {
          sessionId: sessionId,
          segmentIndex: sentences.indexOf(sentence),
          startMs,
          endMs: startMs + durationMs,
          text: sentence.trim(),
          confidence: transcriptionResult.confidence || 0.9,
        },
      });
      startMs += durationMs;
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      sessionId: sessionId,
      engine: transcriptionResult.source,
      duration,
    };
  } catch (error: any) {
    console.error("[Orchestrator] Transcription error:", error);

    // Import failure handler
    const { handleFailure } =
      await import("../troubleshooting/pipelineTroubleshooter");
    const { PipelineStage, IncidentSeverity } = await import("@prisma/client");

    // Create incident
    await handleFailure({
      ticketId,
      stage: PipelineStage.TRANSCRIPTION,
      error,
      context: {
        audioFilePath,
        transcriptionPreference: process.env.TRANSCRIPTION_PREFERENCE,
        evtsVariant: process.env.EVTS_VARIANT,
        usedFallback,
      },
      severity: IncidentSeverity.ERROR,
    });

    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Step 2: Extract analysis from transcript
 */
async function performAnalysis(
  transcript: string,
  transcriptionSessionId?: string,
): Promise<ProcessTicketResult["steps"]["analysis"]> {
  try {
    console.log("[Orchestrator] Performing analysis on transcript");

    // Basic analysis (can be enhanced with OpenAI API later)
    const words = transcript.split(/\s+/).filter((w) => w.length > 0);
    const sentences = transcript
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    // Extract potential key points (simple heuristic: sentences with specific keywords)
    const keywordPatterns = [
      /need|require|necessary|must|should/i,
      /help|assist|support|aid/i,
      /medical|health|treatment|surgery|therapy/i,
      /family|child|parent|spouse/i,
      /job|work|income|financial/i,
      /home|house|rent|eviction/i,
    ];

    const keyPoints: string[] = [];
    for (const sentence of sentences) {
      for (const pattern of keywordPatterns) {
        if (pattern.test(sentence) && !keyPoints.includes(sentence.trim())) {
          keyPoints.push(sentence.trim());
          break;
        }
      }
    }

    // Basic sentiment analysis (simplified)
    const positiveWords = [
      "hope",
      "grateful",
      "thank",
      "happy",
      "better",
      "improve",
    ];
    const negativeWords = [
      "difficult",
      "struggle",
      "hard",
      "challenging",
      "problem",
      "crisis",
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    const lowerTranscript = transcript.toLowerCase();
    positiveWords.forEach((word) => {
      const matches = lowerTranscript.match(new RegExp(word, "g"));
      if (matches) positiveCount += matches.length;
    });
    negativeWords.forEach((word) => {
      const matches = lowerTranscript.match(new RegExp(word, "g"));
      if (matches) negativeCount += matches.length;
    });

    let sentiment = "neutral";
    if (positiveCount > negativeCount + 2) sentiment = "hopeful";
    else if (negativeCount > positiveCount + 2) sentiment = "urgent";

    // Language detection (basic - check for common English words)
    const commonEnglishWords = [
      "the",
      "is",
      "are",
      "and",
      "to",
      "of",
      "in",
      "a",
      "for",
    ];
    let englishWordCount = 0;
    commonEnglishWords.forEach((word) => {
      const matches = lowerTranscript.match(new RegExp(`\\b${word}\\b`, "g"));
      if (matches) englishWordCount += matches.length;
    });
    const language = englishWordCount > 5 ? "en" : "unknown";

    // Store analysis in database if we have a transcription session
    if (transcriptionSessionId) {
      await prisma.speechAnalysisResult.create({
        data: {
          sessionId: transcriptionSessionId,
          detectedLanguage: language,
          confidence: englishWordCount > 10 ? 0.9 : 0.6,
          processingTime: 0, // Instant for this simple analysis
        },
      });
    }

    return {
      success: true,
      keyPoints: keyPoints.slice(0, 5), // Top 5 key points
      sentiment,
      language,
    };
  } catch (error: any) {
    console.error("[Orchestrator] Analysis error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Step 3: Generate DonationDraft from analysis (with Knowledge Vault guidance)
 */
async function generateDraft(
  ticketId: string,
  transcript: string,
  analysis: ProcessTicketResult["steps"]["analysis"],
): Promise<ProcessTicketResult["steps"]["draft"]> {
  try {
    console.log(
      "[Orchestrator] Generating donation draft with Knowledge Vault guidance",
    );

    // Import knowledge services (dynamic to avoid circular deps)
    const { getDonationDraftTemplate, logKnowledgeUsage } =
      await import("../knowledge/query");
    const { handleFailure } =
      await import("../troubleshooting/pipelineTroubleshooter");
    const { PipelineStage, IncidentSeverity } = await import("@prisma/client");

    // Get ticket info
    const ticket = await prisma.recordingTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Get donation draft template from Knowledge Vault
    const template = await getDonationDraftTemplate();
    const knowledgeUsed: string[] = [];

    if (template) {
      console.log(
        `[Orchestrator] Using Knowledge Vault template: ${template.id}`,
      );
      knowledgeUsed.push(template.id);
    }

    // Apply template guidance or use defaults
    let minStoryLength = 100;
    let requiredFields = ["title", "story"];
    let prohibitedContent: string[] = [];

    if (template?.metadata?.validation) {
      minStoryLength =
        template.metadata.validation.minStoryLength || minStoryLength;
      requiredFields =
        template.metadata.validation.requiredFields || requiredFields;
      prohibitedContent = template.metadata.validation.prohibitedContent || [];
    }

    // Generate title from first sentence or key points
    let title = "Help Support This Cause";
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
      const firstPoint = analysis.keyPoints[0];
      title =
        firstPoint.length > 60
          ? firstPoint.substring(0, 57) + "..."
          : firstPoint;
    } else {
      const firstSentence = transcript.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length > 10) {
        title =
          firstSentence.length > 60
            ? firstSentence.substring(0, 57) + "..."
            : firstSentence;
      }
    }

    // Generate story - clean up transcript for presentation
    let story = transcript.trim();
    if (story.length > 5000) {
      story = story.substring(0, 4997) + "...";
    }

    // Validate draft quality
    const qualityIssues: string[] = [];

    if (title.length < 10) {
      qualityIssues.push("title too short");
    }

    if (story.length < minStoryLength) {
      qualityIssues.push(
        `story under minimum length (${story.length} < ${minStoryLength})`,
      );
    }

    // Check for prohibited content
    const storyLower = story.toLowerCase();
    for (const prohibited of prohibitedContent) {
      if (storyLower.includes(prohibited.toLowerCase())) {
        qualityIssues.push(`contains prohibited content: ${prohibited}`);
      }
    }

    // Create editable JSON with breakdown and knowledge tracking
    const editableJson = {
      breakdown: analysis.keyPoints || [],
      sentiment: analysis.sentiment,
      suggestedCategories: ["medical", "family", "emergency"],
      templateUsed: template?.id || null,
      knowledgeUsed,
      qualityScore: qualityIssues.length === 0 ? 1.0 : 0.5,
      qualityIssues: qualityIssues.length > 0 ? qualityIssues : undefined,
    };

    // Create or update draft
    const existingDraft = await prisma.donationDraft.findUnique({
      where: { ticketId },
    });

    let draft;
    if (existingDraft) {
      draft = await prisma.donationDraft.update({
        where: { id: existingDraft.id },
        data: {
          title,
          story,
          editableJson,
        },
      });
    } else {
      draft = await prisma.donationDraft.create({
        data: {
          ticketId,
          title,
          story,
          currency: "USD",
          editableJson,
        },
      });
    }

    // Log knowledge usage
    if (knowledgeUsed.length > 0) {
      logKnowledgeUsage({
        ticketId,
        stage: "DRAFT",
        chunkIds: knowledgeUsed,
        outcome: qualityIssues.length === 0 ? "SUCCESS" : "PARTIAL",
      });
    }

    // If quality issues detected, create incident (WARN severity)
    if (qualityIssues.length > 0) {
      console.warn(
        `[Orchestrator] Draft quality issues: ${qualityIssues.join(", ")}`,
      );

      await handleFailure({
        ticketId,
        stage: PipelineStage.DRAFT,
        error: `Draft quality below threshold: ${qualityIssues.join(", ")}`,
        context: {
          draftId: draft.id,
          qualityIssues,
          storyLength: story.length,
          titleLength: title.length,
          templateUsed: template?.id,
        },
        severity: IncidentSeverity.WARN,
      });
    }

    return {
      success: true,
      draftId: draft.id,
      qualityIssues: qualityIssues.length > 0 ? qualityIssues : undefined,
    };
  } catch (error: any) {
    console.error("[Orchestrator] Draft generation error:", error);

    // Import failure handler
    const { handleFailure } =
      await import("../troubleshooting/pipelineTroubleshooter");
    const { PipelineStage, IncidentSeverity } = await import("@prisma/client");

    // Create incident
    await handleFailure({
      ticketId,
      stage: PipelineStage.DRAFT,
      error,
      context: {
        transcriptLength: transcript.length,
        analysisPresent: !!analysis,
      },
      severity: IncidentSeverity.ERROR,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get processing status for a ticket
 */
export async function getTicketStatus(ticketId: string) {
  const ticket = await prisma.recordingTicket.findUnique({
    where: { id: ticketId },
    include: {
      transcriptionSessions: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
      donationDraft: true,
    },
  });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return {
    id: ticket.id,
    status: ticket.status,
    displayName: ticket.displayName,
    hasTranscription: ticket.transcriptionSessions.length > 0,
    hasDraft: !!ticket.donationDraft,
    updatedAt: ticket.updatedAt,
  };
}

export default {
  processTicket,
  getTicketStatus,
};
