/**
 * PII Scanning and Detection Utilities
 * Defense-in-depth PII protection for evaluation outputs
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// PII Detection Patterns
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_PATTERN = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
const SSN_PATTERN = /\b\d{3}-?\d{2}-?\d{4}\b/g;
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const ADDRESS_PATTERN = /\b\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Circle|Cir|Court|Ct)\b/gi;

// Common real names that shouldn't appear in test data
const SUSPICIOUS_NAMES = [
  'john doe', 'jane doe', 'john smith', 'jane smith',
  // Add more if needed, but these are the most common real-sounding names
];

export interface PIIDetection {
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'address' | 'suspicious_name';
  value: string;
  line?: number;
  column?: number;
  context?: string;
}

export interface PIIScanResult {
  file: string;
  hasPII: boolean;
  detections: PIIDetection[];
  scannedAt: string;
}

export interface PIIScanReport {
  totalFiles: number;
  filesWithPII: number;
  totalDetections: number;
  passed: boolean;
  results: PIIScanResult[];
  summary: Record<string, number>;
}

/**
 * Scans a single text string for PII
 */
export function scanTextForPII(text: string): PIIDetection[] {
  const detections: PIIDetection[] = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    // Email detection
    const emailMatches = line.matchAll(EMAIL_PATTERN);
    for (const match of emailMatches) {
      detections.push({
        type: 'email',
        value: match[0],
        line: lineIndex + 1,
        column: match.index || 0,
        context: getContext(line, match.index || 0, match[0].length)
      });
    }

    // Phone detection
    const phoneMatches = line.matchAll(PHONE_PATTERN);
    for (const match of phoneMatches) {
      detections.push({
        type: 'phone',
        value: match[0],
        line: lineIndex + 1,
        column: match.index || 0,
        context: getContext(line, match.index || 0, match[0].length)
      });
    }

    // SSN detection
    const ssnMatches = line.matchAll(SSN_PATTERN);
    for (const match of ssnMatches) {
      detections.push({
        type: 'ssn',
        value: match[0],
        line: lineIndex + 1,
        column: match.index || 0,
        context: getContext(line, match.index || 0, match[0].length)
      });
    }

    // Credit card detection
    const cardMatches = line.matchAll(CREDIT_CARD_PATTERN);
    for (const match of cardMatches) {
      detections.push({
        type: 'credit_card',
        value: match[0],
        line: lineIndex + 1,
        column: match.index || 0,
        context: getContext(line, match.index || 0, match[0].length)
      });
    }

    // Address detection
    const addressMatches = line.matchAll(ADDRESS_PATTERN);
    for (const match of addressMatches) {
      detections.push({
        type: 'address',
        value: match[0],
        line: lineIndex + 1,
        column: match.index || 0,
        context: getContext(line, match.index || 0, match[0].length)
      });
    }

    // Suspicious name detection
    const lineLower = line.toLowerCase();
    SUSPICIOUS_NAMES.forEach(name => {
      const index = lineLower.indexOf(name);
      if (index !== -1) {
        detections.push({
          type: 'suspicious_name',
          value: name,
          line: lineIndex + 1,
          column: index,
          context: getContext(line, index, name.length)
        });
      }
    });
  });

  return detections;
}

/**
 * Scans a single file for PII
 */
export async function scanFileForPII(filePath: string): Promise<PIIScanResult> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const detections = scanTextForPII(content);

    return {
      file: filePath,
      hasPII: detections.length > 0,
      detections,
      scannedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      file: filePath,
      hasPII: false,
      detections: [{
        type: 'email',
        value: `Scan failed: ${(error as Error).message}`
      } as PIIDetection],
      scannedAt: new Date().toISOString()
    };
  }
}

/**
 * Scans multiple files for PII
 */
export async function scanFilesForPII(filePaths: string[]): Promise<PIIScanReport> {
  const results: PIIScanResult[] = [];
  const summary: Record<string, number> = {};

  for (const filePath of filePaths) {
    const result = await scanFileForPII(filePath);
    results.push(result);

    // Update summary
    result.detections.forEach(detection => {
      summary[detection.type] = (summary[detection.type] || 0) + 1;
    });
  }

  const filesWithPII = results.filter(r => r.hasPII).length;
  const totalDetections = results.reduce((sum, r) => sum + r.detections.length, 0);

  return {
    totalFiles: filePaths.length,
    filesWithPII,
    totalDetections,
    passed: filesWithPII === 0,
    results,
    summary
  };
}

/**
 * Scans all files in evaluation outputs directory
 */
