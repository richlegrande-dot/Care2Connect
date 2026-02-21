/**
 * V2 Calibration Report Generator — Clinical Scoring Calibration
 *
 * Generates aggregate statistics from completed intake sessions for
 * clinical stakeholder review sessions. This module is strictly read-only —
 * it NEVER modifies intake data.
 *
 * Outputs:
 *   - Distribution of Stability Levels
 *   - Distribution of Priority Tiers
 *   - Mean and median total scores
 *   - Dimension-level averages
 *   - Override frequency counts
 *   - Top 10 scoring contributors by frequency
 *   - Tier vs Level cross-matrix
 *
 * All output is deterministic — same inputs always produce the same report.
 *
 * @module intake/v2/calibration
 */

import { POLICY_PACK_VERSION, SCORING_ENGINE_VERSION } from "../constants";
import type {
  CalibrationSession,
  CalibrationReport,
  DimensionAverage,
  OverrideFrequency,
  ContributorFrequency,
  TierLevelCell,
} from "./calibrationTypes";

// ── Helper Functions ───────────────────────────────────────────

/**
 * Calculate the median of a sorted array of numbers.
 * Returns 0 for empty arrays.
 */
export function computeMedian(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate the mean of an array of numbers.
 * Returns 0 for empty arrays.
 */
export function computeMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate the population standard deviation.
 * Returns 0 for empty arrays.
 */
export function computeStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(variance);
}

// ── Main Report Generator ──────────────────────────────────────

/**
 * Generate a calibration report from completed intake sessions.
 *
 * This function is pure — it takes data in and returns a report.
 * No side effects, no database calls, no mutations.
 *
 * @param sessions Array of completed session summaries
 * @returns CalibrationReport with aggregate statistics
 */
export function generateCalibrationReport(
  sessions: CalibrationSession[],
): CalibrationReport {
  const n = sessions.length;

  if (n === 0) {
    return {
      totalSessions: 0,
      levelDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      tierDistribution: { CRITICAL: 0, HIGH: 0, MODERATE: 0, LOWER: 0 },
      meanTotalScore: 0,
      medianTotalScore: 0,
      stdDevTotalScore: 0,
      minTotalScore: 0,
      maxTotalScore: 0,
      dimensionAverages: [
        { dimension: "housing", mean: 0, median: 0, min: 0, max: 0, stdDev: 0 },
        { dimension: "safety", mean: 0, median: 0, min: 0, max: 0, stdDev: 0 },
        {
          dimension: "vulnerability",
          mean: 0,
          median: 0,
          min: 0,
          max: 0,
          stdDev: 0,
        },
        {
          dimension: "chronicity",
          mean: 0,
          median: 0,
          min: 0,
          max: 0,
          stdDev: 0,
        },
      ],
      overrideFrequency: [],
      topContributorsByFrequency: [],
      tierVsLevelMatrix: [],
      policyPackVersion: POLICY_PACK_VERSION,
      scoringEngineVersion: SCORING_ENGINE_VERSION,
      generatedAt: new Date().toISOString(),
    };
  }

  // ── Total Score Statistics ─────────────────────────────────

  const totalScores = sessions.map((s) => s.totalScore).sort((a, b) => a - b);
  const meanTotal = computeMean(totalScores);
  const medianTotal = computeMedian(totalScores);
  const stdDevTotal = computeStdDev(totalScores, meanTotal);
  const minTotal = totalScores[0];
  const maxTotal = totalScores[totalScores.length - 1];

  // ── Level Distribution ─────────────────────────────────────

  const levelDistribution: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const s of sessions) {
    const level = s.stabilityLevel;
    if (level >= 0 && level <= 5) {
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
    }
  }

  // ── Tier Distribution ──────────────────────────────────────

  const tierDistribution: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MODERATE: 0,
    LOWER: 0,
  };
  for (const s of sessions) {
    const tier = s.priorityTier;
    if (tier in tierDistribution) {
      tierDistribution[tier] += 1;
    }
  }

  // ── Dimension Averages ─────────────────────────────────────

  const dimensions = [
    "housing",
    "safety",
    "vulnerability",
    "chronicity",
  ] as const;
  const dimensionAverages: DimensionAverage[] = dimensions.map((dim) => {
    const values = sessions
      .map((s) => s.dimensionScores[dim])
      .sort((a, b) => a - b);
    const mean = computeMean(values);
    return {
      dimension: dim,
      mean,
      median: computeMedian(values),
      min: values[0],
      max: values[values.length - 1],
      stdDev: computeStdDev(values, mean),
    };
  });

  // ── Override Frequency ─────────────────────────────────────

  const overrideCounts: Record<string, number> = {};
  for (const s of sessions) {
    for (const override of s.overridesApplied) {
      overrideCounts[override] = (overrideCounts[override] || 0) + 1;
    }
  }

  const overrideFrequency: OverrideFrequency[] = Object.entries(overrideCounts)
    .map(([override, count]) => ({
      override,
      count,
      percentage: Math.round((count / n) * 10000) / 100,
    }))
    .sort((a, b) => b.count - a.count);

  // ── Top Contributors by Frequency ──────────────────────────

  const contributorCounts: Record<string, number> = {};
  for (const s of sessions) {
    for (const contrib of s.topContributors) {
      contributorCounts[contrib] = (contributorCounts[contrib] || 0) + 1;
    }
  }

  const topContributorsByFrequency: ContributorFrequency[] = Object.entries(
    contributorCounts,
  )
    .map(([contributor, count]) => ({
      contributor,
      count,
      percentage: Math.round((count / n) * 10000) / 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Tier vs Level Cross-Matrix ─────────────────────────────

  const matrixCounts: Record<string, number> = {};
  for (const s of sessions) {
    const key = `${s.priorityTier}:${s.stabilityLevel}`;
    matrixCounts[key] = (matrixCounts[key] || 0) + 1;
  }

  const tierVsLevelMatrix: TierLevelCell[] = [];
  const tiers = ["CRITICAL", "HIGH", "MODERATE", "LOWER"];
  const levels = [0, 1, 2, 3, 4, 5];

  for (const tier of tiers) {
    for (const level of levels) {
      const key = `${tier}:${level}`;
      const count = matrixCounts[key] || 0;
      if (count > 0) {
        tierVsLevelMatrix.push({
          tier,
          level,
          count,
          percentage: Math.round((count / n) * 10000) / 100,
        });
      }
    }
  }

  return {
    totalSessions: n,
    levelDistribution,
    tierDistribution,
    meanTotalScore: meanTotal,
    medianTotalScore: medianTotal,
    stdDevTotalScore: stdDevTotal,
    minTotalScore: minTotal,
    maxTotalScore: maxTotal,
    dimensionAverages,
    overrideFrequency,
    topContributorsByFrequency,
    tierVsLevelMatrix,
    policyPackVersion: POLICY_PACK_VERSION,
    scoringEngineVersion: SCORING_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
  };
}
