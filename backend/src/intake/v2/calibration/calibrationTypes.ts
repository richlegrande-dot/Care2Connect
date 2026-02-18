/**
 * V2 Calibration Types — Clinical Scoring Calibration Framework
 *
 * Types used by the calibration report generator.
 * These are read-only aggregate types — no mutation of intake data.
 *
 * @module intake/v2/calibration
 */

/** Input session data for calibration analysis */
export interface CalibrationSession {
  totalScore: number;
  stabilityLevel: number;
  priorityTier: string;
  dimensionScores: {
    housing: number;
    safety: number;
    vulnerability: number;
    chronicity: number;
  };
  overridesApplied: string[];
  topContributors: string[];
}

/** Per-dimension statistics */
export interface DimensionAverage {
  dimension: string;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

/** Override usage frequency */
export interface OverrideFrequency {
  override: string;
  count: number;
  percentage: number;
}

/** Contributor frequency */
export interface ContributorFrequency {
  contributor: string;
  count: number;
  percentage: number;
}

/** Cross-matrix entry: Tier vs Level */
export interface TierLevelCell {
  tier: string;
  level: number;
  count: number;
  percentage: number;
}

/** Full calibration report */
export interface CalibrationReport {
  /** Total number of sessions analyzed */
  totalSessions: number;

  /** Distribution of sessions by Stability Level (0–5) */
  levelDistribution: Record<number, number>;

  /** Distribution of sessions by Priority Tier */
  tierDistribution: Record<string, number>;

  /** Mean total score across all sessions */
  meanTotalScore: number;

  /** Median total score across all sessions */
  medianTotalScore: number;

  /** Standard deviation of total scores */
  stdDevTotalScore: number;

  /** Min total score */
  minTotalScore: number;

  /** Max total score */
  maxTotalScore: number;

  /** Per-dimension averages with min/max/stdDev */
  dimensionAverages: DimensionAverage[];

  /** Override frequency counts (sorted by count desc) */
  overrideFrequency: OverrideFrequency[];

  /** Top 10 scoring contributors by frequency */
  topContributorsByFrequency: ContributorFrequency[];

  /** Tier vs Level cross-matrix */
  tierVsLevelMatrix: TierLevelCell[];

  /** Policy pack version used for scoring */
  policyPackVersion: string;

  /** Engine version used for scoring */
  scoringEngineVersion: string;

  /** ISO timestamp of report generation */
  generatedAt: string;
}
