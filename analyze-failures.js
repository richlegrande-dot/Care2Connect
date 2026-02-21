const fs = require('fs');
const path = require('path');
const core30Path = path.join(__dirname, 'backend/eval/v4plus/datasets/core30.jsonl');
const lines = fs.readFileSync(core30Path, 'utf8').split('\n').filter(l => l.trim());
const failingCases = ['T006', 'T011', 'T012', 'T015', 'T022', 'T023', 'T024', 'T025', 'T028', 'T030'];

console.log('Failing Cases Analysis:');
console.log('======================');

failingCases.forEach(id => {
  const caseData = JSON.parse(lines.find(l => JSON.parse(l).id === id));
  console.log(`\n${id}: ${caseData.description}`);
  console.log(`Expected: ${caseData.expected.category}/${caseData.expected.urgencyLevel}/${caseData.expected.name}/${caseData.expected.goalAmount}`);
  console.log(`Difficulty: ${caseData.difficulty}`);
  console.log(`Transcript: "${caseData.transcriptText.substring(0, 120)}..."`);
});