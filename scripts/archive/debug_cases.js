const fs = require('fs');

// Read the hard60.jsonl file and extract the failing cases
const lines = fs.readFileSync('backend/eval/v4plus/datasets/hard60.jsonl', 'utf8').split('\n').filter(l => l.trim());

const failingCases = ['HARD_034', 'HARD_042', 'HARD_048'];
const cases = lines.map(line => JSON.parse(line)).filter(c => failingCases.includes(c.id));

cases.forEach(c => {
  console.log(`Case: ${c.id}`);
  console.log(`Text: ${c.transcriptText}`);
  console.log(`Expected amount: ${c.expected.goalAmount}`);
  console.log('');
});