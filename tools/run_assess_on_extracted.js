const fs = require('fs');
const path = require('path');

async function main() {
  const repoRoot = path.join(__dirname, '..');
  const reportsDir = path.join(repoRoot, 'backend', 'eval', 'v4plus', 'reports');
  const datasetsDir = path.join(repoRoot, 'backend', 'eval', 'v4plus', 'datasets');
  const servicePath = path.join(repoRoot, 'backend', 'src', 'services', 'UrgencyAssessmentService.js');

  if (!fs.existsSync(servicePath)) {
    console.error('Urgency service not found at', servicePath);
    process.exit(2);
  }

  const urgency = require(servicePath);
  const assess = urgency.assessWithDebug || urgency.assessWithDebug;

  // Find latest extractor report
  const files = fs.readdirSync(reportsDir).filter(f => f.startsWith('urgency_under_assessed_cases_') && f.endsWith('.json'));
  if (!files || files.length === 0) {
    console.error('No extractor report found in', reportsDir);
    process.exit(2);
  }
  files.sort();
  const latest = files[files.length - 1];
  const report = JSON.parse(fs.readFileSync(path.join(reportsDir, latest), 'utf8'));
  const cases = report.cases || [];

  const datasetCache = {};
  function loadDataset(name) {
    if (datasetCache[name]) return datasetCache[name];
    const p = path.join(datasetsDir, name);
    if (!fs.existsSync(p)) return null;
    const lines = fs.readFileSync(p, 'utf8').trim().split('\n');
    const map = new Map();
    for (const line of lines) {
      if (!line || !line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        const id = obj.id || obj._id || obj.testId || obj.test_id || obj.caseId || obj.case_id || null;
        if (id) map.set(id, obj);
      } catch (e) {
        // skip
      }
    }
    datasetCache[name] = map;
    return map;
  }

  const results = [];
  for (const c of cases) {
    try {
      const ds = c.dataset;
      const map = loadDataset(ds);
      let source = null;
      if (map) source = map.get(c.id) || null;

      const transcript = source ? (source.transcriptText || source.transcript || source.input || '') : '';
      const category = source && source.category ? source.category : undefined;
      const amount = source && typeof source.amount !== 'undefined' ? source.amount : undefined;

      const res = await assess(transcript, { category, amount });
      results.push({ id: c.id, dataset: c.dataset, expected: c.expected, actual: c.actual, score: res.score, confidence: res.confidence, reasons: res.reasons || [], debug: res.debug || {} });
    } catch (e) {
      results.push({ id: c.id, dataset: c.dataset, error: e && e.message ? e.message : String(e) });
    }
  }

  const outPath = path.join(reportsDir, `assess_extracted_debug_${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), total: results.length, results }, null, 2), 'utf8');
  console.log('Assess debug run complete. Report saved to', outPath);
}

main().catch(err => {
  console.error('Runner error:', err && err.stack || err);
  process.exit(1);
});
