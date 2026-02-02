/**
 * Output Artifact Optimization
 * Optimizes evaluation output artifacts for different audiences and purposes
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { EvaluationResult } from '../schemas/evaluationResult';
import { PerformanceMetrics } from './performanceBudget';
import { PiiScanResult } from './piiScan';

export interface ArtifactConfig {
  includeDetails: boolean;        // Include full error details
  includePii: boolean;           // Include potential PII (internal only)
  includeMetrics: boolean;       // Include performance metrics
  includeTestData: boolean;      // Include original test data
  format: 'json' | 'markdown' | 'summary';
  audience: 'internal' | 'funder' | 'public';
}

export interface OptimizedArtifact {
  summary: EvaluationSummary;
  details?: EvaluationDetails;
  metrics?: PerformanceMetrics[];
  metadata: ArtifactMetadata;
}

export interface EvaluationSummary {
  timestamp: string;
  totalTests: number;
  successRate: number;
  failuresByCategory: Record<string, number>;
  keyFindings: string[];
  recommendations: string[];
  trend: 'improving' | 'stable' | 'degrading' | 'unknown';
}

export interface EvaluationDetails {
  results: EvaluationResult[];
  rawErrors: Array<{
    testId: string;
    category: string;
    message: string;
    redacted: boolean;
  }>;
  testData?: any[];
}

export interface ArtifactMetadata {
  version: string;
  audience: string;
  generatedAt: string;
  containsPii: boolean;
  confidenceLevel: 'high' | 'medium' | 'low';
  dataRetentionPolicy: string;
}

// Pre-configured artifact templates
const ARTIFACT_CONFIGS = {
  INTERNAL_DETAILED: {
    includeDetails: true,
    includePii: true,
    includeMetrics: true,
    includeTestData: true,
    format: 'json' as const,
    audience: 'internal' as const
  },
  
  FUNDER_SAFE: {
    includeDetails: true,
    includePii: false,
    includeMetrics: true,
    includeTestData: false,
    format: 'markdown' as const,
    audience: 'funder' as const
  },
  
  PUBLIC_SUMMARY: {
    includeDetails: false,
    includePii: false,
    includeMetrics: false,
    includeTestData: false,
    format: 'summary' as const,
    audience: 'public' as const
  }
};

/**
 * Optimizes evaluation results for specific audience and purpose
 */
export class ArtifactOptimizer {
  private config: ArtifactConfig;
  private piiResults: PiiScanResult[];

  constructor(config: ArtifactConfig = ARTIFACT_CONFIGS.FUNDER_SAFE) {
    this.config = config;
    this.piiResults = [];
  }

  /**
   * Sets PII scan results for redaction decisions
   */
  setPiiResults(results: PiiScanResult[]): void {
    this.piiResults = results;
  }

  /**
   * Optimizes evaluation results into artifact
   */
  optimize(
    results: EvaluationResult[],
    metrics?: PerformanceMetrics[],
    previousResults?: EvaluationResult[]
  ): OptimizedArtifact {
    // Generate summary
    const summary = this.generateSummary(results, previousResults);
    
    // Generate details based on config
    const details = this.config.includeDetails ? 
      this.generateDetails(results) : undefined;

    // Include metrics if requested
    const optimizedMetrics = this.config.includeMetrics ? metrics : undefined;

    // Generate metadata
    const metadata = this.generateMetadata();

    return {
      summary,
      details,
      metrics: optimizedMetrics,
      metadata
    };
  }

