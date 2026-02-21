# V2 Intake Specification — Care2Connect

> **Version**: 1.0.0-draft  
> **Status**: DRAFT — Not yet implemented  
> **Branch**: `v2-intake-scaffold`  
> **Created**: 2026-02-18  
> **Constraint**: `ZERO_OPENAI_MODE=true` — all scoring & placement is deterministic, no AI calls.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Stability Spectrum (Levels 0–5)](#2-stability-spectrum-levels-05)
3. [Wizard Modules & Field Schema](#3-wizard-modules--field-schema)
4. [Scoring Engine](#4-scoring-engine)
5. [Explainability](#5-explainability)
6. [Action Plan Generation](#6-action-plan-generation)
7. [Database Model Plan](#7-database-model-plan)
8. [Privacy & Safety (DV-Safe Mode)](#8-privacy--safety-dv-safe-mode)
9. [Audit & Fairness](#9-audit--fairness)
10. [HMIS / CE Export](#10-hmis--ce-export)
11. [V1 → V2 Reconciliation](#11-v1--v2-reconciliation)
12. [Feature Flag & Rollout](#12-feature-flag--rollout)
13. [Open Questions & Deferred Items](#13-open-questions--deferred-items)

---

## 1. Overview

V2 Intake replaces the V1 story-driven onboarding flow with a **structured, deterministic wizard** modeled on HUD Coordinated Entry principles. The system collects standardized fields across multiple domains, computes a 0–100 priority score across four dimensions, assigns a Stability Level (0–5), and generates an explainable action plan — all without any AI/LLM calls.

### Design Principles

| # | Principle | Implication |
|---|-----------|-------------|
| 1 | **Deterministic** | Same inputs → same score, level, plan. No stochastic components. |
| 2 | **Explainable** | Every placement decision includes a human-readable rationale with top contributing factors. |
| 3 | **Privacy-First** | DV-safe mode suppresses PII in exports and redacts location signals. |
| 4 | **Offline-Ready** | All scoring runs client-side or on-server with zero external API calls. |
| 5 | **HUD-Aligned** | Field mappings are compatible with HMIS CSV 2024 export and Coordinated Entry data standards. |
| 6 | **Isolated from V1** | V2 code lives in separate directories; V1 parser harness is never modified. |

### Relationship to Reference Standards

- **SPDAT V4.01**: Used as a *domain reference* (15 domains A–O). Care2Connect does NOT replicate SPDAT scoring directly (it is proprietary). Instead, V2 maps equivalent signal domains.
- **VI-SPDAT**: The triage-level subset is closer to V2's intake depth; full SPDAT depth is deferred to case-manager assessments.
- **HUD HMIS CSV 2024**: Export field mapping ensures compatibility with Coordinated Entry reporting.

---

## 2. Stability Spectrum (Levels 0–5)

### Level Definitions

| Level | Label | Description | Priority Tier |
|-------|-------|-------------|---------------|
| **0** | **Crisis / Street** | Unsheltered, imminent danger, or active DV/trafficking situation. Requires same-day intervention. | Critical |
| **1** | **Emergency Shelter** | In emergency shelter or about to lose temporary placement within 72 hours. High vulnerability. | Critical |
| **2** | **Transitional** | In transitional housing, time-limited program, or couch-surfing. Some stability but at risk of regression. | High |
| **3** | **Stabilizing** | Has housing but facing threats (eviction notice, unaffordable rent, unsafe conditions). Services partially connected. | Moderate |
| **4** | **Housed – Supported** | Stably housed with ongoing support needs (case management, benefits, mental health). | Lower |
| **5** | **Self-Sufficient** | Stably housed, income-stable, services rarely needed. Monitoring only. | Lower |

### Deterministic Placement Rules

Level assignment is a **waterfall** — the first matching rule wins:

```
IF safety_crisis_score ≥ 20                           → Level 0
IF housing_stability_score ≤ 5 AND chronicity ≥ 15    → Level 0
IF housing_stability_score ≤ 5                         → Level 1
IF housing_stability_score ≤ 10 AND vulnerability ≥ 15 → Level 1
IF housing_stability_score ≤ 15                        → Level 2
IF housing_stability_score ≤ 20 AND any_dimension ≥ 15 → Level 2
IF total_score ≥ 50                                    → Level 3
IF total_score ≥ 25                                    → Level 4
ELSE                                                   → Level 5
```

> **Note**: The waterfall deliberately front-loads Safety & Crisis Risk — a person in imminent danger is always Level 0 regardless of housing status.

### Override Rules

| Condition | Effect |
|-----------|--------|
| `fleeing_dv = true` | Floor at Level 0 (Critical) |
| `veteran = true AND unsheltered = true` | Floor at Level 1 |
| `chronic_homeless ≥ 12 months` | Floor at Level 1 |
| `age < 18 AND unaccompanied = true` | Floor at Level 0 |

---

## 3. Wizard Modules & Field Schema

The intake wizard is divided into **modules** (steps). Each module is a self-contained form with its own JSON Schema. The wizard supports skip-logic (conditional branching).

### Module List

| # | Module ID | Title | Required | Estimated Time |
|---|-----------|-------|----------|----------------|
| 1 | `consent` | Welcome & Consent | Yes | 1 min |
| 2 | `demographics` | About You | Yes | 2 min |
| 3 | `housing` | Housing Situation | Yes | 3 min |
| 4 | `safety` | Safety & Crisis | Yes | 2 min |
| 5 | `health` | Health & Wellbeing | No | 3 min |
| 6 | `history` | Homelessness History | No | 2 min |
| 7 | `income` | Income & Benefits | No | 2 min |
| 8 | `goals` | Goals & Preferences | No | 2 min |

### Module 1: `consent`

```json
{
  "$id": "consent",
  "type": "object",
  "required": ["consent_data_collection", "consent_age_confirmation"],
  "properties": {
    "consent_data_collection": {
      "type": "boolean",
      "title": "I consent to my information being collected for service coordination",
      "const": true
    },
    "consent_age_confirmation": {
      "type": "boolean",
      "title": "I confirm I am 18 or older (or have a guardian present)",
      "const": true
    },
    "consent_dv_safe_mode": {
      "type": "boolean",
      "title": "I would like to enable safety mode (limits location sharing)",
      "default": false
    },
    "preferred_language": {
      "type": "string",
      "enum": ["en", "es", "zh", "fr", "ar", "other"],
      "default": "en"
    }
  }
}
```

### Module 2: `demographics`

```json
{
  "$id": "demographics",
  "type": "object",
  "required": ["first_name"],
  "properties": {
    "first_name": { "type": "string", "minLength": 1, "maxLength": 100 },
    "last_name": { "type": "string", "maxLength": 100 },
    "preferred_name": { "type": "string", "maxLength": 100 },
    "date_of_birth": { "type": "string", "format": "date" },
    "gender": {
      "type": "string",
      "enum": ["male", "female", "transgender_mtf", "transgender_ftm", "non_binary", "prefer_not_to_say"]
    },
    "race_ethnicity": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["american_indian", "asian", "black", "hispanic_latino", "native_hawaiian", "white", "multi_racial", "prefer_not_to_say"]
      }
    },
    "veteran_status": { "type": "boolean" },
    "household_size": { "type": "integer", "minimum": 1, "maximum": 20 },
    "has_dependents": { "type": "boolean" },
    "dependent_ages": {
      "type": "array",
      "items": { "type": "integer", "minimum": 0, "maximum": 17 }
    },
    "contact_phone": { "type": "string", "pattern": "^[0-9\\-\\+\\(\\) ]{7,20}$" },
    "contact_email": { "type": "string", "format": "email" }
  }
}
```

### Module 3: `housing`

```json
{
  "$id": "housing",
  "type": "object",
  "required": ["current_living_situation"],
  "properties": {
    "current_living_situation": {
      "type": "string",
      "enum": [
        "unsheltered", "emergency_shelter", "transitional_housing",
        "staying_with_others", "hotel_motel", "permanent_housing",
        "institutional", "other"
      ]
    },
    "unsheltered_location_type": {
      "type": "string",
      "enum": ["street", "vehicle", "encampment", "abandoned_building", "other"],
      "x-show-if": { "current_living_situation": "unsheltered" }
    },
    "how_long_current": {
      "type": "string",
      "enum": ["less_than_week", "1_4_weeks", "1_3_months", "3_6_months", "6_12_months", "over_1_year"]
    },
    "at_risk_of_losing": {
      "type": "boolean",
      "title": "Are you at risk of losing your current housing within 14 days?"
    },
    "eviction_notice": { "type": "boolean" },
    "can_return_to_previous": { "type": "boolean" },
    "wants_housing_assistance": { "type": "boolean", "default": true },
    "location_city": { "type": "string", "maxLength": 100 },
    "location_state": { "type": "string", "maxLength": 2 },
    "location_zip": { "type": "string", "pattern": "^[0-9]{5}(-[0-9]{4})?$" }
  }
}
```

### Module 4: `safety`

```json
{
  "$id": "safety",
  "type": "object",
  "required": [],
  "properties": {
    "feels_safe_current_location": {
      "type": "string",
      "enum": ["yes", "mostly", "sometimes", "no"]
    },
    "fleeing_dv": {
      "type": "boolean",
      "title": "Are you currently fleeing or attempting to flee domestic violence, sexual assault, dating violence, or stalking?"
    },
    "fleeing_trafficking": { "type": "boolean" },
    "experienced_violence_recently": {
      "type": "boolean",
      "title": "Have you experienced violence or threats in the past 6 months?"
    },
    "has_protective_order": { "type": "boolean" },
    "substance_use_current": {
      "type": "string",
      "enum": ["none", "past_only", "occasional", "regular", "seeking_treatment"]
    },
    "mental_health_current": {
      "type": "string",
      "enum": ["stable", "mild_concerns", "moderate_concerns", "severe_crisis", "prefer_not_to_say"]
    },
    "suicidal_ideation_recent": {
      "type": "boolean",
      "title": "Have you had thoughts of harming yourself in the past 30 days?"
    },
    "emergency_contact_name": { "type": "string" },
    "emergency_contact_phone": { "type": "string" }
  }
}
```

### Module 5: `health`

```json
{
  "$id": "health",
  "type": "object",
  "properties": {
    "has_health_insurance": { "type": "boolean" },
    "insurance_type": {
      "type": "string",
      "enum": ["medicaid", "medicare", "private", "va", "none", "unknown"],
      "x-show-if": { "has_health_insurance": true }
    },
    "chronic_conditions": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["diabetes", "heart_disease", "hiv_aids", "hepatitis", "respiratory", "mental_health", "substance_use_disorder", "physical_disability", "developmental_disability", "tbi", "other", "none"]
      }
    },
    "currently_pregnant": { "type": "boolean" },
    "needs_medication": { "type": "boolean" },
    "has_access_to_medication": {
      "type": "boolean",
      "x-show-if": { "needs_medication": true }
    },
    "last_medical_visit": {
      "type": "string",
      "enum": ["within_month", "1_6_months", "6_12_months", "over_1_year", "never", "unknown"]
    },
    "needs_immediate_medical": { "type": "boolean" },
    "self_care_difficulty": {
      "type": "string",
      "enum": ["none", "some_difficulty", "significant_difficulty", "unable_without_help"],
      "title": "Difficulty with daily self-care activities (bathing, dressing, eating)"
    }
  }
}
```

### Module 6: `history`

```json
{
  "$id": "history",
  "type": "object",
  "properties": {
    "total_homeless_episodes": {
      "type": "integer",
      "minimum": 0,
      "title": "How many separate times have you been homeless?"
    },
    "total_homeless_months": {
      "type": "integer",
      "minimum": 0,
      "title": "Total months spent homeless in lifetime"
    },
    "first_homeless_age": {
      "type": "integer",
      "minimum": 0,
      "title": "Age when first experienced homelessness"
    },
    "currently_chronic": {
      "type": "boolean",
      "title": "Have you been continuously homeless for 12+ months or had 4+ episodes in 3 years?"
    },
    "institutional_history": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["foster_care", "jail_prison", "psychiatric_facility", "substance_treatment", "hospital", "none"]
      }
    },
    "emergency_services_use": {
      "type": "string",
      "enum": ["none", "1_2_times", "3_5_times", "6_plus_times"],
      "title": "Emergency room or 911 use in past 6 months"
    },
    "incarceration_recent": {
      "type": "boolean",
      "title": "Released from jail/prison in the past 12 months?"
    }
  }
}
```

### Module 7: `income`

```json
{
  "$id": "income",
  "type": "object",
  "properties": {
    "has_any_income": { "type": "boolean" },
    "monthly_income_dollars": {
      "type": "number",
      "minimum": 0,
      "x-show-if": { "has_any_income": true }
    },
    "income_sources": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["employment_full", "employment_part", "ssi", "ssdi", "tanf", "snap", "unemployment", "veterans_benefits", "child_support", "informal", "none"]
      }
    },
    "has_bank_account": { "type": "boolean" },
    "has_valid_id": { "type": "boolean" },
    "owes_debt_preventing_housing": { "type": "boolean" },
    "has_criminal_record_affecting_housing": { "type": "boolean" },
    "currently_employed": { "type": "boolean" },
    "wants_employment_help": { "type": "boolean" }
  }
}
```

### Module 8: `goals`

```json
{
  "$id": "goals",
  "type": "object",
  "properties": {
    "top_priorities": {
      "type": "array",
      "maxItems": 3,
      "items": {
        "type": "string",
        "enum": ["housing", "food", "employment", "healthcare", "mental_health", "substance_treatment", "legal_help", "childcare", "education", "transportation", "safety"]
      },
      "title": "What are your top 3 priorities right now?"
    },
    "housing_preference": {
      "type": "string",
      "enum": ["any_available", "shelter", "transitional", "permanent_supportive", "rapid_rehousing", "independent"]
    },
    "location_preference": {
      "type": "string",
      "enum": ["near_current", "near_family", "near_work", "near_school", "specific_area", "anywhere"]
    },
    "barriers_to_housing": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["credit_history", "criminal_record", "eviction_history", "pets", "no_id", "no_income", "substance_use", "mental_health", "physical_disability", "large_family"]
      }
    },
    "additional_notes": {
      "type": "string",
      "maxLength": 2000,
      "title": "Anything else you'd like us to know?"
    }
  }
}
```

---

## 4. Scoring Engine

### Dimensions

The priority score is the sum of four dimensions, each 0–25:

| Dimension | ID | Max | Primary Signal Sources |
|-----------|----|-----|----------------------|
| **Housing Stability** | `housing_stability` | 25 | Module 3 (housing), Module 6 (history) |
| **Safety & Crisis Risk** | `safety_crisis` | 25 | Module 4 (safety) |
| **Vulnerability & Health** | `vulnerability_health` | 25 | Module 5 (health), Module 2 (demographics) |
| **Chronicity & System Use** | `chronicity_system` | 25 | Module 6 (history), Module 7 (income) |

**Total Priority Score** = `housing_stability + safety_crisis + vulnerability_health + chronicity_system` (0–100)

### Scoring Rules — Housing Stability (0–25)

| Signal | Condition | Points |
|--------|-----------|--------|
| `current_living_situation` | `unsheltered` | 10 |
| `current_living_situation` | `emergency_shelter` | 7 |
| `current_living_situation` | `staying_with_others` | 5 |
| `current_living_situation` | `transitional_housing` | 4 |
| `current_living_situation` | `hotel_motel` | 4 |
| `current_living_situation` | `institutional` | 3 |
| `current_living_situation` | `permanent_housing` | 0 |
| `at_risk_of_losing` | `true` | 5 |
| `eviction_notice` | `true` | 5 |
| `how_long_current` | `over_1_year` (if homeless situation) | 3 |
| `how_long_current` | `6_12_months` (if homeless situation) | 2 |
| `how_long_current` | `3_6_months` (if homeless situation) | 1 |
| `can_return_to_previous` | `false` | 2 |

*Capped at 25.*

### Scoring Rules — Safety & Crisis Risk (0–25)

| Signal | Condition | Points |
|--------|-----------|--------|
| `fleeing_dv` | `true` | 10 |
| `fleeing_trafficking` | `true` | 10 |
| `suicidal_ideation_recent` | `true` | 8 |
| `experienced_violence_recently` | `true` | 5 |
| `feels_safe_current_location` | `no` | 5 |
| `feels_safe_current_location` | `sometimes` | 3 |
| `mental_health_current` | `severe_crisis` | 5 |
| `mental_health_current` | `moderate_concerns` | 2 |
| `substance_use_current` | `regular` | 3 |
| `substance_use_current` | `seeking_treatment` | 2 |
| `has_protective_order` | `true` | 2 |

*Capped at 25.*

### Scoring Rules — Vulnerability & Health (0–25)

| Signal | Condition | Points |
|--------|-----------|--------|
| `chronic_conditions` | 3+ conditions | 6 |
| `chronic_conditions` | 1–2 conditions | 3 |
| `currently_pregnant` | `true` | 5 |
| `needs_immediate_medical` | `true` | 5 |
| `needs_medication` AND `!has_access_to_medication` | `true` | 4 |
| `self_care_difficulty` | `unable_without_help` | 5 |
| `self_care_difficulty` | `significant_difficulty` | 3 |
| `self_care_difficulty` | `some_difficulty` | 1 |
| `has_health_insurance` | `false` | 2 |
| `last_medical_visit` | `over_1_year` or `never` | 2 |
| `age < 25` (youth) | `true` | 2 |
| `age ≥ 62` (senior) | `true` | 2 |
| `has_dependents` with minors | `true` | 3 |

*Capped at 25.*

### Scoring Rules — Chronicity & System Use (0–25)

| Signal | Condition | Points |
|--------|-----------|--------|
| `currently_chronic` | `true` | 8 |
| `total_homeless_episodes` | `≥ 4` | 5 |
| `total_homeless_episodes` | `2–3` | 3 |
| `total_homeless_months` | `≥ 24` | 4 |
| `total_homeless_months` | `12–23` | 2 |
| `emergency_services_use` | `6_plus_times` | 4 |
| `emergency_services_use` | `3_5_times` | 2 |
| `incarceration_recent` | `true` | 3 |
| `institutional_history` | 2+ types | 3 |
| `institutional_history` | 1 type | 1 |
| `has_any_income` | `false` | 2 |
| `has_valid_id` | `false` | 2 |

*Capped at 25.*

### Priority Tier Mapping

| Total Score | Tier |
|-------------|------|
| 70–100 | **Critical** |
| 45–69 | **High** |
| 20–44 | **Moderate** |
| 0–19 | **Lower** |

---

## 5. Explainability

Every placement produces an **Explainability Card** — a human-readable summary of *why* the person was placed at their level.

### Card Structure

```typescript
interface ExplainabilityCard {
  level: number;                    // 0–5
  levelLabel: string;               // "Crisis / Street"
  priorityTier: string;             // "Critical" | "High" | "Moderate" | "Lower"
  totalScore: number;               // 0–100
  dimensions: {
    housing_stability: { score: number; maxScore: 25; contributors: Contributor[] };
    safety_crisis: { score: number; maxScore: 25; contributors: Contributor[] };
    vulnerability_health: { score: number; maxScore: 25; contributors: Contributor[] };
    chronicity_system: { score: number; maxScore: 25; contributors: Contributor[] };
  };
  placementRule: string;            // The rule that determined the level
  overridesApplied: string[];       // e.g., ["fleeing_dv → floor Level 0"]
  topFactors: string[];             // Top 3 human-readable factors
  generatedAt: string;              // ISO timestamp
  policyPackVersion: string;        // e.g., "v1.0.0"
}

interface Contributor {
  signal: string;       // field name
  value: string;        // actual value
  points: number;       // points contributed
  label: string;        // human readable: "Currently unsheltered"
}
```

### Example Card

```json
{
  "level": 0,
  "levelLabel": "Crisis / Street",
  "priorityTier": "Critical",
  "totalScore": 78,
  "dimensions": {
    "housing_stability": {
      "score": 22,
      "maxScore": 25,
      "contributors": [
        { "signal": "current_living_situation", "value": "unsheltered", "points": 10, "label": "Currently unsheltered" },
        { "signal": "at_risk_of_losing", "value": "true", "points": 5, "label": "At risk of losing current situation" },
        { "signal": "how_long_current", "value": "over_1_year", "points": 3, "label": "Homeless for over 1 year" },
        { "signal": "can_return_to_previous", "value": "false", "points": 2, "label": "Cannot return to previous housing" },
        { "signal": "eviction_notice", "value": "true", "points": 5, "label": "Has eviction notice" }
      ]
    },
    "safety_crisis": {
      "score": 25,
      "maxScore": 25,
      "contributors": [
        { "signal": "fleeing_dv", "value": "true", "points": 10, "label": "Fleeing domestic violence" },
        { "signal": "suicidal_ideation_recent", "value": "true", "points": 8, "label": "Recent suicidal ideation" },
        { "signal": "experienced_violence_recently", "value": "true", "points": 5, "label": "Experienced violence recently" },
        { "signal": "feels_safe_current_location", "value": "no", "points": 5, "label": "Does not feel safe" }
      ]
    },
    "vulnerability_health": {
      "score": 18,
      "maxScore": 25,
      "contributors": [
        { "signal": "chronic_conditions", "value": "['mental_health', 'substance_use_disorder', 'physical_disability']", "points": 6, "label": "3+ chronic health conditions" },
        { "signal": "needs_medication", "value": "true", "points": 4, "label": "Needs medication but lacks access" },
        { "signal": "self_care_difficulty", "value": "significant_difficulty", "points": 3, "label": "Significant difficulty with self-care" },
        { "signal": "has_dependents", "value": "true", "points": 3, "label": "Has dependent children" },
        { "signal": "has_health_insurance", "value": "false", "points": 2, "label": "No health insurance" }
      ]
    },
    "chronicity_system": {
      "score": 13,
      "maxScore": 25,
      "contributors": [
        { "signal": "currently_chronic", "value": "true", "points": 8, "label": "Chronically homeless (12+ months)" },
        { "signal": "total_homeless_episodes", "value": "5", "points": 5, "label": "5 episodes of homelessness" }
      ]
    }
  },
  "placementRule": "safety_crisis_score ≥ 20 → Level 0",
  "overridesApplied": ["fleeing_dv → floor Level 0"],
  "topFactors": [
    "Fleeing domestic violence",
    "Currently unsheltered",
    "Recent suicidal ideation"
  ],
  "generatedAt": "2026-02-18T12:00:00Z",
  "policyPackVersion": "v1.0.0"
}
```

---

## 6. Action Plan Generation

Each placement generates a 3-horizon action plan from a deterministic task library.

### Horizons

| Horizon | Timeframe | Purpose |
|---------|-----------|---------|
| **Immediate** | 0–24 hours | Crisis stabilization, safety |
| **Short-term** | 1–7 days | Service connection, documentation |
| **Medium-term** | 30–90 days | Stability building, goal work |

### Task Library Structure

```typescript
interface ActionTask {
  id: string;
  horizon: 'immediate' | 'short_term' | 'medium_term';
  category: string;       // housing, safety, health, income, legal, etc.
  title: string;
  description: string;
  triggerConditions: TriggerCondition[];  // when to include this task
  priority: 'critical' | 'high' | 'medium' | 'low';
  resourceTypes: string[];  // types of resources to link
}

interface TriggerCondition {
  field: string;
  operator: 'eq' | 'in' | 'gte' | 'lte' | 'exists';
  value: any;
}
```

### Example Tasks

| Horizon | Trigger | Task |
|---------|---------|------|
| Immediate | `fleeing_dv = true` | Contact local DV hotline; secure DV shelter bed |
| Immediate | `suicidal_ideation_recent = true` | Crisis counselor referral; 988 Suicide & Crisis Lifeline |
| Immediate | `current_living_situation = unsheltered` | Identify nearest shelter with available beds |
| Short-term | `has_valid_id = false` | Assist with obtaining state ID / birth certificate |
| Short-term | `has_health_insurance = false` | Screen for Medicaid / marketplace eligibility |
| Short-term | `has_any_income = false` | SSI/SSDI screening; SNAP application |
| Medium-term | `wants_employment_help = true` | Connect with job training program |
| Medium-term | `housing_preference = rapid_rehousing` | Initiate rapid re-housing application |
| Medium-term | `barriers_to_housing includes criminal_record` | Legal aid referral for record review |

### Plan Generation Algorithm

```
FOR each task in TaskLibrary:
  IF ALL triggerConditions match intake_response:
    ADD task to action_plan[task.horizon]
SORT each horizon by priority (critical → low)
ATTACH matching local resources from resources table
```

---

## 7. Database Model Plan

### New Tables (Prisma Schema)

```prisma
// ── V2 Intake Models ──────────────────────────────────────────

model IntakeResponse {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  userId          String?
  sessionId       String   @unique  // anonymous tracking
  status          IntakeStatus @default(IN_PROGRESS)
  
  // Raw wizard responses stored as JSON per module
  consentData     Json?
  demographicsData Json?
  housingData     Json?
  safetyData      Json?
  healthData      Json?
  historyData     Json?
  incomeData      Json?
  goalsData       Json?
  
  // Computed fields
  completedModules String[]  // ["consent", "demographics", ...]
  completedAt      DateTime?
  dvSafeMode       Boolean  @default(false)
  
  // Relations
  user            users?    @relation(fields: [userId], references: [id])
  stabilityScore  StabilityScore?
  actionPlan      ActionPlan?
  ceEvents        CoordinatedEntryEvent[]
  
  @@index([userId])
  @@index([sessionId])
  @@index([status])
  @@index([createdAt])
  @@map("intake_responses")
}

model StabilityScore {
  id                    String   @id @default(cuid())
  createdAt             DateTime @default(now())
  intakeResponseId      String   @unique
  
  // Dimension scores
  housingStability      Int      // 0–25
  safetyCrisis          Int      // 0–25
  vulnerabilityHealth   Int      // 0–25
  chronicitySystem      Int      // 0–25
  totalScore            Int      // 0–100
  
  // Placement
  stabilityLevel        Int      // 0–5
  priorityTier          PriorityTier
  placementRule         String   // which rule matched
  overridesApplied      String[] // override rules triggered
  
  // Explainability (full card JSON)
  explainabilityCard    Json
  
  // Versioning
  policyPackVersion     String   @default("v1.0.0")
  scoringEngineVersion  String   @default("v1.0.0")
  
  // Relations
  intakeResponse        IntakeResponse @relation(fields: [intakeResponseId], references: [id], onDelete: Cascade)
  
  @@index([stabilityLevel])
  @@index([priorityTier])
  @@index([createdAt])
  @@map("stability_scores")
}

model ActionPlan {
  id                String   @id @default(cuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  intakeResponseId  String   @unique
  
  // Tasks organized by horizon
  immediateTasks    Json     // ActionTask[]
  shortTermTasks    Json     // ActionTask[]
  mediumTermTasks   Json     // ActionTask[]
  
  // Status tracking
  status            ActionPlanStatus @default(GENERATED)
  reviewedBy        String?
  reviewedAt        DateTime?
  
  // Relations
  intakeResponse    IntakeResponse @relation(fields: [intakeResponseId], references: [id], onDelete: Cascade)
  
  @@index([status])
  @@index([createdAt])
  @@map("action_plans")
}

model CoordinatedEntryEvent {
  id                String   @id @default(cuid())
  createdAt         DateTime @default(now())
  intakeResponseId  String
  eventType         CEEventType
  eventData         Json
  exportedAt        DateTime?
  
  // Relations
  intakeResponse    IntakeResponse @relation(fields: [intakeResponseId], references: [id], onDelete: Cascade)
  
  @@index([intakeResponseId])
  @@index([eventType])
  @@index([createdAt])
  @@map("coordinated_entry_events")
}

// ── V2 Enums ──────────────────────────────────────────────────

enum IntakeStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
  EXPIRED
}

enum PriorityTier {
  CRITICAL
  HIGH
  MODERATE
  LOWER
}

enum ActionPlanStatus {
  GENERATED
  REVIEWED
  IN_PROGRESS
  COMPLETED
}

enum CEEventType {
  INTAKE_COMPLETED
  SCORE_COMPUTED
  PLAN_GENERATED
  REFERRAL_MADE
  STATUS_CHANGE
}
```

### Migration Strategy

- Migration file: `prisma/migrations/YYYYMMDD_v2_intake_tables/migration.sql`
- **Non-destructive**: Only `CREATE TABLE` and `CREATE INDEX` — no `ALTER` on existing V1 tables.
- The only V1 table touched is `users` which gets a new optional relation field (`intakeResponses IntakeResponse[]`).

---

## 8. Privacy & Safety (DV-Safe Mode)

### Activation

DV-safe mode is activated when:
- User explicitly enables `consent_dv_safe_mode = true`, OR
- User answers `fleeing_dv = true` or `fleeing_trafficking = true` (auto-activated)

### Behavior

| Aspect | Normal Mode | DV-Safe Mode |
|--------|-------------|--------------|
| Location fields | Stored normally | Redacted before storage (`[REDACTED]`) |
| HMIS export | Full fields | Location fields omitted |
| Session | Standard timeout | Panic button clears session + redirects to weather site |
| Explainability card | Full detail | Omit specific DV/trafficking signal values |
| API responses | Standard | Never include location in JSON responses |
| Audit log | Normal | Flag as `dv_safe` to restrict admin visibility |

### Panic Button

The frontend wizard includes a floating "Quick Exit" button (styled inconspicuously) that:
1. Clears all form state from memory
2. Clears browser history for current page
3. Redirects to `weather.gov` (a neutral site)
4. Does NOT save partial intake data

---

## 9. Audit & Fairness

### Audit Trail

Every intake generates audit events:

| Event | Data Captured |
|-------|---------------|
| `INTAKE_STARTED` | timestamp, sessionId, modules loaded |
| `MODULE_COMPLETED` | timestamp, moduleId, field count |
| `SCORE_COMPUTED` | timestamp, all dimension scores, placementRule, policyPackVersion |
| `PLAN_GENERATED` | timestamp, task count per horizon |
| `INTAKE_ABANDONED` | timestamp, last completed module |

### Fairness Monitoring (Deferred – Phase 2+)

Aggregate reporting to detect bias:
- Score distribution by `race_ethnicity`, `gender`, `veteran_status`
- Level distribution by demographic group
- Outlier detection for scoring anomalies

> **Note**: Individual-level demographic data is never used in scoring. Fairness monitoring is aggregate-only and opt-in.

---

## 10. HMIS / CE Export

### Field Mapping (HMIS CSV 2024)

| V2 Field | HMIS Field | Element # |
|----------|------------|-----------|
| `first_name` | `FirstName` | 3.01 |
| `last_name` | `LastName` | 3.01 |
| `date_of_birth` | `DOB` | 3.03 |
| `gender` | `Gender` | 3.06 |
| `race_ethnicity` | `Race`/`Ethnicity` | 3.04/3.05 |
| `veteran_status` | `VeteranStatus` | 3.07 |
| `current_living_situation` | `LivingSituation` | 3.917 |
| `fleeing_dv` | `DomesticViolenceVictim` | 4.11 |
| `chronic_conditions` | `DisablingCondition` | 3.08 |

### Export Format

```typescript
interface HMISExport {
  format: 'HMIS_CSV_2024';
  generatedAt: string;
  dvSafeMode: boolean;  // if true, location fields are null
  records: HMISRecord[];
}
```

---

## 11. V1 → V2 Reconciliation

### Stage vs Level Mapping

V1 uses a 7-stage progression (design docs only, not implemented in code). V2 uses a 6-level stability spectrum. These are **orthogonal concepts**:

- **V2 Level** = current assessed *state* (snapshot of where someone is)
- **V1 Stage** = *journey milestone* (progress through a program)

### Coexistence Strategy

| Aspect | V1 | V2 | Notes |
|--------|----|----|-------|
| Data Model | `profiles` table | `intake_responses` + `stability_scores` | Separate tables, linked via `userId` |
| Scoring | `UrgencyAssessmentService` (6-layer) | `computeScores()` (4-dimension) | V2 does NOT replace V1 urgency scoring |
| Routes | `/api/profile/*` | `/api/v2/intake/*` | Separate route namespace |
| Feature Flag | Always on | `ENABLE_V2_INTAKE` | V2 is opt-in |

### Migration Path (Future)

When V2 is production-validated:
1. Users with V1 profiles can optionally complete V2 intake
2. V2 scores supplement (not replace) V1 urgency scores
3. Admin dashboard shows both V1 and V2 views
4. Full V1 deprecation is a future decision, not part of this spec

---

## 12. Feature Flag & Rollout

### Environment Variable

```env
ENABLE_V2_INTAKE=true   # Enable V2 intake wizard and scoring
```

### Server-Side Guard

```typescript
// In intakeV2 route handler
if (process.env.ENABLE_V2_INTAKE !== 'true') {
  return res.status(404).json({ error: 'V2 Intake is not enabled' });
}
```

### Client-Side Guard

```typescript
// In Next.js page
const v2Enabled = process.env.NEXT_PUBLIC_ENABLE_V2_INTAKE === 'true';
if (!v2Enabled) redirect('/');
```

### Rollout Phases

| Phase | Scope | Gate |
|-------|-------|------|
| Alpha | Dev/staging only | Feature flag on staging |
| Beta | Internal testers + select partners | Allow-list of user IDs |
| GA | All users | Feature flag fully on |

---

## 13. Open Questions & Deferred Items

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | **Policy Pack versioning** | Deferred | Architecture spec calls for policy packs; V1 uses a single config. Implement json-based policy packs in Phase 2+. |
| 2 | **Full SPDAT-depth assessment** | Deferred | Requires case manager role, not self-service intake. |
| 3 | **Localization / i18n** | Deferred | Wizard text needs translation framework. |
| 4 | **Offline / PWA mode** | Deferred | Scoring engine is offline-ready; form persistence needs service worker. |
| 5 | **Multi-household intake** | Deferred | Current wizard is single-person. Family intake needs household model. |
| 6 | **Inter-agency data sharing** | Deferred | CE referral protocol requires partner agreements. |
| 7 | **Fairness monitoring dashboard** | Deferred | Aggregate bias detection runs, but no admin UI yet. |
| 8 | **Reassessment scheduling** | Deferred | Auto-trigger re-intake at intervals (30/60/90 days). |
| 9 | **DV-safe mode UX testing** | Deferred | Panic button and session clearing need accessibility review. |
| 10 | **V1 Stage ↔ V2 Level bridging** | Deferred | Mapping between progression stages and stability levels. |

---

*End of V2 Intake Specification*
