// Test script to examine failing Core30 cases
const fs = require('fs');
const path = require('path');

// Import the parser adapter used by the evaluation framework
const parserAdapter = require('./backend/eval/v4plus/runners/parserAdapter');

// Read Core30 test cases
const core30Path = './backend/eval/v4plus/datasets/core30.jsonl';
const lines = fs.readFileSync(core30Path, 'utf8').trim().split('\n');
const cases = lines.map(line => JSON.parse(line));

// The 8 failing cases
const failingCases = ['T006', 'T011', 'T012', 'T016', 'T017', 'T024', 'T025', 'T027'];

console.log('=== ANALYZING 8 FAILING CORE30 CASES ===\n');

for (const caseId of failingCases) {
    const testCase = cases.find(c => c.id === caseId);
    if (!testCase) {
        console.log(`❌ Case ${caseId} not found`);
        continue;
    }

    console.log(`\n📋 ${caseId}: ${testCase.description}`);
    console.log(`   Text: "${testCase.transcriptText}"`);
    
    try {
        // Initialize and parse the case
        parserAdapter.initialize();
        const result = parserAdapter.simulateEnhancedParsing(testCase.transcriptText);
        
        console.log(`   Expected: name="${testCase.expected.name}", category="${testCase.expected.category}", urgency="${testCase.expected.urgencyLevel}", amount=${testCase.expected.goalAmount}`);
        console.log(`   Actual:   name="${result.name}", category="${result.category}", urgency="${result.urgencyLevel}", amount=${result.goalAmount}`);
        
        // Check failures
        const failures = [];
        if (result.name !== testCase.expected.name) failures.push('name');
        if (result.category !== testCase.expected.category) failures.push('category');
        if (result.urgencyLevel !== testCase.expected.urgencyLevel) failures.push('urgency');
        if (Math.abs((result.goalAmount || 0) - (testCase.expected.goalAmount || 0)) > 100) failures.push('amount');
        
        console.log(`   Issues:   ${failures.length ? failures.join(', ') : 'none'}`);
        
    } catch (error) {
        console.log(`   ❌ Error parsing: ${error.message}`);
    }
}

console.log('\n=== ANALYSIS COMPLETE ===');