/**
 * V2 GA — Calibration Snapshot Generator
 *
 * Generates a calibration report from the persona cards, producing
 * JSON and Markdown summary files for clinical review.
 *
 * Usage:
 *   npx tsx scripts/ga/run_calibration_snapshot.ts
 *   npx tsx scripts/ga/run_calibration_snapshot.ts --output outreach/generated/calibration
 *
 * Output:
 *   - calibration_report.json  — Full statistics
 *   - calibration_summary.md   — Human-readable summary
 *
 * @module scripts/ga
 */

import * as fs from 'fs';
import * as path from 'path';
import { computeScores, type IntakeData } from '../../backend/src/intake/v2/scoring/computeScores';
import { generateCalibrationReport } from '../../backend/src/intake/v2/calibration/generateCalibrationReport';
import type { CalibrationSession } from '../../backend/src/intake/v2/calibration/calibrationTypes';
import { POLICY_PACK_VERSION, SCORING_ENGINE_VERSION } from '../../backend/src/intake/v2/constants';

// ── Persona Data (same as score_persona_cards.ts) ──────────────

const PERSONA_DATA: Array<{ name: string; data: IntakeData }> = [
  {
    name: 'Maria — DV Survivor',
    data: {
      consent: { agreed: true },
      demographics: { date_of_birth: '1992-06-15', has_dependents: true, dependent_ages: [4, 7] },
      housing: { current_living_situation: 'unsheltered', at_risk_of_losing: true, can_return_to_previous: false },
      safety: { fleeing_dv: true, has_protective_order: true, experienced_violence_recently: true, feels_safe_current_location: false, mental_health_current: 'significant_impact' },
      health: { chronic_conditions: ['anxiety', 'ptsd'], needs_medication: true, has_access_to_medication: false, has_health_insurance: false, last_medical_visit: 'over_1_year' },
      history: { total_homeless_episodes: 1, total_homeless_months: 2 },
      income: { has_any_income: false, has_valid_id: true },
      goals: { primary_goal: 'safe_housing' },
    },
  },
  {
    name: 'James — Stable',
    data: {
      consent: { agreed: true },
      demographics: { date_of_birth: '1985-03-20', has_dependents: false },
      housing: { current_living_situation: 'housed_supported', at_risk_of_losing: false, can_return_to_previous: true },
      safety: { feels_safe_current_location: true },
      health: { chronic_conditions: ['none'], has_health_insurance: true, last_medical_visit: 'within_6_months' },
      history: { total_homeless_episodes: 1, total_homeless_months: 3 },
      income: { has_any_income: true, has_valid_id: true },
      goals: { primary_goal: 'maintain_housing' },
    },
  },
  {
    name: 'Robert — Veteran',
    data: {
      consent: { agreed: true },
      demographics: { date_of_birth: '1955-11-08', has_dependents: false },
      housing: { current_living_situation: 'unsheltered', at_risk_of_losing: true, can_return_to_previous: false },
      safety: { suicidal_ideation_recent: true, mental_health_current: 'significant_impact', substance_use_current: 'active_use', feels_safe_current_location: false },
      health: { chronic_conditions: ['diabetes', 'hypertension', 'ptsd'], needs_immediate_medical: true, needs_medication: true, has_access_to_medication: false, self_care_difficulty: 'significant_difficulty', has_health_insurance: false, last_medical_visit: 'over_1_year' },
      history: { currently_chronic: true, total_homeless_episodes: 6, total_homeless_months: 48, emergency_services_use: '6_plus_times', institutional_history: ['psychiatric', 'substance_treatment'] },
      income: { has_any_income: false, has_valid_id: false },
      goals: { primary_goal: 'stable_housing' },
    },
  },
  {
    name: 'Youth — Aging Out',
    data: {
      consent: { agreed: true },
      demographics: { date_of_birth: '2007-01-10', has_dependents: false },
      housing: { current_living_situation: 'unsheltered', at_risk_of_losing: true, can_return_to_previous: false },
      safety: { feels_safe_current_location: false, mental_health_current: 'significant_impact' },
      health: { chronic_conditions: ['none'], self_care_difficulty: 'some_difficulty', has_health_insurance: false, last_medical_visit: 'over_1_year' },
      history: { total_homeless_episodes: 3, total_homeless_months: 8, emergency_services_use: '3_5_times', institutional_history: ['foster_care'] },
      income: { has_any_income: false, has_valid_id: false },
      goals: { primary_goal: 'first_apartment' },
    },
  },
  {
    name: 'Sandra — Moderate',
    data: {
      consent: { agreed: true },
      demographics: { date_of_birth: '1978-09-22', has_dependents: true, dependent_ages: [12] },
      housing: { current_living_situation: 'transitional', at_risk_of_losing: true, can_return_to_previous: false },
      safety: { feels_safe_current_location: true, mental_health_current: 'moderate_impact' },
      health: { chronic_conditions: ['asthma', 'depression'], needs_medication: true, has_access_to_medication: false, has_health_insurance: false, last_medical_visit: 'over_1_year' },
      history: { total_homeless_episodes: 2, total_homeless_months: 5 },
      income: { has_any_income: true, has_valid_id: true },
      goals: { primary_goal: 'permanent_housing' },
    },
  },
];

// ── Dimension Key Mapping ─────────────────────────────────────

const DIMENSION_MAP: Record<string, string> = {
  housing_stability: 'housing',
  safety_crisis: 'safety',
  vulnerability_health: 'vulnerability',
  chronicity_system: 'chronicity',
};

