const fs = require('fs');
const parser = require('./backend/src/services/ParserService.js');

const lines = fs.readFileSync('backend/eval/v4plus/datasets/core30.jsonl', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"id": "T008"')) {
    const caseData = JSON.parse(lines[i]);
    const result = parser.parseTranscript(caseData.transcriptText);
    console.log('T008 Parser Result:');
    console.log('  Category:', result.category);
    console.log('  Urgency:', result.urgencyLevel);
    console.log('  Expected Category:', caseData.expected.category);
    console.log('  Expected Urgency:', caseData.expected.urgencyLevel);
    break;
  }
}