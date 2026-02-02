/**
 * Mock Telemetry Helper for Testing
 * 
 * Provides controlled telemetry instance for testing without side effects
 */

import { TelemetryCollector } from '../../src/services/telemetry';

export interface MockTelemetryData {
  parsing: Array<{
    sessionId: string;
    extractionDuration: number;
    transcriptLength: number;
    qualityScore: number;
    fallbacksUsed: string[];
  }>;
  document: Array<{
    sessionId: string;
    generationDuration: number;
    documentSize: number;
    fallbackUsed: boolean;
  }>;
  system: Array<{
    timestamp: number;
    memoryUsage: object;
    cacheHitRate: number;
  }>;
}

/**
 * Mock telemetry collector that captures data without persistence
 */
export class MockTelemetryCollector {
  private data: MockTelemetryData = {
    parsing: [],
    document: [],
    system: []
  };
  
  /**
   * Record parsing metrics (mirrors TelemetryCollector interface)
   */
  recordParsingMetrics(sessionId: string, metrics: any): void {
    this.data.parsing.push({
      sessionId,
      extractionDuration: metrics.extractionDuration,
      transcriptLength: metrics.transcriptLength,
      qualityScore: metrics.qualityScore,
      fallbacksUsed: metrics.fallbacksUsed || []
    });
  }
  
  /**
   * Record document generation metrics
   */
  recordDocumentMetrics(sessionId: string, metrics: any): void {
    this.data.document.push({
      sessionId,
      generationDuration: metrics.generationDuration,
      documentSize: metrics.documentSize,
      fallbackUsed: metrics.fallbackUsed || false
    });
  }
  
  /**
   * Get dashboard metrics (simplified for testing)
   */
  getDashboardMetrics(): any {
    return {
      parsing: {
        totalExtractions: this.data.parsing.length,
        averageConfidence: this.calculateAverageConfidence(),
        averageDuration: this.calculateAverageDuration(),
        fallbackRate: this.calculateFallbackRate()
      },
      document: {
        totalGenerations: this.data.document.length,
        averageSize: this.calculateAverageDocumentSize(),
        fallbackRate: this.calculateDocumentFallbackRate()
      },
      system: {
        healthStatus: 'healthy'
      }
    };
  }
  
  /**
   * Export Prometheus metrics (minimal for testing)
   */
  exportPrometheusMetrics(): string {
    return `# TYPE parsing_total counter
parsing_total ${this.data.parsing.length}
# TYPE document_total counter  
document_total ${this.data.document.length}
# TYPE parsing_confidence_avg gauge
parsing_confidence_avg ${this.calculateAverageConfidence()}
`;
  }
  
  /**
   * Get health status
   */
  getHealthStatus(): any {
    return {
      status: 'healthy',
      checks: {
        parsing: this.data.parsing.length > 0 ? 'active' : 'idle',
        document: this.data.document.length > 0 ? 'active' : 'idle'
      }
    };
  }
  
  /**
   * Clear all collected data
   */
  clear(): void {
    this.data = {
      parsing: [],
      document: [],
      system: []
    };
  }
  
  /**
   * Get raw collected data for assertions
   */
  getRawData(): MockTelemetryData {
    return this.data;
  }
  
  /**
   * Flush metrics (no-op for mock)
   */
  flushMetrics(): void {
    // No-op for testing
  }
  
  private calculateAverageConfidence(): number {
    if (this.data.parsing.length === 0) return 0;
    const total = this.data.parsing.reduce((sum, p) => sum + p.qualityScore, 0);
    return total / this.data.parsing.length;
  }
  
  private calculateAverageDuration(): number {
    if (this.data.parsing.length === 0) return 0;
    const total = this.data.parsing.reduce((sum, p) => sum + p.extractionDuration, 0);
    return total / this.data.parsing.length;
  }
  
  private calculateFallbackRate(): number {
    if (this.data.parsing.length === 0) return 0;
    const withFallbacks = this.data.parsing.filter(p => p.fallbacksUsed.length > 0).length;
    return withFallbacks / this.data.parsing.length;
  }
  
  private calculateAverageDocumentSize(): number {
    if (this.data.document.length === 0) return 0;
    const total = this.data.document.reduce((sum, d) => sum + d.documentSize, 0);
    return total / this.data.document.length;
  }
  
  private calculateDocumentFallbackRate(): number {
    if (this.data.document.length === 0) return 0;
    const withFallbacks = this.data.document.filter(d => d.fallbackUsed).length;
    return withFallbacks / this.data.document.length;
  }
}

/**
 * Create and configure a mock telemetry instance
 */
export function createMockTelemetry(): MockTelemetryCollector {
  return new MockTelemetryCollector();
}

/**
 * Replace global telemetry instance with mock for testing
 */
export function mockTelemetryGlobally(): MockTelemetryCollector {
  const mockTelemetry = createMockTelemetry();
  
  // Mock the getInstance method
  const originalGetInstance = TelemetryCollector.getInstance;
  TelemetryCollector.getInstance = jest.fn().mockReturnValue(mockTelemetry);
  
  return mockTelemetry;
}

/**
 * Restore original telemetry instance
 */
export function restoreTelemetry(): void {
  if (jest.isMockFunction(TelemetryCollector.getInstance)) {
    (TelemetryCollector.getInstance as jest.Mock).mockRestore();
  }
}

/**
 * Assert telemetry recorded specific metrics
 */
export function assertTelemetryRecorded(
  telemetry: MockTelemetryCollector,
  expectedMetrics: {
    parsingSessions?: number;
    documentGenerations?: number;
    averageQuality?: number;
    fallbacksUsed?: string[];
  }
): void {
  const data = telemetry.getRawData();
  
  if (expectedMetrics.parsingSessions !== undefined) {
    expect(data.parsing.length).toBe(expectedMetrics.parsingSessions);
  }
  
  if (expectedMetrics.documentGenerations !== undefined) {
    expect(data.document.length).toBe(expectedMetrics.documentGenerations);
  }
  
  if (expectedMetrics.averageQuality !== undefined) {
    const avgQuality = telemetry.getDashboardMetrics().parsing.averageConfidence;
    expect(avgQuality).toBeCloseTo(expectedMetrics.averageQuality, 1);
  }
  
  if (expectedMetrics.fallbacksUsed) {
    const allFallbacks = data.parsing.flatMap(p => p.fallbacksUsed);
    for (const expectedFallback of expectedMetrics.fallbacksUsed) {
      expect(allFallbacks).toContain(expectedFallback);
    }
  }
}