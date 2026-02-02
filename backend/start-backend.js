const { spawn } = require('child_process');
const path = require('path');

// Start the backend using ts-node
const tsNodePath = path.join(__dirname, 'node_modules', '.bin', 'ts-node.cmd');
const serverPath = path.join(__dirname, 'src', 'server.ts');

const backend = spawn('node', [
  require.resolve('ts-node/dist/bin.js'),
  '--transpile-only',
  serverPath
], {
  env: { ...process.env, PORT: process.env.PORT || '3001' },
  stdio: 'inherit',
  cwd: __dirname
});

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});

backend.on('exit', (code) => {
  console.log(`Backend exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  backend.kill('SIGINT');
});

process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
});