// ── Main ───────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);
  const outputIdx = args.indexOf('--output');
  const outputDir = outputIdx >= 0 ? args[outputIdx + 1] : 'outreach/generated/calibration';

  console.log('V2 Intake — Calibration Snapshot Generator');
  console.log('==========================================\n');

  // Score all personas
  const sessions: CalibrationSession[] = [];

  for (const persona of PERSONA_DATA) {
    const result = computeScores(persona.data);

    const session: CalibrationSession = {
      totalScore: result.totalScore,
      stabilityLevel: result.stabilityLevel,
      priorityTier: result.priorityTier,
      dimensionScores: {
        housing: result.dimensions.housing_stability.score,
        safety: result.dimensions.safety_crisis.score,
        vulnerability: result.dimensions.vulnerability_health.score,
        chronicity: result.dimensions.chronicity_system.score,
      },
      overridesApplied: result.overridesApplied,
      topContributors: Object.values(result.dimensions)
        .flatMap(d => d.contributors.map(c => c.label))
        .slice(0, 5),
    };

    sessions.push(session);
    console.log(`  Scored: ${persona.name} → ${result.priorityTier} (${result.totalScore}/100)`);
  }

  // Generate calibration report
  console.log('\nGenerating calibration report...');
  const report = generateCalibrationReport(sessions);

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Write JSON report
  const jsonPath = path.join(outputDir, 'calibration_report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`  [+] ${jsonPath}`);

  // Generate Markdown summary
  const md = generateMarkdownSummary(report, sessions);
  const mdPath = path.join(outputDir, 'calibration_summary.md');
  fs.writeFileSync(mdPath, md, 'utf-8');
  console.log(`  [+] ${mdPath}`);

  console.log(`\nCalibration snapshot complete. ${sessions.length} sessions analyzed.`);
}

function generateMarkdownSummary(
  report: ReturnType<typeof generateCalibrationReport>,
  sessions: CalibrationSession[]
): string {
  const lines: string[] = [];

  lines.push('# V2 Intake — Calibration Snapshot Report');
  lines.push('');
  lines.push(`**Generated**: ${report.generatedAt}`);
  lines.push(`**Policy Pack Version**: ${report.policyPackVersion}`);
  lines.push(`**Scoring Engine Version**: ${report.scoringEngineVersion}`);
  lines.push(`**Sessions Analyzed**: ${report.totalSessions}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Score Distribution
  lines.push('## Score Distribution');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Mean Total Score | ${report.meanTotalScore.toFixed(1)} |`);
  lines.push(`| Median Total Score | ${report.medianTotalScore.toFixed(1)} |`);
  lines.push(`| Std Dev | ${report.stdDevTotalScore.toFixed(1)} |`);
  lines.push(`| Min | ${report.minTotalScore} |`);
  lines.push(`| Max | ${report.maxTotalScore} |`);
  lines.push('');

  // Tier Distribution
  lines.push('## Priority Tier Distribution');
  lines.push('');
  lines.push('| Tier | Count | Percentage |');
  lines.push('|------|-------|-----------|');
  for (const tier of ['CRITICAL', 'HIGH', 'MODERATE', 'LOWER']) {
    const count = report.tierDistribution[tier] || 0;
    const pct = report.totalSessions > 0 ? ((count / report.totalSessions) * 100).toFixed(0) : '0';
    lines.push(`| ${tier} | ${count} | ${pct}% |`);
  }
  lines.push('');

  // Level Distribution
  lines.push('## Stability Level Distribution');
  lines.push('');
  lines.push('| Level | Count |');
  lines.push('|-------|-------|');
  for (let l = 0; l <= 5; l++) {
    const count = report.levelDistribution[l] || 0;
    lines.push(`| Level ${l} | ${count} |`);
  }
  lines.push('');

  // Dimension Averages
  lines.push('## Dimension Averages');
  lines.push('');
  lines.push('| Dimension | Mean | Median | Min | Max | Std Dev |');
  lines.push('|-----------|------|--------|-----|-----|---------|');
  for (const dim of report.dimensionAverages) {
    lines.push(`| ${dim.dimension} | ${dim.mean.toFixed(1)} | ${dim.median.toFixed(1)} | ${dim.min} | ${dim.max} | ${dim.stdDev.toFixed(1)} |`);
  }
  lines.push('');

  // Top Contributors
  if (report.topContributorsByFrequency.length > 0) {
    lines.push('## Top Scoring Contributors');
    lines.push('');
    lines.push('| Contributor | Frequency | Percentage |');
    lines.push('|-------------|-----------|-----------|');
    for (const c of report.topContributorsByFrequency) {
      lines.push(`| ${c.contributor} | ${c.count} | ${c.percentage}% |`);
    }
    lines.push('');
  }

  // Override Frequency
  if (report.overrideFrequency.length > 0) {
    lines.push('## Override Frequency');
    lines.push('');
    lines.push('| Override | Count | Percentage |');
    lines.push('|----------|-------|-----------|');
    for (const o of report.overrideFrequency) {
      lines.push(`| ${o.override} | ${o.count} | ${o.percentage}% |`);
    }
    lines.push('');
  }

  // Clinical Review Notes
  lines.push('---');
  lines.push('');
  lines.push('## Clinical Review Notes');
  lines.push('');
  lines.push('> This report was generated from persona card data for calibration review.');
  lines.push('> Production calibration should use real anonymized intake data.');
  lines.push('');
  lines.push('### Checklist');
  lines.push('');
  lines.push('- [ ] Score distribution matches expected population mix');
  lines.push('- [ ] DV override correctly elevates priority tier');
  lines.push('- [ ] Youth vulnerability scoring appropriate');
  lines.push('- [ ] Chronic homelessness detected and weighted correctly');
  lines.push('- [ ] Stable individuals score in LOWER tier as expected');

  return lines.join('\n');
}

main();
