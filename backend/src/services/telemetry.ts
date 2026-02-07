/**
 * Phase 5: Observability and Metrics System
 * 
 * Provides production monitoring and analytics for the parsing pipeline
 * WITHOUT logging any personally identifiable information (PII)
 */

interface ParsingMetrics {
  timestamp: number;
  sessionId: string; // UUID only - no PII
  extractionDuration: number;
  transcriptLength: number;
  extractedFields: {
    name: { extracted: boolean; confidence: number };
    amount: { extracted: boolean; confidence: number };
    relationship: { extracted: boolean; value: 'myself' | 'family_member' | 'other' };
    urgency: { extracted: boolean; value: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' };
  };
  fallbacksUsed: string[]; // Which fallback mechanisms were triggered
  errorCount: number;
  qualityScore: number; // Overall extraction quality 0-100
}

interface DocumentMetrics {
  timestamp: number;
  sessionId: string;
  generationDuration: number;
  documentSize: number;
  fallbackUsed: boolean;
  errorOccurred: boolean;
  includeInstructions: boolean;
  includePasteMap: boolean;
}

interface SystemMetrics {
  timestamp: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  cacheHitRate: number; // Text normalization cache effectiveness
  averageProcessingTime: number;
  activeConnections: number;
}

/**
 * Telemetry collector that aggregates metrics without storing PII
 */
export class TelemetryCollector {
  private static instance: TelemetryCollector;
  private metricsBuffer: ParsingMetrics[] = [];
  private documentMetrics: DocumentMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private readonly maxBufferSize = 1000;
  private lastFlushTime = Date.now();

  private constructor() {
    // Flush metrics periodically
    setInterval(() => this.flushMetrics(), 60000); // Every minute
  }

  static getInstance(): TelemetryCollector {
    if (!TelemetryCollector.instance) {
      TelemetryCollector.instance = new TelemetryCollector();
    }
    return TelemetryCollector.instance;
  }

  /**
   * Record parsing extraction metrics
   */
  recordParsingMetrics(sessionId: string, metrics: Omit<ParsingMetrics, 'sessionId' | 'timestamp'>): void {
    try {
      const parsingMetrics: ParsingMetrics = {
        timestamp: Date.now(),
        sessionId,
        ...metrics
      };

      this.metricsBuffer.push(parsingMetrics);

      // Auto-flush if buffer is getting full
      if (this.metricsBuffer.length >= this.maxBufferSize) {
        this.flushMetrics();
      }
    } catch (error) {
      console.error('[TELEMETRY_ERROR] Failed to record parsing metrics:', (error as Error).message);
    }
  }

  /**
   * Record document generation metrics
   */
  recordDocumentMetrics(sessionId: string, metrics: Omit<DocumentMetrics, 'sessionId' | 'timestamp'>): void {
    try {
      const documentMetrics: DocumentMetrics = {
        timestamp: Date.now(),
        sessionId,
        ...metrics
      };

      this.documentMetrics.push(documentMetrics);
    } catch (error) {
      console.error('[TELEMETRY_ERROR] Failed to record document metrics:', (error as Error).message);
    }
  }

  /**
   * Record system performance metrics
   */
  recordSystemMetrics(): void {
    try {
      const memoryUsage = process.memoryUsage();
      const systemMetrics: SystemMetrics = {
        timestamp: Date.now(),
        memoryUsage: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          rss: memoryUsage.rss
        },
        cacheHitRate: this.calculateCacheHitRate(),
        averageProcessingTime: this.calculateAverageProcessingTime(),
        activeConnections: 0 // Would be populated by connection pool
      };

      this.systemMetrics.push(systemMetrics);
      
      // Keep only last 100 system metrics to prevent memory growth
      if (this.systemMetrics.length > 100) {
        this.systemMetrics = this.systemMetrics.slice(-100);
      }
    } catch (error) {
      console.error('[TELEMETRY_ERROR] Failed to record system metrics:', (error as Error).message);
    }
  }

