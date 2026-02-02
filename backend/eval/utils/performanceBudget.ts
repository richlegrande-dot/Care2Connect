/**
 * Performance Budget and Timeout Management
 * Ensures evaluation runs stay within acceptable performance bounds
 */

export interface PerformanceBudget {
  maxExecutionTimeMs: number;      // Maximum time per test case
  maxTotalRuntimeMs: number;       // Maximum time for entire evaluation
  maxMemoryUsageMB: number;        // Maximum memory usage
  timeoutGracePeriodMs: number;    // Grace period before hard timeout
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  timestamp: number;
}

export interface TimeoutContext {
  testCaseId: string;
  startTime: number;
  budget: PerformanceBudget;
  timeoutHandle?: NodeJS.Timeout;
}

// Default performance budgets
const DEFAULT_BUDGET: PerformanceBudget = {
  maxExecutionTimeMs: 1000,        // 1 second per test case
  maxTotalRuntimeMs: 30000,        // 30 seconds total
  maxMemoryUsageMB: 512,           // 512MB memory limit
  timeoutGracePeriodMs: 2000       // 2 second grace period
};

/**
 * Performance monitor for individual test cases
 */
export class PerformanceMonitor {
  private budget: PerformanceBudget;
  private startTime: number;
  private testCaseId: string;
  private timeoutHandle?: NodeJS.Timeout;
  private memoryCheckInterval?: NodeJS.Timeout;
  private metrics: PerformanceMetrics[] = [];

  constructor(testCaseId: string, budget: PerformanceBudget = DEFAULT_BUDGET) {
    this.testCaseId = testCaseId;
    this.budget = budget;
    this.startTime = Date.now();
  }

  /**
   * Starts performance monitoring with timeout
   */
  start(): void {
    this.startTime = Date.now();
    
    // Set execution timeout
    this.timeoutHandle = setTimeout(() => {
      this.handleTimeout();
    }, this.budget.maxExecutionTimeMs + this.budget.timeoutGracePeriodMs);

    // Start memory monitoring
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 100); // Check every 100ms
  }

  /**
   * Stops monitoring and returns final metrics
   */
  stop(): PerformanceMetrics {
    const endTime = Date.now();
    const executionTime = endTime - this.startTime;

    // Clear timeouts
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }

    const finalMetrics: PerformanceMetrics = {
      executionTime,
      memoryUsage: this.getCurrentMemoryUsage(),
      timestamp: endTime
    };

    // Check for budget violations
    this.validatePerformance(finalMetrics);

    return finalMetrics;
  }

  /**
   * Records intermediate performance metrics
   */
  recordMetric(): PerformanceMetrics {
    const currentTime = Date.now();
    const metrics: PerformanceMetrics = {
      executionTime: currentTime - this.startTime,
      memoryUsage: this.getCurrentMemoryUsage(),
      timestamp: currentTime
    };

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * Handles execution timeout
   */
  private handleTimeout(): void {
    const executionTime = Date.now() - this.startTime;
    const error = new Error(
      `EVAL_TIMEOUT: Test case ${this.testCaseId} exceeded execution time budget. ` +
      `Executed for ${executionTime}ms, budget was ${this.budget.maxExecutionTimeMs}ms`
    );
    
    (error as any).code = 'EVAL_TIMEOUT';
    (error as any).testCaseId = this.testCaseId;
    (error as any).executionTime = executionTime;
    (error as any).budget = this.budget.maxExecutionTimeMs;
    
    throw error;
  }

  /**
   * Checks memory usage against budget
   */
  private checkMemoryUsage(): void {
    const memoryUsage = this.getCurrentMemoryUsage();
    
    if (memoryUsage > this.budget.maxMemoryUsageMB) {
      const error = new Error(
        `EVAL_MEMORY_EXCEEDED: Test case ${this.testCaseId} exceeded memory budget. ` +
        `Using ${memoryUsage.toFixed(1)}MB, budget was ${this.budget.maxMemoryUsageMB}MB`
      );
      
      (error as any).code = 'EVAL_MEMORY_EXCEEDED';
      (error as any).testCaseId = this.testCaseId;
      (error as any).memoryUsage = memoryUsage;
      (error as any).budget = this.budget.maxMemoryUsageMB;
      
      throw error;
    }
  }

  /**
   * Gets current memory usage in MB
   */
  private getCurrentMemoryUsage(): number {
    const usage = process.memoryUsage();
    return usage.heapUsed / 1024 / 1024; // Convert to MB
  }

  /**
   * Validates final performance metrics against budget
   */
  private validatePerformance(metrics: PerformanceMetrics): void {
    const violations: string[] = [];

    if (metrics.executionTime > this.budget.maxExecutionTimeMs) {
      violations.push(
        `Execution time ${metrics.executionTime}ms exceeds budget ${this.budget.maxExecutionTimeMs}ms`
      );
    }

    if (metrics.memoryUsage > this.budget.maxMemoryUsageMB) {
      violations.push(
        `Memory usage ${metrics.memoryUsage.toFixed(1)}MB exceeds budget ${this.budget.maxMemoryUsageMB}MB`
      );
    }

    if (violations.length > 0) {
      console.warn(`⚠️ Performance budget violations for ${this.testCaseId}:`);
      violations.forEach(violation => console.warn(`  - ${violation}`));
    }
  }
}

