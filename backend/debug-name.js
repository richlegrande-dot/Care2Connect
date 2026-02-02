const { extractNameWithConfidence } = require('./src/utils/extraction/rulesEngine.ts');

console.log('Test 1: "My name is Hope and I need help"');
const result1 = extractNameWithConfidence("My name is Hope and I need help");
console.log('Result:', result1);

console.log('\nTest 2: "My name is Dr. Sarah Thompson MD"');
const result2 = extractNameWithConfidence("My name is Dr. Sarah Thompson MD");
console.log('Result:', result2);

console.log('\nTest 3: "I\'m Rev. Michael Johnson Jr."');
const result3 = extractNameWithConfidence("I'm Rev. Michael Johnson Jr.");
console.log('Result:', result3);