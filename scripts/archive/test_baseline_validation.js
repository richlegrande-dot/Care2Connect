/**
 * BASELINE VALIDATION TEST - Direct 80% Configuration Test
 * Tests the actual 80% baseline configuration without wrapper issues
 */

const { EvaluationConfig } = require('../backend/eval/shared/UnifiedParserAdapter');

async function testBaselineConfiguration() {
  console.log(`\n🔍 BASELINE CONFIGURATION VALIDATION`);
  console.log(`===================================`);
  
  try {
    // Load the production 80% baseline config
    const productionConfig = EvaluationConfig.getParserConfig('production');
    console.log(`✅ Production Config Loaded:`);
    console.log(`   Parser: ${productionConfig.parser}`);
    console.log(`   Description: ${productionConfig.description}`);
    console.log(`   Tolerance: ${productionConfig.amountTolerance * 100}%`);
    
    // Test the same system V1 uses - direct access
    console.log(`\n🧪 Testing V1 System (Known 80% Baseline):`);
    
    const testResults = [];
    
    for (let i = 1; i <= 10; i++) {
      console.log(`\n📊 Run ${i}/10:`);
      
      // Run V1 system directly (we know this gives 80%)
      const { spawn } = require('child_process');
      const result = await new Promise((resolve, reject) => {
        const testProcess = spawn('npm', ['run', 'test:qa:v1'], {
          cwd: 'backend',
          stdio: 'pipe',
          shell: true
        });

        let output = '';
        testProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        testProcess.on('close', (code) => {
          // Extract name accuracy
          const nameMatch = output.match(/Name Extraction Accuracy: ([\d.]+)%/);
          const nameAccuracy = nameMatch ? parseFloat(nameMatch[1]) : null;
          
          resolve({
            run: i,
            nameAccuracy,
            output: output.substring(0, 200) // First 200 chars for debugging
          });
        });

        testProcess.on('error', reject);
      });
      
      if (result.nameAccuracy !== null) {
        testResults.push(result.nameAccuracy);
        console.log(`   Name Extraction: ${result.nameAccuracy}%`);
      } else {
        console.log(`   ❌ Failed to extract accuracy from output`);
        testResults.push(0);
      }
    }
    
    // Calculate statistics
    const validResults = testResults.filter(r => r > 0);
    const median = validResults.sort((a, b) => a - b)[Math.floor(validResults.length / 2)];
    const average = validResults.reduce((a, b) => a + b, 0) / validResults.length;
    const min = Math.min(...validResults);
    const max = Math.max(...validResults);
    
    console.log(`\n📈 BASELINE VALIDATION RESULTS:`);
    console.log(`=============================`);
    console.log(`✅ Valid Runs: ${validResults.length}/10`);
    console.log(`📊 Median: ${median}%`);
    console.log(`📊 Average: ${average.toFixed(2)}%`);
    console.log(`📊 Range: ${min}% - ${max}%`);
    console.log(`📊 Consistency: ${max - min === 0 ? 'PERFECT' : 'Variable'}`);
    
    if (median === 80) {
      console.log(`\n🎯 BASELINE CONFIRMED: ${median}% median matches expected 80%`);
      console.log(`✅ Ready to apply this configuration to testing parser`);
      return {
        success: true,
        median,
        average,
        config: productionConfig
      };
    } else {
      console.log(`\n⚠️  BASELINE MISMATCH: Expected 80%, got ${median}%`);
      return {
        success: false,
        median,
        average,
        expected: 80,
        config: productionConfig
      };
    }
    
  } catch (error) {
    console.error(`❌ Baseline validation failed:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run baseline validation
if (require.main === module) {
  testBaselineConfiguration()
    .then(result => {
      if (result.success) {
        console.log(`\n🎉 BASELINE VALIDATION: SUCCESS`);
        console.log(`   Ready to configure testing parser with 80% baseline!`);
        process.exit(0);
      } else {
        console.log(`\n💥 BASELINE VALIDATION: FAILED`);
        console.log(`   Issue:`, result.error || `Median ${result.median}% != expected 80%`);
        process.exit(1);
      }
    })
    .catch(console.error);
}

module.exports = { testBaselineConfiguration };