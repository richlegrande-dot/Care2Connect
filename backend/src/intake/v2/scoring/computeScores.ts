/**
 * V2 Scoring Engine — Deterministic 4-Dimension Priority Scoring
 *
 * Dimensions (each 0–25, total 0–100):
 *   1. Housing Stability
 *   2. Safety & Crisis Risk
 *   3. Vulnerability & Health
 *   4. Chronicity & System Use
 *
 * All scoring is deterministic — same inputs always produce the same output.
 * No AI/LLM calls. No stochastic components.
 *
 * The engine is policy-driven: all point values, waterfall rules, override
 * rules, and tier thresholds come from the PolicyPack. The engine is a
 * generic evaluator that can run ANY valid pack without code changes.
 *
 * @module intake/v2/scoring
 */

import {
  STABILITY_LEVELS,
  type PriorityTier,
  type StabilityLevel,
} from "../constants";
import {
  type PolicyPack,
  type DimensionKey,
  type WaterfallCondition,
  DEFAULT_POLICY_PACK,
} from "../policy/policyPack";
import { createHash } from "crypto";

// ── Types ──────────────────────────────────────────────────────

export interface IntakeData {
  consent?: Record<string, unknown>;
  demographics?: Record<string, unknown>;
  housing?: Record<string, unknown>;
  safety?: Record<string, unknown>;
  health?: Record<string, unknown>;
  history?: Record<string, unknown>;
  income?: Record<string, unknown>;
  goals?: Record<string, unknown>;
}

export interface DimensionScore {
  score: number;
  maxScore: number;
  contributors: Contributor[];
}

export interface Contributor {
  signal: string;
  value: string;
  points: number;
  label: string;
}

export interface ScoreResult {
  dimensions: {
    housing_stability: DimensionScore;
    safety_crisis: DimensionScore;
    vulnerability_health: DimensionScore;
    chronicity_system: DimensionScore;
  };
  totalScore: number;
  stabilityLevel: StabilityLevel;
  priorityTier: PriorityTier;
  placementRule: string;
  overridesApplied: string[];
  /** Version of the policy pack used for this scoring */
  policyPackVersion: string;
  /** SHA-256 hash of the input data for audit trail reproducibility */
  inputHash: string;
}

// ── Helpers ────────────────────────────────────────────────────

function cap(value: number, max: number): number {
  return Math.min(value, max);
}

function addContributor(
  contributors: Contributor[],
  signal: string,
  value: unknown,
  points: number,
  label: string,
): number {
  if (points > 0) {
    contributors.push({ signal, value: String(value), points, label });
  }
  return points;
}

// ── Dimension Scorers ──────────────────────────────────────────

function scoreHousingStability(
  data: IntakeData,
  pack: PolicyPack,
): DimensionScore {
  const housing = (data.housing ?? {}) as Record<string, unknown>;
  const pm = pack.pointMaps.housing;
  const contributors: Contributor[] = [];
  let raw = 0;

  // Current living situation
  const situation = housing.current_living_situation as string | undefined;
  if (situation && pm.situationPoints[situation] !== undefined) {
    raw += addContributor(
      contributors,
      "current_living_situation",
      situation,
      pm.situationPoints[situation],
      `Current situation: ${situation.replace(/_/g, " ")}`,
    );
  }

  // Duration scoring (only in homeless situations)
  const isHomelessSituation =
    situation && pm.homelessSituations.includes(situation);

  // At risk of losing
  if (housing.at_risk_of_losing === true) {
    raw += addContributor(
      contributors,
      "at_risk_of_losing",
      true,
      pm.atRiskOfLosing,
      "At risk of losing current housing",
    );
  }

  // Eviction notice
  if (housing.eviction_notice === true) {
    raw += addContributor(
      contributors,
      "eviction_notice",
      true,
      pm.evictionNotice,
      "Has eviction notice",
    );
  }

  // Duration (only if in a homeless situation)
  if (isHomelessSituation) {
    const duration = housing.how_long_current as string | undefined;
    if (duration && pm.durationPoints[duration]) {
      raw += addContributor(
        contributors,
        "how_long_current",
        duration,
        pm.durationPoints[duration],
        `Duration in current situation: ${duration.replace(/_/g, " ")}`,
      );
    }
  }

  // Cannot return to previous
  if (housing.can_return_to_previous === false) {
    raw += addContributor(
      contributors,
      "can_return_to_previous",
      false,
      pm.cannotReturnToPrevious,
      "Cannot return to previous housing",
    );
  }

  return {
    score: cap(raw, pack.maxDimensionScore),
    maxScore: pack.maxDimensionScore,
    contributors,
  };
}

