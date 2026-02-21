/**
 * Job-Based Pipeline Orchestrator
 * 
 * Converts the donation pipeline from synchronous HTTP requests to async job processing.
 * Clients initiate processing and poll for status updates instead of waiting for completion.
 * 
 * Benefits:
 * - No long HTTP requests (prevents timeout issues)
 * - Clients can poll for progress
 * - Better error recovery
 * - Support for longer-running operations
 */

import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, RecordingTicket, RecordingTicketStatus } from '@prisma/client';
import { retryWithBackoff, RETRY_PRESETS, withTimeout } from '../../utils/retryWithBackoff';

const prisma = new PrismaClient();

/**
 * Job states
 */
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'READY' | 'NEEDS_INFO' | 'ERROR';

export type PipelineStage = 
  | 'CREATED'
  | 'TRANSCRIPTION' 
  | 'ANALYSIS' 
  | 'DRAFT' 
  | 'QR'
  | 'COMPLETE';

/**
 * Job data structure
 */
export interface PipelineJob {
  id: string;
  ticketId: string;
  status: JobStatus;
  stage: PipelineStage;
  progress: number; // 0-100
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  lastUpdated: Date;
  error?: {
    message: string;
    stage: PipelineStage;
    retryable: boolean;
  };
  needsInfo?: {
    missingFields: string[];
    suggestedQuestions: string[];
    currentDraftPreview?: any;
  };
}

/**
 * In-memory job queue (for V1 - can be replaced with Redis/Bull later)
 */
class JobQueue {
  private jobs: Map<string, PipelineJob> = new Map();
  private processing: Set<string> = new Set();
  