  /**
   * Generates evaluation summary
   */
  private generateSummary(
    results: EvaluationResult[],
    previousResults?: EvaluationResult[]
  ): EvaluationSummary {
    const totalTests = results.length;
    const successCount = results.filter(r => r.success).length;
    const successRate = totalTests > 0 ? (successCount / totalTests) * 100 : 0;

    // Count failures by category
    const failuresByCategory: Record<string, number> = {};
    results.filter(r => !r.success).forEach(result => {
      const category = result.error?.category || 'Unknown';
      failuresByCategory[category] = (failuresByCategory[category] || 0) + 1;
    });

    // Generate key findings
    const keyFindings = this.generateKeyFindings(results, failuresByCategory);

    // Generate recommendations
    const recommendations = this.generateRecommendations(results, failuresByCategory);

    // Determine trend
    const trend = this.calculateTrend(results, previousResults);

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
      failuresByCategory,
      keyFindings,
      recommendations,
      trend
    };
  }

  /**
   * Generates evaluation details
   */
  private generateDetails(results: EvaluationResult[]): EvaluationDetails {
    // Filter and redact results based on config
    const filteredResults = results.map(result => this.filterResult(result));
    
    // Extract raw errors
    const rawErrors = results
      .filter(r => !r.success && r.error)
      .map(result => ({
        testId: result.testId,
        category: result.error!.category,
        message: this.redactErrorMessage(result.error!.message),
        redacted: this.containsPii(result.error!.message)
      }));

    // Include test data only if safe and requested
    const testData = (this.config.includeTestData && !this.hasPiiRisk()) ? 
      results.map(r => r.testCase) : undefined;

    return {
      results: filteredResults,
      rawErrors,
      testData
    };
  }

  /**
   * Filters individual result based on config
   */
  private filterResult(result: EvaluationResult): EvaluationResult {
    const filtered = { ...result };

    // Remove PII from test case if not allowed
    if (!this.config.includePii && filtered.testCase) {
      filtered.testCase = this.redactTestCase(filtered.testCase);
    }

    // Redact error messages if PII not allowed
    if (!this.config.includePii && filtered.error) {
      filtered.error = {
        ...filtered.error,
        message: this.redactErrorMessage(filtered.error.message)
      };
    }

    // Remove performance metrics if not requested
    if (!this.config.includeMetrics) {
      delete filtered.executionTime;
    }

    return filtered;
  }

  /**
   * Redacts potential PII from test cases
   */
  private redactTestCase(testCase: any): any {
    // Create a deep copy and redact sensitive fields
    const redacted = JSON.parse(JSON.stringify(testCase));
    
    // Common PII fields to redact
    const piiFields = [
      'fundraiserUrl', 'organizerName', 'email', 'phone',
      'address', 'donorName', 'creditCard', 'socialSecurity'
    ];

    function redactObject(obj: any): void {
      if (!obj || typeof obj !== 'object') return;

      for (const [key, value] of Object.entries(obj)) {
        if (piiFields.includes(key)) {
          obj[key] = '[REDACTED]';
        } else if (typeof value === 'string' && this.containsPii(value)) {
          obj[key] = this.redactString(value);
        } else if (typeof value === 'object') {
          redactObject(value);
        }
      }
    }

    redactObject(redacted);
    return redacted;
  }

  /**
   * Redacts PII from error messages
   */
  private redactErrorMessage(message: string): string {
    if (!this.config.includePii && this.containsPii(message)) {
      return this.redactString(message);
    }
    return message;
  }

  /**
   * Checks if text contains PII
   */
  private containsPii(text: string): boolean {
    // Simple PII detection patterns
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/,           // SSN pattern
      /\b[\w\.-]+@[\w\.-]+\.\w+\b/,     // Email pattern
      /\b\d{3}-\d{3}-\d{4}\b/,          // Phone pattern
      /\b4\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /https?:\/\/[^\s]+/                // URLs
    ];

    return piiPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Redacts sensitive information from string
   */
  private redactString(text: string): string {
    return text
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX')
      .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, 'XXX-XXX-XXXX')
      .replace(/\b4\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '4XXX-XXXX-XXXX-XXXX')
      .replace(/https?:\/\/[^\s]+/g, '[URL]');
  }

  /**
   * Checks if current configuration has PII risk
   */
  private hasPiiRisk(): boolean {
    return this.piiResults.some(result => result.hasPii && result.riskLevel === 'high');
  }

  /**
   * Generates key findings from results
   */
  private generateKeyFindings(
    results: EvaluationResult[],
    failuresByCategory: Record<string, number>
  ): string[] {
    const findings: string[] = [];
    const totalTests = results.length;
    const failureCount = results.filter(r => !r.success).length;

    // Overall performance finding
    if (failureCount === 0) {
      findings.push('✅ All test cases passed successfully');
    } else {
      const failureRate = Math.round((failureCount / totalTests) * 100);
      findings.push(`⚠️ ${failureCount}/${totalTests} tests failed (${failureRate}% failure rate)`);
    }

    // Category-specific findings
    const sortedCategories = Object.entries(failuresByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3); // Top 3 failure categories

    sortedCategories.forEach(([category, count]) => {
      const percentage = Math.round((count / totalTests) * 100);
      findings.push(`🔍 ${category}: ${count} failures (${percentage}% of all tests)`);
    });

    // Performance findings
    const avgExecutionTime = results
      .filter(r => r.executionTime)
      .reduce((sum, r) => sum + (r.executionTime || 0), 0) / totalTests;
    
    if (avgExecutionTime > 1000) {
      findings.push(`⏱️ Average execution time is ${Math.round(avgExecutionTime)}ms (may need optimization)`);
    }

    return findings;
  }

  /**
   * Generates recommendations based on results
   */
  private generateRecommendations(
    results: EvaluationResult[],
    failuresByCategory: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];
    const totalTests = results.length;
    const failureCount = results.filter(r => !r.success).length;

    if (failureCount === 0) {
      recommendations.push('System is performing well - continue monitoring');
      return recommendations;
    }

    // Failure rate recommendations
    const failureRate = failureCount / totalTests;
    if (failureRate > 0.5) {
      recommendations.push('🚨 High failure rate detected - immediate investigation required');
    } else if (failureRate > 0.2) {
      recommendations.push('⚠️ Moderate failure rate - review and address common issues');
    }

    // Category-specific recommendations
    if (failuresByCategory['URL_EXTRACTION_FAILED']) {
      recommendations.push('Review URL extraction logic - common failure point');
    }
    
    if (failuresByCategory['GOAL_EXTRACTION_FAILED']) {
      recommendations.push('Improve goal amount parsing for edge cases');
    }

    if (failuresByCategory['VALIDATION_ERROR']) {
      recommendations.push('Check data validation rules - may be too strict');
    }

    if (failuresByCategory['NETWORK_ERROR']) {
      recommendations.push('Investigate network connectivity or rate limiting issues');
    }

    // Performance recommendations
    const slowTests = results.filter(r => r.executionTime && r.executionTime > 2000).length;
    if (slowTests > totalTests * 0.2) {
      recommendations.push('Optimize parsing performance - many tests are slow');
    }

    return recommendations;
  }

  /**
   * Calculates trend compared to previous results
   */
  private calculateTrend(
    currentResults: EvaluationResult[],
    previousResults?: EvaluationResult[]
  ): 'improving' | 'stable' | 'degrading' | 'unknown' {
    if (!previousResults || previousResults.length === 0) {
      return 'unknown';
    }

    const currentSuccess = currentResults.filter(r => r.success).length / currentResults.length;
    const previousSuccess = previousResults.filter(r => r.success).length / previousResults.length;

    const difference = currentSuccess - previousSuccess;

    if (difference > 0.05) return 'improving';  // More than 5% improvement
    if (difference < -0.05) return 'degrading'; // More than 5% degradation
    return 'stable';
  }

  /**
   * Generates artifact metadata
   */
  private generateMetadata(): ArtifactMetadata {
    const containsPii = this.config.includePii || this.hasPiiRisk();
    
    // Determine confidence level based on test coverage and results
    let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';
    
    // High confidence requires comprehensive testing and low failure rates
    // This would be determined based on actual results in practice
    
    // Data retention policy based on audience
    let dataRetentionPolicy: string;
    switch (this.config.audience) {
      case 'internal':
        dataRetentionPolicy = 'Retain for 90 days - internal analysis only';
        break;
      case 'funder':
        dataRetentionPolicy = 'Retain for 30 days - authorized sharing only';
        break;
      case 'public':
        dataRetentionPolicy = 'No retention limit - public information';
        break;
      default:
        dataRetentionPolicy = 'Follow organizational data policy';
    }

    return {
      version: '1.0.0',
      audience: this.config.audience,
      generatedAt: new Date().toISOString(),
      containsPii,
      confidenceLevel,
      dataRetentionPolicy
    };
  }
}

