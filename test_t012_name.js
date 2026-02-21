// Test T012 name extraction specifically
const fs = require('fs');
const januaryV3Runner = require('./backend/jan-v3-analytics-runner.js');

// Load T012 case data
const core30Data = fs.readFileSync('./backend/eval/v4plus/datasets/core30.jsonl', 'utf8');
const cases = core30Data.trim().split('\n').map(line => JSON.parse(line));
const t012 = cases.find(c => c.caseId === 'T012');

console.log('=== T012 CASE DATA ===');
console.log('Input:', t012.input);
console.log('Expected name:', t012.expected.name);
console.log('');

// Run analysis
const result = januaryV3Runner.analyzeText(t012.input);
console.log('=== ACTUAL EXTRACTION ===');
console.log('Name extracted:', result.name);
console.log('Full result:', JSON.stringify(result, null, 2));