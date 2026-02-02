import { PrismaClient } from '@prisma/client';

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prismaMock)
}));

import { prismaMock } from '../setup';

// Re-export the mock for use in tests
export { prismaMock };