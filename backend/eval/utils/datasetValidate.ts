/**
 * Dataset Validation and Schema Enforcement
 * Ensures golden datasets maintain quality and consistency
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { scanTextForPII } from './piiScan';

export interface DatasetValidationError {
  lineNumber: number;
  caseId?: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface DatasetValidationResult {
  valid: boolean;
  totalCases: number;
  errors: DatasetValidationError[];
  warnings: DatasetValidationError[];
  summary: {
    duplicateIds: string[];
    missingFields: Record<string, number>;
    suspiciousPII: number;
    oversizedTranscripts: number;
  };
}

export interface GoldenDatasetCase {
  id: string;
  description: string;
  transcriptText: string;
  segments: Array<{
    startMs: number;
    endMs: number;
    text: string;
  }>;
  expected: {
    name?: string;
    category?: string;
    urgencyLevel?: string;
    goalAmount?: number;
    missingFields?: string[];
    beneficiaryRelationship?: string;
  };
  expectations?: {
    allowFuzzyName?: boolean;
    amountTolerance?: number;
    keyPointsMin?: number;
  };
}

/**
 * Validates a single dataset case
 */
export function validateDatasetCase(
  caseData: any, 
  lineNumber: number
): DatasetValidationError[] {
  const errors: DatasetValidationError[] = [];

  // Required top-level fields
  const requiredFields = ['id', 'description', 'transcriptText', 'segments', 'expected'];
  requiredFields.forEach(field => {
    if (!caseData[field]) {
      errors.push({
        lineNumber,
        caseId: caseData.id || 'unknown',
        field,
        message: `Missing required field: ${field}`,
        severity: 'error'
      });
    }
  });

  // Validate ID format
  if (caseData.id && !caseData.id.match(/^T\d{3,}$/)) {
    errors.push({
      lineNumber,
      caseId: caseData.id,
      field: 'id',
      message: 'ID must follow pattern T### (e.g., T001)',
      severity: 'error'
    });
  }

  // Validate transcript text
  if (caseData.transcriptText) {
    if (typeof caseData.transcriptText !== 'string') {
      errors.push({
        lineNumber,
        caseId: caseData.id,
        field: 'transcriptText',
        message: 'Transcript text must be a string',
        severity: 'error'
      });
    } else {
      // Check for empty or too short transcripts
      if (caseData.transcriptText.trim().length < 20) {
        errors.push({
          lineNumber,
          caseId: caseData.id,
          field: 'transcriptText',
          message: 'Transcript text is too short (minimum 20 characters)',
          severity: 'error'
        });
      }

      // Check for oversized transcripts
      if (caseData.transcriptText.length > 2000) {
        errors.push({
          lineNumber,
          caseId: caseData.id,
          field: 'transcriptText',
          message: 'Transcript text is very long (>2000 chars) - consider splitting',
          severity: 'warning'
        });
      }

      // Check for potential PII
      const piiDetections = scanTextForPII(caseData.transcriptText);
      if (piiDetections.length > 0) {
        piiDetections.forEach(detection => {
          errors.push({
            lineNumber,
            caseId: caseData.id,
            field: 'transcriptText',
            message: `Potential PII detected: ${detection.type} - "${detection.value}"`,
            severity: 'error'
          });
        });
      }
    }
  }

  // Validate segments
  if (caseData.segments) {
    if (!Array.isArray(caseData.segments)) {
      errors.push({
        lineNumber,
        caseId: caseData.id,
        field: 'segments',
        message: 'Segments must be an array',
        severity: 'error'
      });
    } else {
      caseData.segments.forEach((segment: any, index: number) => {
        if (typeof segment.startMs !== 'number' || segment.startMs < 0) {
          errors.push({
            lineNumber,
            caseId: caseData.id,
            field: `segments[${index}].startMs`,
            message: 'startMs must be a non-negative number',
            severity: 'error'
          });
        }
        if (typeof segment.endMs !== 'number' || segment.endMs <= segment.startMs) {
          errors.push({
            lineNumber,
            caseId: caseData.id,
            field: `segments[${index}].endMs`,
            message: 'endMs must be a number greater than startMs',
            severity: 'error'
          });
        }
        if (!segment.text || typeof segment.text !== 'string') {
          errors.push({
            lineNumber,
            caseId: caseData.id,
            field: `segments[${index}].text`,
            message: 'Segment text must be a non-empty string',
            severity: 'error'
          });
        }
      });
    }
  }

  // Validate expected results
  if (caseData.expected) {
    const expected = caseData.expected;

    // Check category values
    if (expected.category) {
      const validCategories = ['HOUSING', 'EMPLOYMENT', 'HEALTHCARE', 'EDUCATION', 'FAMILY', 'LEGAL', 'EMERGENCY', 'OTHER'];
      if (!validCategories.includes(expected.category)) {
        errors.push({
          lineNumber,
          caseId: caseData.id,
          field: 'expected.category',
          message: `Invalid category: ${expected.category}. Must be one of: ${validCategories.join(', ')}`,
          severity: 'error'
        });
      }
    }

    // Check urgency level values
    if (expected.urgencyLevel) {
      const validUrgency = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      if (!validUrgency.includes(expected.urgencyLevel)) {
        errors.push({
          lineNumber,
          caseId: caseData.id,
          field: 'expected.urgencyLevel',
          message: `Invalid urgency level: ${expected.urgencyLevel}. Must be one of: ${validUrgency.join(', ')}`,
          severity: 'error'
        });
      }
    }

    // Check goal amount
    if (expected.goalAmount !== null && expected.goalAmount !== undefined) {
      if (typeof expected.goalAmount !== 'number' || expected.goalAmount <= 0) {
        errors.push({
          lineNumber,
          caseId: caseData.id,
          field: 'expected.goalAmount',
          message: 'Goal amount must be a positive number or null',
          severity: 'error'
        });
      }
    }

    // Check missing fields format
    if (expected.missingFields && !Array.isArray(expected.missingFields)) {
      errors.push({
        lineNumber,
        caseId: caseData.id,
        field: 'expected.missingFields',
        message: 'Missing fields must be an array',
        severity: 'error'
      });
    }
  }

  // Validate expectations (tolerance settings)
  if (caseData.expectations) {
    const expectations = caseData.expectations;

    if (expectations.allowFuzzyName !== undefined && typeof expectations.allowFuzzyName !== 'boolean') {
      errors.push({
        lineNumber,
        caseId: caseData.id,
        field: 'expectations.allowFuzzyName',
        message: 'allowFuzzyName must be a boolean',
        severity: 'error'
      });
    }

    if (expectations.amountTolerance !== undefined) {
      if (typeof expectations.amountTolerance !== 'number' || expectations.amountTolerance < 0) {
        errors.push({
          lineNumber,
          caseId: caseData.id,
          field: 'expectations.amountTolerance',
          message: 'amountTolerance must be a non-negative number',
          severity: 'error'
        });
      }
    }
  }

  return errors;
}

