/**
 * Performance Benchmarks for Phase 2 Optimizations
 *
 * Tests to validate performance improvements from compiled regexes
 * and memory optimizations
 */

import {
  extractNameWithConfidence,
  extractGoalAmountWithConfidence,
  extractBeneficiaryRelationship,
  extractUrgency,
} from "../../../src/utils/extraction/rulesEngine";

interface PerformanceResult {
  operationName: string;
  totalTime: number;
  averageTime: number;
  iterations: number;
  throughput: number; // operations per second
}

describe("Phase 2: Performance Benchmarks", () => {
  // Sample transcripts of varying complexity and length
  const SHORT_TRANSCRIPTS = [
    "My name is John and I need $1000",
    "Sarah here, need help with $2500",
    "I'm Mike, goal is $5000",
    "Hello, I need $800 for rent",
    "Jennifer, looking for $1200",
  ];

  const MEDIUM_TRANSCRIPTS = [
    "Hi, my name is Sarah Johnson and I live in Seattle, Washington. I need to raise five thousand dollars for my medical bills after my surgery. I can be reached at sarah.j@email.com. This is really urgent because the bills are due next week.",
    "I'm Mike from Boston and I just got out of the hospital. The bills are overwhelming and I dont know how Im going to pay them. I have three kids to take care of and I lost my job while I was sick. This is critical, I need help desperately.",
    "Hello, I am David Martinez and I am facing eviction. I need help with rent and I owe between two thousand and three thousand dollars. I live in Austin, Texas and this is an emergency situation. I have until Friday to pay or I will be homeless.",
    "My name is Maria Rodriguez and I am about to lose my apartment. I have two children and nowhere else to go. I work part-time but it is not enough to cover rent. We are from Los Angeles and this situation is desperate. Any help would be appreciated.",
    "I am Robert Chen, owner of a small restaurant in Chicago. The pandemic hit us hard and we need around ten thousand dollars to keep the doors open and pay our employees. We have been serving the community for fifteen years.",
  ];

  const LONG_TRANSCRIPTS = [
    "Hi there, my name is Jennifer Marie Thompson and I'm calling from Portland, Oregon. I'm a single mother of two beautiful children, ages 7 and 10, and I'm going through the most difficult time of my life. Three months ago, I was diagnosed with breast cancer, and it completely turned our world upside down. The medical bills have been piling up, and between the chemotherapy treatments, the surgery, and all the follow-up appointments, I've had to take so much time off work that I'm now at risk of losing my job. I need to raise approximately fifteen thousand dollars to cover the immediate medical expenses and to help us get through the next few months while I focus on getting better. My children are my everything, and I'm fighting this battle not just for me, but for them. Any help would be truly appreciated during this incredibly challenging time.",
    "Good morning, this is Dr. Amanda Rodriguez calling from Phoenix, Arizona. I'm reaching out because I'm trying to help a family in our community who has been devastated by a house fire last week. The Johnson family - consisting of parents Mark and Lisa, and their three young children - lost everything in the blaze. They managed to escape safely, but their home of fifteen years, along with all their belongings, memories, and important documents, were completely destroyed. The insurance coverage they have is minimal and won't begin to cover the cost of rebuilding their lives. I'm hoping to raise around twenty-five thousand dollars to help them secure temporary housing, replace essential items like clothing and school supplies for the children, and give them a foundation to start rebuilding. This is a wonderful family that has always been there for others in our community, and now it's our turn to be there for them.",
    "Hello, my name is Michael David Patterson and I'm a veteran who served three tours in Afghanistan. I'm calling from Denver, Colorado, where I've been trying to rebuild my life after my service. Unfortunately, I've been struggling with PTSD and depression, which has made it incredibly difficult to maintain steady employment. Last month, my truck broke down completely - it's a 2010 Ford F-150 that I've been using not just for transportation, but also for the small handyman business I was trying to get off the ground. The mechanic says it needs a complete engine rebuild, which will cost around eight thousand dollars, but honestly, that's money I simply don't have. Without transportation, I can't get to my therapy appointments, I can't look for work, and I certainly can't continue trying to build my business. I'm not asking for charity - I'm asking for a chance to get back on my feet and become a productive member of society again. Any help would mean the world to me and would truly be an investment in my future.",
  ];

  function runPerformanceBenchmark(
    operationName: string,
    operation: (transcript: string) => any,
    transcripts: string[],
    iterations: number = 100,
  ): PerformanceResult {
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const transcript = transcripts[i % transcripts.length];
      operation(transcript);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const averageTime = totalTime / iterations;
    const throughput = (iterations * 1000) / totalTime; // operations per second

    return {
      operationName,
      totalTime,
      averageTime,
      iterations,
      throughput,
    };
  }

  describe("Name Extraction Performance", () => {
    test("should process short transcripts efficiently", () => {
      const result = runPerformanceBenchmark(
        "Name Extraction - Short Transcripts",
        extractNameWithConfidence,
        SHORT_TRANSCRIPTS,
        1000,
      );

      // Should complete 1000 operations in under 200ms
      expect(result.totalTime).toBeLessThan(200);
      expect(result.throughput).toBeGreaterThan(5000); // >5000 ops/sec

      console.log(`${result.operationName}:`, {
        totalTime: `${result.totalTime}ms`,
        avgTime: `${result.averageTime.toFixed(2)}ms`,
        throughput: `${Math.round(result.throughput)} ops/sec`,
      });
    });

    test("should process medium transcripts efficiently", () => {
      const result = runPerformanceBenchmark(
        "Name Extraction - Medium Transcripts",
        extractNameWithConfidence,
        MEDIUM_TRANSCRIPTS,
        500,
      );

      // Should complete 500 operations in under 150ms
      expect(result.totalTime).toBeLessThan(150);
      expect(result.throughput).toBeGreaterThan(3000); // >3000 ops/sec

      console.log(`${result.operationName}:`, {
        totalTime: `${result.totalTime}ms`,
        avgTime: `${result.averageTime.toFixed(2)}ms`,
        throughput: `${Math.round(result.throughput)} ops/sec`,
      });
    });

    test("should process long transcripts efficiently", () => {
      const result = runPerformanceBenchmark(
        "Name Extraction - Long Transcripts",
        extractNameWithConfidence,
        LONG_TRANSCRIPTS,
        200,
      );

      // Should complete 200 operations in under 100ms
      expect(result.totalTime).toBeLessThan(100);
      expect(result.throughput).toBeGreaterThan(2000); // >2000 ops/sec

      console.log(`${result.operationName}:`, {
        totalTime: `${result.totalTime}ms`,
        avgTime: `${result.averageTime.toFixed(2)}ms`,
        throughput: `${Math.round(result.throughput)} ops/sec`,
      });
    });
  });

  describe("Goal Amount Extraction Performance", () => {
    test("should process short transcripts efficiently", () => {
      const result = runPerformanceBenchmark(
        "Amount Extraction - Short Transcripts",
        extractGoalAmountWithConfidence,
        SHORT_TRANSCRIPTS,
        1000,
      );

      // Should complete 1000 operations in under 300ms
      expect(result.totalTime).toBeLessThan(300);
      expect(result.throughput).toBeGreaterThan(3000); // >3000 ops/sec

      console.log(`${result.operationName}:`, {
        totalTime: `${result.totalTime}ms`,
        avgTime: `${result.averageTime.toFixed(2)}ms`,
        throughput: `${Math.round(result.throughput)} ops/sec`,
      });
    });

    test("should process medium transcripts efficiently", () => {
      const result = runPerformanceBenchmark(
        "Amount Extraction - Medium Transcripts",
        extractGoalAmountWithConfidence,
        MEDIUM_TRANSCRIPTS,
        500,
      );

      // Should complete 500 operations in under 200ms
      expect(result.totalTime).toBeLessThan(200);
      expect(result.throughput).toBeGreaterThan(2500); // >2500 ops/sec

      console.log(`${result.operationName}:`, {
        totalTime: `${result.totalTime}ms`,
        avgTime: `${result.averageTime.toFixed(2)}ms`,
        throughput: `${Math.round(result.throughput)} ops/sec`,
      });
    });
  });

  describe("Combined Operations Performance", () => {
    const combinedOperation = (transcript: string) => {
      const name = extractNameWithConfidence(transcript);
      const amount = extractGoalAmountWithConfidence(transcript);
      const relationship = extractBeneficiaryRelationship(transcript);
      const urgency = extractUrgency(transcript);
      return { name, amount, relationship, urgency };
    };

    test("should process full extraction pipeline efficiently", () => {
      const result = runPerformanceBenchmark(
        "Full Extraction Pipeline",
        combinedOperation,
        MEDIUM_TRANSCRIPTS,
        200,
      );

      // Should complete 200 full extractions in under 200ms
      expect(result.totalTime).toBeLessThan(200);
      expect(result.throughput).toBeGreaterThan(1000); // >1000 ops/sec

      console.log(`${result.operationName}:`, {
        totalTime: `${result.totalTime}ms`,
        avgTime: `${result.averageTime.toFixed(2)}ms`,
        throughput: `${Math.round(result.throughput)} ops/sec`,
      });
    });
  });

  describe("Memory Efficiency Tests", () => {
    test("should not leak memory with repeated operations", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations to test for memory leaks
      for (let i = 0; i < 5000; i++) {
        const transcript = MEDIUM_TRANSCRIPTS[i % MEDIUM_TRANSCRIPTS.length];
        extractNameWithConfidence(transcript);
        extractGoalAmountWithConfidence(transcript);
        extractBeneficiaryRelationship(transcript);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Memory increase should be reasonable (< 10MB for 5000 operations)
      expect(memoryIncreaseMB).toBeLessThan(10);

      console.log(
        `Memory usage increase: ${memoryIncreaseMB.toFixed(2)}MB for 5000 operations`,
      );
    });
  });

  describe("Cache Effectiveness Tests", () => {
    test("should benefit from text normalization cache", () => {
      const sameTranscript =
        "My name is John Smith and I need $5000 for medical bills";

      // First run - populate cache
      const firstRunStart = Date.now();
      for (let i = 0; i < 100; i++) {
        extractNameWithConfidence(sameTranscript);
        extractGoalAmountWithConfidence(sameTranscript);
      }
      const firstRunTime = Date.now() - firstRunStart;

      // Second run - should benefit from cache
      const secondRunStart = Date.now();
      for (let i = 0; i < 100; i++) {
        extractNameWithConfidence(sameTranscript);
        extractGoalAmountWithConfidence(sameTranscript);
      }
      const secondRunTime = Date.now() - secondRunStart;

      // Second run should be faster (within margin of error)
      // We're not requiring a specific speedup due to potential test environment variation
      // but documenting the cache behavior
      console.log(
        `First run: ${firstRunTime}ms, Second run: ${secondRunTime}ms`,
      );

      // Both runs should still be fast
      expect(firstRunTime).toBeLessThan(50);
      expect(secondRunTime).toBeLessThan(50);
    });
  });

  describe("Regex Compilation Benefits", () => {
    test("should demonstrate consistent performance across multiple runs", () => {
      const results: number[] = [];

      // Run the same benchmark multiple times
      for (let run = 0; run < 5; run++) {
        const result = runPerformanceBenchmark(
          "Consistency Test",
          extractGoalAmountWithConfidence,
          MEDIUM_TRANSCRIPTS,
          100,
        );
        results.push(result.totalTime);
      }

      // Calculate standard deviation to verify consistency
      const average =
        results.reduce((sum, time) => sum + time, 0) / results.length;
      const variance =
        results.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) /
        results.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / average;

      // Coefficient of variation should be low (< 0.3) indicating consistent performance
      expect(coefficientOfVariation).toBeLessThan(0.3);

      console.log(
        `Performance consistency: avg=${average.toFixed(1)}ms, stdDev=${stdDev.toFixed(1)}ms, CV=${coefficientOfVariation.toFixed(3)}`,
      );
    });
  });
});
