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
    // Check system health first
    if (await isSystemDegraded()) {
      console.warn('[Pipeline Orchestrator] System degraded, triggering fallback');
      return await createPipelineFailure('SYSTEM_DEGRADED', {
        ticketId,
        context: { partialData: extractPartialData(transcript) }
      });
    }

    // Force manual if requested
    if (forceManual) {
      return await createPipelineFailure('PARSING_INCOMPLETE', {
        ticketId,
        context: { partialData: extractPartialData(transcript) }
      });
    }

    // Step 1: Validate transcript
    if (!transcript || transcript.trim().length === 0) {
      console.warn('[Pipeline Orchestrator] No transcript available');
      return await createPipelineFailure('TRANSCRIPTION_FAILED', { ticketId });
    }

    // Step 2: Check for dry recording
    const trimmed = transcript.trim();
    if (trimmed === '...' || trimmed.length < 10) {
      console.warn('[Pipeline Orchestrator] Dry recording detected');
      return await createPipelineFailure('PARSING_INCOMPLETE', {
        ticketId,
        context: { partialData: extractPartialData(transcript) }
      });
    }

    // Step 3: Extract signals
    let signals;
    try {
      signals = await extractSignals({ text: transcript });
    } catch (error: any) {
      console.error('[Pipeline Orchestrator] Signal extraction failed:', error);
      return await createPipelineFailure('PARSING_INCOMPLETE', {
        ticketId,
        error,
        context: { partialData: extractPartialData(transcript) }
      });
    }

    // Step 4: Validate signal quality
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

    // Step 5: Generate draft (simplified for now)
    const draft = {
      ticketId,
      title: `Help ${signals.nameCandidate}`,
      story: signals.keyPoints?.join('. ') || 'Needs assistance',
      goalAmount: 1500, // Default, can be extracted from signals
      currency: 'USD',
      generationMode: 'AUTOMATED' as const
    };

    // Step 6: Save draft
    const savedDraft = await prisma.donationDraft.upsert({
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

  } catch (error: any) {
    console.error('[Pipeline Orchestrator] Unexpected error:', error);
    return await createPipelineFailure('PIPELINE_EXCEPTION', {
      ticketId,
      error,
      context: { partialData: extractPartialData(transcript) }
    });
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
