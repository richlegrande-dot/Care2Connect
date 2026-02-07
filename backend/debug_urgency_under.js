// Debug urgency_under_assessed patterns from Hard60
const fs = require('fs');

// Load the latest Hard60 report
const reportPath = 'eval/v4plus/reports/v4plus_hard60_2026-02-03T14-08-17-397Z.json';
const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('=== URGENCY UNDER-ASSESSED ANALYSIS ===');
console.log('Total urgency_under_assessed cases:', reportData.summary.failureBuckets.urgency_under_assessed || 0);
console.log('');

// Find cases with urgency_under_assessed
const urgencyUnderCases = reportData.results.filter(result => 
  result.failures.some(failure => failure.type === 'urgency_under_assessed')
);

console.log('=== TOP 5 URGENCY UNDER-ASSESSED CASES ===');
urgencyUnderCases.slice(0, 5).forEach((testCase, i) => {
  console.log(`\n${i+1}. Case ${testCase.caseId}:`);
  console.log(`   Expected: ${testCase.expected.urgencyLevel}`);
  console.log(`   Actual: ${testCase.results.urgencyLevel}`);
  console.log(`   Text: ${testCase.input.substring(0, 200)}...`);
  
  const urgencyFailure = testCase.failures.find(f => f.type === 'urgency_under_assessed');
  if (urgencyFailure) {
    console.log(`   Issue: ${urgencyFailure.details}`);
  }
});

console.log('\n=== PATTERN ANALYSIS ===');
// Analyze expected vs actual patterns
const urgencyPatterns = {};
urgencyUnderCases.forEach(testCase => {
  const pattern = `${testCase.results.urgencyLevel} → ${testCase.expected.urgencyLevel}`;
  urgencyPatterns[pattern] = (urgencyPatterns[pattern] || 0) + 1;
});

console.log('Urgency under-assessment patterns:');
Object.entries(urgencyPatterns).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
  console.log(`   ${pattern}: ${count} cases`);
});

// Look for common keywords that might indicate higher urgency
console.log('\n=== KEYWORD ANALYSIS ===');
const urgencyKeywords = [];
urgencyUnderCases.forEach(testCase => {
  const text = testCase.input.toLowerCase();
  // Common urgency indicators
  if (text.includes('emergency')) urgencyKeywords.push('emergency');
  if (text.includes('urgent')) urgencyKeywords.push('urgent');
  if (text.includes('crisis')) urgencyKeywords.push('crisis');
  if (text.includes('eviction')) urgencyKeywords.push('eviction');
  if (text.includes('foreclosure')) urgencyKeywords.push('foreclosure');
  if (text.includes('shut off')) urgencyKeywords.push('shut off');
  if (text.includes('surgery')) urgencyKeywords.push('surgery');
  if (text.includes('hospital')) urgencyKeywords.push('hospital');
  if (text.includes('tomorrow')) urgencyKeywords.push('tomorrow');
  if (text.includes('today')) urgencyKeywords.push('today');
  if (text.includes('by friday') || text.includes('by monday')) urgencyKeywords.push('deadline');
});

const keywordCounts = {};
urgencyKeywords.forEach(kw => {
  keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
});

console.log('Common urgency keywords in under-assessed cases:');
Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).forEach(([keyword, count]) => {
  console.log(`   ${keyword}: ${count} cases`);
});