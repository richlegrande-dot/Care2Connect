/**
 * V2 GA — Score Persona Cards
 *
 * Runs 5 representative personas through the V2 scoring engine and
 * prints dimension scores, stability levels, priority tiers, and
 * override information. Used for clinical calibration review.
 *
 * Usage:
 *   npx tsx scripts/ga/score_persona_cards.ts
 *   npx tsx scripts/ga/score_persona_cards.ts --json
 *   npx tsx scripts/ga/score_persona_cards.ts --output outreach/generated/persona_results.json
 *
 * @module scripts/ga
 */

import { computeScores, type IntakeData } from '../../backend/src/intake/v2/scoring/computeScores';

// ── Persona Definitions ────────────────────────────────────────

interface PersonaCard {
  id: string;
  name: string;
  description: string;
  expectedTier: string;
  data: IntakeData;
}

const PERSONAS: PersonaCard[] = [
  {
    id: 'maria-dv',
    name: 'Maria — DV Survivor',
    description: 'Fleeing domestic violence with 2 children, currently unsheltered, has protective order',
    expectedTier: 'CRITICAL',
    data: {
      consent: { agreed: true, timestamp: new Date().toISOString() },
      demographics: {
        date_of_birth: '1992-06-15',
        has_dependents: true,
        dependent_ages: [4, 7],
      },
      housing: {
        current_living_situation: 'unsheltered',
        at_risk_of_losing: true,
        eviction_notice: false,
        how_long_current: 'less_than_1_month',
        can_return_to_previous: false,
      },
      safety: {
        fleeing_dv: true,
        fleeing_trafficking: false,
        has_protective_order: true,
        experienced_violence_recently: true,
        feels_safe_current_location: false,
        suicidal_ideation_recent: false,
        mental_health_current: 'significant_impact',
        substance_use_current: 'none',
      },
      health: {
        chronic_conditions: ['anxiety', 'ptsd'],
        currently_pregnant: false,
        needs_immediate_medical: false,
        needs_medication: true,
        has_access_to_medication: false,
        self_care_difficulty: 'some_difficulty',
        has_health_insurance: false,
        last_medical_visit: 'over_1_year',
      },
      history: {
        currently_chronic: false,
        total_homeless_episodes: 1,
        total_homeless_months: 2,
        emergency_services_use: '1_2_times',
        incarceration_recent: false,
        institutional_history: ['none'],
      },
      income: {
        has_any_income: false,
        has_valid_id: true,
      },
      goals: {
        primary_goal: 'safe_housing',
        willing_to_engage_services: true,
      },
    },
  },
  {
    id: 'james-stable',
    name: 'James — Stable Individual',
    description: 'Employed, housed in supported housing, managing well with minimal service needs',
    expectedTier: 'LOWER',
    data: {
      consent: { agreed: true, timestamp: new Date().toISOString() },
      demographics: {
        date_of_birth: '1985-03-20',
        has_dependents: false,
      },
      housing: {
        current_living_situation: 'housed_supported',
        at_risk_of_losing: false,
        eviction_notice: false,
        how_long_current: 'more_than_1_year',
        can_return_to_previous: true,
      },
      safety: {
        fleeing_dv: false,
        fleeing_trafficking: false,
        has_protective_order: false,
        experienced_violence_recently: false,
        feels_safe_current_location: true,
        suicidal_ideation_recent: false,
        mental_health_current: 'stable',
        substance_use_current: 'none',
      },
      health: {
        chronic_conditions: ['none'],
        currently_pregnant: false,
        needs_immediate_medical: false,
        needs_medication: false,
        has_access_to_medication: true,
        self_care_difficulty: 'no_difficulty',
        has_health_insurance: true,
        last_medical_visit: 'within_6_months',
      },
      history: {
        currently_chronic: false,
        total_homeless_episodes: 1,
        total_homeless_months: 3,
        emergency_services_use: 'none',
        incarceration_recent: false,
        institutional_history: ['none'],
      },
      income: {
        has_any_income: true,
        has_valid_id: true,
      },
      goals: {
        primary_goal: 'maintain_housing',
        willing_to_engage_services: true,
      },
    },
  },
  {
    id: 'robert-veteran',
    name: 'Robert — Veteran, Chronic Homelessness',
    description: 'Vietnam-era veteran with chronic homelessness, substance use, and multiple ER visits',
    expectedTier: 'CRITICAL',
    data: {
      consent: { agreed: true, timestamp: new Date().toISOString() },
      demographics: {
        date_of_birth: '1955-11-08',
        has_dependents: false,
      },
      housing: {
        current_living_situation: 'unsheltered',
        at_risk_of_losing: true,
        eviction_notice: false,
        how_long_current: 'more_than_1_year',
        can_return_to_previous: false,
      },
      safety: {
        fleeing_dv: false,
        fleeing_trafficking: false,
        has_protective_order: false,
        experienced_violence_recently: false,
        feels_safe_current_location: false,
        suicidal_ideation_recent: true,
        mental_health_current: 'significant_impact',
        substance_use_current: 'active_use',
      },
      health: {
        chronic_conditions: ['diabetes', 'hypertension', 'ptsd'],
        currently_pregnant: false,
        needs_immediate_medical: true,
        needs_medication: true,
        has_access_to_medication: false,
        self_care_difficulty: 'significant_difficulty',
        has_health_insurance: false,
        last_medical_visit: 'over_1_year',
      },
      history: {
        currently_chronic: true,
        total_homeless_episodes: 6,
        total_homeless_months: 48,
        emergency_services_use: '6_plus_times',
        incarceration_recent: false,
        institutional_history: ['psychiatric', 'substance_treatment'],
      },
      income: {
        has_any_income: false,
        has_valid_id: false,
      },
      goals: {
        primary_goal: 'stable_housing',
        willing_to_engage_services: true,
      },
    },
  },
  {
    id: 'youth-aging-out',
    name: 'Youth — Aging Out of Foster Care',
    description: '19-year-old aging out of foster care, unsheltered, no income, mental health concerns',
    expectedTier: 'HIGH',
    data: {
      consent: { agreed: true, timestamp: new Date().toISOString() },
      demographics: {
        date_of_birth: '2007-01-10',
        has_dependents: false,
      },
      housing: {
        current_living_situation: 'unsheltered',
        at_risk_of_losing: true,
        eviction_notice: false,
        how_long_current: 'less_than_3_months',
        can_return_to_previous: false,
      },
      safety: {
        fleeing_dv: false,
        fleeing_trafficking: false,
        has_protective_order: false,
        experienced_violence_recently: false,
        feels_safe_current_location: false,
        suicidal_ideation_recent: false,
        mental_health_current: 'significant_impact',
        substance_use_current: 'none',
      },
      health: {
        chronic_conditions: ['none'],
        currently_pregnant: false,
        needs_immediate_medical: false,
        needs_medication: false,
        has_access_to_medication: true,
        self_care_difficulty: 'some_difficulty',
        has_health_insurance: false,
        last_medical_visit: 'over_1_year',
      },
      history: {
        currently_chronic: false,
        total_homeless_episodes: 3,
        total_homeless_months: 8,
        emergency_services_use: '3_5_times',
        incarceration_recent: false,
        institutional_history: ['foster_care'],
      },
      income: {
        has_any_income: false,
        has_valid_id: false,
      },
      goals: {
        primary_goal: 'first_apartment',
        willing_to_engage_services: true,
      },
    },
  },
  {
    id: 'moderate-needs',
    name: 'Sandra — Moderate Needs',
    description: 'Recently evicted with child, part-time income, health issues, transitional housing',
    expectedTier: 'MODERATE',
    data: {
      consent: { agreed: true, timestamp: new Date().toISOString() },
      demographics: {
        date_of_birth: '1978-09-22',
        has_dependents: true,
        dependent_ages: [12],
      },
      housing: {
        current_living_situation: 'transitional',
        at_risk_of_losing: true,
        eviction_notice: false,
        how_long_current: 'less_than_3_months',
        can_return_to_previous: false,
      },
      safety: {
        fleeing_dv: false,
        fleeing_trafficking: false,
        has_protective_order: false,
        experienced_violence_recently: false,
        feels_safe_current_location: true,
        suicidal_ideation_recent: false,
        mental_health_current: 'moderate_impact',
        substance_use_current: 'none',
      },
      health: {
        chronic_conditions: ['asthma', 'depression'],
        currently_pregnant: false,
        needs_immediate_medical: false,
        needs_medication: true,
        has_access_to_medication: false,
        self_care_difficulty: 'no_difficulty',
        has_health_insurance: false,
        last_medical_visit: 'over_1_year',
      },
      history: {
        currently_chronic: false,
        total_homeless_episodes: 2,
        total_homeless_months: 5,
        emergency_services_use: '1_2_times',
        incarceration_recent: false,
        institutional_history: ['none'],
      },
      income: {
        has_any_income: true,
        has_valid_id: true,
      },
      goals: {
        primary_goal: 'permanent_housing',
        willing_to_engage_services: true,
      },
    },
  },
];

