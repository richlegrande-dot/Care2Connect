#!/usr/bin/env tsx
/**
 * Test the amount_v2 experiment directly
 */

// Set the experiment environment variable
process.env.USE_AMOUNT_V2 = 'true';

console.log('🧪 Testing amount_v2 experiment logic...\n');

// Import the extraction engine
import { extractAllWithTelemetry } from './src/utils/extraction/rulesEngine.ts';

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

async function testAmountV2() {
  console.log('Environment variable USE_AMOUNT_V2:', process.env.USE_AMOUNT_V2);
  console.log('\nTesting amount extraction with expanded SPOKEN_NUMBERS...\n');

  for (const tc of testCases) {
    try {
      const result = await extractAllWithTelemetry(tc.text);
      const match = result.goalAmount === tc.expected;
      
      console.log(`${tc.id}: ${match ? '✅' : '❌'}`);
      console.log(`  Expected: $${tc.expected}`);
      console.log(`  Got: $${result.goalAmount || 'null'}`);
      console.log(`  Text: "${tc.text.slice(0, 80)}..."`);
      console.log('');
    } catch (error) {
      console.log(`${tc.id}: ERROR - ${error.message}`);
    }
  }
}

testAmountV2();