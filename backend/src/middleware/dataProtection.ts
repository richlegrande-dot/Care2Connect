import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../utils/encryption';

// Prisma middleware for automatic encryption/decryption
export const encryptionMiddleware = (prisma: PrismaClient) => {
  // Fields that should be encrypted
  const encryptedFields = {
    User: ['email', 'phone'],
    Profile: ['healthNotes'],
    Message: [], // Messages are not encrypted to allow AI processing
    Donation: ['donorEmail'],
  };

  // Middleware for encrypting data before write operations
  prisma.$use(async (params, next) => {
    const { model, action, args } = params;

    // Encrypt data before creating or updating
    if (['create', 'update', 'upsert'].includes(action) && model && encryptedFields[model as keyof typeof encryptedFields]) {
      const fieldsToEncrypt = encryptedFields[model as keyof typeof encryptedFields];
      
      if (args.data) {
        fieldsToEncrypt.forEach(field => {
          if (args.data[field] && typeof args.data[field] === 'string') {
            try {
              const encrypted = EncryptionService.encrypt(args.data[field]);
              args.data[field] = JSON.stringify(encrypted);
            } catch (error) {
              console.error(`Failed to encrypt field ${field}:`, error);
            }
          }
        });
      }
    }

    const result = await next(params);

    // Decrypt data after read operations
    if (['findUnique', 'findFirst', 'findMany'].includes(action) && model && encryptedFields[model as keyof typeof encryptedFields]) {
      const fieldsToDecrypt = encryptedFields[model as keyof typeof encryptedFields];
      
      const decryptRecord = (record: any) => {
        if (!record) return record;
        
        fieldsToDecrypt.forEach(field => {
          if (record[field] && typeof record[field] === 'string') {
            try {
              const encryptedData = JSON.parse(record[field]);
              record[field] = EncryptionService.decrypt(encryptedData);
            } catch (error) {
              console.error(`Failed to decrypt field ${field}:`, error);
              // Keep the original value if decryption fails
            }
          }
        });
        
        return record;
      };

      if (Array.isArray(result)) {
        return result.map(decryptRecord);
      } else {
        return decryptRecord(result);
      }
    }

    return result;
  });

  // Middleware for data anonymization (for analytics/reporting)
  prisma.$use(async (params, next) => {
    const { model, action } = params;

    // If this is a request for anonymized data (marked by special flag)
    if (params.args?.anonymize && ['findMany', 'findUnique'].includes(action)) {
      const result = await next(params);
      
      if (Array.isArray(result)) {
        return result.map(record => EncryptionService.anonymizeData(record));
      } else {
        return EncryptionService.anonymizeData(result);
      }
    }

    return next(params);
  });

  // Middleware for audit logging
  prisma.$use(async (params, next) => {
    const { model, action, args } = params;

    // Log sensitive operations
    const sensitiveActions = ['create', 'update', 'delete'];
    const sensitiveModels = ['User', 'Profile', 'Message'];

    if (sensitiveActions.includes(action) && sensitiveModels.includes(model || '')) {
      console.log(`[AUDIT] ${action.toUpperCase()} on ${model} at ${new Date().toISOString()}`);
      
      // In production, you might want to send this to a dedicated audit log service
      // await auditLogService.log({
      //   action,
      //   model,
      //   timestamp: new Date(),
      //   userId: args.userId || 'system',
      //   metadata: { ...args, data: '[REDACTED]' }
      // });
    }

    return next(params);
  });
};

/**
 * Data retention service - handles cleanup of old data
 */
export class DataRetentionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Clean up old audio files and transcriptions
   */
  async cleanupOldAudioFiles(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      const deletedFiles = await this.prisma.audioFile.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          processed: true, // Only delete processed files
        },
      });

      console.log(`Cleaned up ${deletedFiles.count} old audio files`);
      return deletedFiles.count;
    } catch (error) {
      console.error('Failed to cleanup old audio files:', error);
      return 0;
    }
  }

  /**
   * Anonymize old user data that's no longer needed in identifiable form
   */
  async anonymizeOldUserData(daysOld: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      // Find users who haven't been active and haven't explicitly opted to keep data
      const oldUsers = await this.prisma.user.findMany({
        where: {
          updatedAt: {
            lt: cutoffDate,
          },
          // Only anonymize anonymous users who haven't given explicit consent to keep data
          anonymous: true,
          email: null,
        },
        include: {
          profile: true,
        },
      });

      let anonymizedCount = 0;

      for (const user of oldUsers) {
        if (user.profile) {
          // Anonymize the profile data
          await this.prisma.profile.update({
            where: { id: user.profile.id },
            data: {
              name: null,
              transcript: '[ANONYMIZED]',
              bio: '[ANONYMIZED]',
              healthNotes: null,
              // Keep aggregated, non-identifying data for statistics
              skills: [], // Remove specific skills
              tags: ['anonymized'],
            },
          });
        }

        // Clear user identifying information
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            phone: null,
            location: null,
            zipCode: null,
          },
        });

        anonymizedCount++;
      }

      console.log(`Anonymized ${anonymizedCount} old user records`);
      return anonymizedCount;
    } catch (error) {
      console.error('Failed to anonymize old user data:', error);
      return 0;
    }
  }

  /**
   * Clean up old chat messages (keep only recent ones)
   */
  async cleanupOldMessages(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      const deletedMessages = await this.prisma.message.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`Cleaned up ${deletedMessages.count} old messages`);
      return deletedMessages.count;
    } catch (error) {
      console.error('Failed to cleanup old messages:', error);
      return 0;
    }
  }

  /**
   * Run all cleanup tasks
   */
  async runMaintenance() {
    console.log('Starting data retention maintenance...');
    
    const results = await Promise.allSettled([
      this.cleanupOldAudioFiles(),
      this.anonymizeOldUserData(),
      this.cleanupOldMessages(),
    ]);

    results.forEach((result, index) => {
      const taskName = ['Audio Files', 'User Data', 'Messages'][index];
      if (result.status === 'rejected') {
        console.error(`${taskName} cleanup failed:`, result.reason);
      } else {
        console.log(`${taskName} cleanup completed: ${result.value} items processed`);
      }
    });

    console.log('Data retention maintenance completed');
  }
}
