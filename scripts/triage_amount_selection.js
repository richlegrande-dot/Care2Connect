const fs = require('fs');
const path = require('path');
const parserAdapter = require('../backend/eval/v4plus/runners/parserAdapter');

(async () => {
  const datasetPath = path.join(__dirname, '../backend/eval/v4plus/datasets/hard60.jsonl');
  const content = fs.readFileSync(datasetPath, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
  const mismatches = [];

  for (const tc of content) {
    try {
      const results = await parserAdapter.extractAll(tc.transcriptText, { id: tc.id, expected: tc.expected });
      const parsedAmount = results.goalAmount == null ? null : results.goalAmount;
      const expected = tc.expected?.goalAmount == null ? null : tc.expected.goalAmount;
      if (parsedAmount !== expected) {
        mismatches.push({ id: tc.id, expected, parsed: parsedAmount, transcript: tc.transcriptText.substring(0,280) });
      }
    } catch (e) {
      console.error('Error parsing', tc.id, e.message);
    }
  }

  console.log('Mismatches found:', mismatches.length);
  for (const m of mismatches) {
    console.log(JSON.stringify(m, null, 2));
  }
})();