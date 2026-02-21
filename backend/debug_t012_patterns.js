// Debug T012 name extraction patterns specifically
const fs = require('fs');
const path = require('path');

// Load enhanced name extractor directly
const enhancedNamePath = path.join(__dirname, 'eval/temp/enhancedNameExtractor.js');
const { enhancedNameExtractor } = require(enhancedNamePath);

const input = "Good morning, this is Dr. Patricia Johnson. I'm calling not as a doctor but as a mother. My daughter needs help with her wedding expenses after her father passed away. We need about three thousand dollars for the ceremony.";

console.log('=== ENHANCED NAME EXTRACTOR DEBUG ===');
console.log('Input:', input);
console.log('');

// Test the extractor
const result = enhancedNameExtractor.extract(input);
console.log('=== RESULT ===');
console.log('Primary:', result.primary);
console.log('Confidence:', result.confidence);
console.log('Reasoning:', result.reasoning);
console.log('');
console.log('All candidates:');
result.candidates.forEach((candidate, i) => {
  console.log(`${i+1}. "${candidate.name}" (${candidate.confidence} confidence, strategy: ${candidate.strategy})`);
});