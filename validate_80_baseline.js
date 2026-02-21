/**
 * BASELINE VALIDATION TEST - Direct 80% Configuration Test
 * Tests the V1 system 10 times to confirm stable 80% baseline
 */

async function testBaselineConfiguration() {
  console.log(`\n🔍 BASELINE CONFIGURATION VALIDATION`);
  console.log(`===================================`);
  
  try {
    console.log(`\n🧪 Testing V1 System (Known 80% Baseline) - 10 iterations:`);
    
    const testResults = [];
    
    for (let i = 1; i <= 10; i++) {
      console.log(`\n📊 Run ${i}/10:`);
      
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

        testProcess.stderr.on('data', (data) => {
          output += data.toString();
        });

        testProcess.on('close', (code) => {
          // Extract name accuracy
          const nameMatch = output.match(/Name Extraction Accuracy: ([\d.]+)%/);
          const nameAccuracy = nameMatch ? parseFloat(nameMatch[1]) : null;
          
          resolve({
            run: i,
            nameAccuracy,
            success: nameAccuracy !== null
          });
        });

        testProcess.on('error', reject);
      });
      
      if (result.nameAccuracy !== null) {
        testResults.push(result.nameAccuracy);
        console.log(`   ✅ Name Extraction: ${result.nameAccuracy}%`);
      } else {
        console.log(`   ❌ Failed to extract accuracy from run ${i}`);
        testResults.push(0);
      }
    }
    
    // Calculate statistics
    const validResults = testResults.filter(r => r > 0);
    const median = validResults.length > 0 ? validResults.sort((a, b) => a - b)[Math.floor(validResults.length / 2)] : 0;
    const average = validResults.length > 0 ? validResults.reduce((a, b) => a + b, 0) / validResults.length : 0;
    const min = validResults.length > 0 ? Math.min(...validResults) : 0;
    const max = validResults.length > 0 ? Math.max(...validResults) : 0;
    
    console.log(`\n📈 BASELINE VALIDATION RESULTS:`);
    console.log(`=============================`);
    console.log(`✅ Valid Runs: ${validResults.length}/10`);
    console.log(`📊 Median: ${median}%`);
    console.log(`📊 Average: ${average.toFixed(2)}%`);
    console.log(`📊 Range: ${min}% - ${max}%`);
    console.log(`📊 Consistency: ${max - min === 0 ? 'PERFECT' : max - min < 5 ? 'STABLE' : 'VARIABLE'}`);
    
    if (median === 80) {
      console.log(`\n🎯 BASELINE CONFIRMED: ${median}% median matches expected 80%`);
      console.log(`✅ Ready to apply this configuration to testing parser`);
      return {
        success: true,
        median,
        average,
        validRuns: validResults.length,
        rawResults: validResults
      };
    } else {
      console.log(`\n⚠️  BASELINE MISMATCH: Expected 80%, got ${median}%`);
      return {
        success: false,
        median,
        average,
        expected: 80,
        validRuns: validResults.length,
        rawResults: validResults
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
        console.log(`   Ready to configure testing parser with ${result.median}% baseline!`);
        process.exit(0);
      } else {
        console.log(`\n💥 BASELINE VALIDATION: FAILED`);
        if (result.error) {
          console.log(`   Error:`, result.error);
        } else {
          console.log(`   Issue: Median ${result.median}% != expected 80%`);
          console.log(`   Raw Results: [${result.rawResults.join(', ')}]`);
        }
        process.exit(1);
      }
    })
    .catch(console.error);
}

module.exports = { testBaselineConfiguration };