/**
 * Global evaluation timeout manager
 */
export class EvaluationTimeoutManager {
  private budget: PerformanceBudget;
  private startTime: number;
  private timeoutHandle?: NodeJS.Timeout;
  private totalCases: number;

  constructor(totalCases: number, budget: PerformanceBudget = DEFAULT_BUDGET) {
    this.totalCases = totalCases;
    this.budget = budget;
    this.startTime = Date.now();
  }

  /**
   * Starts global timeout monitoring
   */
  start(): void {
    this.startTime = Date.now();
    
    // Calculate total timeout based on number of test cases
    const totalTimeout = Math.max(
      this.budget.maxTotalRuntimeMs,
      this.totalCases * this.budget.maxExecutionTimeMs
    );

    this.timeoutHandle = setTimeout(() => {
      this.handleGlobalTimeout();
    }, totalTimeout);

    console.log(`⏱️ Evaluation timeout set to ${(totalTimeout / 1000).toFixed(1)}s for ${this.totalCases} cases`);
  }

  /**
   * Stops global timeout monitoring
   */
  stop(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
  }

  /**
   * Gets elapsed time since start
   */
  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Handles global evaluation timeout
   */
  private handleGlobalTimeout(): void {
    const elapsedTime = this.getElapsedTime();
    const error = new Error(
      `EVAL_GLOBAL_TIMEOUT: Evaluation exceeded total runtime budget. ` +
      `Ran for ${(elapsedTime / 1000).toFixed(1)}s, budget was ${(this.budget.maxTotalRuntimeMs / 1000).toFixed(1)}s`
    );
    
    (error as any).code = 'EVAL_GLOBAL_TIMEOUT';
    (error as any).elapsedTime = elapsedTime;
    (error as any).budget = this.budget.maxTotalRuntimeMs;
    
    throw error;
  }
}

/**
 * Creates a performance monitor for a test case
 */
export function createPerformanceMonitor(
  testCaseId: string,
  customBudget?: Partial<PerformanceBudget>
): PerformanceMonitor {
  const budget = { ...DEFAULT_BUDGET, ...customBudget };
  return new PerformanceMonitor(testCaseId, budget);
}

/**
 * Wrapper function to run code with performance monitoring
 */
export async function withPerformanceMonitoring<T>(
  testCaseId: string,
  fn: () => Promise<T>,
  budget?: Partial<PerformanceBudget>
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const monitor = createPerformanceMonitor(testCaseId, budget);
  
  try {
    monitor.start();
    const result = await fn();
    const metrics = monitor.stop();
    
    return { result, metrics };
  } catch (error) {
    // Ensure monitor is stopped even on error
    try {
      monitor.stop();
    } catch (stopError) {
      // Ignore stop errors, original error is more important
    }
    throw error;
  }
}

/**
 * Analyzes performance metrics across multiple test cases
 */
export function analyzePerformanceMetrics(metrics: PerformanceMetrics[]): {
  average: PerformanceMetrics;
  min: PerformanceMetrics;
  max: PerformanceMetrics;
  violations: number;
  recommendations: string[];
} {
  if (metrics.length === 0) {
    return {
      average: { executionTime: 0, memoryUsage: 0, timestamp: 0 },
      min: { executionTime: 0, memoryUsage: 0, timestamp: 0 },
      max: { executionTime: 0, memoryUsage: 0, timestamp: 0 },
      violations: 0,
      recommendations: ['No performance data available']
    };
  }

  // Calculate statistics
  const executionTimes = metrics.map(m => m.executionTime);
  const memoryUsages = metrics.map(m => m.memoryUsage);

  const average: PerformanceMetrics = {
    executionTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
    memoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
    timestamp: Date.now()
  };

  const min: PerformanceMetrics = {
    executionTime: Math.min(...executionTimes),
    memoryUsage: Math.min(...memoryUsages),
    timestamp: 0
  };

  const max: PerformanceMetrics = {
    executionTime: Math.max(...executionTimes),
    memoryUsage: Math.max(...memoryUsages),
    timestamp: 0
  };

  // Count budget violations
  const violations = metrics.filter(m => 
    m.executionTime > DEFAULT_BUDGET.maxExecutionTimeMs ||
    m.memoryUsage > DEFAULT_BUDGET.maxMemoryUsageMB
  ).length;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (average.executionTime > DEFAULT_BUDGET.maxExecutionTimeMs * 0.8) {
    recommendations.push('Consider optimizing parsing algorithms - average execution time is high');
  }
  
  if (max.executionTime > DEFAULT_BUDGET.maxExecutionTimeMs * 1.5) {
    recommendations.push('Some test cases are significantly slower - investigate performance bottlenecks');
  }
  
  if (average.memoryUsage > DEFAULT_BUDGET.maxMemoryUsageMB * 0.7) {
    recommendations.push('Memory usage is approaching budget limits - review memory efficiency');
  }
  
  if (violations > metrics.length * 0.1) {
    recommendations.push('High number of budget violations - consider adjusting performance budgets or optimizing code');
  }

  return {
    average,
    min,
    max,
    violations,
    recommendations
  };
}

