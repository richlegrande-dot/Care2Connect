/**
 * Test environment variable logic
 */

console.log('\n=== ENVIRONMENT TEST ===');
console.log('USE_AMOUNT_V2 (current):', process.env.USE_AMOUNT_V2 || 'undefined');

// Set the variable
process.env.USE_AMOUNT_V2 = 'true';
console.log('USE_AMOUNT_V2 (after setting):', process.env.USE_AMOUNT_V2);

// Test the conditional that would be in amountEngine.ts
const BASELINE_SPOKEN_NUMBERS = {
  'five hundred': 500,
  'eight hundred': 800,
  'one thousand': 1000,
  'fifteen hundred': 1500,
  'two hundred': 200,
  'three hundred': 300,
  'four hundred': 400,
  'seven hundred': 700,
  'nine hundred': 900,
  'one hundred': 100
};

const EXTENDED_SPOKEN_NUMBERS = {
  'two thousand': 2000,
  'three thousand five hundred': 3500,
  'two thousand two hundred fifty': 2250,
  // ... + 40+ more entries
  'five hundred': 500,
  'eight hundred': 800,
  'one thousand': 1000,
};

const SPOKEN_NUMBERS = process.env.USE_AMOUNT_V2 === 'true' 
  ? EXTENDED_SPOKEN_NUMBERS 
  : BASELINE_SPOKEN_NUMBERS;

console.log('Selected map has', Object.keys(SPOKEN_NUMBERS).length, 'entries');
console.log('Contains "two thousand":', 'two thousand' in SPOKEN_NUMBERS);
console.log('Contains "three thousand five hundred":', 'three thousand five hundred' in SPOKEN_NUMBERS);

console.log('\n=== TEST COMPLETE ===\n');