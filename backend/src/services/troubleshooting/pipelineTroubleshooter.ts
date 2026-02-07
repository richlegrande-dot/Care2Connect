/**
 * Pipeline Troubleshooter Service
 * 
 * Handles pipeline failures by:
 * 1. Creating PipelineIncident records
 * 2. Searching Knowledge Vault for recommendations
 * 3. Providing investigate & self-heal capabilities
 * 4. Logging all actions for audit trail
 * 
 * Safety: Only allows whitelisted self-heal actions
 */

import { PrismaClient, PipelineStage, IncidentSeverity, IncidentStatus } from '@prisma/client';
import { getRecommendedActions, findTroubleshootingBySymptoms, logKnowledgeUsage, KnowledgeMatch } from '../knowledge/query';
import { logAudit } from '../auditLogger';

const prisma = new PrismaClient();

export interface FailureContext {
  ticketId?: string;
  stage: PipelineStage;
  error: Error | string;
  context?: any;
  severity?: IncidentSeverity;
}

export interface IncidentDetail {
  id: string;
  ticketId: string | null;
  stage: PipelineStage;
  severity: IncidentSeverity;
  errorCode: string | null;
  errorMessage: string;
  contextJson: any;
  recommendationsJson: any;
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
  matchedChunks?: KnowledgeMatch[];
}

/**
 * Sanitize error message to remove secrets and PII
 */
function sanitizeError(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  
  return message
    .replace(/sk_[a-zA-Z0-9]+/g, 'sk_***')
    .replace(/whsec_[a-zA-Z0-9]+/g, 'whsec_***')
    .replace(/postgres:\/\/[^\s]+/g, 'postgres://***')
    .replace(/Bearer [a-zA-Z0-9._-]+/g, 'Bearer ***')
    .replace(/api[_-]?key[:\s=]+[a-zA-Z0-9]+/gi, 'api_key=***')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***');
}

/**
 * Extract error code from error object
 */
function extractErrorCode(error: Error | string): string | null {
  if (typeof error === 'string') return null;
  
  // Check for common error code properties
  if ('code' in error && typeof error.code === 'string') return error.code;
  if ('name' in error && error.name !== 'Error') return error.name;
  
  return null;
}

/**
 * Handle a pipeline failure by creating an incident and finding recommendations
 */
export async function handleFailure(params: FailureContext): Promise<IncidentDetail> {
  const { ticketId, stage, error, context, severity = IncidentSeverity.ERROR } = params;
  
  try {
    // Sanitize error
    const errorMessage = sanitizeError(error);
    const errorCode = extractErrorCode(error);
    
    // Get recommendations from Knowledge Vault
    const recommendations = await getRecommendedActions({
      stage,
      error: errorMessage,
      context,
    });
    
    // Create incident record
    const incident = await prisma.pipeline_incidents.create({
      data: {
        id: crypto.randomUUID(),
        ticketId: ticketId || null,
        stage,
        severity,
        errorCode,
        errorMessage,
        contextJson: context || {},
        recommendationsJson: {
          matches: recommendations.matchedChunks.length,
          actions: recommendations.suggestedActions.length,
          confidence: recommendations.confidence,
          timestamp: new Date().toISOString(),
        },
        status: IncidentStatus.OPEN,
        updatedAt: new Date(),
      },
    });
    
    // Create knowledge bindings for traceability
    if (recommendations.matchedChunks.length > 0) {
      await prisma.knowledge_bindings.createMany({
        data: recommendations.matchedChunks.map(chunk => ({
          id: crypto.randomUUID(),
          incidentId: incident.id,
          knowledgeChunkId: chunk.id,
          score: chunk.score,
          reason: `Matched ${stage} failure with score ${chunk.score.toFixed(2)}`,
        })),
        skipDuplicates: true,
      });
    }
    
    // Log knowledge usage
    if (recommendations.matchedChunks.length > 0) {
      logKnowledgeUsage({
        ticketId,
        stage,
        chunkIds: recommendations.matchedChunks.map(c => c.id),
        outcome: 'PARTIAL', // Will be updated if self-heal succeeds
      });
    }
    
    console.log(`[Troubleshooter] Created incident ${incident.id} for stage ${stage}${ticketId ? ` (ticket ${ticketId})` : ''}`);
    console.log(`[Troubleshooter] Found ${recommendations.matchedChunks.length} knowledge matches, ${recommendations.suggestedActions.length} suggested actions`);
    
    return {
      ...incident,
      matchedChunks: recommendations.matchedChunks,
    };
  } catch (err) {
    console.error('[Troubleshooter] Error handling failure:', err);
    
    // Fallback: create incident without recommendations
    const incident = await prisma.pipeline_incidents.create({
      data: {
        id: crypto.randomUUID(),
        ticketId: ticketId || null,
        stage,
        severity,
        errorCode: extractErrorCode(error),
        errorMessage: sanitizeError(error),
        contextJson: context || {},
        recommendationsJson: { error: 'Failed to fetch recommendations' },
        status: IncidentStatus.OPEN,
        updatedAt: new Date(),
      },
    });
    
    return incident;
  }
}

