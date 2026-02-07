/**
 * Telemetry Performance Guard Tests
 * 
 * Ensures telemetry overhead is bounded and doesn't degrade system performance
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { extractAllWithTelemetry } from '../../../src/utils/extraction/rulesEngine';
import { TelemetryCollector } from '../../../src/services/telemetry';

// Performance test transcript (medium complexity)
const PERFORMANCE_TRANSCRIPT = `
My name is Jennifer Martinez and I'm reaching out because I desperately need help. 
I'm a single mother of three children ages 6, 9, and 14. Two weeks ago I lost my job 
at the restaurant where I worked for five years. Without my income, I can't pay rent 
which is $1200 per month. I need about three thousand dollars to catch up on rent 
and utilities before we get evicted. This is really urgent because the landlord gave 
us notice that we have until Friday to pay or we have to leave. My kids go to school 
here in Phoenix Arizona and I don't want to uproot them. I've been applying for jobs 
but nothing has come through yet. Any help would be incredibly appreciated.
`;

describe('Telemetry Performance Guards', () => {
  
  let telemetry: TelemetryCollector;
  
  beforeEach(() => {
    telemetry = TelemetryCollector.getInstance();
    jest.clearAllMocks();
    
    // Clear any existing metrics to start fresh
    telemetry.flushMetrics();
  });

  test('PERFORMANCE GUARD: Extraction stays under 100ms with telemetry', async () => {
    const iterations = 100;
    const maxAllowedTime = 100; // 100ms per extraction
    const times: number[] = [];
    
    // Warm up run (V8 optimization)
    extractAllWithTelemetry(PERFORMANCE_TRANSCRIPT);
    
    // Performance measurement
    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      const result = extractAllWithTelemetry(PERFORMANCE_TRANSCRIPT);
      
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
      
      times.push(durationMs);
      
      // Individual extraction should complete quickly
      expect(durationMs).toBeLessThan(maxAllowedTime);
      
      // Verify extraction still works correctly under load
      expect(result.results.name.value).toBe('Jennifer Martinez');
      expect(result.results.amount.value).toBe(3000);
    }
    
    // Statistical analysis
    const averageTime = times.reduce((a, b) => a + b) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    console.log(`Performance Results over ${iterations} iterations:`);
    console.log(`- Average: ${averageTime.toFixed(2)}ms`);
    console.log(`- Min: ${minTime.toFixed(2)}ms`);
    console.log(`- Max: ${maxTime.toFixed(2)}ms`);
    
    // Performance assertions
    expect(averageTime).toBeLessThan(maxAllowedTime);
    expect(maxTime).toBeLessThan(maxAllowedTime * 2); // Allow some outliers
    expect(minTime).toBeGreaterThan(0); // Sanity check
  });

  test('PERFORMANCE GUARD: Memory usage stays bounded', async () => {
    const iterations = 1000;
    const maxMemoryIncreaseMB = 10; // Allow max 10MB increase
    
    // Baseline memory measurement
    global.gc && global.gc(); // Force garbage collection if available
    const baselineMemory = process.memoryUsage().heapUsed;
    
    // Run many extractions
    const results = [];
    for (let i = 0; i < iterations; i++) {
      const result = extractAllWithTelemetry(PERFORMANCE_TRANSCRIPT);
      
      // Keep only essential data to prevent test artifacts
      results.push({
        name: result.results.name.value,
        amount: result.results.amount.value,
        sessionId: result.metrics.sessionId
      });
      
      // Periodic garbage collection check
      if (i % 100 === 0) {
        global.gc && global.gc();
        
        const currentMemory = process.memoryUsage().heapUsed;
        const memoryIncreaseMB = (currentMemory - baselineMemory) / 1024 / 1024;
        
        // Memory should not grow unbounded
        expect(memoryIncreaseMB).toBeLessThan(maxMemoryIncreaseMB);
      }
    }
    
    // Final memory check
    global.gc && global.gc();
    const finalMemory = process.memoryUsage().heapUsed;
    const totalMemoryIncreaseMB = (finalMemory - baselineMemory) / 1024 / 1024;
    
    console.log(`Memory Usage for ${iterations} iterations:`);
    console.log(`- Baseline: ${(baselineMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`- Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`- Increase: ${totalMemoryIncreaseMB.toFixed(2)}MB`);
    
    // ASSERT: Total memory increase stays bounded
    expect(totalMemoryIncreaseMB).toBeLessThan(maxMemoryIncreaseMB);
    
    // VERIFY: All extractions still worked correctly
    expect(results).toHaveLength(iterations);
    expect(results.every(r => r.name === 'Jennifer Martinez')).toBe(true);
    expect(results.every(r => r.amount === 3000)).toBe(true);
    expect(results.every(r => r.sessionId.startsWith('extraction_'))).toBe(true);
  });

  test('PERFORMANCE GUARD: Telemetry buffer management', () => {
    const bufferTestSize = 1200; // Exceed normal buffer size
    
    // Track telemetry collection performance
    const startTime = Date.now();
    
    for (let i = 0; i < bufferTestSize; i++) {
      extractAllWithTelemetry(`Test transcript ${i} with different content each time`);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const averageTimePerExtraction = totalTime / bufferTestSize;
    
    console.log(`Buffer Management Test:`);
    console.log(`- ${bufferTestSize} extractions in ${totalTime}ms`);
    console.log(`- Average: ${averageTimePerExtraction.toFixed(2)}ms per extraction`);
    
    // ASSERT: Performance doesn't degrade with buffer management
    expect(averageTimePerExtraction).toBeLessThan(50); // 50ms average
    
    // VERIFY: Telemetry system still functions
    const metrics = telemetry.getDashboardMetrics();
    expect(metrics.parsing.totalExtractions).toBeGreaterThan(bufferTestSize);
  });

  test('PERFORMANCE GUARD: Dashboard metrics generation speed', () => {
    // Populate some data first
    for (let i = 0; i < 100; i++) {
      extractAllWithTelemetry(PERFORMANCE_TRANSCRIPT);
    }
    
    // Time dashboard metrics generation
    const iterations = 50;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      const dashboardMetrics = telemetry.getDashboardMetrics();
      
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      
      times.push(durationMs);
      
      // Verify metrics are generated
      expect(dashboardMetrics.parsing.totalExtractions).toBeGreaterThan(0);
    }
    
    const averageTime = times.reduce((a, b) => a + b) / times.length;
    const maxTime = Math.max(...times);
    
    console.log(`Dashboard Generation Performance:`);
    console.log(`- Average: ${averageTime.toFixed(2)}ms`);
    console.log(`- Max: ${maxTime.toFixed(2)}ms`);
    
    // ASSERT: Dashboard generation is fast
    expect(averageTime).toBeLessThan(10); // Under 10ms average
    expect(maxTime).toBeLessThan(50); // Under 50ms max
  });

  test('PERFORMANCE GUARD: Prometheus metrics export speed', () => {
    // Populate telemetry data
    for (let i = 0; i < 50; i++) {
      extractAllWithTelemetry(PERFORMANCE_TRANSCRIPT);
    }
    
    const iterations = 20;
    const times: number[] = [];
    const exportSizes: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      const prometheusMetrics = telemetry.exportPrometheusMetrics();
      
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      
      times.push(durationMs);
      exportSizes.push(prometheusMetrics.length);
      
      // Verify export contains expected content
      expect(prometheusMetrics).toContain('# TYPE');
      expect(prometheusMetrics).toContain('parsing_total');
    }
    
    const averageTime = times.reduce((a, b) => a + b) / times.length;
    const averageSize = exportSizes.reduce((a, b) => a + b) / exportSizes.length;
    
    console.log(`Prometheus Export Performance:`);
    console.log(`- Average time: ${averageTime.toFixed(2)}ms`);
    console.log(`- Average size: ${averageSize} characters`);
    
    // ASSERT: Prometheus export is efficient  
    expect(averageTime).toBeLessThan(20); // Under 20ms average
    expect(averageSize).toBeGreaterThan(100); // Has meaningful content
    expect(averageSize).toBeLessThan(10000); // But not excessive
  });

  test('PERFORMANCE GUARD: Concurrent extraction performance', async () => {
    const concurrentExtractions = 10;
    const maxConcurrentTime = 200; // 200ms for all concurrent extractions
    
    const startTime = Date.now();
    
    // Run extractions concurrently
    const promises = Array(concurrentExtractions).fill(0).map((_, i) => {
      return Promise.resolve(extractAllWithTelemetry(`${PERFORMANCE_TRANSCRIPT} - Concurrent test ${i}`));
    });
    
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Concurrent Performance:`);
    console.log(`- ${concurrentExtractions} extractions in ${totalTime}ms`);
    console.log(`- Average per extraction: ${(totalTime / concurrentExtractions).toFixed(2)}ms`);
    
    // ASSERT: Concurrent performance is reasonable
    expect(totalTime).toBeLessThan(maxConcurrentTime);
    
    // VERIFY: All extractions completed correctly
    expect(results).toHaveLength(concurrentExtractions);
    results.forEach((result, i) => {
      expect(result.results.name.value).toBe('Jennifer Martinez');
      expect(result.results.amount.value).toBe(3000);
      expect(result.metrics.sessionId).toContain('extraction_');
    });
  });

});
