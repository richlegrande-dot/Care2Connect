/**
 * V2 Default Intake Form — Module Schemas
 *
 * Each module is a self-contained JSON Schema (Draft 2020-12 style)
 * with optional skip-logic via `x-show-if` extension fields.
 *
 * @module intake/v2/forms
 */

import { MODULE_ORDER, REQUIRED_MODULES, type ModuleId } from "../constants";

// ── Module Schema Definitions ──────────────────────────────────

const consentSchema = {
  $id: "consent",
  type: "object" as const,
  required: ["consent_data_collection", "consent_age_confirmation"],
  properties: {
    consent_data_collection: {
      type: "boolean" as const,
      title:
        "I consent to my information being collected for service coordination",
    },
    consent_age_confirmation: {
      type: "boolean" as const,
      title: "I confirm I am 18 or older (or have a guardian present)",
    },
    consent_dv_safe_mode: {
      type: "boolean" as const,
      title: "I would like to enable safety mode (limits location sharing)",
      default: false,
    },
    preferred_language: {
      type: "string" as const,
      enum: ["en", "es", "zh", "fr", "ar", "other"],
      default: "en",
    },
  },
};

const demographicsSchema = {
  $id: "demographics",
  type: "object" as const,
  required: ["first_name"],
  properties: {
    first_name: { type: "string" as const, minLength: 1, maxLength: 100 },
    last_name: { type: "string" as const, maxLength: 100 },
    preferred_name: { type: "string" as const, maxLength: 100 },
    date_of_birth: { type: "string" as const, format: "date" },
    gender: {
      type: "string" as const,
      enum: [
        "male",
        "female",
        "transgender_mtf",
        "transgender_ftm",
        "non_binary",
        "prefer_not_to_say",
      ],
    },
    race_ethnicity: {
      type: "array" as const,
      items: {
        type: "string" as const,
        enum: [
          "american_indian",
          "asian",
          "black",
          "hispanic_latino",
          "native_hawaiian",
          "white",
          "multi_racial",
          "prefer_not_to_say",
        ],
      },
    },
    veteran_status: { type: "boolean" as const },
    household_size: { type: "integer" as const, minimum: 1, maximum: 20 },
    has_dependents: { type: "boolean" as const },
    dependent_ages: {
      type: "array" as const,
      items: { type: "integer" as const, minimum: 0, maximum: 17 },
    },
    contact_phone: {
      type: "string" as const,
      pattern: "^[0-9\\-\\+\\(\\) ]{7,20}$",
    },
    contact_email: { type: "string" as const, format: "email" },
  },
};

const housingSchema = {
  $id: "housing",
  type: "object" as const,
  required: ["current_living_situation"],
  properties: {
    current_living_situation: {
      type: "string" as const,
      enum: [
        "unsheltered",
        "emergency_shelter",
        "transitional_housing",
        "staying_with_others",
        "hotel_motel",
        "permanent_housing",
        "institutional",
        "other",
      ],
    },
    unsheltered_location_type: {
      type: "string" as const,
      enum: ["street", "vehicle", "encampment", "abandoned_building", "other"],
      "x-show-if": { current_living_situation: "unsheltered" },
    },
    how_long_current: {
      type: "string" as const,
      enum: [
        "less_than_week",
        "1_4_weeks",
        "1_3_months",
        "3_6_months",
        "6_12_months",
        "over_1_year",
      ],
    },
    at_risk_of_losing: {
      type: "boolean" as const,
      title: "Are you at risk of losing your current housing within 14 days?",
    },
    eviction_notice: { type: "boolean" as const },
    can_return_to_previous: { type: "boolean" as const },
    wants_housing_assistance: { type: "boolean" as const, default: true },
    location_city: { type: "string" as const, maxLength: 100 },
    location_state: { type: "string" as const, maxLength: 2 },
    location_zip: {
      type: "string" as const,
      pattern: "^[0-9]{5}(-[0-9]{4})?$",
    },
  },
};

