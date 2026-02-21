/**
 * Test Setup for Manual Fallback Tests
 * 
 * Global setup and teardown for test environment
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up Manual Fallback test environment...');
  
  // Ensure database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
});

// Global test cleanup
afterAll(async () => {
  console.log('🧹 Cleaning up Manual Fallback test environment...');
  
  // Clean up all test data
  try {
    await prisma.systemIncident.deleteMany({
      where: {
        OR: [
          { title: { contains: 'test' } },
          { description: { contains: 'DBG-test' } }
        ]
      }
    });
    
    await prisma.donationDraft.deleteMany({
      where: { ticketId: { startsWith: 'test-' } }
    });
    
    await prisma.donationDraft.deleteMany({
      where: { ticketId: { startsWith: 'integration-test-' } }
    });
    
    await prisma.recordingTicket.deleteMany({
      where: { ticketId: { startsWith: 'test-' } }
    });
    
    await prisma.recordingTicket.deleteMany({
      where: { ticketId: { startsWith: 'integration-test-' } }
    });
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('⚠️  Cleanup warning:', error);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection in test:', reason);
});

// Increase timeout for slow tests
jest.setTimeout(30000);

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep errors visible
};

export { prisma };
