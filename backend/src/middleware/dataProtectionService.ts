/**
 * Data Protection Middleware
 * Ensures sensitive data is never stored or logged inappropriately
 */

import { Request, Response, NextFunction } from "express";

// List of sensitive field patterns that should never be stored
const SENSITIVE_FIELD_PATTERNS = [
  /ssn/i,
  /social.security/i,
  /bank.account/i,
  /routing.number/i,
  /credit.card/i,
  /card.number/i,
  /cvv/i,
  /pin/i,
  /password/i,
  /gofundme.login/i,
  /gofundme.password/i,
  /account.credentials/i,
];

// List of PII fields that need special handling
const PII_FIELD_PATTERNS = [
  /full.name/i,
  /address/i,
  /phone/i,
  /email/i,
  /date.of.birth/i,
  /dob/i,
];

export class DataProtectionService {
  /**
   * Middleware to scan and sanitize request data
   */
  static sanitizeRequest() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Scan request body for sensitive data
        if (req.body) {
          const sanitizedBody = DataProtectionService.sanitizeObject(req.body);
          req.body = sanitizedBody;
        }

        // Scan query parameters
        if (req.query) {
          const sanitizedQuery = DataProtectionService.sanitizeObject(
            req.query,
          );
          req.query = sanitizedQuery;
        }

        next();
      } catch (error) {
        console.error("Data sanitization error:", error);
        res.status(400).json({
          success: false,
          error: "Invalid data format detected",
        });
      }
    };
  }

  /**
   * Recursively sanitize an object, removing sensitive fields
   */
  static sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => DataProtectionService.sanitizeObject(item));
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Check if key matches sensitive patterns
      const isSensitive = SENSITIVE_FIELD_PATTERNS.some((pattern) =>
        pattern.test(key),
      );

      if (isSensitive) {
        console.warn(`Blocking sensitive field: ${key}`);
        continue; // Skip sensitive fields entirely
      }

      // Handle PII fields with consent check
      const isPII = PII_FIELD_PATTERNS.some((pattern) => pattern.test(key));

      if (isPII) {
        // Only include PII if consent is explicitly given
        const consentGiven = obj.consentToPublish || obj.consentGiven;
        if (
          !consentGiven &&
          key !== "consentToPublish" &&
          key !== "consentGiven"
        ) {
          console.warn(`PII field ${key} blocked - no consent`);
          continue;
        }
      }

      // Recursively sanitize nested objects
      if (typeof value === "object" && value !== null) {
        sanitized[key] = DataProtectionService.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Validate consent requirements
   */
  static validateConsent() {
    return (req: Request, res: Response, next: NextFunction) => {
      const { consentToPublish, consentGiven } = req.body;

      // Check if request contains data that requires consent
      const containsPII = DataProtectionService.containsPII(req.body);

      if (containsPII && !consentToPublish && !consentGiven) {
        return res.status(400).json({
          success: false,
          error: "Consent is required to process personal information",
          consentRequired: true,
        });
      }

      next();
    };
  }

  /**
   * Check if object contains PII fields
   */
  static containsPII(obj: any): boolean {
    if (!obj || typeof obj !== "object") {
      return false;
    }

    if (Array.isArray(obj)) {
      return obj.some((item) => DataProtectionService.containsPII(item));
    }

    for (const [key, value] of Object.entries(obj)) {
      const isPII = PII_FIELD_PATTERNS.some((pattern) => pattern.test(key));
      if (isPII) {
        return true;
      }

      // If the value is a string, also scan its content for PII-like patterns
      if (typeof value === "string") {
        // SSN pattern
        const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/;
        const bankAcctRegex = /\b\d{8,}\b/;
        const ccRegex = /\b\d{4}[ \-]?\d{4}[ \-]?\d{4}[ \-]?\d{4}\b/;
        // Name patterns in transcript content
        const nameRegex = /\b(my name is|i am|i'm|call me)\s+[A-Z][a-z]+/i;
        // Address patterns
        const addressRegex =
          /\b\d+\s+[A-Za-z\s]+(street|st|avenue|ave|road|rd|drive|dr|lane|ln)\b/i;
        // Phone patterns
        const phoneRegex = /\b\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;

        if (
          ssnRegex.test(value) ||
          bankAcctRegex.test(value) ||
          ccRegex.test(value) ||
          nameRegex.test(value) ||
          addressRegex.test(value) ||
          phoneRegex.test(value)
        ) {
          return true;
        }
      }

      if (typeof value === "object" && value !== null) {
        if (DataProtectionService.containsPII(value)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Sanitize data before storage
   */
  static sanitizeForStorage(data: any): any {
    const sanitized = DataProtectionService.sanitizeObject(data);

    // Additional storage-specific sanitization
    if (sanitized.transcript) {
      // Remove any potential sensitive information from transcript
      sanitized.transcript = DataProtectionService.sanitizeTranscript(
        sanitized.transcript,
      );
    }

    return sanitized;
  }

  /**
   * Sanitize transcript text to remove potential sensitive info
   */
  static sanitizeTranscript(transcript: string): string {
    if (!transcript || typeof transcript !== "string") {
      return transcript;
    }

    let sanitized = transcript;

    // Remove potential SSN patterns (XXX-XX-XXXX)
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED-SSN]");

    // Remove potential credit card numbers (groups of 4 digits)
    sanitized = sanitized.replace(
      /\b\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\b/g,
      "[REDACTED-CARD]",
    );

    // Remove potential bank account numbers (8+ digits)
    sanitized = sanitized.replace(/\b\d{8,}\b/g, "[REDACTED-ACCOUNT]");

    return sanitized;
  }

  /**
   * Log data access for audit purposes
   */
  static auditDataAccess() {
    return (req: Request, res: Response, next: NextFunction) => {
      const timestamp = new Date().toISOString();
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("User-Agent");

      // Log access without sensitive data
      console.log(
        `DATA_ACCESS: ${timestamp} - IP: ${ip} - Path: ${req.path} - Method: ${req.method}`,
      );

      next();
    };
  }
}

export default DataProtectionService;
