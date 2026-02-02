// Test what happens when multiple patterns match
const fs = require('fs');

// Read actual transcripts
const data = fs.readFileSync('./datasets/transcripts_golden_v1.jsonl', 'utf-8');
const lines = data.trim().split('\n');
const tests = lines.map(line => JSON.parse(line));

const test008 = tests.find(t => t.id === 'T008');
const transcript = test008.transcriptText;

console.log('=== T008 Full Extraction Test ===');
console.log(`Transcript: "${transcript}"\n`);
console.log(`Expected: ${test008.expected.goalAmount}\n`);

// All patterns (in order from main code)
const amountPatterns = [
  { name: 'P1: need/require + $amount', pattern: /(?:need|require|asking for|goal is|trying to raise|fundraising for).*?\$([0-9,]+(?:\.\d{2})?)/gi },
  { name: 'P2: $amount + needed/required', pattern: /\$([0-9,]+(?:\.\d{2})?).*?(?:needed|required|help|assistance|goal|to raise)/gi },
  { name: 'P3: cost/total/bill + amount', pattern: /(?:cost|total|bill|owe|debt)\s+(?:about\s+|around\s+|approximately\s+)?\$?([0-9,]+(?:\.\d{2})?)/i },
  { name: 'P4: amount + dollars + to/for', pattern: /\$?([0-9,]+(?:\.\d{2})?)\s*(?:dollars?|bucks)\s+(?:to|for|that|needed|required|goal)/i },
  { name: 'P5: between X and Y', pattern: /between\s+\$?([0-9,]+)\s+(?:and|to|-|or)\s+\$?([0-9,]+)/i },
  { name: 'P6: complex written (thousand + hundred + tens)', pattern: /((?:one|two|three|four|five|six|seven|eight|nine|ten)\s+thousand\s+(?:one|two|three|four|five|six|seven|eight|nine)\s+hundred\s+(?:and\s+)?(?:ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)?(?:\s*(?:one|two|three|four|five|six|seven|eight|nine))?)\s*(?:dollars?)?/gi },
  { name: 'P7: hundred + tens', pattern: /((?:one|two|three|four|five|six|seven|eight|nine)\s+hundred\s+(?:and\s+)?(?:ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:\s*(?:one|two|three|four|five|six|seven|eight|nine))?)\s*(?:dollars?)?/gi },
  { name: 'P8: thousand + hundred', pattern: /((?:one|two|three|four|five|six|seven|eight|nine|ten)\s+thousand\s+(?:one|two|three|four|five|six|seven|eight|nine)\s+hundred)\s*(?:dollars?)?/gi },
  { name: 'P9: twenty/thirty-X hundred', pattern: /((?:twenty|thirty|forty|fifty)[\s-]?(?:one|two|three|four|five|six|seven|eight|nine)?\s+hundred)\s*(?:dollars?)?/gi },
  { name: 'P10: fixed phrases', pattern: /(eleven hundred|twelve hundred|thirteen hundred|fourteen hundred|fifteen hundred|sixteen hundred|seventeen hundred|eighteen hundred|nineteen hundred|twenty-one hundred|twenty-two hundred|twenty-three hundred|twenty-four hundred|twenty-five hundred|twenty-six hundred|twenty-seven hundred|twenty-eight hundred|twenty-nine hundred|thirty-one hundred|thirty-two hundred|thirty-three hundred|thirty-four hundred|thirty-five hundred|thirty-six hundred|thirty-seven hundred|thirty-eight hundred|thirty-nine hundred|one thousand|two thousand|three thousand|four thousand|five thousand|six thousand|seven thousand|eight thousand|nine thousand|ten thousand)\s*(?:dollars?)?/gi },
  { name: 'P11: simple two-part', pattern: /(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty)\s+(hundred|thousand)\s*(?:dollars?)?(?:\s+(?:needed|required|for|to))?/gi },
  { name: 'P12: $numeric', pattern: /\$([0-9,]+(?:\.\d{2})?)\b/g },
  { name: 'P13: numeric + dollars', pattern: /([0-9,]+)\s*dollars?\b/gi }
];

const textToNumber = {
  'one thousand': 1000, 'two thousand': 2000, 'three thousand': 3000,
  'two thousand two hundred fifty': 2250,
  'two thousand two hundred and fifty': 2250
};

console.log('=== Testing All Patterns ===\n');

let allMatches = [];

for (const {name, pattern} of amountPatterns) {
  let matches;
  
  if (pattern.global) {
    matches = [...transcript.matchAll(pattern)];
  } else {
    const match = transcript.match(pattern);
    matches = match ? [match] : [];
  }
  
  if (matches.length > 0) {
    console.log(`${name}:`);
    for (const match of matches) {
      console.log(`  "${match[0]}"  ->  capture group: "${match[1] || 'none'}"`);
      
      // Try to extract value
      let value = null;
      if (match[1]) {
        const cleaned = match[1].toLowerCase().replace(/\s+dollars?$/, '').trim();
        if (textToNumber[cleaned]) {
          value = textToNumber[cleaned];
        } else if (!isNaN(parseFloat(match[1].replace(/,/g, '')))) {
          value = parseFloat(match[1].replace(/,/g, ''));
        }
      }
      
      if (value) {
        console.log(`    -> VALUE: ${value}`);
        allMatches.push({ pattern: name, match: match[0], value });
      }
    }
    console.log('');
  }
}

console.log('=== All Extracted Amounts ===');
allMatches.forEach(m => console.log(`  ${m.value} from "${m.match}" (${m.pattern})`));

console.log(`\n=== Analysis ===`);
console.log(`Expected: 2250`);
console.log(`Found 2250? ${allMatches.some(m => m.value === 2250) ? 'YES ✓' : 'NO ✗'}`);
console.log(`Found 2000? ${allMatches.some(m => m.value === 2000) ? 'YES (competitor!)' : 'NO'}`);

if (allMatches.length > 1) {
  console.log(`\nMultiple amounts detected! Selection logic will choose based on priority.`);
}
