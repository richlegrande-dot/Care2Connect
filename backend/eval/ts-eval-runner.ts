/**
 * TypeScript Evaluation Runner with Real Parsing Services
 * Direct imports of TypeScript modules for proper integration
 */

import { readFile, readdir, mkdir, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { extractSignals, TranscriptInput, ExtractedSignals } from '../src/services/speechIntelligence/transcriptSignalExtractor.js';
import { StoryExtractionService, ExtractionResult } from '../src/services/storyExtractionService.js';

interface TestFixture {
  id: string;
  description: string;
  transcriptText: string;
  segments?: any[];
  expected: {
    name?: string | null;
    category?: string;
    needsCategories?: string | string[];
    urgencyLevel?: string;
    goalAmount?: number | null;
    missingFields?: string[];
  };
}

interface EvaluationResult {
  testId: string;
  description: string;
  success: boolean;
  score: number;
  extractedData: {
    name: string | null;
    category: string;
    urgencyLevel: string;
    goalAmount: number | null;
  };
  expectedData: any;
  confidence: any;
  extractionMethod: string;
  executionTime: number;
  differences: string[];
}

// Load test fixture
async function loadTestFixture(fixtureId: string): Promise<TestFixture | null> {
  try {
    const fixturePath = join(process.cwd(), 'backend/tests/fixtures/transcripts', `${fixtureId}.json`);
    const content = await readFile(fixturePath, 'utf-8');
    return JSON.parse(content) as TestFixture;
  } catch (error) {
    console.error(`Failed to load fixture ${fixtureId}:`, (error as Error).message);
    return null;
  }
}

// Get available fixtures
async function getAvailableFixtures(): Promise<string[]> {
  const fixturesDir = join(process.cwd(), 'backend/tests/fixtures/transcripts');
  try {
    const files = await readdir(fixturesDir);
    return files
      .filter(f => f.endsWith('.json') && !f.includes('pipeline'))
      .map(f => f.replace('.json', ''))
      .slice(0, 10); // Limit for testing
  } catch (error) {
    console.error('Failed to read fixtures directory:', (error as Error).message);
    return [];
  }
}

// Call real parsing services
async function callRealParsingServices(fixture: TestFixture): Promise<any> {
  try {
    console.log('   🔧 Using real parsing services...');
    
    // Prepare transcript input
    const transcriptInput: TranscriptInput = {
      text: fixture.transcriptText,
      segments: fixture.segments || []
    };
    
    // Extract signals using real service
    const signals: ExtractedSignals = await extractSignals(transcriptInput);
    console.log('   📡 Signals extracted:', {
      name: signals.nameCandidate,
      goalAmount: signals.goalAmount,
      urgencyLevel: signals.urgencyLevel,
      categories: signals.needsCategories.length
    });
    
    // Extract story using real service
    let storyResult: ExtractionResult | null = null;
    try {
      const storyService = new StoryExtractionService();
      storyResult = await storyService.extractGoFundMeData(fixture.transcriptText);
      console.log('   📖 Story extracted with confidence:', storyResult.confidence);
    } catch (error) {
      console.warn('   ⚠️ Story extraction failed, using signals only:', (error as Error).message);
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
    console.error('   💥 Real parsing services failed:', (error as Error).message);
    throw error;
  }
}

// Compare results with expected values
function compareWithExpected(actual: any, expected: any): { allMatch: boolean; differences: string[]; score: number } {
  const differences: string[] = [];
  
  // Name comparison
  if (expected.name !== undefined) {
    if (expected.name === null && actual.name !== null) {
      differences.push(`name: expected null, got "${actual.name}"`);
    } else if (expected.name !== null && actual.name !== expected.name) {
      differences.push(`name: expected "${expected.name}", got "${actual.name}"`);
    }
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
      const tolerance = Math.max(50, expected.goalAmount * 0.1);
      if (Math.abs(actual.goalAmount - expected.goalAmount) > tolerance) {
        differences.push(`goalAmount: expected ${expected.goalAmount}, got ${actual.goalAmount} (tolerance: ±${tolerance})`);
      }
    } else if (expected.goalAmount !== actual.goalAmount) {
      differences.push(`goalAmount: expected ${expected.goalAmount}, got ${actual.goalAmount}`);
    }
  }
  
  return {
    allMatch: differences.length === 0,
    differences,
    score: Math.max(0, 1 - (differences.length * 0.25))
  };
}

// Main evaluation function
async function runTypeScriptEvaluation(): Promise<number> {
  console.log('🚀 Jan v.2.5 TypeScript Evaluation with Real Parsing Services\n');
  
  try {
    const fixtureIds = await getAvailableFixtures();
    console.log(`📊 Found ${fixtureIds.length} test fixtures\n`);
    
    const results: EvaluationResult[] = [];
    let successCount = 0;
    
    for (let i = 0; i < fixtureIds.length; i++) {
      const fixtureId = fixtureIds[i];
      console.log(`📝 Test ${i + 1}/${fixtureIds.length}: ${fixtureId}`);
      
      const startTime = Date.now();
      
      try {
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
        
        const result: EvaluationResult = {
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
          differences: comparison.differences
        };
        
        results.push(result);
        
        if (result.success) {
          successCount++;
          console.log(`   ✅ PASSED (${executionTime}ms, score: ${(comparison.score * 100).toFixed(1)}%)`);
          console.log(`      Method: ${parseResult.extractionMethod}, Confidence: ${(parseResult.confidence.overall * 100).toFixed(1)}%`);
        } else {
          console.log(`   ❌ FAILED (${executionTime}ms, score: ${(comparison.score * 100).toFixed(1)}%)`);
          console.log(`      Issues: ${result.differences.slice(0, 2).join('; ')}`);
        }
        
      } catch (error) {
        console.log(`   💥 ERROR: ${(error as Error).message}`);
        const executionTime = Date.now() - startTime;
        
        results.push({
          testId: fixtureId,
          description: 'Test failed with error',
          success: false,
          score: 0,
          extractedData: { name: null, category: 'ERROR', urgencyLevel: 'LOW', goalAmount: null },
          expectedData: {},
          confidence: { overall: 0 },
          extractionMethod: 'error',
          executionTime,
          differences: [`error: ${(error as Error).message}`]
        });
      }
    }
    
    // Generate summary
    const successRate = (successCount / results.length) * 100;
    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 TYPESCRIPT EVALUATION RESULTS');
    console.log('='.repeat(80));
    console.log(`📈 Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${successCount}`);
    console.log(`❌ Failed: ${results.length - successCount}`);
    console.log(`🏆 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`⚡ Average Execution Time: ${Math.round(avgExecutionTime)}ms`);
    console.log(`📊 Average Score: ${(avgScore * 100).toFixed(1)}%`);
    
    // Save results
    const outputDir = join(process.cwd(), 'backend/eval/output/integrated');
    await mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = join(outputDir, `typescript-eval-${timestamp}.json`);
    
    const summary = {
      timestamp: new Date().toISOString(),
      system: 'Jan v.2.5 TypeScript Real Parsing Integration',
      overview: {
        totalTests: results.length,
        successCount,
        successRate: Math.round(successRate * 10) / 10,
        avgScore: Math.round(avgScore * 1000) / 1000
      },
      performance: {
        avgExecutionTime: Math.round(avgExecutionTime)
      },
      results
    };
    
    await writeFile(resultsFile, JSON.stringify(summary, null, 2));
    console.log(`\n💾 Detailed results saved: ${resultsFile}`);
    
    console.log('\n🎯 TypeScript evaluation complete!');
    return successRate >= 70 ? 0 : 1;
    
  } catch (error) {
    console.error('💥 TypeScript evaluation failed:', (error as Error).message);
    return 1;
  }
}

// Execute
runTypeScriptEvaluation().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});