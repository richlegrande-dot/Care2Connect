/**
 * Feb v1.5 Evaluation Runner — Main Orchestrator
 * 
 * Integrates all 5 layers:
 *   Layer 1: Dataset Integrity (manifest validation)
 *   Layer 2: Field-Level Metrics (per-field diagnostics)
 *   Layer 3: Scoring Isolation (structural / full_strict / urgency_only)
 *   Layer 4: Experiment Engine (scoped overrides)
 *   Layer 5: Failure Bucket Intelligence (root-cause classification)
 * 
 * Usage:
 *   npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30
 *   npx tsx eval/v1_5/runners/run_v1_5.js --dataset all
 *   npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment amount_v2
 *   npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --compare <prev_report.json>
 *   npx tsx eval/v1_5/runners/run_v1_5.js --list-experiments
 */

const fs = require('fs');
const path = require('path');

// Layer 1 — Dataset Integrity
const { validateDatasets, getManifestHash } = require('../manifest/validate_integrity');

// Layer 2 — Field-Level Metrics
const { FieldMetricsCollector } = require('../diagnostics/field_metrics');

// Layer 3 — Scoring Isolation
const { ScoringIsolationLayer } = require('./scoring_isolation');

// Layer 4 — Experiment Engine
const { ExperimentEngine } = require('./experiment_engine');

// Layer 5 — Failure Bucket Intelligence
const { FailureBucketClassifier } = require('../diagnostics/failure_buckets');

// Baseline Comparison
const { BaselineComparator } = require('./baseline_comparator');

// Parser adapter (reuse from v4plus — same production engine interface)
const parserAdapter = require('../../v4plus/runners/parserAdapter');

// ─── Configuration ───────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  STRICT_PASS_THRESHOLD: 0.95,
  ACCEPTABLE_PASS_THRESHOLD: 0.85,
  DEFAULT_AMOUNT_TOLERANCE: 0.10,
  PERFORMANCE_BUDGET_MS: 3000,
  ZERO_OPENAI_MODE: true,
  ENFORCE_NO_NETWORK: true
};

const DATASETS_DIR = path.resolve(__dirname, '../../v4plus/datasets');
const REPORTS_DIR = path.resolve(__dirname, '../reports');
const LOGS_DIR = path.resolve(__dirname, '../eval_logs');

// Dataset composition for --dataset all (840 cases)
const ALL_DATASETS = ['core30', 'hard60', 'fuzz200', 'fuzz500', 'realistic50'];

// Promotion snapshots directory
const PROMOTIONS_DIR = path.resolve(__dirname, '../promotions');

// ─── CLI Argument Parser ─────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    dataset: null,
    experiments: [],
    compare: null,
    listExperiments: false,
    verbose: false,
    target: null,       // --target <percent>  e.g. --target 60
    promote: false,     // --promote  snapshot current engine as production baseline
    stability: 0        // --stability <N>  run N times and check for variance
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dataset':
        parsed.dataset = args[++i];
        break;
      case '--experiment':
        parsed.experiments.push(args[++i]);
        break;
      case '--compare':
        parsed.compare = args[++i];
        break;
      case '--list-experiments':
        parsed.listExperiments = true;
        break;
      case '--verbose':
        parsed.verbose = true;
        break;
      case '--target':
        parsed.target = parseFloat(args[++i]);
        break;
      case '--promote':
        parsed.promote = true;
        break;
      case '--stability':
        parsed.stability = parseInt(args[++i], 10);
        break;
      default:
        if (args[i].startsWith('--')) {
          console.error(`Unknown flag: ${args[i]}`);
          process.exit(1);
        }
    }
  }

  return parsed;
}

// ─── Dataset Loader ──────────────────────────────────────────────────
function loadDataset(name) {
  const filename = `${name}.jsonl`;
  const fullPath = path.join(DATASETS_DIR, filename);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Dataset file not found: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf8').trim();
  const lines = content.split('\n');
  const cases = [];

  for (const line of lines) {
    const obj = JSON.parse(line);
    if (!obj._meta) {
      cases.push(obj);
    }
  }

  return cases;
}

