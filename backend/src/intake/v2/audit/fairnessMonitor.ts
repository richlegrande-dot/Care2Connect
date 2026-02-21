/**
 * Fairness & Audit Monitoring — Aggregate Bias Detection
 *
 * Implements aggregate-only fairness monitoring per docs/V2_INTK_SPEC.md Section 9.
 * Individual demographic data is NEVER used in scoring — this module only
 * analyzes completed session outcomes in aggregate to detect systemic bias.
 *
 * Monitoring dimensions:
 *   - Score distribution by race_ethnicity, gender, veteran_status
 *   - Priority tier distribution by demographic group
 *   - Statistical outlier detection
 *
 * Audit events:
 *   - INTAKE_STARTED
 *   - MODULE_COMPLETED
 *   - SCORE_COMPUTED
 *   - PLAN_GENERATED
 *   - INTAKE_ABANDONED
 *
 * @module intake/v2/audit
 */

// ── Audit Event Types ──────────────────────────────────────────

export type AuditEventType =
  | 'INTAKE_STARTED'
  | 'MODULE_COMPLETED'
  | 'SCORE_COMPUTED'
  | 'PLAN_GENERATED'
  | 'INTAKE_ABANDONED';

export interface AuditEvent {
  eventType: AuditEventType;
  timestamp: string;
  sessionId: string;
  data: Record<string, unknown>;
}

// ── Audit Trail ────────────────────────────────────────────────

/**
 * In-memory audit log for this process lifetime.
 * In production, this would be backed by a database table.
 */
const auditLog: AuditEvent[] = [];

/**
 * Record an audit event.
 */
export function recordAuditEvent(
  eventType: AuditEventType,
  sessionId: string,
  data: Record<string, unknown> = {}
): AuditEvent {
  const event: AuditEvent = {
    eventType,
    timestamp: new Date().toISOString(),
    sessionId,
    data,
  };
  auditLog.push(event);
  return event;
}

/**
 * Get all audit events, optionally filtered by type.
 */
export function getAuditEvents(filter?: {
  eventType?: AuditEventType;
  sessionId?: string;
  since?: string;
}): AuditEvent[] {
  let events = [...auditLog];

  if (filter?.eventType) {
    events = events.filter(e => e.eventType === filter.eventType);
  }
  if (filter?.sessionId) {
    events = events.filter(e => e.sessionId === filter.sessionId);
  }
  if (filter?.since) {
    const sinceDate = new Date(filter.since);
    events = events.filter(e => new Date(e.timestamp) >= sinceDate);
  }

  return events;
}

/**
 * Clear the audit log (for testing only).
 */
export function clearAuditLog(): void {
  auditLog.length = 0;
}

// ── Fairness Monitoring ────────────────────────────────────────

export type DemographicDimension = 'race_ethnicity' | 'gender' | 'veteran_status';

export interface GroupDistribution {
  groupValue: string;
  count: number;
  meanScore: number;
  medianScore: number;
  tierDistribution: Record<string, number>;
}

export interface FairnessReport {
  dimension: DemographicDimension;
  totalSessions: number;
  groups: GroupDistribution[];
  overallMeanScore: number;
  maxGroupDeviation: number;
  /** True if any group's mean deviates > threshold from overall mean */
  potentialBiasDetected: boolean;
  generatedAt: string;
}

export interface CompletedSessionSummary {
  demographics: Record<string, unknown>;
  totalScore: number;
  priorityTier: string;
}

/**
 * Default threshold for flagging potential bias.
 * If any demographic group's mean score deviates more than this
 * from the overall mean, a bias warning is raised.
 */
const BIAS_THRESHOLD = 10; // points on 0-100 scale

/**
 * Compute median of a sorted numeric array.
 */
function computeMedian(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Analyze fairness for a single demographic dimension.
 *
 * Groups completed sessions by the specified demographic field
 * and computes score distributions per group.
 *
 * @param sessions - Array of completed session summaries
 * @param dimension - Demographic field to analyze
 * @returns Fairness report for the dimension
 */
export function analyzeFairness(
  sessions: CompletedSessionSummary[],
  dimension: DemographicDimension
): FairnessReport {
  // Group sessions by demographic value
  const groups = new Map<string, { scores: number[]; tiers: string[] }>();

  for (const session of sessions) {
    const value = session.demographics[dimension];
    const groupKey = value != null ? String(value) : 'unknown';

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { scores: [], tiers: [] });
    }
    const group = groups.get(groupKey)!;
    group.scores.push(session.totalScore);
    group.tiers.push(session.priorityTier);
  }

  // Compute overall mean
  const allScores = sessions.map(s => s.totalScore);
  const overallMean = allScores.length > 0
    ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    : 0;

  // Build group distributions
  const groupDistributions: GroupDistribution[] = [];
  let maxDeviation = 0;

  for (const [groupValue, { scores, tiers }] of groups.entries()) {
    const sorted = [...scores].sort((a, b) => a - b);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const median = computeMedian(sorted);

    // Count tier distribution
    const tierDist: Record<string, number> = {};
    for (const tier of tiers) {
      tierDist[tier] = (tierDist[tier] || 0) + 1;
    }

    const deviation = Math.abs(mean - overallMean);
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
    }

    groupDistributions.push({
      groupValue,
      count: scores.length,
      meanScore: Math.round(mean * 100) / 100,
      medianScore: median,
      tierDistribution: tierDist,
    });
  }

  // Sort groups by count descending
  groupDistributions.sort((a, b) => b.count - a.count);

  return {
    dimension,
    totalSessions: sessions.length,
    groups: groupDistributions,
    overallMeanScore: Math.round(overallMean * 100) / 100,
    maxGroupDeviation: Math.round(maxDeviation * 100) / 100,
    potentialBiasDetected: maxDeviation > BIAS_THRESHOLD,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Run fairness analysis across all monitored dimensions.
 *
 * @param sessions - Array of completed session summaries
 * @returns Array of fairness reports, one per dimension
 */
export function runFullFairnessAnalysis(
  sessions: CompletedSessionSummary[]
): FairnessReport[] {
  const dimensions: DemographicDimension[] = ['race_ethnicity', 'gender', 'veteran_status'];
  return dimensions.map(dim => analyzeFairness(sessions, dim));
}
