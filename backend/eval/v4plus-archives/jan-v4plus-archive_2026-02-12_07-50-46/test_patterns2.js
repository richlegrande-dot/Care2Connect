// Test what the patterns are actually capturing
const text = 'My name is Robert Chen and I need help finishing my certification program.';

const patterns = [
  // Direct introductions (highest confidence)
  {
    regex: /(?:my full name is|full name is)\s+([A-Z][A-Za-z'-]+\s+[A-Z][A-Za-z'-]+)\b/g,
    confidence: 0.95,
    strategy: 'direct_full_name'
  },
  {
    regex: /\b(?:my name is)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/g,
    confidence: 0.92,
    strategy: 'direct_name'
  },
  {
    regex: /(?:i am|this is|i'm)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/g,
    confidence: 0.88,
    strategy: 'self_identification'
  }
];

console.log('Testing patterns on:', text);
console.log('');

patterns.forEach(pattern => {
  pattern.regex.lastIndex = 0; // Reset regex
  let match;
  while ((match = pattern.regex.exec(text)) !== null) {
    console.log(`Strategy: ${pattern.strategy}`);
    console.log(`Match: "${match[0]}"`);
    console.log(`Captured: "${match[1]}"`);
    console.log('');
  }
});