function scoreSafetyCrisis(data: IntakeData, pack: PolicyPack): DimensionScore {
  const safety = (data.safety ?? {}) as Record<string, unknown>;
  const pm = pack.pointMaps.safety;
  const contributors: Contributor[] = [];
  let raw = 0;

  if (safety.fleeing_dv === true) {
    raw += addContributor(
      contributors,
      "fleeing_dv",
      true,
      pm.fleeingDv,
      "Fleeing domestic violence",
    );
  }
  if (safety.fleeing_trafficking === true) {
    raw += addContributor(
      contributors,
      "fleeing_trafficking",
      true,
      pm.fleeingTrafficking,
      "Fleeing trafficking",
    );
  }
  if (safety.suicidal_ideation_recent === true) {
    raw += addContributor(
      contributors,
      "suicidal_ideation_recent",
      true,
      pm.suicidalIdeationRecent,
      "Recent suicidal ideation",
    );
  }
  if (safety.experienced_violence_recently === true) {
    raw += addContributor(
      contributors,
      "experienced_violence_recently",
      true,
      pm.experiencedViolenceRecently,
      "Experienced violence recently",
    );
  }

  const safetyFeeling = safety.feels_safe_current_location as
    | string
    | undefined;
  if (safetyFeeling && pm.feelsSafe[safetyFeeling] !== undefined) {
    const pts = pm.feelsSafe[safetyFeeling];
    if (pts > 0) {
      raw += addContributor(
        contributors,
        "feels_safe_current_location",
        safetyFeeling,
        pts,
        safetyFeeling === "no"
          ? "Does not feel safe at current location"
          : "Only sometimes feels safe",
      );
    }
  }

  const mentalHealth = safety.mental_health_current as string | undefined;
  if (mentalHealth && pm.mentalHealth[mentalHealth] !== undefined) {
    const pts = pm.mentalHealth[mentalHealth];
    if (pts > 0) {
      raw += addContributor(
        contributors,
        "mental_health_current",
        mentalHealth,
        pts,
        `Mental health: ${mentalHealth.replace(/_/g, " ")}`,
      );
    }
  }

  const substance = safety.substance_use_current as string | undefined;
  if (substance && pm.substanceUse[substance] !== undefined) {
    const pts = pm.substanceUse[substance];
    if (pts > 0) {
      raw += addContributor(
        contributors,
        "substance_use_current",
        substance,
        pts,
        substance === "regular"
          ? "Regular substance use"
          : "Seeking substance use treatment",
      );
    }
  }

  if (safety.has_protective_order === true) {
    raw += addContributor(
      contributors,
      "has_protective_order",
      true,
      pm.protectiveOrder,
      "Has protective order",
    );
  }

  return {
    score: cap(raw, pack.maxDimensionScore),
    maxScore: pack.maxDimensionScore,
    contributors,
  };
}

