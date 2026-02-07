// Debug the enhanced name extractor directly
const { enhancedNameExtractor } = require('../temp/enhancedNameExtractor.js');

const text = 'My name is Robert Chen and I need help finishing my certification program. I lost my job and need this training to find work again. The program costs twenty-eight hundred dollars and I start next month.';

console.log('=== Enhanced Name Extractor Debug ===');
console.log('Text:', text);
console.log('');

const result = enhancedNameExtractor.extract(text);
console.log('Result:');
console.log('Primary:', result.primary);
console.log('Confidence:', result.confidence);
console.log('Reasoning:', result.reasoning);
console.log('');
console.log('All candidates:');
result.candidates.forEach((candidate, index) => {
  console.log(`${index + 1}. "${candidate.name}" (confidence: ${candidate.confidence}, strategy: ${candidate.strategy})`);
});