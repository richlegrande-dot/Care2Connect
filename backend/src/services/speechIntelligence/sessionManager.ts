/**
 * Speech Intelligence - Session Manager
 * Handles transcription session lifecycle with consent management
 */

import { prisma } from '../../lib/prisma';
import { TranscriptionSource, TranscriptionEngine, TranscriptionStatus, TranscriptionStage } from '@prisma/client';

export interface SessionCreateOptions {
  userId?: string;
  anonymousId?: string;
  source: TranscriptionSource;
  engine: TranscriptionEngine;
  engineVersion?: string;
  languageHint?: string;
  durationMs?: number;
  sampleRate?: number;
  channelCount?: number;
  consentToStoreText?: boolean;
  consentToStoreMetrics?: boolean;
  retentionDays?: number;
}

export interface SessionUpdateOptions {
  status?: TranscriptionStatus;
  transcriptText?: string;
  detectedLanguage?: string;
  redactionApplied?: boolean;
}

export class SessionManager {
  /**
   * Create a new transcription session
   */
  async createSession(options: SessionCreateOptions) {
    const retentionUntil = options.retentionDays 
      ? new Date(Date.now() + options.retentionDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    const session = await prisma.transcriptionSession.create({
      data: {
        userId: options.userId,
        anonymousId: options.anonymousId,
        source: options.source,
        engine: options.engine,
        engineVersion: options.engineVersion,
        languageHint: options.languageHint,
        durationMs: options.durationMs,
        sampleRate: options.sampleRate,
        channelCount: options.channelCount,
        status: TranscriptionStatus.PROCESSING,
        consentToStoreText: options.consentToStoreText ?? false,
        consentToStoreMetrics: options.consentToStoreMetrics ?? true,
        retentionUntil
      }
    });

    return session;
  }

  /**
   * Update session with results
   */
  async updateSession(sessionId: string, options: SessionUpdateOptions) {
    const updateData: any = {};

    if (options.status) {
      updateData.status = options.status;
    }

    if (options.detectedLanguage) {
      updateData.detectedLanguage = options.detectedLanguage;
    }

    if (options.redactionApplied !== undefined) {
      updateData.redactionApplied = options.redactionApplied;
    }

    // Only store transcript if consent was given
    if (options.transcriptText) {
      const session = await prisma.transcriptionSession.findUnique({
        where: { id: sessionId },
        select: { consentToStoreText: true }
      });

      if (session?.consentToStoreText) {
        // Apply redaction before storing
        const redactedText = this.redactSensitiveInfo(options.transcriptText);
        updateData.transcriptText = redactedText;
        updateData.transcriptPreview = redactedText.substring(0, 160);
        updateData.redactionApplied = true;
      }
    }

    return await prisma.transcriptionSession.update({
      where: { id: sessionId },
      data: updateData
    });
  }

  /**
   * Add segments to session
   */
  async addSegments(sessionId: string, segments: Array<{
    index: number;
    startMs: number;
    endMs: number;
    text?: string;
    confidence?: number;
    tokens?: number;
  }>) {
    const session = await prisma.transcriptionSession.findUnique({
      where: { id: sessionId },
      select: { consentToStoreText: true }
    });

    const segmentData = segments.map(seg => ({
      sessionId,
      index: seg.index,
      startMs: seg.startMs,
      endMs: seg.endMs,
      // Only store text if consent
      text: session?.consentToStoreText ? seg.text : undefined,
      confidence: seg.confidence,
      tokens: seg.tokens
    }));

    await prisma.transcriptionSegment.createMany({
      data: segmentData
    });
  }

  /**
   * Record error event
   */
  async recordError(options: {
    sessionId?: string;
    engine?: TranscriptionEngine;
    stage: TranscriptionStage;
    errorCode: string;
    errorMessage: string;
    retryCount?: number;
    isTransient?: boolean;
    metaJson?: any;
  }) {
    // Sanitize error message (remove paths, secrets, etc.)
    const sanitizedMessage = this.sanitizeErrorMessage(options.errorMessage);

    await prisma.transcriptionErrorEvent.create({
      data: {
        sessionId: options.sessionId,
        engine: options.engine,
        stage: options.stage,
        errorCode: options.errorCode,
        errorMessageSafe: sanitizedMessage,
        retryCount: options.retryCount ?? 0,
        isTransient: options.isTransient ?? false,
        metaJson: options.metaJson
      }
    });
  }

  /**
   * Add analysis result
   */
  async addAnalysisResult(sessionId: string, options: {
    analyzerVersion: string;
    resultJson: any;
    qualityScore?: number;
    warnings?: string[];
  }) {
    await prisma.speechAnalysisResult.create({
      data: {
        sessionId,
        analyzerVersion: options.analyzerVersion,
        resultJson: options.resultJson,
        qualityScore: options.qualityScore,
        warnings: options.warnings ?? []
      }
    });
  }

  /**
   * Basic redaction for emails and phone numbers
   */
  private redactSensitiveInfo(text: string): string {
    if (!text) return text;

    let redacted = text;
    
    // Redact emails
    redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    
    // Redact phone numbers (various formats)
    redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
    redacted = redacted.replace(/\(\d{3}\)\s*\d{3}[-.]?\d{4}/g, '[PHONE]');
    
    return redacted;
  }

  /**
   * Sanitize error messages
   */
  private sanitizeErrorMessage(message: string): string {
    if (!message) return 'Unknown error';

    let sanitized = message;
    
    // Remove file paths
    sanitized = sanitized.replace(/[A-Za-z]:\\[^\s]+/g, '[PATH]');
    sanitized = sanitized.replace(/\/[^\s]+\/[^\s]+/g, '[PATH]');
    
    // Remove potential API keys or tokens
    sanitized = sanitized.replace(/\b[A-Za-z0-9_-]{20,}\b/g, '[TOKEN]');
    
    // Limit length
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500) + '...';
    }
    
    return sanitized;
  }
}
