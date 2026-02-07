import express from 'express';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment
const testEnvPath = path.resolve(__dirname, '..', '.env.test');
dotenv.config({ path: testEnvPath });

// Create test Prisma client with SQLite
const testPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

// Import all route modules
import authRoutes from '../src/routes/auth';
import adminRoutes from '../src/routes/admin';
import donationsRoutes from '../src/routes/donations';
import healthRoutes from '../src/routes/health';
import qrRoutes from '../src/routes/qr';
import stripeRoutes from '../src/routes/stripe-webhook';
import systemAdminRoutes from '../src/routes/systemAdmin';
import ticketsRoutes from '../src/routes/tickets';
import transcriptionRoutes from '../src/routes/transcription';

export async function createTestApp() {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mock authentication middleware for tests
  app.use('/api/*', (req, res, next) => {
    // Mock user for testing
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    next();
  });

  // Mount all routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/donations', donationsRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/qr', qrRoutes);
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/system', systemAdminRoutes);
  app.use('/api/tickets', ticketsRoutes);
  app.use('/api/transcription', transcriptionRoutes);

  // Make test Prisma available to routes
  app.locals.prisma = testPrisma;

  // Initialize database schema
  await testPrisma.$connect();

  return { app, prisma: testPrisma };
}

export async function cleanupTestApp(appData: { prisma: PrismaClient }) {
  await appData.prisma.$disconnect();
}
