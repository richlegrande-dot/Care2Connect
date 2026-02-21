/**
 * Evaluation Log Analyzer - Jan v.2.5
 * Analyzes evaluation logs to generate trends and insights
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface TrendData {
  date: string;
  parserVersion: string;
  totalCases: number;
  passRate: number;
  fieldAccuracy: Record<string, number>;
  averageConfidence: Record<string, number>;
  fallbackUsage: Record<string, number>;
  topFailureBuckets: Array<{ bucket: string; count: number; percentage: number }>;
  executionTimeStats: { min: number; max: number; avg: number };
}

interface TrendReport {
  lastUpdated: string;
  dataPoints: TrendData[];
  analysis: {
    overallTrend: 'improving' | 'declining' | 'stable';
    bestField: string;
    worstField: string;
    mostCommonFailure: string;
    recommendations: string[];
  };
}

interface FragileCaseAnalysis {
  caseId: string;
  failureCount: number;
  lastFailureDate: string;
  failureBuckets: string[];
  description?: string;
}

export class EvaluationLogAnalyzer {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'outputs');
  }

  /**
   * Analyzes all evaluation logs and generates trend report
   */
  async analyzeLogs(): Promise<void> {
    console.log('📊 Starting evaluation log analysis...');

    try {
      // Load all result files
      const resultFiles = await this.findResultFiles();
      console.log(`📁 Found ${resultFiles.length} result files`);

      if (resultFiles.length === 0) {
        console.log('⚠️ No evaluation result files found');
        return;
      }

      // Load and process each result file
      const trendDataPoints: TrendData[] = [];
      
      for (const file of resultFiles) {
        try {
          const trendData = await this.processResultFile(file);
          if (trendData) {
            trendDataPoints.push(trendData);
          }
        } catch (error) {
          console.error(`❌ Failed to process file ${file}:`, error);
        }
      }

      // Sort by date
      trendDataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Generate trend analysis
      const analysis = this.generateTrendAnalysis(trendDataPoints);
      
      // Create trend report
      const trendReport: TrendReport = {
        lastUpdated: new Date().toISOString(),
        dataPoints: trendDataPoints,
        analysis
      };

      // Save trend report
      await this.saveTrendReport(trendReport);

      // Analyze fragile cases
      await this.analyzeFragileCases();

      console.log('✅ Log analysis completed');
      console.log(`📈 Analyzed ${trendDataPoints.length} evaluation runs`);
      console.log(`📊 Overall trend: ${analysis.overallTrend}`);

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Finds all eval-results-*.json files in output directory
   */
  private async findResultFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.outputDir);
      return files
        .filter(file => file.startsWith('eval-results-') && file.endsWith('.json'))
        .map(file => path.join(this.outputDir, file));
    } catch (error) {
      console.error('Failed to read output directory:', error);
      return [];
    }
  }

  /**
   * Processes a single result file and extracts trend data
   */
  private async processResultFile(filePath: string): Promise<TrendData | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const results = JSON.parse(content);

      // Extract date from filename
      const filename = path.basename(filePath);
      const dateMatch = filename.match(/eval-results-(\d{4}-\d{2}-\d{2})\.json/);
      const date = dateMatch ? dateMatch[1] : results.timestamp.split('T')[0];

      // Calculate execution time stats
      const executionTimes = results.cases
        .map((c: any) => c.executionTime)
        .filter((t: number) => t !== undefined);

      const executionTimeStats = {
        min: executionTimes.length > 0 ? Math.min(...executionTimes) : 0,
        max: executionTimes.length > 0 ? Math.max(...executionTimes) : 0,
        avg: executionTimes.length > 0 ? executionTimes.reduce((a: number, b: number) => a + b, 0) / executionTimes.length : 0
      };

      // Load corresponding error file for failure bucket analysis
      const errorFile = path.join(
        this.outputDir,
        `eval-errors-${date}.jsonl`
      );
      
      const topFailureBuckets = await this.analyzeFailureBuckets(errorFile);

      const trendData: TrendData = {
        date,
        parserVersion: results.parserVersion,
        totalCases: results.summary.totalCases,
        passRate: results.summary.passRate,
        fieldAccuracy: results.summary.fieldAccuracy,
        averageConfidence: results.summary.averageConfidence,
        fallbackUsage: results.summary.fallbackUsage,
        topFailureBuckets,
        executionTimeStats
      };

      return trendData;
    } catch (error) {
      console.error(`Failed to process result file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Analyzes failure buckets from error JSONL file
   */
  private async analyzeFailureBuckets(errorFile: string): Promise<Array<{ bucket: string; count: number; percentage: number }>> {
    try {
      const content = await fs.readFile(errorFile, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) return [];

      const bucketCounts: Record<string, number> = {};
      
      lines.forEach(line => {
        try {
          const error = JSON.parse(line);
          bucketCounts[error.failureBucket] = (bucketCounts[error.failureBucket] || 0) + 1;
        } catch (err) {
          // Skip invalid lines
        }
      });

      const totalErrors = lines.length;
      
      return Object.entries(bucketCounts)
        .map(([bucket, count]) => ({
          bucket,
          count,
          percentage: (count / totalErrors) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    } catch (error) {
      // Error file might not exist, which is fine
      return [];
    }
  }

  /**
   * Generates trend analysis from data points
   */
  private generateTrendAnalysis(dataPoints: TrendData[]): TrendReport['analysis'] {
    if (dataPoints.length === 0) {
      return {
        overallTrend: 'stable',
        bestField: 'none',
        worstField: 'none',
        mostCommonFailure: 'none',
        recommendations: ['No data available for analysis']
      };
    }

    // Determine overall trend
    let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (dataPoints.length >= 2) {
      const recent = dataPoints.slice(-3); // Last 3 data points
      const older = dataPoints.slice(0, Math.max(1, dataPoints.length - 3));
      
      const recentAvgPassRate = recent.reduce((sum, d) => sum + d.passRate, 0) / recent.length;
      const olderAvgPassRate = older.reduce((sum, d) => sum + d.passRate, 0) / older.length;
      
      if (recentAvgPassRate > olderAvgPassRate + 0.05) {
        overallTrend = 'improving';
      } else if (recentAvgPassRate < olderAvgPassRate - 0.05) {
        overallTrend = 'declining';
      }
    }

    // Find best and worst performing fields
    const latestData = dataPoints[dataPoints.length - 1];
    const fieldAccuracies = Object.entries(latestData.fieldAccuracy);
    
    const bestField = fieldAccuracies.length > 0 
      ? fieldAccuracies.reduce((best, current) => current[1] > best[1] ? current : best)[0]
      : 'none';
    
    const worstField = fieldAccuracies.length > 0
      ? fieldAccuracies.reduce((worst, current) => current[1] < worst[1] ? current : worst)[0]
      : 'none';

    // Find most common failure
    const allFailureBuckets: Record<string, number> = {};
    dataPoints.forEach(d => {
      d.topFailureBuckets.forEach(bucket => {
        allFailureBuckets[bucket.bucket] = (allFailureBuckets[bucket.bucket] || 0) + bucket.count;
      });
    });

    const mostCommonFailure = Object.keys(allFailureBuckets).length > 0
      ? Object.entries(allFailureBuckets).reduce((a, b) => b[1] > a[1] ? b : a)[0]
      : 'none';

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      overallTrend,
      bestField,
      worstField,
      mostCommonFailure,
      latestData
    });

    return {
      overallTrend,
      bestField,
      worstField,
      mostCommonFailure,
      recommendations
    };
  }

  /**
   * Generates actionable recommendations based on analysis
   */
  private generateRecommendations(analysis: {
    overallTrend: string;
    bestField: string;
    worstField: string;
    mostCommonFailure: string;
    latestData: TrendData;
  }): string[] {
    const recommendations: string[] = [];
    const { overallTrend, bestField, worstField, mostCommonFailure, latestData } = analysis;

    // Overall trend recommendations
    if (overallTrend === 'declining') {
      recommendations.push('🚨 Parser quality is declining. Consider reviewing recent changes.');
      recommendations.push('🔄 Roll back to previous parser version if possible.');
    } else if (overallTrend === 'improving') {
      recommendations.push('✅ Parser quality is improving. Continue current development approach.');
    } else {
      recommendations.push('📊 Parser quality is stable. Focus on addressing specific failure patterns.');
    }

    // Field-specific recommendations
    if (worstField && latestData.fieldAccuracy[worstField] < 0.7) {
      recommendations.push(`🎯 Focus improvement efforts on ${worstField} field (${(latestData.fieldAccuracy[worstField] * 100).toFixed(1)}% accuracy).`);
      
      // Specific recommendations by field
      switch (worstField) {
        case 'goalAmount':
        case 'amount':
          recommendations.push('💰 Review amount extraction patterns and false positive detection.');
          break;
        case 'name':
          recommendations.push('👤 Review name extraction patterns and location filtering.');
          break;
        case 'category':
          recommendations.push('🏷️ Review category classification keywords and rules.');
          break;
        case 'urgencyLevel':
          recommendations.push('⚡ Review urgency detection patterns and thresholds.');
          break;
      }
    }

    // Failure bucket recommendations
    if (mostCommonFailure && mostCommonFailure !== 'none') {
      recommendations.push(`🔧 Address most common failure pattern: ${mostCommonFailure}.`);
      
      switch (mostCommonFailure) {
        case 'AMOUNT_FALSE_POSITIVE_WAGE':
          recommendations.push('💼 Improve wage vs. goal amount disambiguation logic.');
          break;
        case 'AMOUNT_FALSE_POSITIVE_AGE':
          recommendations.push('🎂 Improve age vs. goal amount disambiguation logic.');
          break;
        case 'NAME_FALSE_POSITIVE_LOCATION':
          recommendations.push('📍 Improve location filtering in name extraction.');
          break;
        case 'CATEGORY_MISCLASSIFICATION':
          recommendations.push('🔍 Review and expand category classification rules.');
          break;
      }
    }

    // Confidence and fallback recommendations
    const avgConfidence = Object.values(latestData.averageConfidence)
      .reduce((sum, conf) => sum + conf, 0) / Object.values(latestData.averageConfidence).length;
    
    if (avgConfidence < 0.6) {
      recommendations.push('🎯 Overall confidence is low. Consider tuning confidence calculation algorithms.');
    }

    const avgFallbackUsage = Object.values(latestData.fallbackUsage)
      .reduce((sum, usage) => sum + usage, 0) / Object.values(latestData.fallbackUsage).length;
    
    if (avgFallbackUsage > 0.3) {
      recommendations.push('🔄 High fallback usage detected. Improve primary extraction patterns.');
    }

    // Performance recommendations
    if (latestData.executionTimeStats.avg > 1000) {
      recommendations.push('⚡ Parser execution time is high. Consider performance optimization.');
    }

    return recommendations;
  }

  /**
   * Analyzes fragile test cases (frequently failing)
   */
  private async analyzeFragileCases(): Promise<void> {
    try {
      // Find all error files
      const files = await fs.readdir(this.outputDir);
      const errorFiles = files
        .filter(file => file.startsWith('eval-errors-') && file.endsWith('.jsonl'))
        .map(file => path.join(this.outputDir, file));

      const caseFailures: Map<string, FragileCaseAnalysis> = new Map();

      // Process all error files
      for (const errorFile of errorFiles) {
        const content = await fs.readFile(errorFile, 'utf-8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        const fileDate = path.basename(errorFile).match(/eval-errors-(\d{4}-\d{2}-\d{2})\.jsonl/)?.[1] || 'unknown';

        lines.forEach(line => {
          try {
            const error = JSON.parse(line);
            const caseId = error.caseId;

            if (!caseFailures.has(caseId)) {
              caseFailures.set(caseId, {
                caseId,
                failureCount: 0,
                lastFailureDate: fileDate,
                failureBuckets: []
              });
            }

            const analysis = caseFailures.get(caseId)!;
            analysis.failureCount++;
            analysis.lastFailureDate = fileDate;
            
            if (!analysis.failureBuckets.includes(error.failureBucket)) {
              analysis.failureBuckets.push(error.failureBucket);
            }
          } catch (err) {
            // Skip invalid lines
          }
        });
      }

      // Find most fragile cases (failing in multiple runs)
      const fragileCases = Array.from(caseFailures.values())
        .filter(analysis => analysis.failureCount >= 2)
        .sort((a, b) => b.failureCount - a.failureCount)
        .slice(0, 20); // Top 20 most fragile

      // Generate fragile cases report
      const reportContent = this.generateFragileCasesReport(fragileCases);
      const reportFile = path.join(this.outputDir, 'fragile-cases-report.md');
      await fs.writeFile(reportFile, reportContent);
      console.log(`💾 Saved fragile cases report: ${reportFile}`);

    } catch (error) {
      console.error('Failed to analyze fragile cases:', error);
    }
  }

  /**
   * Generates fragile cases report in Markdown
   */
  private generateFragileCasesReport(fragileCases: FragileCaseAnalysis[]): string {
    let content = `# Fragile Test Cases Report\n\n`;
    content += `**Generated:** ${new Date().toISOString()}\n\n`;
    content += `This report identifies test cases that fail frequently across multiple evaluation runs.\n\n`;

    if (fragileCases.length === 0) {
      content += `✅ No fragile cases detected. All test cases are stable.\n`;
      return content;
    }

    content += `## Summary\n\n`;
    content += `- **Total Fragile Cases:** ${fragileCases.length}\n`;
    content += `- **Most Failures:** ${fragileCases[0].failureCount} (Case: ${fragileCases[0].caseId})\n\n`;

    content += `## Fragile Cases\n\n`;
    fragileCases.forEach((caseAnalysis, index) => {
      content += `### ${index + 1}. Case ${caseAnalysis.caseId}\n\n`;
      content += `- **Failure Count:** ${caseAnalysis.failureCount}\n`;
      content += `- **Last Failed:** ${caseAnalysis.lastFailureDate}\n`;
      content += `- **Failure Types:** ${caseAnalysis.failureBuckets.join(', ')}\n`;
      content += `- **Recommendation:** Review and strengthen parsing rules for this case pattern\n\n`;
    });

    content += `## Actions Required\n\n`;
    content += `1. **High Priority:** Cases with 5+ failures need immediate attention\n`;
    content += `2. **Medium Priority:** Cases with 3-4 failures should be reviewed\n`;
    content += `3. **Low Priority:** Cases with 2 failures can be monitored\n\n`;

    content += `## Common Failure Patterns\n\n`;
    const allBuckets = fragileCases.flatMap(c => c.failureBuckets);
    const bucketCounts: Record<string, number> = {};
    allBuckets.forEach(bucket => {
      bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
    });

    Object.entries(bucketCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([bucket, count]) => {
        content += `- **${bucket}:** ${count} fragile cases\n`;
      });

    return content;
  }

  /**
   * Saves trend report to files
   */
  private async saveTrendReport(trendReport: TrendReport): Promise<void> {
    // Save JSON report
    const jsonFile = path.join(this.outputDir, 'eval-trends.json');
    await fs.writeFile(jsonFile, JSON.stringify(trendReport, null, 2));
    console.log(`💾 Saved trend report: ${jsonFile}`);

    // Generate and save Markdown summary
    const markdownContent = this.generateTrendMarkdown(trendReport);
    const markdownFile = path.join(this.outputDir, 'eval-trends-summary.md');
    await fs.writeFile(markdownFile, markdownContent);
    console.log(`💾 Saved trend summary: ${markdownFile}`);
  }

  /**
   * Generates trend report in Markdown format
   */
  private generateTrendMarkdown(report: TrendReport): string {
    let content = `# Evaluation Trends Report\n\n`;
    content += `**Last Updated:** ${report.lastUpdated.split('T')[0]}\n`;
    content += `**Data Points:** ${report.dataPoints.length} evaluation runs\n\n`;

    // Overall Analysis
    content += `## Overall Analysis\n\n`;
    content += `- **Trend:** ${report.analysis.overallTrend}\n`;
    content += `- **Best Field:** ${report.analysis.bestField}\n`;
    content += `- **Worst Field:** ${report.analysis.worstField}\n`;
    content += `- **Most Common Failure:** ${report.analysis.mostCommonFailure}\n\n`;

    // Recommendations
    content += `## Recommendations\n\n`;
    report.analysis.recommendations.forEach((rec, index) => {
      content += `${index + 1}. ${rec}\n`;
    });
    content += '\n';

    // Recent Performance
    if (report.dataPoints.length > 0) {
      const latest = report.dataPoints[report.dataPoints.length - 1];
      content += `## Latest Results (${latest.date})\n\n`;
      content += `- **Pass Rate:** ${(latest.passRate * 100).toFixed(1)}%\n`;
      content += `- **Total Cases:** ${latest.totalCases}\n`;
      content += `- **Parser Version:** ${latest.parserVersion}\n\n`;

      content += `### Field Accuracy\n\n`;
      Object.entries(latest.fieldAccuracy).forEach(([field, accuracy]) => {
        const emoji = accuracy > 0.9 ? '🟢' : accuracy > 0.7 ? '🟡' : '🔴';
        content += `- ${emoji} **${field}:** ${(accuracy * 100).toFixed(1)}%\n`;
      });
      content += '\n';

      content += `### Performance\n\n`;
      content += `- **Avg Execution Time:** ${latest.executionTimeStats.avg.toFixed(0)}ms\n`;
      content += `- **Min/Max:** ${latest.executionTimeStats.min}ms / ${latest.executionTimeStats.max}ms\n\n`;

      // Top Failure Buckets
      if (latest.topFailureBuckets.length > 0) {
        content += `### Top Failure Patterns\n\n`;
        latest.topFailureBuckets.slice(0, 5).forEach((bucket, index) => {
          content += `${index + 1}. **${bucket.bucket}:** ${bucket.count} cases (${bucket.percentage.toFixed(1)}%)\n`;
        });
        content += '\n';
      }
    }

    // Historical Data (if multiple data points)
    if (report.dataPoints.length > 1) {
      content += `## Historical Trend\n\n`;
      content += `| Date | Pass Rate | Parser Version |\n`;
      content += `|------|-----------|----------------|\n`;
      
      report.dataPoints.slice(-10).forEach(data => {
        content += `| ${data.date} | ${(data.passRate * 100).toFixed(1)}% | ${data.parserVersion} |\n`;
      });
      content += '\n';
    }

    return content;
  }
}

// Main execution function
export async function analyzeEvaluationLogs(): Promise<void> {
  const analyzer = new EvaluationLogAnalyzer();
  await analyzer.analyzeLogs();
}

// CLI execution
if (require.main === module) {
  analyzeEvaluationLogs()
    .then(() => {
      console.log('✅ Log analysis completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Log analysis failed:', error);
      process.exit(1);
    });
}