/**
 * Investigate an incident by re-running diagnostics and updating recommendations
 */
export async function investigateIncident(incidentId: string): Promise<IncidentDetail> {
  const incident = await prisma.pipeline_incidents.findUnique({
    where: { id: incidentId },
    include: {
      recording_tickets: true,
      knowledge_bindings: true,
    },
  });
  
  if (!incident) {
    throw new Error(`Incident ${incidentId} not found`);
  }
  
  console.log(`[Troubleshooter] Investigating incident ${incidentId}...`);
  
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: [],
  };
  
  // Run safe diagnostics based on stage
  switch (incident.stage) {
    case PipelineStage.TRANSCRIPTION:
      // Check if audio file exists
      if (incident.recording_tickets?.audioFileId || incident.recording_tickets?.audioUrl) {
        diagnostics.checks.push({
          name: 'Audio file reference',
          status: 'OK',
          detail: 'Audio file reference present',
        });
      } else {
        diagnostics.checks.push({
          name: 'Audio file reference',
          status: 'MISSING',
          detail: 'No audio file reference found',
        });
      }
      
      // Check transcription sessions
      if (incident.ticketId) {
        const sessions = await prisma.transcription_sessions.findMany({
          where: { recordingTicketId: incident.ticketId },
        });
        diagnostics.checks.push({
          name: 'Transcription sessions',
          status: sessions.length > 0 ? 'OK' : 'MISSING',
          detail: `Found ${sessions.length} session(s)`,
        });
      }
      break;
    
    case PipelineStage.DRAFT:
      // Check if transcription exists
      if (incident.ticketId) {
        const draft = await prisma.donation_drafts.findUnique({
          where: { ticketId: incident.ticketId },
        });
        diagnostics.checks.push({
          name: 'Donation draft',
          status: draft ? 'OK' : 'MISSING',
          detail: draft ? 'Draft exists' : 'No draft found',
        });
      }
      break;
    
    case PipelineStage.STRIPE:
      // Check Stripe session
      if (incident.ticketId) {
        const qrLink = await prisma.qr_code_links.findUnique({
          where: { ticketId: incident.ticketId },
        });
        diagnostics.checks.push({
          name: 'QR Code Link',
          status: qrLink ? 'OK' : 'MISSING',
          detail: qrLink ? 'QR link exists' : 'No QR link found',
        });
      }
      break;
    
    case PipelineStage.DB:
      // Check database connectivity
      try {
        await prisma.$queryRaw`SELECT 1`;
        diagnostics.checks.push({
          name: 'Database connection',
          status: 'OK',
          detail: 'Connection successful',
        });
      } catch (err) {
        diagnostics.checks.push({
          name: 'Database connection',
          status: 'FAILED',
          detail: sanitizeError(err as Error),
        });
      }
      break;
  }
  
  // Re-search Knowledge Vault with updated context
  const symptoms = diagnostics.checks
    .filter((c: any) => c.status !== 'OK')
    .map((c: any) => c.name);
  
  const matchedChunks = symptoms.length > 0
    ? await findTroubleshootingBySymptoms(symptoms)
    : [];
  
  // Update incident with investigation results
  const updated = await prisma.pipeline_incidents.update({
    where: { id: incidentId },
    data: {
      contextJson: {
        ...(incident.contextJson as object || {}),
        investigation: diagnostics,
      },
      recommendationsJson: {
        ...(incident.recommendationsJson as object || {}),
        investigation: {
          matchedChunks: matchedChunks.length,
          timestamp: new Date().toISOString(),
        },
      },
    },
  });
  
  // Log audit entry
  await logAudit({
    actor: 'admin',
    action: 'UPDATE',
    entityType: 'PIPELINE_INCIDENT',
    entityId: incidentId,
    before: incident,
    after: updated,
    reason: 'Investigation completed',
  });
  
  console.log(`[Troubleshooter] Investigation complete: ${diagnostics.checks.length} checks, ${matchedChunks.length} new matches`);
  
  return {
    ...updated,
    matchedChunks,
  };
}

/**
 * Attempt to self-heal an incident using whitelisted actions
 */
