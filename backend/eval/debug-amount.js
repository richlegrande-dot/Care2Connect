// Debug amount detection for failing tests

const testCases = [
  { id: 'T008', text: 'exactly two thousand two hundred fifty dollars', expected: 2250 },
  { id: 'T013', text: 'about six thousand dollars', expected: 6000 },
  { id: 'T014', text: 'about fifteen hundred dollars per month', expected: 1500 },
  { id: 'T020', text: 'rent which is nine hundred fifty dollars', expected: 950 },
  { id: 'T021', text: 'costs about thirty-five hundred dollars', expected: 3500 }
];

const textToNumber = {
  'one hundred': 100, 'two hundred': 200, 'three hundred': 300, 'four hundred': 400, 'five hundred': 500,
  'six hundred': 600, 'seven hundred': 700, 'eight hundred': 800, 'nine hundred': 900,
  'one thousand': 1000, 'fifteen hundred': 1500, 'eighteen hundred': 1800, 'two thousand': 2000, 'three thousand': 3000,
  'four thousand': 4000, 'five thousand': 5000, 'six thousand': 6000, 'seven thousand': 7000,
  'eight thousand': 8000, 'nine thousand': 9000, 'ten thousand': 10000,
  'ten hundred': 1000, 'eleven hundred': 1100, 'twelve hundred': 1200, 'thirteen hundred': 1300, 'fourteen hundred': 1400,
  'sixteen hundred': 1600, 'seventeen hundred': 1700, 'nineteen hundred': 1900,
  'three thousand five hundred': 3500,
  'four thousand five hundred': 4500,
  'two thousand five hundred': 2500,
  'twenty-eight hundred': 2800,
  'twenty eight hundred': 2800,
  'thirty-five hundred': 3500,
  'thirty five hundred': 3500,
  'twenty-two hundred': 2200,
  'twenty two hundred': 2200,
  'nine hundred fifty': 950,
  'nine hundred and fifty': 950,
  'two thousand two hundred fifty': 2250,
  'two thousand two hundred and fifty': 2250,
  'one hundred fifty': 150, 'two hundred fifty': 250, 'three hundred fifty': 350,
  'four hundred fifty': 450, 'five hundred fifty': 550, 'six hundred fifty': 650,
  'seven hundred fifty': 750, 'eight hundred fifty': 850
};

const amountPatterns = [
  /((?:one|two|three|four|five|six|seven|eight|nine|ten)\s+thousand\s+(?:one|two|three|four|five|six|seven|eight|nine)\s+hundred\s+(?:and\s+)?(?:ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)?(?:\s*(?:one|two|three|four|five|six|seven|eight|nine))?)\s*(?:dollars?)?/gi,
  /((?:one|two|three|four|five|six|seven|eight|nine)\s+hundred\s+(?:and\s+)?(?:ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:\s*(?:one|two|three|four|five|six|seven|eight|nine))?)\s*(?:dollars?)?/gi,
  /(eleven hundred|twelve hundred|thirteen hundred|fourteen hundred|fifteen hundred|sixteen hundred|seventeen hundred|eighteen hundred|nineteen hundred|twenty-one hundred|twenty-two hundred|twenty-three hundred|twenty-four hundred|twenty-five hundred|twenty-six hundred|twenty-seven hundred|twenty-eight hundred|twenty-nine hundred|thirty-one hundred|thirty-two hundred|thirty-three hundred|thirty-four hundred|thirty-five hundred|thirty-six hundred|thirty-seven hundred|thirty-eight hundred|thirty-nine hundred|one thousand|two thousand|three thousand|four thousand|five thousand|six thousand|seven thousand|eight thousand|nine thousand|ten thousand)\s*(?:dollars?)?/gi,
  /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\s+(hundred|thousand)\s*(?:dollars?)?/gi
];

console.log('=== DEBUGGING AMOUNT DETECTION ===\n');

testCases.forEach(test => {
  console.log(`\n--- ${test.id}: "${test.text}" (expected: ${test.expected}) ---`);
  
  for (let i = 0; i < amountPatterns.length; i++) {
    const pattern = amountPatterns[i];
    const matches = test.text.match(pattern);
    
    if (matches) {
      console.log(`  Pattern ${i+1} matched:`, matches);
      
      // Try to extract value using same logic as main code
      for (const match of matches) {
        console.log(`    Full match: "${match}"`);
        const cleaned = match.toLowerCase().replace(/\s+dollars?$/, '').trim();
        console.log(`    Cleaned: "${cleaned}"`);
        
        if (textToNumber[cleaned]) {
          console.log(`    ✓ Found in textToNumber: ${textToNumber[cleaned]}`);
        } else {
          console.log(`    ✗ NOT found in textToNumber`);
          
          // Check for partial matches
          const keys = Object.keys(textToNumber).filter(k => cleaned.includes(k) || k.includes(cleaned));
          if (keys.length > 0) {
            console.log(`    Related keys in textToNumber:`, keys);
          }
        }
      }
      break; // Stop after first pattern matches
    }
  }
});

console.log('\n\n=== CHECKING TEXTTONUMBER KEYS ===');
console.log('Keys containing "six":', Object.keys(textToNumber).filter(k => k.includes('six')));
console.log('Keys containing "fifteen":', Object.keys(textToNumber).filter(k => k.includes('fifteen')));
console.log('Keys containing "thirty":', Object.keys(textToNumber).filter(k => k.includes('thirty')));
console.log('Keys containing "nine hundred":', Object.keys(textToNumber).filter(k => k.includes('nine hundred')));
console.log('Keys containing "two thousand two":', Object.keys(textToNumber).filter(k => k.includes('two thousand two')));
