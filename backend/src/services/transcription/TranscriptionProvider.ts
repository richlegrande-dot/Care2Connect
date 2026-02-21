/**
 * Transcription Provider Interface
 * Supports multiple transcription engines without API keys
 */

export enum TranscriptionMode {
  LEGACY = "legacy", // Existing OpenAI Whisper API (requires key)
  NVT = "nvt", // Native Voice Transcription (Web Speech API)
  EVTS = "evts", // Extended Voice Transcription Service (offline)
}

export enum EVTSEngine {
  WHISPER_CPP = "whispercpp",
  VOSK = "vosk",
}

export interface TranscriptionConfig {
  mode: TranscriptionMode;
  evtsEngine?: EVTSEngine;
  evtsModelPath?: string;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp?: number;
  alternatives?: Array<{
    text: string;
    confidence: number;
  }>;
}

export interface TranscriptionProvider {
  initialize(config: TranscriptionConfig): Promise<void>;
  transcribe(audioData: Buffer | Blob): Promise<TranscriptionResult>;
  startStreaming?(
    onPartial: (result: TranscriptionResult) => void,
  ): Promise<void>;
  stopStreaming?(): Promise<void>;
  isAvailable(): Promise<boolean>;
  getCapabilities(): TranscriptionCapabilities;
}

export interface TranscriptionCapabilities {
  supportsStreaming: boolean;
  supportsInterimResults: boolean;
  requiresNetwork: boolean;
  requiresAPIKey: boolean;
  supportedLanguages: string[];
}

export class TranscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = false,
  ) {
    super(message);
    this.name = "TranscriptionError";
  }
}
