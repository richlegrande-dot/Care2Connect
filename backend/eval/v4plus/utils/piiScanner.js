/**
 * PII Scanner for Evaluation Output
 * 
 * Scans evaluation output files for personally identifiable information.
 * Fails hard if PII detected to prevent accidental leakage.
 */

const fs = require('fs');
const path = require('path');

class PIIScanner {
  constructor() {
    this.patterns = {
      email: {
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        description: 'Email address'
      },
      phone: {
        regex: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
        description: '10-digit phone number'
      },
      streetAddress: {
        regex: /\b\d+\s+(?:[A-Z][a-z]+\s+){1,3}(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Way|Circle|Cir)\b/gi,
        description: 'Street address'
      },
      ssn: {
        regex: /\b\d{3}-\d{2}-\d{4}\b/g,
        description: 'Social Security Number'
      },
      creditCard: {
        regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
        description: 'Credit card number'
      }
    };

    this.findings = [];
  }

  /**
   * Scan a single file for PII
   */
  scanFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return { scanned: false, reason: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileFindings = [];

    lines.forEach((line, lineNum) => {
      for (const [piiType, pattern] of Object.entries(this.patterns)) {
        const matches = line.match(pattern.regex);
        if (matches) {
          matches.forEach(match => {
            fileFindings.push({
              file: filePath,
              line: lineNum + 1,
              piiType: pattern.description,
              match: this.redact(match),
              context: this.getContext(line, match)
            });
          });
        }
      }
    });

    if (fileFindings.length > 0) {
      this.findings.push(...fileFindings);
    }

    return {
      scanned: true,
      findings: fileFindings.length,
      hasPII: fileFindings.length > 0
    };
  }

  /**
   * Scan multiple files
   */
  scanFiles(filePaths) {
    const results = {};
    
    filePaths.forEach(filePath => {
      results[filePath] = this.scanFile(filePath);
    });

    return results;
  }

  /**
   * Scan all files in reports directory
   */
  scanReportsDirectory(reportsDir) {
    if (!fs.existsSync(reportsDir)) {
      return { scanned: false, reason: 'Reports directory not found' };
    }

    const files = fs.readdirSync(reportsDir)
      .filter(f => f.endsWith('.json') || f.endsWith('.md') || f.endsWith('.jsonl'))
      .map(f => path.join(reportsDir, f));

    return this.scanFiles(files);
  }

  /**
   * Redact PII for display
   */
  redact(text) {
    if (text.length <= 4) return '***';
    return text.substring(0, 2) + '*'.repeat(text.length - 4) + text.substring(text.length - 2);
  }

  /**
   * Get surrounding context for PII match
   */
  getContext(line, match) {
    const maxLength = 80;
    const matchIndex = line.indexOf(match);
    
    if (matchIndex === -1) return line.substring(0, maxLength);
    
    const start = Math.max(0, matchIndex - 20);
    const end = Math.min(line.length, matchIndex + match.length + 20);
    
    let context = line.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < line.length) context = context + '...';
    
    return context;
  }

  /**
   * Get summary of findings
   */
  getSummary() {
    const byType = {};
    const byFile = {};

    this.findings.forEach(finding => {
      byType[finding.piiType] = (byType[finding.piiType] || 0) + 1;
      byFile[finding.file] = (byFile[finding.file] || 0) + 1;
    });

    return {
      totalFindings: this.findings.length,
      hasPII: this.findings.length > 0,
      byType,
      byFile,
      findings: this.findings
    };
  }

  /**
   * Display findings and fail if PII detected
   */
  displayAndFail() {
    if (this.findings.length === 0) {
      console.log('✅ PII Scan: No PII detected in evaluation outputs\n');
      return;
    }

    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║  ❌ PII SCAN FAILURE - PERSONALLY IDENTIFIABLE INFO DETECTED  ║');
    console.error('╚════════════════════════════════════════════════════════════════╝\n');

    const summary = this.getSummary();
    
    console.error(`Total PII Instances: ${summary.totalFindings}\n`);
    
    console.error('By Type:');
    Object.entries(summary.byType).forEach(([type, count]) => {
      console.error(`  - ${type}: ${count} instance(s)`);
    });
    console.error('');

    console.error('By File:');
    Object.entries(summary.byFile).forEach(([file, count]) => {
      console.error(`  - ${path.basename(file)}: ${count} instance(s)`);
    });
    console.error('');

    console.error('Detailed Findings (first 10):');
    this.findings.slice(0, 10).forEach((finding, idx) => {
      console.error(`\n${idx + 1}. ${finding.piiType}`);
      console.error(`   File: ${finding.file}`);
      console.error(`   Line: ${finding.line}`);
      console.error(`   Match: ${finding.match}`);
      console.error(`   Context: ${finding.context}`);
    });

    if (this.findings.length > 10) {
      console.error(`\n... and ${this.findings.length - 10} more finding(s)`);
    }

    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║  EVALUATION FAILED: PII must be removed before proceeding     ║');
    console.error('╚════════════════════════════════════════════════════════════════╝\n');

    throw new Error(`PII_SCAN_FAILURE: ${summary.totalFindings} PII instance(s) detected in evaluation outputs`);
  }

  /**
   * Reset scanner state
   */
  reset() {
    this.findings = [];
  }
}

module.exports = { PIIScanner };
