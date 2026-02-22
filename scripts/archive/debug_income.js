// Quick debug for income patterns
const INCOME_PATTERNS = [
  /I\s+(?:earn|make)\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+(?:monthly|a\s+month|per\s+month)/i,
  /I\s+(?:earn|make)\s+\$?(\d[\d,]*(?:\.\d{2})?)\s+(?:an?\s+hour|per\s+hour|hourly)/i,
];

const tests = [
  'I earn $1900 monthly',
  'I earn 1900 monthly',
  'I earn $2800 monthly',
  'Hi, this is Jennifer Davis. I earn $1900 monthly. I earn $2800 monthly. need 950 for repairs',
];

for (const t of tests) {
  console.log('Testing:', JSON.stringify(t));
  for (const p of INCOME_PATTERNS) {
    const m = t.match(p);
    console.log('  Pattern:', p.source.substring(0, 40), ' → ', m ? m[1] : 'NO MATCH');
  }
}

// Now test with actual fuzz data
const fs = require('fs');
const fuzz500 = fs.readFileSync('./backend/eval/feb-v1/datasets/fuzz500.jsonl', 'utf-8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(c => c.id && c.transcriptText);

const f330 = fuzz500.find(c => c.id === 'FUZZ_330');
const f486 = fuzz500.find(c => c.id === 'FUZZ_486');
if (f330) {
  console.log('\nFUZZ_330 transcript:', JSON.stringify(f330.transcriptText));
  for (const p of INCOME_PATTERNS) {
    const m = f330.transcriptText.match(p);
    console.log('  Match:', m ? m[1] : 'NO MATCH');
  }
}
if (f486) {
  console.log('\nFUZZ_486 transcript:', JSON.stringify(f486.transcriptText));
  for (const p of INCOME_PATTERNS) {
    const m = f486.transcriptText.match(p);
    console.log('  Match:', m ? m[1] : 'NO MATCH');
  }
}
