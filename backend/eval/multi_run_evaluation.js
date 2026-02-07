/**
 * Multi-Run Evaluation for Statistical Validation
 * Runs evaluation N times and calculates median/statistics
 * 
 * Usage: node backend/eval/multi_run_evaluation.js [run_count] [dataset]
 * Example: node backend/eval/multi_run_evaluation.js 10 all
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const RUN_COUNT = parseInt(process.argv[2]) || 10;
const DATASET = process.argv[3] || 'all';
const RUNNER_PATH = 'backend/eval/v4plus/runners/run_eval_v4plus.js';
const OUTPUT_DIR = path.join(__dirname, 'v4plus', 'reports', 'multi-run-validations');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Parse evaluation output to extract key metrics
 */
function parseEvaluationOutput(output) {
  const result = {
    passRate: null,
    passing: null,
    total: null,
    executionTime: null,
    core30Failures: 0,
    core30Cases: [],
    failureBuckets: {}
  };
  
  // Extract pass rate: "STRICT (≥95%): 46.18% (157/340)"
  const passRateMatch = output.match(/STRICT.*?(\d+\.\d+)%.*?\((\d+)\/(\d+)\)/);
  if (passRateMatch) {
    result.passRate = parseFloat(passRateMatch[1]);
    result.passing = parseInt(passRateMatch[2]);
    result.total = parseInt(passRateMatch[3]);
  }
  
  // Extract execution time: "Total Time: 1486.23 ms"
  const timeMatch = output.match(/Total Time:\s*(\d+\.\d+)\s*ms/);
  if (timeMatch) {
    result.executionTime = parseFloat(timeMatch[1]);
  }
  
  // Extract Core30 failures: "11 core30 baseline case(s) failed"
  const core30Match = output.match(/(\d+) core30 baseline case\(s\) failed/);
  if (core30Match) {
    result.core30Failures = parseInt(core30Match[1]);
  }
  
  // Extract Core30 case IDs: "- **T009:** Score 75.0%"
  const core30CaseMatches = output.matchAll(/- \*\*([T]\d+):\*\* Score/g);
  result.core30Cases = [...core30CaseMatches].map(m => m[1]);
  
  // Extract top failure buckets
  const bucketMatches = output.matchAll(/(\d+)\.\s+(\w+)\s+\((\d+)\s+cases?,\s+(\d+\.\d+)%\)/g);
  for (const match of bucketMatches) {
    const bucketName = match[2];
    const count = parseInt(match[3]);
    result.failureBuckets[bucketName] = count;
  }
  
  return result;
}

/**
 * Calculate statistics from array of values
 */
function calculateStats(values) {
  if (values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    median,
    mean,
    std_dev: stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    range: sorted[sorted.length - 1] - sorted[0],
    values: sorted
  };
}

/**
 * Check if results meet acceptance criteria
 */
function checkAcceptanceCriteria(passRateStats, targetRate = null) {
  const criteria = {
    stability_pass: passRateStats.std_dev < 0.5,  // Standard deviation < 0.5%
    range_pass: passRateStats.range < 4.0,        // Range < 4% (±2%)
    target_pass: null
  };
  
  if (targetRate !== null) {
    // Check if median is within ±1% of target
    criteria.target_pass = Math.abs(passRateStats.median - targetRate) <= 1.0;
  }
  
  criteria.overall_pass = criteria.stability_pass && criteria.range_pass && 
                          (criteria.target_pass === null || criteria.target_pass);
  
  return criteria;
}

/**
 * Main execution function
 */
