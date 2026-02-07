import * as crypto from 'crypto';

/**
 * Secure hashing utilities for correlation without storing raw data
 */

export interface HashOptions {
  algorithm?: string;
  encoding?: 'hex' | 'base64';
  salt?: string;
}

/**
 * Creates a SHA256 hash of input text
 * Used for correlating transcript records without storing raw text
 */
export function hashText(text: string, options: HashOptions = {}): string {
  const {
    algorithm = 'sha256',
    encoding = 'hex',
    salt = ''
  } = options;

  const hasher = crypto.createHash(algorithm);
  hasher.update(salt + text);
  return hasher.digest(encoding);
}

/**
 * Creates a consistent hash for transcript correlation
 * Always uses SHA256 with hex encoding for consistency
 */
export function createTranscriptHash(transcriptText: string): string {
  return `sha256:${hashText(transcriptText, { algorithm: 'sha256', encoding: 'hex' })}`;
}

/**
 * Creates a hash for a specific field value
 * Useful for correlating field-specific issues
 */
export function hashFieldValue(fieldName: string, value: any): string {
  const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return hashText(`${fieldName}:${valueStr}`, { salt: 'field_' });
}

/**
 * Creates a deterministic case identifier hash
 * Combines dataset ID and case ID for unique correlation
 */
export function createCaseHash(datasetId: string, caseId: string): string {
  return hashText(`${datasetId}:${caseId}`, { salt: 'case_' });
}

/**
 * Creates a hash for error correlation
 * Helps identify similar failure patterns without storing raw data
 */
export function createErrorSignatureHash(
  fieldFailures: Array<{ field: string; expected: any; actual: any }>,
  failureBucket: string
): string {
  const signature = fieldFailures
    .map(f => `${f.field}:${f.expected}->${f.actual}`)
    .sort()
    .join('|') + `|bucket:${failureBucket}`;
  
  return hashText(signature, { salt: 'error_' });
}

/**
 * Generates a stable parser version identifier
 * Uses git commit hash when available, otherwise timestamp
 */
export function getParserVersion(): string {
  try {
    // Try to get git commit hash
    const { execSync } = require('child_process');
    const gitHash = execSync('git rev-parse --short HEAD', { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'ignore'] 
    }).trim();
    return `git:${gitHash}`;
  } catch {
    // Fallback to package version + timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    return `v1.0.0:${timestamp}`;
  }
}

/**
 * Creates a content-based hash for result validation
 * Ensures result files haven't been tampered with
 */
export function createResultsHash(resultsData: any): string {
  const normalizedData = JSON.stringify(resultsData, Object.keys(resultsData).sort());
  return hashText(normalizedData, { salt: 'results_' });
}
