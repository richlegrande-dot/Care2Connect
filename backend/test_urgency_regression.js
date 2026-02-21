const parserAdapter = require('./eval/v4plus/runners/parserAdapter');

const urgencyCases = [
  {
    id: '000REALISTIC_28',
    transcript: "This is Amara Brown calling. My car needs major fixing - about $800. I rely on it to get to work and I'm concerned about losing my job.",
    expected: 'MEDIUM'
  },
  {
    id: '000REALISTIC_32',
    transcript: "This is Ana Johnson calling. My car broke down and I need it to get to work. The repair will cost $800 and I don't have the money.",
    expected: 'MEDIUM'
  },
  {
    id: '000REALISTIC_34',
    transcript: "Um, hi, I'm Hiroshi Garcia-Lopez. My car needs major repairs - about twelve hundred dollars. I rely on it to get to do my job.",
    expected: 'MEDIUM'
  }
];

(async () => {
  console.log('Testing urgency over-assessed cases...\n');
  
  for (const test of urgencyCases) {
    const result = await parserAdapter.extractAll(test.transcript);
    const passed = result.urgencyLevel === test.expected;
    const symbol = passed ? '✓' : '✗';
    console.log(`${symbol} ${test.id} (Expected: ${test.expected}, Got: ${result.urgencyLevel}, Score: ${result.urgencyScore})`);
  }
})();
