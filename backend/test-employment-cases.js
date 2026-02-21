const fs = require('fs');
const runner = require('./eval/jan-v3-analytics-runner.js');

const lines = fs.readFileSync('./eval/v4plus/datasets/realistic50.jsonl', 'utf8')
  .split('\n')
  .filter(l => l.trim());

// Test cases 10, 14, 16, 18, 20, 24 (indices 9, 13, 15, 17, 19, 23)
const indices = [9, 13, 15, 17, 19, 23];

console.log('\nTesting EMPLOYMENT disambiguation cases:\n');

indices.forEach(i => {
  const test = JSON.parse(lines[i]);
  const transcript = test.transcriptText || test.segments.map(s => s.text).join(' ');
  const result = runner.parseAnalytics(transcript);
  
  const match = test.expected.category === result.category ? '✅' : '❌';
  console.log(`${match} ${test.id}:`);
  console.log(`   Expected: ${test.expected.category}`);
  console.log(`   Got:      ${result.category}`);
  console.log(`   Text:     ${transcript.substring(0, 80)}...`);
  console.log('');
});
