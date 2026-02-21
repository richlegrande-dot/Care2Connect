/**
 * V2 Intake Constants
 *
 * Scoring-related constants (point values, tier thresholds, waterfall rules,
 * override rules) live in the PolicyPack — see policy/policyPack.ts.
 *
 * This file retains form/module constants and stability-level metadata that
 * the engine and UI both reference.
 */

/** Current policy pack version — bump when scoring rules change */
export const POLICY_PACK_VERSION = "v1.0.0";

/** Engine implementation version — bump when code logic changes */
export const SCORING_ENGINE_VERSION = "v1.0.0";

/** Maximum score per dimension (authoritative value lives in PolicyPack) */
export const MAX_DIMENSION_SCORE = 25;

/** Total maximum score across all dimensions */
export const MAX_TOTAL_SCORE = 100;

/** Stability Levels — used by engine, explainability, and UI */
export const STABILITY_LEVELS = {
  0: { label: "Crisis / Street", tier: "CRITICAL" as const },
  1: { label: "Emergency Shelter", tier: "CRITICAL" as const },
  2: { label: "Transitional", tier: "HIGH" as const },
  3: { label: "Stabilizing", tier: "MODERATE" as const },
  4: { label: "Housed – Supported", tier: "LOWER" as const },
  5: { label: "Self-Sufficient", tier: "LOWER" as const },
} as const;

/**
 * Priority tier thresholds (total score).
 * Authoritative values now live in the PolicyPack. These are kept
 * for backward compatibility with non-engine code.
 */
export const PRIORITY_TIER_THRESHOLDS = {
  CRITICAL: 70,
  HIGH: 45,
  MODERATE: 20,
  LOWER: 0,
} as const;

/** List of wizard module IDs in order */
export const MODULE_ORDER = [
  "consent",
  "demographics",
  "housing",
  "safety",
  "health",
  "history",
  "income",
  "goals",
] as const;

/** Modules that must be completed */
export const REQUIRED_MODULES = [
  "consent",
  "demographics",
  "housing",
  "safety",
] as const;

export type ModuleId = (typeof MODULE_ORDER)[number];
export type PriorityTier = "CRITICAL" | "HIGH" | "MODERATE" | "LOWER";
export type StabilityLevel = 0 | 1 | 2 | 3 | 4 | 5;
