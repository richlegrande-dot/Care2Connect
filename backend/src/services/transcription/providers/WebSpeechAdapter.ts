/**
 * Web Speech API Adapter (NVT)
 * Browser-native speech recognition - NO API KEYS REQUIRED
 * Note: This is a client-side only interface; backend provides config/fallback
 */

import {
  TranscriptionProvider,
  TranscriptionConfig,
  TranscriptionResult,
  TranscriptionCapabilities,
  TranscriptionError
} from '../TranscriptionProvider';

export class WebSpeechAdapter implements TranscriptionProvider {
  private config?: TranscriptionConfig;

  async initialize(config: TranscriptionConfig): Promise<void> {
    this.config = config;
    // Web Speech API initialization happens client-side
    // This is a stub for server-side compatibility
  }

  async transcribe(audioData: Buffer | Blob): Promise<TranscriptionResult> {
    throw new TranscriptionError(
      'Web Speech API transcription must be initiated from the client browser',
      'WEB_SPEECH_CLIENT_ONLY',
      true
    );
  }

  async isAvailable(): Promise<boolean> {
    // Server always returns false; client must check window.SpeechRecognition
    return false;
  }

  getCapabilities(): TranscriptionCapabilities {
    return {
      supportsStreaming: true,
      supportsInterimResults: true,
      requiresNetwork: true, // Some browsers require network for speech recognition
      requiresAPIKey: false,
      supportedLanguages: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ja-JP']
    };
  }

  /**
   * Client-side implementation note:
   * Use this pattern in frontend:
   * 
   * const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
   * if (!SpeechRecognition) {
   *   // Fall back to manual transcript
   * }
   * const recognition = new SpeechRecognition();
   * recognition.continuous = true;
   * recognition.interimResults = true;
   * recognition.lang = 'en-US';
   * 
   * recognition.onresult = (event) => {
   *   const result = event.results[event.results.length - 1];
   *   const transcript = result[0].transcript;
   *   const confidence = result[0].confidence;
   *   const isFinal = result.isFinal;
   *   // Send to parent component
   * };
   * 
   * recognition.start();
   */
}
