// Test word boundary issue
const text = 'My name is Robert Chen and I need help finishing my certification program.';

console.log('Text:', text);
console.log('');

// Test with word boundary
const pattern1 = /\b(?:my name is)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;
const match1 = text.match(pattern1);
console.log('With word boundary (\\b):', match1);

// Test without word boundary  
const pattern2 = /(?:my name is)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;
const match2 = text.match(pattern2);
console.log('Without word boundary:', match2);

// Test capture group
const execMatch = pattern2.exec(text);
console.log('Captured name:', execMatch ? execMatch[1] : 'none');