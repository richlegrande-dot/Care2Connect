/**
 * Debug script to check actual vs expected urgency levels for core30 cases
 */

const fs = require('fs');
const path = require('path');

// Import parser adapter
const parserAdapter = require('./runners/parserAdapter');

// Load core30 dataset
const core30Path = path.join(__dirname, 'datasets/core30.jsonl');
const core30Data = fs.readFileSync(core30Path, 'utf8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

async function debugUrgency() {
  console.log('Testing urgency assessment for core30 cases...\n');

  for (const testCase of core30Data.slice(0, 10)) { // Test first 10 cases
    try {
      console.log(`\n--- Testing ${testCase.id} ---`);
      console.log(`Expected urgency: ${testCase.expected.urgencyLevel}`);
      console.log(`Transcript: "${testCase.transcriptText}"`);

      const parseResult = await parserAdapter.extractAll(testCase.transcriptText, testCase);
      const { urgencyLevel: actualUrgency } = parseResult;

      console.log(`Actual urgency: ${actualUrgency}`);

      const match = actualUrgency === testCase.expected.urgencyLevel;
      const status = match ? '✅' : '❌';
      console.log(`${status} Match: ${match}`);

    } catch (error) {
      console.log(`❌ ${testCase.id}: ERROR - ${error.message}`);
    }
  }
}

debugUrgency().catch(console.error);