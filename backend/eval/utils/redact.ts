import * as crypto from 'crypto';

/**
 * Privacy-focused redaction utilities
 * Removes PII from text while preserving structure for debugging
 */

// Regex patterns for PII detection
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_PATTERN = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
const SSN_PATTERN = /\b\d{3}-?\d{2}-?\d{4}\b/g;
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;

export interface RedactionOptions {
  preserveStructure?: boolean;
  maxLength?: number;
  replacementChar?: string;
}

/**
 * Redacts PII from text while preserving readability for debugging
 */
export function redactText(text: string, options: RedactionOptions = {}): string {
  const {
    preserveStructure = true,
    maxLength = 120,
    replacementChar = '*'
  } = options;

  let redacted = text;

  // Redact emails
  redacted = redacted.replace(EMAIL_PATTERN, (match) => {
    if (preserveStructure) {
      const [localPart, domain] = match.split('@');
      const localRedacted = localPart.charAt(0) + replacementChar.repeat(Math.max(1, localPart.length - 2)) + localPart.charAt(localPart.length - 1);
      const domainRedacted = domain.charAt(0) + replacementChar.repeat(Math.max(1, domain.length - 2)) + domain.charAt(domain.length - 1);
      return `${localRedacted}@${domainRedacted}`;
    }
    return '[EMAIL_REDACTED]';
  });

  // Redact phone numbers
  redacted = redacted.replace(PHONE_PATTERN, () => {
    if (preserveStructure) {
      return `${replacementChar.repeat(3)}-${replacementChar.repeat(3)}-${replacementChar.repeat(4)}`;
    }
    return '[PHONE_REDACTED]';
  });

  // Redact SSNs
  redacted = redacted.replace(SSN_PATTERN, () => {
    if (preserveStructure) {
      return `${replacementChar.repeat(3)}-${replacementChar.repeat(2)}-${replacementChar.repeat(4)}`;
    }
    return '[SSN_REDACTED]';
  });

  // Redact credit cards
  redacted = redacted.replace(CREDIT_CARD_PATTERN, () => {
    if (preserveStructure) {
      return `${replacementChar.repeat(4)}-${replacementChar.repeat(4)}-${replacementChar.repeat(4)}-${replacementChar.repeat(4)}`;
    }
    return '[CARD_REDACTED]';
  });

  // Truncate to max length if specified
  if (maxLength && redacted.length > maxLength) {
    redacted = redacted.substring(0, maxLength - 3) + '...';
  }

  return redacted;
}

/**
 * Creates a safe preview of transcript text for debugging
 * Removes PII and limits length
 */
export function createSafePreview(transcriptText: string, maxLength: number = 120): string {
  return redactText(transcriptText, {
    preserveStructure: true,
    maxLength,
    replacementChar: '*'
  });
}

/**
 * Redacts specific field values that might contain PII
 */
export function redactFieldValue(fieldName: string, value: any): any {
  if (typeof value !== 'string') {
    return value;
  }

  switch (fieldName.toLowerCase()) {
    case 'name':
    case 'beneficiary':
    case 'contact':
      // For names, keep first and last character
      if (value.length <= 2) {
        return '*'.repeat(value.length);
      }
      return value.charAt(0) + '*'.repeat(Math.max(1, value.length - 2)) + value.charAt(value.length - 1);
    
    case 'email':
      return redactText(value, { preserveStructure: true });
    
    case 'phone':
      return redactText(value, { preserveStructure: true });
    
    default:
      // Check if the value contains PII patterns
      return redactText(value, { preserveStructure: false });
  }
}

/**
 * Determines if a field name might contain PII
 */
export function isPIIField(fieldName: string): boolean {
  const piiFields = ['name', 'email', 'phone', 'contact', 'beneficiary', 'address'];
  return piiFields.some(pii => fieldName.toLowerCase().includes(pii));
}
