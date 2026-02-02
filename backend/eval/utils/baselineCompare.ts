/**
 * Baseline Comparison and Regression Detection
 * Compares evaluation results against established baselines
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface BaselineMetrics {
  timestamp: string;
  parserVersion: string;
  datasetId: string;
  passRate: number;
  fieldAccuracy: Record<string, number>;
  averageConfidence: Record<string, number>;
  fallbackUsage: Record<string, number>;
  executionTimeAvg: number;
  totalCases: number;
}

export interface RegressionThresholds {
  passRateMin: number;              // Minimum acceptable pass rate (e.g., 0.85)
  fieldAccuracyMin: Record<string, number>; // Minimum field accuracy by field
  fallbackUsageMax: Record<string, number>; // Maximum fallback usage by field
  executionTimeMaxMs: number;       // Maximum average execution time
  confidenceMin: Record<string, number>;    // Minimum confidence by field
}

export interface ComparisonResult {
  passed: boolean;
  current: BaselineMetrics;
  baseline: BaselineMetrics;
  regressions: Regression[];
  improvements: Improvement[];
  summary: string;
}

export interface Regression {
  metric: string;
  field?: string;
  baselineValue: number;
  currentValue: number;
  change: number;
  severity: 'critical' | 'major' | 'minor';
  description: string;
}

export interface Improvement {
  metric: string;
  field?: string;
  baselineValue: number;
  currentValue: number;
  change: number;
  description: string;
}

// Default regression thresholds
const DEFAULT_THRESHOLDS: RegressionThresholds = {
  passRateMin: 0.85,
  fieldAccuracyMin: {
    name: 0.80,
    category: 0.85,
    urgencyLevel: 0.75,
    goalAmount: 0.80,
    missingFields: 0.90
  },
  fallbackUsageMax: {
    name: 0.30,
    category: 0.20,
    urgencyLevel: 0.40,
    goalAmount: 0.25
  },
  executionTimeMaxMs: 2000,
  confidenceMin: {
    name: 0.60,
    category: 0.70,
    urgencyLevel: 0.60,
    goalAmount: 0.65
  }
};

/**
 * Extracts baseline metrics from evaluation results
 */
export function extractBaselineMetrics(evaluationResult: any): BaselineMetrics {
  const summary = evaluationResult.summary;
  
  // Calculate average execution time
  const executionTimes = evaluationResult.cases
    .map((c: any) => c.executionTime)
    .filter((t: number) => t !== undefined);
  
  const executionTimeAvg = executionTimes.length > 0 
    ? executionTimes.reduce((a: number, b: number) => a + b, 0) / executionTimes.length
    : 0;

  return {
    timestamp: evaluationResult.timestamp,
    parserVersion: evaluationResult.parserVersion,
    datasetId: evaluationResult.datasetId,
    passRate: summary.passRate,
    fieldAccuracy: summary.fieldAccuracy || {},
    averageConfidence: summary.averageConfidence || {},
    fallbackUsage: summary.fallbackUsage || {},
    executionTimeAvg,
    totalCases: summary.totalCases
  };
}

/**
 * Saves baseline metrics to file
 */
export async function saveBaseline(
  baselineMetrics: BaselineMetrics,
  baselineDir: string
): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const baselineFile = path.join(baselineDir, `baseline-${timestamp}.json`);
  const latestFile = path.join(baselineDir, 'baseline-latest.json');

  // Save timestamped baseline
  await fs.writeFile(baselineFile, JSON.stringify(baselineMetrics, null, 2));
  
  // Update latest baseline
  await fs.writeFile(latestFile, JSON.stringify(baselineMetrics, null, 2));
  
  console.log(`💾 Baseline saved: ${baselineFile}`);
  console.log(`💾 Latest baseline updated: ${latestFile}`);
}

/**
 * Loads the latest baseline from file
 */
export async function loadBaseline(baselineDir: string): Promise<BaselineMetrics | null> {
  const latestFile = path.join(baselineDir, 'baseline-latest.json');
  
  try {
    const content = await fs.readFile(latestFile, 'utf-8');
    return JSON.parse(content) as BaselineMetrics;
  } catch (error) {
    console.warn(`No baseline found at ${latestFile}`);
    return null;
  }
}

/**
 * Compares current metrics against baseline
 */
