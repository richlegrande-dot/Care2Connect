// Test word boundary issue in the original full text
const fullText = "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother.";

console.log('=== TESTING WORD BOUNDARY ISSUE ===');
console.log('Full text:', fullText);
console.log('');

// Original pattern with word boundary at the end
const originalPattern = /\b(?:dr|doctor|mrs?|ms|mr|miss)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)\b/g;
console.log('1. Original pattern with \\b at end:');
const originalMatch = fullText.match(originalPattern);
console.log('   Match:', originalMatch);

// Pattern without word boundary at the end
const noEndBoundaryPattern = /\b(?:dr|doctor|mrs?|ms|mr|miss)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)/g;
console.log('');
console.log('2. Pattern without \\b at end:');
const noEndBoundaryMatch = fullText.match(noEndBoundaryPattern);
console.log('   Match:', noEndBoundaryMatch);

// Let's see what character comes after "Johnson" in the full text
const drIndex = fullText.indexOf("Dr. Patricia Johnson");
if (drIndex !== -1) {
  const endIndex = drIndex + "Dr. Patricia Johnson".length;
  const charAfter = fullText[endIndex];
  console.log('');
  console.log('3. Character analysis:');
  console.log('   Text snippet: "' + fullText.substring(drIndex, endIndex + 5) + '"');
  console.log('   Character after "Johnson":', JSON.stringify(charAfter));
  console.log('   Is word boundary? (expecting true for period):', /\b/.test(charAfter));
}

// Test the word boundary behavior specifically
console.log('');
console.log('4. Word boundary tests:');
console.log('   "Johnson." (period after):', /Johnson\b/.test("Johnson."));
console.log('   "Johnson " (space after):', /Johnson\b/.test("Johnson "));
console.log('   "Johnson" (end of string):', /Johnson\b/.test("Johnson"));
console.log('   "Johnsona" (letter after):', /Johnson\b/.test("Johnsona"));