#!/usr/bin/env node

/**
 * Jan v4.0 Quick Evaluation Runner with Enhanced User Visualization
 * 
 * This script provides an easy way to run the Jan v4.0 evaluation system
 * with comprehensive visual feedback and progress indicators.
 */

// Use dynamic import for TypeScript module
async function loadEvaluationRunner() {
  try {
    // Try to load the compiled module first
    const { ParsingEvaluationRunner } = await import('./run_parsing_eval.js');
    return ParsingEvaluationRunner;
  } catch (error) {
    // Fallback to tsx execution
    console.log('🔄 Loading TypeScript module with tsx...');
    const { spawn } = require('child_process');
    return null; // Will use tsx fallback
  }
}

async function runWithVisualization() {
  try {
    // Display startup banner
    console.log('\n' + '█'.repeat(80));
    console.log('🚀 JAN v4.0 PARSING EVALUATION SYSTEM - VISUAL RUNNER');
    console.log('█'.repeat(80));
    console.log('📚 Complete parsing system evaluation with real-time progress');
    console.log('🎯 Targets: 80%+ overall pass rate, detailed field analysis');
    console.log('📊 Features: Progress bars, confidence analysis, production readiness');
    console.log('█'.repeat(80) + '\n');

    console.log('🔧 CONFIGURATION:');
    const dataset = process.argv[2] || 'transcripts_golden_v4_core30';
    console.log(`   📁 Dataset: ${dataset}`);
    console.log(`   🔄 Mode: ${process.env.EVAL_MODE || 'real'}`);
    console.log(`   ⚖️  Scoring: ${process.env.EVAL_SCORING || 'weighted'}`);
    console.log(`   🚫 Zero OpenAI: ${process.env.ZERO_OPENAI_MODE || 'false'}`);
    console.log('');

    // Try to load the module
    const ParsingEvaluationRunner = await loadEvaluationRunner();
    
    if (ParsingEvaluationRunner) {
      // Use the loaded module
      const runner = new ParsingEvaluationRunner();
      await runner.runEvaluation(dataset);
    } else {
      // Fallback to tsx execution
      console.log('🔄 Using tsx fallback execution...\n');
      const { spawn } = require('child_process');
      
      const args = ['eval/runners/run_parsing_eval.ts'];
      if (dataset !== 'transcripts_golden_v4_core30') {
        process.env.EVAL_DATASET = dataset;
      }
      
      const child = spawn('npx', ['tsx', ...args], {
        stdio: 'inherit',
        env: process.env,
        cwd: process.cwd()
      });
      
      return new Promise((resolve, reject) => {
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    }
    
    // Success message
    console.log('\n' + '█'.repeat(80));
    console.log('🎉 EVALUATION COMPLETED SUCCESSFULLY');
    console.log('📄 Check the outputs folder for detailed reports:');
    console.log('   📋 eval-results-YYYY-MM-DD.json (detailed results)');
    console.log('   📝 eval-summary-YYYY-MM-DD.md (markdown summary)');
    console.log('   ❌ eval-errors-YYYY-MM-DD.jsonl (error analysis)');
    console.log('█'.repeat(80) + '\n');

  } catch (error) {
    console.error('\n' + '█'.repeat(80));
    console.error('💥 EVALUATION FAILED');
    console.error('█'.repeat(80));
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Try simulation mode: EVAL_MODE=simulation node visual_runner.js');
    console.error('   2. Disable OpenAI: ZERO_OPENAI_MODE=true node visual_runner.js');
    console.error('   3. Check dataset exists: ls ../datasets/');
    console.error('   4. Review documentation: JAN_V4_QUICK_REFERENCE.md');
    console.error('█'.repeat(80) + '\n');
    process.exit(1);
  }
}

// Show usage information if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('\n🚀 Jan v4.0 Visual Evaluation Runner');
  console.log('═'.repeat(50));
  console.log('Usage: node visual_runner.js [dataset_name]');
  console.log('');
  console.log('Examples:');
  console.log('  node visual_runner.js                                    # Use default dataset');
  console.log('  node visual_runner.js transcripts_golden_v4_core30       # Specific dataset');
  console.log('  EVAL_MODE=simulation node visual_runner.js               # Simulation mode');
  console.log('  EVAL_SCORING=binary node visual_runner.js                # Binary scoring');
  console.log('  ZERO_OPENAI_MODE=true node visual_runner.js              # No OpenAI calls');
  console.log('');
  console.log('Environment Variables:');
  console.log('  EVAL_MODE=real|simulation          # Service mode (default: real)');
  console.log('  EVAL_SCORING=binary|weighted       # Scoring type (default: weighted)');
  console.log('  ZERO_OPENAI_MODE=true|false        # Disable OpenAI (default: false)');
  console.log('  EVAL_DATASET=dataset_name          # Override dataset');
  console.log('');
  console.log('📚 Documentation: JAN_V4_QUICK_REFERENCE.md');
  console.log('═'.repeat(50) + '\n');
  process.exit(0);
}

// Run the evaluation
runWithVisualization();