export function compareWithBaseline(
  current: BaselineMetrics,
  baseline: BaselineMetrics,
  thresholds: RegressionThresholds = DEFAULT_THRESHOLDS
): ComparisonResult {
  const regressions: Regression[] = [];
  const improvements: Improvement[] = [];

  // Compare overall pass rate
  const passRateChange = current.passRate - baseline.passRate;
  if (current.passRate < thresholds.passRateMin || passRateChange < -0.05) {
    regressions.push({
      metric: 'passRate',
      baselineValue: baseline.passRate,
      currentValue: current.passRate,
      change: passRateChange,
      severity: passRateChange < -0.10 ? 'critical' : passRateChange < -0.05 ? 'major' : 'minor',
      description: `Pass rate decreased by ${Math.abs(passRateChange * 100).toFixed(1)}%`
    });
  } else if (passRateChange > 0.02) {
    improvements.push({
      metric: 'passRate',
      baselineValue: baseline.passRate,
      currentValue: current.passRate,
      change: passRateChange,
      description: `Pass rate improved by ${(passRateChange * 100).toFixed(1)}%`
    });
  }

  // Compare field accuracy
  Object.keys(baseline.fieldAccuracy).forEach(field => {
    const baselineAccuracy = baseline.fieldAccuracy[field];
    const currentAccuracy = current.fieldAccuracy[field] || 0;
    const change = currentAccuracy - baselineAccuracy;
    const minThreshold = thresholds.fieldAccuracyMin[field];

    if (currentAccuracy < minThreshold || change < -0.05) {
      regressions.push({
        metric: 'fieldAccuracy',
        field,
        baselineValue: baselineAccuracy,
        currentValue: currentAccuracy,
        change,
        severity: change < -0.15 ? 'critical' : change < -0.10 ? 'major' : 'minor',
        description: `${field} accuracy decreased by ${Math.abs(change * 100).toFixed(1)}%`
      });
    } else if (change > 0.03) {
      improvements.push({
        metric: 'fieldAccuracy',
        field,
        baselineValue: baselineAccuracy,
        currentValue: currentAccuracy,
        change,
        description: `${field} accuracy improved by ${(change * 100).toFixed(1)}%`
      });
    }
  });

  // Compare average confidence
  Object.keys(baseline.averageConfidence).forEach(field => {
    const baselineConfidence = baseline.averageConfidence[field];
    const currentConfidence = current.averageConfidence[field] || 0;
    const change = currentConfidence - baselineConfidence;
    const minThreshold = thresholds.confidenceMin[field];

    if (currentConfidence < minThreshold || change < -0.10) {
      regressions.push({
        metric: 'averageConfidence',
        field,
        baselineValue: baselineConfidence,
        currentValue: currentConfidence,
        change,
        severity: change < -0.20 ? 'major' : 'minor',
        description: `${field} confidence decreased by ${Math.abs(change * 100).toFixed(1)}%`
      });
    } else if (change > 0.05) {
      improvements.push({
        metric: 'averageConfidence',
        field,
        baselineValue: baselineConfidence,
        currentValue: currentConfidence,
        change,
        description: `${field} confidence improved by ${(change * 100).toFixed(1)}%`
      });
    }
  });

  // Compare fallback usage
  Object.keys(baseline.fallbackUsage).forEach(field => {
    const baselineFallback = baseline.fallbackUsage[field];
    const currentFallback = current.fallbackUsage[field] || 0;
    const change = currentFallback - baselineFallback;
    const maxThreshold = thresholds.fallbackUsageMax[field];

    if (currentFallback > maxThreshold || change > 0.10) {
      regressions.push({
        metric: 'fallbackUsage',
        field,
        baselineValue: baselineFallback,
        currentValue: currentFallback,
        change,
        severity: change > 0.20 ? 'major' : 'minor',
        description: `${field} fallback usage increased by ${(change * 100).toFixed(1)}%`
      });
    } else if (change < -0.05) {
      improvements.push({
        metric: 'fallbackUsage',
        field,
        baselineValue: baselineFallback,
        currentValue: currentFallback,
        change,
        description: `${field} fallback usage decreased by ${Math.abs(change * 100).toFixed(1)}%`
      });
    }
  });

  // Compare execution time
  const timeChange = current.executionTimeAvg - baseline.executionTimeAvg;
  if (current.executionTimeAvg > thresholds.executionTimeMaxMs || timeChange > baseline.executionTimeAvg * 0.25) {
    regressions.push({
      metric: 'executionTime',
      baselineValue: baseline.executionTimeAvg,
      currentValue: current.executionTimeAvg,
      change: timeChange,
      severity: timeChange > baseline.executionTimeAvg * 0.50 ? 'major' : 'minor',
      description: `Execution time increased by ${timeChange.toFixed(0)}ms (${((timeChange / baseline.executionTimeAvg) * 100).toFixed(1)}%)`
    });
  } else if (timeChange < -baseline.executionTimeAvg * 0.10) {
    improvements.push({
      metric: 'executionTime',
      baselineValue: baseline.executionTimeAvg,
      currentValue: current.executionTimeAvg,
      change: timeChange,
      description: `Execution time improved by ${Math.abs(timeChange).toFixed(0)}ms (${Math.abs((timeChange / baseline.executionTimeAvg) * 100).toFixed(1)}%)`
    });
  }

  // Determine overall status
  const criticalRegressions = regressions.filter(r => r.severity === 'critical').length;
  const majorRegressions = regressions.filter(r => r.severity === 'major').length;
  const passed = criticalRegressions === 0 && majorRegressions === 0;

  // Generate summary
  const summary = generateComparisonSummary(passed, regressions, improvements);

  return {
    passed,
    current,
    baseline,
    regressions,
    improvements,
    summary
  };
}