// ─── Environment Setup ───────────────────────────────────────────────
function enforceEnvironment(config) {
  if (config.ZERO_OPENAI_MODE) {
    process.env.ZERO_OPENAI_MODE = 'true';
    process.env.OPENAI_API_KEY = '';
  }

  // Set standard enhancement flags (same as v4plus for consistency)
  process.env.USE_V3B_ENHANCEMENTS = 'true';
  process.env.USE_V2C_ENHANCEMENTS = 'false';
  process.env.USE_V2D_ENHANCEMENTS = 'true';
  process.env.USE_V3C_ENHANCEMENTS = 'true';
  process.env.USE_V3D_DEESCALATION = 'false';
  process.env.USE_CORE30_URGENCY_OVERRIDES = 'true';
  process.env.USE_PHASE2_URGENCY_BOOSTS = 'true';
  process.env.USE_PHASE3_CATEGORY_FIXES = 'false';
  process.env.USE_PHASE36_URGENCY_DEESCALATION = 'true';
  process.env.USE_PHASE37_URGENCY_DEESCALATION = 'true';
  process.env.USE_PHASE41_URGENCY_ESCALATION = 'true';

  // Block HTTP/HTTPS
  if (config.ENFORCE_NO_NETWORK) {
    const http = require('http');
    const https = require('https');
    const origHttpRequest = http.request;
    const origHttpsRequest = https.request;

    http.request = function (...args) {
      throw new Error('HTTP requests blocked in evaluation mode');
    };
    https.request = function (...args) {
      throw new Error('HTTPS requests blocked in evaluation mode');
    };
  }
}

// ─── Main Runner Class ───────────────────────────────────────────────
class FebV15Runner {
  constructor(config = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.fieldMetrics = new FieldMetricsCollector();
    this.scorer = new ScoringIsolationLayer({
      amountTolerance: this.config.DEFAULT_AMOUNT_TOLERANCE,
      strictThreshold: this.config.STRICT_PASS_THRESHOLD,
      acceptableThreshold: this.config.ACCEPTABLE_PASS_THRESHOLD
    });
    this.experimentEngine = new ExperimentEngine();
    this.failureBuckets = new FailureBucketClassifier();
    this.caseResults = [];
    this.datasetBreakdown = {};
  }

