const testCases = [
  'Hi, this is Olivia Brooks. I need help with housing, lost my job, and my daughter needs surgery. I\'m asking for $4,000 total.',
  'My name is Diana Thompson. I\'m fleeing abuse, need emergency medical care, and have nowhere to go. Asking for $2,800.',
  'Hello, this is Dr. Maria Elena Lopez-Garcia. I\'m calling about a $3,500 medical expense.'
];

const amountPatterns = [
  /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,
  /\d+(?:,\d{3})*(?:\.\d{2})?\s*dollars?/gi,
  /\b\d+\s*hundred\b/gi,
  /\b\d+\s*thousand\b/gi,
  /\b\d+\s*million\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*hundred\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*thousand\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*hundred\s*(?:and\s*)?\d+\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s*thousand\s*(?:and\s*)?\d+\b/gi,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/gi,
  /\b(?:eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\b/gi,
  /\b(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:\s*-?\s*\d+)?\b/gi,
  /\b\d+\s*to\s*\d+\b/gi,
  /\b\d+\s*-\s*\d+\b/gi,
  /\b\d+\s*and\s*\d+\b/gi
];

testCases.forEach((text, i) => {
  console.log(`\nTest case ${i+1}: ${text}\n`);
  let found = false;
  amountPatterns.forEach((pattern, pidx) => {
    const matches = text.match(pattern);
    if (matches) {
      console.log(`Pattern ${pidx}: ${matches.join(', ')}`);
      found = true;
    }
  });
  if (!found) console.log('No amounts found');
});