/**
 * Saves optimized artifact to file system
 */
export async function saveOptimizedArtifact(
  artifact: OptimizedArtifact,
  outputDir: string,
  filename?: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const defaultFilename = `evaluation-${artifact.metadata.audience}-${timestamp}`;
  
  const finalFilename = filename || defaultFilename;
  const extension = artifact.metadata.audience === 'public' ? '.md' : '.json';
  const filepath = join(outputDir, `${finalFilename}${extension}`);

  let content: string;
  
  if (extension === '.md') {
    content = generateMarkdownReport(artifact);
  } else {
    content = JSON.stringify(artifact, null, 2);
  }

  await writeFile(filepath, content, 'utf-8');
  return filepath;
}

/**
 * Generates markdown report from artifact
 */
function generateMarkdownReport(artifact: OptimizedArtifact): string {
  const { summary, details, metrics, metadata } = artifact;
  
  let report = `# Parsing Evaluation Report\n\n`;
  report += `**Generated:** ${metadata.generatedAt}\n`;
  report += `**Audience:** ${metadata.audience}\n`;
  report += `**Test Cases:** ${summary.totalTests}\n`;
  report += `**Success Rate:** ${summary.successRate}%\n`;
  report += `**Trend:** ${summary.trend}\n\n`;

  // Key findings
  if (summary.keyFindings.length > 0) {
    report += `## Key Findings\n\n`;
    summary.keyFindings.forEach(finding => {
      report += `- ${finding}\n`;
    });
    report += '\n';
  }

  // Failure breakdown
  if (Object.keys(summary.failuresByCategory).length > 0) {
    report += `## Failure Breakdown\n\n`;
    report += `| Category | Count | Percentage |\n`;
    report += `|----------|-------|------------|\n`;
    
    Object.entries(summary.failuresByCategory).forEach(([category, count]) => {
      const percentage = Math.round((count / summary.totalTests) * 100);
      report += `| ${category} | ${count} | ${percentage}% |\n`;
    });
    report += '\n';
  }

  // Recommendations
  if (summary.recommendations.length > 0) {
    report += `## Recommendations\n\n`;
    summary.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += '\n';
  }

  // Performance metrics
  if (metrics && metrics.length > 0) {
    const avgExecTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    const avgMemory = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    
    report += `## Performance Metrics\n\n`;
    report += `- **Average Execution Time:** ${Math.round(avgExecTime)}ms\n`;
    report += `- **Average Memory Usage:** ${avgMemory.toFixed(1)}MB\n\n`;
  }

  // Metadata
  report += `## Report Metadata\n\n`;
  report += `- **Version:** ${metadata.version}\n`;
  report += `- **Confidence Level:** ${metadata.confidenceLevel}\n`;
  report += `- **Contains PII:** ${metadata.containsPii ? 'Yes' : 'No'}\n`;
  report += `- **Data Retention:** ${metadata.dataRetentionPolicy}\n`;

  return report;
}

