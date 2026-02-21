#!/usr/bin/env node
/**
 * Progressive Test Runner for Jan v4.0+
 * 
 * Runs test suites in order of difficulty, stopping on critical failures.
 * This allows rapid identification of regressions without waiting for full suite.
 * 
 * Strategy:
 * 1. core30 (baseline) - MUST pass 100% strict or abort
 * 2. hard60 (curated edge cases) - Continue if ≥85% acceptable
 * 3. fuzz200 (quick fuzz) - Continue if ≥80% acceptable
 * 4. fuzz500 (extended fuzz) - Continue if ≥75% acceptable
 * 5. fuzz10k (comprehensive) - Final stress test
 * 
 * Usage:
 *   node run_progressive.js [--stop-on-regression] [--max-suite=fuzz500]
 *   npm run eval:v4plus:progressive
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const SUITES = [
  {
    name: 'core30',
    description: 'Baseline (30 cases)',
    minStrictPass: 100.0,
    minAcceptablePass: 100.0,
    isRequired: true,
    estimatedTime: '0.3s'
  },
  {
    name: 'hard60',
    description: 'Curated edge cases (60 cases)',
    minStrictPass: 70.0,
    minAcceptablePass: 85.0,
    isRequired: false,
    estimatedTime: '0.6s'
  },
  {
    name: 'fuzz200',
    description: 'Quick fuzz (200 cases)',
    minStrictPass: 65.0,
    minAcceptablePass: 80.0,
    isRequired: false,
    estimatedTime: '2s'
  },
  {
    name: 'fuzz500',
    description: 'Extended fuzz (500 cases)',
    minStrictPass: 60.0,
    minAcceptablePass: 75.0,
    isRequired: false,
    estimatedTime: '5s'
  },
  {
    name: 'fuzz10k',
    description: 'Comprehensive stress test (10,500 cases)',
    minStrictPass: 55.0,
    minAcceptablePass: 70.0,
    isRequired: false,
    estimatedTime: '105s'
  }
];

// Parse command-line arguments
const args = process.argv.slice(2);
const stopOnRegression = args.includes('--stop-on-regression');
const maxSuiteArg = args.find(a => a.startsWith('--max-suite='));
const maxSuite = maxSuiteArg ? maxSuiteArg.split('=')[1] : null;
const verbose = args.includes('--verbose') || args.includes('-v');

// Find max suite index
let maxSuiteIndex = SUITES.length - 1;
if (maxSuite) {
  const index = SUITES.findIndex(s => s.name === maxSuite);
  if (index === -1) {
    console.error(`❌ Unknown suite: ${maxSuite}`);
    console.error(`   Available: ${SUITES.map(s => s.name).join(', ')}`);
    process.exit(1);
  }
  maxSuiteIndex = index;
}

// Results tracking
const results = {
  startTime: Date.now(),
  suites: [],
  totalCases: 0,
  totalPassed: 0,
  stopped: false,
  stopReason: null
};

// Run a single suite
async function runSuite(suite) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 SUITE: ${suite.name.toUpperCase()}`);
  console.log(`   ${suite.description}`);
  console.log(`   Estimated time: ${suite.estimatedTime}`);
  console.log(`   Minimum thresholds: ${suite.minStrictPass}% strict, ${suite.minAcceptablePass}% acceptable`);
  console.log(`${'='.repeat(70)}\n`);

  const runnerPath = path.join(__dirname, 'run_eval_v4plus.js');
  
  return new Promise((resolve, reject) => {
    const child = spawn('node', [runnerPath, '--dataset', suite.name, '--quiet'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, ZERO_OPENAI_MODE: 'true' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      if (verbose) {
        process.stdout.write(output);
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      if (verbose) {
        process.stderr.write(output);
      }
    });

    child.on('close', (code) => {
      // Parse results from stdout (look for JSON report)
      const jsonMatch = stdout.match(/\{[\s\S]*"summary"[\s\S]*\}/);
      let suiteResults = null;
      
      if (jsonMatch) {
        try {
          suiteResults = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('⚠️  Failed to parse JSON results');
        }
      }

      // Extract key metrics
      let strictPass = 0;
      let acceptablePass = 0;
      let totalCases = 0;

      if (suiteResults && suiteResults.summary) {
        strictPass = suiteResults.summary.strictPassPercentage || 0;
        acceptablePass = suiteResults.summary.acceptablePassPercentage || 0;
        totalCases = suiteResults.summary.totalCases || 0;
      } else {
        // Fallback: parse from text output
        const strictMatch = stdout.match(/Strict.*?(\d+\.?\d*)%/);
        const acceptableMatch = stdout.match(/Acceptable.*?(\d+\.?\d*)%/);
        const casesMatch = stdout.match(/(\d+)\s+total cases/);
        
        if (strictMatch) strictPass = parseFloat(strictMatch[1]);
        if (acceptableMatch) acceptablePass = parseFloat(acceptableMatch[1]);
        if (casesMatch) totalCases = parseInt(casesMatch[1]);
      }

      const result = {
        suite: suite.name,
        totalCases,
        strictPass,
        acceptablePass,
        passed: strictPass >= suite.minStrictPass && acceptablePass >= suite.minAcceptablePass,
        meetsStrictThreshold: strictPass >= suite.minStrictPass,
        meetsAcceptableThreshold: acceptablePass >= suite.minAcceptablePass,
        exitCode: code
      };

      resolve(result);
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Display suite result
function displayResult(result, suite) {
  const passIcon = result.passed ? '✅' : '❌';
  const strictIcon = result.meetsStrictThreshold ? '✅' : '❌';
  const acceptableIcon = result.meetsAcceptableThreshold ? '✅' : '❌';

  console.log(`\n${passIcon} ${suite.name.toUpperCase()} RESULTS:`);
  console.log(`   Total cases: ${result.totalCases}`);
  console.log(`   ${strictIcon} Strict pass: ${result.strictPass.toFixed(1)}% (threshold: ${suite.minStrictPass}%)`);
  console.log(`   ${acceptableIcon} Acceptable pass: ${result.acceptablePass.toFixed(1)}% (threshold: ${suite.minAcceptablePass}%)`);
  
  if (!result.passed) {
    console.log(`   ⚠️  BELOW THRESHOLD`);
  }
}

// Check if should continue
function shouldContinue(result, suite, index) {
  // Always stop if required suite fails
  if (suite.isRequired && !result.passed) {
    results.stopped = true;
    results.stopReason = `Required suite '${suite.name}' failed (${result.strictPass.toFixed(1)}% strict, need ${suite.minStrictPass}%)`;
    return false;
  }

  // Stop on regression if flag set
  if (stopOnRegression && !result.passed) {
    results.stopped = true;
    results.stopReason = `Suite '${suite.name}' failed and --stop-on-regression is enabled`;
    return false;
  }

  // Stop if reached max suite
  if (index >= maxSuiteIndex) {
    results.stopped = true;
    results.stopReason = `Reached max suite: ${SUITES[maxSuiteIndex].name}`;
    return false;
  }

  return true;
}

// Display final summary
function displaySummary() {
  const duration = ((Date.now() - results.startTime) / 1000).toFixed(1);
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📈 PROGRESSIVE TEST SUMMARY`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log(`Total time: ${duration}s`);
  console.log(`Total cases tested: ${results.totalCases}`);
  console.log(`Suites run: ${results.suites.length}/${maxSuiteIndex + 1}\n`);

  // Suite breakdown
  console.log(`Suite Results:`);
  results.suites.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`  ${icon} ${result.suite.padEnd(10)} - ${result.strictPass.toFixed(1)}% strict, ${result.acceptablePass.toFixed(1)}% acceptable`);
  });

  // Stop reason
  if (results.stopped && results.stopReason) {
    console.log(`\n⚠️  Stopped: ${results.stopReason}`);
  }

  // Overall status
  const allPassed = results.suites.every(r => r.passed);
  const requiredPassed = results.suites.filter((r, i) => SUITES[i].isRequired).every(r => r.passed);

  console.log(`\n${'='.repeat(70)}`);
  if (allPassed) {
    console.log(`✅ ALL SUITES PASSED`);
  } else if (requiredPassed) {
    console.log(`⚠️  REQUIRED SUITES PASSED, SOME OPTIONAL FAILURES`);
  } else {
    console.log(`❌ CRITICAL FAILURES DETECTED`);
  }
  console.log(`${'='.repeat(70)}\n`);

  return allPassed ? 0 : 1;
}

// Main execution
async function main() {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 Jan v4.0+ Progressive Test Runner`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log(`Configuration:`);
  console.log(`  Max suite: ${SUITES[maxSuiteIndex].name}`);
  console.log(`  Stop on regression: ${stopOnRegression ? 'YES' : 'NO'}`);
  console.log(`  Verbose output: ${verbose ? 'YES' : 'NO'}`);

  for (let i = 0; i <= maxSuiteIndex; i++) {
    const suite = SUITES[i];
    
    try {
      const result = await runSuite(suite);
      results.suites.push(result);
      results.totalCases += result.totalCases;
      
      displayResult(result, suite);
      
      if (!shouldContinue(result, suite, i)) {
        break;
      }
      
      // Brief pause between suites
      if (i < maxSuiteIndex) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error(`\n❌ Error running suite '${suite.name}':`, err.message);
      results.stopped = true;
      results.stopReason = `Suite '${suite.name}' threw error: ${err.message}`;
      break;
    }
  }

  const exitCode = displaySummary();
  process.exit(exitCode);
}

// Run
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
