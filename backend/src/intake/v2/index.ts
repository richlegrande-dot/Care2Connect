/**
 * V2 Intake Module — Care2Connect
 *
 * Coordinated-Entry-style intake with:
 *   - Multi-module wizard form schema
 *   - 4-dimension deterministic scoring engine (0–100)
 *   - Stability Level placement (0–5)
 *   - Explainability cards
 *   - Action plan generation
 *
 * Feature flag: ENABLE_V2_INTAKE=true
 * Constraint:  ZERO_OPENAI_MODE — all scoring is deterministic, no AI calls.
 *
 * @module intake/v2
 */

export { INTAKE_MODULES, getModuleSchema, validateModuleData } from './forms/default-intake-form';
export { computeScores, type ScoreResult } from './scoring/computeScores';
export { buildExplanation, type ExplainabilityCard } from './explainability/buildExplanation';
export { generatePlan, type ActionPlanResult } from './action_plans/generatePlan';
export { POLICY_PACK_VERSION, SCORING_ENGINE_VERSION } from './constants';
export { DEFAULT_POLICY_PACK, type PolicyPack } from './policy/policyPack';
export { getPanicButtonUrl, getPanicButtonConfig, DV_SENSITIVE_SIGNALS } from './dvSafe';
