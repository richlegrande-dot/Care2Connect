/**
 * Prisma Client Singleton
 * Provides a single shared database connection instance
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Get DATABASE_URL from environment or config
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/careconnect';

// Create PostgreSQL pool
const pool = new Pool({ connectionString: DATABASE_URL });

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create single Prisma instance with adapter
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

module.exports = { prisma };