// ── Output Formatting ──────────────────────────────────────────

function formatPersonaResult(persona: PersonaCard, result: ReturnType<typeof computeScores>): string {
  const lines: string[] = [];
  const bar = '─'.repeat(60);

  lines.push(bar);
  lines.push(`  ${persona.name}`);
  lines.push(`  ${persona.description}`);
  lines.push(bar);
  lines.push('');

  // Dimensions
  lines.push('  Dimensions:');
  for (const [key, dim] of Object.entries(result.dimensions)) {
    const pct = Math.round((dim.score / dim.maxScore) * 100);
    const gauge = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    lines.push(`    ${key.padEnd(25)} ${String(dim.score).padStart(2)}/${dim.maxScore}  ${gauge} ${pct}%`);

    // Top contributors
    if (dim.contributors.length > 0) {
      for (const c of dim.contributors.slice(0, 3)) {
        lines.push(`      └─ ${c.label} (+${c.points})`);
      }
    }
  }

  lines.push('');
  lines.push(`  Total Score:      ${result.totalScore}/100`);
  lines.push(`  Stability Level:  ${result.stabilityLevel}`);
  lines.push(`  Priority Tier:    ${result.priorityTier}`);
  lines.push(`  Placement Rule:   ${result.placementRule}`);
  lines.push(`  Policy Pack:      ${result.policyPackVersion}`);
  lines.push(`  Input Hash:       ${result.inputHash}`);

  if (result.overridesApplied.length > 0) {
    lines.push('');
    lines.push('  Overrides Applied:');
    for (const o of result.overridesApplied) {
      lines.push(`    ⚡ ${o}`);
    }
  }

  // Expected tier check
  lines.push('');
  const match = result.priorityTier === persona.expectedTier;
  lines.push(`  Expected Tier:    ${persona.expectedTier} ${match ? '✓ MATCH' : '✗ MISMATCH'}`);

  return lines.join('\n');
}

