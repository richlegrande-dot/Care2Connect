const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '..', 'backend', 'eval', 'v4plus', 'reports');
const file = fs.readdirSync(reportsDir).filter(f => f.startsWith('assess_extracted_debug_')).sort().pop();
if (!file) {
  console.error('No assess_extracted_debug report found');
  process.exit(2);
}
const data = JSON.parse(fs.readFileSync(path.join(reportsDir, file), 'utf8'));
const counts = {};
for (const r of data.results || []) {
  const rs = r.reasons || [];
  for (const reason of rs) {
    counts[reason] = (counts[reason] || 0) + 1;
  }
}
const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
const out = { report: file, totalCases: data.total || (data.results && data.results.length) || 0, reasonCounts: entries };
console.log(JSON.stringify(out, null, 2));
// Also write a summary file
fs.writeFileSync(path.join(reportsDir, `reason_counts_summary_${new Date().toISOString().replace(/[:.]/g,'-')}.json`), JSON.stringify(out, null, 2));
