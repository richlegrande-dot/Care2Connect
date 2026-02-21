/**
 * V2 Policy Pack — Scoring Governance Layer
 *
 * The PolicyPack is the single source of truth for all scoring rules:
 *   - Point values for each signal in each dimension
 *   - Waterfall rules for stability-level placement
 *   - Override rules (floor adjustments for specific populations)
 *   - Priority-tier thresholds
 *
 * Separating policy from engine means scoring rules can be reviewed,
 * versioned, and changed WITHOUT modifying the scoring engine code.
 *
 * @module intake/v2/policy
 */

import type { StabilityLevel } from "../constants";

// ── Point Map Interfaces ───────────────────────────────────────

export interface HousingPointMap {
  /** Points for each current_living_situation value */
  situationPoints: Record<string, number>;
  /** Situations considered "homeless" for duration scoring */
  homelessSituations: string[];
  /** Points for how_long_current duration values (only in homeless situations) */
  durationPoints: Record<string, number>;
  /** Points for at_risk_of_losing === true */
  atRiskOfLosing: number;
  /** Points for eviction_notice === true */
  evictionNotice: number;
  /** Points for can_return_to_previous === false */
  cannotReturnToPrevious: number;
}

export interface SafetyPointMap {
  fleeingDv: number;
  fleeingTrafficking: number;
  suicidalIdeationRecent: number;
  experiencedViolenceRecently: number;
  /** Points for each feels_safe_current_location value */
  feelsSafe: Record<string, number>;
  /** Points for each mental_health_current value */
  mentalHealth: Record<string, number>;
  /** Points for each substance_use_current value */
  substanceUse: Record<string, number>;
  protectiveOrder: number;
}

export interface VulnerabilityPointMap {
  /** Points for chronic condition counts */
  chronicConditions: { threeOrMore: number; oneOrTwo: number };
  currentlyPregnant: number;
  needsImmediateMedical: number;
  /** Points when needs_medication && !has_access_to_medication */
  medicationNoAccess: number;
  /** Points for each self_care_difficulty value */
  selfCare: Record<string, number>;
  noHealthInsurance: number;
  /** Points when last_medical_visit is 'over_1_year' or 'never' */
  noRecentMedicalVisit: number;
  /** Youth age vulnerability */
  youthAge: { maxAge: number; points: number };
  /** Senior age vulnerability */
  seniorAge: { minAge: number; points: number };
  hasDependents: number;
}

export interface ChronicityPointMap {
  currentlyChronic: number;
  /** Points by episode count thresholds */
  episodes: { fourOrMore: number; twoOrMore: number };
  /** Points by total months thresholds */
  months: { twentyFourOrMore: number; twelveOrMore: number };
  /** Points for each emergency_services_use value */
  emergencyServices: Record<string, number>;
  incarcerationRecent: number;
  /** Points by institutional history count */
  institutionalHistory: { twoOrMore: number; one: number };
  noIncome: number;
  noValidId: number;
}

// ── Waterfall Rule Types ───────────────────────────────────────

export type DimensionKey =
  | "housing_stability"
  | "safety_crisis"
  | "vulnerability_health"
  | "chronicity_system";

export interface WaterfallCondition {
  dimension: DimensionKey;
  operator: ">=" | "<=" | ">" | "<";
  threshold: number;
}

/**
 * A waterfall rule — evaluated in order, first matching rule wins.
 *
 * Logic: ALL `conditions` must be true (AND), AND if `anyOf` is present
 * at least ONE `anyOf` condition must also be true (OR within AND).
 */
export interface WaterfallRule {
  level: StabilityLevel;
  /** All must match (AND). Empty array = always passes. */
  conditions: WaterfallCondition[];
  /** Optional: at least one must match (OR). Omit or empty = always passes. */
  anyOf?: WaterfallCondition[];
  description: string;
}

// ── Override Rule Types ────────────────────────────────────────

export interface FieldCheck {
  module: string;
  field: string;
  value: unknown;
}

/**
 * An override rule sets a floor on the stability level.
 * All fieldChecks (AND) + ageCheck (if present) must match.
 * If the current level is worse (higher number) than floorLevel,
 * the level is raised (lowered numerically) to floorLevel.
 */
export interface OverrideRule {
  id: string;
  floorLevel: StabilityLevel;
  description: string;
  /** All field checks must match (AND) */
  fieldChecks: FieldCheck[];
  /** Optional age-based check (requires demographics.date_of_birth) */
  ageCheck?: { operator: "<" | ">=" | "<=" | ">"; age: number };
}