function scoreVulnerabilityHealth(
  data: IntakeData,
  pack: PolicyPack,
): DimensionScore {
  const health = (data.health ?? {}) as Record<string, unknown>;
  const demographics = (data.demographics ?? {}) as Record<string, unknown>;
  const pm = pack.pointMaps.vulnerability;
  const contributors: Contributor[] = [];
  let raw = 0;

  // Chronic conditions count
  const conditions = (health.chronic_conditions as string[] | undefined) ?? [];
  const meaningfulConditions = conditions.filter((c) => c !== "none");
  if (meaningfulConditions.length >= 3) {
    raw += addContributor(
      contributors,
      "chronic_conditions",
      `${meaningfulConditions.length} conditions`,
      pm.chronicConditions.threeOrMore,
      "3+ chronic health conditions",
    );
  } else if (meaningfulConditions.length >= 1) {
    raw += addContributor(
      contributors,
      "chronic_conditions",
      `${meaningfulConditions.length} condition(s)`,
      pm.chronicConditions.oneOrTwo,
      "1–2 chronic health conditions",
    );
  }

  if (health.currently_pregnant === true) {
    raw += addContributor(
      contributors,
      "currently_pregnant",
      true,
      pm.currentlyPregnant,
      "Currently pregnant",
    );
  }
  if (health.needs_immediate_medical === true) {
    raw += addContributor(
      contributors,
      "needs_immediate_medical",
      true,
      pm.needsImmediateMedical,
      "Needs immediate medical attention",
    );
  }
  if (
    health.needs_medication === true &&
    health.has_access_to_medication === false
  ) {
    raw += addContributor(
      contributors,
      "medication_access",
      "no_access",
      pm.medicationNoAccess,
      "Needs medication but lacks access",
    );
  }

  // Self-care difficulty
  const selfCare = health.self_care_difficulty as string | undefined;
  if (selfCare && pm.selfCare[selfCare] !== undefined) {
    const pts = pm.selfCare[selfCare];
    if (pts > 0) {
      const labels: Record<string, string> = {
        unable_without_help: "Unable to self-care without help",
        significant_difficulty: "Significant difficulty with self-care",
        some_difficulty: "Some difficulty with self-care",
      };
      raw += addContributor(
        contributors,
        "self_care_difficulty",
        selfCare,
        pts,
        labels[selfCare] ??
          `Self-care difficulty: ${selfCare.replace(/_/g, " ")}`,
      );
    }
  }

  if (health.has_health_insurance === false) {
    raw += addContributor(
      contributors,
      "has_health_insurance",
      false,
      pm.noHealthInsurance,
      "No health insurance",
    );
  }

  const lastVisit = health.last_medical_visit as string | undefined;
  if (lastVisit === "over_1_year" || lastVisit === "never") {
    raw += addContributor(
      contributors,
      "last_medical_visit",
      lastVisit,
      pm.noRecentMedicalVisit,
      "No recent medical visit",
    );
  }

  // Age-based vulnerability
  const dob = demographics.date_of_birth as string | undefined;
  if (dob) {
    const age = calculateAge(dob);
    if (age !== null) {
      if (age < pm.youthAge.maxAge) {
        raw += addContributor(
          contributors,
          "age_youth",
          `${age}`,
          pm.youthAge.points,
          `Youth (under ${pm.youthAge.maxAge})`,
        );
      } else if (age >= pm.seniorAge.minAge) {
        raw += addContributor(
          contributors,
          "age_senior",
          `${age}`,
          pm.seniorAge.points,
          `Senior (${pm.seniorAge.minAge}+)`,
        );
      }
    }
  }

  // Dependents
  if (demographics.has_dependents === true) {
    const depAges = (demographics.dependent_ages as number[] | undefined) ?? [];
    if (depAges.length > 0 || demographics.has_dependents === true) {
      raw += addContributor(
        contributors,
        "has_dependents",
        true,
        pm.hasDependents,
        "Has dependent children",
      );
    }
  }

  return {
    score: cap(raw, pack.maxDimensionScore),
    maxScore: pack.maxDimensionScore,
    contributors,
  };
}