const safetySchema = {
  $id: "safety",
  type: "object" as const,
  required: [],
  properties: {
    feels_safe_current_location: {
      type: "string" as const,
      enum: ["yes", "mostly", "sometimes", "no"],
    },
    fleeing_dv: {
      type: "boolean" as const,
      title:
        "Are you currently fleeing or attempting to flee domestic violence, sexual assault, dating violence, or stalking?",
    },
    fleeing_trafficking: { type: "boolean" as const },
    experienced_violence_recently: {
      type: "boolean" as const,
      title: "Have you experienced violence or threats in the past 6 months?",
    },
    has_protective_order: { type: "boolean" as const },
    substance_use_current: {
      type: "string" as const,
      enum: ["none", "past_only", "occasional", "regular", "seeking_treatment"],
    },
    mental_health_current: {
      type: "string" as const,
      enum: [
        "stable",
        "mild_concerns",
        "moderate_concerns",
        "severe_crisis",
        "prefer_not_to_say",
      ],
    },
    suicidal_ideation_recent: {
      type: "boolean" as const,
      title: "Have you had thoughts of harming yourself in the past 30 days?",
    },
    emergency_contact_name: { type: "string" as const },
    emergency_contact_phone: { type: "string" as const },
  },
};

const healthSchema = {
  $id: "health",
  type: "object" as const,
  required: [],
  properties: {
    has_health_insurance: { type: "boolean" as const },
    insurance_type: {
      type: "string" as const,
      enum: ["medicaid", "medicare", "private", "va", "none", "unknown"],
      "x-show-if": { has_health_insurance: true },
    },
    chronic_conditions: {
      type: "array" as const,
      items: {
        type: "string" as const,
        enum: [
          "diabetes",
          "heart_disease",
          "hiv_aids",
          "hepatitis",
          "respiratory",
          "mental_health",
          "substance_use_disorder",
          "physical_disability",
          "developmental_disability",
          "tbi",
          "other",
          "none",
        ],
      },
    },
    currently_pregnant: { type: "boolean" as const },
    needs_medication: { type: "boolean" as const },
    has_access_to_medication: {
      type: "boolean" as const,
      "x-show-if": { needs_medication: true },
    },
    last_medical_visit: {
      type: "string" as const,
      enum: [
        "within_month",
        "1_6_months",
        "6_12_months",
        "over_1_year",
        "never",
        "unknown",
      ],
    },
    needs_immediate_medical: { type: "boolean" as const },
    self_care_difficulty: {
      type: "string" as const,
      enum: [
        "none",
        "some_difficulty",
        "significant_difficulty",
        "unable_without_help",
      ],
      title:
        "Difficulty with daily self-care activities (bathing, dressing, eating)",
    },
  },
};

const historySchema = {
  $id: "history",
  type: "object" as const,
  required: [],
  properties: {
    total_homeless_episodes: {
      type: "integer" as const,
      minimum: 0,
      title: "How many separate times have you been homeless?",
    },
    total_homeless_months: {
      type: "integer" as const,
      minimum: 0,
      title: "Total months spent homeless in lifetime",
    },
    first_homeless_age: {
      type: "integer" as const,
      minimum: 0,
      title: "Age when first experienced homelessness",
    },
    currently_chronic: {
      type: "boolean" as const,
      title:
        "Have you been continuously homeless for 12+ months or had 4+ episodes in 3 years?",
    },
    institutional_history: {
      type: "array" as const,
      items: {
        type: "string" as const,
        enum: [
          "foster_care",
          "jail_prison",
          "psychiatric_facility",
          "substance_treatment",
          "hospital",
          "none",
        ],
      },
    },
    emergency_services_use: {
      type: "string" as const,
      enum: ["none", "1_2_times", "3_5_times", "6_plus_times"],
      title: "Emergency room or 911 use in past 6 months",
    },
    incarceration_recent: {
      type: "boolean" as const,
      title: "Released from jail/prison in the past 12 months?",
    },
  },
};

const incomeSchema = {
  $id: "income",
  type: "object" as const,
  required: [],
  properties: {
    has_any_income: { type: "boolean" as const },
    monthly_income_dollars: {
      type: "number" as const,
      minimum: 0,
      "x-show-if": { has_any_income: true },
    },
    income_sources: {
      type: "array" as const,
      items: {
        type: "string" as const,
        enum: [
          "employment_full",
          "employment_part",
          "ssi",
          "ssdi",
          "tanf",
          "snap",
          "unemployment",
          "veterans_benefits",
          "child_support",
          "informal",
          "none",
        ],
      },
    },
    has_bank_account: { type: "boolean" as const },
    has_valid_id: { type: "boolean" as const },
    owes_debt_preventing_housing: { type: "boolean" as const },
    has_criminal_record_affecting_housing: { type: "boolean" as const },
    currently_employed: { type: "boolean" as const },
    wants_employment_help: { type: "boolean" as const },
  },
};

