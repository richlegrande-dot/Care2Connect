// Debug specific patterns for T012
const text = "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother.";

console.log('=== PATTERN TESTING ===');
console.log('Text:', text);
console.log('');

// Test title_honorific pattern specifically
const titlePattern = /\b(?:dr|doctor|mrs?|ms|mr|miss)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)\b/g;
console.log('Title pattern:', titlePattern);

let titleMatch;
while ((titleMatch = titlePattern.exec(text)) !== null) {
  console.log('Title match found:', titleMatch[0], 'Captured:', titleMatch[1]);
}

// Test self_identification pattern 
const selfPattern = /(?:i am|this is|i'm)\s+(?:like,?\s+)?([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?)\b/gi;
console.log('');
console.log('Self pattern:', selfPattern);

let selfMatch;
while ((selfMatch = selfPattern.exec(text)) !== null) {
  console.log('Self match found:', selfMatch[0], 'Captured:', selfMatch[1]);
}

// Test if the title pattern would match with a direct test
console.log('');
console.log('=== DIRECT PATTERN TESTS ===');
const drTest = "Dr. Patricia Johnson";
console.log('Testing "' + drTest + '" with title pattern:');
console.log('Match:', titlePattern.test(drTest));

// Reset and test again
titlePattern.lastIndex = 0;
const match = drTest.match(titlePattern);
console.log('Match result:', match);