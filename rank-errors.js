const fs = require('fs');
const path = require('path');

// Read the latest evaluation report
const reportPath = path.join(__dirname, 'backend/eval/v4plus/reports/v4plus_core30_2026-01-30T16-22-41-221Z.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Read core30 dataset
const core30Path = path.join(__dirname, 'backend/eval/v4plus/datasets/core30.jsonl');
const lines = fs.readFileSync(core30Path, 'utf8').split('\n').filter(l => l.trim());
const core30Data = lines.map(l => JSON.parse(l));

// Get failing cases
const failingCases = report.regressions.cases.map(r => r.testId);

// Analyze each failing case
const analysis = failingCases.map(id => {
  const caseData = core30Data.find(c => c.id === id);
  const regression = report.regressions.cases.find(r => r.testId === id);

  return {
    id,
    description: caseData.description,
    expected: {
      category: caseData.expected.category,
      urgency: caseData.expected.urgencyLevel,
      name: caseData.expected.name,
      amount: caseData.expected.goalAmount
    },
    failedFields: regression.failedFields,
    difficulty: caseData.difficulty,
    transcript: caseData.transcriptText.substring(0, 80) + '...'
  };
});

// Rank by impact (number of failed fields) and difficulty
const ranked = analysis.sort((a, b) => {
  const aImpact = a.failedFields.length;
  const bImpact = b.failedFields.length;
  if (aImpact !== bImpact) return bImpact - aImpact; // Higher impact first

  const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'adversarial': 4 };
  return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
});

console.log('RANKED REMAINING ERRORS BY IMPACT AND DIFFICULTY');
console.log('================================================');
console.log('');

ranked.forEach((item, index) => {
  console.log(`${index + 1}. ${item.id} - ${item.failedFields.join(' + ')} (${item.difficulty})`);
  console.log(`   Expected: ${item.expected.category}/${item.expected.urgency}/${item.expected.name}/${item.expected.amount}`);
  console.log(`   Issue: ${item.description}`);
  console.log(`   Transcript: "${item.transcript}"`);
  console.log('');
});