// ── Main ───────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : null;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          V2 Intake — Persona Card Scoring Results           ║');
  console.log('║               Clinical Calibration Evidence                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Date:     ${new Date().toISOString()}`);
  console.log(`  Personas: ${PERSONAS.length}`);
  console.log('');

  const results: Array<{
    persona: string;
    id: string;
    expectedTier: string;
    actualTier: string;
    match: boolean;
    totalScore: number;
    stabilityLevel: number;
    dimensions: Record<string, { score: number; maxScore: number }>;
    overrides: string[];
  }> = [];

  let mismatches = 0;

  for (const persona of PERSONAS) {
    const result = computeScores(persona.data);
    const match = result.priorityTier === persona.expectedTier;
    if (!match) mismatches++;

    if (!jsonOutput) {
      console.log(formatPersonaResult(persona, result));
      console.log('');
    }

    results.push({
      persona: persona.name,
      id: persona.id,
      expectedTier: persona.expectedTier,
      actualTier: result.priorityTier,
      match,
      totalScore: result.totalScore,
      stabilityLevel: result.stabilityLevel,
      dimensions: Object.fromEntries(
        Object.entries(result.dimensions).map(([k, v]) => [k, { score: v.score, maxScore: v.maxScore }])
      ),
      overrides: result.overridesApplied,
    });
  }

  // Summary
  if (!jsonOutput) {
    console.log('═'.repeat(60));
    console.log('  SUMMARY');
    console.log('═'.repeat(60));
    console.log(`  Total personas:  ${PERSONAS.length}`);
    console.log(`  Matches:         ${PERSONAS.length - mismatches}/${PERSONAS.length}`);
    console.log(`  Mismatches:      ${mismatches}`);
    console.log('');
    console.log('  Tier Distribution:');
    const tierCounts: Record<string, number> = {};
    for (const r of results) {
      tierCounts[r.actualTier] = (tierCounts[r.actualTier] || 0) + 1;
    }
    for (const [tier, count] of Object.entries(tierCounts).sort()) {
      console.log(`    ${tier.padEnd(12)} ${count}`);
    }
  }

  // JSON output
  if (jsonOutput || outputPath) {
    const jsonData = JSON.stringify({
      generatedAt: new Date().toISOString(),
      personaCount: PERSONAS.length,
      matches: PERSONAS.length - mismatches,
      mismatches,
      results,
    }, null, 2);

    if (outputPath) {
      const fs = require('fs');
      const path = require('path');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, jsonData, 'utf-8');
      console.log(`\n  Results written to: ${outputPath}`);
    }

    if (jsonOutput) {
      console.log(jsonData);
    }
  }

  // Exit code based on mismatches
  if (mismatches > 0) {
    console.log(`\n  WARNING: ${mismatches} persona(s) scored outside expected tier.`);
    console.log('  Review scoring constants or update expected tiers.');
    process.exit(1);
  }
}

main();
