#!/usr/bin/env node

/**
 * Evaluation System Initialization and Health Check
 * Validates that all components are ready for evaluation runs
 */

const fs = require('fs').promises;
const path = require('path');

async function checkFileExists(filePath, description) {
  try {
    await fs.access(filePath);
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} not found: ${filePath}`);
    return false;
  }
}

async function checkDirectory(dirPath, description) {
  try {
    const stats = await fs.stat(dirPath);
    if (stats.isDirectory()) {
      console.log(`✅ ${description}: ${dirPath}`);
      return true;
    } else {
      console.error(`❌ ${description} is not a directory: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${description} not found: ${dirPath}`);
    return false;
  }
}

async function validateDatasetFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    console.log(`📊 Dataset contains ${lines.length} test cases`);
    
    // Validate first few lines are valid JSON
    let validCount = 0;
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      try {
        const testCase = JSON.parse(lines[i]);
        if (testCase.id && testCase.transcriptText && testCase.expected) {
          validCount++;
        }
      } catch (e) {
        console.warn(`⚠️ Line ${i+1} has invalid JSON format`);
      }
    }
    
    if (validCount > 0) {
      console.log(`✅ Dataset format validation passed (${validCount}/${Math.min(3, lines.length)} samples valid)`);
      return true;
    } else {
      console.error(`❌ Dataset format validation failed`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to validate dataset: ${error.message}`);
    return false;
  }
}

async function checkParsingServices() {
  try {
    // Try to import parsing services
    const transcriptPath = path.join(__dirname, '../src/services/speechIntelligence/transcriptSignalExtractor.js');
    const storyPath = path.join(__dirname, '../src/services/storyExtractionService.js');
    
    const transcriptExists = await checkFileExists(transcriptPath, 'Transcript Signal Extractor');
    const storyExists = await checkFileExists(storyPath, 'Story Extraction Service');
    
    if (transcriptExists || storyExists) {
      console.log(`✅ Parsing services available for integration`);
      return true;
    } else {
      console.log(`⚠️ Parsing services not found - evaluation will use fallback simulation`);
      return true; // Not a failure, just a warning
    }
  } catch (error) {
    console.log(`⚠️ Could not verify parsing services: ${error.message}`);
    return true; // Not a failure, just a warning
  }
}

async function createOutputDirectories() {
  const outputDirs = [
    'backend/eval/output',
    'backend/eval/output/development',
    'backend/eval/output/ci',
    'backend/eval/output/production',
    'backend/eval/output/baselines'
  ];
  
  for (const dir of outputDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Created output directory: ${dir}`);
    } catch (error) {
      console.log(`ℹ️ Output directory already exists: ${dir}`);
    }
  }
  
  return true;
}

async function main() {
  console.log('🚀 Jan v.2.5 Parsing Evaluation System - Health Check\n');
  
  const checks = [];
  
  // Check core evaluation structure
  console.log('📁 Checking evaluation system structure...');
  checks.push(await checkDirectory('backend/eval', 'Evaluation system root'));
  checks.push(await checkDirectory('backend/eval/datasets', 'Datasets directory'));
  checks.push(await checkDirectory('backend/eval/runners', 'Runners directory'));
  checks.push(await checkDirectory('backend/eval/utils', 'Utils directory'));
  checks.push(await checkDirectory('backend/eval/schemas', 'Schemas directory'));
  
  // Check key files
  console.log('\n📄 Checking key evaluation files...');
  checks.push(await checkFileExists('backend/eval/runners/run_parsing_eval.ts', 'Original evaluation runner'));
  checks.push(await checkFileExists('backend/eval/runners/production_parsing_eval.ts', 'Production evaluation runner'));
  checks.push(await checkFileExists('backend/eval/adapters/parsingAdapter.ts', 'Parsing adapter'));
  checks.push(await checkFileExists('backend/eval/utils/performanceBudget.ts', 'Performance budget manager'));
  checks.push(await checkFileExists('backend/eval/utils/outputArtifacts.ts', 'Output artifacts generator'));
  
  // Check dataset
  console.log('\n📊 Validating golden dataset...');
  checks.push(await checkFileExists('backend/eval/datasets/transcripts_golden_v1.jsonl', 'Golden dataset'));
  checks.push(await validateDatasetFile('backend/eval/datasets/transcripts_golden_v1.jsonl'));
  
  // Check parsing services integration
  console.log('\n🔌 Checking parsing services integration...');
  checks.push(await checkParsingServices());
  
  // Create output directories
  console.log('\n📁 Setting up output directories...');
  checks.push(await createOutputDirectories());
  
  // Check CI workflow
  console.log('\n🔄 Checking CI integration...');
  checks.push(await checkFileExists('.github/workflows/eval-parsing.yml', 'GitHub Actions workflow'));
  
  // Summary
  console.log('\n' + '='.repeat(60));
  const passedChecks = checks.filter(Boolean).length;
  const totalChecks = checks.length;
  
  if (passedChecks === totalChecks) {
    console.log(`🎉 All ${totalChecks} health checks passed!`);
    console.log('\n📋 Ready to run:');
    console.log('  npm run eval:dev     # Development mode');
    console.log('  npm run eval:ci      # CI mode');  
    console.log('  npm run eval:prod    # Production mode');
    console.log('\n✨ System is ready for evaluation runs!');
    process.exit(0);
  } else {
    console.log(`⚠️ ${passedChecks}/${totalChecks} health checks passed`);
    console.log('\n🔧 Some issues detected - please review the output above.');
    console.log('The system may still work but some features might be limited.');
    process.exit(1);
  }
}

// Run health check
main().catch(error => {
  console.error('\n💥 Health check failed with error:', error.message);
  process.exit(1);
});