// ── Tier Thresholds ────────────────────────────────────────────

export interface TierThresholds {
  CRITICAL: number;
  HIGH: number;
  MODERATE: number;
  LOWER: number;
}

// ── Main PolicyPack Interface ──────────────────────────────────

export interface PolicyPack {
  /** Policy version — bump when scoring rules change */
  version: string;
  /** Maximum score per dimension */
  maxDimensionScore: number;

  /** Point-value maps for each scoring dimension */
  pointMaps: {
    housing: HousingPointMap;
    safety: SafetyPointMap;
    vulnerability: VulnerabilityPointMap;
    chronicity: ChronicityPointMap;
  };

  /** Ordered waterfall rules — first match determines stability level */
  waterfallRules: WaterfallRule[];

  /** Override rules — all matching rules applied, lowest floor wins */
  overrideRules: OverrideRule[];

  /** Priority-tier thresholds (applied to totalScore) */
  tierThresholds: TierThresholds;
}

// ── Default Policy Pack v1.0.0 ─────────────────────────────────
//
// P0-4 APPLIED: Waterfall no longer uses totalScore for level
// placement. Total score affects Tier only, never Level.
// ────────────────────────────────────────────────────────────────

export const DEFAULT_POLICY_PACK: PolicyPack = {
  version: "v1.0.0",
  maxDimensionScore: 25,

  pointMaps: {
    housing: {
      situationPoints: {
        unsheltered: 10,
        emergency_shelter: 7,
        staying_with_others: 5,
        hotel_motel: 4,
        transitional_housing: 4,
        institutional: 3,
        other: 2,
        permanent_housing: 0,
      },
      homelessSituations: [
        "unsheltered",
        "emergency_shelter",
        "staying_with_others",
        "hotel_motel",
        "transitional_housing",
      ],
      durationPoints: {
        over_1_year: 3,
        "6_12_months": 2,
        "3_6_months": 1,
      },
      atRiskOfLosing: 5,
      evictionNotice: 5,
      cannotReturnToPrevious: 2,
    },

    safety: {
      fleeingDv: 10,
      fleeingTrafficking: 10,
      suicidalIdeationRecent: 8,
      experiencedViolenceRecently: 5,
      feelsSafe: {
        no: 5,
        sometimes: 3,
      },
      mentalHealth: {
        severe_crisis: 5,
        moderate_concerns: 2,
      },
      substanceUse: {
        regular: 3,
        seeking_treatment: 2,
      },
      protectiveOrder: 2,
    },

    vulnerability: {
      chronicConditions: { threeOrMore: 6, oneOrTwo: 3 },
      currentlyPregnant: 5,
      needsImmediateMedical: 5,
      medicationNoAccess: 4,
      selfCare: {
        unable_without_help: 5,
        significant_difficulty: 3,
        some_difficulty: 1,
      },
      noHealthInsurance: 2,
      noRecentMedicalVisit: 2,
      youthAge: { maxAge: 25, points: 2 },
      seniorAge: { minAge: 62, points: 2 },
      hasDependents: 3,
    },

    chronicity: {
      currentlyChronic: 8,
      episodes: { fourOrMore: 5, twoOrMore: 3 },
      months: { twentyFourOrMore: 4, twelveOrMore: 2 },
      emergencyServices: {
        "6_plus_times": 4,
        "3_5_times": 2,
      },
      incarcerationRecent: 3,
      institutionalHistory: { twoOrMore: 3, one: 1 },
      noIncome: 2,
      noValidId: 2,
    },
  },

  // ── Waterfall Rules ────────────────────────────────────────
  // Evaluated in order. First matching rule determines Level.
  // P0-4: NO rule uses totalScore. Level is dimension-based only.
  waterfallRules: [
    // Level 0 — Crisis / Street
    {
      level: 0,
      conditions: [
        { dimension: "safety_crisis", operator: ">=", threshold: 20 },
      ],
      description: "safety_crisis ≥ 20 → Level 0",
    },
    {
      level: 0,
      conditions: [
        { dimension: "housing_stability", operator: ">=", threshold: 20 },
        { dimension: "chronicity_system", operator: ">=", threshold: 15 },
      ],
      description:
        "housing_stability ≥ 20 AND chronicity_system ≥ 15 → Level 0",
    },

    // Level 1 — Emergency Shelter
    {
      level: 1,
      conditions: [
        { dimension: "housing_stability", operator: ">=", threshold: 20 },
      ],
      description: "housing_stability ≥ 20 → Level 1",
    },
    {
      level: 1,
      conditions: [
        { dimension: "housing_stability", operator: ">=", threshold: 15 },
        { dimension: "vulnerability_health", operator: ">=", threshold: 15 },
      ],
      description:
        "housing_stability ≥ 15 AND vulnerability_health ≥ 15 → Level 1",
    },

    // Level 2 — Transitional
    {
      level: 2,
      conditions: [
        { dimension: "housing_stability", operator: ">=", threshold: 15 },
      ],
      description: "housing_stability ≥ 15 → Level 2",
    },
    {
      level: 2,
      conditions: [
        { dimension: "housing_stability", operator: ">=", threshold: 10 },
      ],
      anyOf: [
        { dimension: "safety_crisis", operator: ">=", threshold: 15 },
        { dimension: "vulnerability_health", operator: ">=", threshold: 15 },
        { dimension: "chronicity_system", operator: ">=", threshold: 15 },
      ],
      description: "housing_stability ≥ 10 AND any_dimension ≥ 15 → Level 2",
    },

    // Level 3 — Stabilizing
    // P0-4: These replace the old "totalScore >= 50 → Level 3" rule.
    // Rationale: Moderate housing instability OR any single high-risk
    // dimension warrants stabilization services.
    {
      level: 3,
      conditions: [
        { dimension: "housing_stability", operator: ">=", threshold: 10 },
      ],
      description: "housing_stability ≥ 10 → Level 3",
    },
    {
      level: 3,
      conditions: [],
      anyOf: [
        { dimension: "safety_crisis", operator: ">=", threshold: 15 },
        { dimension: "vulnerability_health", operator: ">=", threshold: 15 },
        { dimension: "chronicity_system", operator: ">=", threshold: 15 },
      ],
      description: "any_dimension ≥ 15 → Level 3",
    },

    // Level 4 — Housed – Supported
    // P0-4: These replace the old "totalScore >= 25 → Level 4" rule.
    // Rationale: Any notable housing concern or significant risk in
    // another dimension warrants supported housing.
    {
      level: 4,
      conditions: [
        { dimension: "housing_stability", operator: ">=", threshold: 5 },
      ],
      description: "housing_stability ≥ 5 → Level 4",
    },
    {
      level: 4,
      conditions: [],
      anyOf: [
        { dimension: "safety_crisis", operator: ">=", threshold: 10 },
        { dimension: "vulnerability_health", operator: ">=", threshold: 10 },
        { dimension: "chronicity_system", operator: ">=", threshold: 10 },
      ],
      description: "any_dimension ≥ 10 → Level 4",
    },
  ],

  // ── Override Rules ─────────────────────────────────────────
  // All matching overrides applied. Override sets a floor (can only
  // improve level, never worsen it).
  overrideRules: [
    {
      id: "fleeing_dv",
      floorLevel: 0,
      description: "fleeing_dv → floor Level 0",
      fieldChecks: [{ module: "safety", field: "fleeing_dv", value: true }],
    },
    {
      id: "fleeing_trafficking",
      floorLevel: 0,
      description: "fleeing_trafficking → floor Level 0",
      fieldChecks: [
        { module: "safety", field: "fleeing_trafficking", value: true },
      ],
    },
    {
      id: "veteran_unsheltered",
      floorLevel: 1,
      description: "veteran AND unsheltered → floor Level 1",
      fieldChecks: [
        { module: "demographics", field: "veteran_status", value: true },
        {
          module: "housing",
          field: "current_living_situation",
          value: "unsheltered",
        },
      ],
    },
    {
      id: "chronic_homeless",
      floorLevel: 1,
      description: "chronic_homeless → floor Level 1",
      fieldChecks: [
        { module: "history", field: "currently_chronic", value: true },
      ],
    },
    {
      id: "unaccompanied_minor",
      floorLevel: 0,
      description: "unaccompanied_minor (age < 18) → floor Level 0",
      fieldChecks: [
        { module: "demographics", field: "household_size", value: 1 },
      ],
      ageCheck: { operator: "<", age: 18 },
    },
  ],

  tierThresholds: {
    CRITICAL: 70,
    HIGH: 45,
    MODERATE: 20,
    LOWER: 0,
  },
};
