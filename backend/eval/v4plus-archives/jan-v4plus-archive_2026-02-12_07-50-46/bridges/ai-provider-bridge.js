/**
 * Bridge script to connect JavaScript evaluation system to TypeScript AI provider
 * 
 * This script allows the v4plus JavaScript evaluation system to use the same
 * 80% baseline Rules-Based Provider that the V1 TypeScript system uses.
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Extract profile data using the production TypeScript AI provider
 * @param {string} transcriptText - Raw transcript text
 * @returns {Promise<object>} Parse results from production provider
 */
async function extractWithProductionProvider(transcriptText) {
  return new Promise((resolve, reject) => {
    // Build path to TypeScript helper script
    const helperScript = path.join(__dirname, 'ts-ai-provider-helper.ts');
    
    // Create child process to run TypeScript code
    const child = spawn('node', [
      '--loader', 'ts-node/esm',
      '--input-type=module',
      helperScript
    ], {
      cwd: path.join(__dirname, '../../../..'), // Set working directory to project root
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    // Send transcript as input
    child.stdin.write(JSON.stringify({ transcriptText }));
    child.stdin.end();

    // Collect output
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle completion
    child.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse TypeScript provider output: ${parseError.message}\nOutput: ${stdout}`));
        }
      } else {
        reject(new Error(`TypeScript AI provider failed (exit code ${code}): ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to spawn TypeScript AI provider: ${error.message}`));
    });
  });
}

module.exports = {
  extractWithProductionProvider
};