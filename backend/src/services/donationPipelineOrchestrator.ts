/**
 * Donation Pipeline Orchestrator with Fallback Integration
 * 
 * Coordinates the full donation pipeline with automatic fallback
 */

import { PrismaClient } from '@prisma/client';
import { extractSignals } from './speechIntelligence/transcriptSignalExtractor';
import { createPipelineFailure, executePipelineWithFallback, isSystemDegraded, extractPartialData } from './pipelineFailureHandler';
import { PipelineResponse, PipelineFailureReasonCode } from '../types/fallback';

const prisma = new PrismaClient();

interface OrchestrateDonationPipelineOptions {
  ticketId: string;
  transcript?: string;
  forceManual?: boolean;
}

/**
 * Main pipeline orchestrator with automatic fallback
 */
export async function orchestrateDonationPipeline(
  options: OrchestrateDonationPipelineOptions
): Promise<PipelineResponse> {
  
  const { ticketId, transcript, forceManual = false } = options;

  console.log(`[Pipeline Orchestrator] Starting for ticket ${ticketId}`);

  try {
    // Step 1: Comprehensive pipeline health check
    const healthCheck = await checkPipelineHealth();
    if (!healthCheck.healthy) {
      console.warn('[Pipeline Orchestrator] Pipeline health check failed:', healthCheck.issues);
      return await createPipelineFailure('SYSTEM_DEGRADED', {
        ticketId,
        context: { 
          partialData: extractPartialData(transcript),
          healthIssues: healthCheck.issues,
          serviceStatus: healthCheck.services
        }
      });
    }

    // Step 2: Force manual if requested
    if (forceManual) {
      return await createPipelineFailure('PARSING_INCOMPLETE', {
        ticketId,
        context: { partialData: extractPartialData(transcript) }
      });
    }

    // Step 3: Validate transcript with detailed error handling
    if (!transcript || transcript.trim().length === 0) {
      console.warn('[Pipeline Orchestrator] No transcript available');
      return await createPipelineFailure('TRANSCRIPTION_FAILED', { ticketId });
    }

    const trimmedTranscript = transcript.trim();

    // Step 4: Check for dry recording
    if (trimmedTranscript === '...' || trimmedTranscript.length < 10) {
      console.warn('[Pipeline Orchestrator] Dry recording detected');
      return await createPipelineFailure('PARSING_INCOMPLETE', {
        ticketId,
        context: { partialData: extractPartialData(transcript) }
      });
    }

    // Step 5: Extract signals with comprehensive error handling
    let signals;
    try {
      signals = await extractSignals({ text: trimmedTranscript });
    } catch (signalError: any) {
      console.error('[Pipeline Orchestrator] Signal extraction failed:', signalError);
      return await createPipelineFailure('PARSING_INCOMPLETE', {
        ticketId,
        error: signalError,
        context: { partialData: extractPartialData(transcript) }
      });
    }

    // Step 6: Validate signal quality
    const hasCriticalFields = signals.nameCandidate && 
                             (signals.contactCandidates.emails.length > 0 || 
                              signals.contactCandidates.phones.length > 0);

    if (!hasCriticalFields) {
      console.warn('[Pipeline Orchestrator] Insufficient critical fields extracted');
      return await createPipelineFailure('PARSING_INCOMPLETE', {
        ticketId,
        context: {
          partialData: extractPartialData(transcript, {
            title: signals.nameCandidate || 'Campaign',
            story: signals.keyPoints?.join('. ') || ''
          })
        }
      });
    }

    // Step 7: Generate draft with validation
    const draft = {
      ticketId,
      title: `Help ${signals.nameCandidate}`,
      story: signals.keyPoints?.join('. ') || 'Needs assistance',
      goalAmount: 1500, // Default, can be extracted from signals
      currency: 'USD',
      generationMode: 'AUTOMATED' as const
    };

    // Validate draft data
    if (!draft.title || draft.title.trim().length === 0) {
      console.warn('[Pipeline Orchestrator] Invalid draft title');
      return await createPipelineFailure('PARSING_INCOMPLETE', {
        ticketId,
        context: { partialData: extractPartialData(transcript, draft) }
      });
    }

    // Step 8: Save draft with database error handling
    let savedDraft;
    try {
      savedDraft = await prisma.donationDraft.upsert({
        where: { ticketId },
        update: {
          title: draft.title,
          story: draft.story,
          goalAmount: draft.goalAmount,
          generationMode: 'AUTOMATED',
          extractedAt: new Date()
        },
        create: {
          ticketId: draft.ticketId,
          title: draft.title,
          story: draft.story,
          goalAmount: draft.goalAmount,
          currency: draft.currency,
          generationMode: 'AUTOMATED',
          extractedAt: new Date()
        }
      });
    } catch (dbError: any) {
      console.error('[Pipeline Orchestrator] Database save failed:', dbError);
      return await createPipelineFailure('PIPELINE_EXCEPTION', {
        ticketId,
        error: dbError,
        context: { partialData: extractPartialData(transcript, draft) }
      });
    }

    console.log(`[Pipeline Orchestrator] Success for ticket ${ticketId}`);

    return {
      success: true,
      fallbackRequired: false,
      draft: {
        id: savedDraft.id,
        ticketId: savedDraft.ticketId,
        title: savedDraft.title,
        story: savedDraft.story,
        goalAmount: Number(savedDraft.goalAmount) || 0,
        currency: savedDraft.currency || 'USD',
        generationMode: 'AUTOMATED'
      }
    };

  } catch (unexpectedError: any) {
    console.error('[Pipeline Orchestrator] Unexpected error:', unexpectedError);
    return await createPipelineFailure('PIPELINE_EXCEPTION', {
      ticketId,
      error: unexpectedError,
      context: { partialData: extractPartialData(transcript) }
    });
  }
}