/**
 * Pre-configured artifact generators
 */
export const ArtifactGenerators = {
  internal: () => new ArtifactOptimizer(ARTIFACT_CONFIGS.INTERNAL_DETAILED),
  funder: () => new ArtifactOptimizer(ARTIFACT_CONFIGS.FUNDER_SAFE),
  public: () => new ArtifactOptimizer(ARTIFACT_CONFIGS.PUBLIC_SUMMARY)
};

/**
 * Generates all artifact types from evaluation results
 */
export async function generateAllArtifacts(
  results: EvaluationResult[],
  outputDir: string,
  metrics?: PerformanceMetrics[],
  previousResults?: EvaluationResult[]
): Promise<string[]> {
  const generatedFiles: string[] = [];
  
  // Generate internal detailed artifact
  const internalArtifact = ArtifactGenerators.internal().optimize(results, metrics, previousResults);
  const internalFile = await saveOptimizedArtifact(internalArtifact, outputDir, 'internal-detailed');
  generatedFiles.push(internalFile);

  // Generate funder-safe artifact
  const funderArtifact = ArtifactGenerators.funder().optimize(results, metrics, previousResults);
  const funderFile = await saveOptimizedArtifact(funderArtifact, outputDir, 'funder-safe');
  generatedFiles.push(funderFile);

  // Generate public summary artifact
  const publicArtifact = ArtifactGenerators.public().optimize(results, metrics, previousResults);
  const publicFile = await saveOptimizedArtifact(publicArtifact, outputDir, 'public-summary');
  generatedFiles.push(publicFile);

  return generatedFiles;
}