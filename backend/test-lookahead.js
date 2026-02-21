const testString = "This is David Kim calling.";
console.log('Test string:', testString);

// Test what the regex actually sees
const pattern = /(?:this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?=\s+[a-z]|[,\.!?]|$)/;
const match = testString.match(pattern);
console.log('Match result:', match);

// Try breaking it down
const captureOnly = /(?:this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/;
const captureMatch = testString.match(captureOnly);
console.log('\nWithout lookahead:', captureMatch);

// Check what comes after "Kim"
const afterKim = testString.substring(testString.indexOf("Kim") + 3);
console.log('\nAfter "Kim":', JSON.stringify(afterKim));
console.log('Starts with space + lowercase?', /^\s+[a-z]/.test(afterKim));
