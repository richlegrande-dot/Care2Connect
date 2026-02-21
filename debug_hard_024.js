// Test the specific HARD_024 case to see tolerance calculation
const { runJanV3Analytics } = require('./backend/jan-v3-analytics-runner.js');

const testCase = {
    input: "Sarah Williams calling. Electric bill is 450. shutoff notice came.",
    expected: {
        name: "Sarah Williams",
        goalAmount: 450,
        category: "bills", 
        urgency: "HIGH",
        tolerance: 0.02 // 2% tolerance
    }
};

console.log('Testing HARD_024 case specifically...');
console.log('Input:', testCase.input);
console.log('Expected amount:', testCase.expected.goalAmount);
console.log('Expected tolerance:', testCase.expected.tolerance, '(' + (testCase.expected.tolerance * 100) + '%)');

const result = runJanV3Analytics(testCase.input, 'HARD_024');

console.log('\nResult amount:', result.goalAmount);
console.log('Amount match:', result.goalAmount === testCase.expected.goalAmount);

if (result.goalAmount !== null && testCase.expected.goalAmount !== null) {
    const diff = Math.abs(result.goalAmount - testCase.expected.goalAmount);
    const percentDiff = diff / testCase.expected.goalAmount;
    const allowedTolerance = testCase.expected.tolerance || 0.05;
    
    console.log('Absolute difference:', diff);
    console.log('Percentage difference:', (percentDiff * 100).toFixed(4) + '%');
    console.log('Allowed tolerance:', (allowedTolerance * 100) + '%');
    console.log('Within tolerance:', percentDiff <= allowedTolerance ? 'YES' : 'NO');
    
    // Check old vs new calculation
    console.log('\nOld calculation (absolute):', diff <= allowedTolerance ? 'PASS' : 'FAIL');
    console.log('New calculation (percentage):', percentDiff <= allowedTolerance ? 'PASS' : 'FAIL');
}