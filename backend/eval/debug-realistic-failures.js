const fs = require('fs');
const path = require('path');

// Read the realistic50 dataset
const datasetPath = path.join(__dirname, 'v4plus', 'datasets', 'realistic50.jsonl');
const lines = fs.readFileSync(datasetPath, 'utf8').split('\n').filter(l => l.trim());

// Read the latest report
const reportsDir = path.join(__dirname, 'v4plus', 'reports');
const reportFiles = fs.readdirSync(reportsDir)
  .filter(f => f.startsWith('v4plus_realistic50_') && f.endsWith('.json'))
  .sort()
  .reverse();

const latestReport = JSON.parse(fs.readFileSync(path.join(reportsDir, reportFiles[0]), 'utf8'));

// Find all test cases
const testCases = new Map();
for (const line of lines) {
  const obj = JSON.parse(line);
  testCases.set(obj.id, obj);
}

// Get the failing category_wrong cases from report
console.log('\n=== REALISTIC50 CATEGORY FAILURES ===\n');

// We need to run each test individually to see what was extracted
// For now, let's identify the pattern from the test IDs
const failingIds = [
  '000REALISTIC_10', '000REALISTIC_14', '000REALISTIC_16', 
  '000REALISTIC_18', '000REALISTIC_20', '000REALISTIC_24',
  '000REALISTIC_28', '000REALISTIC_30'
];

for (const id of failingIds) {
  const test = testCases.get(id);
  if (!test) continue;
  
  console.log(`\n${id}:`);
  console.log(`  Expected: ${test.expected.category}`);
  console.log(`  Text: "${test.transcriptText.substring(0, 100)}..."`);
  
  // Identify pattern
  const text = test.transcriptText.toLowerCase();
  const hasWorkContext = /work|job|employment/i.test(text);
  const hasVehicleIssue = /car|vehicle|truck|transport/i.test(text);
  const hasRentContext = /rent|housing|evict|apartment/i.test(text);
  const hasLayoff = /laid off|fired|terminated|lost.*job/i.test(text);
  
  console.log(`  Pattern: work=${hasWorkContext}, vehicle=${hasVehicleIssue}, rent=${hasRentContext}, layoff=${hasLayoff}`);
  
  // Hypothesis
  if (test.expected.category === 'EMPLOYMENT' && hasRentContext) {
    console.log(`  ⚠️  HYPOTHESIS: EMPLOYMENT misclassified as HOUSING due to rent mention`);
  }
  if (test.expected.category === 'TRANSPORTATION' && hasWorkContext) {
    console.log(`  ⚠️  HYPOTHESIS: TRANSPORTATION misclassified as EMPLOYMENT due to work mention`);
  }
}

console.log('\n');