/**
 * Generates performance budget report
 */
export function generatePerformanceReport(
  metrics: PerformanceMetrics[],
  budget: PerformanceBudget = DEFAULT_BUDGET
): string {
  const analysis = analyzePerformanceMetrics(metrics);
  
  let report = '# Performance Budget Report\n\n';
  report += `**Report Date:** ${new Date().toISOString()}\n`;
  report += `**Test Cases:** ${metrics.length}\n`;
  report += `**Budget Violations:** ${analysis.violations}\n\n`;

  report += '## Performance Budget\n\n';
  report += `- **Max Execution Time:** ${budget.maxExecutionTimeMs}ms per case\n`;
  report += `- **Max Memory Usage:** ${budget.maxMemoryUsageMB}MB per case\n`;
  report += `- **Max Total Runtime:** ${(budget.maxTotalRuntimeMs / 1000).toFixed(1)}s\n\n`;

  report += '## Performance Statistics\n\n';
  report += '| Metric | Average | Min | Max | Budget | Status |\n';
  report += '|--------|---------|-----|-----|--------|---------|\n';
  
  const execStatus = analysis.average.executionTime <= budget.maxExecutionTimeMs ? '✅' : '❌';
  report += `| Execution Time | ${analysis.average.executionTime.toFixed(0)}ms | ${analysis.min.executionTime}ms | ${analysis.max.executionTime}ms | ${budget.maxExecutionTimeMs}ms | ${execStatus} |\n`;
  
  const memStatus = analysis.average.memoryUsage <= budget.maxMemoryUsageMB ? '✅' : '❌';
  report += `| Memory Usage | ${analysis.average.memoryUsage.toFixed(1)}MB | ${analysis.min.memoryUsage.toFixed(1)}MB | ${analysis.max.memoryUsage.toFixed(1)}MB | ${budget.maxMemoryUsageMB}MB | ${memStatus} |\n`;
  
  report += '\n';

  if (analysis.violations > 0) {
    report += '## ⚠️ Budget Violations\n\n';
    report += `${analysis.violations} out of ${metrics.length} test cases exceeded performance budgets.\n\n`;
    
    const violationRate = (analysis.violations / metrics.length) * 100;
    if (violationRate > 20) {
      report += '🚨 **High violation rate detected!** Consider optimizing parsing performance or adjusting budgets.\n\n';
    } else if (violationRate > 10) {
      report += '⚠️ **Moderate violation rate.** Some optimization may be beneficial.\n\n';
    }
  } else {
    report += '## ✅ No Budget Violations\n\n';
    report += 'All test cases completed within performance budgets.\n\n';
  }

  if (analysis.recommendations.length > 0) {
    report += '## 📋 Recommendations\n\n';
    analysis.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += '\n';
  }

  return report;
}

/**
 * Default performance budgets for different evaluation modes
 */
export const PERFORMANCE_BUDGETS = {
  DEVELOPMENT: {
    maxExecutionTimeMs: 2000,    // More lenient for dev
    maxTotalRuntimeMs: 60000,    // 1 minute total
    maxMemoryUsageMB: 1024,      // 1GB memory
    timeoutGracePeriodMs: 5000   // 5 second grace
  },
  
  CI: {
    maxExecutionTimeMs: 1500,    // CI budget
    maxTotalRuntimeMs: 45000,    // 45 seconds total
    maxMemoryUsageMB: 512,       // 512MB memory
    timeoutGracePeriodMs: 3000   // 3 second grace
  },
  
  PRODUCTION: {
    maxExecutionTimeMs: 1000,    // Strict production budget
    maxTotalRuntimeMs: 30000,    // 30 seconds total
    maxMemoryUsageMB: 256,       // 256MB memory
    timeoutGracePeriodMs: 2000   // 2 second grace
  }
};