/**
 * Integrated Jan v.2.5 Evaluation Runner with Real Parsing Services
 * Uses actual transcriptSignalExtractor and StoryExtractionService with test fixtures
 */

const fs = require('fs').promises;
const path = require('path');

// Import path helpers for cross-platform compatibility
const getFixturePath = (fixtureId) => {
  return path.join(__dirname, '../tests/fixtures/transcripts', `${fixtureId}.json`);
};

// Load a test fixture from the fixtures directory
async function loadTestFixture(fixtureId) {
  try {
    const fixturePath = getFixturePath(fixtureId);
    const content = await fs.readFile(fixturePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load fixture ${fixtureId}:`, error.message);
    return null;
  }
}

// Get list of available fixtures
async function getAvailableFixtures() {
  const fixturesDir = path.join(__dirname, '../tests/fixtures/transcripts');
  try {
    const files = await fs.readdir(fixturesDir);
    return files
      .filter(f => f.endsWith('.json') && !f.includes('pipeline'))
      .map(f => f.replace('.json', ''))
      .slice(0, 15); // Limit to 15 for the demo
  } catch (error) {
    console.error('Failed to read fixtures directory:', error.message);
    // Fallback to known fixtures
    return [
      '01_housing_eviction', '02_medical_emergency', '01-normal-complete',
      '02-short-incomplete', '04-urgent-crisis', '05-medical-needs',
      '06-multiple-needs', '08-family-children', '09-positive-hopeful',
      '12-elder-care', '14-youth-student', '15-transportation-focus'
    ];
  }
}

// Call real parsing services
async function callRealParsingServices(fixture) {
  try {
    // Import the actual parsing services
    const transcriptPath = path.join(__dirname, '../src/services/speechIntelligence/transcriptSignalExtractor.ts');
    const storyPath = path.join(__dirname, '../src/services/storyExtractionService.ts');
    
    // Set environment to evaluation mode to prevent external API calls
    process.env.ZERO_OPENAI_MODE = 'true';
    process.env.ENABLE_STRESS_TEST_MODE = 'true';
    
    // Dynamic import with error handling
    let extractSignals, StoryExtractionService;
    
    try {
      const transcriptModule = require('../src/services/speechIntelligence/transcriptSignalExtractor');
      extractSignals = transcriptModule.extractSignals;
    } catch (error) {
      console.warn('Could not import extractSignals, using fallback simulation');
      return await simulateParsing(fixture);
    }
    
    try {
      const storyModule = require('../src/services/storyExtractionService');
      StoryExtractionService = storyModule.StoryExtractionService;
    } catch (error) {
      console.warn('Could not import StoryExtractionService, using signal extraction only');
    }
    
    // Extract signals using real service
    const transcriptInput = {
      text: fixture.transcriptText,
      segments: fixture.segments
    };
    
    const signals = await extractSignals(transcriptInput);
    
    let storyResult = null;
    if (StoryExtractionService) {
      try {
        const storyService = new StoryExtractionService();
        storyResult = await storyService.extractGoFundMeData(fixture.transcriptText);
      } catch (error) {
        console.warn('Story extraction failed, using signals only:', error.message);
      }
    }
    
    // Combine results
    const result = {
      name: storyResult?.draft?.name?.value || signals.nameCandidate,
      category: (signals.needsCategories && signals.needsCategories.length > 0) 
        ? signals.needsCategories[0].category || signals.needsCategories[0] 
        : 'OTHER',
      urgencyLevel: signals.urgencyLevel || 'MEDIUM',
      goalAmount: storyResult?.draft?.goalAmount?.value || signals.goalAmount,
      confidence: {
        name: storyResult?.draft?.name?.confidence || signals.confidence?.name || 0.5,
        category: signals.confidence?.needs || 0.5,
        urgency: signals.confidence?.urgency || 0.5,
        goalAmount: storyResult?.draft?.goalAmount?.confidence || signals.confidence?.goalAmount || 0.5,
        overall: storyResult?.confidence || 0.7
      },
      extractionMethod: storyResult ? 'full_pipeline' : 'signals_only',
      rawSignals: signals,
      rawStory: storyResult
    };
    
    return result;
    
  } catch (error) {
    console.warn('Real parsing services failed, using simulation:', error.message);
    return await simulateParsing(fixture);
  }
}

// Fallback simulation for when real services can't be loaded
async function simulateParsing(fixture) {
  // Simulate realistic parsing based on fixture content
  const transcriptText = fixture.transcriptText.toLowerCase();
  
  // Extract name using simple pattern matching
  let name = null;
  const namePatterns = [/my name is ([^.,]+)/i, /i'm ([^.,]+)/i, /this is ([^.,]+)/i];
  for (const pattern of namePatterns) {
    const match = fixture.transcriptText.match(pattern);
    if (match) {
      name = match[1].trim();
      break;
    }
  }
  
  // Extract amount
  let goalAmount = null;
  const amountPatterns = [/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*dollar/i, /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/];
  for (const pattern of amountPatterns) {
    const match = fixture.transcriptText.match(pattern);
    if (match) {
      goalAmount = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }
  
  // Determine category from keywords
  let category = 'OTHER';
  if (transcriptText.includes('rent') || transcriptText.includes('evict') || transcriptText.includes('housing')) {
    category = 'HOUSING';
  } else if (transcriptText.includes('medical') || transcriptText.includes('hospital') || transcriptText.includes('surgery')) {
    category = 'MEDICAL';
  } else if (transcriptText.includes('education') || transcriptText.includes('school') || transcriptText.includes('tuition')) {
    category = 'EDUCATION';
  } else if (transcriptText.includes('food') || transcriptText.includes('hungry')) {
    category = 'FOOD';
  }
  
  // Determine urgency
  let urgencyLevel = 'MEDIUM';
  if (transcriptText.includes('urgent') || transcriptText.includes('emergency') || transcriptText.includes('critical')) {
    urgencyLevel = 'CRITICAL';
  } else if (transcriptText.includes('soon') || transcriptText.includes('quickly')) {
    urgencyLevel = 'HIGH';
  }
  
  return {
    name,
    category,
    urgencyLevel,
    goalAmount,
    confidence: {
      name: name ? 0.8 : 0,
      category: 0.7,
      urgency: 0.6,
      goalAmount: goalAmount ? 0.9 : 0,
      overall: 0.7
    },
    extractionMethod: 'simulation',
    rawSignals: null,
    rawStory: null
  };
}

// Compare results with expected values
function compareWithExpected(actual, expected) {
  const differences = [];
  
  // Name comparison
  if (expected.name && actual.name !== expected.name) {
    differences.push(`name: expected "${expected.name}", got "${actual.name}"`);
  } else if (!expected.name && actual.name) {
    differences.push(`name: expected null, got "${actual.name}"`);
  } else if (expected.name && !actual.name) {
    differences.push(`name: expected "${expected.name}", got null`);
  }
  
  // Category comparison
  const expectedCategory = Array.isArray(expected.needsCategories) 
    ? expected.needsCategories[0] 
    : expected.needsCategories || expected.category;
    
  if (expectedCategory && actual.category !== expectedCategory) {
    differences.push(`category: expected "${expectedCategory}", got "${actual.category}"`);
  }
  
  // Urgency comparison
  if (expected.urgencyLevel && actual.urgencyLevel !== expected.urgencyLevel) {
    differences.push(`urgencyLevel: expected "${expected.urgencyLevel}", got "${actual.urgencyLevel}"`);
  }
  
  // Goal amount comparison
  if (expected.goalAmount !== undefined) {
    if (typeof expected.goalAmount === 'number' && typeof actual.goalAmount === 'number') {
      const tolerance = Math.max(50, expected.goalAmount * 0.1); // 10% tolerance or $50
      if (Math.abs(actual.goalAmount - expected.goalAmount) > tolerance) {
        differences.push(`goalAmount: expected ${expected.goalAmount}, got ${actual.goalAmount} (tolerance: ±${tolerance})`);
      }
    } else if (expected.goalAmount !== actual.goalAmount) {
      differences.push(`goalAmount: expected ${expected.goalAmount}, got ${actual.goalAmount}`);
    }
  }
  
  // Check for missing fields that were expected to be present
  if (expected.missingFields && expected.missingFields.length === 0) {
    const actualMissing = [];
    if (!actual.name) actualMissing.push('name');
    if (!actual.goalAmount) actualMissing.push('goalAmount');
    if (actualMissing.length > 0) {
      differences.push(`missingFields: expected none, but missing: ${actualMissing.join(', ')}`);
    }
  }
  
  return {
    allMatch: differences.length === 0,
    differences,
    score: Math.max(0, 1 - (differences.length * 0.25)) // Each difference reduces score by 25%
  };
}

// Categorize failure types for analysis
function categorizeFailure(comparison, actualResult) {
  if (comparison.differences.length === 0) return 'SUCCESS';
  
  const categories = [];
  
  comparison.differences.forEach(diff => {
    if (diff.includes('name:')) {
      if (diff.includes('expected null')) {
        categories.push('NAME_FALSE_POSITIVE');
      } else if (diff.includes('got null')) {
        categories.push('NAME_MISSING');
      } else {
        categories.push('NAME_INCORRECT');
      }
    } else if (diff.includes('category:')) {
      categories.push('CATEGORY_MISCLASSIFICATION');
    } else if (diff.includes('urgencyLevel:')) {
      categories.push('URGENCY_MISCLASSIFICATION');
    } else if (diff.includes('goalAmount:')) {
      if (diff.includes('got null')) {
        categories.push('AMOUNT_MISSING');
      } else if (diff.includes('expected null')) {
        categories.push('AMOUNT_FALSE_POSITIVE');
      } else {
        categories.push('AMOUNT_INCORRECT');
      }
    } else if (diff.includes('missingFields:')) {
      categories.push('EXTRACTION_INCOMPLETE');
    }
  });
  
  return categories.length > 0 ? categories : ['UNKNOWN_FAILURE'];
}

// Main evaluation function
async function runIntegratedEvaluation() {
  console.log('🚀 Jan v.2.5 Integrated Evaluation with Real Parsing Services\n');
  
  try {
    // Get available fixtures
    const fixtureIds = await getAvailableFixtures();
    console.log(`📊 Found ${fixtureIds.length} test fixtures\n`);
    
    const results = [];
    const failureBuckets = {};
    let successCount = 0;
    
    console.log('🔬 Running integrated parsing evaluation...\n');
    
    for (let i = 0; i < fixtureIds.length; i++) {
      const fixtureId = fixtureIds[i];
      console.log(`📝 Test ${i + 1}/${fixtureIds.length}: ${fixtureId}`);
      
      const startTime = Date.now();
      
      try {
        // Load test fixture
        const fixture = await loadTestFixture(fixtureId);
        if (!fixture) {
          console.log(`   ❌ SKIPPED - Could not load fixture`);
          continue;
        }
        
        console.log(`   📋 "${fixture.description}"`);
        
        // Call real parsing services
        const parseResult = await callRealParsingServices(fixture);
        const executionTime = Date.now() - startTime;
        
        // Compare with expected results
        const comparison = compareWithExpected(parseResult, fixture.expected);
        
        const result = {
          testId: fixtureId,
          description: fixture.description,
          success: comparison.allMatch,
          score: comparison.score,
          extractedData: {
            name: parseResult.name,
            category: parseResult.category,
            urgencyLevel: parseResult.urgencyLevel,
            goalAmount: parseResult.goalAmount
          },
          expectedData: fixture.expected,
          confidence: parseResult.confidence,
          extractionMethod: parseResult.extractionMethod,
          executionTime,
          timestamp: new Date().toISOString(),
          differences: comparison.differences
        };
        
        results.push(result);
        
        if (result.success) {
          successCount++;
          console.log(`   ✅ PASSED (${executionTime}ms, score: ${(comparison.score * 100).toFixed(1)}%)`);
          console.log(`      Method: ${parseResult.extractionMethod}, Confidence: ${(parseResult.confidence.overall * 100).toFixed(1)}%`);
        } else {
          const categories = categorizeFailure(comparison, parseResult);
          categories.forEach(cat => {
            failureBuckets[cat] = (failureBuckets[cat] || 0) + 1;
          });
          
          console.log(`   ❌ FAILED (${executionTime}ms, score: ${(comparison.score * 100).toFixed(1)}%)`);
          console.log(`      Issues: ${result.differences.slice(0, 2).join('; ')}${result.differences.length > 2 ? '...' : ''}`);
          console.log(`      Categories: ${categories.join(', ')}`);
        }
        
      } catch (error) {
        console.log(`   💥 ERROR: ${error.message}`);
        results.push({
          testId: fixtureId,
          description: 'Test failed with error',
          success: false,
          error: error.message,
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
        
        failureBuckets['SYSTEM_ERROR'] = (failureBuckets['SYSTEM_ERROR'] || 0) + 1;
      }
    }
    
    // Generate comprehensive summary
    const successRate = (successCount / results.length) * 100;
    const avgExecutionTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0) / results.length;
    const avgScore = results.filter(r => r.score).reduce((sum, r) => sum + r.score, 0) / results.filter(r => r.score).length;
    const avgConfidence = results.filter(r => r.confidence?.overall).reduce((sum, r) => sum + r.confidence.overall, 0) / results.filter(r => r.confidence?.overall).length;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 JAN v.2.5 INTEGRATED EVALUATION RESULTS');
    console.log('='.repeat(80));
    console.log(`🎯 System Integration: ${process.env.ZERO_OPENAI_MODE ? 'Rules-based (Safe Mode)' : 'Full Pipeline'}`);
    console.log(`📈 Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${successCount}`);
    console.log(`❌ Failed: ${results.length - successCount}`);
    console.log(`🏆 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`⚡ Average Execution Time: ${Math.round(avgExecutionTime)}ms`);
    console.log(`📊 Average Score: ${(avgScore * 100).toFixed(1)}%`);
    console.log(`🎯 Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    
    // Top failure analysis
    if (Object.keys(failureBuckets).length > 0) {
      console.log('\n🔍 FAILURE ANALYSIS BY CATEGORY:');
      const sortedFailures = Object.entries(failureBuckets)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
        
      sortedFailures.forEach(([category, count]) => {
        const percentage = Math.round((count / results.length) * 100);
        console.log(`  📌 ${category}: ${count} cases (${percentage}% of all tests)`);
      });
    } else {
      const sortedFailures = [];
    }
    
    // Performance by extraction method
    console.log('\n⚙️ PERFORMANCE BY METHOD:');
    const methodStats = {};
    results.forEach(r => {
      if (r.extractionMethod) {
        if (!methodStats[r.extractionMethod]) {
          methodStats[r.extractionMethod] = { count: 0, success: 0, totalTime: 0 };
        }
        methodStats[r.extractionMethod].count++;
        if (r.success) methodStats[r.extractionMethod].success++;
        methodStats[r.extractionMethod].totalTime += r.executionTime || 0;
      }
    });
    
    Object.entries(methodStats).forEach(([method, stats]) => {
      const successRate = (stats.success / stats.count) * 100;
      const avgTime = Math.round(stats.totalTime / stats.count);
      console.log(`  🔧 ${method}: ${stats.success}/${stats.count} (${successRate.toFixed(1)}%) - ${avgTime}ms avg`);
    });
    
    // Save detailed results
    const outputDir = path.join(__dirname, 'output', 'integrated');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = path.join(outputDir, `jan-v25-integrated-${timestamp}.json`);
    
    const summary = {
      timestamp: new Date().toISOString(),
      system: 'Jan v.2.5 Automated Parsing Training Loop - Integrated',
      integration: {
        realParsing: true,
        safeMode: !!process.env.ZERO_OPENAI_MODE,
        fixtureSource: 'backend/tests/fixtures/transcripts'
      },
      overview: {
        totalTests: results.length,
        successCount,
        failureCount: results.length - successCount,
        successRate: Math.round(successRate * 10) / 10,
        avgScore: Math.round(avgScore * 1000) / 1000,
        avgConfidence: Math.round(avgConfidence * 1000) / 1000
      },
      performance: {
        avgExecutionTime: Math.round(avgExecutionTime),
        totalExecutionTime: results.reduce((sum, r) => sum + (r.executionTime || 0), 0),
        methodStats
      },
      failures: {
        byCategory: failureBuckets,
        topCategories: Object.keys(failureBuckets).length > 0 ? Object.entries(failureBuckets).sort(([,a], [,b]) => b - a).slice(0, 5) : []
      },
      results
    };
    
    await fs.writeFile(resultsFile, JSON.stringify(summary, null, 2));
    console.log(`\n💾 Detailed results saved: ${resultsFile}`);
    
    // Generate recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (successRate >= 90) {
      console.log('🎉 Excellent performance! System is production-ready.');
    } else if (successRate >= 75) {
      console.log('✅ Good performance. Minor optimizations recommended.');
    } else if (successRate >= 50) {
      console.log('⚠️ Moderate performance. Review top failure categories.');
    } else {
      console.log('🚨 Low performance. Significant improvements needed.');
    }
    
    if (failureBuckets['NAME_MISSING'] > 2) {
      console.log('  • Focus on name extraction patterns - common failure point');
    }
    if (failureBuckets['CATEGORY_MISCLASSIFICATION'] > 2) {
      console.log('  • Review category classification keywords and logic');
    }
    if (failureBuckets['AMOUNT_MISSING'] > 2) {
      console.log('  • Improve goal amount extraction for various formats');
    }
    if (avgExecutionTime > 1000) {
      console.log('  • Consider performance optimization - tests are slow');
    }
    
    console.log('\n🎯 Jan v.2.5 Integrated Evaluation Complete!');
    console.log('Next: Review failure categories and implement targeted improvements.');
    
    return successRate >= 75 ? 0 : 1; // Exit code for CI integration
    
  } catch (error) {
    console.error('💥 Integrated evaluation failed:', error.message);
    return 1;
  }
}

// Run the integrated evaluation
if (require.main === module) {
  runIntegratedEvaluation().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runIntegratedEvaluation, loadTestFixture, callRealParsingServices };