async function runMultiEvaluation() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       Multi-Run Statistical Validation Protocol          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log(`📊 Configuration:`);
  console.log(`   Run Count:  ${RUN_COUNT}`);
  console.log(`   Dataset:    ${DATASET}`);
  console.log(`   Runner:     ${RUNNER_PATH}\n`);
  console.log(`🔁 Starting ${RUN_COUNT} evaluation runs...\n`);
  
  const results = [];
  const startTime = Date.now();
  
  for (let i = 1; i <= RUN_COUNT; i++) {
    const runStart = Date.now();
    process.stdout.write(`   Run ${i}/${RUN_COUNT}...`);
    
    try {
      const output = execSync(`node ${RUNNER_PATH} --dataset ${DATASET}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']  // Capture stdout/stderr
      });
      
      const parsed = parseEvaluationOutput(output);
      
      if (parsed.passRate !== null) {
        results.push({
          run: i,
          ...parsed,
          duration: Date.now() - runStart
        });
        
        process.stdout.write(` ✅ ${parsed.passRate.toFixed(2)}% (${parsed.core30Failures} Core30 failures) - ${parsed.executionTime.toFixed(0)}ms\n`);
      } else {
        process.stdout.write(` ❌ Failed to parse results\n`);
      }
    } catch (error) {
      process.stdout.write(` ❌ Execution failed: ${error.message}\n`);
    }
  }
  
  console.log(`\n✅ Completed ${results.length}/${RUN_COUNT} runs in ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);
  
  if (results.length === 0) {
    console.error('❌ No successful runs - cannot calculate statistics');
    process.exit(1);
  }
  
  // Calculate statistics
  const passRateStats = calculateStats(results.map(r => r.passRate));
  const executionTimeStats = calculateStats(results.map(r => r.executionTime));
  const core30Stats = calculateStats(results.map(r => r.core30Failures));
  
  // Check acceptance criteria
  const acceptance = checkAcceptanceCriteria(passRateStats);
  
  // Generate report
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║            STATISTICAL VALIDATION REPORT                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log('📈 PASS RATE STATISTICS:');
  console.log(`   Median:           ${passRateStats.median.toFixed(2)}%`);
  console.log(`   Mean:             ${passRateStats.mean.toFixed(2)}%`);
  console.log(`   Std Deviation:    ${passRateStats.std_dev.toFixed(2)}%`);
  console.log(`   Min:              ${passRateStats.min.toFixed(2)}%`);
  console.log(`   Max:              ${passRateStats.max.toFixed(2)}%`);
  console.log(`   Range:            ${passRateStats.range.toFixed(2)}%`);
  console.log(`   Confidence:       ±${(1.96 * passRateStats.std_dev).toFixed(2)}% (95% CI)\n`);
  
  console.log('⏱️  EXECUTION TIME STATISTICS:');
  console.log(`   Median:           ${executionTimeStats.median.toFixed(0)}ms`);
  console.log(`   Mean:             ${executionTimeStats.mean.toFixed(0)}ms`);
  console.log(`   Min:              ${executionTimeStats.min.toFixed(0)}ms`);
  console.log(`   Max:              ${executionTimeStats.max.toFixed(0)}ms\n`);
  
  console.log('🎯 CORE30 BASELINE FAILURES:');
  console.log(`   Median:           ${core30Stats.median.toFixed(0)} failures`);
  console.log(`   Mean:             ${core30Stats.mean.toFixed(1)} failures`);
  console.log(`   Min:              ${core30Stats.min} failures`);
  console.log(`   Max:              ${core30Stats.max} failures`);
  
  // Check Core30 stability (should be same cases failing)
  const core30CaseSets = results.map(r => r.core30Cases.sort().join(','));
  const uniqueCore30Sets = [...new Set(core30CaseSets)];
  const core30Stable = uniqueCore30Sets.length === 1;
  console.log(`   Stability:        ${core30Stable ? '✅ Consistent' : '⚠️  Variable'}`);
  if (core30Stable && results[0].core30Cases.length > 0) {
    console.log(`   Failed Cases:     ${results[0].core30Cases.join(', ')}`);
  }
  console.log('');
  
  // Acceptance criteria
  console.log('✅ ACCEPTANCE CRITERIA:');
  console.log(`   Stability (σ < 0.5%):        ${acceptance.stability_pass ? '✅ PASS' : '❌ FAIL'} (σ = ${passRateStats.std_dev.toFixed(2)}%)`);
  console.log(`   Range (< 4%):                ${acceptance.range_pass ? '✅ PASS' : '❌ FAIL'} (range = ${passRateStats.range.toFixed(2)}%)`);
  console.log(`   Core30 Stability:            ${core30Stable ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   ---`);
  console.log(`   OVERALL RESULT:              ${acceptance.stability_pass && acceptance.range_pass && core30Stable ? '✅ VALIDATED' : '❌ NOT VALIDATED'}\n`);
  
  if (!acceptance.stability_pass) {
    console.log('⚠️  WARNING: High standard deviation suggests unstable results');
    console.log('   This may indicate non-deterministic behavior or environmental factors\n');
  }
  
  if (!core30Stable) {
    console.log('⚠️  WARNING: Core30 failures are inconsistent across runs');
    console.log('   Different cases failing suggests systemic instability\n');
  }
  
  // Save detailed report
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\.\d+Z$/, 'Z');
  const reportFilename = `multi_run_validation_${DATASET}_${timestamp}.json`;
  const reportPath = path.join(OUTPUT_DIR, reportFilename);
  
  const fullReport = {
    metadata: {
      timestamp: new Date().toISOString(),
      run_count: RUN_COUNT,
      successful_runs: results.length,
      dataset: DATASET,
      runner: RUNNER_PATH,
      total_duration_sec: ((Date.now() - startTime) / 1000).toFixed(1)
    },
    statistics: {
      pass_rate: passRateStats,
      execution_time: executionTimeStats,
      core30_failures: core30Stats
    },
    acceptance_criteria: {
      ...acceptance,
      core30_stable: core30Stable
    },
    raw_results: results,
    recommendations: generateRecommendations(acceptance, core30Stable, passRateStats)
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
  console.log(`💾 Detailed report saved: ${reportPath}\n`);
  
  // Print recommendations
  if (fullReport.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:');
    fullReport.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    console.log('');
  }
  
  return fullReport;
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(acceptance, core30Stable, passRateStats) {
  const recommendations = [];
  
  if (!acceptance.stability_pass) {
    recommendations.push('High variance detected - investigate non-deterministic behavior');
    recommendations.push('Consider reviewing environment variables and module loading order');
  }
  
  if (!acceptance.range_pass) {
    recommendations.push('Wide range detected - some runs may be outliers');
    recommendations.push('Increase sample size to 20 runs for better statistical confidence');
  }
  
  if (!core30Stable) {
    recommendations.push('Core30 failures are inconsistent - systemic stability issue');
    recommendations.push('Review Core30 protection logic in enhancement modules');
  }
  
  if (acceptance.stability_pass && acceptance.range_pass && core30Stable) {
    recommendations.push('Results validated - deployment can be tagged and committed');
    recommendations.push(`Document median pass rate: ${passRateStats.median.toFixed(2)}% ± ${passRateStats.std_dev.toFixed(2)}%`);
  }
  
  if (passRateStats.median < 45.0) {
    recommendations.push('Pass rate below 45% - review recent changes for regressions');
  } else if (passRateStats.median >= 46.0 && passRateStats.median < 47.0) {
    recommendations.push('Pass rate near 46% target - good baseline configuration');
  }
  
  return recommendations;
}

// Execute
runMultiEvaluation().catch(error => {
  console.error('\n❌ Multi-run evaluation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
