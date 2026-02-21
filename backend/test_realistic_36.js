delete require.cache[require.resolve('./eval/v4plus/runners/parserAdapter.js')];
delete require.cache[require.resolve('./eval/jan-v3-analytics-runner.js')];

const parserAdapter = require('./eval/v4plus/runners/parserAdapter.js');

const test36 = "This is Kenji Williams calling. I need help fixing my truck. It needs work costing about $1,500 and I can't work without it.";

console.log('Testing REALISTIC_36...');
console.log('Text:', test36);
console.log('');

parserAdapter.extractAll(test36).then(result => {
  console.log('Result category:', result.category);
  console.log('Expected:       TRANSPORTATION');
  console.log('Status:', result.category === 'TRANSPORTATION' ? '✓ PASS' : '✗ FAIL');
});
