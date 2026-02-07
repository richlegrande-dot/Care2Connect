import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!!';
const ALGORITHM = 'aes-256-gcm';

export class EncryptionService {
  /**
   * Encrypt sensitive data
   */
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
    cipher.setAAD(Buffer.from(JSON.stringify({}), 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const { encrypted, iv, tag } = encryptedData;
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), Buffer.from(iv, 'hex'));
    decipher.setAAD(Buffer.from(JSON.stringify({}), 'utf8'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Generate secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Anonymize personal information
   */
  static anonymizeData(data: any): any {
    const sensitiveFields = ['email', 'phone', 'address', 'ssn', 'fullName'];
    const anonymized = { ...data };

    sensitiveFields.forEach(field => {
      if (anonymized[field]) {
        // Replace with hashed version or placeholder
        anonymized[field] = this.hash(anonymized[field]);
      }
    });

    return anonymized;
  }
}
