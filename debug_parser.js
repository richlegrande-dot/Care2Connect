const parserAdapter = require('./backend/eval/v4plus/runners/parserAdapter.js');

async function testCases() {
  const testCases = [
    {
      id: 'T007',
      transcriptText: 'Hi, my name is Sarah Johnson. I need help with car repairs for work. My car broke down and I can\'t get to my job without it. I\'m asking for $800 to fix the transmission.'
    },
    {
      id: 'T022',
      transcriptText: 'Hello, this is Michael Davis. I\'ve been unemployed since 2023. I lost my job and haven\'t been able to find work. I need assistance with basic living expenses.'
    },
    {
      id: 'T023',
      transcriptText: 'Hi, I\'m calling about my mother\'s hospital care. She\'s in the hospital and needs medication. I\'m her daughter and I need help with the medical bills.'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n=== Testing ${testCase.id} ===`);
    console.log('Transcript:', testCase.transcriptText);

    try {
      const result = await parserAdapter.extractAll(testCase.transcriptText, testCase);
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testCases().catch(console.error);