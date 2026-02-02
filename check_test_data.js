const fs = require('fs');
const lines = fs.readFileSync('backend/eval/v4plus/datasets/hard60.jsonl', 'utf8').split('\n').filter(l => l.trim());
const cases = lines.map(line => JSON.parse(line)).filter(c => ['HARD_034', 'HARD_042', 'HARD_048'].includes(c.id));

cases.forEach(c => {
  console.log(`ID: ${c.id}`);
  console.log(`Expected: ${JSON.stringify(c.expected)}`);
  console.log(`Strictness: ${JSON.stringify(c.strictness)}`);
  console.log(`Transcript: ${c.transcriptText}`);
  console.log('---');
});