  /**
   * Run evaluation on specified datasets.
   * @param {string[]} datasetNames - e.g. ['core30'] or ['core30', 'hard60', 'fuzz200', 'realistic50']
   * @param {string[]} experiments - experiment names to activate
   * @returns {object} complete report object
   */
  async run(datasetNames, experiments = []) {
    const runStartTime = Date.now();

    // ── Layer 1: Validate dataset integrity ──
    console.log('\n┌──────────────────────────────────────────────────┐');
    console.log('│       Feb v1.5 Evaluation Suite                   │');
    console.log('└──────────────────────────────────────────────────┘\n');

    console.log('🔒 Layer 1: Validating dataset integrity...');
    const { manifest } = validateDatasets(datasetNames);
    const manifestHash = getManifestHash();
    console.log(`   ✅ All ${datasetNames.length} dataset(s) verified. Manifest: ${manifestHash.slice(0, 12)}...\n`);

    // ── Layer 4: Activate experiments ──
    let activeConfig = this.config;
    if (experiments.length > 0) {
      console.log('🧪 Layer 4: Activating experiments...');
      activeConfig = this.experimentEngine.activate(experiments, this.config);
      for (const exp of this.experimentEngine.activeExperiments) {
        console.log(`   ⚗️  ${exp.name}: ${exp.description}`);
      }
      console.log('');
    }

    // ── Engine hash ──
    const engineHash = ExperimentEngine.computeEngineHash();
    console.log(`🔑 Engine hash: ${engineHash.slice(0, 16)}...`);
    console.log(`📋 Manifest hash: ${manifestHash.slice(0, 16)}...\n`);

    // ── Set up environment ──
    enforceEnvironment(activeConfig);

    // ── Evaluate each dataset ──
    for (const dsName of datasetNames) {
      console.log(`━━━ Evaluating: ${dsName} ━━━`);
      const cases = loadDataset(dsName);
      console.log(`   📦 Loaded ${cases.length} cases`);

      const dsResults = [];

      for (let i = 0; i < cases.length; i++) {
        const testCase = cases[i];
        if ((i + 1) % 10 === 0 || i === cases.length - 1) {
          process.stdout.write(`   Progress: ${i + 1}/${cases.length}\r`);
        }

        const result = await this._evaluateCase(testCase, activeConfig);
        dsResults.push(result);
        this.caseResults.push(result);
      }

      console.log(`   ✅ ${cases.length} cases complete\n`);

      // Per-dataset scoring breakdown
      const dsScores = this.scorer.aggregateScores(dsResults.map(r => r.scoring));
      this.datasetBreakdown[dsName] = {
        case_count: cases.length,
        ...dsScores
      };
    }

    // ── Aggregate all results ──
    const allScores = this.scorer.aggregateScores(this.caseResults.map(r => r.scoring));
    const fieldMetrics = this.fieldMetrics.computeMetrics();
    const failureSummary = this.failureBuckets.getSummary();

    const runEndTime = Date.now();
    const runTimeMs = runEndTime - runStartTime;

    // ── Build report ──
    const report = {
      metadata: {
        engine_hash: engineHash,
        dataset_manifest_hash: manifestHash,
        experiment_flags: this.experimentEngine.activeExperiments.map(e => e.name),
        experiment_details: this.experimentEngine.activeExperiments,
        run_time_ms: runTimeMs,
        timestamp: new Date().toISOString(),
        datasets_evaluated: datasetNames,
        total_cases: this.caseResults.length,
        config: {
          strict_threshold: activeConfig.STRICT_PASS_THRESHOLD,
          acceptable_threshold: activeConfig.ACCEPTABLE_PASS_THRESHOLD,
          amount_tolerance: activeConfig.DEFAULT_AMOUNT_TOLERANCE
        },
        version: 'feb_v1_5'
      },
      summary: allScores,
      field_metrics: fieldMetrics,
      failure_buckets: failureSummary,
      dataset_breakdown: this.datasetBreakdown
    };

    // ── Display results ──
    this._displayReport(report);

    // ── Save report ──
    this._saveReport(report);

    // ── Deactivate experiments ──
    this.experimentEngine.deactivate();

    return report;
  }

  /**
   * Evaluate a single test case through all layers.
   */
  async _evaluateCase(testCase, config) {
    const startTime = process.hrtime.bigint();

    // Call production parser via adapter
    const parseResult = await parserAdapter.extractAll(testCase.transcriptText, testCase);

    const endTime = process.hrtime.bigint();
    const latencyMs = Number(endTime - startTime) / 1_000_000;

    const actual = {
      name: parseResult.name || null,
      category: parseResult.category || null,
      urgencyLevel: parseResult.urgencyLevel || null,
      goalAmount: parseResult.goalAmount ?? null
    };

    const expected = {
      name: testCase.expected.name || null,
      category: testCase.expected.category || null,
      urgencyLevel: testCase.expected.urgencyLevel || null,
      goalAmount: testCase.expected.goalAmount ?? null
    };

    const strictness = testCase.strictness || {};

    // Layer 3 — Score in all modes
    const scoring = this.scorer.scoreCase(actual, expected, {
      amountTolerance: strictness.amountTolerance ?? config.DEFAULT_AMOUNT_TOLERANCE,
      allowFuzzyName: strictness.allowFuzzyName || false
    });

    // Layer 2 — Record field metrics
    this.fieldMetrics.recordCase(
      testCase.id,
      actual,
      expected,
      {
        nameMatch: scoring.fieldMatches.name,
        amountMatch: scoring.fieldMatches.amount,
        categoryMatch: scoring.fieldMatches.category,
        urgencyMatch: scoring.fieldMatches.urgency
      }
    );

    // Layer 5 — Classify failures into buckets
    const failedFields = [];
    if (!scoring.fieldMatches.name) {
      const bucket = this.failureBuckets.classify('name', {
        caseId: testCase.id,
        actual: actual.name,
        expected: expected.name,
        transcript: testCase.transcriptText,
        notes: testCase.notes || testCase.description || ''
      });
      failedFields.push({ field: 'name', bucket });
    }
    if (!scoring.fieldMatches.amount) {
      const bucket = this.failureBuckets.classify('amount', {
        caseId: testCase.id,
        actual: actual.goalAmount,
        expected: expected.goalAmount,
        transcript: testCase.transcriptText,
        notes: testCase.notes || testCase.description || ''
      });
      failedFields.push({ field: 'amount', bucket });
    }
    if (!scoring.fieldMatches.category) {
      const bucket = this.failureBuckets.classify('category', {
        caseId: testCase.id,
        actual: actual.category,
        expected: expected.category,
        notes: testCase.notes || testCase.description || ''
      });
      failedFields.push({ field: 'category', bucket });
    }
    if (!scoring.fieldMatches.urgency) {
      const bucket = this.failureBuckets.classify('urgency', {
        caseId: testCase.id,
        actual: actual.urgencyLevel,
        expected: expected.urgencyLevel,
        notes: testCase.notes || testCase.description || ''
      });
      failedFields.push({ field: 'urgency', bucket });
    }

    return {
      caseId: testCase.id,
      actual,
      expected,
      scoring,
      failedFields,
      latencyMs
    };
  }