export async function scanEvaluationOutputs(outputDir: string): Promise<PIIScanReport> {
  const filesToScan: string[] = [];

  try {
    const entries = await fs.readdir(outputDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(outputDir, entry.name);
        // Scan JSON, JSONL, and MD files
        if (entry.name.match(/\.(json|jsonl|md)$/)) {
          filesToScan.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Failed to read output directory: ${error}`);
    return {
      totalFiles: 0,
      filesWithPII: 0,
      totalDetections: 0,
      passed: false,
      results: [],
      summary: { scan_error: 1 }
    };
  }

  return await scanFilesForPII(filesToScan);
}

/**
 * Gets context around detected PII for debugging
 */
function getContext(line: string, start: number, length: number): string {
  const contextStart = Math.max(0, start - 20);
  const contextEnd = Math.min(line.length, start + length + 20);
  const context = line.substring(contextStart, contextEnd);
  
  // Replace the actual PII with [DETECTED] in the context
  const beforePII = context.substring(0, start - contextStart);
  const afterPII = context.substring(start - contextStart + length);
  
  return beforePII + '[DETECTED]' + afterPII;
}

/**
 * Generates a human-readable PII scan report
 */
export function generatePIIReport(scanResult: PIIScanReport): string {
  let report = '# PII Scan Report\n\n';
  report += `**Scan Date:** ${new Date().toISOString()}\n`;
  report += `**Status:** ${scanResult.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

  report += '## Summary\n\n';
  report += `- **Total Files Scanned:** ${scanResult.totalFiles}\n`;
  report += `- **Files with PII:** ${scanResult.filesWithPII}\n`;
  report += `- **Total Detections:** ${scanResult.totalDetections}\n\n`;

  if (scanResult.totalDetections > 0) {
    report += '## Detection Types\n\n';
    Object.entries(scanResult.summary).forEach(([type, count]) => {
      report += `- **${type}:** ${count}\n`;
    });
    report += '\n';

    report += '## Detailed Results\n\n';
    scanResult.results.forEach(result => {
      if (result.hasPII) {
        report += `### ${result.file}\n\n`;
        result.detections.forEach((detection, index) => {
          report += `${index + 1}. **${detection.type}** at line ${detection.line}:${detection.column}\n`;
          if (detection.context) {
            report += `   Context: \`${detection.context}\`\n`;
          }
          report += '\n';
        });
      }
    });

    report += '## Action Required\n\n';
    report += '❌ **PII detected in evaluation outputs!**\n\n';
    report += 'This indicates a failure in the PII redaction system. Please:\n\n';
    report += '1. Review the detected PII above\n';
    report += '2. Check redaction logic in evaluation runners\n';
    report += '3. Update test data to use fictional information only\n';
    report += '4. Re-run evaluation after fixes\n';
  } else {
    report += '✅ **No PII detected in any evaluation output files.**\n\n';
    report += 'All outputs are safe to share with stakeholders and funders.\n';
  }

  return report;
}

/**
 * CLI-friendly PII scan with exit codes
 */
export async function runPIIScan(outputDir: string): Promise<void> {
  console.log('🔍 Scanning evaluation outputs for PII...');
  
  const scanResult = await scanEvaluationOutputs(outputDir);
  
  if (scanResult.passed) {
    console.log('✅ PII scan passed - no PII detected');
    console.log(`Scanned ${scanResult.totalFiles} files successfully`);
  } else {
    console.error('❌ PII scan failed - PII detected!');
    console.error(`Found ${scanResult.totalDetections} PII instances in ${scanResult.filesWithPII} files`);
    
    // Print summary
    Object.entries(scanResult.summary).forEach(([type, count]) => {
      console.error(`  - ${type}: ${count}`);
    });
    
    // Generate full report
    const reportContent = generatePIIReport(scanResult);
    const reportPath = path.join(outputDir, 'pii-scan-report.md');
    
    try {
      await fs.writeFile(reportPath, reportContent);
      console.error(`📄 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Failed to save PII report:', error);
    }
    
    process.exit(1);
  }
}

/**
 * Pre-write PII scan for individual strings
 * Use this to validate data before writing to files
 */
export function validateNoPII(data: string, context: string): void {
  const detections = scanTextForPII(data);
  if (detections.length > 0) {
    const error = new Error(
      `PII detected in ${context}: ${detections.length} instances found. ` +
      `Types: ${[...new Set(detections.map(d => d.type))].join(', ')}`
    );
    (error as any).code = 'PII_DETECTED';
    (error as any).detections = detections;
    (error as any).context = context;
    throw error;
  }
}

/**
 * Post-write verification scan
 * Use this after writing files to double-check
 */
export async function verifyFileNoPII(filePath: string): Promise<void> {
  const result = await scanFileForPII(filePath);
  if (result.hasPII) {
    const error = new Error(
      `PII verification failed for ${filePath}: ${result.detections.length} instances found`
    );
    (error as any).code = 'PII_VERIFICATION_FAILED';
    (error as any).detections = result.detections;
    (error as any).file = filePath;
    throw error;
  }
}