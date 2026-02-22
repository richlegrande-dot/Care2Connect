const fs = require('fs');

const reportPath = 'backend/eval/v4plus/reports/v4plus_core30_2026-02-07T20-13-02-356Z.json';
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const failingIds = ['T007', 'T009', 'T011', 'T012', 'T015', 'T018', 'T022', 'T023', 'T025'];
const failures = report.results.filter(r => failingIds.includes(r.testId));

console.log('CORE30 FAILURE ANALYSIS\n');
console.log('='.repeat(80));

failures.forEach(f => {
  console.log(`\n${f.testId}: ${f.description || 'No description'}`);
  console.log(`  Expected: category=${f.expected.category}, urgency=${f.expected.urgency}`);
  console.log(`  Actual:   category=${f.actual.category}, urgency=${f.actual.urgency}`);
  console.log(`  Score: ${f.score}`);
  console.log(`  Transcript: "${f.transcript.substring(0, 120)}..."`);
  
  // Determine failure type
  const catWrong = f.expected.category !== f.actual.category;
  const urgWrong = f.expected.urgency !== f.actual.urgency;
  
  if (catWrong && urgWrong) {
    console.log(`  ❌ BOTH category AND urgency wrong`);
  } else if (catWrong) {
    console.log(`  ❌ Category: ${f.expected.category} → ${f.actual.category}`);
  } else if (urgWrong) {
    console.log(`  ❌ Urgency: ${f.expected.urgency} → ${f.actual.urgency}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\nSUMMARY:');
const categoryFails = failures.filter(f => f.expected.category !== f.actual.category);
const urgencyFails = failures.filter(f => f.expected.urgency !== f.actual.urgency);

console.log(`- Category failures: ${categoryFails.length} (${categoryFails.map(f => f.testId).join(', ')})`);
console.log(`- Urgency failures: ${urgencyFails.length} (${urgencyFails.map(f => f.testId).join(', ')})`);