/**
 * Validates an entire JSONL dataset file
 */
export async function validateDatasetFile(filePath: string): Promise<DatasetValidationResult> {
  const errors: DatasetValidationError[] = [];
  const warnings: DatasetValidationError[] = [];
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];
  const missingFields: Record<string, number> = {};
  let suspiciousPII = 0;
  let oversizedTranscripts = 0;
  let totalCases = 0;

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      totalCases++;

      try {
        const caseData = JSON.parse(line);
        
        // Check for duplicate IDs
        if (caseData.id) {
          if (seenIds.has(caseData.id)) {
            duplicateIds.push(caseData.id);
            errors.push({
              lineNumber,
              caseId: caseData.id,
              field: 'id',
              message: `Duplicate case ID: ${caseData.id}`,
              severity: 'error'
            });
          }
          seenIds.add(caseData.id);
        }

        // Validate the case
        const caseErrors = validateDatasetCase(caseData, lineNumber);
        caseErrors.forEach(error => {
          if (error.severity === 'error') {
            errors.push(error);
          } else {
            warnings.push(error);
          }

          // Track statistics
          if (error.message.includes('PII detected')) {
            suspiciousPII++;
          }
          if (error.message.includes('very long')) {
            oversizedTranscripts++;
          }
          if (error.message.includes('Missing required field')) {
            const field = error.field;
            missingFields[field] = (missingFields[field] || 0) + 1;
          }
        });

      } catch (parseError) {
        errors.push({
          lineNumber,
          field: 'json',
          message: `Invalid JSON: ${(parseError as Error).message}`,
          severity: 'error'
        });
      }
    });

  } catch (fileError) {
    errors.push({
      lineNumber: 0,
      field: 'file',
      message: `Failed to read dataset file: ${(fileError as Error).message}`,
      severity: 'error'
    });
  }

  return {
    valid: errors.length === 0,
    totalCases,
    errors,
    warnings,
    summary: {
      duplicateIds,
      missingFields,
      suspiciousPII,
      oversizedTranscripts
    }
  };
}

