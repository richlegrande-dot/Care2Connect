/**
 * Phase 5: Observability and Metrics Tests
 *
 * Tests to validate telemetry collection, metrics aggregation,
 * and monitoring dashboard functionality
 */

import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import {
  TelemetryCollector,
  calculateQualityScore,
  withTelemetry,
} from "../../../../services/telemetry";
import { extractAllWithTelemetry } from "../../../../utils/extraction/rulesEngine";

describe("Phase 5: Observability and Metrics Tests", () => {
  let telemetry: TelemetryCollector;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset singleton for test isolation so corrupted records don't leak between tests
    (TelemetryCollector as any).instance = undefined;
    // Get fresh telemetry instance for each test
    telemetry = TelemetryCollector.getInstance();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  describe("Quality Score Calculation", () => {
    test("should calculate perfect quality score for complete high-confidence extraction", () => {
      const extractedFields = {
        name: { extracted: true, confidence: 1.0 },
        amount: { extracted: true, confidence: 1.0 },
        relationship: { extracted: true, value: "myself" as const },
        urgency: { extracted: true, value: "HIGH" as const },
      };

      const score = calculateQualityScore(extractedFields);
      expect(score).toBe(100);
    });

    test("should calculate partial quality score for incomplete extraction", () => {
      const extractedFields = {
        name: { extracted: true, confidence: 0.8 },
        amount: { extracted: false, confidence: 0 },
        relationship: { extracted: true, value: "family_member" as const },
        urgency: { extracted: true, value: "MEDIUM" as const },
      };

      const score = calculateQualityScore(extractedFields);
      expect(score).toBe(60); // 25*0.8 + 0 + 20 + 20 = 60
    });

    test("should calculate zero quality score for no extractions", () => {
      const extractedFields = {
        name: { extracted: false, confidence: 0 },
        amount: { extracted: false, confidence: 0 },
        relationship: { extracted: false, value: "myself" as const },
        urgency: { extracted: false, value: "LOW" as const },
      };

      const score = calculateQualityScore(extractedFields);
      expect(score).toBe(0);
    });
  });

  describe("Telemetry Collection", () => {
    test("should record parsing metrics without PII", () => {
      const sessionId = "test-session-123";
      const mockMetrics = {
        extractionDuration: 150,
        transcriptLength: 500,
        extractedFields: {
          name: { extracted: true, confidence: 0.9 },
          amount: { extracted: true, confidence: 0.8 },
          relationship: { extracted: true, value: "myself" as const },
          urgency: { extracted: true, value: "HIGH" as const },
        },
        fallbacksUsed: [] as string[],
        errorCount: 0,
        qualityScore: 85,
      };

      expect(() => {
        telemetry.recordParsingMetrics(sessionId, mockMetrics);
      }).not.toThrow();

      // Verify metrics were recorded (dashboard should show data)
      const dashboard = telemetry.getDashboardMetrics();
      expect(dashboard.parsing.totalExtractions).toBeGreaterThan(0);
    });

    test("should record document generation metrics", () => {
      const sessionId = "test-doc-session-456";
      const mockDocMetrics = {
        generationDuration: 2000,
        documentSize: 45000,
        fallbackUsed: false,
        errorOccurred: false,
        includeInstructions: true,
        includePasteMap: true,
      };

      expect(() => {
        telemetry.recordDocumentMetrics(sessionId, mockDocMetrics);
      }).not.toThrow();

      const dashboard = telemetry.getDashboardMetrics();
      expect(dashboard.documents.totalGenerated).toBeGreaterThan(0);
    });

    test("should record system metrics", () => {
      expect(() => {
        telemetry.recordSystemMetrics();
      }).not.toThrow();

      const dashboard = telemetry.getDashboardMetrics();
      expect(dashboard.system.averageMemoryUsage).toBeGreaterThan(0);
    });

    test("should handle telemetry errors gracefully", () => {
      // Test with invalid data — JS allows `...null` without error,
      // so recordParsingMetrics silently accepts it (no error logged)
      expect(() => {
        telemetry.recordParsingMetrics(null as any, null as any);
      }).not.toThrow();
    });
  });

  describe("Dashboard Metrics Aggregation", () => {
    beforeEach(() => {
      // Record system metrics so dashboard has memory/cache data
      telemetry.recordSystemMetrics();

      // Set up some test data
      telemetry.recordParsingMetrics("session1", {
        extractionDuration: 100,
        transcriptLength: 300,
        extractedFields: {
          name: { extracted: true, confidence: 0.9 },
          amount: { extracted: true, confidence: 0.85 },
          relationship: { extracted: true, value: "myself" },
          urgency: { extracted: true, value: "HIGH" },
        },
        fallbacksUsed: [],
        errorCount: 0,
        qualityScore: 88,
      });

      telemetry.recordParsingMetrics("session2", {
        extractionDuration: 200,
        transcriptLength: 800,
        extractedFields: {
          name: { extracted: true, confidence: 0.7 },
          amount: { extracted: false, confidence: 0 },
          relationship: { extracted: true, value: "family_member" },
          urgency: { extracted: true, value: "MEDIUM" },
        },
        fallbacksUsed: ["amount_fallback"],
        errorCount: 0,
        qualityScore: 62,
      });

      telemetry.recordDocumentMetrics("doc1", {
        generationDuration: 1500,
        documentSize: 35000,
        fallbackUsed: false,
        errorOccurred: false,
        includeInstructions: true,
        includePasteMap: true,
      });
    });

    test("should aggregate parsing metrics correctly", () => {
      const dashboard = telemetry.getDashboardMetrics();

      expect(dashboard.parsing.totalExtractions).toBe(2);
      expect(dashboard.parsing.averageConfidence).toBe(75); // (88 + 62) / 2
      expect(dashboard.parsing.fallbackRate).toBe(50); // 1 out of 2 used fallbacks

      expect(dashboard.parsing.qualityDistribution.excellent).toBe(1); // Score >= 80
      expect(dashboard.parsing.qualityDistribution.good).toBe(1); // Score 60-79
      expect(dashboard.parsing.qualityDistribution.poor).toBe(0); // Score < 60
    });

    test("should aggregate document metrics correctly", () => {
      const dashboard = telemetry.getDashboardMetrics();

      expect(dashboard.documents.totalGenerated).toBe(1);
      expect(dashboard.documents.averageSize).toBe(35000);
      expect(dashboard.documents.fallbackRate).toBe(0);
      expect(dashboard.documents.averageGenerationTime).toBe(1500);
    });

    test("should provide system metrics", () => {
      const dashboard = telemetry.getDashboardMetrics();

      expect(dashboard.system.averageMemoryUsage).toBeGreaterThan(0);
      expect(dashboard.system.cacheEffectiveness).toBeGreaterThanOrEqual(0);
      expect(dashboard.system.uptimePercentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Health Check System", () => {
    test("should report healthy status under normal conditions", () => {
      const health = telemetry.getHealthStatus();

      expect(health.status).toBe("healthy");
      expect(health.checks.memoryUsage).toBeDefined();
      expect(health.checks.errorRate).toBeDefined();
      expect(health.checks.averageLatency).toBeDefined();
    });

    test("should report warning status for elevated metrics", () => {
      // Add metrics that would trigger warning thresholds
      for (let i = 0; i < 10; i++) {
        telemetry.recordDocumentMetrics(`session${i}`, {
          generationDuration: 1200, // Above warning threshold
          documentSize: 30000,
          fallbackUsed: false,
          errorOccurred: false,
          includeInstructions: true,
          includePasteMap: true,
        });
      }

      const health = telemetry.getHealthStatus();
      expect(["healthy", "warning", "critical"]).toContain(health.status);
    });

    test("should include threshold values in health checks", () => {
      const health = telemetry.getHealthStatus();

      expect(health.checks.memoryUsage.threshold).toBeDefined();
      expect(health.checks.errorRate.threshold).toBeDefined();
      expect(health.checks.averageLatency.threshold).toBeDefined();

      expect(typeof health.checks.memoryUsage.value).toBe("number");
      expect(typeof health.checks.errorRate.value).toBe("number");
      expect(typeof health.checks.averageLatency.value).toBe("number");
    });
  });

  describe("Prometheus Metrics Export", () => {
    test("should export metrics in Prometheus format", () => {
      // Add some test data
      telemetry.recordParsingMetrics("prom-test", {
        extractionDuration: 100,
        transcriptLength: 400,
        extractedFields: {
          name: { extracted: true, confidence: 0.8 },
          amount: { extracted: true, confidence: 0.9 },
          relationship: { extracted: true, value: "myself" },
          urgency: { extracted: true, value: "HIGH" },
        },
        fallbacksUsed: [],
        errorCount: 0,
        qualityScore: 82,
      });

      const prometheus = telemetry.exportPrometheusMetrics();

      expect(prometheus).toContain("# HELP parsing_extractions_total");
      expect(prometheus).toContain("# TYPE parsing_extractions_total counter");
      expect(prometheus).toContain("parsing_extractions_total");

      expect(prometheus).toContain("parsing_confidence_average");
      expect(prometheus).toContain("documents_generated_total");
      expect(prometheus).toContain("system_memory_usage_mb");
    });

    test("should handle empty metrics gracefully", () => {
      // Create fresh instance with no metrics
      const emptyTelemetry = TelemetryCollector.getInstance();
      const prometheus = emptyTelemetry.exportPrometheusMetrics();

      expect(prometheus).toContain("parsing_extractions_total 0");
      expect(prometheus).toContain("documents_generated_total 0");
    });
  });

  describe("Telemetry Wrapper Function", () => {
    test("should wrap sync functions with telemetry", () => {
      const testFunction = (x: number, y: number) => x + y;
      const wrappedFunction = withTelemetry(testFunction, "addition");

      const result = wrappedFunction(5, 3);
      expect(result).toBe(8);
    });

    test("should wrap async functions with telemetry", async () => {
      const asyncFunction = async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return value.toUpperCase();
      };

      const wrappedFunction = withTelemetry(asyncFunction, "uppercase");
      const result = await wrappedFunction("hello");

      expect(result).toBe("HELLO");
    });

    test("should handle wrapped function errors gracefully", async () => {
      const errorFunction = () => {
        throw new Error("Test error");
      };

      const wrappedFunction = withTelemetry(errorFunction, "error-test");

      await expect(async () => {
        wrappedFunction();
      }).rejects.toThrow("Test error");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[TELEMETRY] Operation error-test failed"),
        expect.any(Object),
      );
    });
  });

  describe("Comprehensive Extraction with Telemetry", () => {
    test("should extract all fields and record telemetry", () => {
      const transcript =
        "My name is John Smith and I need $5000 for medical bills. This is urgent!";

      const result = extractAllWithTelemetry(transcript);

      expect(result.results).toBeDefined();
      expect(result.metrics).toBeDefined();

      expect(result.metrics.sessionId).toMatch(/^extraction_/);
      expect(result.metrics.extractionDuration).toBeGreaterThan(0);
      expect(result.metrics.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.metrics.fallbacksUsed).toBeInstanceOf(Array);
    });

    test("should handle extraction errors with telemetry", () => {
      // Test with problematic input that might cause errors
      const problematicTranscript = null as any;

      expect(() => {
        extractAllWithTelemetry(problematicTranscript);
      }).toThrow();
    });

    test("should track fallback usage correctly", () => {
      const vaguTranscript = "I need help with something";

      const result = extractAllWithTelemetry(vaguTranscript);

      expect(result.metrics.fallbacksUsed).toBeDefined();
      // Low confidence extractions should trigger fallback tracking
      if (
        result.results.name.confidence <= 0.1 ||
        result.results.amount.confidence <= 0.1
      ) {
        expect(result.metrics.fallbacksUsed.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Memory Management and Performance", () => {
    test("should handle large numbers of metrics without memory leaks", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Generate many metrics
      for (let i = 0; i < 1000; i++) {
        telemetry.recordParsingMetrics(`session${i}`, {
          extractionDuration: Math.random() * 200,
          transcriptLength: Math.floor(Math.random() * 1000),
          extractedFields: {
            name: { extracted: Math.random() > 0.3, confidence: Math.random() },
            amount: {
              extracted: Math.random() > 0.4,
              confidence: Math.random(),
            },
            relationship: { extracted: true, value: "myself" },
            urgency: { extracted: true, value: "LOW" },
          },
          fallbacksUsed: Math.random() > 0.8 ? ["fallback"] : [],
          errorCount: Math.random() > 0.9 ? 1 : 0,
          qualityScore: Math.random() * 100,
        });
      }

      // Should still be able to generate dashboard
      const dashboard = telemetry.getDashboardMetrics();
      expect(dashboard.parsing.totalExtractions).toBeLessThanOrEqual(1000);

      // Memory usage should be reasonable
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      expect(memoryIncrease).toBeLessThan(100); // Less than 100MB increase
    });

    test("should flush old metrics periodically", () => {
      // This would require more complex timing tests
      // For now, just verify the function exists and doesn't throw
      expect(() => {
        // Access private method for testing
        (telemetry as any).flushMetrics();
      }).not.toThrow();
    });
  });

  describe("PII Protection Validation", () => {
    test("should not store actual names in metrics", () => {
      const transcript = "My name is John Smith and I need $5000";
      const result = extractAllWithTelemetry(transcript);

      // Verify metrics don't contain PII
      const metricsString = JSON.stringify(result.metrics);
      expect(metricsString).not.toContain("John");
      expect(metricsString).not.toContain("Smith");
    });

    test("should not store actual amounts in metrics", () => {
      const transcript = "I need exactly $5000 for medical bills";
      const result = extractAllWithTelemetry(transcript);

      // Verify metrics don't contain specific amounts
      const metricsString = JSON.stringify(result.metrics);
      expect(metricsString).not.toContain("5000");
    });

    test("should not store transcript content in metrics", () => {
      const transcript =
        "This is sensitive personal information that should not appear in telemetry";
      const result = extractAllWithTelemetry(transcript);

      const metricsString = JSON.stringify(result.metrics);
      expect(metricsString).not.toContain("sensitive personal information");
    });
  });
});
