const parserAdapter = require('./eval/v4plus/runners/parserAdapter');

const categoryFailures = [
  {
    id: '000REALISTIC_16',
    transcript: "I got let go and my money are gone. I need help with two thousand dollars to cover rent while I'm job hunting. My name is Amara Davis.",
    expected: 'EMPLOYMENT'
  },
  {
    id: '000REALISTIC_20',
    transcript: "I got let go and my emergency fund are gone. I need help with $2,000 to cover bills while I'm job hunting. My name is Yuki O'Connor.",
    expected: 'EMPLOYMENT'
  },
  {
    id: '000REALISTIC_28',
    transcript: "This is Amara Brown calling. My car needs major fixing - about $800. I rely on it to get to work and I'm concerned about losing my job.",
    expected: 'TRANSPORTATION'
  }
];

(async () => {
  console.log('Testing category failures...\n');
  
  for (const test of categoryFailures) {
    const result = await parserAdapter.extractAll(test.transcript);
    const passed = result.category === test.expected;
    const symbol = passed ? '✓' : '✗';
    console.log(`${symbol} ${test.id} (Expected: ${test.expected}, Got: ${result.category})`);
    if (!passed) {
      console.log(`  Transcript: "${test.transcript}"`);
      console.log('');
    }
  }
})();
