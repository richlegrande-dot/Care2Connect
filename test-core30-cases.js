const fs = require('fs');
const path = require('path');
const parserAdapter = require('./backend/eval/v4plus/runners/parserAdapter');

async function testSingleCase() {
  const core30Path = path.join(__dirname, 'backend/eval/v4plus/datasets/core30.jsonl');
  const lines = fs.readFileSync(core30Path, 'utf-8').split('\n').filter(l => l.trim());
  
  const testIds = ['T011'];
  
  console.log('Testing Core30 cases with full pipeline:\n');
  
  for (const testId of testIds) {
    const line = lines.find(l => l.includes(`"id": "${testId}"`));
    if (!line) {
      console.log(`${testId}: NOT FOUND`);
      continue;
    }
    
    const testCase = JSON.parse(line);
    console.log(`${testId} Transcript:`, testCase.transcriptText);
    console.log();
    
    const result = await parserAdapter.extractAll(testCase.transcriptText);
    
    console.log(`${testId} Result Structure:`, JSON.stringify(result, null, 2));
    
    const catMatch = result.category === testCase.expected.category ? '✓' : '✗';
    const urgMatch = result.urgencyLevel === testCase.expected.urgencyLevel ? '✓' : '✗';
    
    console.log(`${testId} (${testCase.description}):`);
    console.log(`  Category: ${catMatch} Expected: ${testCase.expected.category}, Actual: ${result.category}`);
    console.log(`  Urgency: ${urgMatch} Expected: ${testCase.expected.urgencyLevel}, Actual: ${result.urgencyLevel}`);
    console.log();
  }
}

testSingleCase().catch(console.error);