/**
 * Check pipeline health before processing
 */
export async function checkPipelineHealth(): Promise<{
  healthy: boolean;
  issues: string[];
  services: Record<string, boolean>;
}> {
  const issues: string[] = [];
  const services: Record<string, boolean> = {};

  try {
    // Check database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`;
      services.database = true;
    } catch (dbError: any) {
      services.database = false;
      issues.push(`Database connection failed: ${dbError.message}`);
    }

    // Check system degraded status
    try {
      const isDegraded = await isSystemDegraded();
      services.system = !isDegraded;
      if (isDegraded) {
        issues.push('System is in degraded mode');
      }
    } catch (healthError: any) {
      services.system = false;
      issues.push(`System health check failed: ${healthError.message}`);
    }

    // Check speech intelligence service availability
    try {
      // Simple import check - if the module loads, service is available
      const { extractSignals } = await import('./speechIntelligence/transcriptSignalExtractor');
      services.speechIntelligence = typeof extractSignals === 'function';
    } catch (speechError: any) {
      services.speechIntelligence = false;
      issues.push(`Speech intelligence service unavailable: ${speechError.message}`);
    }

    // Check Stripe service availability
    try {
      const { isStripeConfigured } = await import('../config/stripe');
      services.stripe = isStripeConfigured();
    } catch (stripeError: any) {
      services.stripe = false;
      issues.push(`Stripe service unavailable: ${stripeError.message}`);
    }

    // Check required environment variables
    const requiredEnvVars = ['DATABASE_URL', 'STRIPE_SECRET_KEY'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    services.environment = missingEnvVars.length === 0;
    if (missingEnvVars.length > 0) {
      issues.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    const healthy = issues.length === 0;

    console.log(`[Pipeline Health] ${healthy ? '✅' : '❌'} ${issues.length} issues found`, {
      services,
      issues: healthy ? [] : issues
    });

    return { healthy, issues, services };

  } catch (error: any) {
    console.error('[Pipeline Health] Health check failed:', error);
    return {
      healthy: false,
      issues: [`Health check system error: ${error.message}`],
      services: { healthCheck: false }
    };
  }
}

/**
 * Trigger pipeline from recording completion
 * NOTE: This function requires a Recording model that links to RecordingTicket
 * Currently commented out as Recording model is not in schema
 */
/*
export async function processDonationFromRecording(recordingId: string): Promise<PipelineResponse> {
  
  // Find recording
  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
    include: { ticket: true }
  });

  if (!recording) {
    throw new Error(`Recording ${recordingId} not found`);
  }

  const ticketId = recording.ticket?.id;
  if (!ticketId) {
    throw new Error('Recording has no associated ticket');
  }

  // Get transcript (from AssemblyAI or stored)
  let transcript = recording.transcriptText;

  if (!transcript) {
    // Attempt to fetch from AssemblyAI if available
    // For now, return fallback
    return await createPipelineFailure('TRANSCRIPTION_FAILED', {
      ticketId,
      recordingId
    });
  }

  return await orchestrateDonationPipeline({
    ticketId,
    transcript
  });
}
*/