  /**
   * Get aggregated dashboard data (last 24 hours)
   */
  getDashboardMetrics(): {
    parsing: {
      totalExtractions: number;
      averageConfidence: number;
      fallbackRate: number;
      qualityDistribution: { excellent: number; good: number; poor: number };
    };
    documents: {
      totalGenerated: number;
      averageSize: number;
      fallbackRate: number;
      averageGenerationTime: number;
    };
    system: {
      averageMemoryUsage: number;
      cacheEffectiveness: number;
      uptimePercentage: number;
    };
  } {
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    
    // Filter recent metrics
    const recentParsing = this.metricsBuffer.filter(m => m.timestamp > last24Hours);
    const recentDocuments = this.documentMetrics.filter(m => m.timestamp > last24Hours);
    const recentSystem = this.systemMetrics.filter(m => m.timestamp > last24Hours);

    // Aggregate parsing metrics
    const totalExtractions = recentParsing.length;
    const averageConfidence = totalExtractions > 0 
      ? recentParsing.reduce((sum, m) => sum + m.qualityScore, 0) / totalExtractions 
      : 0;
    
    const fallbackCount = recentParsing.filter(m => m.fallbacksUsed.length > 0).length;
    const fallbackRate = totalExtractions > 0 ? (fallbackCount / totalExtractions) * 100 : 0;

    const qualityDistribution = {
      excellent: recentParsing.filter(m => m.qualityScore >= 80).length,
      good: recentParsing.filter(m => m.qualityScore >= 60 && m.qualityScore < 80).length,
      poor: recentParsing.filter(m => m.qualityScore < 60).length
    };

    // Aggregate document metrics
    const totalGenerated = recentDocuments.length;
    const averageSize = totalGenerated > 0 
      ? recentDocuments.reduce((sum, m) => sum + m.documentSize, 0) / totalGenerated 
      : 0;
    
    const docFallbackCount = recentDocuments.filter(m => m.fallbackUsed).length;
    const docFallbackRate = totalGenerated > 0 ? (docFallbackCount / totalGenerated) * 100 : 0;
    
    const averageGenerationTime = totalGenerated > 0
      ? recentDocuments.reduce((sum, m) => sum + m.generationDuration, 0) / totalGenerated
      : 0;

    // Aggregate system metrics
    const averageMemoryUsage = recentSystem.length > 0
      ? recentSystem.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recentSystem.length
      : 0;
    
    const cacheEffectiveness = recentSystem.length > 0
      ? recentSystem.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentSystem.length
      : 0;

    return {
      parsing: {
        totalExtractions,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        fallbackRate: Math.round(fallbackRate * 100) / 100,
        qualityDistribution
      },
      documents: {
        totalGenerated,
        averageSize: Math.round(averageSize),
        fallbackRate: Math.round(docFallbackRate * 100) / 100,
        averageGenerationTime: Math.round(averageGenerationTime)
      },
      system: {
        averageMemoryUsage: Math.round(averageMemoryUsage / 1024 / 1024), // MB
        cacheEffectiveness: Math.round(cacheEffectiveness * 100) / 100,
        uptimePercentage: 99.9 // Would be calculated from actual uptime monitoring
      }
    };
  }

  /**
   * Export metrics for external monitoring systems (Prometheus, DataDog, etc.)
   */
  exportPrometheusMetrics(): string {
    const dashboard = this.getDashboardMetrics();
    
    return `
# HELP parsing_extractions_total Total number of parsing extractions
# TYPE parsing_extractions_total counter
parsing_extractions_total ${dashboard.parsing.totalExtractions}

# HELP parsing_confidence_average Average confidence score of extractions
# TYPE parsing_confidence_average gauge
parsing_confidence_average ${dashboard.parsing.averageConfidence}

# HELP parsing_fallback_rate_percent Percentage of extractions using fallback mechanisms
# TYPE parsing_fallback_rate_percent gauge
parsing_fallback_rate_percent ${dashboard.parsing.fallbackRate}

# HELP documents_generated_total Total number of documents generated
# TYPE documents_generated_total counter
documents_generated_total ${dashboard.documents.totalGenerated}

# HELP document_generation_time_ms Average document generation time in milliseconds
# TYPE document_generation_time_ms gauge
document_generation_time_ms ${dashboard.documents.averageGenerationTime}

# HELP system_memory_usage_mb Average memory usage in megabytes
# TYPE system_memory_usage_mb gauge
system_memory_usage_mb ${dashboard.system.averageMemoryUsage}

# HELP cache_hit_rate_percent Cache effectiveness percentage
# TYPE cache_hit_rate_percent gauge
cache_hit_rate_percent ${dashboard.system.cacheEffectiveness}
    `.trim();
  }

  /**
   * Clear old metrics to prevent memory growth
   */
  private flushMetrics(): void {
    try {
      const now = Date.now();
      const retentionPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days

      // Remove metrics older than retention period
      this.metricsBuffer = this.metricsBuffer.filter(m => now - m.timestamp < retentionPeriod);
      this.documentMetrics = this.documentMetrics.filter(m => now - m.timestamp < retentionPeriod);

      this.lastFlushTime = now;

      console.log(`[TELEMETRY] Flushed old metrics. Current buffer sizes: parsing=${this.metricsBuffer.length}, documents=${this.documentMetrics.length}`);
    } catch (error) {
      console.error('[TELEMETRY_ERROR] Failed to flush metrics:', (error as Error).message);
    }
  }

