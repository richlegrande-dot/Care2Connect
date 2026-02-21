/**
 * Structured Logger with PII Redaction
 * All logs in production must be structured JSON with PII redacted
 */

import { Request } from "express";
import { getRequestId } from "../middleware/correlationId";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  ticketId?: string;
  sessionId?: string;
  draftId?: string;
  qrId?: string;
  stripeSessionId?: string;
  [key: string]: any;
}

/**
 * PII fields that must be redacted
 */
const PII_FIELDS = [
  "email",
  "phone",
  "phoneNumber",
  "name",
  "fullName",
  "firstName",
  "lastName",
  "address",
  "street",
  "city",
  "zipCode",
  "postalCode",
  "ssn",
  "transcript",
  "transcriptText",
  "story",
  "password",
  "apiKey",
  "secret",
  "token",
  "authorization",
];

/**
 * Redact PII from log data
 */
function redactPII(data: any): any {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactPII(item));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Check if this field contains PII
    const isPII = PII_FIELDS.some((piiField) =>
      lowerKey.includes(piiField.toLowerCase()),
    );

    if (isPII && value) {
      // Redact based on type
      if (typeof value === "string") {
        if (lowerKey.includes("email")) {
          redacted[key] = value.replace(/(.{2})(.*)(@.*)/, "$1***$3");
        } else if (lowerKey.includes("phone")) {
          redacted[key] = value.replace(/(\d{3})(\d+)(\d{4})/, "$1***$3");
        } else if (
          lowerKey.includes("transcript") ||
          lowerKey.includes("story")
        ) {
          redacted[key] = `[REDACTED - ${value.length} chars]`;
        } else {
          redacted[key] = "[REDACTED]";
        }
      } else {
        redacted[key] = "[REDACTED]";
      }
    } else if (typeof value === "object") {
      redacted[key] = redactPII(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Public interface for request-scoped loggers
 */
export interface RequestLogger {
  requestId: string;
  debug(event: string, message: string, context?: LogContext): void;
  info(event: string, message: string, context?: LogContext): void;
  warn(event: string, message: string, context?: LogContext): void;
  error(event: string, message: string, context?: LogContext): void;
  recordingCreated(recordingId: string, userId?: string): void;
  transcriptionCompleted(
    ticketId: string,
    sessionId: string,
    durationMs: number,
  ): void;
  draftReady(draftId: string, ticketId: string, qualityScore: number): void;
  qrGenerated(qrId: string, ticketId: string, stripeSessionId?: string): void;
  adminLoginSuccess(sessionId: string): void;
  adminLoginFailed(reason: string): void;
  pipelineError(stage: string, ticketId: string, error: string): void;
}

/**
 * Structured logger class
 */
export class StructuredLogger {
  private serviceName: string;
  private isProduction: boolean;

  constructor(serviceName: string = "careconnect-backend") {
    this.serviceName = serviceName;
    this.isProduction =
      process.env.NODE_ENV === "production" || process.env.RUN_MODE === "prod";
  }

  private formatLog(
    level: LogLevel,
    event: string,
    message: string,
    context: LogContext = {},
  ): void {
    const timestamp = new Date().toISOString();

    // Redact PII in production
    const safeContext = this.isProduction ? redactPII(context) : context;

    if (this.isProduction) {
      // Structured JSON for production
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        service: this.serviceName,
        event,
        message,
        ...safeContext,
      };
      console.log(JSON.stringify(logEntry));
    } else {
      // Human-readable for development
      const contextStr =
        Object.keys(safeContext).length > 0
          ? " " + JSON.stringify(safeContext)
          : "";
      console.log(
        `[${timestamp}] [${level.toUpperCase()}] [${event}] ${message}${contextStr}`,
      );
    }
  }

  debug(event: string, message: string, context?: LogContext): void {
    this.formatLog("debug", event, message, context);
  }

  info(event: string, message: string, context?: LogContext): void {
    this.formatLog("info", event, message, context);
  }

  warn(event: string, message: string, context?: LogContext): void {
    this.formatLog("warn", event, message, context);
  }

  error(event: string, message: string, context?: LogContext): void {
    this.formatLog("error", event, message, context);
  }

  // Predefined log events for pipeline
  recordingCreated(
    recordingId: string,
    userId: string,
    requestId?: string,
  ): void {
    this.info("RECORDING_CREATED", "New recording created", {
      recordingId,
      userId,
      requestId,
    });
  }

  transcriptionCompleted(
    ticketId: string,
    sessionId: string,
    durationMs: number,
    requestId?: string,
  ): void {
    this.info(
      "TRANSCRIPTION_COMPLETED",
      "Transcription completed successfully",
      {
        ticketId,
        sessionId,
        durationMs,
        requestId,
      },
    );
  }

  draftReady(
    draftId: string,
    ticketId: string,
    qualityScore: number,
    requestId?: string,
  ): void {
    this.info("DRAFT_READY", "Draft generation completed", {
      draftId,
      ticketId,
      qualityScore,
      requestId,
    });
  }

  qrGenerated(
    qrId: string,
    ticketId: string,
    stripeSessionId?: string,
    requestId?: string,
  ): void {
    this.info("QR_GENERATED", "QR code generated successfully", {
      qrId,
      ticketId,
      stripeSessionId,
      requestId,
    });
  }

  adminLoginSuccess(sessionId: string, requestId?: string): void {
    this.info("ADMIN_LOGIN_SUCCESS", "Admin logged in successfully", {
      sessionId,
      requestId,
    });
  }

  adminLoginFailed(reason: string, requestId?: string): void {
    this.warn("ADMIN_LOGIN_FAILED", "Admin login attempt failed", {
      reason,
      requestId,
    });
  }

  pipelineError(
    stage: string,
    ticketId: string,
    error: string,
    requestId?: string,
  ): void {
    this.error("PIPELINE_ERROR", `Pipeline failed at ${stage}`, {
      stage,
      ticketId,
      error,
      requestId,
    });
  }
}

// Export singleton instance
export const logger = new StructuredLogger();

// Helper to create logger with request context
export function getRequestLogger(req: Request): RequestLogger {
  const requestId = getRequestId(req);
  const baseLogger = new StructuredLogger();

  return {
    requestId,
    debug: (event, message, context?) =>
      baseLogger.debug(event, message, { ...context, requestId }),
    info: (event, message, context?) =>
      baseLogger.info(event, message, { ...context, requestId }),
    warn: (event, message, context?) =>
      baseLogger.warn(event, message, { ...context, requestId }),
    error: (event, message, context?) =>
      baseLogger.error(event, message, { ...context, requestId }),
    recordingCreated: (recordingId, userId) =>
      baseLogger.recordingCreated(recordingId, userId, requestId),
    transcriptionCompleted: (ticketId, sessionId, durationMs) =>
      baseLogger.transcriptionCompleted(
        ticketId,
        sessionId,
        durationMs,
        requestId,
      ),
    draftReady: (draftId, ticketId, qualityScore) =>
      baseLogger.draftReady(draftId, ticketId, qualityScore, requestId),
    qrGenerated: (qrId, ticketId, stripeSessionId?) =>
      baseLogger.qrGenerated(qrId, ticketId, stripeSessionId, requestId),
    adminLoginSuccess: (sessionId) =>
      baseLogger.adminLoginSuccess(sessionId, requestId),
    adminLoginFailed: (reason) =>
      baseLogger.adminLoginFailed(reason, requestId),
    pipelineError: (stage, ticketId, error) =>
      baseLogger.pipelineError(stage, ticketId, error, requestId),
  };
}
