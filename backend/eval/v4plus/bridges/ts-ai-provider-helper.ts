/**
 * TypeScript helper script for AI provider bridge
 * 
 * This script runs in a TypeScript environment and provides access to the
 * production AI provider for the JavaScript evaluation system.
 */

import { getAIProvider } from '../../../src/providers/ai/index.js';
import * as readline from 'readline';

async function main() {
  try {
    // Read input from stdin
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let inputData = '';
    
    // Collect all input
    rl.on('line', (line) => {
      inputData += line;
    });

    rl.on('close', async () => {
      try {
        // Parse input
        const { transcriptText } = JSON.parse(inputData);

        // Get production AI provider
        const aiProvider = getAIProvider();

        // Extract profile data
        const result = await aiProvider.extractProfileData(transcriptText);

        // Output result
        console.log(JSON.stringify(result, null, 0));
        process.exit(0);
      } catch (error) {
        console.error(`TypeScript AI provider error: ${error.message}`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error(`TypeScript helper initialization error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`TypeScript helper fatal error: ${error.message}`);
  process.exit(1);
});