/**
 * Validates all dataset files in the datasets directory
 */
export async function validateAllDatasets(datasetsDir: string): Promise<Record<string, DatasetValidationResult>> {
  const results: Record<string, DatasetValidationResult> = {};

  try {
    const files = await fs.readdir(datasetsDir);
    const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));

    for (const file of jsonlFiles) {
      const filePath = path.join(datasetsDir, file);
      const result = await validateDatasetFile(filePath);
      results[file] = result;
    }
  } catch (error) {
    console.error(`Failed to read datasets directory: ${error}`);
  }

  return results;
}

/**
 * Generates a human-readable validation report
 */
export function generateValidationReport(
  fileName: string, 
  result: DatasetValidationResult
): string {
  let report = `# Dataset Validation Report: ${fileName}\n\n`;
  report += `**Validation Date:** ${new Date().toISOString()}\n`;
  report += `**Status:** ${result.valid ? '✅ VALID' : '❌ INVALID'}\n\n`;

  report += '## Summary\n\n';
  report += `- **Total Cases:** ${result.totalCases}\n`;
  report += `- **Errors:** ${result.errors.length}\n`;
  report += `- **Warnings:** ${result.warnings.length}\n`;
  report += `- **Duplicate IDs:** ${result.summary.duplicateIds.length}\n`;
  report += `- **Suspicious PII:** ${result.summary.suspiciousPII}\n`;
  report += `- **Oversized Transcripts:** ${result.summary.oversizedTranscripts}\n\n`;

  if (result.summary.duplicateIds.length > 0) {
    report += '## Duplicate IDs\n\n';
    result.summary.duplicateIds.forEach(id => {
      report += `- ${id}\n`;
    });
    report += '\n';
  }

  if (Object.keys(result.summary.missingFields).length > 0) {
    report += '## Missing Fields Summary\n\n';
    Object.entries(result.summary.missingFields).forEach(([field, count]) => {
      report += `- **${field}:** ${count} cases\n`;
    });
    report += '\n';
  }

  if (result.errors.length > 0) {
    report += '## Errors\n\n';
    result.errors.forEach((error, index) => {
      report += `${index + 1}. **Line ${error.lineNumber}** (${error.caseId || 'unknown'}): `;
      report += `${error.field} - ${error.message}\n`;
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += '## Warnings\n\n';
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. **Line ${warning.lineNumber}** (${warning.caseId || 'unknown'}): `;
      report += `${warning.field} - ${warning.message}\n`;
    });
    report += '\n';
  }

  if (result.valid) {
    report += '✅ **Dataset validation passed!**\n\n';
    report += 'All test cases follow the required schema and contain no detectable issues.\n';
  } else {
    report += '❌ **Dataset validation failed!**\n\n';
    report += 'Please fix the errors above before using this dataset for evaluation.\n';
  }

  return report;
}

/**
 * CLI function for dataset validation
 */
export async function runDatasetValidation(datasetsDir: string): Promise<void> {
  console.log('🔍 Validating dataset files...');

  const results = await validateAllDatasets(datasetsDir);
  let totalValid = 0;
  let totalInvalid = 0;
  let totalCases = 0;
  let totalErrors = 0;

  Object.entries(results).forEach(([fileName, result]) => {
    console.log(`\n📄 ${fileName}:`);
    console.log(`  Cases: ${result.totalCases}`);
    console.log(`  Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!result.valid) {
      console.log(`  Errors: ${result.errors.length}`);
      console.log(`  Warnings: ${result.warnings.length}`);
    }

    if (result.valid) {
      totalValid++;
    } else {
      totalInvalid++;
    }
    totalCases += result.totalCases;
    totalErrors += result.errors.length;
  });

  console.log('\n📊 Validation Summary:');
  console.log(`  Valid datasets: ${totalValid}`);
  console.log(`  Invalid datasets: ${totalInvalid}`);
  console.log(`  Total cases: ${totalCases}`);
  console.log(`  Total errors: ${totalErrors}`);

  // Save detailed reports
  for (const [fileName, result] of Object.entries(results)) {
    const reportContent = generateValidationReport(fileName, result);
    const reportPath = path.join(datasetsDir, `${fileName}.validation-report.md`);
    
    try {
      await fs.writeFile(reportPath, reportContent);
      console.log(`📄 Report saved: ${reportPath}`);
    } catch (error) {
      console.error(`Failed to save report for ${fileName}:`, error);
    }
  }

  if (totalInvalid > 0) {
    console.error('\n❌ Dataset validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All datasets are valid!');
  }
}
