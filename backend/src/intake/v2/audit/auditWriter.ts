/**
 * Durable Audit Writer — DB-backed audit trail per sessionId
 *
 * Writes structured, redaction-safe audit events to PostgreSQL via Prisma.
 * NEVER stores raw module payloads, demographics, DV answers, or medical details.
 *
 * Allowlisted meta keys guarantee PII/PHI safety.
 *
 * @module intake/v2/audit/auditWriter
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// ── Event Types ────────────────────────────────────────────────

export type V2AuditEventType =
  | 'INTAKE_STARTED'
  | 'MODULE_SAVED'
  | 'REVIEW_ENTERED'
  | 'INTAKE_SUBMITTED'
  | 'SCORE_COMPUTED'
  | 'PLAN_GENERATED'
  | 'SESSION_COMPLETED'
  | 'SESSION_COMPLETE_IDEMPOTENT_HIT'
  | 'SESSION_COMPLETE_FAILED';

// ── Meta Allowlist ─────────────────────────────────────────────

/**
 * STRICTLY allowlisted keys for the `meta` JSON field.
 * Any key NOT in this set is stripped before persistence.
 * This guarantees no PII, PHI, DV answers, or demographic data leaks.
 */
const META_ALLOWLIST = new Set<string>([
  // Module metadata (never raw data)
  'moduleId',
  'isRequired',
  'isComplete',
  'completedModuleCount',
  'totalModuleCount',

  // Scoring metadata (aggregates only)
  'totalScore',
  'stabilityLevel',
  'priorityTier',
  'policyPackVersion',
  'scoringEngineVersion',
  'inputHashPrefix',

  // Dimension scores (aggregates)
  'housing_stability',
  'safety_crisis',
  'vulnerability_health',
  'chronicity_system',

  // Action plan metadata (counts only)
  'immediateTaskCount',
  'shortTermTaskCount',
  'mediumTermTaskCount',
  'totalTaskCount',

  // Timing / performance
  'durationMs',
  'stage',

  // Error metadata (safe codes only, no stack traces)
  'errorCode',
  'errorMessage',

  // Request context
  'requestId',
  'correlationId',

  // DV-safe flag (boolean only)
  'dvSafeMode',
  'sensitiveDataRedacted',
]);

/**
 * Maximum length for string values in meta. Prevents accidental large payloads.
 */
const MAX_META_STRING_LENGTH = 200;

// ── Helper: sanitize meta ──────────────────────────────────────

/**
 * Strip any key not in the allowlist. Truncate long strings.
 * Recursively handle one level of nesting for dimension scores.
 */
function sanitizeMeta(raw: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!META_ALLOWLIST.has(key)) continue;
    if (typeof value === 'string') {
      clean[key] = value.length > MAX_META_STRING_LENGTH
        ? value.slice(0, MAX_META_STRING_LENGTH) + '...'
        : value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value;
    } else if (value === null || value === undefined) {
      clean[key] = null;
    } else {
      // Skip complex objects — only primitives allowed in meta
      clean[key] = String(value).slice(0, MAX_META_STRING_LENGTH);
    }
  }
  return clean;
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Generate a new correlation/request ID for a request lifecycle.
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Write a single audit event to the database.
 *
 * @param sessionId  - The V2IntakeSession CUID
 * @param eventType  - One of the defined V2AuditEventType values
 * @param meta       - Metadata object (will be sanitized via allowlist)
 * @param requestId  - Optional correlationId for grouping events in a request
 */
export async function writeAuditEvent(
  sessionId: string,
  eventType: V2AuditEventType,
  meta: Record<string, unknown> = {},
  requestId?: string
): Promise<void> {
  try {
    const safeMeta = sanitizeMeta(meta);
    await prisma.v2IntakeAuditEvent.create({
      data: {
        sessionId,
        eventType,
        requestId: requestId ?? null,
        meta: safeMeta as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    // Audit write must never crash the main flow — log and continue
    console.error(`[AuditWriter] Failed to write ${eventType} for session ${sessionId}:`, err);
  }
}

/**
 * Write multiple audit events in a single transaction.
 * Used during the completion pipeline to log all stages atomically.
 */
export async function writeAuditEventsBatch(
  events: Array<{
    sessionId: string;
    eventType: V2AuditEventType;
    meta?: Record<string, unknown>;
    requestId?: string;
  }>
): Promise<void> {
  try {
    await prisma.$transaction(
      events.map(e =>
        prisma.v2IntakeAuditEvent.create({
          data: {
            sessionId: e.sessionId,
            eventType: e.eventType,
            requestId: e.requestId ?? null,
            meta: sanitizeMeta(e.meta ?? {}) as unknown as Prisma.InputJsonValue,
          },
        })
      )
    );
  } catch (err) {
    console.error('[AuditWriter] Failed to write batch audit events:', err);
  }
}

/**
 * Fetch audit events for a session, newest-first.
 *
 * @param sessionId - The V2IntakeSession CUID
 * @param limit     - Max events to return (default 50)
 */
export async function getSessionAuditEvents(
  sessionId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  eventType: string;
  requestId: string | null;
  meta: unknown;
  createdAt: Date;
}>> {
  return prisma.v2IntakeAuditEvent.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      eventType: true,
      requestId: true,
      meta: true,
      createdAt: true,
    },
  });
}

/**
 * Count audit events for a session (for profile endpoint).
 */
export async function countSessionAuditEvents(
  sessionId: string
): Promise<{ count: number; lastEventType: string | null }> {
  const [count, lastEvent] = await Promise.all([
    prisma.v2IntakeAuditEvent.count({ where: { sessionId } }),
    prisma.v2IntakeAuditEvent.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      select: { eventType: true },
    }),
  ]);
  return { count, lastEventType: lastEvent?.eventType ?? null };
}
