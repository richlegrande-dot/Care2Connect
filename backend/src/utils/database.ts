import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

function isDatabaseUrlValid(url?: string) {
  if (!url) return false;
  // Allow SQLite URLs in test environment
  if (process.env.NODE_ENV === 'test' && url.startsWith('file:')) {
    return true;
  }
  return /^(postgres|postgresql):\/\//i.test(url);
}

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (prismaInstance) return prismaInstance;

  const url = process.env.DATABASE_URL;
  if (!isDatabaseUrlValid(url)) {
    console.error('❌ DATABASE_URL is required for production. Set it in .env file.');
    throw new Error('DATABASE_URL is required but not configured or invalid. System cannot start without database.');
  }

  try {
    prismaInstance = (globalThis.__prisma as PrismaClient) || new PrismaClient();
    if (process.env.NODE_ENV === 'development') globalThis.__prisma = prismaInstance;
    return prismaInstance;
  } catch (e) {
    const error = e as Error;
    console.error('Prisma client initialization failed:', error?.message || String(e));
    throw new Error(`Failed to initialize Prisma Client: ${error?.message || String(e)}`);
  }
}

// Export the actual Prisma instance - required for all operations
export const prisma = getPrisma() as PrismaClient;
