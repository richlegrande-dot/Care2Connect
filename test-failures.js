const fs = require('fs');
const service = require('./backend/src/services/UrgencyAssessmentService.js');

const lines = fs.readFileSync('backend/eval/v4plus/datasets/core30.jsonl', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"id": "T005"') || lines[i].includes('"id": "T007"') || lines[i].includes('"id": "T008"')) {
    const caseData = JSON.parse(lines[i]);
    const assessment = service.assessUrgency(caseData.transcriptText);
    console.log(caseData.id + ':');
    console.log('  Expected:', caseData.expected.urgencyLevel);
    console.log('  Got:', assessment.urgencyLevel);
    console.log('  Score:', assessment.score.toFixed(3));
    console.log('  Reasons:', assessment.reasons.slice(0, 3).join(', '));
    console.log('');
  }
}