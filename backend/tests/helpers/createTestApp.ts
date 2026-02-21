/**
 * Test App Factory
 * Creates an isolated Express app for testing without background services
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes (same as server.ts)
import authRoutes from '../src/routes/auth';
import transcribeRoutes from '../src/routes/transcribe';
import transcriptionRoutes from '../src/routes/transcription';
import qrDonationRoutes from '../src/routes/qrDonations';
import exportRoutes from '../src/routes/exports';
import profileRoutes from '../src/routes/profile';
import profilesRoutes from '../src/routes/profiles';
import chatRoutes from '../src/routes/chat';
import jobRoutes from '../src/routes/jobs';
import resourceRoutes from '../src/routes/resources';
import donationRoutes from '../src/routes/donations';
import manualDraftRoutes from '../src/routes/manualDraft';

// Funding Wizard routes
import qrRoutes from '../src/routes/qr';
import exportWordRoutes from '../src/routes/export';
import analysisRoutes from '../src/routes/analysis';
import supportTicketRoutes from '../src/routes/supportTickets';
import ticketsRoutes from '../src/routes/tickets';
import supportRoutes from '../src/routes/support';
import profileSearchRoutes from '../src/routes/profileSearch';

// Stripe webhook routes
import stripeWebhookRoutes from '../src/routes/stripe-webhook';

// Test routes (dev-only)
import stripeWebhookTestRoutes from '../src/routes/stripe-webhook-test';
import dbFailureTestRoutes from '../src/routes/db-failure-test';

// Admin routes
import adminRoutes from '../src/routes/admin';
import systemAdminRoutes from '../src/routes/admin/system';
import opsAdminRoutes from '../src/routes/admin/ops';
import adminKnowledgeRoutes from '../src/routes/admin/knowledge';
import adminAuditRoutes from '../src/routes/admin/audit';
import adminDbRoutes from '../src/routes/admin/db';
import adminIncidentsRoutes from '../src/routes/admin/incidents';

// Other routes
import demoRoutes from '../src/routes/demo';
import metricsRoutes from '../src/routes/metrics';
import errorReportingRoutes from '../src/routes/errorReporting';
import healthRoutes from '../src/routes/health';
import healthDashboardRoutes from '../src/routes/healthDashboard';
import opsRoutes from '../src/routes/ops';

/**
 * Create a test Express application
 * Mounts all routes but disables background services
 */
export function createTestApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration - allow test origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://care2connects.org',
    'https://www.care2connects.org',
    'https://api.care2connects.org',
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_FRONTEND_URL
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  }));

  // Origin marker middleware (for deterministic routing verification)
  app.use((req, res, next) => {
    res.setHeader('X-Care2-Origin', 'backend-test');
    res.setHeader('X-Care2-Port', process.env.PORT || '3001');
    next();
  });

  // Rate limiting (exempt health, metrics, and admin endpoints)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Higher limit for tests
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) =>
      req.path.startsWith('/health') ||
      req.path.startsWith('/metrics') ||
      req.path.startsWith('/admin'), // Exempt admin portal (password-protected)
  });
  app.use(limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging (minimal for tests)
  app.use(morgan('combined'));

  // Health and admin routes (no /api prefix for standard health checks)
  app.use('/health', healthRoutes);
  app.use('/health', healthDashboardRoutes);

  // PRODUCTION HARDENING: Operations and readiness endpoints
  app.use('/ops', opsRoutes);

  app.use('/admin', adminRoutes);
  app.use('/admin', systemAdminRoutes);
  app.use('/admin/ops', opsAdminRoutes);
  app.use('/admin/speech-intelligence', require('../src/routes/admin/speechIntelligence').default);
  app.use('/admin/self-heal', require('../src/routes/admin/selfHeal').default);

  // Knowledge Vault Admin routes
  app.use('/admin/knowledge', adminKnowledgeRoutes);
  app.use('/admin/knowledge/audit', adminAuditRoutes);
  app.use('/admin/db', adminDbRoutes);

  // Pipeline Incidents Admin routes
  app.use('/admin/incidents', adminIncidentsRoutes);

  app.use('/demo', demoRoutes);
  app.use('/metrics', metricsRoutes);
  app.use('/errors', errorReportingRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/transcribe', transcribeRoutes);
  app.use('/api/transcription', transcriptionRoutes);
  app.use('/api/qr', qrDonationRoutes);
  app.use('/api/exports', exportRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/story', require('../src/routes/story').default);
  app.use('/api/chat', chatRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/resources', resourceRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/donations', manualDraftRoutes);

  // Stripe webhook endpoint (must be before JSON body parser)
  app.use('/api/payments', stripeWebhookRoutes);

  // Test routes (dev-only)
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api/test', stripeWebhookTestRoutes);
    app.use('/api/test', dbFailureTestRoutes);
  }

  // Additional routes
  app.use('/api/profiles', profilesRoutes);
  app.use('/api/qr', qrRoutes);
  app.use('/api/export', exportWordRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/support-tickets', supportTicketRoutes);
  app.use('/api/tickets', ticketsRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/profile-search', profileSearchRoutes);

  return app;
}
