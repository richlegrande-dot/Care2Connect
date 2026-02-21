/**
 * EVTS-First Transcription Service
 *
 * Implements transcription preference strategy:
 * 1. Try EVTS (local) first - WHISPER variant preferred
 * 2. Fallback to OpenAI if EVTS unavailable/fails
 *
 * Environment Variables:
 * - TRANSCRIPTION_PREFERENCE: "EVTS_FIRST" | "OPENAI_ONLY"
 * - EVTS_VARIANT: "WHISPER" | "VOSK"
 * - OPENAI_API_KEY: Fallback key
 */

import { SessionManager } from "../speechIntelligence/sessionManager";
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import { prisma } from "../lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type TranscriptionEngine =
  | "EVTS_WHISPER"
  | "EVTS_VOSK"
  | "OPENAI_WHISPER"
  | "BROWSER_ONLY";
export type TranscriptionPreference =
  | "EVTS_FIRST"
  | "OPENAI_ONLY"
  | "BROWSER_ONLY";

interface TranscriptionResult {
  success: boolean;
  transcript: string;
  engine: TranscriptionEngine;
  duration: number;
  error?: string;
}

interface EVTSConfig {
  variant: "WHISPER" | "VOSK";
  available: boolean;
  reason?: string;
}

/**
 * Check if EVTS is available and configured
 */
export function checkEVTSAvailability(): EVTSConfig {
  const variant = (process.env.EVTS_VARIANT || "WHISPER").toUpperCase() as
    | "WHISPER"
    | "VOSK";

  // Check if EVTS model exists
  const evtsModelPath =
    process.env.EVTS_MODEL_PATH ||
    path.join(
      process.cwd(),
      "..",
      "models",
      variant === "WHISPER" ? "ggml-base.en.bin" : "vosk-model-small-en-us",
    );

  if (!fs.existsSync(evtsModelPath)) {
    return {
      variant,
      available: false,
      reason: `EVTS ${variant} model not found at ${evtsModelPath}`,
    };
  }

  return {
    variant,
    available: true,
  };
}

/**
 * Transcribe using EVTS (local processing)
 */
