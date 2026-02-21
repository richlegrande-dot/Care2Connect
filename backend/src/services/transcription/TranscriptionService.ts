/**
 * Transcription Service Factory
 * Routes to appropriate provider based on configuration
 */

import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionMode,
  EVTSEngine,
  TranscriptionError,
} from "./TranscriptionProvider";
import { WebSpeechAdapter } from "./providers/WebSpeechAdapter";
import { WhisperCppProvider } from "./providers/WhisperCppProvider";
import { VoskProvider } from "./providers/VoskProvider";

export class TranscriptionService {
  private provider?: TranscriptionProvider;
  private config: TranscriptionConfig;

  constructor() {
    // Load from environment
    this.config = this.loadConfig();
  }

  private loadConfig(): TranscriptionConfig {
    const mode = (process.env.TRANSCRIPTION_MODE ||
      "legacy") as TranscriptionMode;
    const evtsEngine = (process.env.EVTS_ENGINE || "whispercpp") as EVTSEngine;
    const evtsModelPath = process.env.EVTS_MODEL_PATH;

    return {
      mode,
      evtsEngine,
      evtsModelPath,
      language: process.env.TRANSCRIPTION_LANGUAGE || "en-US",
      continuous: true,
      interimResults: true,
    };
  }

  async initialize(): Promise<void> {
    switch (this.config.mode) {
      case TranscriptionMode.NVT:
        this.provider = new WebSpeechAdapter();
        break;

      case TranscriptionMode.EVTS:
        if (this.config.evtsEngine === EVTSEngine.WHISPER_CPP) {
          this.provider = new WhisperCppProvider();
        } else if (this.config.evtsEngine === EVTSEngine.VOSK) {
          this.provider = new VoskProvider();
        } else {
          throw new TranscriptionError(
            `Unknown EVTS engine: ${this.config.evtsEngine}`,
            "INVALID_CONFIG",
            false,
          );
        }
        break;

      case TranscriptionMode.LEGACY:
        // Legacy OpenAI Whisper - not implemented here
        throw new TranscriptionError(
          "Legacy mode requires OpenAI API key. Use NVT or EVTS for keyless transcription.",
          "LEGACY_MODE_NOT_SUPPORTED",
          false,
        );

      default:
        throw new TranscriptionError(
          `Unknown transcription mode: ${this.config.mode}`,
          "INVALID_CONFIG",
          false,
        );
    }

    await this.provider.initialize(this.config);
  }

  getProvider(): TranscriptionProvider {
    if (!this.provider) {
      throw new TranscriptionError(
        "TranscriptionService not initialized. Call initialize() first.",
        "NOT_INITIALIZED",
        false,
      );
    }
    return this.provider;
  }

  getConfig(): TranscriptionConfig {
    return { ...this.config };
  }

  async getStatus() {
    const provider = this.provider;
    if (!provider) {
      return {
        initialized: false,
        mode: this.config.mode,
        available: false,
      };
    }

    const available = await provider.isAvailable();
    const capabilities = provider.getCapabilities();

    return {
      initialized: true,
      mode: this.config.mode,
      engine: this.config.evtsEngine,
      available,
      capabilities,
    };
  }
}

// Singleton instance
export const transcriptionService = new TranscriptionService();
