const { spawn } = require('child_process');
const path = require('path');

/**
 * Real Parsing Service Integration Test Script
 * Sets up the environment and runs integrated evaluation with real services
 */

async function setupAndRunIntegratedTest() {
  console.log('🔄 Setting up integrated test environment...\n');
  
  // Set environment variables for safe testing
  process.env.ZERO_OPENAI_MODE = 'true';
  process.env.ENABLE_STRESS_TEST_MODE = 'true';
  process.env.NODE_ENV = 'test';
  
  console.log('🛡️ Test Environment Configuration:');
  console.log('   • ZERO_OPENAI_MODE: true (no external API calls)');
  console.log('   • ENABLE_STRESS_TEST_MODE: true');
  console.log('   • NODE_ENV: test');
  console.log('   • Working Directory:', process.cwd());
  console.log('');
  
  try {
    // First, check if we can access the parsing services
    console.log('🔍 Checking parsing service availability...');
    
    // Try to load the required modules
    try {
      const transcriptExtractorPath = path.join(process.cwd(), 'backend/src/services/speechIntelligence/transcriptSignalExtractor.ts');
      const storyServicePath = path.join(process.cwd(), 'backend/src/services/storyExtractionService.ts');
      
      console.log(`   • Transcript Extractor: ${transcriptExtractorPath}`);
      console.log(`   • Story Service: ${storyServicePath}`);
      
      // Check if files exist
      const fs = require('fs');
      if (fs.existsSync(transcriptExtractorPath)) {
        console.log('   ✅ Transcript Signal Extractor found');
      } else {
        console.log('   ⚠️ Transcript Signal Extractor not found - will use simulation');
      }
      
      if (fs.existsSync(storyServicePath)) {
        console.log('   ✅ Story Extraction Service found');
      } else {
        console.log('   ⚠️ Story Extraction Service not found - will use simulation');
      }
      
    } catch (error) {
      console.log('   ⚠️ Module check failed - will attempt dynamic loading during execution');
    }
    
    console.log('\n🚀 Running integrated evaluation with real parsing services...\n');
    
    // Import and run the integrated evaluation
    const { runIntegratedEvaluation } = require('./integrated-runner');
    const exitCode = await runIntegratedEvaluation();
    
    if (exitCode === 0) {
      console.log('\n🎉 Integrated evaluation completed successfully!');
    } else {
      console.log('\n⚠️ Integrated evaluation completed with issues.');
    }
    
    return exitCode;
    
  } catch (error) {
    console.error('💥 Setup or execution failed:', error.message);
    console.error('Stack trace:', error.stack);
    return 1;
  }
}

// Direct execution support
if (require.main === module) {
  setupAndRunIntegratedTest().then(exitCode => {
    console.log(`\n🏁 Test completed with exit code: ${exitCode}`);
    process.exit(exitCode);
  }).catch(error => {
    console.error('Fatal error in setup:', error);
    process.exit(1);
  });
}

module.exports = { setupAndRunIntegratedTest };