async function transcribeWithEVTS(
  audioFilePath: string,
  variant: "WHISPER" | "VOSK",
): Promise<TranscriptionResult> {
  const startTime = Date.now();

  try {
    // Check file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // For now, this is a placeholder that will integrate with actual EVTS
    // In production, this would call the EVTS binary/library
    console.log(`[EVTS] Attempting transcription with ${variant}...`);
    console.log(`[EVTS] Audio file: ${audioFilePath}`);

    // TODO: Replace with actual EVTS integration
    // For now, we'll simulate EVTS being unavailable to trigger fallback
    throw new Error(`EVTS ${variant} integration pending`);

    // When EVTS is integrated, code would look like:
    /*
    const evtsResult = await callEVTSBinary(audioFilePath, variant);
    
    return {
      success: true,
      transcript: evtsResult.text,
      engine: variant === 'WHISPER' ? 'EVTS_WHISPER' : 'EVTS_VOSK',
      duration: Date.now() - startTime,
    };
    */
  } catch (error: any) {
    console.error(`[EVTS] ${variant} transcription failed:`, error.message);

    return {
      success: false,
      transcript: "",
      engine: variant === "WHISPER" ? "EVTS_WHISPER" : "EVTS_VOSK",
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

/**
 * Transcribe using OpenAI Whisper API (cloud fallback)
 */
async function transcribeWithOpenAI(
  audioFilePath: string,
): Promise<TranscriptionResult> {
  const startTime = Date.now();

  try {
    console.log("[OpenAI] Starting Whisper API transcription...");

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    const audioFile = fs.createReadStream(audioFilePath);

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "json",
    });

    console.log("[OpenAI] ✅ Transcription successful");

    return {
      success: true,
      transcript: response.text,
      engine: "OPENAI_WHISPER",
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error("[OpenAI] Transcription failed:", error.message);

    return {
      success: false,
      transcript: "",
      engine: "OPENAI_WHISPER",
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

/**
 * Main transcription function with EVTS-first strategy
 */
export async function transcribeAudioWithStrategy(
  audioFilePath: string,
  sessionId?: string,
): Promise<TranscriptionResult> {
  const preference = (process.env.TRANSCRIPTION_PREFERENCE ||
    "EVTS_FIRST") as TranscriptionPreference;

  console.log(`\n🎤 Starting transcription with strategy: ${preference}`);

  // Browser-only mode (no server-side transcription)
  if (preference === "BROWSER_ONLY") {
    console.log(
      "[Transcription] Browser-only mode - server transcription skipped",
    );
    return {
      success: false,
      transcript: "",
      engine: "BROWSER_ONLY",
      duration: 0,
      error: "Server transcription disabled (browser-only mode)",
    };
  }

  // OpenAI-only mode (skip EVTS)
  if (preference === "OPENAI_ONLY") {
    console.log("[Transcription] OpenAI-only mode - skipping EVTS");
    return await transcribeWithOpenAI(audioFilePath);
  }

  // EVTS-first mode
  console.log("[Transcription] EVTS-first mode");

  const evtsConfig = checkEVTSAvailability();

  if (evtsConfig.available) {
    console.log(
      `[Transcription] ✅ EVTS ${evtsConfig.variant} available, trying first...`,
    );

    const evtsResult = await transcribeWithEVTS(
      audioFilePath,
      evtsConfig.variant,
    );

    if (evtsResult.success) {
      console.log(`[Transcription] ✅ EVTS ${evtsConfig.variant} succeeded`);

      // Store engine used
      if (sessionId) {
        await prisma.transcriptionSession.update({
          where: { id: sessionId },
          data: { engine: evtsResult.engine },
        });
      }

      return evtsResult;
    }

    console.log(
      `[Transcription] ⚠️ EVTS ${evtsConfig.variant} failed, falling back to OpenAI...`,
    );
  } else {
    console.log(`[Transcription] ⚠️ EVTS unavailable: ${evtsConfig.reason}`);
    console.log("[Transcription] Falling back to OpenAI...");
  }

  // Fallback to OpenAI
  const openaiResult = await transcribeWithOpenAI(audioFilePath);

  if (openaiResult.success) {
    console.log("[Transcription] ✅ OpenAI fallback succeeded");

    // Store engine used
    if (sessionId) {
      await prisma.transcriptionSession.update({
        where: { id: sessionId },
        data: { engine: openaiResult.engine },
      });
    }
  } else {
    console.error("[Transcription] ❌ All transcription methods failed");
  }

  return openaiResult;
}

/**
 * Integration with existing SessionManager
 * Updates existing transcription flow to use EVTS-first strategy
 */
export async function transcribeWithSessionManager(
  audioFilePath: string,
  recordingTicketId?: string,
): Promise<{
  sessionId: string;
  transcript: string;
  engine: TranscriptionEngine;
}> {
  // Create session
  const sessionManager = new SessionManager();
  const session = await sessionManager.createSession({
    recordingTicketId,
    audioFile: {
      path: audioFilePath,
      filename: path.basename(audioFilePath),
      size: fs.statSync(audioFilePath).size,
      mimeType: "audio/wav",
    },
  });

  // Transcribe with EVTS-first strategy
  const result = await transcribeAudioWithStrategy(audioFilePath, session.id);

  if (!result.success) {
    await sessionManager.updateSession(session.id, {
      status: "ERROR",
      errorMessage: result.error,
    });

    throw new Error(`Transcription failed: ${result.error}`);
  }

  // Update session with results
  await sessionManager.updateSession(session.id, {
    status: "COMPLETED",
    transcript: result.transcript,
    engine: result.engine,
    processingTimeMs: result.duration,
  });

  console.log(
    `[Transcription] ✅ Session ${session.id} completed with ${result.engine}`,
  );

  return {
    sessionId: session.id,
    transcript: result.transcript,
    engine: result.engine,
  };
}

/**
 * Get transcription statistics (which engine was used how often)
 */
export async function getTranscriptionStats(): Promise<{
  total: number;
  byEngine: Record<TranscriptionEngine, number>;
  evtsSuccessRate: number;
}> {
  const sessions = await prisma.transcriptionSession.findMany({
    where: {
      status: "COMPLETED",
      engine: { not: null },
    },
    select: { engine: true },
  });

  const byEngine: Record<string, number> = {
    EVTS_WHISPER: 0,
    EVTS_VOSK: 0,
    OPENAI_WHISPER: 0,
    BROWSER_ONLY: 0,
  };

  sessions.forEach((session) => {
    if (session.engine) {
      byEngine[session.engine] = (byEngine[session.engine] || 0) + 1;
    }
  });

  const evtsCount = byEngine.EVTS_WHISPER + byEngine.EVTS_VOSK;
  const total = sessions.length;
  const evtsSuccessRate = total > 0 ? (evtsCount / total) * 100 : 0;

  return {
    total,
    byEngine: byEngine as Record<TranscriptionEngine, number>,
    evtsSuccessRate,
  };
}

// Export for testing
export const __testing = {
  transcribeWithEVTS,
  transcribeWithOpenAI,
  checkEVTSAvailability,
};
