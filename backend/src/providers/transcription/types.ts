/**
 * Transcription Provider - Type Definitions
 */

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  source: 'assemblyai' | 'stub' | 'manual';
  warnings: string[];
  detectedLanguage?: string;
  wordCount?: number;
  duration?: number;
}

export interface TranscriptionProvider {
  readonly name: string;
  readonly type: 'assemblyai' | 'stub';
  
  /**
   * Transcribe audio file to text
   */
  transcribe(audioFilePath: string, options?: TranscriptionOptions): Promise<TranscriptionResult>;
  
  /**
   * Check if provider is available
   */
  isAvailable(): boolean;
}

export interface TranscriptionOptions {
  language?: string;
  punctuate?: boolean;
  diarization?: boolean;
}

export interface TranscriptionProviderConfig {
  provider: 'assemblyai' | 'stub';
  enableStressTestMode: boolean;
  stressTestFixturePath?: string;
}

export function getTranscriptionProviderConfig(): TranscriptionProviderConfig {
  return {
    provider: (process.env.TRANSCRIPTION_PROVIDER || 'assemblyai') as any,
    enableStressTestMode: process.env.ENABLE_STRESS_TEST_MODE === 'true',
    stressTestFixturePath: process.env.STRESS_TEST_TRANSCRIPT_FIXTURE,
  };
}
