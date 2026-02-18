/**
 * V2 Intake — Staging Smoke Test Script
 *
 * Runs a full end-to-end validation against the V2 Intake API:
 *   1. Verify version endpoint
 *   2. Verify health endpoint
 *   3. Create a session
 *   4. Submit all 8 modules (crisis persona)
 *   5. Complete intake
 *   6. Verify score result
 *   7. Verify explainability card
 *   8. Verify action plan
 *   9. Verify HMIS export (JSON + CSV)
 *  10. Verify fairness audit
 *  11. Verify calibration report
 *
 * Usage:
 *   npx tsx scripts/v2_staging_smoke.ts [BASE_URL] [AUTH_TOKEN]
 *
 * Defaults:
 *   BASE_URL  = http://localhost:3001
 *   AUTH_TOKEN = (none, works if ENABLE_V2_INTAKE_AUTH=false)
 *
 * Exit codes:
 *   0 = all checks pass
 *   1 = one or more checks failed
 *
 * @module scripts
 */

const BASE_URL = process.argv[2] || 'http://localhost:3001';
const AUTH_TOKEN = process.argv[3] || '';
const API = `${BASE_URL}/api/v2/intake`;

let passed = 0;
let failed = 0;
let sessionId = '';

// ── HTTP Helper ────────────────────────────────────────────────

