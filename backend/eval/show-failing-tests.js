const fs = require('fs');

const content = fs.readFileSync('datasets/transcripts_golden_v1.jsonl', 'utf-8');
const tests = content.trim().split('\n').map(l => JSON.parse(l));

const failingIds = ['T012', 'T015', 'T029', 'T030', 'T005', 'T013', 'T017', 'T023'];
const failing = tests.filter(t => failingIds.includes(t.id));

failing.forEach(t => {
  console.log('\n' + '='.repeat(70));
  console.log(`Test ${t.id} [${t.difficulty}]: ${t.description}`);
  console.log(`Expected: Name="${t.expected.name || 'null'}", Urgency=${t.expected.urgencyLevel}`);
  console.log('\nTranscript:');
  console.log(t.transcriptText);
});
