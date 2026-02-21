const testString = "This is David Kim calling.";

// Test progressively simpler patterns
console.log('Test 1: Basic trigger + one capitalized word');
const test1 = /(?:this is)\s+([A-Z][a-z]+)/i;
console.log(testString.match(test1));

console.log('\nTest 2: Trigger + one or two capitalized words (*)');
const test2 = /(?:this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i;
console.log(testString.match(test2));

console.log('\nTest 3: Trigger + up to 3 additional words ({0,3})');
const test3 = /(?:this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i;
console.log(testString.match(test3));

console.log('\nTest 4: With lookahead');
const test4 = /(?:this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?=\s+[a-z]|[,\.!?]|$)/i;
console.log(testString.match(test4));
