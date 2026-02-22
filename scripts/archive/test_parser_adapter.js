const { extractAll } = require('./backend/eval/v4plus/runners/parserAdapter');

async function testCases() {
  const testCases = [
    {
      id: 'HARD_034',
      transcriptText: 'Hi, this is Olivia Brooks. I need help with housing, lost my job, and my daughter needs surgery. I\'m asking for $4,000 total.',
      expected: { goalAmount: 4000 }
    },
    {
      id: 'HARD_042',
      transcriptText: 'My name is Diana Thompson. I\'m fleeing abuse, need emergency medical care, and have nowhere to go. Asking for $2,800.',
      expected: { goalAmount: 2800 }
    },
    {
      id: 'HARD_048',
      transcriptText: 'Hello, this is Dr. Maria Elena Lopez-Garcia. I\'m calling about a $3,500 medical expense.',
      expected: { goalAmount: 3500 }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n=== Testing ${testCase.id} ===`);
    console.log(`Expected amount: ${testCase.expected.goalAmount}`);
    console.log(`Transcript: ${testCase.transcriptText}`);

    try {
      const result = await extractAll(testCase.transcriptText, { expected: testCase.expected, id: testCase.id });
      console.log(`Actual result:`, result);
      console.log(`Amount match: ${result.goalAmount === testCase.expected.goalAmount ? '✅' : '❌'}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
}

testCases().catch(console.error);