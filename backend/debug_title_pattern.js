// Debug title pattern specifically
const text = "Dr. Patricia Johnson";

console.log('=== DEBUGGING TITLE PATTERN ===');
console.log('Text:', text);
console.log('');

// Break down the pattern parts
console.log('Testing pattern components:');

// Test 1: Basic dr match
const drMatch = /\bdr\b/i.test(text);
console.log('1. \\bdr\\b matches:', drMatch);

// Test 2: dr with optional period and space
const drPeriodMatch = /\bdr\.?\s+/i.test(text);
console.log('2. \\bdr\\.?\\s+ matches:', drPeriodMatch);

// Test 3: First name pattern
const firstNameMatch = /[A-Z][A-Za-z'-]+/.test("Patricia");
console.log('3. [A-Z][A-Za-z\'-]+ matches "Patricia":', firstNameMatch);

// Test 4: Second name pattern (the problematic part)
const secondNamePattern = /(?:\s+[A-Z][A-Za-z'-]+)+/;
const secondNameMatch = secondNamePattern.test(" Johnson");
console.log('4. (?:\\s+[A-Z][A-Za-z\'-]+)+ matches " Johnson":', secondNameMatch);

// Test 5: Full name pattern without title
const fullNamePattern = /([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)/;
const fullNameMatch = "Patricia Johnson".match(fullNamePattern);
console.log('5. Full name pattern matches "Patricia Johnson":', fullNameMatch);

// Test 6: The actual problematic full pattern but simplified
const simplifiedTitlePattern = /(?:dr|doctor)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)/i;
const simplifiedMatch = text.match(simplifiedTitlePattern);
console.log('6. Simplified title pattern match:', simplifiedMatch);

// Test 7: Let's try without word boundaries
const noWordBoundaryPattern = /(?:dr|doctor)\.?\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)/i;
const noWordBoundaryMatch = text.match(noWordBoundaryPattern);
console.log('7. No word boundary pattern match:', noWordBoundaryMatch);

// Test 8: Let's check if the period is the issue
console.log('8. Testing different variations:');
console.log('   "Dr Patricia Johnson" (no period):', "Dr Patricia Johnson".match(simplifiedTitlePattern));
console.log('   "Dr. Patricia Johnson" (with period):', "Dr. Patricia Johnson".match(simplifiedTitlePattern));
console.log('   "doctor Patricia Johnson" (full word):', "doctor Patricia Johnson".match(simplifiedTitlePattern));