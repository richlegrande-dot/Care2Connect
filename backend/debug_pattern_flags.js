// Test global flag and exact pattern matching
const fullText = "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother.";

console.log('=== TESTING GLOBAL FLAG AND EXACT PATTERNS ===');
console.log('Full text:', fullText);
console.log('');

// Test without global flag
const nonGlobalPattern = /\b(?:dr|doctor|mrs?|ms|mr|miss)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)\b/i;
console.log('1. Non-global pattern:');
const nonGlobalMatch = fullText.match(nonGlobalPattern);
console.log('   Match:', nonGlobalMatch);

// Test case sensitivity
const caseSensitivePattern = /\b(?:dr|doctor|mrs?|ms|mr|miss)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)\b/;
console.log('');
console.log('2. Case-sensitive pattern:');
const caseSensitiveMatch = fullText.match(caseSensitivePattern);
console.log('   Match:', caseSensitiveMatch);

// Let's test the exact substring match
const drSubstring = fullText.substring(fullText.indexOf("Dr."), fullText.indexOf("Dr.") + "Dr. Patricia Johnson".length);
console.log('');
console.log('3. Testing extracted substring:');
console.log('   Substring: "' + drSubstring + '"');
console.log('   Non-global match:', drSubstring.match(nonGlobalPattern));

// Test if "Dr" is being parsed differently
console.log('');
console.log('4. Testing "Dr" variants:');
const testTexts = [
  "Dr. Patricia Johnson",
  "Dr Patricia Johnson", 
  "doctor Patricia Johnson",
  "this is Dr. Patricia Johnson"
];

testTexts.forEach((test, i) => {
  const match = test.match(nonGlobalPattern);
  console.log(`   ${i+1}. "${test}": ${match ? match[1] : 'null'}`);
});

// Test if the quantifier is the issue
console.log('');
console.log('5. Testing simpler quantifier:');
const simpleQuantifierPattern = /\b(?:dr|doctor)\.?\s+([A-Z][A-Za-z'-]+\s+[A-Z][A-Za-z'-]+)/i;
const simpleMatch = fullText.match(simpleQuantifierPattern);
console.log('   Simple quantifier match:', simpleMatch);