  /**
   * Display formatted results to console.
   */
  _displayReport(report) {
    const { summary, field_metrics, failure_buckets, dataset_breakdown, metadata } = report;

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║           Feb v1.5 — EVALUATION REPORT           ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // Experiment flags
    if (metadata.experiment_flags.length > 0) {
      console.log(`🧪 Experiments: ${metadata.experiment_flags.join(', ')}`);
    }
    console.log(`🔑 Engine: ${metadata.engine_hash.slice(0, 12)}...`);
    console.log(`📋 Manifest: ${metadata.dataset_manifest_hash.slice(0, 12)}...`);
    console.log(`⏱️  Runtime: ${metadata.run_time_ms}ms | Cases: ${metadata.total_cases}\n`);

    // ── Summary (STRICT must never be reported alone) ──
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  SCORING SUMMARY (All Modes)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  STRUCTURAL (name+cat+amt):  ${(summary.structural_score.pass_rate * 100).toFixed(2)}% (${summary.structural_score.passes}/${summary.structural_score.total})`);
    console.log(`  URGENCY ONLY:              ${(summary.urgency_score.accuracy * 100).toFixed(2)}% (${summary.urgency_score.correct}/${summary.urgency_score.total})`);
    console.log(`  FULL STRICT (all 4):       ${(summary.strict_score.pass_rate * 100).toFixed(2)}% (${summary.strict_score.passes}/${summary.strict_score.total})`);
    console.log(`  ACCEPTABLE (≥85%):         ${(summary.acceptable_score.pass_rate * 100).toFixed(2)}% (${summary.acceptable_score.passes}/${summary.acceptable_score.total})`);
    console.log('');

    // ── Field-Level Metrics (Layer 2) ──
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FIELD-LEVEL ACCURACY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Name:     ${(field_metrics.name.accuracy * 100).toFixed(1)}%  (${field_metrics.name.correct}/${field_metrics.name.total})  Partials: ${field_metrics.name.partial_matches.length}`);
    console.log(`  Category: ${(field_metrics.category.accuracy * 100).toFixed(1)}%  (${field_metrics.category.correct}/${field_metrics.category.total})`);
    console.log(`  Urgency:  ${(field_metrics.urgency_level.accuracy * 100).toFixed(1)}%  (${field_metrics.urgency_level.correct}/${field_metrics.urgency_level.total})  Under: ${field_metrics.urgency_level.under_count} Over: ${field_metrics.urgency_level.over_count}`);
    console.log(`  Amount:   ${(field_metrics.amount.accuracy * 100).toFixed(1)}%  (${field_metrics.amount.correct}/${field_metrics.amount.total})  Nulls: ${field_metrics.amount.null_count}`);
    console.log('');