/**
 * Generates a human-readable comparison summary
 */
function generateComparisonSummary(
  passed: boolean,
  regressions: Regression[],
  improvements: Improvement[]
): string {
  let summary = '';

  if (passed) {
    summary = '✅ Baseline comparison PASSED - no significant regressions detected';
  } else {
    const criticalCount = regressions.filter(r => r.severity === 'critical').length;
    const majorCount = regressions.filter(r => r.severity === 'major').length;
    
    summary = `❌ Baseline comparison FAILED - ${criticalCount} critical, ${majorCount} major regressions`;
  }

  if (improvements.length > 0) {
    summary += ` (${improvements.length} improvements detected)`;
  }

  return summary;
}

/**
 * Generates detailed baseline comparison report
 */
export function generateComparisonReport(comparison: ComparisonResult): string {
  let report = '# Baseline Comparison Report\n\n';
  report += `**Comparison Date:** ${new Date().toISOString()}\n`;
  report += `**Status:** ${comparison.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `**Summary:** ${comparison.summary}\n\n`;

  // Baseline vs Current overview
  report += '## Metrics Overview\n\n';
  report += '| Metric | Baseline | Current | Change |\n';
  report += '|--------|----------|---------|--------|\n';
  
  const passRateChange = comparison.current.passRate - comparison.baseline.passRate;
  const passRateChangeStr = passRateChange > 0 ? `+${(passRateChange * 100).toFixed(1)}%` : `${(passRateChange * 100).toFixed(1)}%`;
  report += `| Pass Rate | ${(comparison.baseline.passRate * 100).toFixed(1)}% | ${(comparison.current.passRate * 100).toFixed(1)}% | ${passRateChangeStr} |\n`;
  
  const timeChange = comparison.current.executionTimeAvg - comparison.baseline.executionTimeAvg;
  const timeChangeStr = timeChange > 0 ? `+${timeChange.toFixed(0)}ms` : `${timeChange.toFixed(0)}ms`;
  report += `| Avg Execution Time | ${comparison.baseline.executionTimeAvg.toFixed(0)}ms | ${comparison.current.executionTimeAvg.toFixed(0)}ms | ${timeChangeStr} |\n`;
  
  report += '\n';

  // Regressions section
  if (comparison.regressions.length > 0) {
    report += '## ❌ Regressions Detected\n\n';
    
    const critical = comparison.regressions.filter(r => r.severity === 'critical');
    const major = comparison.regressions.filter(r => r.severity === 'major');
    const minor = comparison.regressions.filter(r => r.severity === 'minor');

    if (critical.length > 0) {
      report += '### 🚨 Critical Regressions\n\n';
      critical.forEach((regression, index) => {
        report += `${index + 1}. **${regression.metric}${regression.field ? ` (${regression.field})` : ''}:** ${regression.description}\n`;
        report += `   - Baseline: ${regression.baselineValue.toFixed(3)}\n`;
        report += `   - Current: ${regression.currentValue.toFixed(3)}\n`;
        report += `   - Change: ${regression.change.toFixed(3)}\n\n`;
      });
    }

    if (major.length > 0) {
      report += '### ⚠️ Major Regressions\n\n';
      major.forEach((regression, index) => {
        report += `${index + 1}. **${regression.metric}${regression.field ? ` (${regression.field})` : ''}:** ${regression.description}\n`;
        report += `   - Baseline: ${regression.baselineValue.toFixed(3)}\n`;
        report += `   - Current: ${regression.currentValue.toFixed(3)}\n`;
        report += `   - Change: ${regression.change.toFixed(3)}\n\n`;
      });
    }

    if (minor.length > 0) {
      report += '### ℹ️ Minor Regressions\n\n';
      minor.forEach((regression, index) => {
        report += `${index + 1}. **${regression.metric}${regression.field ? ` (${regression.field})` : ''}:** ${regression.description}\n`;
      });
      report += '\n';
    }
  }

  // Improvements section
  if (comparison.improvements.length > 0) {
    report += '## ✅ Improvements Detected\n\n';
    comparison.improvements.forEach((improvement, index) => {
      report += `${index + 1}. **${improvement.metric}${improvement.field ? ` (${improvement.field})` : ''}:** ${improvement.description}\n`;
    });
    report += '\n';
  }

  // Action items
  if (!comparison.passed) {
    report += '## 🔧 Required Actions\n\n';
    report += '1. **Immediate:** Address critical regressions before deployment\n';
    report += '2. **Priority:** Investigate and fix major regressions\n';
    report += '3. **Review:** Analyze root causes of performance degradation\n';
    report += '4. **Retest:** Run evaluation again after fixes\n\n';
  } else {
    report += '## 🎉 Next Steps\n\n';
    report += '1. **Deploy:** Changes are safe for production deployment\n';
    report += '2. **Monitor:** Continue tracking metrics in production\n';
    report += '3. **Optimize:** Consider addressing minor regressions in future iterations\n\n';
  }

  return report;
}

/**
 * CLI function for baseline comparison
 */
export async function runBaselineComparison(
  evaluationResultPath: string,
  baselineDir: string
): Promise<void> {
  console.log('📊 Comparing evaluation results with baseline...');

  try {
    // Load current evaluation results
    const resultContent = await fs.readFile(evaluationResultPath, 'utf-8');
    const evaluationResult = JSON.parse(resultContent);
    const currentMetrics = extractBaselineMetrics(evaluationResult);

    // Load baseline
    const baselineMetrics = await loadBaseline(baselineDir);
    if (!baselineMetrics) {
      console.log('📋 No baseline found - establishing new baseline');
      await saveBaseline(currentMetrics, baselineDir);
      console.log('✅ Baseline established successfully');
      return;
    }

    // Compare metrics
    const comparison = compareWithBaseline(currentMetrics, baselineMetrics);
    
    // Display results
    console.log(`\n${comparison.summary}`);
    
    if (!comparison.passed) {
      console.log(`\n❌ Regressions detected:`);
      comparison.regressions.forEach(regression => {
        const severity = regression.severity === 'critical' ? '🚨' : 
                        regression.severity === 'major' ? '⚠️' : 'ℹ️';
        console.log(`  ${severity} ${regression.description}`);
      });
    }

    if (comparison.improvements.length > 0) {
      console.log(`\n✅ Improvements detected:`);
      comparison.improvements.forEach(improvement => {
        console.log(`  📈 ${improvement.description}`);
      });
    }

    // Save comparison report
    const reportContent = generateComparisonReport(comparison);
    const reportPath = path.join(baselineDir, 'baseline-comparison-report.md');
    await fs.writeFile(reportPath, reportContent);
    console.log(`📄 Comparison report saved: ${reportPath}`);

    // Exit with error code if regressions detected
    if (!comparison.passed) {
      console.error('\n❌ Baseline comparison failed due to regressions');
      process.exit(1);
    } else {
      console.log('\n✅ Baseline comparison passed');
    }

  } catch (error) {
    console.error(`Failed to compare with baseline: ${error}`);
    process.exit(1);
  }
}