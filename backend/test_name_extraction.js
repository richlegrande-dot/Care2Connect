const parserAdapter = require('./eval/v4plus/runners/parserAdapter');

const nameCases = [
  {
    id: '0000REALISTIC_5',
    transcript: "This is Rosa O'Brien calling. My husband has been threatening me and I need to escape with my son.",
    expected: "Rosa O'Brien"
  },
  {
    id: '0000REALISTIC_9',
    transcript: "Hi, my name is William O'Brien and My family is about to get kicked out of our home.",
    expected: "William O'Brien"
  },
  {
    id: '000REALISTIC_18',
    transcript: "Um, hi, I'm Priya D'Angelo. I was laid off from my job recently and I'm unable to provide for my family.",
    expected: "Priya D'Angelo"
  }
];

(async () => {
  console.log('Testing name extraction failures...\n');
  
  for (const test of nameCases) {
    const result = await parserAdapter.extractAll(test.transcript);
    const passed = result.name === test.expected;
    const symbol = passed ? '✓' : '✗';
    console.log(`${symbol} ${test.id}`);
    console.log(`  Expected: "${test.expected}"`);
    console.log(`  Got:      "${result.name}"`);
    if (!passed) {
      console.log(`  Transcript: "${test.transcript}"`);
    }
    console.log('');
  }
})();
