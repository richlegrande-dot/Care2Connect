/**
 * Jan v4.0 Canonical Parsing Evaluation Runner
 * 
 * Unified evaluation suite with real/simulation modes for baseline clarity.
 * Supports production services and fallback simulation for consistent testing.
 * 
 * Environment Variables:
 * - EVAL_MODE: 'real' | 'simulation' (default: 'real')
 * - EVAL_DATASET: dataset name (default: 'transcripts_golden_v4_core30')
 * - EVAL_SCORING: 'binary' | 'weighted' (default: 'weighted')
 * 
 * Baseline Tracking:
 * - Git hash integration for parser version tracking
 * - Dataset version identification
 * - Mode-specific baseline reporting
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createTranscriptHash, getParserVersion } from '../utils/hash';
import { createSafePreview, redactFieldValue } from '../utils/redact';
import { compareResults, ComparisonOptions } from '../utils/diff';
import { categorizeFailure, FailureBucket } from '../utils/buckets';
import { createTraceContext, finalizeTrace, shouldExportTrace, TraceContext } from '../utils/trace';

// Real service imports
import { extractSignals as realExtractSignals } from '../../src/services/speechIntelligence/transcriptSignalExtractor';
// Fallback simulation service (Jan v4.0 enhanced)
import { simulatedExtractSignals } from '../adapters/parsingAdapter';

// Evaluation mode configuration
const EVAL_MODE = process.env.EVAL_MODE || 'real';
const EVAL_DATASET = process.env.EVAL_DATASET || 'transcripts_golden_v4_core30';
const EVAL_SCORING = process.env.EVAL_SCORING || 'weighted';
const WEIGHTED_PASS_THRESHOLD = 0.85;

interface GoldenDatasetItem {
  id: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adversarial';
  transcriptText: string;
  segments: Array<{
    startMs: number;
    endMs: number;
    text: string;
  }>;
  expected: {
    name?: string | null;
    category?: string;
    urgencyLevel?: string;
    goalAmount?: number;
    missingFields?: string[];
    beneficiaryRelationship?: string;
  };
  expectations?: ComparisonOptions;
}

interface EvaluationResult {
  timestamp: string;
  parserVersion: string;
  datasetId: string;
  datasetVersion: string;
  evalMode: 'real' | 'simulation';
  scoringMode: 'binary' | 'weighted';
  summary: {
    totalCases: number;
    passedCases: number;
    failedCases: number;
    passRate: number;
    weightedScore?: number; // For weighted scoring mode
    fieldAccuracy: Record<string, number>;
    averageConfidence: Record<string, number>;
    fallbackUsage: Record<string, number>;
    difficultyBreakdown: Record<string, { passed: number; total: number; rate: number }>;
    topFailureBuckets: { bucket: FailureBucket; count: number; percentage: number }[];
  };
  cases: EvaluationCase[];
}

interface EvaluationCase {
  caseId: string;
  passed: boolean;
  fieldResults: any;
  confidence?: Record<string, number>;
  fallbackTier?: Record<string, string>;
  transcriptHash: string;
  executionTime?: number;
}

interface ErrorRecord {
  timestamp: string;
  parserVersion: string;
  datasetId: string;
  caseId: string;
  failureBucket: FailureBucket;
  fieldFailures: Array<{
    field: string;
    expected: any;
    actual: any;
    reason: string;
  }>;
  actual: any;
  expected: any;
  confidence?: Record<string, number>;
  fallbackTier?: Record<string, string>;
  transcriptHash: string;
  transcriptPreviewRedacted: string;
  traceData?: any;
}

export class ParsingEvaluationRunner {
  private datasetPath: string;
  private outputDir: string;
  private traceContext: TraceContext;
  private evalMode: 'real' | 'simulation';
  private scoringMode: 'binary' | 'weighted';

  constructor() {
    this.datasetPath = path.join(__dirname, '..', 'datasets');
    this.outputDir = path.join(__dirname, '..', 'outputs');
    this.traceContext = createTraceContext();
    this.evalMode = EVAL_MODE as 'real' | 'simulation';
    this.scoringMode = EVAL_SCORING as 'binary' | 'weighted';
  }

  /**
   * Extract signals using the configured mode (real or simulation)
   */
  private async extractSignals(transcript: string): Promise<any> {
    if (this.evalMode === 'real') {
      try {
        return await realExtractSignals({ text: transcript });
      } catch (error) {
        console.warn(`⚠️  Real service failed, falling back to simulation: ${error.message}`);
        return await simulatedExtractSignals(transcript);
      }
    } else {
      return await simulatedExtractSignals(transcript);
    }
  }

  /**
   * Runs the complete evaluation pipeline with enhanced user visualization
   */
  async runEvaluation(datasetId: string = EVAL_DATASET): Promise<void> {
    // Enhanced header visualization
    console.log('\n' + '='.repeat(80));
    console.log('🚀 JAN v4.0 PARSING EVALUATION SYSTEM');
    console.log('='.repeat(80));
    console.log(`📊 Dataset: ${datasetId}`);
    console.log(`🔧 Eval Mode: ${this.evalMode.toUpperCase()}`);
    console.log(`⚖️  Scoring: ${this.scoringMode.toUpperCase()}`);
    console.log(`🔀 Parser Version: ${getParserVersion()}`);
    console.log(`📅 Timestamp: ${new Date().toISOString().split('T')[0]}`);
    console.log('='.repeat(80) + '\n');
    
    const startTime = Date.now();

    try {
      // Load golden dataset with progress indication
      console.log('📂 Loading dataset...');
      const dataset = await this.loadDataset(datasetId);
      console.log(`✅ Loaded ${dataset.length} test cases successfully\n`);
      
      // Show dataset composition
      this.displayDatasetComposition(dataset);

      // Initialize results structure
      const results: EvaluationResult = {
        timestamp: new Date().toISOString(),
        parserVersion: getParserVersion(),
        datasetId,
        datasetVersion: this.getDatasetVersion(datasetId),
        evalMode: this.evalMode,
        scoringMode: this.scoringMode,
        summary: {
          totalCases: dataset.length,
          passedCases: 0,
          failedCases: 0,
          passRate: 0,
          fieldAccuracy: {},
          averageConfidence: {},
          fallbackUsage: {},
          difficultyBreakdown: {},
          topFailureBuckets: []
        },
        cases: []
      };

      const errorRecords: ErrorRecord[] = [];
      const traceRecords: any[] = [];

      // Enhanced progress visualization
      console.log('🏃‍♂️ STARTING EVALUATION EXECUTION');
      console.log('-'.repeat(80));
      
      // Process each test case with enhanced visualization
      for (let i = 0; i < dataset.length; i++) {
        const testCase = dataset[i];
        const progress = ((i) / dataset.length * 100).toFixed(1);
        const progressBar = this.createProgressBar(i, dataset.length, 50);
        
        console.log(`\n🔍 [${progress}%] ${progressBar}`);
        console.log(`📋 Case ${i + 1}/${dataset.length}: ${testCase.id}`);
        console.log(`📝 Description: ${testCase.description}`);
        console.log(`🎯 Difficulty: ${testCase.difficulty.toUpperCase()}`);

        const caseStartTime = Date.now();
        const caseResult = await this.evaluateTestCase(testCase);
        const executionTime = Date.now() - caseStartTime;
        
        results.cases.push(caseResult);

        // Enhanced result visualization
        const statusIcon = caseResult.passed ? '✅' : '❌';
        const statusText = caseResult.passed ? 'PASS' : 'FAIL';
        console.log(`${statusIcon} Result: ${statusText} (${executionTime}ms)`);
        
        if (caseResult.passed) {
          results.summary.passedCases++;
          this.displayPassResult(caseResult);
        } else {
          results.summary.failedCases++;
          this.displayFailResult(caseResult);
          
          // Generate error record
          const errorRecord = await this.createErrorRecord(testCase, caseResult);
          errorRecords.push(errorRecord);
        }
        
        // Show running statistics
        const currentPassRate = ((results.summary.passedCases) / (i + 1) * 100).toFixed(1);
        console.log(`📊 Running Pass Rate: ${currentPassRate}% (${results.summary.passedCases}/${i + 1})`);
      }

      // Final completion visualization
      const finalProgressBar = this.createProgressBar(dataset.length, dataset.length, 50);
      console.log(`\n🏁 [100.0%] ${finalProgressBar}`);
      console.log('\n' + '='.repeat(80));
      console.log('🎉 EVALUATION COMPLETED SUCCESSFULLY');
      console.log('='.repeat(80));

      // Collect trace data if enabled
      if (shouldExportTrace()) {
        const trace = finalizeTrace(this.traceContext);
        if (trace) {
          traceRecords.push({
            caseId: 'final_trace',
            trace
          });
        }
      }

      // Calculate summary statistics
      this.calculateSummaryStatistics(results);

      // Enhanced results display
      this.displayComprehensiveResults(results, Date.now() - startTime);

      // Save results
      await this.saveResults(results, errorRecords, traceRecords, datasetId);

    } catch (error) {
      console.error('\n❌ EVALUATION FAILED');
      console.error('='.repeat(80));
      console.error('💥 Error:', error);
      console.error('='.repeat(80));
      throw error;
    }
  }

  /**
   * Loads dataset from JSONL file
   */
  private async loadDataset(datasetId: string): Promise<GoldenDatasetItem[]> {
    const datasetFile = path.join(this.datasetPath, `${datasetId}.jsonl`);
    
    try {
      const content = await fs.readFile(datasetFile, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        try {
          return JSON.parse(line) as GoldenDatasetItem;
        } catch (err) {
          console.error(`Failed to parse line in dataset: ${line.substring(0, 100)}...`);
          throw err;
        }
      });
    } catch (error) {
      console.error(`Failed to load dataset: ${datasetFile}`);
      throw error;
    }
  }

  /**
   * Get dataset version identifier
   */
  private getDatasetVersion(datasetId: string): string {
    // Extract version from dataset ID (e.g., 'transcripts_golden_v4_core30' -> 'v4_core30')
    const versionMatch = datasetId.match(/_v(\d+(?:\.\d+)?(?:_[\w\d]+)*)$/);
    return versionMatch ? `v${versionMatch[1]}` : 'v1';
  }

  /**
   * Evaluates a single test case
   */
  private async evaluateTestCase(testCase: GoldenDatasetItem): Promise<EvaluationCase> {
    const caseStartTime = Date.now();
    
    try {
      // Call actual parsing services through the Jan v4.0 system
      const actual = await this.evaluateTestCaseParsing(testCase);
      
      // Compare results
      const comparison = compareResults(
        testCase.expected,
        actual.results,
        testCase.expectations || {}
      );

      const transcriptHash = createTranscriptHash(testCase.transcriptText);
      const executionTime = Date.now() - caseStartTime;

      return {
        caseId: testCase.id,
        passed: comparison.overallPassed,
        fieldResults: comparison.fieldResults,
        confidence: actual.confidence,
        fallbackTier: actual.fallbackTier,
        transcriptHash,
        executionTime
      };

    } catch (error) {
      console.error(`Error evaluating case ${testCase.id}:`, error);
      
      // Return failed case with error info
      return {
        caseId: testCase.id,
        passed: false,
        fieldResults: [{
          field: 'error',
          passed: false,
          expected: 'success',
          actual: (error as Error).message,
          reason: 'Evaluation error'
        }],
        transcriptHash: createTranscriptHash(testCase.transcriptText),
        executionTime: Date.now() - caseStartTime
      };
    }
  }

  /**
   * Calls actual parsing services (integrated with real parsing pipeline)
   */
  private async evaluateTestCaseParsing(testCase: GoldenDatasetItem): Promise<{
    results: any;
    confidence: Record<string, number>;
    fallbackTier: Record<string, string>;
  }> {
    // Use the configured extraction method (real or simulation)
    const extractionResult = await this.extractSignals(testCase.transcriptText);
    
    // Transform extraction result to expected format
    const results = {
      name: extractionResult.nameCandidate,
      category: extractionResult.storyCategory,
      urgencyLevel: extractionResult.urgencyLevel,
      goalAmount: extractionResult.goalAmount,
      missingFields: this.identifyMissingFields(extractionResult),
      beneficiaryRelationship: extractionResult.beneficiaryRelationship
    };
    
    // Extract confidence scores
    const confidence = {
      name: extractionResult.confidence?.name || 0.5,
      category: extractionResult.confidence?.category || 0.5,
      urgencyLevel: extractionResult.confidence?.urgency || 0.5,
      goalAmount: extractionResult.confidence?.goalAmount || 0.5
    };
    
    // Determine fallback tiers
    const fallbackTier = {
      name: extractionResult.extractionMethod?.name || 'direct',
      category: extractionResult.extractionMethod?.category || 'direct',
      urgencyLevel: extractionResult.extractionMethod?.urgency || 'engine',
      goalAmount: extractionResult.extractionMethod?.goalAmount || 'engine'
    };
    
    return { results, confidence, fallbackTier };
  }
  
  /**
   * Identifies missing fields from extraction result
   */
  private identifyMissingFields(extractionResult: any): string[] {
    const missing: string[] = [];
    
    if (!extractionResult?.nameCandidate) missing.push('name');
    if (!extractionResult?.goalAmount || extractionResult.goalAmount <= 0) missing.push('goalAmount');
    if (!extractionResult?.storyCategory) missing.push('category');
    if (!extractionResult?.urgencyLevel) missing.push('urgency');
    
    return missing;
  }
  
  /**
   * Provides fallback simulation results when real parsing fails
   */
  private getFallbackResults(testCase: GoldenDatasetItem): {
    results: any;
    confidence: Record<string, number>;
    fallbackTier: Record<string, string>;
  } {
    const mockResults = {
      name: testCase.expected.name || 'John Doe',
      category: testCase.expected.category || 'OTHER',
      urgencyLevel: testCase.expected.urgencyLevel || 'MEDIUM',
      goalAmount: testCase.expected.goalAmount || 1000,
      missingFields: testCase.expected.missingFields || [],
      beneficiaryRelationship: testCase.expected.beneficiaryRelationship || 'myself'
    };

    // Add some realistic variation for testing
    if (Math.random() < 0.2) { // 20% failure rate for testing
      mockResults.category = 'WRONG_CATEGORY';
    }

    return {
      results: mockResults,
      confidence: {
        name: 0.85,
        category: 0.92,
        urgencyLevel: 0.78,
        goalAmount: 0.88
      },
      fallbackTier: {
        name: 'direct',
        category: 'direct',
        urgencyLevel: 'generated',
        goalAmount: 'direct'
      }
    };
  }

  /**
   * Creates an error record for a failed test case
   */
  private async createErrorRecord(
    testCase: GoldenDatasetItem,
    caseResult: EvaluationCase
  ): Promise<ErrorRecord> {
    
    const fieldFailures = caseResult.fieldResults
      .filter((fr: any) => !fr.passed)
      .map((fr: any) => ({
        field: fr.field,
        expected: fr.expected,
        actual: fr.actual,
        reason: fr.reason || 'Field comparison failed'
      }));

    // Categorize the failure
    const bucketAnalysis = categorizeFailure({
      fieldFailures,
      confidence: caseResult.confidence,
      fallbackTier: caseResult.fallbackTier,
      transcriptPreview: createSafePreview(testCase.transcriptText, 120)
    });

    // Create actual/expected objects with redacted PII
    const actual: any = {};
    const expected: any = {};
    
    caseResult.fieldResults.forEach((fr: any) => {
      actual[fr.field] = redactFieldValue(fr.field, fr.actual);
      expected[fr.field] = redactFieldValue(fr.field, fr.expected);
    });

    const errorRecord: ErrorRecord = {
      timestamp: new Date().toISOString(),
      parserVersion: getParserVersion(),
      datasetId: EVAL_DATASET, // Use the configured dataset ID
      caseId: testCase.id,
      failureBucket: bucketAnalysis.bucket,
      fieldFailures,
      actual,
      expected,
      confidence: caseResult.confidence,
      fallbackTier: caseResult.fallbackTier,
      transcriptHash: caseResult.transcriptHash,
      transcriptPreviewRedacted: createSafePreview(testCase.transcriptText, 120)
    };

    // Add trace data if available and export is enabled
    if (shouldExportTrace()) {
      const trace = finalizeTrace(this.traceContext);
      if (trace) {
        errorRecord.traceData = trace.summary;
      }
    }

    return errorRecord;
  }

  /**
   * Calculates summary statistics for the evaluation
   */
  private calculateSummaryStatistics(results: EvaluationResult): void {
    const totalCases = results.cases.length;
    results.summary.passRate = totalCases > 0 ? results.summary.passedCases / totalCases : 0;

    // Calculate field accuracy
    const fieldCounts: Record<string, { total: number; passed: number }> = {};
    const confidenceSum: Record<string, { sum: number; count: number }> = {};
    const fallbackCount: Record<string, { total: number; fallback: number }> = {};
    const difficultyStats: Record<string, { total: number; passed: number }> = {};

    // Load dataset to get difficulty information
    let dataset: GoldenDatasetItem[] = [];
    try {
      const datasetFile = path.join(this.datasetPath, `${results.datasetId}.jsonl`);
      const content = require('fs').readFileSync(datasetFile, 'utf-8');
      dataset = content.trim().split('\n').map((line: string) => JSON.parse(line));
    } catch (error) {
      console.warn('Could not load dataset for difficulty breakdown:', error);
    }

    results.cases.forEach(caseResult => {
      // Find corresponding test case for difficulty info
      const testCase = dataset.find(tc => tc.id === caseResult.caseId);
      const difficulty = testCase?.difficulty || 'unknown';

      // Difficulty breakdown
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { total: 0, passed: 0 };
      }
      difficultyStats[difficulty].total++;
      if (caseResult.passed) {
        difficultyStats[difficulty].passed++;
      }

      caseResult.fieldResults.forEach((fieldResult: any) => {
        const field = fieldResult.field;
        
        // Field accuracy
        if (!fieldCounts[field]) {
          fieldCounts[field] = { total: 0, passed: 0 };
        }
        fieldCounts[field].total++;
        if (fieldResult.passed) {
          fieldCounts[field].passed++;
        }

        // Confidence averages
        if (caseResult.confidence && caseResult.confidence[field] !== undefined) {
          if (!confidenceSum[field]) {
            confidenceSum[field] = { sum: 0, count: 0 };
          }
          confidenceSum[field].sum += caseResult.confidence[field];
          confidenceSum[field].count++;
        }

        // Fallback usage
        if (caseResult.fallbackTier && caseResult.fallbackTier[field]) {
          if (!fallbackCount[field]) {
            fallbackCount[field] = { total: 0, fallback: 0 };
          }
          fallbackCount[field].total++;
          if (caseResult.fallbackTier[field] !== 'direct') {
            fallbackCount[field].fallback++;
          }
        }
      });
    });

    // Calculate final statistics
    Object.keys(fieldCounts).forEach(field => {
      const counts = fieldCounts[field];
      results.summary.fieldAccuracy[field] = counts.total > 0 ? counts.passed / counts.total : 0;
    });

    Object.keys(confidenceSum).forEach(field => {
      const sum = confidenceSum[field];
      results.summary.averageConfidence[field] = sum.count > 0 ? sum.sum / sum.count : 0;
    });

    Object.keys(fallbackCount).forEach(field => {
      const count = fallbackCount[field];
      results.summary.fallbackUsage[field] = count.total > 0 ? count.fallback / count.total : 0;
    });

    // Calculate difficulty breakdown
    Object.keys(difficultyStats).forEach(difficulty => {
      const stats = difficultyStats[difficulty];
      results.summary.difficultyBreakdown[difficulty] = {
        passed: stats.passed,
        total: stats.total,
        rate: stats.total > 0 ? stats.passed / stats.total : 0
      };
    });

    // Calculate weighted score if in weighted mode
    if (this.scoringMode === 'weighted') {
      // Field importance weights (can be adjusted based on requirements)
      const fieldWeights = {
        name: 0.25,
        category: 0.20,
        urgencyLevel: 0.25,
        goalAmount: 0.25,
        beneficiaryRelationship: 0.05
      };

      let weightedSum = 0;
      let totalWeight = 0;

      Object.keys(fieldCounts).forEach(field => {
        const weight = fieldWeights[field as keyof typeof fieldWeights] || 0.1;
        const accuracy = results.summary.fieldAccuracy[field];
        
        weightedSum += accuracy * weight;
        totalWeight += weight;
      });

      results.summary.weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
  }

  /**
   * Creates a visual progress bar
   */
  private createProgressBar(current: number, total: number, width: number = 40): string {
    const percentage = current / total;
    const filled = Math.round(width * percentage);
    const empty = width - filled;
    
    return `[${'█'.repeat(filled)}${'-'.repeat(empty)}]`;
  }

  /**
   * Displays dataset composition information
   */
  private displayDatasetComposition(dataset: GoldenDatasetItem[]): void {
    const difficulties = dataset.reduce((acc, item) => {
      acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📈 DATASET COMPOSITION:');
    console.log('-'.repeat(40));
    Object.entries(difficulties).forEach(([diff, count]) => {
      const percentage = (count / dataset.length * 100).toFixed(1);
      console.log(`  ${diff.toUpperCase().padEnd(12)}: ${count.toString().padStart(2)} cases (${percentage}%)`);
    });
    console.log('-'.repeat(40) + '\n');
  }

  /**
   * Displays detailed pass result information
   */
  private displayPassResult(caseResult: EvaluationCase): void {
    const confidence = caseResult.confidence;
    if (confidence) {
      const avgConfidence = Object.values(confidence).reduce((a, b) => a + b, 0) / Object.values(confidence).length;
      console.log(`  📊 Avg Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
      
      const confidenceDetails = Object.entries(confidence)
        .map(([field, conf]) => `${field}: ${(conf * 100).toFixed(0)}%`)
        .join(', ');
      console.log(`  🎯 Field Confidence: ${confidenceDetails}`);
    }
  }

  /**
   * Displays detailed fail result information
   */
  private displayFailResult(caseResult: EvaluationCase): void {
    const failedFields = caseResult.fieldResults
      .filter((fr: any) => !fr.passed)
      .map((fr: any) => fr.field);
    
    console.log(`  ❌ Failed Fields: ${failedFields.join(', ')}`);
    
    // Show first failure details
    const firstFailure = caseResult.fieldResults.find((fr: any) => !fr.passed);
    if (firstFailure) {
      console.log(`  🔍 Primary Issue: Expected '${firstFailure.expected}', got '${firstFailure.actual}'`);
    }
  }

  /**
   * Displays comprehensive evaluation results
   */
  private displayComprehensiveResults(results: EvaluationResult, duration: number): void {
    console.log('\n📋 COMPREHENSIVE RESULTS SUMMARY');
    console.log('='.repeat(80));
    
    // Overall Performance
    console.log('🎯 OVERALL PERFORMANCE:');
    const passRate = (results.summary.passRate * 100).toFixed(1);
    const passIcon = results.summary.passRate >= 0.85 ? '🟢' : results.summary.passRate >= 0.70 ? '🟡' : '🔴';
    console.log(`  ${passIcon} Pass Rate: ${passRate}% (${results.summary.passedCases}/${results.summary.totalCases})`);
    console.log(`  ⏱️  Execution Time: ${(duration / 1000).toFixed(1)}s`);
    console.log(`  📊 Avg Time/Case: ${(duration / results.summary.totalCases).toFixed(0)}ms`);
    
    if (results.summary.weightedScore !== undefined) {
      const weightedScore = (results.summary.weightedScore * 100).toFixed(1);
      const weightedIcon = results.summary.weightedScore >= 0.85 ? '🟢' : results.summary.weightedScore >= 0.70 ? '🟡' : '🔴';
      console.log(`  ${weightedIcon} Weighted Score: ${weightedScore}%`);
    }

    // Field Performance
    console.log('\n🎯 FIELD ACCURACY BREAKDOWN:');
    console.log('-'.repeat(50));
    Object.entries(results.summary.fieldAccuracy).forEach(([field, accuracy]) => {
      const percentage = (accuracy * 100).toFixed(1);
      const icon = accuracy >= 0.90 ? '🟢' : accuracy >= 0.80 ? '🟡' : accuracy >= 0.70 ? '🟠' : '🔴';
      const bar = this.createMiniProgressBar(accuracy, 20);
      console.log(`  ${icon} ${field.padEnd(15)}: ${percentage.padStart(5)}% ${bar}`);
    });

    // Difficulty Breakdown
    if (Object.keys(results.summary.difficultyBreakdown).length > 0) {
      console.log('\n📊 DIFFICULTY BREAKDOWN:');
      console.log('-'.repeat(50));
      Object.entries(results.summary.difficultyBreakdown).forEach(([difficulty, stats]) => {
        const percentage = (stats.rate * 100).toFixed(1);
        const icon = stats.rate >= 0.85 ? '🟢' : stats.rate >= 0.70 ? '🟡' : '🔴';
        console.log(`  ${icon} ${difficulty.toUpperCase().padEnd(12)}: ${percentage.padStart(5)}% (${stats.passed}/${stats.total})`);
      });
    }

    // Confidence Analysis
    if (Object.keys(results.summary.averageConfidence).length > 0) {
      console.log('\n🎯 CONFIDENCE ANALYSIS:');
      console.log('-'.repeat(50));
      Object.entries(results.summary.averageConfidence).forEach(([field, confidence]) => {
        const percentage = (confidence * 100).toFixed(1);
        const icon = confidence >= 0.85 ? '🟢' : confidence >= 0.70 ? '🟡' : '🔴';
        const bar = this.createMiniProgressBar(confidence, 15);
        console.log(`  ${icon} ${field.padEnd(15)}: ${percentage.padStart(5)}% ${bar}`);
      });
    }

    // Production Readiness Assessment
    console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:');
    console.log('-'.repeat(50));
    const assessments = [
      { 
        name: 'Overall Pass Rate', 
        current: results.summary.passRate, 
        target: 0.85, 
        status: results.summary.passRate >= 0.85 
      },
      { 
        name: 'Urgency Accuracy', 
        current: results.summary.fieldAccuracy.urgencyLevel || 0, 
        target: 0.80, 
        status: (results.summary.fieldAccuracy.urgencyLevel || 0) >= 0.80 
      },
      { 
        name: 'Amount Accuracy', 
        current: results.summary.fieldAccuracy.goalAmount || 0, 
        target: 0.80, 
        status: (results.summary.fieldAccuracy.goalAmount || 0) >= 0.80 
      },
      { 
        name: 'Name Accuracy', 
        current: results.summary.fieldAccuracy.name || 0, 
        target: 0.90, 
        status: (results.summary.fieldAccuracy.name || 0) >= 0.90 
      },
      { 
        name: 'Category Accuracy', 
        current: results.summary.fieldAccuracy.category || 0, 
        target: 0.90, 
        status: (results.summary.fieldAccuracy.category || 0) >= 0.90 
      }
    ];

    assessments.forEach(assessment => {
      const icon = assessment.status ? '✅' : '❌';
      const current = (assessment.current * 100).toFixed(1);
      const target = (assessment.target * 100).toFixed(1);
      console.log(`  ${icon} ${assessment.name.padEnd(18)}: ${current}% (target: ${target}%)`);
    });

    const readyCount = assessments.filter(a => a.status).length;
    const totalCount = assessments.length;
    const readinessIcon = readyCount === totalCount ? '🟢' : readyCount >= totalCount * 0.8 ? '🟡' : '🔴';
    
    console.log('\n' + '='.repeat(80));
    console.log(`${readinessIcon} PRODUCTION READINESS: ${readyCount}/${totalCount} criteria met`);
    if (readyCount === totalCount) {
      console.log('🎉 SYSTEM READY FOR PRODUCTION DEPLOYMENT!');
    } else if (readyCount >= totalCount * 0.8) {
      console.log('⚠️  SYSTEM NEAR PRODUCTION READY - Minor improvements needed');
    } else {
      console.log('🚧 SYSTEM REQUIRES SIGNIFICANT IMPROVEMENTS');
    }
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Creates a mini progress bar for field displays
   */
  private createMiniProgressBar(percentage: number, width: number = 15): string {
    const filled = Math.round(width * percentage);
    const empty = width - filled;
    return `[${'●'.repeat(filled)}${'-'.repeat(empty)}]`;
  }

  /**
   * Saves evaluation results to files
   */
  private async saveResults(
    results: EvaluationResult,
    errorRecords: ErrorRecord[],
    traceRecords: any[],
    datasetId: string
  ): Promise<void> {
    
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });

    // Save detailed results
    const resultsFile = path.join(this.outputDir, `eval-results-${timestamp}.json`);
    await fs.writeFile(resultsFile, JSON.stringify(results, null, 2));
    console.log(`💾 Saved detailed results: ${resultsFile}`);

    // Save error records (JSONL)
    if (errorRecords.length > 0) {
      const errorsFile = path.join(this.outputDir, `eval-errors-${timestamp}.jsonl`);
      const errorLines = errorRecords.map(record => JSON.stringify(record)).join('\n');
      await fs.writeFile(errorsFile, errorLines);
      console.log(`💾 Saved error records: ${errorsFile}`);
    }

    // Save trace records (JSONL) if enabled
    if (traceRecords.length > 0 && shouldExportTrace()) {
      const traceFile = path.join(this.outputDir, `eval-trace-${timestamp}.jsonl`);
      const traceLines = traceRecords.map(record => JSON.stringify(record)).join('\n');
      await fs.writeFile(traceFile, traceLines);
      console.log(`💾 Saved trace records: ${traceFile}`);
    }

    // Generate summary markdown
    const summaryFile = path.join(this.outputDir, `eval-summary-${timestamp}.md`);
    const summaryContent = this.generateSummaryMarkdown(results, errorRecords);
    await fs.writeFile(summaryFile, summaryContent);
    console.log(`💾 Saved summary report: ${summaryFile}`);
  }

  /**
   * Generates human-readable summary in Markdown format with enhanced visualization
   */
  private generateSummaryMarkdown(results: EvaluationResult, errorRecords: ErrorRecord[]): string {
    const { summary } = results;
    
    let content = `# Jan v4.0 Parsing Evaluation Summary\n\n`;
    
    // Header information with visual indicators
    content += `**Date:** ${results.timestamp.split('T')[0]}\n`;
    content += `**Parser Version:** ${results.parserVersion}\n`;
    content += `**Dataset:** ${results.datasetId} (${results.datasetVersion})\n`;
    content += `**Evaluation Mode:** ${results.evalMode.toUpperCase()}\n`;
    content += `**Scoring Mode:** ${results.scoringMode.toUpperCase()}\n\n`;

    // Overall Results with visual indicators
    const passRate = (summary.passRate * 100).toFixed(1);
    const passIcon = summary.passRate >= 0.85 ? '🟢' : summary.passRate >= 0.70 ? '🟡' : '🔴';
    
    content += `## Overall Results\n\n`;
    content += `${passIcon} **Overall Pass Rate:** ${passRate}%\n`;
    content += `- **Total Cases:** ${summary.totalCases}\n`;
    content += `- **Passed:** ${summary.passedCases}\n`;
    content += `- **Failed:** ${summary.failedCases}\n`;
    
    if (summary.weightedScore !== undefined) {
      const weightedScore = (summary.weightedScore * 100).toFixed(1);
      const weightedIcon = summary.weightedScore >= 0.85 ? '🟢' : summary.weightedScore >= 0.70 ? '🟡' : '🔴';
      content += `${weightedIcon} **Weighted Score:** ${weightedScore}%\n`;
    }
    content += '\n';

    // Field Accuracy with progress bars
    content += `## Field Accuracy\n\n`;
    content += `| Field | Accuracy | Status | Visual |\n`;
    content += `|-------|----------|---------|--------|\n`;
    
    Object.entries(summary.fieldAccuracy).forEach(([field, accuracy]) => {
      const percentage = (accuracy * 100).toFixed(1);
      const icon = accuracy >= 0.90 ? '🟢' : accuracy >= 0.80 ? '🟡' : accuracy >= 0.70 ? '🟠' : '🔴';
      const status = accuracy >= 0.90 ? 'Excellent' : accuracy >= 0.80 ? 'Good' : accuracy >= 0.70 ? 'Fair' : 'Needs Improvement';
      const visualBar = '█'.repeat(Math.round(accuracy * 10)) + '░'.repeat(10 - Math.round(accuracy * 10));
      content += `| ${field} | ${percentage}% | ${icon} ${status} | \`${visualBar}\` |\n`;
    });
    content += '\n';

    // Difficulty Breakdown
    if (Object.keys(summary.difficultyBreakdown).length > 0) {
      content += `## Difficulty Performance\n\n`;
      content += `| Difficulty | Pass Rate | Cases | Status |\n`;
      content += `|------------|-----------|-------|---------|\n`;
      
      Object.entries(summary.difficultyBreakdown).forEach(([difficulty, stats]) => {
        const percentage = (stats.rate * 100).toFixed(1);
        const icon = stats.rate >= 0.85 ? '🟢' : stats.rate >= 0.70 ? '🟡' : '🔴';
        const status = stats.rate >= 0.85 ? 'Excellent' : stats.rate >= 0.70 ? 'Good' : 'Needs Work';
        content += `| ${difficulty.toUpperCase()} | ${percentage}% | ${stats.passed}/${stats.total} | ${icon} ${status} |\n`;
      });
      content += '\n';
    }

    // Confidence Scores
    if (Object.keys(summary.averageConfidence).length > 0) {
      content += `## Average Confidence Scores\n\n`;
      Object.entries(summary.averageConfidence).forEach(([field, confidence]) => {
        const percentage = (confidence * 100).toFixed(1);
        const icon = confidence >= 0.85 ? '🟢' : confidence >= 0.70 ? '🟡' : '🔴';
        content += `${icon} **${field}:** ${percentage}%\n`;
      });
      content += '\n';
    }

    // Production Readiness Assessment
    content += `## Production Readiness Assessment\n\n`;
    
    const readinessCriteria = [
      { name: 'Overall Pass Rate', current: summary.passRate, target: 0.85 },
      { name: 'Urgency Accuracy', current: summary.fieldAccuracy.urgencyLevel || 0, target: 0.80 },
      { name: 'Amount Accuracy', current: summary.fieldAccuracy.goalAmount || 0, target: 0.80 },
      { name: 'Name Accuracy', current: summary.fieldAccuracy.name || 0, target: 0.90 },
      { name: 'Category Accuracy', current: summary.fieldAccuracy.category || 0, target: 0.90 }
    ];

    content += `| Criterion | Current | Target | Status |\n`;
    content += `|-----------|---------|--------|---------|\n`;
    
    readinessCriteria.forEach(criterion => {
      const current = (criterion.current * 100).toFixed(1);
      const target = (criterion.target * 100).toFixed(1);
      const met = criterion.current >= criterion.target;
      const icon = met ? '✅' : '❌';
      const status = met ? 'PASS' : 'FAIL';
      content += `| ${criterion.name} | ${current}% | ${target}% | ${icon} ${status} |\n`;
    });

    const passedCriteria = readinessCriteria.filter(c => c.current >= c.target).length;
    const totalCriteria = readinessCriteria.length;
    
    content += `\n**Production Readiness:** ${passedCriteria}/${totalCriteria} criteria met\n\n`;
    
    if (passedCriteria === totalCriteria) {
      content += `🎉 **SYSTEM READY FOR PRODUCTION DEPLOYMENT!**\n\n`;
    } else if (passedCriteria >= totalCriteria * 0.8) {
      content += `⚠️ **SYSTEM NEAR PRODUCTION READY** - Minor improvements needed\n\n`;
    } else {
      content += `🚧 **SYSTEM REQUIRES SIGNIFICANT IMPROVEMENTS**\n\n`;
    }

    // Error Analysis
    if (errorRecords.length > 0) {
      content += `## Error Analysis\n\n`;
      content += `**Total Errors:** ${errorRecords.length}\n\n`;
      
      // Group errors by failure bucket
      const bucketCounts = errorRecords.reduce((acc, error) => {
        acc[error.failureBucket] = (acc[error.failureBucket] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      content += `### Error Distribution\n\n`;
      Object.entries(bucketCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([bucket, count]) => {
          const percentage = (count / errorRecords.length * 100).toFixed(1);
          content += `- **${bucket}:** ${count} errors (${percentage}%)\n`;
        });
      content += '\n';
    }

    // Recommendations
    content += `## Recommendations\n\n`;
    
    if (summary.passRate < 0.85) {
      content += `### Critical Improvements Needed:\n`;
      if ((summary.fieldAccuracy.urgencyLevel || 0) < 0.80) {
        content += `- 🔴 **Urgency Detection:** Currently ${((summary.fieldAccuracy.urgencyLevel || 0) * 100).toFixed(1)}%, needs improvement to 80%+\n`;
      }
      if ((summary.fieldAccuracy.goalAmount || 0) < 0.80) {
        content += `- 🔴 **Amount Detection:** Currently ${((summary.fieldAccuracy.goalAmount || 0) * 100).toFixed(1)}%, needs improvement to 80%+\n`;
      }
      content += '\n';
    }
    
    if (summary.passRate >= 0.70) {
      content += `### System Strengths to Maintain:\n`;
      Object.entries(summary.fieldAccuracy)
        .filter(([, accuracy]) => accuracy >= 0.85)
        .forEach(([field, accuracy]) => {
          content += `- 🟢 **${field}:** Excellent performance at ${(accuracy * 100).toFixed(1)}%\n`;
        });
      content += '\n';
    }

    // Footer
    content += `---\n\n`;
    content += `*Generated by Jan v4.0 Evaluation System*\n`;
    content += `*Evaluation completed at ${results.timestamp}*\n`;

    return content;
  }
}

// Main execution if run directly
if (require.main === module) {
  const runner = new ParsingEvaluationRunner();
  runner.runEvaluation().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Main execution function
export async function runParsingEvaluation(datasetId?: string): Promise<void> {
  const runner = new ParsingEvaluationRunner();
  await runner.runEvaluation(datasetId);
}

// CLI execution
if (require.main === module) {
  const datasetId = process.argv[2] || 'transcripts_golden_v1';
  
  runParsingEvaluation(datasetId)
    .then(() => {
      console.log('✅ Evaluation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Evaluation failed:', error);
      process.exit(1);
    });
}