function scoreChronicitySystem(
  data: IntakeData,
  pack: PolicyPack,
): DimensionScore {
  const history = (data.history ?? {}) as Record<string, unknown>;
  const income = (data.income ?? {}) as Record<string, unknown>;
  const pm = pack.pointMaps.chronicity;
  const contributors: Contributor[] = [];
  let raw = 0;

  if (history.currently_chronic === true) {
    raw += addContributor(
      contributors,
      "currently_chronic",
      true,
      pm.currentlyChronic,
      "Chronically homeless (12+ months or 4+ episodes)",
    );
  }

  const episodes = history.total_homeless_episodes as number | undefined;
  if (episodes !== undefined) {
    if (episodes >= 4) {
      raw += addContributor(
        contributors,
        "total_homeless_episodes",
        `${episodes}`,
        pm.episodes.fourOrMore,
        `${episodes} episodes of homelessness`,
      );
    } else if (episodes >= 2) {
      raw += addContributor(
        contributors,
        "total_homeless_episodes",
        `${episodes}`,
        pm.episodes.twoOrMore,
        `${episodes} episodes of homelessness`,
      );
    }
  }

  const months = history.total_homeless_months as number | undefined;
  if (months !== undefined) {
    if (months >= 24) {
      raw += addContributor(
        contributors,
        "total_homeless_months",
        `${months}`,
        pm.months.twentyFourOrMore,
        `${months} total months homeless`,
      );
    } else if (months >= 12) {
      raw += addContributor(
        contributors,
        "total_homeless_months",
        `${months}`,
        pm.months.twelveOrMore,
        `${months} total months homeless`,
      );
    }
  }

  const erUse = history.emergency_services_use as string | undefined;
  if (erUse && pm.emergencyServices[erUse] !== undefined) {
    const pts = pm.emergencyServices[erUse];
    if (pts > 0) {
      raw += addContributor(
        contributors,
        "emergency_services_use",
        erUse,
        pts,
        erUse === "6_plus_times"
          ? "6+ emergency service uses in 6 months"
          : "3–5 emergency service uses in 6 months",
      );
    }
  }

  if (history.incarceration_recent === true) {
    raw += addContributor(
      contributors,
      "incarceration_recent",
      true,
      pm.incarcerationRecent,
      "Recently released from incarceration",
    );
  }

  const institutions =
    (history.institutional_history as string[] | undefined) ?? [];
  const meaningfulInst = institutions.filter((i) => i !== "none");
  if (meaningfulInst.length >= 2) {
    raw += addContributor(
      contributors,
      "institutional_history",
      `${meaningfulInst.length} types`,
      pm.institutionalHistory.twoOrMore,
      "2+ types of institutional history",
    );
  } else if (meaningfulInst.length === 1) {
    raw += addContributor(
      contributors,
      "institutional_history",
      meaningfulInst[0],
      pm.institutionalHistory.one,
      "Institutional history",
    );
  }

  if (income.has_any_income === false) {
    raw += addContributor(
      contributors,
      "has_any_income",
      false,
      pm.noIncome,
      "No income",
    );
  }
  if (income.has_valid_id === false) {
    raw += addContributor(
      contributors,
      "has_valid_id",
      false,
      pm.noValidId,
      "No valid ID",
    );
  }

  return {
    score: cap(raw, pack.maxDimensionScore),
    maxScore: pack.maxDimensionScore,
    contributors,
  };
}

// ── Waterfall Evaluator ────────────────────────────────────────

function evaluateCondition(
  cond: WaterfallCondition,
  scores: Record<DimensionKey, number>,
): boolean {
  const score = scores[cond.dimension];
  switch (cond.operator) {
    case ">=":
      return score >= cond.threshold;
    case "<=":
      return score <= cond.threshold;
    case ">":
      return score > cond.threshold;
    case "<":
      return score < cond.threshold;
    default:
      return false;
  }
}

/**
 * Evaluate waterfall rules from the policy pack.
 * First matching rule wins. Default is Level 5.
 */
function determineLevel(
  scores: Record<DimensionKey, number>,
  pack: PolicyPack,
): { level: StabilityLevel; rule: string } {
  for (const rule of pack.waterfallRules) {
    const conditionsPass =
      rule.conditions.length === 0 ||
      rule.conditions.every((c) => evaluateCondition(c, scores));
    const anyOfPass =
      !rule.anyOf ||
      rule.anyOf.length === 0 ||
      rule.anyOf.some((c) => evaluateCondition(c, scores));
    if (conditionsPass && anyOfPass) {
      return { level: rule.level, rule: rule.description };
    }
  }
  return { level: 5, rule: "default → Level 5" };
}

// ── Override Evaluator ─────────────────────────────────────────

/**
 * Apply all matching override rules from the policy pack.
 * Each override sets a floor — level can only improve (decrease numerically).
 */
function applyOverrides(
  level: StabilityLevel,
  data: IntakeData,
  pack: PolicyPack,
): { level: StabilityLevel; overrides: string[] } {
  const overrides: string[] = [];
  let finalLevel = level;

  for (const rule of pack.overrideRules) {
    // Check all field conditions
    const fieldsMatch = rule.fieldChecks.every((check) => {
      const moduleData = (data as Record<string, unknown>)[check.module] as
        | Record<string, unknown>
        | undefined;
      return (
        moduleData !== undefined && moduleData[check.field] === check.value
      );
    });

    // Check age condition if present
    let ageMatch = true;
    if (rule.ageCheck) {
      const demographics = (data.demographics ?? {}) as Record<string, unknown>;
      const dob = demographics.date_of_birth as string | undefined;
      if (dob) {
        const age = calculateAge(dob);
        if (age !== null) {
          switch (rule.ageCheck.operator) {
            case "<":
              ageMatch = age < rule.ageCheck.age;
              break;
            case ">=":
              ageMatch = age >= rule.ageCheck.age;
              break;
            case "<=":
              ageMatch = age <= rule.ageCheck.age;
              break;
            case ">":
              ageMatch = age > rule.ageCheck.age;
              break;
          }
        } else {
          ageMatch = false;
        }
      } else {
        ageMatch = false;
      }
    }

    if (fieldsMatch && ageMatch && finalLevel > rule.floorLevel) {
      finalLevel = rule.floorLevel as StabilityLevel;
      overrides.push(rule.description);
    }
  }

  return { level: finalLevel, overrides };
}