const goalsSchema = {
  $id: "goals",
  type: "object" as const,
  required: [],
  properties: {
    top_priorities: {
      type: "array" as const,
      maxItems: 3,
      items: {
        type: "string" as const,
        enum: [
          "housing",
          "food",
          "employment",
          "healthcare",
          "mental_health",
          "substance_treatment",
          "legal_help",
          "childcare",
          "education",
          "transportation",
          "safety",
        ],
      },
      title: "What are your top 3 priorities right now?",
    },
    housing_preference: {
      type: "string" as const,
      enum: [
        "any_available",
        "shelter",
        "transitional",
        "permanent_supportive",
        "rapid_rehousing",
        "independent",
      ],
    },
    location_preference: {
      type: "string" as const,
      enum: [
        "near_current",
        "near_family",
        "near_work",
        "near_school",
        "specific_area",
        "anywhere",
      ],
    },
    barriers_to_housing: {
      type: "array" as const,
      items: {
        type: "string" as const,
        enum: [
          "credit_history",
          "criminal_record",
          "eviction_history",
          "pets",
          "no_id",
          "no_income",
          "substance_use",
          "mental_health",
          "physical_disability",
          "large_family",
        ],
      },
    },
    additional_notes: {
      type: "string" as const,
      maxLength: 2000,
      title: "Anything else you'd like us to know?",
    },
  },
};

// ── Registry ───────────────────────────────────────────────────

interface BaseModuleSchema {
  $id: string;
  type: "object";
  required: string[];
  properties: Record<string, any>;
}

type ModuleSchema = BaseModuleSchema;

const MODULE_SCHEMAS: Record<ModuleId, ModuleSchema> = {
  consent: consentSchema,
  demographics: demographicsSchema,
  housing: housingSchema,
  safety: safetySchema,
  health: healthSchema,
  history: historySchema,
  income: incomeSchema,
  goals: goalsSchema,
};

/**
 * All intake modules in wizard order.
 */
export const INTAKE_MODULES = MODULE_ORDER.map((id) => ({
  id,
  required: (REQUIRED_MODULES as readonly string[]).includes(id),
  schema: MODULE_SCHEMAS[id],
}));

/**
 * Get a single module's schema by ID.
 */
export function getModuleSchema(moduleId: ModuleId) {
  const schema = MODULE_SCHEMAS[moduleId];
  if (!schema) {
    throw new Error(`Unknown intake module: ${moduleId}`);
  }
  return schema;
}

/**
 * Validate module data against its schema.
 *
 * Performs comprehensive JSON Schema-style validation:
 *   - Required fields enforcement
 *   - Type checking (string, boolean, integer, number, array)
 *   - Enum constraint validation (string and array items)
 *   - String length bounds (minLength, maxLength)
 *   - String pattern validation (regex)
 *   - String format validation (date, email)
 *   - Numeric range validation (minimum, maximum)
 *   - Array maxItems enforcement
 *   - x-show-if conditional visibility (skips hidden fields)
 *   - Unknown field detection
 *
 * @module intake/v2/forms
 */
