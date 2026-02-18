// Test the specific regex pattern causing the issue
const text = 'My name is Robert Chen and I need help finishing my certification program.';

console.log('Text:', text);

// The pattern from the enhanced extractor
const pattern = /\b(?:my name is)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;

const match = text.match(pattern);
console.log('Pattern match:', match);

// Try without word boundary
const pattern2 = /(?:my name is)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;
const match2 = text.match(pattern2);
console.log('Without word boundary:', match2);

// Get the capture group
const execMatch = pattern2.exec(text);
console.log('Captured name:', execMatch ? execMatch[1] : 'none');