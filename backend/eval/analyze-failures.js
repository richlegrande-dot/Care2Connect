const fs = require('fs');

// Load the latest analytics report
const reportPath = 'output/simulation/jan-v3-analytics-2026-01-24T21-30-55-252Z.json';
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Find Name failures
const nameFailures = [];
report.detailed_results.forEach(test => {
  if (!test.fieldMatches.nameMatch.matches) {
    nameFailures.push({
      id: test.id,
      expected: test.expected.name,
      actual: test.results.name
    });
  }
});

// Find Urgency failures
const urgencyFailures = [];
report.detailed_results.forEach(test => {
  if (!test.fieldMatches.urgencyMatch) {
    urgencyFailures.push({
      id: test.id,
      expected: test.expected.urgencyLevel,
      actual: test.results.urgencyLevel
    });
  }
});

// Display results
console.log('\n🔍 JAN v4.0 FIELD FAILURE ANALYSIS');
console.log('='.repeat(70));

console.log('\n📛 NAME EXTRACTION FAILURES (' + nameFailures.length + '/30):');
console.log('='.repeat(70));
if (nameFailures.length === 0) {
  console.log('✅ All name extractions correct!');
} else {
  nameFailures.forEach(f => {
    console.log(`  ${f.id}: Expected "${f.expected}" → Got "${f.actual}"`);
  });
}

console.log('\n📛 URGENCY ASSESSMENT FAILURES (' + urgencyFailures.length + '/30):');
console.log('='.repeat(70));
if (urgencyFailures.length === 0) {
  console.log('✅ All urgency assessments correct!');
} else {
  urgencyFailures.forEach(f => {
    console.log(`  ${f.id}: Expected ${f.expected} → Got ${f.actual}`);
  });
}

console.log('\n' + '='.repeat(70));
console.log('📊 SUMMARY:');
console.log(`  Name: ${30 - nameFailures.length}/30 correct (${((30 - nameFailures.length) / 30 * 100).toFixed(1)}%)`);
console.log(`  Urgency: ${30 - urgencyFailures.length}/30 correct (${((30 - urgencyFailures.length) / 30 * 100).toFixed(1)}%)`);
console.log(`  Target: 95%+ (29/30 or better) on each field`);
console.log(`  Fixes needed: Name (${Math.max(0, 29 - (30 - nameFailures.length))}), Urgency (${Math.max(0, 29 - (30 - urgencyFailures.length))})\n`);
