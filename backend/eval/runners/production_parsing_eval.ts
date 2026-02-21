/**
 * Main evaluation runner - executes parsing tests and generates reports
 * Updated to use real parsing services via adapter layer with production safety controls
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { TestCase } from '../schemas/testCase';
import { EvaluationResult } from '../schemas/evaluationResult';
import { ParsingAdapter } from '../adapters/parsingAdapter';
import { enableNetworkBlocking, disableNetworkBlocking, withNetworkBlocking } from '../utils/noNetwork';
import { PiiScanner } from '../utils/piiScan';
import { DatasetValidator } from '../utils/datasetValidate';
import { PerformanceMonitor, EvaluationTimeoutManager, PERFORMANCE_BUDGETS, withPerformanceMonitoring } from '../utils/performanceBudget';
import { ArtifactGenerators, generateAllArtifacts } from '../utils/outputArtifacts';

interface EvaluationConfig {
  datasetPath: string;
  outputPath: string;
  maxConcurrency: number;
  timeoutMs: number;
  mode: 'development' | 'ci' | 'production';
  enableNetworkBlocking: boolean;
  enablePiiScanning: boolean;
  generateArtifacts: boolean;
}

const DEFAULT_CONFIG: EvaluationConfig = {
  datasetPath: './backend/eval/datasets/golden_dataset.jsonl',
  outputPath: './backend/eval/output',
  maxConcurrency: 2, // Reduced for production safety
  timeoutMs: 45000,  // Increased timeout for real service calls
  mode: (process.env.NODE_ENV as any) || 'development',
  enableNetworkBlocking: true,
  enablePiiScanning: true,
  generateArtifacts: true
};

/**
 * Real parsing call using production adapter layer
 * This now calls actual parsing services with safety controls
 */
