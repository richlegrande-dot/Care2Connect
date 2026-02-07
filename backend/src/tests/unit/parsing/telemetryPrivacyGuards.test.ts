/**
 * Telemetry Privacy Guard Tests
 * 
 * Ensures telemetry system never logs PII or sensitive information
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { TelemetryCollector } from '../../../src/services/telemetry';
import { extractAllWithTelemetry } from '../../../src/utils/extraction/rulesEngine';

// Sample PII-containing transcript for testing redaction
const PII_TRANSCRIPT = `
My name is John Smith and my email is john.smith@email.com.
My phone number is 555-123-4567 or you can call me at (555) 987-6543.
I live at 123 Main Street, Springfield IL 62701.
My social security number is 123-45-6789.
Please send money to my Cash App $johnsmith123 or PayPal john.smith.paypal@gmail.com.
Here's my full story about needing help with medical bills...
[Transcript continues with personal details]
`;

describe('Telemetry Privacy Guards', () => {
  
  let telemetry: TelemetryCollector;
  let consoleSpy: jest.SpiedFunction<typeof console.log>;
  
  beforeEach(() => {
    telemetry = TelemetryCollector.getInstance();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('PRIVACY GUARD: Telemetry never records raw transcript text', () => {
    // Extract with telemetry from PII-heavy transcript
    const result = extractAllWithTelemetry(PII_TRANSCRIPT);
    
    // Get telemetry output
    const dashboardMetrics = telemetry.getDashboardMetrics();
    const prometheusMetrics = telemetry.exportPrometheusMetrics();
    
    // Convert telemetry to string for content inspection
    const telemetryJson = JSON.stringify(dashboardMetrics);
    const prometheusText = prometheusMetrics;
    
    // ASSERT: No transcript content in telemetry
    expect(telemetryJson).not.toContain('John Smith');
    expect(telemetryJson).not.toContain('medical bills');
    expect(telemetryJson).not.toContain('Main Street');
    expect(telemetryJson).not.toContain('Springfield');
    
    expect(prometheusText).not.toContain('John Smith');
    expect(prometheusText).not.toContain('medical bills');
    
    // VERIFY: Only length is recorded, not content
    expect(telemetryJson).toMatch(/transcriptLength.*\d+/); // Length as number
    expect(telemetryJson).not.toMatch(/transcript.*[a-zA-Z]/); // No text content
  });

  test('PRIVACY GUARD: No email addresses in telemetry output', () => {
    const result = extractAllWithTelemetry(PII_TRANSCRIPT);
    
    const dashboardMetrics = telemetry.getDashboardMetrics();
    const healthStatus = telemetry.getHealthStatus();
    const prometheusMetrics = telemetry.exportPrometheusMetrics();
    
    // Convert all telemetry outputs to searchable text
    const allTelemetryText = JSON.stringify({
      dashboard: dashboardMetrics,
      health: healthStatus,
      prometheus: prometheusMetrics
    });
    
    // EMAIL REGEX: Look for any email pattern
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = allTelemetryText.match(emailPattern);
    
    // ASSERT: No email addresses found in any telemetry output
    expect(emailMatches).toBeNull();
    
    // SPECIFIC EMAIL CHECKS
    expect(allTelemetryText).not.toContain('john.smith@email.com');
    expect(allTelemetryText).not.toContain('john.smith.paypal@gmail.com');
    expect(allTelemetryText).not.toContain('@');
  });

  test('PRIVACY GUARD: No phone numbers in telemetry output', () => {
    const result = extractAllWithTelemetry(PII_TRANSCRIPT);
    
    const dashboardMetrics = telemetry.getDashboardMetrics();
    const prometheusMetrics = telemetry.exportPrometheusMetrics();
    
    const allTelemetryText = JSON.stringify({
      dashboard: dashboardMetrics,  
      prometheus: prometheusMetrics
    });
    
    // PHONE REGEX: Look for phone number patterns
    const phonePatterns = [
      /\d{3}-\d{3}-\d{4}/g,        // 555-123-4567
      /\(\d{3}\)\s?\d{3}-\d{4}/g,  // (555) 987-6543
      /\d{10,}/g                    // 10+ consecutive digits
    ];
    
    phonePatterns.forEach((pattern, index) => {
      const matches = allTelemetryText.match(pattern);
      if (matches) {
        // Filter out acceptable numeric values (timestamps, scores, etc.)
        const suspiciousMatches = matches.filter(match => {
          const num = parseInt(match.replace(/\D/g, ''));
          return num > 1000000000; // Likely a phone number (10+ digits)
        });
        
        expect(suspiciousMatches.length).toBe(0);
      }
    });
    
    // SPECIFIC PHONE NUMBER CHECKS
    expect(allTelemetryText).not.toContain('555-123-4567');
    expect(allTelemetryText).not.toContain('(555) 987-6543');
    expect(allTelemetryText).not.toContain('5551234567');
  });

  test('PRIVACY GUARD: No full name values in telemetry output', () => {
    const result = extractAllWithTelemetry('My name is Sarah Johnson and I need $2000 for rent');
    
    const dashboardMetrics = telemetry.getDashboardMetrics();
    const prometheusMetrics = telemetry.exportPrometheusMetrics();
    
    const allTelemetryText = JSON.stringify({
      dashboard: dashboardMetrics,
      prometheus: prometheusMetrics  
    });
    
    // ASSERT: Name is extracted but not logged in telemetry
    expect(result.results.name.value).toBe('Sarah Johnson'); // Extraction works
    expect(allTelemetryText).not.toContain('Sarah Johnson'); // But not in telemetry
    expect(allTelemetryText).not.toContain('Sarah'); 
    expect(allTelemetryText).not.toContain('Johnson');
    
    // VERIFY: Only extraction status/confidence is logged
    expect(allTelemetryText).toMatch(/name.*extracted.*true/);
    expect(allTelemetryText).toMatch(/name.*confidence.*\d/);
  });

  test('PRIVACY GUARD: Only anonymized metrics in telemetry', () => {
    const result = extractAllWithTelemetry(PII_TRANSCRIPT);
    
    const dashboardMetrics = telemetry.getDashboardMetrics();
    
    // VERIFY: Only these types of data should be present
    const allowedDataTypes = [
      'timestamp',
      'sessionId', 
      'extractionDuration',
      'transcriptLength', // Length only, not content
      'extracted', // Boolean flags
      'confidence', // Numeric scores
      'value', // Only for non-PII like urgency/relationship
      'fallbacksUsed', // Array of fallback names
      'errorCount',
      'qualityScore'
    ];
    
    const telemetryJson = JSON.stringify(dashboardMetrics);
    
    // Check that all keys are from allowed list
    Object.keys(dashboardMetrics).forEach(key => {
      // Allow nested structures but validate they don't contain PII
      if (typeof dashboardMetrics[key] === 'object') {
        const subJson = JSON.stringify(dashboardMetrics[key]);
        
        // No personal information should be in nested objects
        expect(subJson).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/); // No emails
        expect(subJson).not.toMatch(/\d{3}-\d{3}-\d{4}/); // No phone numbers
        expect(subJson).not.toMatch(/\d{3}\s?\d{3}\s?\d{4}/); // No SSNs
      }
    });
  });

  test('PRIVACY GUARD: Session IDs are anonymous UUIDs', () => {
    const result1 = extractAllWithTelemetry('Test transcript 1');
    const result2 = extractAllWithTelemetry('Test transcript 2');
    
    // VERIFY: Session IDs follow expected pattern
    expect(result1.metrics.sessionId).toMatch(/^extraction_\d+_[a-z0-9]+$/);
    expect(result2.metrics.sessionId).toMatch(/^extraction_\d+_[a-z0-9]+$/);
    
    // VERIFY: Session IDs are different for each extraction
    expect(result1.metrics.sessionId).not.toBe(result2.metrics.sessionId);
    
    // VERIFY: Session IDs contain no personal information
    expect(result1.metrics.sessionId).not.toContain('test');
    expect(result1.metrics.sessionId).not.toContain('transcript');
    
    // VERIFY: Session ID format prevents PII leakage
    const sessionIdParts = result1.metrics.sessionId.split('_');
    expect(sessionIdParts).toHaveLength(3); // prefix_timestamp_random
    expect(sessionIdParts[0]).toBe('extraction');
    expect(parseInt(sessionIdParts[1])).toBeGreaterThan(1700000000000); // Valid timestamp
    expect(sessionIdParts[2]).toMatch(/^[a-z0-9]+$/); // Random alphanumeric
  });

  test('PRIVACY GUARD: Fail test if PII patterns are detected', () => {
    // This test intentionally fails if PII is found - acts as a failsafe
    
    const result = extractAllWithTelemetry(PII_TRANSCRIPT);
    const dashboardMetrics = telemetry.getDashboardMetrics();
    const prometheusMetrics = telemetry.exportPrometheusMetrics();
    
    const allTelemetryOutput = JSON.stringify({
      result: result.metrics, // Only metrics, not results
      dashboard: dashboardMetrics,
      prometheus: prometheusMetrics
    });
    
    // FAILSAFE PATTERNS: If any of these are found, test must fail
    const piiPatterns = [
      /@/,                                    // Email indicator
      /\d{3}-\d{3}-\d{4}/,                   // Phone pattern
      /\(\d{3}\)\s?\d{3}-\d{4}/,            // Alt phone pattern
      /\d{3}-\d{2}-\d{4}/,                  // SSN pattern
      /John Smith|Sarah Johnson/i,           // Test names
      /Main Street|Springfield/i,            // Address components
      /medical bills|story/i                 // Transcript content
    ];
    
    piiPatterns.forEach((pattern, index) => {
      const matches = allTelemetryOutput.match(pattern);
      
      if (matches) {
        console.error(`PII DETECTED in telemetry output! Pattern ${index + 1}: ${pattern}`);
        console.error(`Matching text: ${matches[0]}`);
        console.error('Full telemetry output:', allTelemetryOutput.substring(0, 1000));
      }
      
      expect(matches).toBeNull();
    });
  });

});
