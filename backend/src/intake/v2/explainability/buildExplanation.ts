/**
 * V2 Explainability — Human-Readable Placement Cards
 *
 * Generates an ExplainabilityCard from a ScoreResult, providing:
 *   - Level label & priority tier
 *   - Per-dimension breakdown with contributors
 *   - Top 3 human-readable factors
 *   - Which placement rule & overrides applied
 *
 * @module intake/v2/explainability
 */

import {
  STABILITY_LEVELS,
  POLICY_PACK_VERSION,
  SCORING_ENGINE_VERSION,
} from "../constants";
import type { ScoreResult, Contributor } from "../scoring/computeScores";

// ── Types ──────────────────────────────────────────────────────

export interface ExplainabilityCard {
  level: number;
  levelLabel: string;
  priorityTier: string;
  totalScore: number;
  dimensions: {
    housing_stability: DimensionExplanation;
    safety_crisis: DimensionExplanation;
    vulnerability_health: DimensionExplanation;
    chronicity_system: DimensionExplanation;
  };
  placementRule: string;
  overridesApplied: string[];
  topFactors: string[];
  generatedAt: string;
  policyPackVersion: string;
  scoringEngineVersion: string;
}

interface DimensionExplanation {
  score: number;
  maxScore: number;
  contributors: Contributor[];
}

// ── Builder ────────────────────────────────────────────────────

/**
 * Build an ExplainabilityCard from a computed ScoreResult.
 *
 * The card is a self-contained JSON structure suitable for:
 *   - Storing in the database (StabilityScore.explainabilityCard)
 *   - Rendering in the frontend
 *   - Including in HMIS/CE exports
 *
 * @param scoreResult - Output from computeScores()
 * @param dvSafeMode - If true, redact specific signal values in the card
 */
export function buildExplanation(
  scoreResult: ScoreResult,
  dvSafeMode: boolean = false,
): ExplainabilityCard {
  const levelInfo = STABILITY_LEVELS[scoreResult.stabilityLevel];

  // Collect all contributors across dimensions, sorted by points desc
  const allContributors: Array<Contributor & { dimension: string }> = [];

  for (const [dimKey, dim] of Object.entries(scoreResult.dimensions)) {
    for (const contributor of dim.contributors) {
      allContributors.push({ ...contributor, dimension: dimKey });
    }
  }

  allContributors.sort((a, b) => b.points - a.points);

  // Top 3 human-readable factors
  const topFactors = allContributors.slice(0, 3).map((c) => c.label);

  // Build dimension explanations (optionally redacted)
  const dimensions = {
    housing_stability: buildDimensionExplanation(
      scoreResult.dimensions.housing_stability,
      dvSafeMode,
    ),
    safety_crisis: buildDimensionExplanation(
      scoreResult.dimensions.safety_crisis,
      dvSafeMode,
    ),
    vulnerability_health: buildDimensionExplanation(
      scoreResult.dimensions.vulnerability_health,
      dvSafeMode,
    ),
    chronicity_system: buildDimensionExplanation(
      scoreResult.dimensions.chronicity_system,
      dvSafeMode,
    ),
  };

  return {
    level: scoreResult.stabilityLevel,
    levelLabel: levelInfo.label,
    priorityTier: scoreResult.priorityTier,
    totalScore: scoreResult.totalScore,
    dimensions,
    placementRule: scoreResult.placementRule,
    overridesApplied: scoreResult.overridesApplied,
    topFactors,
    generatedAt: new Date().toISOString(),
    policyPackVersion: scoreResult.policyPackVersion ?? POLICY_PACK_VERSION,
    scoringEngineVersion: SCORING_ENGINE_VERSION,
  };
}

// ── Helpers ────────────────────────────────────────────────────

/** DV-safe signals that should have their *value* redacted (not the label) */
const DV_SENSITIVE_SIGNALS = new Set([
  "fleeing_dv",
  "fleeing_trafficking",
  "has_protective_order",
  "experienced_violence_recently",
  "feels_safe_current_location",
]);

function buildDimensionExplanation(
  dim: { score: number; maxScore: number; contributors: Contributor[] },
  dvSafeMode: boolean,
): DimensionExplanation {
  const contributors = dim.contributors.map((c) => {
    if (dvSafeMode && DV_SENSITIVE_SIGNALS.has(c.signal)) {
      return { ...c, value: "[REDACTED]" };
    }
    return { ...c };
  });

  return {
    score: dim.score,
    maxScore: dim.maxScore,
    contributors,
  };
}
