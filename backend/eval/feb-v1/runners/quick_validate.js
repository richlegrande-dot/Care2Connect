#!/usr/bin/env node
/**
 * Quick Validation Script for Jan v4.0+
 * 
 * Fast smoke test for rapid development iteration.
 * Runs core30 baseline only with minimal output.
 * 
 * Perfect for:
 * - Quick parser change validation
 * - Pre-commit checks
 * - Rapid development feedback
 * - CI/CD gates
 * 
 * Usage:
 *   node quick_validate.js
 *   npm run eval:v4plus:quick
 */

const { spawn } = require('child_process');
const path = require('path');

const runnerPath = path.join(__dirname, 'run_eval_v4plus.js');

console.log(`\n⚡ Quick Validation (core30 baseline)`);
console.log(`${'─'.repeat(50)}\n`);

const startTime = Date.now();

const child = spawn('node', [runnerPath, '--dataset', 'core30', '--quiet'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, ZERO_OPENAI_MODE: 'true' },
  stdio: 'pipe'
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  stdout += data.toString();
});

child.stderr.on('data', (data) => {
  stderr += data.toString();
});

child.on('close', (code) => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Parse results
  const strictMatch = stdout.match(/strictPassPercentage["\s:]+(\d+\.?\d*)/);
  const acceptableMatch = stdout.match(/acceptablePassPercentage["\s:]+(\d+\.?\d*)/);
  const casesMatch = stdout.match(/totalCases["\s:]+(\d+)/);
  const passedMatch = stdout.match(/strictPassed["\s:]+(\d+)/);

  const strictPass = strictMatch ? parseFloat(strictMatch[1]) : 0;
  const acceptablePass = acceptableMatch ? parseFloat(acceptableMatch[1]) : 0;
  const totalCases = casesMatch ? parseInt(casesMatch[1]) : 0;
  const passed = passedMatch ? parseInt(passedMatch[1]) : 0;

  // Display minimal results
  const passIcon = strictPass === 100.0 ? '✅' : '❌';
  
  console.log(`${passIcon} Strict Pass: ${strictPass.toFixed(1)}% (${passed}/${totalCases})`);
  console.log(`   Acceptable: ${acceptablePass.toFixed(1)}%`);
  console.log(`   Duration: ${duration}s`);

  if (strictPass === 100.0) {
    console.log(`\n✅ BASELINE CLEAN - No regressions detected\n`);
    process.exit(0);
  } else {
    console.log(`\n❌ BASELINE FAILED - Regressions detected`);
    console.log(`   Expected: 100% strict pass`);
    console.log(`   Actual: ${strictPass.toFixed(1)}%`);
    console.log(`\n   Run 'npm run eval:v4plus:core' for detailed output\n`);
    process.exit(1);
  }
});

child.on('error', (err) => {
  console.error(`\n❌ Error running validation: ${err.message}\n`);
  process.exit(1);
});
