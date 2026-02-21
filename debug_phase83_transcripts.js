const fs = require('fs');
const path = require('path');

const hard60Path = path.join(__dirname, 'backend/eval/feb-v1/datasets/hard60.jsonl');
const lines = fs.readFileSync(hard60Path, 'utf8').split('\n').filter(l => l.trim());
const cases = lines.map(l => JSON.parse(l));

// These are the 16 failing cases
const failIDs = [
  'HARD_001','HARD_003','HARD_005','HARD_006','HARD_010','HARD_018',
  'HARD_021','HARD_027','HARD_030','HARD_032','HARD_035','HARD_037',
  'HARD_040','HARD_041','HARD_044','HARD_051'
];

for (const id of failIDs) {
  const c = cases.find(t => t.id === id);
  if (!c) { console.log(`${id}: NOT FOUND`); continue; }
  const exp = c.expected || {};
  const text = c.transcriptText || '';
  console.log(`\n=== ${id} === exp: cat=${exp.category} urg=${exp.urgencyLevel} amt=${exp.goalAmount}`);
  console.log(text.substring(0, 250));
}
