/**
 * Pipeline Failure Handler
 *
 * Unified error handling for donation pipeline that returns
 * PipelineFailureResponse instead of throwing uncaught errors
 */

import {
  PipelineFailureResponse,
  PipelineFailureReasonCode,
  FALLBACK_USER_MESSAGES,
} from "../types/fallback";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

interface CreateIncidentOptions {
  ticketId?: string;
  recordingId?: string;
  error?: Error | any;
  context?: Record<string, any>;
}

/**
 * Create pipeline failure response with incident logging
 */
export async function createPipelineFailure(
  reasonCode: PipelineFailureReasonCode,
  options: CreateIncidentOptions = {} as CreateIncidentOptions,
): Promise<PipelineFailureResponse> {
  const debugId = uuidv4();
  const userMessage = FALLBACK_USER_MESSAGES[reasonCode];

  // Log incident for observability
  try {
    await logPipelineIncident({
      debugId,
      reasonCode,
      ...options,
    });
  } catch (logError) {
    console.error("[Pipeline Failure] Failed to log incident:", logError);
    // Don't block the response if logging fails
  }

  const response: PipelineFailureResponse = {
    success: false,
    fallbackRequired: true,
    reasonCode,
    userMessage,
    debugId,
    partialData: options.context?.partialData,
  };

  console.warn(`[Pipeline Failure] ${reasonCode} - debugId: ${debugId}`, {
    ticketId: options.ticketId,
    error: options.error?.message,
  });

  return response;
}

/**
 * Log pipeline incident to database
 */
async function logPipelineIncident(
  options: CreateIncidentOptions & {
    debugId: string;
    reasonCode: PipelineFailureReasonCode;
  },
): Promise<void> {
  const { debugId, ticketId, recordingId, reasonCode, error, context } =
    options;

  try {
    await prisma.system_incidents.create({
      data: {
        id: debugId,
        severity: "WARN",
        category: "PIPELINE_FALLBACK",
        title: `Pipeline Fallback: ${reasonCode}`,
        description: `Automated pipeline failed with reason: ${reasonCode}`,
        metadata: {
          reasonCode,
          ticketId,
          recordingId,
          errorMessage: error?.message,
          errorStack: error?.stack,
          ...context,
        },
        occurredAt: new Date(),
        resolved: false,
        updatedAt: new Date(),
      },
    });
  } catch (dbError) {
    // Log but don't throw - incident logging is non-critical
    console.error("[Pipeline Incident] DB write failed:", dbError);
  }
}

/**
 * Wrap pipeline execution with automatic failure handling
 */
export async function executePipelineWithFallback<T>(
  ticketId: string,
  operation: () => Promise<T>,
  reasonCode: PipelineFailureReasonCode = "PIPELINE_EXCEPTION",
): Promise<T | PipelineFailureResponse> {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`[Pipeline] ${reasonCode} error:`, error);

    return await createPipelineFailure(reasonCode, {
      ticketId,
      error,
      context: {
        errorType: error.constructor.name,
        errorMessage: error.message,
      },
    });
  }
}

/**
 * Check if response is a failure requiring fallback
 */
export function isFallbackRequired(
  response: any,
): response is PipelineFailureResponse {
  return response && response.fallbackRequired === true;
}

/**
 * Check if system is degraded (should trigger fallback)
 */
export async function isSystemDegraded(): Promise<boolean> {
  try {
    // Check background services status
    if (process.env.START_BACKGROUND_SERVICES === "false") {
      return true;
    }

    // Check health endpoint
    const healthCheck = await fetch(
      "http://localhost:3001/health/status",
    ).catch(() => null);

    if (!healthCheck || !healthCheck.ok) {
      return true;
    }

    const health: any = await healthCheck.json();
    return health.status === "degraded" || health.status === "error";
  } catch (error) {
    console.warn("[Pipeline] System health check failed:", error);
    return true; // Fail-safe: assume degraded if check fails
  }
}

/**
 * Extract partial data from failed pipeline attempt
 */
export function extractPartialData(
  transcript?: string,
  extractedFields?: any,
): PipelineFailureResponse["partialData"] | undefined {
  if (!transcript && !extractedFields) {
    return undefined;
  }

  return {
    transcript: transcript || undefined,
    extractedFields: extractedFields
      ? {
          title: extractedFields.title,
          story: extractedFields.story,
          goalAmount: extractedFields.goalAmount,
        }
      : undefined,
  };
}
