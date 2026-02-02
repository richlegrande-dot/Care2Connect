/**
 * Speech Intelligence - Integrated Transcription Service
 * Wraps existing transcription with DB loop functionality
 */

import { SessionManager } from './sessionManager';
import { RuntimeTuning } from './runtimeTuning';
import { TranscriptionService, TranscriptionResult } from '../transcriptionService';
import { TranscriptionSource, TranscriptionEngine, TranscriptionStatus, TranscriptionStage } from '@prisma/client';

export interface TranscriptionOptions {
  audioFilePath?: string;
  userId?: string;
  anonymousId?: string;
  source: TranscriptionSource;
  languageHint?: string;
  durationMs?: number;
  sampleRate?: number;
  channelCount?: number;
  consentToStoreText?: boolean;
  consentToStoreMetrics?: boolean;
}

export class IntelligentTranscriptionService {
  private sessionManager: SessionManager;
  private runtimeTuning: RuntimeTuning;
  private baseTranscriptionService: TranscriptionService;

  constructor() {
    this.sessionManager = new SessionManager();
    this.runtimeTuning = new RuntimeTuning();
    this.baseTranscriptionService = new TranscriptionService();
  }

  /**
   * Transcribe audio with full intelligence loop
   */
  async transcribe(options: TranscriptionOptions): Promise<{
    sessionId: string;
    result: TranscriptionResult;
    recommendation: any;
  }> {
    let sessionId: string | undefined;
    
    try {
      // Step 1: Get runtime tuning recommendation
      const recommendation = await this.runtimeTuning.getRecommendation({
        language: options.languageHint,
        route: options.source,
        defaultEngine: TranscriptionEngine.OPENAI
      });

      // Step 2: Create session
      const session = await this.sessionManager.createSession({
        userId: options.userId,
        anonymousId: options.anonymousId,
        source: options.source,
        engine: recommendation.engine,
        engineVersion: '1.0',
        languageHint: options.languageHint,
        durationMs: options.durationMs,
        sampleRate: options.sampleRate,
        channelCount: options.channelCount,
        consentToStoreText: options.consentToStoreText,
        consentToStoreMetrics: options.consentToStoreMetrics
      });

      sessionId = session.id;

      // Step 3: Perform transcription
      let result: TranscriptionResult;
      
      try {
        if (!options.audioFilePath) {
          throw new Error('Audio file path required');
        }

        result = await this.baseTranscriptionService.transcribeAudio(options.audioFilePath);

        // Store segments if available
        if ((result as any).segments) {
          const segments = (result as any).segments.map((seg: any, idx: number) => ({
            index: idx,
            startMs: Math.round(seg.start * 1000),
            endMs: Math.round(seg.end * 1000),
            text: seg.text,
            confidence: seg.confidence,
            tokens: seg.tokens
          }));

          await this.sessionManager.addSegments(sessionId, segments);
        }

      } catch (transcriptionError) {
        // Record error
        await this.sessionManager.recordError({
          sessionId,
          engine: recommendation.engine,
          stage: TranscriptionStage.TRANSCRIBE,
          errorCode: 'TRANSCRIPTION_FAILED',
          errorMessage: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error',
          isTransient: false
        });

        // Update session status
        await this.sessionManager.updateSession(sessionId, {
          status: TranscriptionStatus.FAILED
        });

        throw transcriptionError;
      }

      // Step 4: Analyze transcript (if we have one)
      if (result.transcript) {
        try {
          const analysis = await this.analyzeTranscript(result.transcript);
          
          await this.sessionManager.addAnalysisResult(sessionId, {
            analyzerVersion: '1.0',
            resultJson: analysis,
            qualityScore: result.confidence,
            warnings: result.warnings
          });
        } catch (analysisError) {
          // Don't fail the whole transcription if analysis fails
          console.warn('Analysis failed:', analysisError);
          await this.sessionManager.recordError({
            sessionId,
            engine: recommendation.engine,
            stage: TranscriptionStage.ANALYZE,
            errorCode: 'ANALYSIS_FAILED',
            errorMessage: analysisError instanceof Error ? analysisError.message : 'Unknown error',
            isTransient: true
          });
        }
      }

      // Step 5: Update session with results
      await this.sessionManager.updateSession(sessionId, {
        status: TranscriptionStatus.SUCCESS,
        transcriptText: result.transcript,
        detectedLanguage: options.languageHint || 'en'
      });

      return {
        sessionId,
        result,
        recommendation
      };

    } catch (error) {
      // Record top-level error
      if (sessionId) {
        await this.sessionManager.recordError({
          sessionId,
          stage: TranscriptionStage.VALIDATION,
          errorCode: 'GENERAL_ERROR',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          isTransient: false
        });
      }

      throw error;
    }
  }

  /**
   * Basic transcript analysis
   */
  private async analyzeTranscript(transcript: string): Promise<any> {
    // Simple analysis - can be extended
    const wordCount = transcript.split(/\s+/).length;
    const sentenceCount = transcript.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Extract simple keywords (most common meaningful words)
    const words = transcript.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4) // Filter short words
      .filter(w => !['about', 'there', 'their', 'would', 'could', 'should'].includes(w));
    
    const wordFreq: Record<string, number> = {};
    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }

    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return {
      wordCount,
      sentenceCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      keywords: topKeywords,
      hasQuestions: transcript.includes('?'),
      sentiment: 'neutral' // Placeholder
    };
  }
}