    // ── Failure Buckets (Layer 5) ──
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FAILURE BUCKETS (Top 10)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const bucketEntries = Object.entries(failure_buckets.buckets).slice(0, 10);
    for (let i = 0; i < bucketEntries.length; i++) {
      const [key, info] = bucketEntries[i];
      console.log(`  ${i + 1}. ${key} (${info.count}) — ${info.description}`);
      console.log(`     Cases: ${info.cases.slice(0, 5).join(', ')}${info.cases.length > 5 ? '...' : ''}`);
    }
    if (bucketEntries.length === 0) {
      console.log('  No failures detected! 🎉');
    }
    console.log('');

    // ── Dataset Breakdown ──
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PER-DATASET BREAKDOWN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const [dsName, ds] of Object.entries(dataset_breakdown)) {
      console.log(`  ${dsName} (${ds.case_count} cases):`);
      console.log(`    Structural: ${(ds.structural_score.pass_rate * 100).toFixed(1)}%  Urgency: ${(ds.urgency_score.accuracy * 100).toFixed(1)}%  Strict: ${(ds.strict_score.pass_rate * 100).toFixed(1)}%`);
    }
    console.log('');
  }

  /**
   * Save report as JSON.
   */
  _saveReport(report) {
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const datasets = report.metadata.datasets_evaluated.join('_');
    const filename = `feb_v1_5_${datasets}_${timestamp}.json`;
    const filePath = path.join(REPORTS_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${filePath}\n`);

    // Also save a latest symlink/copy for easy access
    const latestPath = path.join(REPORTS_DIR, `LATEST_${datasets}.json`);
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));

    return filePath;
  }
}

// ─── CLI Entry Point ─────────────────────────────────────────────────
async function main() {
  const args = parseArgs();

  // List experiments
  if (args.listExperiments) {
    console.log('\n📋 Available Experiments:\n');
    for (const exp of ExperimentEngine.listExperiments()) {
      console.log(`  --experiment ${exp.name}`);
      console.log(`    ${exp.description}\n`);
    }
    return;
  }

  // Validate dataset arg
  if (!args.dataset) {
    console.error('Usage: npx tsx eval/v1_5/runners/run_v1_5.js --dataset <name>\n');
    console.error('Datasets: core30, hard60, fuzz200, fuzz500, realistic50, all (840 cases)');
    console.error('Flags:    --experiment <name>  --compare <report.json>  --verbose');
    console.error('          --target <percent>   --promote   --stability <N>');
    console.error('          --list-experiments');
    process.exit(1);
  }

  // Resolve dataset list
  const datasetNames = args.dataset === 'all' ? ALL_DATASETS : [args.dataset];

  // ── Stability Testing Mode ──
  if (args.stability > 1) {
    console.log(`\n🔄 STABILITY TEST: Running ${args.stability} consecutive evaluations...\n`);
    const reports = [];
    for (let i = 0; i < args.stability; i++) {
      console.log(`━━━ Stability Run ${i + 1}/${args.stability} ━━━`);
      const runner = new FebV15Runner();
      const report = await runner.run(datasetNames, args.experiments);
      reports.push(report);
    }

    // Compare all runs for variance
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║           STABILITY TEST RESULTS                 ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    const strictRates = reports.map(r => r.summary.strict_score.pass_rate);
    const structRates = reports.map(r => r.summary.structural_score.pass_rate);
    const urgencyRates = reports.map(r => r.summary.urgency_score.accuracy);

    const variance = (arr) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
    };

    const strictVar = variance(strictRates);
    const structVar = variance(structRates);
    const urgencyVar = variance(urgencyRates);

    console.log(`  Runs: ${args.stability}`);
    console.log(`  Strict pass rates:     ${strictRates.map(r => (r * 100).toFixed(2) + '%').join(' | ')}`);
    console.log(`  Structural pass rates: ${structRates.map(r => (r * 100).toFixed(2) + '%').join(' | ')}`);
    console.log(`  Urgency accuracy:      ${urgencyRates.map(r => (r * 100).toFixed(2) + '%').join(' | ')}`);
    console.log(`\n  Strict variance:     ${strictVar.toFixed(6)}  ${strictVar === 0 ? '✅ DETERMINISTIC' : '❌ NON-DETERMINISTIC'}`);
    console.log(`  Structural variance: ${structVar.toFixed(6)}  ${structVar === 0 ? '✅ DETERMINISTIC' : '❌ NON-DETERMINISTIC'}`);
    console.log(`  Urgency variance:    ${urgencyVar.toFixed(6)}  ${urgencyVar === 0 ? '✅ DETERMINISTIC' : '❌ NON-DETERMINISTIC'}`);

    if (strictVar === 0 && structVar === 0 && urgencyVar === 0) {
      console.log('\n  🎯 ALL SCORES IDENTICAL ACROSS ALL RUNS — engine is stable.');
    } else {
      console.log('\n  ⚠️  VARIANCE DETECTED — engine may have non-deterministic behavior.');
    }
    console.log('');
    return;
  }

  // ── Standard single run ──
  const runner = new FebV15Runner();
  const report = await runner.run(datasetNames, args.experiments);

  // ── Target gate check ──
  if (args.target !== null) {
    const strictPct = report.summary.strict_score.pass_rate * 100;
    if (strictPct >= args.target) {
      console.log(`🎯 TARGET MET: ${strictPct.toFixed(2)}% ≥ ${args.target}% STRICT pass rate`);
      if (args.promote) {
        promoteToProduction(report);
      } else {
        console.log('   Run with --promote to snapshot this as the new production baseline.\n');
      }
    } else {
      console.log(`❌ TARGET NOT MET: ${strictPct.toFixed(2)}% < ${args.target}% STRICT pass rate`);
      console.log('   Review failure buckets above and continue iterating.\n');
    }
  }

  // ── Manual promote (no target required) ──
  if (args.promote && args.target === null) {
    promoteToProduction(report);
  }

  // ── Baseline comparison ──
  if (args.compare) {
    console.log('\n📊 Comparing with previous baseline...\n');
    const comparator = new BaselineComparator();
    comparator.compare(report, args.compare);
  }
}

/**
 * Promote the current engine state to a named "production" snapshot.
 * Saves: report JSON, engine hash, env flags, timestamp.
 * This becomes the baseline that future runs compare against.
 */
function promoteToProduction(report) {
  if (!fs.existsSync(PROMOTIONS_DIR)) {
    fs.mkdirSync(PROMOTIONS_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const strictPct = (report.summary.strict_score.pass_rate * 100).toFixed(2);

  const promotion = {
    promoted_at: new Date().toISOString(),
    engine_hash: report.metadata.engine_hash,
    dataset_manifest_hash: report.metadata.dataset_manifest_hash,
    strict_pass_rate: report.summary.strict_score.pass_rate,
    acceptable_pass_rate: report.summary.acceptable_score.pass_rate,
    structural_pass_rate: report.summary.structural_score.pass_rate,
    urgency_accuracy: report.summary.urgency_score.accuracy,
    datasets_evaluated: report.metadata.datasets_evaluated,
    total_cases: report.metadata.total_cases,
    experiment_flags: report.metadata.experiment_flags,
    field_metrics_snapshot: {
      name_accuracy: report.field_metrics?.name?.accuracy,
      category_accuracy: report.field_metrics?.category?.accuracy,
      urgency_accuracy: report.field_metrics?.urgency_level?.accuracy,
      amount_accuracy: report.field_metrics?.amount?.accuracy
    },
    full_report_path: path.join(REPORTS_DIR, `PROMOTED_${timestamp}.json`)
  };

  // Save promotion record
  const promoPath = path.join(PROMOTIONS_DIR, `production_${timestamp}.json`);
  fs.writeFileSync(promoPath, JSON.stringify(promotion, null, 2));

  // Save full report copy as promoted
  const reportPath = path.join(REPORTS_DIR, `PROMOTED_${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Update LATEST_PRODUCTION pointer
  const latestPath = path.join(PROMOTIONS_DIR, 'LATEST_PRODUCTION.json');
  fs.writeFileSync(latestPath, JSON.stringify(promotion, null, 2));

  console.log('\n🏭 PROMOTED TO PRODUCTION');
  console.log(`   Strict: ${strictPct}% | Engine: ${report.metadata.engine_hash.slice(0, 12)}...`);
  console.log(`   Snapshot: ${promoPath}`);
  console.log(`   Use --compare ${reportPath} to compare future runs against this baseline.\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});

module.exports = { FebV15Runner, DEFAULT_CONFIG };
