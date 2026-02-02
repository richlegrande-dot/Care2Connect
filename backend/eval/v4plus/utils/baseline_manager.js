#!/usr/bin/env node
/**
 * Baseline Manager for Jan v4.0+
 * 
 * Establishes performance and accuracy baselines for regression detection.
 * Stores historical results and compares current runs against baseline.
 * 
 * Features:
 * - Save current run as baseline
 * - Compare current run to baseline
 * - Detect performance regressions (latency)
 * - Detect accuracy regressions (pass rates)
 * - Track trends over time
 * 
 * Usage:
 *   node baseline_manager.js save --suite all10k
 *   node baseline_manager.js compare --suite all10k --current ./reports/latest.json
 *   node baseline_manager.js show
 *   npm run eval:v4plus:baseline-save
 *   npm run eval:v4plus:baseline-compare
 */

const fs = require('fs');
const path = require('path');

const BASELINE_FILE = path.join(__dirname, '..', 'baselines.json');

// Load existing baselines
function loadBaselines() {
  if (!fs.existsSync(BASELINE_FILE)) {
    return {
      version: '1.0.0',
      created: new Date().toISOString(),
      baselines: {}
    };
  }
  
  try {
    const content = fs.readFileSync(BASELINE_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('⚠️  Failed to load baselines:', err.message);
    return {
      version: '1.0.0',
      created: new Date().toISOString(),
      baselines: {}
    };
  }
}

// Save baselines
function saveBaselines(data) {
  try {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('❌ Failed to save baselines:', err.message);
    return false;
  }
}

// Extract metrics from report
function extractMetrics(reportPath) {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report file not found: ${reportPath}`);
  }

  const content = fs.readFileSync(reportPath, 'utf8');
  const report = JSON.parse(content);

  if (!report.summary) {
    throw new Error('Invalid report format: missing summary');
  }

  return {
    totalCases: report.summary.totalCases,
    strictPassed: report.summary.strictPassed,
    acceptablePassed: report.summary.acceptablePassed,
    strictPassPercentage: report.summary.strictPassPercentage,
    acceptablePassPercentage: report.summary.acceptablePassPercentage,
    avgLatencyMs: report.performance?.avgLatencyMs || 0,
    totalRuntimeMs: report.performance?.totalRuntimeMs || 0,
    failureBuckets: report.failureBuckets?.slice(0, 5).map(b => ({
      type: b.type,
      count: b.count,
      percentage: b.percentage
    })) || [],
    timestamp: new Date().toISOString()
  };
}

// Save baseline
function saveBaseline(suite, reportPath) {
  console.log(`\n📊 Saving baseline for suite: ${suite}\n`);
  
  const metrics = extractMetrics(reportPath);
  const baselines = loadBaselines();

  baselines.baselines[suite] = {
    ...metrics,
    savedAt: new Date().toISOString()
  };

  if (saveBaselines(baselines)) {
    console.log(`✅ Baseline saved successfully`);
    console.log(`   Suite: ${suite}`);
    console.log(`   Total cases: ${metrics.totalCases}`);
    console.log(`   Strict pass: ${metrics.strictPassPercentage.toFixed(1)}%`);
    console.log(`   Acceptable pass: ${metrics.acceptablePassPercentage.toFixed(1)}%`);
    console.log(`   Avg latency: ${metrics.avgLatencyMs.toFixed(2)}ms`);
    console.log(`\n   Baseline file: ${BASELINE_FILE}\n`);
  } else {
    console.error('❌ Failed to save baseline');
    process.exit(1);
  }
}

// Compare against baseline
function compareToBaseline(suite, currentReportPath) {
  console.log(`\n📊 Comparing to baseline: ${suite}\n`);

  const baselines = loadBaselines();
  
  if (!baselines.baselines[suite]) {
    console.error(`❌ No baseline found for suite: ${suite}`);
    console.error(`   Run 'baseline_manager.js save --suite ${suite}' first`);
    process.exit(1);
  }

  const baseline = baselines.baselines[suite];
  const current = extractMetrics(currentReportPath);

  // Calculate deltas
  const strictDelta = current.strictPassPercentage - baseline.strictPassPercentage;
  const acceptableDelta = current.acceptablePassPercentage - baseline.acceptablePassPercentage;
  const latencyDelta = current.avgLatencyMs - baseline.avgLatencyMs;
  const latencyDeltaPct = baseline.avgLatencyMs > 0 
    ? ((latencyDelta / baseline.avgLatencyMs) * 100) 
    : 0;

  // Display comparison
  console.log(`${'='.repeat(70)}`);
  console.log(`BASELINE COMPARISON: ${suite.toUpperCase()}`);
  console.log(`${'='.repeat(70)}\n`);

  console.log(`Baseline saved: ${baseline.savedAt}`);
  console.log(`Current run: ${current.timestamp}\n`);

  // Accuracy comparison
  console.log(`Accuracy Metrics:`);
  displayMetric('Strict Pass', 
    baseline.strictPassPercentage, 
    current.strictPassPercentage, 
    strictDelta, 
    '%', 
    'higher');
  displayMetric('Acceptable Pass', 
    baseline.acceptablePassPercentage, 
    current.acceptablePassPercentage, 
    acceptableDelta, 
    '%', 
    'higher');

  // Performance comparison
  console.log(`\nPerformance Metrics:`);
  displayMetric('Avg Latency', 
    baseline.avgLatencyMs, 
    current.avgLatencyMs, 
    latencyDelta, 
    'ms', 
    'lower');
  console.log(`   Latency change: ${latencyDeltaPct > 0 ? '+' : ''}${latencyDeltaPct.toFixed(1)}%`);

  // Regression detection
  console.log(`\n${'='.repeat(70)}`);
  const regressions = detectRegressions(baseline, current);
  
  if (regressions.length === 0) {
    console.log(`✅ NO REGRESSIONS DETECTED`);
  } else {
    console.log(`❌ ${regressions.length} REGRESSION(S) DETECTED:\n`);
    regressions.forEach((r, i) => {
      console.log(`${i + 1}. ${r.type}: ${r.message}`);
    });
  }
  console.log(`${'='.repeat(70)}\n`);

  return regressions.length === 0 ? 0 : 1;
}

// Display metric comparison
function displayMetric(name, baseline, current, delta, unit, betterWhen) {
  const icon = delta === 0 ? '➡️' : 
               (betterWhen === 'higher' && delta > 0) || (betterWhen === 'lower' && delta < 0) ? '✅' : '❌';
  const sign = delta > 0 ? '+' : '';
  
  console.log(`   ${icon} ${name}:`);
  console.log(`      Baseline: ${baseline.toFixed(2)}${unit}`);
  console.log(`      Current:  ${current.toFixed(2)}${unit}`);
  console.log(`      Delta:    ${sign}${delta.toFixed(2)}${unit}`);
}

// Detect regressions
function detectRegressions(baseline, current) {
  const regressions = [];
  
  // Accuracy regression: >2% drop in strict pass
  if (current.strictPassPercentage < baseline.strictPassPercentage - 2.0) {
    regressions.push({
      type: 'Accuracy Regression',
      message: `Strict pass rate dropped ${(baseline.strictPassPercentage - current.strictPassPercentage).toFixed(1)}% (${baseline.strictPassPercentage.toFixed(1)}% → ${current.strictPassPercentage.toFixed(1)}%)`
    });
  }

  // Acceptable pass regression: >3% drop
  if (current.acceptablePassPercentage < baseline.acceptablePassPercentage - 3.0) {
    regressions.push({
      type: 'Acceptable Pass Regression',
      message: `Acceptable pass rate dropped ${(baseline.acceptablePassPercentage - current.acceptablePassPercentage).toFixed(1)}% (${baseline.acceptablePassPercentage.toFixed(1)}% → ${current.acceptablePassPercentage.toFixed(1)}%)`
    });
  }

  // Performance regression: >20% slower
  const latencyIncrease = ((current.avgLatencyMs - baseline.avgLatencyMs) / baseline.avgLatencyMs) * 100;
  if (latencyIncrease > 20.0) {
    regressions.push({
      type: 'Performance Regression',
      message: `Avg latency increased ${latencyIncrease.toFixed(1)}% (${baseline.avgLatencyMs.toFixed(2)}ms → ${current.avgLatencyMs.toFixed(2)}ms)`
    });
  }

  return regressions;
}

// Show all baselines
function showBaselines() {
  const baselines = loadBaselines();
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 SAVED BASELINES`);
  console.log(`${'='.repeat(70)}\n`);

  if (Object.keys(baselines.baselines).length === 0) {
    console.log(`No baselines saved yet.\n`);
    console.log(`Run 'baseline_manager.js save --suite <suite>' to create one.\n`);
    return;
  }

  Object.entries(baselines.baselines).forEach(([suite, data]) => {
    console.log(`📁 ${suite.toUpperCase()}`);
    console.log(`   Saved: ${data.savedAt}`);
    console.log(`   Cases: ${data.totalCases}`);
    console.log(`   Strict: ${data.strictPassPercentage.toFixed(1)}%`);
    console.log(`   Acceptable: ${data.acceptablePassPercentage.toFixed(1)}%`);
    console.log(`   Avg latency: ${data.avgLatencyMs.toFixed(2)}ms\n`);
  });

  console.log(`Baseline file: ${BASELINE_FILE}\n`);
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help') {
  console.log(`
Jan v4.0+ Baseline Manager

Usage:
  node baseline_manager.js save --suite <suite> --report <path>
  node baseline_manager.js compare --suite <suite> --current <path>
  node baseline_manager.js show

Commands:
  save      Save current run as baseline
  compare   Compare current run to baseline
  show      Display all saved baselines

Options:
  --suite <name>    Suite name (core30, all, all500, all10k, etc.)
  --report <path>   Path to JSON report file (for save)
  --current <path>  Path to current JSON report (for compare)

Examples:
  node baseline_manager.js save --suite all10k --report ./reports/latest.json
  node baseline_manager.js compare --suite all10k --current ./reports/run_20260125.json
  node baseline_manager.js show
`);
  process.exit(0);
}

// Extract options
const suite = args.find(a => a.startsWith('--suite='))?.split('=')[1] || 
              args[args.indexOf('--suite') + 1];
const reportPath = args.find(a => a.startsWith('--report='))?.split('=')[1] || 
                   args[args.indexOf('--report') + 1];
const currentPath = args.find(a => a.startsWith('--current='))?.split('=')[1] || 
                    args[args.indexOf('--current') + 1];

try {
  switch (command) {
    case 'save':
      if (!suite || !reportPath) {
        console.error('❌ Missing required arguments');
        console.error('   Usage: baseline_manager.js save --suite <suite> --report <path>');
        process.exit(1);
      }
      saveBaseline(suite, reportPath);
      break;

    case 'compare':
      if (!suite || !currentPath) {
        console.error('❌ Missing required arguments');
        console.error('   Usage: baseline_manager.js compare --suite <suite> --current <path>');
        process.exit(1);
      }
      const exitCode = compareToBaseline(suite, currentPath);
      process.exit(exitCode);
      break;

    case 'show':
      showBaselines();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error(`   Run 'baseline_manager.js help' for usage`);
      process.exit(1);
  }
} catch (err) {
  console.error(`\n❌ Error: ${err.message}\n`);
  process.exit(1);
}
