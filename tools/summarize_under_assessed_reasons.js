const fs = require('fs');
const path = require('path');
const reportPath = path.resolve(__dirname, '../backend/eval/v4plus/reports/urgency_under_assessed_cases_2026-02-03T22-18-17-915Z.json');
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const cases = data.cases || [];
const reasonMap = new Map();
for (const c of cases) {
  const id = c.id;
  const reasons = c.reasons && c.reasons.length ? c.reasons : ['no_reasons'];
  for (const r of reasons) {
    if (!reasonMap.has(r)) reasonMap.set(r, []);
    reasonMap.get(r).push(id);
  }
}
const sorted = Array.from(reasonMap.entries()).sort((a,b)=>b[1].length-a[1].length);
console.log(`Total extracted cases: ${cases.length}`);
console.log('Top reasons and counts:');
for (const [r, ids] of sorted) {
  console.log(`- ${r}: ${ids.length} (examples: ${ids.slice(0,5).join(', ')})`);
}
// Also produce simple subtype grouping heuristics
const subtypeMap = new Map();
const mapping = [
  {key: 'amount_related', match: /(amount|amount_wrong|amount_missing|amount_outside|wrong_selection|\$\d+)/i},
  {key: 'eviction_deadline', match: /(eviction|evicted|evicting|notice|pay\s+by|pay\s+or\s+vacate|3[-\s]?day)/i},
  {key: 'utilities_shutoff', match: /(power|electric|utilities|shut\s*off|disconnect)/i},
  {key: 'healthcare', match: /(surgery|hospital|bleeding|overdose|not\s+breath|stroke|heart)/i},
  {key: 'vague_personal', match: /(vague_scenario_cap|no_reasons|vague|personal.*situation|couple.*thousand)/i},
  {key: 'safety_child', match: /(child|kid|baby|infant|domestic|violence|abuse)/i}
];
for (const c of cases) {
  const id = c.id;
  const joined = (c.reasons || []).join(' ');
  let assigned = false;
  for (const m of mapping) {
    if (m.match.test(joined)) {
      if (!subtypeMap.has(m.key)) subtypeMap.set(m.key, []);
      subtypeMap.get(m.key).push(id);
      assigned = true;
      break;
    }
  }
  if (!assigned) {
    if (!subtypeMap.has('other')) subtypeMap.set('other', []);
    subtypeMap.get('other').push(id);
  }
}
console.log('\nSubtype grouping (heuristic):');
for (const [k, ids] of Array.from(subtypeMap.entries()).sort((a,b)=>b[1].length-a[1].length)) {
  console.log(`- ${k}: ${ids.length} (examples: ${ids.slice(0,6).join(', ')})`);
}
