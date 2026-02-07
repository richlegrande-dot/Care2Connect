const fs = require('fs');
const path = require('path');
(async () => {
  const datasetPath = path.join(__dirname, '../backend/eval/v4plus/datasets/hard60.jsonl');
  const reportDir = path.join(__dirname, '../backend/eval/v4plus/reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const service = require('../backend/src/services/UrgencyAssessmentService.js');
  const content = fs.readFileSync(datasetPath, 'utf8').trim().split('\n');
  const levelValue = (l) => {
    if (!l) return 0;
    switch (l.toUpperCase()) {
      case 'CRITICAL': return 3;
      case 'HIGH': return 2;
      case 'MEDIUM': return 1;
      case 'LOW': return 0;
      default: return 0;
    }
  };

  const under = [];
  for (const line of content) {
    if (!line.trim()) continue;
    const item = JSON.parse(line);
    const id = item.id;
    const expectedLevel = item.expected && item.expected.urgencyLevel ? item.expected.urgencyLevel : 'LOW';
    const context = { category: item.expected && item.expected.category ? item.expected.category : undefined };

    // Call assessWithDebug (PII-safe)
    try {
      // service.assessWithDebug exported as function
      const assessed = await service.assessWithDebug(item.transcriptText, context);
      const assessedLevel = assessed.urgencyLevel || 'LOW';
      if (levelValue(assessedLevel) < levelValue(expectedLevel)) {
        under.push({
          id,
          expected: expectedLevel,
          assessed: assessedLevel,
          score: assessed.score,
          confidence: assessed.confidence,
          reasons: assessed.reasons || [],
          debug: assessed.debug || {}
        });
      }
    } catch (e) {
      console.error('Error assessing', id, e && e.message);
    }
  }

  const outPath = path.join(reportDir, `triage_hard_under_assessed_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  const payload = JSON.stringify({ timestamp: new Date().toISOString(), count: under.length, cases: under }, null, 2);
  const sanitized = payload.replace(/[0-9*]{12,}/g, '[REDACTED_DIGITS]');
  fs.writeFileSync(outPath, sanitized, 'utf8');
  console.log('Triage complete. Under-assessed count:', under.length);
  console.log('Report saved:', outPath);
})();
