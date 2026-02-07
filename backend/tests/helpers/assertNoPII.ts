/**
 * PII Detection and Assertion Helper
 * 
 * Ensures telemetry output and logs contain no personally identifiable information
 */

export interface PIICheckResult {
  hasPII: boolean;
  violations: PIIViolation[];
}

export interface PIIViolation {
  type: 'email' | 'phone' | 'ssn' | 'transcript' | 'name' | 'address';
  match: string;
  position: number;
  context: string;
}

/**
 * PII detection patterns
 */
const PII_PATTERNS = {
  // Email patterns - comprehensive coverage
  email: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    /@[A-Za-z0-9.-]+/g // Catch partial emails
  ],
  
  // Phone number patterns - various formats
  phone: [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,           // 555-123-4567, 555.123.4567, 555 123 4567
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/g,               // (555) 123-4567
    /\b1[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,   // 1-555-123-4567
    /\b\d{10,11}\b/g                                 // 10-11 consecutive digits
  ],
  
  // Social Security Number patterns
  ssn: [
    /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,          // 123-45-6789, 123.45.6789, 123 45 6789
    /\b\d{9}\b/g                                    // 123456789 (9 consecutive digits)
  ],
  
  // Common name patterns (when provided for exclusion)
  name: [] as RegExp[], // Populated dynamically when names are provided
  
  // Address patterns
  address: [
    /\b\d+\s+[A-Za-z0-9\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
    /\b\d{5}(?:-\d{4})?\b/g // ZIP codes
  ]
};

/**
 * Check for PII in text or JSON string
 */
export function checkForPII(
  content: string, 
  options?: {
    originalTranscript?: string;
    extractedNames?: string[];
    allowedPatterns?: RegExp[];
  }
): PIICheckResult {
  const violations: PIIViolation[] = [];
  const opts = options || {};
  
  // Check email patterns
  for (const pattern of PII_PATTERNS.email) {
    const matches = Array.from(content.matchAll(pattern));
    for (const match of matches) {
      violations.push({
        type: 'email',
        match: match[0],
        position: match.index || 0,
        context: getContext(content, match.index || 0)
      });
    }
  }
  
  // Check phone patterns (filter out acceptable numeric values)
  for (const pattern of PII_PATTERNS.phone) {
    const matches = Array.from(content.matchAll(pattern));
    for (const match of matches) {
      const matchText = match[0];
      
      // Skip if it's clearly not a phone (timestamp, score, etc.)
      if (isAcceptableNumeric(matchText, content, match.index || 0)) {
        continue;
      }
      
      violations.push({
        type: 'phone',
        match: matchText,
        position: match.index || 0,
        context: getContext(content, match.index || 0)
      });
    }
  }
  
  // Check SSN patterns
  for (const pattern of PII_PATTERNS.ssn) {
    const matches = Array.from(content.matchAll(pattern));
    for (const match of matches) {
      const matchText = match[0];
      
      // Skip if it's clearly not SSN (timestamp, etc.)
      if (isAcceptableNumeric(matchText, content, match.index || 0)) {
        continue;
      }
      
      violations.push({
        type: 'ssn',
        match: matchText,
        position: match.index || 0,
        context: getContext(content, match.index || 0)
      });
    }
  }
  
  // Check for raw transcript content
  if (opts.originalTranscript) {
    const transcript = opts.originalTranscript.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Look for substantial chunks of transcript content (5+ words)
    const transcriptWords = transcript.split(/\s+/).filter(w => w.length > 2);
    for (let i = 0; i < transcriptWords.length - 4; i++) {
      const phrase = transcriptWords.slice(i, i + 5).join(' ');
      if (contentLower.includes(phrase)) {
        const index = contentLower.indexOf(phrase);
        violations.push({
          type: 'transcript',
          match: phrase,
          position: index,
          context: getContext(content, index)
        });
      }
    }
  }
  
  // Check for extracted names
  if (opts.extractedNames) {
    for (const name of opts.extractedNames) {
      if (name && name.length > 1) {
        const namePattern = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'gi');
        const matches = Array.from(content.matchAll(namePattern));
        for (const match of matches) {
          violations.push({
            type: 'name',
            match: match[0],
            position: match.index || 0,
            context: getContext(content, match.index || 0)
          });
        }
      }
    }
  }
  
  return {
    hasPII: violations.length > 0,
    violations
  };
}

/**
 * Assert that content contains no PII - throws if PII found
 */
export function assertNoPII(
  content: string | object, 
  options?: {
    originalTranscript?: string;
    extractedNames?: string[];
    allowedPatterns?: RegExp[];
  }
): void {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  const result = checkForPII(contentStr, options);
  
  if (result.hasPII) {
    const violationSummary = result.violations.map(v => 
      `${v.type.toUpperCase()}: "${v.match}" at position ${v.position}`
    ).join('\n');
    
    throw new Error(`PII detected in content!\n${violationSummary}\n\nContext samples:\n${
      result.violations.slice(0, 3).map(v => `"${v.context}"`).join('\n')
    }`);
  }
}

/**
 * Get context around a match position
 */
function getContext(content: string, position: number, contextLength: number = 50): string {
  const start = Math.max(0, position - contextLength);
  const end = Math.min(content.length, position + contextLength);
  return content.substring(start, end);
}

/**
 * Check if a numeric match is acceptable (timestamp, score, etc.)
 */
function isAcceptableNumeric(match: string, fullContent: string, position: number): boolean {
  const context = getContext(fullContent, position, 30).toLowerCase();
  
  // Acceptable contexts for numbers
  const acceptableContexts = [
    'timestamp',
    'confidence',
    'score',
    'duration',
    'length',
    'count',
    'quality',
    'extraction',
    'processing',
    'session',
    'metric',
    'ms', // milliseconds
    'mb', // megabytes
    'kb'  // kilobytes
  ];
  
  return acceptableContexts.some(ctx => context.includes(ctx));
}

/**
 * Escape string for use in RegExp
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate telemetry output specifically
 */
export function assertTelemetryNoPII(telemetryOutput: any, originalTranscript?: string): void {
  // Convert telemetry to string for analysis
  const telemetryStr = JSON.stringify(telemetryOutput);
  
  // Specific telemetry PII checks
  const result = checkForPII(telemetryStr, {
    originalTranscript,
    extractedNames: [] // Names should not be in telemetry at all
  });
  
  if (result.hasPII) {
    throw new Error(`PII found in telemetry output: ${result.violations.map(v => v.type).join(', ')}`);
  }
  
  // Additional telemetry-specific checks
  if (telemetryStr.includes('@')) {
    throw new Error('Telemetry contains @ symbol - possible email leak');
  }
  
  // Check for common PII indicators that might slip through
  const forbiddenTerms = ['name:', 'email:', 'phone:', 'address:', 'transcript:'];
  for (const term of forbiddenTerms) {
    if (telemetryStr.toLowerCase().includes(term)) {
      throw new Error(`Telemetry contains forbidden term: ${term}`);
    }
  }
}
