/**
 * AssemblyAI Transcription Provider
 *
 * Wraps AssemblyAI client for consistent interface
 */

import { AssemblyAI } from "assemblyai";
import {
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionOptions,
} from "./types";
import { getValidEnvKey } from "../../utils/keys";
import fs from "fs";

export class AssemblyAIProvider implements TranscriptionProvider {
  readonly name = "AssemblyAI";
  readonly type = "assemblyai" as const;

  private client: AssemblyAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    const key = getValidEnvKey("ASSEMBLYAI_API_KEY");
    this.apiKey = key ?? null;
    if (this.apiKey) {
      this.client = new AssemblyAI({ apiKey: this.apiKey });
    }
  }

  isAvailable(): boolean {
    return !!this.client;
  }

  async transcribe(
    audioFilePath: string,
    options?: TranscriptionOptions,
  ): Promise<TranscriptionResult> {
    if (!this.client) {
      throw new Error("AssemblyAI API key not configured");
    }

    // Validate file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    const stats = fs.statSync(audioFilePath);
    if (stats.size === 0) {
      throw new Error("Audio file is empty");
    }

    console.log(`[AssemblyAI] Transcribing file: ${audioFilePath}`);
    const startTime = Date.now();

    try {
      // Transcribe using AssemblyAI
      const params: any = {
        audio: audioFilePath,
        punctuate: options?.punctuate !== false,
        format_text: true,
      };

      if (options?.language) {
        params.language_code = options.language;
      }

      if (options?.diarization) {
        params.speaker_labels = true;
      }

      const transcript = await this.client.transcripts.transcribe(params);

      if (transcript.status === "error") {
        throw new Error(`AssemblyAI transcription failed: ${transcript.error}`);
      }

      const duration = Date.now() - startTime;
      const wordCount = transcript.text?.split(/\s+/).length || 0;

      console.log(`[AssemblyAI] Transcription completed in ${duration}ms`);
      console.log(`[AssemblyAI] Word count: ${wordCount}`);
      console.log(`[AssemblyAI] Confidence: ${transcript.confidence || 0}`);

      return {
        transcript: transcript.text || "",
        confidence: transcript.confidence || 0,
        source: "assemblyai",
        warnings: [],
        detectedLanguage: transcript.language_code,
        wordCount,
        duration,
      };
    } catch (error) {
      console.error("[AssemblyAI] Transcription error:", error);
      throw error;
    }
  }
}
