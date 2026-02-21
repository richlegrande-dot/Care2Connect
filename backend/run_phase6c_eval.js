// Phase 6D evaluation - standalone runner
// Usage: node run_phase6d_eval.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendDir = path.resolve(__dirname);
const outFile = path.join(backendDir, 'phase6c_result.txt');

try {
  console.log('Running Phase 6C eval from:', backendDir);
  const result = execSync(
    'npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30',
    { cwd: backendDir, encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024 }
  );
  fs.writeFileSync(outFile, result, 'utf8');
  console.log('Output saved to:', outFile);
  console.log(result);
} catch (err) {
  fs.writeFileSync(outFile, `ERROR:\n${err.stderr || ''}\n${err.stdout || ''}\n${err.message}`, 'utf8');
  console.error('EVAL FAILED:', err.message);
  if (err.stderr) console.error('STDERR:', err.stderr);
  if (err.stdout) console.log('STDOUT:', err.stdout);
}
