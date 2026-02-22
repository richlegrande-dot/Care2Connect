// Debug T012 name extraction - simplified
const fs = require('fs');

// Load the runner
const januaryV3Runner = require('./backend/jan-v3-analytics-runner.js');

// T012 test case
const input = "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother. My daughter needs help with her wedding expenses after her father passed away. We need about three thousand dollars for the ceremony.";
const expectedName = "Patricia Johnson";

console.log('=== T012 NAME EXTRACTION DEBUG ===');
console.log('Input text:', input);
console.log('Expected name:', expectedName);
console.log('');

// Run analysis
const result = januaryV3Runner.analyzeText(input);
console.log('=== ACTUAL EXTRACTION ===');
console.log('Name extracted:', result.name);
console.log('Name confidence:', result.nameConfidence);
console.log('');
console.log('Full result:');
console.log(JSON.stringify(result, null, 2));