  /**
   * Add a new job to the queue
   */
  async addJob(ticketId: string): Promise<PipelineJob> {
    const job: PipelineJob = {
      id: uuidv4(),
      ticketId,
      status: 'QUEUED',
      stage: 'CREATED',
      progress: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    this.jobs.set(job.id, job);
    
    // Start processing asynchronously (don't await)
    setImmediate(() => this.processJob(job.id));
    
    return job;
  }
  
  /**
   * Get job status
   */
  getJob(jobId: string): PipelineJob | undefined {
    return this.jobs.get(jobId);
  }
  
  /**
   * Get job by ticket ID
   */
  getJobByTicketId(ticketId: string): PipelineJob | undefined {
    for (const job of this.jobs.values()) {
      if (job.ticketId === ticketId) {
        return job;
      }
    }
    return undefined;
  }
  
  /**
   * Update job status
   */
  private updateJob(jobId: string, updates: Partial<PipelineJob>): void {
    const job = this.jobs.get(jobId);
    if (job) {
      Object.assign(job, { ...updates, lastUpdated: new Date() });
      this.jobs.set(jobId, job);
    }
  }
  
  /**
   * Process a job through the pipeline
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.error(`[JobQueue] Job ${jobId} not found`);
      return;
    }
    
    // Prevent duplicate processing
    if (this.processing.has(jobId)) {
      console.warn(`[JobQueue] Job ${jobId} already processing`);
      return;
    }
    
    this.processing.add(jobId);
    
    try {
      this.updateJob(jobId, {
        status: 'PROCESSING',
        startedAt: new Date(),
        stage: 'TRANSCRIPTION',
        progress: 10
      });
      
      // Import orchestrator (lazy load to avoid circular deps)
      const { processTicket } = await import('./orchestrator');
      
      // Execute pipeline with timeout and retry
      await retryWithBackoff(
        async () => {
          return await withTimeout(
            processTicket(job.ticketId),
            parseInt(process.env.PIPELINE_TOTAL_TIMEOUT || '180000'), // 3 minutes default
            'Pipeline processing timed out'
          );
        },
        {
          ...RETRY_PRESETS.STANDARD,
          onRetry: (error, attempt) => {
            console.warn(`[JobQueue] Job ${jobId} retry ${attempt}: ${error.message}`);
            this.updateJob(jobId, {
              progress: Math.min(job.progress + 5, 90) // Increment progress slightly
            });
          }
        }
      );
      
      // Check final ticket status
      const ticket = await prisma.recordingTicket.findUnique({
        where: { id: job.ticketId },
        include: {
          donationDraft: true,
          qrCodeLink: true
        }
      });
      
      if (!ticket) {
        throw new Error('Ticket not found after processing');
      }
      
      // Determine final status
      if (ticket.status === 'NEEDS_INFO' || ticket.status === 'DRAFT') {
        this.updateJob(jobId, {
          status: 'NEEDS_INFO',
          stage: 'DRAFT',
          progress: 75,
          needsInfo: ticket.needsInfo as any
        });
      } else if (ticket.status === 'READY' || ticket.status === 'PUBLISHED') {
        this.updateJob(jobId, {
          status: 'READY',
          stage: 'COMPLETE',
          progress: 100,
          completedAt: new Date()
        });
      } else if (ticket.status === 'ERROR') {
        throw new Error('Pipeline processing failed');
      }
      
    } catch (error: any) {
      console.error(`[JobQueue] Job ${jobId} failed:`, error);
      
      this.updateJob(jobId, {
        status: 'ERROR',
        progress: job.progress, // Keep current progress
        error: {
          message: error.message || 'Unknown error',
          stage: job.stage,
          retryable: isRetryableError(error)
        }
      });
      
      // Update ticket status
      await prisma.recordingTicket.update({
        where: { id: job.ticketId },
        data: { status: 'ERROR' }
      }).catch(console.error);
      
    } finally {
      this.processing.delete(jobId);
      
      // Clean up old jobs after 1 hour
      setTimeout(() => {
        this.jobs.delete(jobId);
      }, 3600000);
    }
  }
  
  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<PipelineJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    if (job.status !== 'ERROR') {
      throw new Error('Only failed jobs can be retried');
    }
    
    // Reset job status
    this.updateJob(jobId, {
      status: 'QUEUED',
      stage: 'CREATED',
      progress: 0,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined
    });
    
    // Restart processing
    setImmediate(() => this.processJob(jobId));
    
    return this.jobs.get(jobId)!;
  }
  
  /**
   * Get all jobs (for debugging)
   */
  getAllJobs(): PipelineJob[] {
    return Array.from(this.jobs.values());
  }
  
  /**
   * Clear completed jobs older than N minutes
   */
  clearOldJobs(maxAgeMinutes: number = 60): number {
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    let cleared = 0;
    
    for (const [id, job] of this.jobs.entries()) {
      if (
        job.completedAt &&
        job.completedAt.getTime() < cutoff &&
        !this.processing.has(id)
      ) {
        this.jobs.delete(id);
        cleared++;
      }
    }
    
    return cleared;
  }
}

// Singleton instance
export const jobQueue = new JobQueue();

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code?.toLowerCase() || '';
  
  const retryablePatterns = [
    'timeout',
    'econnreset',
    'econnrefused',
    'etimedout',
    'rate_limit',
    '429',
    '500',
    '502',
    '503',
    '504',
    'connection',
    'network'
  ];
  
  return retryablePatterns.some(pattern => 
    message.includes(pattern) || code.includes(pattern)
  );
}

/**
 * Stage progress mapping (for UI updates)
 */
export const STAGE_PROGRESS: Record<PipelineStage, number> = {
  CREATED: 5,
  TRANSCRIPTION: 25,
  ANALYSIS: 50,
  DRAFT: 75,
  QR: 90,
  COMPLETE: 100
};

/**
 * Update job progress during pipeline stages
 */
export function updateJobProgress(ticketId: string, stage: PipelineStage): void {
  const job = jobQueue.getJobByTicketId(ticketId);
  if (job) {
    jobQueue['updateJob'](job.id, {
      stage,
      progress: STAGE_PROGRESS[stage]
    });
  }
}
