// Quick script to list all test IDs with urgency_under from datasets
const path = require('path');
const fs = require('fs');

// Read datasets  
const datasetsDir = path.join(__dirname, '../datasets');
const core30Path = path.join(datasetsDir, 'core30.jsonl');
const hard60Path = path.join(datasetsDir, 'hard60.jsonl');
const realistic50Path = path.join(datasetsDir, 'realistic50.jsonl');
const fuzz200Path = path.join(datasetsDir, 'fuzz200.jsonl');

function readJsonlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim().split('\n').map(line => JSON.parse(line));
}

async function main() {
  console.log('\n=== EXTRACTING ALL TEST CASES FOR MANUAL ANALYSIS ===\n');
  
  const datasets = [
    { name: 'core30', path: core30Path },
    { name: 'hard60', path: hard60Path },
    { name: 'realistic50', path: realistic50Path },
    { name: 'fuzz200', path: fuzz200Path }
  ];
  
  const allTests = [];
  
  for (const dataset of datasets) {
    const tests = readJsonlFile(dataset.path);
    tests.forEach(test => {
      // Skip tests without expected field (like fuzz tests)
      if (!test.expected || !test.expected.urgencyLevel) {
        return;
      }
      
      allTests.push({
        id: test.id,
        dataset: dataset.name,
        expected_urgency: test.expected.urgencyLevel,
        expected_category: test.expected.category,
        expected_amount: test.expected.goalAmount,
        expected_name: test.expected.name,
        transcript: test.transcriptText
      });
    });
  }
  
  console.log(`Total tests loaded: ${allTests.length}`);
  console.log('');
  console.log('To identify urgency_under cases, run:');
  console.log('  node backend/eval/v4plus/runners/run_eval_v4plus.js --dataset all');
  console.log('');
  console.log('The failure output shows test IDs like HARD_006, HARD_007, etc.');
  console.log('');
  console.log('For Phase 2, we need to analyze ~55 urgency_under_assessed cases.');
  console.log('These are cases where actual urgency < expected urgency.');
  console.log('');
  
  // Export all test data for reference
  const outputPath = path.join(__dirname, '../reports/all_tests_reference.json');
  fs.writeFileSync(outputPath, JSON.stringify({ total: allTests.length, tests: allTests }, null, 2));
  console.log(`Exported all test data to: ${outputPath}`);
  console.log('');
  
  // Show examples from each urgency level
  console.log('=== SAMPLE TESTS BY EXPECTED URGENCY ===\n');
  ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].forEach(level => {
    const samples = allTests.filter(t => t.expected_urgency === level).slice(0, 2);
    console.log(`${level}:`);
    samples.forEach(s => {
      console.log(`  - ${s.id} (${s.dataset}): "${s.transcript.substring(0, 60)}..."`);
    });
    console.log('');
  });
}

main().catch(console.error);
