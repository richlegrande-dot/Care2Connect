/**
 * V2 Intake Wizard — Shared Types
 *
 * Matches the backend intake/v2 module types.
 */

export type ModuleId =
  | "consent"
  | "demographics"
  | "housing"
  | "safety"
  | "health"
  | "history"
  | "income"
  | "goals";

export interface ModuleSchema {
  $id: string;
  type: "object";
  required?: string[];
  properties: Record<string, FieldSchema>;
}

export interface FieldSchema {
  type: string;
  title?: string;
  enum?: string[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  items?: FieldSchema;
  maxItems?: number;
  "x-show-if"?: Record<string, unknown>;
}

export interface IntakeModule {
  id: ModuleId;
  required: boolean;
  schema: ModuleSchema;
}

export interface WizardState {
  sessionId: string | null;
  currentStep: number;
  completedModules: ModuleId[];
  moduleData: Partial<Record<ModuleId, Record<string, unknown>>>;
  dvSafeMode: boolean;
  status:
    | "idle"
    | "in_progress"
    | "review"
    | "submitting"
    | "completed"
    | "error";
  error: string | null;
}

export interface ScoreSummary {
  totalScore: number;
  stabilityLevel: number;
  priorityTier: string;
  dimensions: {
    housing_stability: number;
    safety_crisis: number;
    vulnerability_health: number;
    chronicity_system: number;
  };
}

export interface ExplainabilityCard {
  level: number;
  levelLabel: string;
  priorityTier: string;
  totalScore: number;
  topFactors: string[];
  placementRule: string;
  overridesApplied: string[];
  generatedAt: string;
  policyPackVersion?: string;
}

export interface ActionPlanSummary {
  immediateTasks: number;
  shortTermTasks: number;
  mediumTermTasks: number;
}
