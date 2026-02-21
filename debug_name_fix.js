const fs = require('fs');
const path = require('path');

// Load hard60 dataset (JSONL)
const hard60Path = path.join(__dirname, 'backend/eval/feb-v1/datasets/hard60.jsonl');
const lines = fs.readFileSync(hard60Path, 'utf8').split('\n').filter(l => l.trim());
const cases = lines.map(l => JSON.parse(l));

const c52 = cases.find(t => t.id === 'HARD_052');
const c57 = cases.find(t => t.id === 'HARD_057');
const c48 = cases.find(t => t.id === 'HARD_048');
const c50 = cases.find(t => t.id === 'HARD_050');
const c51 = cases.find(t => t.id === 'HARD_051');
const c56 = cases.find(t => t.id === 'HARD_056');

for (const c of [c48, c50, c51, c52, c56, c57]) {
  if (!c) continue;
  const exp = c.expectedOutput || c.expected || {};
  console.log(`\n=== ${c.id} ===`);
  const text = c.transcriptText || c.transcript || c.input || '';
  console.log('Expected name:', exp.name);
  console.log('Transcript (first 500):', text.substring(0, 500));
}
