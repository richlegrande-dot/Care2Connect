/**
 * Quick diagnostic for amount extraction
 */

const { extractAllWithTelemetry } = require('./src/utils/extraction/rulesEngine.ts');

const testCases = [
  {
    id: 'T003',
    text: "My name is Jennifer Davis and I lost my job last month. I have three kids and we're struggling to buy food. I think we need around two thousand dollars to get back on our feet.",
    expected: 2000
  },
  {
    id: 'T004', 
    text: "Hi, I'm Robert Martinez. I'm trying to finish my nursing degree but I can't afford the tuition for my last semester. It costs about three thousand five hundred dollars and I don't know what to do.",
    expected: 3500
  },
  {
    id: 'T008',
    text: "This is James Brown. I'm facing eviction and need legal help. The lawyer says I need exactly two thousand two hundred fifty dollars to fight this in court.",
    expected: 2250
  }
];

async function debugAmounts() {
  console.log('🔍 Debugging amount extraction...\n');

  for (const tc of testCases) {
    try {
      const result = await extractAllWithTelemetry(tc.text);
      console.log(`${tc.id}:`);
      console.log(`  Input: "${tc.text}"`);
      console.log(`  Expected: ${tc.expected}`);
      console.log(`  Got: ${result.goalAmount}`);
      console.log(`  Match: ${result.goalAmount === tc.expected ? '✅' : '❌'}`);
      console.log('');
    } catch (error) {
      console.log(`${tc.id}: ERROR - ${error.message}`);
    }
  }
}

debugAmounts();