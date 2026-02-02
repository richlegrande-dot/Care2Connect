/**
 * Audit Logging Service
 * Tracks all changes to KnowledgeSource and KnowledgeChunk with full audit trail
 * 
 * Security: Automatically redacts secrets from audit logs
 */

import { PrismaClient, AuditAction, AuditEntityType } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogInput {
  actor: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: any;
  after?: any;
  reason?: string;
}

/**
 * Sensitive patterns to redact from audit logs
 * Never log secrets, API keys, credentials, or tokens
 */
const SENSITIVE_PATTERNS = [
  /sk_\w+/gi, // Stripe secret keys
  /pk_\w+/gi, // Stripe public keys
  /whsec_\w+/gi, // Webhook secrets
  /postgres:\/\/[^:]+:[^@]+@.+/gi, // Database URLs with credentials
  /mysql:\/\/[^:]+:[^@]+@.+/gi, // MySQL URLs with credentials
  /mongodb:\/\/[^:]+:[^@]+@.+/gi, // MongoDB URLs with credentials
  /Bearer\s+[\w\-._]+/gi, // Bearer tokens
  /Authorization:\s*[\w\s]+[\w\-._]+/gi, // Authorization headers
  /api[_-]?key["\s:=]+[\w\-._]+/gi, // API key patterns
  /secret["\s:=]+[\w\-._]+/gi, // Secret patterns
  /password["\s:=]+[\w\-._]+/gi, // Password patterns
  /jwt["\s:=]+[\w\-._]+/gi, // JWT tokens
  /access[_-]?token["\s:=]+[\w\-._]+/gi, // Access tokens
  /refresh[_-]?token["\s:=]+[\w\-._]+/gi, // Refresh tokens
];

/**
 * Security: Redact secrets from any object before logging
 * Replaces sensitive patterns with [REDACTED]
 */
function redactSecrets(obj: any): any {
  if (!obj) return obj;

  // Handle null, undefined, or non-objects
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') {
    // Redact strings
    if (typeof obj === 'string') {
      let redacted = obj;
      for (const pattern of SENSITIVE_PATTERNS) {
        redacted = redacted.replace(pattern, '[REDACTED]');
      }
      return redacted;
    }
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => redactSecrets(item));
  }

  // Handle objects - deep clone and redact
  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Redact common secret field names
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('token') ||
      lowerKey.includes('apikey') ||
      lowerKey.includes('api_key')
    ) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      // Redact string values
      let redactedValue = value;
      for (const pattern of SENSITIVE_PATTERNS) {
        redactedValue = redactedValue.replace(pattern, '[REDACTED]');
      }
      redacted[key] = redactedValue;
    } else if (typeof value === 'object') {
      // Recursively redact nested objects
      redacted[key] = redactSecrets(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Compute simple diff between before and after states
 * Returns object with changed fields showing { before, after } values
 */
function computeDiff(before: any, after: any): any {
  if (!before || !after) return null;

  const diff: any = {};
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  for (const key of allKeys) {
    const beforeValue = before[key];
    const afterValue = after[key];

    // Compare using JSON stringify for deep comparison
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      diff[key] = {
        before: beforeValue,
        after: afterValue,
      };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Log an audit event
 * 
 * @param input - Audit log details
 * @returns Promise that resolves when log is created (or silently fails)
 * 
 * @example
 * await logAudit({
 *   actor: 'admin',
 *   action: AuditAction.UPDATE,
 *   entityType: AuditEntityType.KNOWLEDGE_SOURCE,
 *   entityId: 'abc123',
 *   before: originalSource,
 *   after: updatedSource,
 *   reason: 'Updated title and URL'
 * });
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    // Redact secrets from before/after states
    const beforeRedacted = input.before ? redactSecrets(input.before) : null;
    const afterRedacted = input.after ? redactSecrets(input.after) : null;

    // Compute diff of changed fields
    const diffComputed = computeDiff(beforeRedacted, afterRedacted);

    // Create audit log entry
    await prisma.knowledgeAuditLog.create({
      data: {
        actor: input.actor,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeJson: beforeRedacted,
        afterJson: afterRedacted,
        diffJson: diffComputed,
        reason: input.reason || null,
      },
    });

    console.log(
      `[AuditLogger] Logged ${input.action} on ${input.entityType}:${input.entityId} by ${input.actor}`
    );
  } catch (error) {
    // Don't throw - audit logging failures shouldn't break operations
    console.error('[AuditLogger] Failed to log audit event:', error);
    console.error('[AuditLogger] Input:', {
      actor: input.actor,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
    });
  }
}

/**
 * Helper function to get audit logs for a specific entity
 * 
 * @param entityType - Type of entity (KNOWLEDGE_SOURCE or KNOWLEDGE_CHUNK)
 * @param entityId - ID of the entity
 * @returns Array of audit logs for the entity
 */
export async function getAuditLogsForEntity(
  entityType: AuditEntityType,
  entityId: string
) {
  return prisma.knowledgeAuditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Helper function to get recent audit logs
 * 
 * @param limit - Maximum number of logs to return
 * @returns Array of recent audit logs
 */
export async function getRecentAuditLogs(limit: number = 50) {
  return prisma.knowledgeAuditLog.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
}