async function api(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  acceptCsv = false,
): Promise<{ status: number; data: any; raw: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  if (acceptCsv) {
    // Just use query param, not Accept header
  }

  const opts: RequestInit = { method, headers };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API}${path}`, opts);
  const raw = await res.text();
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  return { status: res.status, data, raw };
}

function check(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ── Crisis Persona Data ────────────────────────────────────────

const CRISIS_PERSONA = {
  consent: {
    consent_data_collection: true,
    consent_age_confirmation: true,
    consent_dv_safe_mode: true,
  },
  demographics: {
    first_name: 'Maria',
    last_name: 'TestUser',
    date_of_birth: '1990-05-15',
    gender: 'female',
    race_ethnicity: 'hispanic_latino',
    veteran_status: 'no',
    has_dependents: true,
    dependent_count: 2,
    dependent_ages: [4, 7],
  },
  housing: {
    current_living_situation: 'unsheltered',
    how_long_current: 'less_than_3_months',
    at_risk_of_losing: true,
    eviction_notice: false,
    can_return_to_previous: false,
  },
  safety: {
    fleeing_dv: true,
    fleeing_trafficking: false,
    suicidal_ideation_recent: false,
    experienced_violence_recently: true,
    feels_safe_current_location: 'no',
    mental_health_current: 'moderate',
    substance_use_current: 'none',
  },
  health: {
    chronic_conditions: ['asthma'],
    currently_pregnant: false,
    needs_immediate_medical_attention: false,
    needs_medication: true,
    has_access_to_medication: false,
    self_care_difficulty: 'some',
    has_health_insurance: false,
  },
  history: {
    currently_chronic_homeless: false,
    total_homeless_episodes: 2,
    total_homeless_months: 8,
    emergency_services_use_6mo: 2,
    incarceration_recent: false,
    institutional_care_history: 0,
  },
  income: {
    has_any_income: false,
    employment_status: 'unemployed',
    has_valid_id: true,
  },
  goals: {
    top_priorities: ['safe_housing', 'safety'],
    housing_preference: 'dv_shelter',
    barriers_to_housing: ['domestic_violence', 'no_income'],
    wants_employment_help: true,
  },
};

// ── Test Sections ──────────────────────────────────────────────

async function testVersion(): Promise<void> {
  console.log('\n🔍 1. Version Endpoint');
  const { status, data } = await api('GET', '/version');
  check('GET /version returns 200', status === 200);
  check('policyPackVersion present', !!data?.policyPackVersion);
  check('scoringEngineVersion present', !!data?.scoringEngineVersion);
  check('migrationVersion present', !!data?.migrationVersion);
  check('featureFlags present', !!data?.featureFlags);
  if (data?.policyPackVersion) {
    console.log(`    Policy Pack: ${data.policyPackVersion}`);
    console.log(`    Engine: ${data.scoringEngineVersion}`);
    console.log(`    Migration: ${data.migrationVersion}`);
  }
}

async function testHealth(): Promise<void> {
  console.log('\n🔍 2. Health Endpoint');
  const { status, data } = await api('GET', '/health');
  check('GET /health returns 200', status === 200);
  check('status is healthy', data?.status === 'healthy');
  check('database connected', data?.database === 'connected');
  check('policyPackVersion present', !!data?.policyPackVersion);
}

async function testCreateSession(): Promise<void> {
  console.log('\n🔍 3. Create Session');
  const { status, data } = await api('POST', '/session');
  check('POST /session returns 201', status === 201);
  check('sessionId returned', !!data?.sessionId);
  if (data?.sessionId) {
    sessionId = data.sessionId;
    console.log(`    Session ID: ${sessionId}`);
  }
}

async function testSubmitModules(): Promise<void> {
  console.log('\n🔍 4. Submit Modules (Crisis Persona — Maria)');
  if (!sessionId) {
    console.log('  ⚠️  Skipped — no session ID');
    return;
  }

  const modules = [
    'consent', 'demographics', 'housing', 'safety',
    'health', 'history', 'income', 'goals',
  ] as const;

  for (const mod of modules) {
    const { status } = await api('PUT', `/session/${sessionId}`, {
      moduleId: mod,
      data: CRISIS_PERSONA[mod],
    });
    check(`PUT ${mod} module`, status === 200, `status=${status}`);
  }
}

async function testCompleteIntake(): Promise<void> {
  console.log('\n🔍 5. Complete Intake');
  if (!sessionId) {
    console.log('  ⚠️  Skipped — no session ID');
    return;
  }

  const { status, data } = await api('POST', `/session/${sessionId}/complete`);
  check('POST /complete returns 200', status === 200);
  check('scores present', !!data?.scores);
  check('explanation present', !!data?.explanation);
  check('actionPlan present', !!data?.actionPlan);

  if (data?.scores) {
    console.log(`    Total Score: ${data.scores.totalScore}`);
    console.log(`    Stability Level: ${data.scores.stabilityLevel}`);
    console.log(`    Priority Tier: ${data.scores.priorityTier}`);
  }
}

async function testVerifyScore(): Promise<void> {
  console.log('\n🔍 6. Verify Score');
  if (!sessionId) {
    console.log('  ⚠️  Skipped — no session ID');
    return;
  }

  const { status, data } = await api('GET', `/session/${sessionId}`);
  check('GET /session returns 200', status === 200);
  check('session is COMPLETED', data?.status === 'COMPLETED');

  const scores = data?.scores;
  if (scores) {
    check('Level is 0 (crisis DV)', scores.stabilityLevel === 0);
    check('Tier is CRITICAL', scores.priorityTier === 'CRITICAL');
    check('Total score > 0', scores.totalScore > 0);
    check('Housing score > 0', scores.dimensions?.housing_stability?.score > 0);
    check('Safety score > 0', scores.dimensions?.safety_crisis?.score > 0);
    check('Override applied (DV floor)', scores.overridesApplied?.includes('fleeing_dv_floor'));
  }
}

async function testExplanation(): Promise<void> {
  console.log('\n🔍 7. Verify Explainability Card');
  if (!sessionId) {
    console.log('  ⚠️  Skipped — no session ID');
    return;
  }

  const { data } = await api('GET', `/session/${sessionId}`);
  const card = data?.explanation;
  if (card) {
    check('topFactors present', Array.isArray(card.topFactors));
    check('topFactors ≤ 3', card.topFactors.length <= 3);
    check('policyPackVersion present', !!card.policyPackVersion);
    check('DV-safe: sensitive values redacted',
      card.dvSafeMode === true ||
      JSON.stringify(card).includes('[REDACTED]'));
  } else {
    check('Explanation card present', false, 'card is null');
  }
}

async function testActionPlan(): Promise<void> {
  console.log('\n🔍 8. Verify Action Plan');
  if (!sessionId) {
    console.log('  ⚠️  Skipped — no session ID');
    return;
  }

  const { data } = await api('GET', `/session/${sessionId}`);
  const plan = data?.actionPlan;
  if (plan) {
    check('immediate tasks present', Array.isArray(plan.immediate));
    check('shortTerm tasks present', Array.isArray(plan.shortTerm));
    check('mediumTerm tasks present', Array.isArray(plan.mediumTerm));
    check('DV hotline in immediate', plan.immediate?.some(
      (t: any) => t.id === 'imm-dv-hotline' || t.title?.includes('DV') || t.title?.includes('hotline')
    ));
    check('At least 1 immediate task', plan.immediate?.length >= 1);
  } else {
    check('Action plan present', false, 'plan is null');
  }
}

async function testHMISExport(): Promise<void> {
  console.log('\n🔍 9. Verify HMIS Export');
  if (!sessionId) {
    console.log('  ⚠️  Skipped — no session ID');
    return;
  }

  // JSON export
  const { status: jsonStatus, data: jsonData } = await api('GET', `/export/hmis/${sessionId}`);
  check('HMIS JSON export returns 200', jsonStatus === 200);
  check('HMIS records present', !!jsonData?.records || !!jsonData?.record);

  // CSV export
  const { status: csvStatus, raw: csvData } = await api('GET', `/export/hmis/${sessionId}?format=csv`);
  check('HMIS CSV export returns 200', csvStatus === 200);
  check('CSV contains header', csvData.includes('PersonalID') || csvData.includes('personalId'));
  check('CSV has data rows', csvData.split('\n').length >= 2);

  // DV-safe nullification
  if (jsonData?.records?.[0] || jsonData?.record) {
    const record = jsonData?.records?.[0] || jsonData?.record;
    check('DV-safe: FirstName nullified', record.FirstName === null || record.firstName === null);
    check('DV-safe: LastName nullified', record.LastName === null || record.lastName === null);
  }
}

async function testFairnessAudit(): Promise<void> {
  console.log('\n🔍 10. Verify Fairness Audit');
  const { status, data } = await api('GET', '/audit/fairness');
  check('GET /audit/fairness returns 200', status === 200);
  check('totalSessions present', typeof data?.totalSessions === 'number');
  check('reports present', !!data?.reports);

  // Single dimension
  const { status: dimStatus, data: dimData } = await api('GET', '/audit/fairness?dimension=gender');
  check('Dimension filter returns 200', dimStatus === 200);
  check('Dimension report has groups', !!dimData?.groups || !!dimData?.dimension);
}

async function testCalibrationReport(): Promise<void> {
  console.log('\n🔍 11. Verify Calibration Report');
  const { status, data } = await api('GET', '/calibration');
  check('GET /calibration returns 200', status === 200);
  check('totalSessions present', typeof data?.totalSessions === 'number');
  check('levelDistribution present', !!data?.levelDistribution);
  check('tierDistribution present', !!data?.tierDistribution);
  check('dimensionAverages present', Array.isArray(data?.dimensionAverages));
  check('policyPackVersion present', !!data?.policyPackVersion);

  // CSV format
  const { status: csvStatus, raw: csvRaw } = await api('GET', '/calibration?format=csv');
  check('Calibration CSV returns 200', csvStatus === 200);
  check('CSV contains Section header', csvRaw.includes('Section,Metric,Value'));
}

// ── Main ───────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        V2 INTAKE — STAGING SMOKE TEST                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Auth: ${AUTH_TOKEN ? 'Bearer token provided' : 'No auth (anonymous)'}`);
  console.log(`  Time: ${new Date().toISOString()}`);

  try {
    await testVersion();
    await testHealth();
    await testCreateSession();
    await testSubmitModules();
    await testCompleteIntake();
    await testVerifyScore();
    await testExplanation();
    await testActionPlan();
    await testHMISExport();
    await testFairnessAudit();
    await testCalibrationReport();
  } catch (err) {
    console.error('\n💥 Fatal error during smoke test:', err);
    failed++;
  }

  console.log('\n══════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('══════════════════════════════════════════════════════════');

  if (failed > 0) {
    console.log('\n⚠️  STAGING SMOKE TEST FAILED — Do NOT proceed with deployment.');
    process.exit(1);
  } else {
    console.log('\n✅ ALL STAGING SMOKE TESTS PASSED — Ready for deployment.');
    process.exit(0);
  }
}

main();
