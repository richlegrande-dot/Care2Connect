// Test the self_identification pattern specifically 
const text = "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother.";

console.log('=== TESTING SELF_IDENTIFICATION PATTERN ===');
console.log('Text:', text);
console.log('');

// Current problematic pattern
const currentPattern = /(?:i am|this is|i'm)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;
console.log('1. Current pattern (problematic):');
let match;
currentPattern.lastIndex = 0;
while ((match = currentPattern.exec(text)) !== null) {
  console.log(`   Match: "${match[0]}" -> Captured: "${match[1]}"`);
}

// Test better patterns that should only match actual names
console.log('');
console.log('2. Potential fixes:');

// Fix 1: Require "my name is" or similar explicit name introductions
const explicitNamePattern = /(?:my name is|i am called|i'm called)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;
console.log('   Fix 1 - Explicit name only:');
explicitNamePattern.lastIndex = 0;
while ((match = explicitNamePattern.exec(text)) !== null) {
  console.log(`   Match: "${match[0]}" -> Captured: "${match[1]}"`);
}

// Fix 2: Avoid common non-name words after "I'm"
const avoidCommonWordsPattern = /(?:i am|this is|i'm)\s+(?!(?:calling|speaking|here|from|going|looking|trying|sorry|asking|wondering))\s*([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;
console.log('   Fix 2 - Avoid common words:');
avoidCommonWordsPattern.lastIndex = 0;
while ((match = avoidCommonWordsPattern.exec(text)) !== null) {
  console.log(`   Match: "${match[0]}" -> Captured: "${match[1]}"`);
}

// Test with good examples
console.log('');
console.log('3. Testing with good examples:');
const goodExamples = [
  "Hi, I'm John Smith and I need help",
  "Good morning, this is Mary Johnson",
  "My name is Robert Chen and I'm calling for assistance",
  "I am Sarah Wilson, I need help with rent"
];

goodExamples.forEach(example => {
  console.log(`   Example: "${example}"`);
  avoidCommonWordsPattern.lastIndex = 0;
  const match = avoidCommonWordsPattern.exec(example);
  console.log(`   Captures: ${match ? match[1] : 'none'}`);
});