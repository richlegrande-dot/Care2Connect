const fs = require('fs');
const path = require('path');

async function main() {
  const repoRoot = path.join(__dirname, '..');
  const datasetsDir = path.join(repoRoot, 'backend', 'eval', 'v4plus', 'datasets');
  const reportsDir = path.join(repoRoot, 'backend', 'eval', 'v4plus', 'reports');

  const datasetFiles = ['core30.jsonl', 'hard60.jsonl', 'realistic50.jsonl', 'fuzz200.jsonl'];
  const urgencyServicePath = path.join(repoRoot, 'backend', 'src', 'services', 'UrgencyAssessmentService.js');

  if (!fs.existsSync(urgencyServicePath)) {
    console.error('Urgency service not found at', urgencyServicePath);
    process.exit(2);
  }

  const urgency = require(urgencyServicePath);
  const assess = urgency.assessWithDebug || urgency.assessWithDebug;

  const levelOrder = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3 };
  const results = [];

  for (const file of datasetFiles) {
    const p = path.join(datasetsDir, file);
    if (!fs.existsSync(p)) {
      console.warn('Dataset missing, skipping:', p);
      continue;
    }

    const lines = fs.readFileSync(p, 'utf8').trim().split('\n');
    for (const line of lines) {
      if (!line || line.trim().length === 0) continue;
      try {
        const c = JSON.parse(line);
        const id = c.id || c._id || c.testId || null;
        const transcript = c.transcriptText || c.transcript || c.input || '';
        const expected = (c.expected && c.expected.urgencyLevel) ? c.expected.urgencyLevel : null;
        const expectedCat = (c.expected && c.expected.category) ? c.expected.category : undefined;
        const expectedAmount = (c.expected && typeof c.expected.goalAmount !== 'undefined') ? c.expected.goalAmount : undefined;

        if (!id || !expected) continue;

        // Call assessWithDebug
        /* eslint-disable no-await-in-loop */
        const assessment = await assess(transcript, { category: expectedCat, amount: expectedAmount });

        const actual = assessment.urgencyLevel || (assessment.score >= 0.85 ? 'CRITICAL' : assessment.score >= 0.55 ? 'HIGH' : assessment.score >= 0.15 ? 'MEDIUM' : 'LOW');

        if ((levelOrder[actual] || 0) < (levelOrder[expected] || 0)) {
          results.push({ id, dataset: file, expected, actual, score: assessment.score, confidence: assessment.confidence, reasons: assessment.reasons || [] });
        }
      } catch (e) {
        console.error('Error parsing/assessing line in', file, e && e.message);
      }
    }
  }

  fs.mkdirSync(reportsDir, { recursive: true });
  const outPath = path.join(reportsDir, `urgency_under_assessed_cases_${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), totalFound: results.length, cases: results }, null, 2), 'utf8');
  console.log('Done. Found', results.length, 'under-assessed cases. Report saved to', outPath);
}

main().catch(err => {
  console.error('Runner failed:', err && err.stack || err);
  process.exit(1);
});
