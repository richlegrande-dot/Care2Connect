// Debug the enhanced name extractor pattern matching in detail
const text = 'My name is Robert Chen and I need help finishing my certification program.';

console.log('=== Pattern matching debug ===');
console.log('Text:', text);
console.log('');

// Test the exact patterns from enhanced extractor
const patterns = [
  {
    regex: /(?:my full name is|full name is)\s+([A-Z][A-Za-z'-]+\s+[A-Z][A-Za-z'-]+)\b/gi,
    name: 'direct_full_name'
  },
  {
    regex: /(?:my name is)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi,
    name: 'direct_name'
  },
  {
    regex: /(?:i am|this is|i'm)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi,
    name: 'self_identification'
  }
];

patterns.forEach((pattern, index) => {
  console.log(`Pattern ${index + 1} (${pattern.name}):`);
  console.log(pattern.regex.toString());
  
  pattern.regex.lastIndex = 0; // Reset regex state
  let match;
  let foundMatches = false;
  
  while ((match = pattern.regex.exec(text)) !== null) {
    foundMatches = true;
    console.log(`  Found: "${match[0]}"`);
    console.log(`  Captured: "${match[1]}"`);
    console.log(`  Index: ${match.index}`);
  }
  
  if (!foundMatches) {
    console.log('  No matches found');
  }
  console.log('');
});