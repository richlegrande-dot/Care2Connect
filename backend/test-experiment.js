/**
 * Quick test of experiment system
 */

console.log('Testing experiment environment variables...');

// Test original environment
console.log('Current USE_AMOUNT_V2:', process.env.USE_AMOUNT_V2);

// Set the experiment variable
process.env.USE_AMOUNT_V2 = 'true';
console.log('Set USE_AMOUNT_V2 to:', process.env.USE_AMOUNT_V2);

// Try importing the amountEngine to test conditional logic
console.log('Testing amountEngine import...');
const path = require('path');
const tsxPath = require.resolve('tsx/esm');

// Since we can't directly import TS, let's just verify the env var works
try {
  const { exec } = require('child_process');
  
  // Use tsx to run a simple test
  const testScript = `
    import { AmountDetectionEngine } from './src/utils/extraction/amountEngine.ts';
    
    const engine = new AmountDetectionEngine();
    const result = engine.detectGoalAmount('I need two thousand dollars', {});
    
    console.log('Amount detection result:', JSON.stringify(result, null, 2));
  `;
  
  console.log('Testing with USE_AMOUNT_V2=true...');
  
} catch (error) {
  console.error('Test error:', error.message);
}