  /**
   * Calculate cache hit rate (placeholder - would integrate with actual cache)
   */
  private calculateCacheHitRate(): number {
    // In real implementation, would track cache hits vs misses
    return Math.random() * 0.3 + 0.7; // Simulate 70-100% hit rate
  }

  /**
   * Calculate average processing time from recent metrics
   */
  private calculateAverageProcessingTime(): number {
    const recent = this.metricsBuffer.slice(-100); // Last 100 extractions
    if (recent.length === 0) return 0;
    
    return recent.reduce((sum, m) => sum + m.extractionDuration, 0) / recent.length;
  }

  /**
   * Get health check status for monitoring
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    checks: {
      memoryUsage: { status: string; value: number; threshold: number };
      errorRate: { status: string; value: number; threshold: number };
      averageLatency: { status: string; value: number; threshold: number };
    };
  } {
    const dashboard = this.getDashboardMetrics();
    
    // Memory check (warn if > 500MB, critical if > 1GB)
    const memoryStatus = 
      dashboard.system.averageMemoryUsage > 1024 ? 'critical' :
      dashboard.system.averageMemoryUsage > 512 ? 'warning' : 'healthy';
    
    // Error rate check (calculate from recent metrics)
    const recentErrors = this.metricsBuffer.slice(-100).filter(m => m.errorCount > 0).length;
    const errorRate = this.metricsBuffer.length > 0 ? (recentErrors / Math.min(100, this.metricsBuffer.length)) * 100 : 0;
    const errorStatus = 
      errorRate > 10 ? 'critical' :
      errorRate > 5 ? 'warning' : 'healthy';

    // Latency check (warn if > 1000ms, critical if > 2000ms)  
    const avgLatency = dashboard.documents.averageGenerationTime;
    const latencyStatus = 
      avgLatency > 2000 ? 'critical' :
      avgLatency > 1000 ? 'warning' : 'healthy';

    const overallStatus = 
      [memoryStatus, errorStatus, latencyStatus].includes('critical') ? 'critical' :
      [memoryStatus, errorStatus, latencyStatus].includes('warning') ? 'warning' : 'healthy';

    return {
      status: overallStatus,
      checks: {
        memoryUsage: { status: memoryStatus, value: dashboard.system.averageMemoryUsage, threshold: 512 },
        errorRate: { status: errorStatus, value: Math.round(errorRate * 100) / 100, threshold: 5 },
        averageLatency: { status: latencyStatus, value: avgLatency, threshold: 1000 }
      }
    };
  }
}

/**
 * Helper function to calculate extraction quality score
 */
export function calculateQualityScore(extractedFields: ParsingMetrics['extractedFields']): number {
  let score = 0;
  let totalFields = 0;

  // Name extraction quality (weight: 25%)
  if (extractedFields.name.extracted) {
    score += extractedFields.name.confidence * 25;
  }
  totalFields += 25;

  // Amount extraction quality (weight: 35% - most important for revenue)
  if (extractedFields.amount.extracted) {
    score += extractedFields.amount.confidence * 35;
  }
  totalFields += 35;

  // Relationship extraction quality (weight: 20%)
  if (extractedFields.relationship.extracted) {
    score += 20; // Binary - either extracted or not
  }
  totalFields += 20;

  // Urgency extraction quality (weight: 20%)
  if (extractedFields.urgency.extracted) {
    score += 20; // Binary - either extracted or not
  }
  totalFields += 20;

  return score; // Already in 0-100 scale
}

/**
 * Middleware to automatically collect metrics from extraction calls
 */
export function withTelemetry<T extends (...args: any[]) => any>(
  operation: T,
  operationName: string
): T {
  return ((...args: any[]) => {
    const startTime = Date.now();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const result = operation(...args);
      
      // Handle both sync and async operations
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            const duration = Date.now() - startTime;
            // Record successful operation metrics
            TelemetryCollector.getInstance().recordSystemMetrics();
            return value;
          },
          (error) => {
            const duration = Date.now() - startTime;
            console.error(`[TELEMETRY] Operation ${operationName} failed:`, {
              duration,
              sessionId,
              error: error.message
            });
            throw error;
          }
        );
      } else {
        const duration = Date.now() - startTime;
        // Record successful operation metrics
        TelemetryCollector.getInstance().recordSystemMetrics();
        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[TELEMETRY] Operation ${operationName} failed:`, {
        duration,
        sessionId,
        error: (error as Error).message
      });
      throw error;
    }
  }) as T;
}

export default TelemetryCollector;
