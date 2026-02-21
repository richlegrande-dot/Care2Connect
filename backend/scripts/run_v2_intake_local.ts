/**
 * V2 Intake — Manual Test Harness
 *
 * Runs the full scoring pipeline with sample personas and prints results.
 * No server needed — directly exercises computeScores + buildExplanation + generatePlan.
 *
 * Usage: npx ts-node backend/scripts/run_v2_intake_local.ts
 */

import { computeScores, type IntakeData } from '../src/intake/v2/scoring/computeScores';
import { buildExplanation } from '../src/intake/v2/explainability/buildExplanation';
import { generatePlan } from '../src/intake/v2/action_plans/generatePlan';

// ── Sample Personas ────────────────────────────────────────────

const PERSONAS: Record<string, IntakeData> = {
  'Crisis — DV Survivor, Unsheltered': {
    demographics: {
      first_name: 'Maria',
      date_of_birth: '1990-05-15',
      gender: 'female',
      has_dependents: true,
      dependent_ages: [4, 7],
      veteran_status: false,
    },
    housing: {
      current_living_situation: 'unsheltered',
      how_long_current: '1_4_weeks',
      at_risk_of_losing: true,
      can_return_to_previous: false,
    },
    safety: {
      fleeing_dv: true,
      experienced_violence_recently: true,
      feels_safe_current_location: 'no',
      mental_health_current: 'severe_crisis',
      suicidal_ideation_recent: false,
    },
    health: {
      needs_medication: true,
      has_access_to_medication: false,
      has_health_insurance: false,
      chronic_conditions: ['mental_health'],
    },
    history: {
      total_homeless_episodes: 3,
      total_homeless_months: 8,
    },
    income: {
      has_any_income: false,
      has_valid_id: false,
    },
    goals: {
      top_priorities: ['safety', 'housing', 'childcare'],
    },
  },

  'Stable — Housed with Support': {
    demographics: {
      first_name: 'James',
      date_of_birth: '1975-11-20',
      gender: 'male',
      veteran_status: false,
      has_dependents: false,
    },
    housing: {
      current_living_situation: 'permanent_housing',
      how_long_current: 'over_1_year',
    },
    safety: {
      feels_safe_current_location: 'yes',
      mental_health_current: 'mild_concerns',
    },
    health: {
      has_health_insurance: true,
      chronic_conditions: ['diabetes'],
      last_medical_visit: '1_6_months',
    },
    income: {
      has_any_income: true,
      monthly_income_dollars: 2200,
      has_valid_id: true,
      currently_employed: true,
    },
    goals: {
      top_priorities: ['healthcare'],
    },
  },

  'Chronic — Veteran, Emergency Shelter': {
    demographics: {
      first_name: 'Robert',
      date_of_birth: '1968-03-10',
      gender: 'male',
      veteran_status: true,
      has_dependents: false,
    },
    housing: {
      current_living_situation: 'emergency_shelter',
      how_long_current: 'over_1_year',
    },
    safety: {
      feels_safe_current_location: 'sometimes',
      substance_use_current: 'regular',
      mental_health_current: 'moderate_concerns',
    },
    health: {
      chronic_conditions: ['mental_health', 'substance_use_disorder', 'physical_disability'],
      has_health_insurance: true,
      insurance_type: 'va',
      self_care_difficulty: 'some_difficulty',
    },
    history: {
      currently_chronic: true,
      total_homeless_episodes: 5,
      total_homeless_months: 36,
      emergency_services_use: '6_plus_times',
      institutional_history: ['jail_prison', 'psychiatric_facility'],
    },
    income: {
      has_any_income: true,
      income_sources: ['veterans_benefits'],
      has_valid_id: true,
    },
    goals: {
      top_priorities: ['housing', 'mental_health', 'substance_treatment'],
      housing_preference: 'permanent_supportive',
    },
  },

  'Transitional — Youth, Couch Surfing': {
    demographics: {
      first_name: 'Alex',
      date_of_birth: '2004-08-22',
      gender: 'non_binary',
      has_dependents: false,
      veteran_status: false,
    },
    housing: {
      current_living_situation: 'staying_with_others',
      how_long_current: '1_3_months',
      at_risk_of_losing: true,
      can_return_to_previous: false,
    },
    safety: {
      feels_safe_current_location: 'mostly',
      mental_health_current: 'moderate_concerns',
    },
    health: {
      has_health_insurance: false,
      chronic_conditions: ['none'],
    },
    history: {
      total_homeless_episodes: 2,
      total_homeless_months: 4,
      institutional_history: ['foster_care'],
    },
    income: {
      has_any_income: false,
      has_valid_id: true,
      wants_employment_help: true,
    },
    goals: {
      top_priorities: ['housing', 'employment', 'education'],
      housing_preference: 'rapid_rehousing',
    },
  },
};

// ── Run ────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════╗');
console.log('║   V2 Intake — Local Test Harness                ║');
console.log('╚══════════════════════════════════════════════════╝\n');

for (const [label, data] of Object.entries(PERSONAS)) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`PERSONA: ${label}`);
  console.log('─'.repeat(60));

  const scores = computeScores(data);
  const card = buildExplanation(scores, false);
  const plan = generatePlan(data);

  console.log(`\n  Level: ${card.level} — ${card.levelLabel}`);
  console.log(`  Tier:  ${card.priorityTier}`);
  console.log(`  Score: ${card.totalScore}/100`);
  console.log(`    Housing Stability:   ${scores.dimensions.housing_stability.score}/25`);
  console.log(`    Safety & Crisis:     ${scores.dimensions.safety_crisis.score}/25`);
  console.log(`    Vulnerability:       ${scores.dimensions.vulnerability_health.score}/25`);
  console.log(`    Chronicity:          ${scores.dimensions.chronicity_system.score}/25`);
  console.log(`  Rule:  ${card.placementRule}`);

  if (card.overridesApplied.length > 0) {
    console.log(`  Overrides: ${card.overridesApplied.join(', ')}`);
  }

  console.log(`\n  Top Factors:`);
  card.topFactors.forEach((f, i) => console.log(`    ${i + 1}. ${f}`));

  console.log(`\n  Action Plan (${plan.taskCount} tasks):`);
  if (plan.immediateTasks.length > 0) {
    console.log(`    Immediate (0-24h): ${plan.immediateTasks.length}`);
    plan.immediateTasks.forEach(t => console.log(`      [${t.priority}] ${t.title}`));
  }
  if (plan.shortTermTasks.length > 0) {
    console.log(`    Short-term (1-7d): ${plan.shortTermTasks.length}`);
    plan.shortTermTasks.forEach(t => console.log(`      [${t.priority}] ${t.title}`));
  }
  if (plan.mediumTermTasks.length > 0) {
    console.log(`    Medium-term (30-90d): ${plan.mediumTermTasks.length}`);
    plan.mediumTermTasks.forEach(t => console.log(`      [${t.priority}] ${t.title}`));
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log('All personas processed successfully.');
console.log('═'.repeat(60));
