const text = 'My name is Robert Chen and I need help finishing my certification program.';
console.log('Testing patterns on:', text);

const pattern1 = /(?:my name is)\s+([A-Z][A-Za-z'.-]+(?:\s+[A-Z][A-Za-z'.-]+)*)/i;
const match1 = text.match(pattern1);
console.log('Pattern 1 result:', match1 ? match1[1] : 'none');

const pattern2 = /\b(?:my name is)\s+([A-Z][A-Za-z'.-]+(?:\s+[A-Z][A-Za-z'.-]+)*)/i;
const match2 = text.match(pattern2);
console.log('Pattern 2 result:', match2 ? match2[1] : 'none');

// Test what the actual parser would see if a simpler match was happening
const simplePattern = /My\s+(\w+)/;
const simpleMatch = text.match(simplePattern);
console.log('Simple pattern result:', simpleMatch ? simpleMatch[1] : 'none');