export function validateModuleData(
  moduleId: ModuleId,
  data: Record<string, unknown>,
): { valid: boolean; errors: string[] } {
  const schema = getModuleSchema(moduleId);
  const errors: string[] = [];

  const props = schema.properties as Record<string, Record<string, unknown>>;

  // ── Pass 1: Required fields ──────────────────────────────────
  if (schema.required) {
    for (const field of schema.required) {
      // Skip required check if the field is hidden by x-show-if
      const propSchema = props[field];
      if (propSchema && isFieldHidden(propSchema, data)) continue;

      if (data[field] === undefined || data[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  // ── Pass 2: Validate provided fields ─────────────────────────
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    const propSchema = props[key];
    if (!propSchema) {
      errors.push(`Unknown field: ${key}`);
      continue;
    }

    // Skip validation for hidden fields
    if (isFieldHidden(propSchema, data)) continue;

    const fieldType = propSchema.type as string;

    // ── Type checking ──────────────────────────────────────────
    if (!checkType(value, fieldType)) {
      errors.push(
        `Invalid type for ${key}: expected ${fieldType}, got ${typeof value}`,
      );
      continue; // Skip further checks if type is wrong
    }

    // ── String constraints ─────────────────────────────────────
    if (fieldType === "string" && typeof value === "string") {
      // Enum check
      if (propSchema.enum) {
        const allowed = propSchema.enum as string[];
        if (!allowed.includes(value)) {
          errors.push(
            `Invalid value for ${key}: "${value}". Expected one of: ${allowed.join(", ")}`,
          );
        }
      }
      // minLength
      if (
        typeof propSchema.minLength === "number" &&
        value.length < propSchema.minLength
      ) {
        errors.push(
          `${key} must be at least ${propSchema.minLength} characters (got ${value.length})`,
        );
      }
      // maxLength
      if (
        typeof propSchema.maxLength === "number" &&
        value.length > propSchema.maxLength
      ) {
        errors.push(
          `${key} must be at most ${propSchema.maxLength} characters (got ${value.length})`,
        );
      }
      // Pattern
      if (typeof propSchema.pattern === "string") {
        try {
          const re = new RegExp(propSchema.pattern);
          if (!re.test(value)) {
            errors.push(`${key} does not match required pattern`);
          }
        } catch {
          // Skip invalid regex patterns
        }
      }
      // Format
      if (propSchema.format === "date") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(Date.parse(value))) {
          errors.push(`${key} must be a valid date (YYYY-MM-DD)`);
        }
      }
      if (propSchema.format === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${key} must be a valid email address`);
        }
      }
    }

    // ── Numeric constraints ────────────────────────────────────
    if (
      (fieldType === "integer" || fieldType === "number") &&
      typeof value === "number"
    ) {
      if (fieldType === "integer" && !Number.isInteger(value)) {
        errors.push(`${key} must be an integer`);
      }
      if (
        typeof propSchema.minimum === "number" &&
        value < propSchema.minimum
      ) {
        errors.push(`${key} must be >= ${propSchema.minimum} (got ${value})`);
      }
      if (
        typeof propSchema.maximum === "number" &&
        value > propSchema.maximum
      ) {
        errors.push(`${key} must be <= ${propSchema.maximum} (got ${value})`);
      }
    }

    // ── Boolean validation ─────────────────────────────────────
    // Type check already done above

    // ── Array constraints ──────────────────────────────────────
    if (fieldType === "array" && Array.isArray(value)) {
      if (
        typeof propSchema.maxItems === "number" &&
        value.length > propSchema.maxItems
      ) {
        errors.push(
          `${key} must have at most ${propSchema.maxItems} items (got ${value.length})`,
        );
      }
      // Validate array items against item schema
      const items = propSchema.items as Record<string, unknown> | undefined;
      if (items) {
        const itemType = items.type as string | undefined;
        const itemEnum = items.enum as unknown[] | undefined;
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (itemType && !checkType(item, itemType)) {
            errors.push(
              `${key}[${i}]: expected ${itemType}, got ${typeof item}`,
            );
          } else if (itemEnum && !itemEnum.includes(item)) {
            errors.push(
              `${key}[${i}]: invalid value "${item}". Expected one of: ${itemEnum.join(", ")}`,
            );
          }
          // Integer array items — range checks
          if (
            (itemType === "integer" || itemType === "number") &&
            typeof item === "number"
          ) {
            if (typeof items.minimum === "number" && item < items.minimum) {
              errors.push(`${key}[${i}] must be >= ${items.minimum}`);
            }
            if (typeof items.maximum === "number" && item > items.maximum) {
              errors.push(`${key}[${i}] must be <= ${items.maximum}`);
            }
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Validation Helpers ─────────────────────────────────────────

/**
 * Check whether value matches the expected JSON Schema type.
 */
function checkType(value: unknown, expectedType: string): boolean {
  switch (expectedType) {
    case "string":
      return typeof value === "string";
    case "boolean":
      return typeof value === "boolean";
    case "integer":
      return typeof value === "number" && Number.isFinite(value);
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "array":
      return Array.isArray(value);
    case "object":
      return (
        typeof value === "object" && value !== null && !Array.isArray(value)
      );
    default:
      return true;
  }
}

/**
 * Evaluate x-show-if conditional visibility.
 * Returns true if the field should be HIDDEN.
 */
function isFieldHidden(
  propSchema: Record<string, unknown>,
  data: Record<string, unknown>,
): boolean {
  const showIf = propSchema["x-show-if"] as Record<string, unknown> | undefined;
  if (!showIf) return false;

  // All conditions must match for the field to be shown
  for (const [condKey, condVal] of Object.entries(showIf)) {
    if (data[condKey] !== condVal) return true; // Condition not met → hidden
  }
  return false; // All conditions met → visible
}
