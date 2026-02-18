/**
 * Compare extractName vs extractNameWithConfidence on actual test cases
 */

const fs = require('fs');
const path = require('path');

// Import using require and direct TS compilation  
const tsNode = require('ts-node');
tsNode.register({
  project: './backend/tsconfig.json'
});

const { extractName, extractNameWithConfidence } = require('./backend/src/utils/extraction/rulesEngine');

// Load the actual test data
const testSet = require('./backend/fixtures/name-extraction-test-set.json');

console.log('Comparing extractName vs extractNameWithConfidence on test data:\n');

let extractNameCorrect = 0;
let extractNameWithConfidenceCorrect = 0;
let total = 0;

for (const testCase of testSet) {
  total++;
  
  const extractNameResult = extractName(testCase.transcript);
  const extractNameWithConfidenceResult = extractNameWithConfidence(testCase.transcript);
  
  const extractNameMatch = extractNameResult?.toLowerCase() === testCase.expectedName.toLowerCase();
  const extractNameWithConfidenceMatch = extractNameWithConfidenceResult.value?.toLowerCase() === testCase.expectedName.toLowerCase();
  
  if (extractNameMatch) extractNameCorrect++;
  if (extractNameWithConfidenceMatch) extractNameWithConfidenceCorrect++;
  
  console.log(`Test ${total}: "${testCase.transcript}"`);
  console.log(`  Expected: "${testCase.expectedName}"`);
  console.log(`  extractName(): "${extractNameResult}" ${extractNameMatch ? '✅' : '❌'}`);
  console.log(`  extractNameWithConfidence(): "${extractNameWithConfidenceResult.value}" (conf: ${extractNameWithConfidenceResult.confidence}) ${extractNameWithConfidenceMatch ? '✅' : '❌'}`);
  console.log('');
}

console.log('=== RESULTS ===');
console.log(`extractName(): ${extractNameCorrect}/${total} correct (${(extractNameCorrect/total*100).toFixed(1)}%)`);
console.log(`extractNameWithConfidence(): ${extractNameWithConfidenceCorrect}/${total} correct (${(extractNameWithConfidenceCorrect/total*100).toFixed(1)}%)`);