async function executeParsingCall(testCase: TestCase, config: EvaluationConfig): Promise<any> {
  const adapter = new ParsingAdapter();
  
  try {
    // Use adapter to call real parsing services
    const result = await adapter.parseTestCase(testCase);
    
    return {
      fundraiserUrl: testCase.input.fundraiserUrl,
      extractedData: result.extractedData,
      confidence: result.confidence,
      extractionMethod: result.extractionMethod,
      processingTimeMs: result.processingTimeMs,
      version: result.version
    };
  } catch (error) {
    // Enhanced error context for debugging
    const enhancedError = new Error(
      `Production parsing failed for test ${testCase.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    
    // Preserve original error properties
    if (error instanceof Error) {
      (enhancedError as any).originalError = error;
      (enhancedError as any).stack = error.stack;
    }
    
    throw enhancedError;
  }
}

/**
 * Evaluates a single test case with full safety controls
 */
async function evaluateTestCase(
  testCase: TestCase,
  config: EvaluationConfig,
  piiScanner?: PiiScanner
): Promise<EvaluationResult> {
  const startTime = Date.now();
  let result: EvaluationResult;
  
  try {
    // Pre-execution PII scan if enabled
    if (piiScanner && config.enablePiiScanning) {
      const piiScanResult = await piiScanner.scanTestCase(testCase);
      if (piiScanResult.hasPii && piiScanResult.riskLevel === 'high') {
        throw new Error('High-risk PII detected in test case - execution blocked');
      }
    }

    // Execute parsing with performance monitoring
    const { result: parseResult, metrics } = await withPerformanceMonitoring(
      testCase.id,
      () => executeParsingCall(testCase, config),
      PERFORMANCE_BUDGETS[config.mode.toUpperCase()]
    );

    // Compare results with expected output
    const comparison = compareResults(parseResult.extractedData, testCase.expected);
    
    result = {
      testId: testCase.id,
      testCase: config.enablePiiScanning ? 
        await piiScanner?.redactTestCase(testCase) || testCase : 
        testCase,
      success: comparison.allMatch,
      extractedData: parseResult.extractedData,
      expectedData: testCase.expected,
      confidence: parseResult.confidence,
      extractionMethod: parseResult.extractionMethod,
      executionTime: metrics.executionTime,
      timestamp: new Date().toISOString(),
      error: comparison.allMatch ? undefined : {
        category: categorizeFailure(comparison, parseResult),
        message: generateErrorMessage(comparison),
        details: comparison.differences
      }
    };

  } catch (error) {
    // Handle execution failures
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    result = {
      testId: testCase.id,
      testCase: config.enablePiiScanning ? 
        await piiScanner?.redactTestCase(testCase) || testCase : 
        testCase,
      success: false,
      extractedData: null,
      expectedData: testCase.expected,
      confidence: 0,
      extractionMethod: 'failed',
      executionTime,
      timestamp: new Date().toISOString(),
      error: {
        category: determineErrorCategory(error),
        message: errorMessage,
        details: { originalError: error instanceof Error ? error.name : 'UnknownError' }
      }
    };
  }
  
  return result;
}

/**
 * Main evaluation execution function with full production safety
 */
async function runEvaluation(config: EvaluationConfig = DEFAULT_CONFIG): Promise<EvaluationResult[]> {
  console.log(`🚀 Starting parsing evaluation in ${config.mode} mode...`);
  
  // Initialize safety systems
  const piiScanner = config.enablePiiScanning ? new PiiScanner() : undefined;
  const validator = new DatasetValidator();
  
  try {
    // Enable network blocking if configured
    if (config.enableNetworkBlocking) {
      enableNetworkBlocking();
      console.log('🛡️ Network blocking enabled');
    }

    // Validate and load dataset
    console.log('📊 Loading and validating dataset...');
    const datasetValid = await validator.validateDatasetFile(config.datasetPath);
    if (!datasetValid.isValid) {
      throw new Error(`Dataset validation failed: ${datasetValid.errors.join(', ')}`);
    }

    const datasetContent = await readFile(config.datasetPath, 'utf-8');
    const testCases: TestCase[] = datasetContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    console.log(`📋 Loaded ${testCases.length} test cases`);

    // Initialize global timeout management
    const globalTimeout = new EvaluationTimeoutManager(testCases.length, PERFORMANCE_BUDGETS[config.mode.toUpperCase()]);
    globalTimeout.start();

    // Execute test cases with controlled concurrency
    const results: EvaluationResult[] = [];
    const concurrencyLimit = Math.min(config.maxConcurrency, testCases.length);
    
    console.log(`⚡ Running evaluation with concurrency limit: ${concurrencyLimit}`);
    
    for (let i = 0; i < testCases.length; i += concurrencyLimit) {
      const batch = testCases.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(testCase => 
        evaluateTestCase(testCase, config, piiScanner)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Progress reporting
      const completed = results.length;
      const successCount = results.filter(r => r.success).length;
      const successRate = (successCount / completed) * 100;
      
      console.log(`📈 Progress: ${completed}/${testCases.length} (${successRate.toFixed(1)}% success rate)`);
    }

    globalTimeout.stop();

    // Final results summary
    const finalSuccessCount = results.filter(r => r.success).length;
    const finalSuccessRate = (finalSuccessCount / results.length) * 100;
    
    console.log(`✅ Evaluation complete: ${finalSuccessCount}/${results.length} tests passed (${finalSuccessRate.toFixed(1)}%)`);

    return results;

  } catch (error) {
    console.error('❌ Evaluation failed:', error instanceof Error ? error.message : error);
    throw error;
  } finally {
    // Cleanup safety systems
    if (config.enableNetworkBlocking) {
      disableNetworkBlocking();
      console.log('🛡️ Network blocking disabled');
    }
  }
}

/**
 * Saves evaluation results with proper error handling
 */
async function saveResults(results: EvaluationResult[], outputPath: string, mode: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = join(outputPath, mode);
  
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });
  
  // Save raw results as JSONL
  const resultsPath = join(outputDir, 'results.jsonl');
  const jsonlContent = results.map(result => JSON.stringify(result)).join('\n');
  await writeFile(resultsPath, jsonlContent, 'utf-8');
  
  // Save summary JSON
  const summary = generateSummary(results);
  const summaryPath = join(outputDir, `summary-${timestamp}.json`);
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
  
  console.log(`💾 Results saved to ${outputDir}`);
}

/**
 * Generates evaluation summary statistics
 */
function generateSummary(results: EvaluationResult[]): any {
  const totalTests = results.length;
  const successCount = results.filter(r => r.success).length;
  const failureCount = totalTests - successCount;
  
  // Failure categorization
  const failuresByCategory: Record<string, number> = {};
  results
    .filter(r => !r.success && r.error)
    .forEach(result => {
      const category = result.error!.category;
      failuresByCategory[category] = (failuresByCategory[category] || 0) + 1;
    });

  // Performance statistics
  const executionTimes = results.map(r => r.executionTime || 0);
  const avgExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
  const maxExecutionTime = Math.max(...executionTimes);
  const minExecutionTime = Math.min(...executionTimes);

  // Confidence statistics for successful tests
  const successfulResults = results.filter(r => r.success);
  const avgConfidence = successfulResults.length > 0 ? 
    successfulResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / successfulResults.length : 0;

  return {
    timestamp: new Date().toISOString(),
    overview: {
      totalTests,
      successCount,
      failureCount,
      successRate: Math.round((successCount / totalTests) * 100 * 10) / 10
    },
    performance: {
      avgExecutionTime: Math.round(avgExecutionTime),
      maxExecutionTime,
      minExecutionTime,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    },
    failures: {
      byCategory: failuresByCategory,
      topCategories: Object.entries(failuresByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count, percentage: Math.round((count / totalTests) * 100) }))
    }
  };
}

/**
 * Compares parsing results with expected output
 */
function compareResults(actual: any, expected: any): { allMatch: boolean; differences: string[] } {
  const differences: string[] = [];
  
  // Compare each expected field
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[key];
    
    if (actualValue === undefined || actualValue === null) {
      differences.push(`Missing field: ${key}`);
    } else if (typeof expectedValue === 'number' && typeof actualValue === 'number') {
      // Numeric comparison with tolerance
      const tolerance = 0.01;
      if (Math.abs(actualValue - expectedValue) > tolerance) {
        differences.push(`${key}: expected ${expectedValue}, got ${actualValue}`);
      }
    } else if (actualValue !== expectedValue) {
      differences.push(`${key}: expected "${expectedValue}", got "${actualValue}"`);
    }
  }
  
  return {
    allMatch: differences.length === 0,
    differences
  };
}

/**
 * Categorizes parsing failures for analysis
 */
function categorizeFailure(comparison: any, parseResult: any): string {
  if (comparison.differences.some((d: string) => d.includes('Missing field'))) {
    return 'EXTRACTION_INCOMPLETE';
  }
  
  if (comparison.differences.some((d: string) => d.includes('goalAmount'))) {
    return 'GOAL_EXTRACTION_FAILED';
  }
  
  if (comparison.differences.some((d: string) => d.includes('organizer'))) {
    return 'ORGANIZER_EXTRACTION_FAILED';
  }
  
  if (parseResult.confidence < 0.5) {
    return 'LOW_CONFIDENCE';
  }
  
  return 'EXTRACTION_ERROR';
}

/**
 * Determines error category from exceptions
 */
function determineErrorCategory(error: any): string {
  if (error?.message?.includes('timeout')) {
    return 'EXECUTION_TIMEOUT';
  }
  
  if (error?.message?.includes('network') || error?.message?.includes('NETWORK_')) {
    return 'NETWORK_ERROR';
  }
  
  if (error?.message?.includes('PII')) {
    return 'PII_VIOLATION';
  }
  
  if (error?.code === 'EVAL_TIMEOUT') {
    return 'PERFORMANCE_TIMEOUT';
  }
  
  if (error?.code === 'EVAL_MEMORY_EXCEEDED') {
    return 'MEMORY_EXCEEDED';
  }
  
  return 'SYSTEM_ERROR';
}

/**
 * Generates human-readable error message
 */
function generateErrorMessage(comparison: any): string {
  if (comparison.differences.length === 0) {
    return 'No errors detected';
  }
  
  const errorCount = comparison.differences.length;
  const sample = comparison.differences.slice(0, 3).join('; ');
  
  if (errorCount <= 3) {
    return sample;
  } else {
    return `${sample}... (${errorCount - 3} more differences)`;
  }
}

/**
 * Main entry point for evaluation
 */
async function main() {
  try {
    const config: EvaluationConfig = {
      ...DEFAULT_CONFIG,
      mode: (process.env.EVALUATION_MODE as any) || DEFAULT_CONFIG.mode,
      enableNetworkBlocking: process.env.NETWORK_BLOCKING !== 'false',
      enablePiiScanning: process.env.PII_SCANNING !== 'false',
      generateArtifacts: process.env.GENERATE_ARTIFACTS !== 'false'
    };
    
    console.log('🔧 Configuration:', {
      mode: config.mode,
      networkBlocking: config.enableNetworkBlocking,
      piiScanning: config.enablePiiScanning,
      generateArtifacts: config.generateArtifacts
    });
    
    // Run evaluation
    const results = await runEvaluation(config);
    
    // Save results
    await saveResults(results, config.outputPath, config.mode);
    
    // Generate artifacts if enabled
    if (config.generateArtifacts) {
      console.log('📋 Generating output artifacts...');
      const artifactFiles = await generateAllArtifacts(
        results, 
        join(config.outputPath, config.mode)
      );
      console.log(`✅ Generated ${artifactFiles.length} artifact files`);
    }
    
    // Success exit
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;
    
    if (successRate >= 80) {
      console.log(`🎉 Evaluation passed with ${successRate.toFixed(1)}% success rate`);
      process.exit(0);
    } else {
      console.log(`⚠️ Evaluation completed with ${successRate.toFixed(1)}% success rate (below 80% threshold)`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Evaluation runner failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { runEvaluation, evaluateTestCase, EvaluationConfig };
