// Find top remaining candidates for Phase 2.3
const data = require('./phase2_urgency_under_analysis.json');

const phase2ids = new Set([
  'T009','T022','HARD_006','HARD_007','HARD_008','HARD_009','HARD_012',
  'HARD_017','HARD_020','HARD_031','HARD_034','HARD_043','HARD_052',
  'HARD_053','HARD_060','0000REALISTIC_9','000REALISTIC_16',
  '000REALISTIC_17','000REALISTIC_19','000REALISTIC_21'
]);

const remaining = data.allCases.filter(c => !phase2ids.has(c.id));
const highPriority = remaining.filter(c => c.priority === 'HIGH' && c.gap === 1).slice(0, 8);

console.log('TOP 8 REMAINING HIGH-PRIORITY 1-LEVEL GAPS:\n');
highPriority.forEach((c, i) => {
  console.log(`${i+1}. ${c.id} (${c.dataset})`);
  console.log(`   ${c.actual} → ${c.expected} (${c.category})`);
  console.log(`   "${c.transcriptShort}..."`);
  console.log('');
});
