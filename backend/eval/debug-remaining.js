// Test the full extraction flow including deduplication and filtering
const fs = require('fs');

// Read T013 specifically
const data = fs.readFileSync('./datasets/transcripts_golden_v1.jsonl', 'utf-8');
const lines = data.trim().split('\n');
const tests = lines.map(line => JSON.parse(line));

const testIds = ['T013', 'T014', 'T020', 'T021'];
const testCases = tests.filter(t => testIds.includes(t.id));

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

// Simple two-part pattern only
const simplePattern = /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\s+(hundred|thousand)\s*(?:dollars?)?(?:\s+(?:needed|required|for|to))?/gi;

testCases.forEach(test => {
  const transcript = test.transcriptText;
  console.log(`\n=== ${test.id}: Expected ${test.expected.goalAmount} ===`);
  console.log(`Transcript: "${transcript}"\n`);
  
  const matches = [...transcript.matchAll(simplePattern)];
  
  if (matches.length > 0) {
    console.log(`Found ${matches.length} match(es):`);
    
    matches.forEach((match, i) => {
      console.log(`  Match ${i+1}: "${match[0]}"`);
      console.log(`    Capture groups: [${match.slice(1).filter(g => g).join(', ')}]`);
      
      // Try to extract
      if (match[1]) {
        const cleaned = match[1].toLowerCase().replace(/\s+dollars?$/, '').trim();
        console.log(`    Cleaned match[1]: "${cleaned}"`);
        
        if (textToNumber[cleaned]) {
          console.log(`    ✓ Found in textToNumber: ${textToNumber[cleaned]}`);
        } else {
          console.log(`    ✗ NOT in textToNumber`);
        }
      }
      
      // Try match[0]
      const cleaned0 = match[0].toLowerCase().replace(/\s+dollars?$/, '').trim();
      console.log(`    Cleaned match[0]: "${cleaned0}"`);
      
      if (textToNumber[cleaned0]) {
        console.log(`    ✓ Found in textToNumber: ${textToNumber[cleaned0]}`);
      } else {
        console.log(`    ✗ NOT in textToNumber`);
        
        // Check if it needs reconstruction
        if (match[1] && match[2]) {
          const reconstructed = match[1] + ' ' + match[2];
          console.log(`    Trying reconstructed: "${reconstructed}"`);
          if (textToNumber[reconstructed]) {
            console.log(`    ✓ Reconstructed found: ${textToNumber[reconstructed]}`);
          } else {
            console.log(`    ✗ Reconstructed NOT found`);
          }
        }
      }
    });
  } else {
    console.log('No matches found!');
  }
});

console.log('\n\n=== Checking textToNumber for these values ===');
console.log('six thousand:', textToNumber['six thousand']);
console.log('fifteen hundred:', textToNumber['fifteen hundred']);
console.log('nine hundred fifty:', textToNumber['nine hundred fifty']);
console.log('thirty-five hundred:', textToNumber['thirty-five hundred']);
