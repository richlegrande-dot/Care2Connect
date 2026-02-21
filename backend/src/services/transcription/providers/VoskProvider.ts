/**
 * Vosk Provider (EVTS Alternative)
 * Lightweight offline speech-to-text
 * NO API KEYS REQUIRED - runs locally with downloaded models
 */

import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionCapabilities,
  TranscriptionError,
} from "../TranscriptionProvider";
import * as fs from "fs";
import * as path from "path";

// @ts-ignore - vosk may not have TypeScript types
let vosk: any;

try {
  vosk = require("vosk");
} catch {
  // Vosk not installed
}

export class VoskProvider implements TranscriptionProvider {
  private config?: TranscriptionConfig;
  private model?: any;
  private recognizer?: any;
  private modelPath?: string;

  async initialize(config: TranscriptionConfig): Promise<void> {
    this.config = config;

    if (!vosk) {
      throw new TranscriptionError(
        "Vosk library not installed. Run: npm install vosk",
        "VOSK_NOT_INSTALLED",
        false,
      );
    }

    // Determine model path
    this.modelPath =
      config.evtsModelPath ||
      path.join(process.cwd(), "models", "vosk", "vosk-model-small-en-us-0.15");

    if (!fs.existsSync(this.modelPath)) {
      throw new TranscriptionError(
        `Vosk model not found at ${this.modelPath}. Run: npm run install:vosk-models`,
        "VOSK_MODEL_NOT_FOUND",
        false,
      );
    }

    try {
      this.model = new vosk.Model(this.modelPath);
    } catch (error: any) {
      throw new TranscriptionError(
        `Failed to load Vosk model: ${error.message}`,
        "VOSK_MODEL_LOAD_FAILED",
        false,
      );
    }
  }

  async transcribe(audioData: Buffer | Blob): Promise<TranscriptionResult> {
    if (!this.model) {
      throw new TranscriptionError(
        "VoskProvider not initialized",
        "NOT_INITIALIZED",
        false,
      );
    }

    // Convert Blob to Buffer if needed
    let buffer: Buffer;
    if (audioData instanceof Blob) {
      const arrayBuffer = await audioData.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = audioData;
    }

    // Vosk requires 16kHz mono PCM audio
    // For demo, assume audio is already in correct format
    // Production would need audio conversion (ffmpeg, sox, etc.)

    try {
      const recognizer = new vosk.Recognizer({
        model: this.model,
        sampleRate: 16000,
      });

      recognizer.acceptWaveform(buffer);
      const resultJson = recognizer.finalResult();
      recognizer.free();

      const result = JSON.parse(resultJson);

      return {
        text: result.text || "",
        confidence: result.confidence || 0.7,
        isFinal: true,
        timestamp: Date.now(),
        alternatives: result.alternatives || [],
      };
    } catch (error: any) {
      throw new TranscriptionError(
        `Vosk transcription failed: ${error.message}`,
        "TRANSCRIPTION_FAILED",
        true,
      );
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!vosk) return false;
      await this.initialize(this.config || { mode: "evts" as any });
      return true;
    } catch {
      return false;
    }
  }

  getCapabilities(): TranscriptionCapabilities {
    return {
      supportsStreaming: true, // Vosk supports streaming
      supportsInterimResults: true,
      requiresNetwork: false,
      requiresAPIKey: false,
      supportedLanguages: ["en", "es", "fr", "de", "ru", "zh", "ja"],
    };
  }

  async startStreaming(
    onPartial: (result: TranscriptionResult) => void,
  ): Promise<void> {
    if (!this.model) {
      throw new TranscriptionError(
        "VoskProvider not initialized",
        "NOT_INITIALIZED",
        false,
      );
    }

    this.recognizer = new vosk.Recognizer({
      model: this.model,
      sampleRate: 16000,
    });

    // Streaming implementation would connect to audio input stream
    // For demo, this is a placeholder
  }

  async stopStreaming(): Promise<void> {
    if (this.recognizer) {
      const finalJson = this.recognizer.finalResult();
      this.recognizer.free();
      this.recognizer = undefined;
    }
  }
}
