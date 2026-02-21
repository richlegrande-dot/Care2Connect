const fs = require('fs');
const path = require('path');

const casesPath = path.join(__dirname, '..', 'backend', 'eval', 'v4plus', 'custom_cases', 'custom_hard60_extra.json');
const outPath = path.join(__dirname, '..', 'backend', 'eval', 'v4plus', 'reports', 'custom_hard60_extra_report.json');

async function main() {
  if (!fs.existsSync(casesPath)) {
    console.error('Cases file not found:', casesPath);
    process.exit(2);
  }

  const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

  // Require urgency service
  const urgency = require(path.join(__dirname, '..', 'backend', 'src', 'services', 'UrgencyAssessmentService.js'));
  const results = [];

  for (const c of cases) {
    try {
      /* assessWithDebug returns a Promise */
      // Some services export functions; handle both exported fn and object
      const assess = urgency.assessWithDebug || urgency.assessWithDebug;
      const res = await assess(c.transcript, { category: c.category, amount: c.amount });
      results.push({ id: c.id, transcriptLength: (c.transcript || '').length, inputCategory: c.category, inputAmount: c.amount, result: res });
    } catch (e) {
      results.push({ id: c.id, error: e && e.message ? e.message : String(e) });
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), total: results.length, results }, null, 2));
  console.log('Custom run complete. Report saved to', outPath);
}

main().catch(err => {
  console.error('Runner error:', err);
  process.exit(1);
});
