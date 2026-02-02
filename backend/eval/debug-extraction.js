// Test amount extraction on actual failing transcripts
const fs = require('fs');

// Read actual transcripts
const data = fs.readFileSync('./datasets/transcripts_golden_v1.jsonl', 'utf-8');
const lines = data.trim().split('\n');
const tests = lines.map(line => JSON.parse(line));

const failingIds = ['T008', 'T013', 'T014', 'T020', 'T021'];
const failingTests = tests.filter(t => failingIds.includes(t.id));

console.log('=== TESTING ACTUAL EXTRACTION ON FAILING TESTS ===\n');

// Copy the exact textToNumber from main code
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

// Copy the exact patterns from main code (in order)
const amountPatterns = [
  /(?:need|require|asking for|goal is|trying to raise|fundraising for).*?\$([0-9,]+(?:\.\d{2})?)/gi,
  /\$([0-9,]+(?:\.\d{2})?).*?(?:needed|required|help|assistance|goal|to raise)/gi,
  /(?:cost|total|bill|owe|debt)\s+(?:about\s+|around\s+|approximately\s+)?\$?([0-9,]+(?:\.\d{2})?)/i,
  /\$?([0-9,]+(?:\.\d{2})?)\s*(?:dollars?|bucks)\s+(?:to|for|that|needed|required|goal)/i,
  /between\s+\$?([0-9,]+)\s+(?:and|to|-|or)\s+\$?([0-9,]+)/i,
  /((?:one|two|three|four|five|six|seven|eight|nine|ten)\s+thousand\s+(?:one|two|three|four|five|six|seven|eight|nine)\s+hundred\s+(?:and\s+)?(?:ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)?(?:\s*(?:one|two|three|four|five|six|seven|eight|nine))?)\s*(?:dollars?)?/gi,
  /((?:one|two|three|four|five|six|seven|eight|nine)\s+hundred\s+(?:and\s+)?(?:ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:\s*(?:one|two|three|four|five|six|seven|eight|nine))?)\s*(?:dollars?)?/gi,
  /((?:one|two|three|four|five|six|seven|eight|nine|ten)\s+thousand\s+(?:one|two|three|four|five|six|seven|eight|nine)\s+hundred)\s*(?:dollars?)?/gi,
  /((?:twenty|thirty|forty|fifty)[\s-]?(?:one|two|three|four|five|six|seven|eight|nine)?\s+hundred)\s*(?:dollars?)?/gi,
  /(eleven hundred|twelve hundred|thirteen hundred|fourteen hundred|fifteen hundred|sixteen hundred|seventeen hundred|eighteen hundred|nineteen hundred|twenty-one hundred|twenty-two hundred|twenty-three hundred|twenty-four hundred|twenty-five hundred|twenty-six hundred|twenty-seven hundred|twenty-eight hundred|twenty-nine hundred|thirty-one hundred|thirty-two hundred|thirty-three hundred|thirty-four hundred|thirty-five hundred|thirty-six hundred|thirty-seven hundred|thirty-eight hundred|thirty-nine hundred|one thousand|two thousand|three thousand|four thousand|five thousand|six thousand|seven thousand|eight thousand|nine thousand|ten thousand)\s*(?:dollars?)?/gi,
  /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\s+(hundred|thousand)\s*(?:dollars?)?(?:\s+(?:needed|required|for|to))?/gi,
  /\$([0-9,]+(?:\.\d{2})?)\b/g,
  /([0-9,]+)\s*dollars?\b/gi
];

failingTests.forEach(test => {
  const transcript = test.transcriptText;
  console.log(`\n=== ${test.id}: Expected ${test.expected.goalAmount} ===`);
  console.log(`Transcript: "${transcript}"\n`);
  
  const foundAmounts = [];
  
  // Process patterns
  for (let i = 0; i < amountPatterns.length; i++) {
    const pattern = amountPatterns[i];
    let matches;
    
    if (pattern.global) {
      matches = [...transcript.matchAll(pattern)];
    } else {
      const match = transcript.match(pattern);
      matches = match ? [match] : [];
    }
    
    if (matches.length > 0) {
      console.log(`Pattern ${i+1} matched ${matches.length} time(s):`);
      
      for (const match of matches) {
        console.log(`  Full match: "${match[0]}"`);
        console.log(`  Capture groups:`, match.slice(1).filter(g => g !== undefined));
        
        // Try extraction strategies
        let extractedValue = null;
        
        // Strategy 1: Check match[1]
        if (match[1]) {
          const cleaned1 = match[1].toLowerCase().replace(/\s+dollars?$/, '').trim();
          if (textToNumber[cleaned1]) {
            extractedValue = textToNumber[cleaned1];
            console.log(`  ✓ Strategy 1 (match[1]): Found "${cleaned1}" = ${extractedValue}`);
          } else if (!isNaN(parseFloat(match[1].replace(/,/g, '')))) {
            extractedValue = parseFloat(match[1].replace(/,/g, ''));
            console.log(`  ✓ Strategy 1 (numeric): Parsed "${match[1]}" = ${extractedValue}`);
          }
        }
        
        // Strategy 4: Try match[0]
        if (!extractedValue) {
          const cleaned0 = match[0].toLowerCase().replace(/\s+dollars?$/, '').trim();
          if (textToNumber[cleaned0]) {
            extractedValue = textToNumber[cleaned0];
            console.log(`  ✓ Strategy 4 (match[0]): Found "${cleaned0}" = ${extractedValue}`);
          } else {
            console.log(`  ✗ Strategy 4 failed: "${cleaned0}" not in textToNumber`);
          }
        }
        
        if (extractedValue !== null) {
          foundAmounts.push({ value: extractedValue, source: match[0] });
        }
      }
      
      console.log('');
      break; // Stop after first pattern matches
    }
  }
  
  console.log(`Found amounts:`, foundAmounts.map(a => a.value));
  console.log(`Expected: ${test.expected.goalAmount}`);
  
  if (foundAmounts.length > 0 && foundAmounts.some(a => a.value === test.expected.goalAmount)) {
    console.log('✓ CORRECT amount found');
  } else if (foundAmounts.length > 0) {
    console.log('✗ WRONG amount extracted');
  } else {
    console.log('✗ NO amount extracted');
  }
});