// ── Priority Tier ──────────────────────────────────────────────

function determinePriorityTier(
  totalScore: number,
  pack: PolicyPack,
): PriorityTier {
  if (totalScore >= pack.tierThresholds.CRITICAL) return "CRITICAL";
  if (totalScore >= pack.tierThresholds.HIGH) return "HIGH";
  if (totalScore >= pack.tierThresholds.MODERATE) return "MODERATE";
  return "LOWER";
}

// ── Utility ────────────────────────────────────────────────────

/**
 * Deterministic JSON serialization with sorted keys at all levels.
 * Ensures the same input always produces the same string regardless
 * of property insertion order.
 */
function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  const entries = sorted.map(
    (k) =>
      `${JSON.stringify(k)}:${stableStringify((obj as Record<string, unknown>)[k])}`,
  );
  return `{${entries.join(",")}}`;
}

function calculateAge(dob: string): number | null {
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

// ── Main Entry Point ───────────────────────────────────────────

/**
 * Compute the 4-dimension priority score and stability level placement.
 *
 * Pure function — deterministic, no side effects, no external calls.
 *
 * @param data  - Intake module responses
 * @param pack  - Policy pack (defaults to DEFAULT_POLICY_PACK)
 */
export function computeScores(
  data: IntakeData,
  pack: PolicyPack = DEFAULT_POLICY_PACK,
): ScoreResult {
  const housing_stability = scoreHousingStability(data, pack);
  const safety_crisis = scoreSafetyCrisis(data, pack);
  const vulnerability_health = scoreVulnerabilityHealth(data, pack);
  const chronicity_system = scoreChronicitySystem(data, pack);

  const totalScore =
    housing_stability.score +
    safety_crisis.score +
    vulnerability_health.score +
    chronicity_system.score;

  // Build dimension score map for waterfall evaluation
  const scores: Record<DimensionKey, number> = {
    housing_stability: housing_stability.score,
    safety_crisis: safety_crisis.score,
    vulnerability_health: vulnerability_health.score,
    chronicity_system: chronicity_system.score,
  };

  // Determine level via policy-driven waterfall
  const { level: waterfallLevel, rule: placementRule } = determineLevel(
    scores,
    pack,
  );

  // Apply override floors from policy pack
  const { level: finalLevel, overrides: overridesApplied } = applyOverrides(
    waterfallLevel,
    data,
    pack,
  );

  // Priority tier from total score (but can be elevated by level)
  let priorityTier = determinePriorityTier(totalScore, pack);

  // Ensure level-based tier consistency
  const levelInfo = STABILITY_LEVELS[finalLevel];
  const levelTier = levelInfo.tier;
  const tierRank: Record<PriorityTier, number> = {
    CRITICAL: 3,
    HIGH: 2,
    MODERATE: 1,
    LOWER: 0,
  };
  if (tierRank[levelTier] > tierRank[priorityTier]) {
    priorityTier = levelTier;
  }

  // Compute input hash for audit trail (deterministic JSON serialization)
  const inputHash = createHash("sha256")
    .update(stableStringify(data))
    .digest("hex")
    .slice(0, 16);

  return {
    dimensions: {
      housing_stability,
      safety_crisis,
      vulnerability_health,
      chronicity_system,
    },
    totalScore,
    stabilityLevel: finalLevel,
    priorityTier,
    placementRule:
      overridesApplied.length > 0
        ? `${placementRule} (overridden: ${overridesApplied.join("; ")})`
        : placementRule,
    overridesApplied,
    policyPackVersion: pack.version,
    inputHash,
  };
}