export async function attemptSelfHeal(incidentId: string): Promise<{ success: boolean; message: string; details: any }> {
  const incident = await prisma.pipeline_incidents.findUnique({
    where: { id: incidentId },
    include: {
      recording_tickets: true,
    },
  });
  
  if (!incident) {
    throw new Error(`Incident ${incidentId} not found`);
  }
  
  if (!incident.ticketId) {
    return {
      success: false,
      message: 'Cannot self-heal system-wide incidents',
      details: {},
    };
  }
  
  console.log(`[Troubleshooter] Attempting self-heal for incident ${incidentId} (stage: ${incident.stage})...`);
  
  const healActions: any[] = [];
  let success = false;
  
  try {
    switch (incident.stage) {
      case PipelineStage.TRANSCRIPTION:
        // Action: Switch to fallback engine (EVTS -> OpenAI)
        healActions.push({
          action: 'SWITCH_ENGINE',
          from: 'EVTS',
          to: 'OPENAI',
          reason: 'EVTS failed, trying OpenAI fallback',
        });
        
        // Update ticket metadata to force OpenAI
        await prisma.recordingTicket.update({
          where: { id: incident.ticketId },
          data: {
            lastStep: 'RETRYING_TRANSCRIPTION_OPENAI',
          },
        });
        
        healActions.push({
          action: 'UPDATE_TICKET',
          status: 'Marked for retry with OpenAI',
        });
        
        success = true;
        break;
      
      case PipelineStage.DRAFT:
        // Action: Regenerate draft from existing transcript
        const sessions = await prisma.transcription_sessions.findMany({
          where: { recordingTicketId: incident.ticketId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });
        
        if (sessions.length > 0 && sessions[0].transcriptText) {
          healActions.push({
            action: 'REGENERATE_DRAFT',
            sessionId: sessions[0].id,
            reason: 'Using existing transcript to regenerate draft',
          });
          
          // Mark ticket for draft regeneration
          await prisma.recordingTicket.update({
            where: { id: incident.ticketId },
            data: {
              lastStep: 'RETRYING_DRAFT_GENERATION',
            },
          });
          
          success = true;
        } else {
          healActions.push({
            action: 'CANNOT_REGENERATE',
            reason: 'No transcript available',
          });
        }
        break;
      
      case PipelineStage.STRIPE:
        // Action: Regenerate QR code + checkout session
        const draft = await prisma.donation_drafts.findUnique({
          where: { ticketId: incident.ticketId },
        });
        
        if (draft) {
          // Invalidate old QR link
          await prisma.qr_code_links.deleteMany({
            where: { ticketId: incident.ticketId },
          });
          
          healActions.push({
            action: 'INVALIDATE_OLD_QR',
            status: 'Old QR link removed',
          });
          
          // Mark for QR regeneration
          await prisma.recordingTicket.update({
            where: { id: incident.ticketId },
            data: {
              lastStep: 'RETRYING_QR_GENERATION',
            },
          });
          
          healActions.push({
            action: 'MARK_FOR_REGENERATION',
            status: 'Ticket marked for QR regeneration',
          });
          
          success = true;
        }
        break;
      
      default:
        healActions.push({
          action: 'NO_SAFE_ACTION',
          reason: `No safe self-heal action available for stage ${incident.stage}`,
        });
    }
    
    // Update incident status if successful
    if (success) {
      await prisma.pipeline_incidents.update({
        where: { id: incidentId },
        data: {
          status: IncidentStatus.AUTO_RESOLVED,
          resolvedAt: new Date(),
          contextJson: {
            ...(incident.contextJson as object || {}),
            selfHeal: {
              actions: healActions,
              timestamp: new Date().toISOString(),
            },
          },
        },
      });
      
      // Log audit entry
      // TODO: Add proper audit logging when AuditEntityType enum includes PIPELINE_INCIDENT
      // await logAudit({
      //   actor: 'system',
      //   action: 'UPDATE',
      //   entityType: 'PIPELINE_INCIDENT',
      //   entityId: incidentId,
      //   before: incident,
      //   after: { status: IncidentStatus.AUTO_RESOLVED },
      //   reason: `Self-heal attempted: ${healActions.map(a => a.action).join(', ')}`,
      // });
      
      console.log(`[Troubleshooter] Self-heal successful for incident ${incidentId}`);
    }
    
    return {
      success,
      message: success ? 'Self-heal actions applied' : 'No safe self-heal actions available',
      details: healActions,
    };
  } catch (error) {
    console.error('[Troubleshooter] Self-heal error:', error);
    
    return {
      success: false,
      message: 'Self-heal failed: ' + sanitizeError(error as Error),
      details: healActions,
    };
  }
}

/**
 * Get incident statistics
 */
export async function getIncidentStats(params?: {
  startDate?: Date;
  endDate?: Date;
  ticketId?: string;
}): Promise<any> {
  const where: any = {};
  
  if (params?.startDate) {
    where.createdAt = { gte: params.startDate };
  }
  
  if (params?.endDate) {
    where.createdAt = { ...where.createdAt, lte: params.endDate };
  }
  
  if (params?.ticketId) {
    where.ticketId = params.ticketId;
  }
  
  const [total, byStage, bySeverity, byStatus] = await Promise.all([
    prisma.pipeline_incidents.count({ where }),
    prisma.pipeline_incidents.groupBy({
      by: ['stage'],
      _count: true,
      where,
    }),
    prisma.pipeline_incidents.groupBy({
      by: ['severity'],
      _count: true,
      where,
    }),
    prisma.pipeline_incidents.groupBy({
      by: ['status'],
      _count: true,
      where,
    }),
  ]);
  
  return {
    total,
    byStage: byStage.reduce((acc: any, item: any) => ({ ...acc, [item.stage]: item._count }), {}),
    bySeverity: bySeverity.reduce((acc: any, item: any) => ({ ...acc, [item.severity]: item._count }), {}),
    byStatus: byStatus.reduce((acc: any, item: any) => ({ ...acc, [item.status]: item._count }), {}),
  };
}
