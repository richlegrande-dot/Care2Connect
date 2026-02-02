const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs-extra');
const { 
  generateReceiptPDF, 
  generateReceiptHTML, 
  generateStatementPDF, 
  generateStatementHTML 
} = require('./receiptGenerator');

// Health monitoring and auto-healing
const { healthHandler, pingHandler } = require('./health');
const { startWatchdog, stopWatchdog, getWatchdogStatus, attemptWebhookReconnect } = require('./watchdog');
const { runDiagnostics, getDiagnosticHistory } = require('./diagnostics');
const { getTroubleshootingState } = require('./troubleshoot');

// Admin authentication
const { 
  createAdminSession, 
  destroySession, 
  requireAdminAuth,
  maskEmail,
  maskPhone 
} = require('./adminAuth');

// Stripe configuration
let stripe = null;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (STRIPE_SECRET_KEY) {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('✅ Stripe configured');
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe payments disabled.');
}

// Mock database for V1 (in production, use real database)
const mockDonations = [];

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('uploads')); // Serve static files

// Ensure upload directories exist
fs.ensureDirSync(path.join(__dirname, 'uploads', 'audio'));
fs.ensureDirSync(path.join(__dirname, 'uploads', 'qr'));

// Configure multer for audio uploads
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads', 'audio'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}.webm`);
  }
});

const upload = multer({ 
  storage: audioStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Audio Upload Endpoint (Legacy - kept for compatibility)
app.post('/api/upload/audio', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioUrl = `http://localhost:${PORT}/audio/${req.file.filename}`;
    
    res.json({
      success: true,
      filename: req.file.filename,
      url: audioUrl,
      size: req.file.size,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

// ========== STORY RECORDING & PROFILE ENDPOINTS ==========

const { prisma } = require('./db');
const { logRecordingEvent } = require('./eventLogger');

// Test database connection on startup
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection failed:', err));

// POST /api/recordings - Upload and save audio recording
app.post('/api/recordings', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioUrl = `http://localhost:${PORT}/audio/${req.file.filename}`;
    const duration = req.body.duration ? parseInt(req.body.duration) : null;
    
    // Create temporary profile for unattached recording
    const tempProfile = await prisma.userProfile.create({
      data: {
        name: 'Anonymous',
        email: null,
        phone: null,
      },
    });
    
    // Create recording record
    const recording = await prisma.recording.create({
      data: {
        userId: tempProfile.id,
        audioUrl,
        duration,
        status: 'NEW',
      },
    });
    
    // Log event
    await logRecordingEvent(recording.id, tempProfile.id, 'created', {
      audioFile: req.file.filename,
      duration,
    });
    
    console.log(`[RECORDING_SAVED] userId: ${tempProfile.id} recordingId: ${recording.id} audioUrl: ${audioUrl}`);
    
    res.json({
      success: true,
      recordingId: recording.id,
      audioUrl: recording.audioUrl,
      duration: recording.duration,
      status: recording.status,
      createdAt: recording.createdAt
    });
  } catch (error) {
    console.error('Recording creation error:', error);
    res.status(500).json({ error: 'Failed to create recording' });
  }
});

// POST /api/recordings/attach-profile - Link recording to user profile
app.post('/api/recordings/attach-profile', async (req, res) => {
  try {
    const { recordingId, name, email, phone } = req.body;
    
    // Validate input
    if (!recordingId) {
      return res.status(400).json({ error: 'recordingId is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    
    if (!email && !phone) {
      return res.status(400).json({ 
        error: 'At least one contact method (email or phone) is required' 
      });
    }
    
    // Check if recording exists
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
    });
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    // Normalize inputs
    const normalizedName = name.trim().toLowerCase();
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    const normalizedPhone = phone ? phone.trim().replace(/\D/g, '') : null;
    
    // Find existing profile
    const existingProfile = await prisma.userProfile.findFirst({
      where: {
        OR: [
          {
            AND: [
              { name: { equals: name, mode: 'insensitive' } },
              { email: normalizedEmail ? { equals: normalizedEmail, mode: 'insensitive' } : undefined },
            ].filter(Boolean),
          },
          {
            AND: [
              { name: { equals: name, mode: 'insensitive' } },
              { phone: normalizedPhone || undefined },
            ].filter(Boolean),
          },
        ].filter(cond => cond.AND && cond.AND.length > 1),
      },
    });
    
    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.userProfile.update({
        where: { id: existingProfile.id },
        data: { updatedAt: new Date() },
      });
    } else {
      // Create new profile
      profile = await prisma.userProfile.create({
        data: { name, email, phone },
      });
    }
    
    // Link recording to profile
    const updatedRecording = await prisma.recording.update({
      where: { id: recordingId },
      data: { userId: profile.id },
    });
    
    // Log event
    await logRecordingEvent(recordingId, profile.id, 'profile_attached', {
      profileName: name,
      hasEmail: !!email,
      hasPhone: !!phone,
    });
    
    console.log(`[PROFILE_ATTACHED] userId: ${profile.id} recordingId: ${recordingId}`);
    
    res.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        createdAt: profile.createdAt
      },
      recording: {
        id: updatedRecording.id,
        audioUrl: updatedRecording.audioUrl,
        duration: updatedRecording.duration,
        status: updatedRecording.status,
        createdAt: updatedRecording.createdAt
      }
    });
  } catch (error) {
    console.error('Profile attachment error:', error);
    res.status(500).json({ error: error.message || 'Failed to attach profile' });
  }
});

// POST /api/system/recording-error-log - Log recording errors (non-PII, best-effort)
app.post('/api/system/recording-error-log', async (req, res) => {
  try {
    const { 
      errorName, 
      permissionState, 
      hasAudioInput, 
      userAgent, 
      timestamp,
      connectivity = 'online', // Default to online if not provided
      kioskId = 'unknown' // Default to unknown if not provided
    } = req.body;
    
    // Log to console for operational visibility
    console.log('[RECORDING_ERROR]', {
      errorName,
      permissionState,
      hasAudioInput,
      userAgentSnippet: userAgent,
      connectivity,
      kioskId,
      timestamp: timestamp || new Date().toISOString()
    });
    
    // Store in database for admin dashboard
    await prisma.recordingIssueLog.create({
      data: {
        errorName,
        permissionState: permissionState || null,
        hasAudioInput: hasAudioInput !== undefined ? hasAudioInput : null,
        userAgentSnippet: userAgent || null,
        connectivity,
        kioskId,
        metadata: {
          timestamp: timestamp || new Date().toISOString()
        }
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    // Silently fail - don't block user experience
    console.error('Error logging recording error:', error);
    res.status(200).json({ success: false });
  }
});

// GET /api/profiles/search - Search for profiles by name + contact
app.get('/api/profiles/search', async (req, res) => {
  try {
    const { name, email, phone } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'name parameter is required' });
    }
    
    if (!email && !phone) {
      return res.status(400).json({ 
        error: 'Either email or phone parameter is required' 
      });
    }
    
    // Build search conditions
    const whereConditions = {
      name: { contains: name, mode: 'insensitive' },
    };
    
    if (email && phone) {
      whereConditions.OR = [
        { email: { equals: email, mode: 'insensitive' } },
        { phone: { contains: phone.replace(/\D/g, '') } },
      ];
    } else if (email) {
      whereConditions.email = { equals: email, mode: 'insensitive' };
    } else if (phone) {
      whereConditions.phone = { contains: phone.replace(/\D/g, '') };
    }
    
    const profiles = await prisma.userProfile.findMany({
      where: whereConditions,
      include: {
        recordings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    res.json({
      success: true,
      count: profiles.length,
      profiles: profiles.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        recordings: p.recordings,
      })),
    });
  } catch (error) {
    console.error('Profile search error:', error);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

// GET /api/profiles/:profileId - Get profile with recordings
app.get('/api/profiles/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    
    const profile = await prisma.userProfile.findUnique({
      where: { id: profileId },
      include: {
        recordings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/recordings/:recordingId - Get recording details
app.get('/api/recordings/:recordingId', async (req, res) => {
  try {
    const { recordingId } = req.params;
    
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: {
        user: true,
        eventLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    res.json({
      success: true,
      recording
    });
  } catch (error) {
    console.error('Recording fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recording' });
  }
});

// POST /api/recordings/:id/donation-settings - Save donation settings for a recording
app.post('/api/recordings/:id/donation-settings', async (req, res) => {
  try {
    const { id } = req.params;
    const { donationTitle, donationGoal, donationExcerpt } = req.body;
    
    // Validate input
    if (!donationTitle || !donationExcerpt) {
      return res.status(400).json({ 
        error: 'donationTitle and donationExcerpt are required' 
      });
    }
    
    // Sanitize excerpt (basic protection against HTML injection)
    const sanitizedExcerpt = donationExcerpt
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
    
    // Validate excerpt length (rough guideline: 70-110 words)
    const wordCount = sanitizedExcerpt.split(/\s+/).filter(w => w).length;
    if (wordCount < 10 || wordCount > 200) {
      return res.status(400).json({ 
        error: 'Excerpt must be between 10 and 200 words' 
      });
    }
    
    // Check if recording exists
    const recording = await prisma.recording.findUnique({
      where: { id },
    });
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    // Update recording with donation settings
    const updatedRecording = await prisma.recording.update({
      where: { id },
      data: {
        donationTitle: donationTitle.trim(),
        donationGoal: donationGoal || null,
        donationExcerpt: sanitizedExcerpt,
      },
    });
    
    // Log event
    await logRecordingEvent(id, recording.userId, 'donation_settings_saved', {
      hasTitle: !!donationTitle,
      hasGoal: !!donationGoal,
      excerptWordCount: wordCount,
    });
    
    console.log(`[DONATION_SETTINGS_SAVED] recordingId: ${id} wordCount: ${wordCount}`);
    
    res.json({
      success: true,
      recording: {
        id: updatedRecording.id,
        donationTitle: updatedRecording.donationTitle,
        donationGoal: updatedRecording.donationGoal,
        donationExcerpt: updatedRecording.donationExcerpt,
      }
    });
  } catch (error) {
    console.error('Donation settings save error:', error);
    res.status(500).json({ error: 'Failed to save donation settings' });
  }
});

// GET /api/donations/recording/:id - Get donation info for public landing page
app.get('/api/donations/recording/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            // DO NOT include email or phone (PII protection)
          },
        },
      },
    });
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    // Check if donation settings exist
    if (!recording.donationExcerpt) {
      return res.status(404).json({ 
        error: 'Donation page not configured for this recording' 
      });
    }
    
    // Extract first name only (privacy)
    const firstName = recording.user.name.split(' ')[0];
    
    // Log page view (analytics-ready, no PII)
    console.log(`[DONATION_PAGE_VIEW] recordingId: ${id} timestamp: ${new Date().toISOString()}`);
    
    res.json({
      success: true,
      donation: {
        recordingId: recording.id,
        title: recording.donationTitle,
        excerpt: recording.donationExcerpt,
        goal: recording.donationGoal,
        firstName, // Only first name, not full name
        createdAt: recording.createdAt,
      }
    });
  } catch (error) {
    console.error('Donation info fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch donation info' });
  }
});

// GET /api/admin/story-stats - Get statistics for admin
app.get('/api/admin/story-stats', async (req, res) => {
  try {
    const totalProfiles = await prisma.userProfile.count();
    const totalRecordings = await prisma.recording.count();
    const totalEvents = await prisma.recordingEventLog.count();
    
    const recordingsByStatus = await prisma.recording.groupBy({
      by: ['status'],
      _count: true,
    });
    
    const recentRecordings = await prisma.recording.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });
    
    const stats = {
      totalProfiles,
      totalRecordings,
      totalEvents,
      recordingsByStatus: recordingsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      recentRecordings: recentRecordings.map(r => ({
        id: r.id,
        audioUrl: r.audioUrl,
        duration: r.duration,
        status: r.status,
        createdAt: r.createdAt,
        userName: r.user.name,
      })),
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/admin/recording-health-summary - Get recording health summary
app.get('/api/admin/recording-health-summary', requireAdminAuth, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Total issues in last 24 hours
    const totalIssuesLast24h = await prisma.recordingIssueLog.count({
      where: {
        createdAt: { gte: twentyFourHoursAgo }
      }
    });
    
    // Offline saves in last 24 hours (connectivity = offline)
    const offlineSavesLast24h = await prisma.recordingIssueLog.count({
      where: {
        connectivity: 'offline',
        createdAt: { gte: twentyFourHoursAgo }
      }
    });
    
    // Issues by error type (last 24h)
    const issuesByErrorType = await prisma.recordingIssueLog.groupBy({
      by: ['errorName'],
      _count: true,
      where: {
        createdAt: { gte: twentyFourHoursAgo }
      },
      orderBy: {
        _count: {
          errorName: 'desc'
        }
      }
    });
    
    // Most common error
    const mostCommonErrorName = issuesByErrorType.length > 0 
      ? issuesByErrorType[0].errorName 
      : null;
    
    // Last issue timestamp
    const lastIssue = await prisma.recordingIssueLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });
    
    res.json({
      success: true,
      summary: {
        totalIssuesLast24h,
        offlineSavesLast24h,
        mostCommonErrorName,
        issuesByErrorType: issuesByErrorType.reduce((acc, item) => {
          acc[item.errorName] = item._count;
          return acc;
        }, {}),
        lastIssueAt: lastIssue ? lastIssue.createdAt : null
      }
    });
  } catch (error) {
    console.error('Recording health summary error:', error);
    res.status(500).json({ error: 'Failed to fetch recording health summary' });
  }
});

// GET /api/admin/recording-issues - Get paginated recording issues
app.get('/api/admin/recording-issues', requireAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const skip = (page - 1) * pageSize;
    
    // Filters
    const { errorName, connectivity, since } = req.query;
    
    const where = {};
    
    if (errorName) {
      where.errorName = errorName;
    }
    
    if (connectivity) {
      where.connectivity = connectivity;
    }
    
    if (since) {
      where.createdAt = { gte: new Date(since) };
    }
    
    const [issues, total] = await Promise.all([
      prisma.recordingIssueLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.recordingIssueLog.count({ where })
    ]);
    
    res.json({
      success: true,
      data: issues,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Recording issues fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recording issues' });
  }
});

// ========== ADMIN AUTHENTICATION & STORY BROWSER ==========

// POST /api/admin/login - Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Create session
    const session = createAdminSession(password);
    
    if (!session) {
      console.log('[ADMIN_LOGIN_FAIL] Invalid password attempt');
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }
    
    // Set secure HTTPOnly cookie
    res.cookie('admin_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });
    
    console.log(`[ADMIN_LOGIN_SUCCESS] sessionId: ${session.id}`);
    
    res.json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/admin/me - Check admin session
app.get('/api/admin/me', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    authenticated: true
  });
});

// POST /api/admin/logout - Admin logout
app.post('/api/admin/logout', (req, res) => {
  const sessionId = req.cookies?.admin_session;
  
  if (sessionId) {
    destroySession(sessionId);
  }
  
  res.clearCookie('admin_session');
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/admin/story-list - List all recordings with filters
app.get('/api/admin/story-list', requireAdminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      dateFrom, 
      dateTo 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
      ];
    }
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Get recordings with user info
    const [recordings, total] = await Promise.all([
      prisma.recording.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      }),
      prisma.recording.count({ where }),
    ]);
    
    // Log admin view
    console.log(`[ADMIN_VIEW_LIST] sessionId: ${req.adminSessionId} page: ${page} count: ${recordings.length}`);
    
    // Mask sensitive data
    const maskedRecordings = recordings.map(r => ({
      id: r.id,
      recordingId: r.id,
      userId: r.userId,
      userName: r.user.name,
      userEmail: maskEmail(r.user.email),
      userPhone: maskPhone(r.user.phone),
      audioUrl: r.audioUrl,
      duration: r.duration,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    
    res.json({
      success: true,
      data: maskedRecordings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Admin story list error:', error);
    res.status(500).json({ error: 'Failed to fetch story list' });
  }
});

// GET /api/admin/story/:id - Get recording detail with event logs
app.get('/api/admin/story/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        user: true,
        eventLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    // Log admin view
    console.log(`[ADMIN_VIEW_RECORDING] sessionId: ${req.adminSessionId} recordingId: ${id} userId: ${recording.userId}`);
    
    // Mask sensitive data
    const maskedRecording = {
      id: recording.id,
      recordingId: recording.id,
      userId: recording.userId,
      userName: recording.user.name,
      userEmail: maskEmail(recording.user.email),
      userPhone: maskPhone(recording.user.phone),
      audioUrl: recording.audioUrl,
      duration: recording.duration,
      status: recording.status,
      transcript: recording.transcript,
      createdAt: recording.createdAt,
      updatedAt: recording.updatedAt,
      eventLogs: recording.eventLogs.map(log => ({
        id: log.id,
        event: log.event,
        metadata: log.metadata,
        createdAt: log.createdAt,
      })),
    };
    
    res.json({
      success: true,
      data: maskedRecording,
    });
  } catch (error) {
    console.error('Admin story detail error:', error);
    res.status(500).json({ error: 'Failed to fetch story detail' });
  }
});

// QR Code Generation Endpoint
app.post('/api/donations/qr', async (req, res) => {
  try {
    const { donation_url } = req.body;
    
    if (!donation_url) {
      return res.status(400).json({ error: 'donation_url is required' });
    }

    const timestamp = Date.now();
    const filename = `qr-${timestamp}.png`;
    const filepath = path.join(__dirname, 'uploads', 'qr', filename);
    
    // Generate QR code
    await QRCode.toFile(filepath, donation_url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const qrUrl = `http://localhost:${PORT}/qr/${filename}`;
    
    res.json({
      success: true,
      qr_code_url: qrUrl,
      filename: filename,
      donation_url: donation_url,
      timestamp: timestamp
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// GoFundMe Draft Package Generator
app.post('/api/gofundme/draft', (req, res) => {
  try {
    const { name, summary, category, goal } = req.body;
    
    if (!name || !summary || !category || !goal) {
      return res.status(400).json({ 
        error: 'All fields required: name, summary, category, goal' 
      });
    }

    // Generate draft package
    const draft = {
      title: `Help ${name} Recover Their Stability`,
      story: summary, // Use exactly as provided - no AI rewriting
      goal: parseInt(goal),
      category: category,
      instructions: [
        "Go to GoFundMe.com",
        `Select your category: ${category}`,
        "Paste provided title and story",
        "Upload provided optional photo",
        "Complete identity & payout verification"
      ],
      created_at: new Date().toISOString(),
      disclaimer: "CareConnect does not create GoFundMe accounts or submit fundraisers. A human must complete the official GoFundMe setup and identity process."
    };
    
    res.json(draft);
  } catch (error) {
    console.error('Draft generation error:', error);
    res.status(500).json({ error: 'Failed to generate GoFundMe draft' });
  }
});

// ========== STRIPE PAYMENT ENDPOINTS ==========

// Create Stripe Checkout Session
app.post('/api/payments/create-checkout-session', (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Stripe is not configured. Please contact the administrator.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    const { clientSlug, amountCents } = req.body;

    // Validate input
    if (!clientSlug || typeof clientSlug !== 'string') {
      return res.status(400).json({
        error: 'clientSlug is required and must be a string'
      });
    }

    if (!amountCents || typeof amountCents !== 'number' || amountCents <= 0 || amountCents > 500000) {
      return res.status(400).json({
        error: 'amountCents must be between 1 and 500000 (max $5,000)'
      });
    }

    // Create checkout session (async function)
    (async () => {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                unit_amount: amountCents,
                product_data: {
                  name: `Donation for ${clientSlug}`,
                  description: `Support ${clientSlug} with their needs`,
                },
              },
              quantity: 1,
            },
          ],
          success_url: `http://localhost:3000/donate/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `http://localhost:3000/donate/cancel?client=${clientSlug}`,
          metadata: {
            clientSlug,
          },
        });

        // Store in mock database
        mockDonations.push({
          id: Date.now().toString(),
          clientSlug,
          amountCents,
          stripeSessionId: session.id,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        res.json({
          checkoutUrl: session.url,
          sessionId: session.id
        });
      } catch (error) {
        console.error('Stripe session creation error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
      }
    })();
    
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create Donation Checkout Session (for donation tools feature)
app.post('/api/payments/create-donation-checkout', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Stripe is not configured. Please contact the administrator.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    const { recordingId, amountCents, metadata } = req.body;

    // Validate input
    if (!recordingId || typeof recordingId !== 'string') {
      return res.status(400).json({
        error: 'recordingId is required and must be a string'
      });
    }

    if (!amountCents || typeof amountCents !== 'number' || amountCents <= 0) {
      return res.status(400).json({
        error: 'amountCents must be a positive number'
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: metadata?.title || 'CareConnect Story Donation',
              description: `Supporting story #${recordingId.substring(0, 8)}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/donate/success?session_id={CHECKOUT_SESSION_ID}&recording=${recordingId}`,
      cancel_url: `http://localhost:3000/story/${recordingId}/donation-tools`,
      metadata: {
        recordingId,
        ...(metadata || {})
      },
    });

    console.log(`[DONATION_CHECKOUT] Created for recording: ${recordingId}, amount: $${amountCents / 100}`);

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      recordingId
    });
  } catch (error) {
    console.error('Create donation checkout error:', error);
    res.status(500).json({ error: 'Failed to create donation checkout session' });
  }
});

// Stripe Webhook Handler
app.post('/api/payments/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    console.warn('⚠️  Stripe webhook received but Stripe is not configured. Ignoring.');
    return res.status(200).json({ received: true, ignored: true });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️  Stripe webhook secret not configured. Incoming webhook events will be ignored.');
    return res.status(200).json({ received: true, ignored: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Checkout session completed:', session.id);
      
      // Update mock donation record
      const donation = mockDonations.find(d => d.stripeSessionId === session.id);
      if (donation) {
        donation.status = 'succeeded';
        donation.stripePaymentId = session.payment_intent;
        donation.donorEmail = session.customer_details?.email;
        donation.donorName = session.customer_details?.name;
        console.log(`💰 Donation completed: $${donation.amountCents / 100} for ${donation.clientSlug}`);
        
        // Generate receipt automatically
        try {
          const { generateReceiptPDF } = require('./receiptGenerator');
          
          // Prepare donation data for receipt
          const donationData = {
            donationId: donation.id,
            amount: donation.amountCents,
            date: donation.createdAt,
            donorName: donation.donorName,
            donorEmail: donation.donorEmail,
            clientProfile: donation.clientSlug
          };
          
          const receiptPdf = await generateReceiptPDF(donationData);
          const pdfPath = path.join(__dirname, 'receipts', `${donation.id}.pdf`);
          
          donation.receiptUrl = `/receipts/${donation.id}.pdf`;
          donation.receiptFile = `${donation.id}.pdf`;
          console.log(`📄 Receipt generated: ${donation.receiptFile}`);
          
          // V1.7: Send receipt via email
          if (donation.donorEmail) {
            try {
              const { emailClient } = require('./emailClient');
              const verificationLink = `${process.env.APP_DOMAIN || 'http://localhost:3000'}/verify/donation/${donation.id}`;
              
              const emailResult = await emailClient.sendDonationReceiptEmail(
                donation.donorEmail,
                donationData,
                pdfPath,
                verificationLink
              );
              
              donation.emailSent = emailResult.success;
              donation.emailStatus = emailResult.status;
              donation.emailLogId = emailResult.logId;
              
              if (emailResult.success && emailResult.status === 'sent') {
                console.log(`📧 Receipt email sent to ${donation.donorEmail}`);
              } else if (emailResult.status === 'skipped_no_keys') {
                console.log(`📧 Receipt email logged (no-keys mode) for ${donation.donorEmail}`);
              } else {
                console.warn(`⚠️  Receipt email failed: ${emailResult.message}`);
              }
            } catch (emailError) {
              console.error('❌ Email sending error:', emailError);
              donation.emailSent = false;
              donation.emailStatus = 'failed';
            }
          }
        } catch (receiptError) {
          console.error('❌ Receipt generation error:', receiptError);
        }
      }
      break;

    default:
      console.log(`🔍 Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Get donations for a client
app.get('/api/donations/:clientSlug', (req, res) => {
  const { clientSlug } = req.params;
  const clientDonations = mockDonations.filter(d => 
    d.clientSlug === clientSlug && d.status === 'succeeded'
  );
  
  const totalCents = clientDonations.reduce((sum, d) => sum + d.amountCents, 0);
  
  res.json({
    donations: clientDonations,
    totalAmount: totalCents / 100,
    count: clientDonations.length
  });
});

// Donation ledger for admin
app.get('/api/admin/donations/ledger', (req, res) => {
  try {
    const { startDate, endDate, clientSlug } = req.query;
    
    let filteredDonations = mockDonations.filter(d => d.status === 'succeeded');
    
    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filteredDonations = filteredDonations.filter(d => 
        new Date(d.createdAt) >= start
      );
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      filteredDonations = filteredDonations.filter(d => 
        new Date(d.createdAt) <= end
      );
    }
    
    // Filter by client
    if (clientSlug) {
      filteredDonations = filteredDonations.filter(d => 
        d.clientSlug === clientSlug
      );
    }
    
    // Calculate totals
    const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amountCents, 0) / 100;
    const donorCount = new Set(filteredDonations.map(d => d.donorEmail).filter(Boolean)).size;
    
    // Group by client for subtotals
    const clientTotals = {};
    filteredDonations.forEach(d => {
      if (!clientTotals[d.clientSlug]) {
        clientTotals[d.clientSlug] = {
          clientSlug: d.clientSlug,
          donationCount: 0,
          totalAmount: 0
        };
      }
      clientTotals[d.clientSlug].donationCount++;
      clientTotals[d.clientSlug].totalAmount += d.amountCents / 100;
    });
    
    // Format ledger entries
    const ledgerEntries = filteredDonations.map(d => ({
      donationId: d.id,
      donorName: d.donorName || 'Anonymous',
      donorEmail: d.donorEmail || 'Not provided',
      clientProfile: d.clientSlug,
      amountCents: d.amountCents,
      amount: d.amountCents / 100,
      date: d.createdAt,
      paymentIntentId: d.stripePaymentId,
      sessionId: d.stripeSessionId,
      receiptUrl: d.receiptUrl,
      verificationLink: `${process.env.APP_DOMAIN || 'http://localhost:3000'}/verify/donation/${d.id}`
    }));
    
    res.json({
      ledgerEntries,
      summary: {
        totalDonations: filteredDonations.length,
        totalAmount,
        uniqueDonors: donorCount,
        dateRange: {
          start: startDate || filteredDonations[0]?.createdAt,
          end: endDate || filteredDonations[filteredDonations.length - 1]?.createdAt
        }
      },
      clientTotals: Object.values(clientTotals)
    });
    
  } catch (error) {
    console.error('Ledger error:', error);
    res.status(500).json({ error: 'Failed to generate donation ledger' });
  }
});

// Donation Statement endpoint
app.get('/api/admin/donations/statement', async (req, res) => {
  try {
    const { donorEmail, startDate, endDate, format } = req.query
    
    if (!donorEmail) {
      return res.status(400).json({ error: 'Donor email is required' })
    }

    // Find all donations for this donor
    let donorDonations = mockDonations.filter(d => 
      d.status === 'succeeded' && 
      d.donorEmail === donorEmail
    );

    // Apply date filters
    if (startDate) {
      const start = new Date(startDate);
      donorDonations = donorDonations.filter(d => 
        new Date(d.createdAt) >= start
      );
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      donorDonations = donorDonations.filter(d => 
        new Date(d.createdAt) <= end
      );
    }

    if (donorDonations.length === 0) {
      return res.status(404).json({ error: 'No donations found for this donor in the specified period' })
    }

    // Sort by date
    donorDonations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Format donation data
    const donationsList = donorDonations.map(donation => ({
      date: donation.createdAt,
      amount: donation.amountCents / 100,
      clientProfile: donation.clientSlug || 'General Support',
      donationId: donation.id
    }))

    const totalAmount = donationsList.reduce((sum, donation) => sum + donation.amount, 0)
    
    // Determine date range
    const sortedDates = donationsList.map(d => d.date).sort()
    const dateRange = {
      start: startDate || sortedDates[0],
      end: endDate || sortedDates[sortedDates.length - 1]
    }

    const statement = {
      donorName: donorDonations[0].donorName || 'Valued Donor',
      donorEmail: donorEmail,
      donations: donationsList,
      totalAmount: totalAmount,
      dateRange: dateRange
    }

    // Return PDF if requested
    if (format === 'pdf') {
      try {
        const html = generateStatementHTML(statement)
        const pdf = await generateStatementPDF(html, donorEmail)
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="annual_donation_statement_${donorEmail.replace('@', '_at_')}_${new Date().getFullYear()}.pdf"`)
        res.send(pdf)
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError)
        // Fall back to JSON if PDF generation fails
        res.json(statement)
      }
    } else {
      // Return JSON
      res.json(statement)
    }
  } catch (error) {
    console.error('Error generating donation statement:', error)
    res.status(500).json({ error: 'Failed to generate statement' })
  }
});

// ========== STRIPE ADMIN ENDPOINTS ==========

// Get Stripe configuration status
app.get('/api/admin/stripe/status', (req, res) => {
  const secretKeyValid = !!STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.length > 20
  const publishableKeyValid = !!process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_PUBLISHABLE_KEY.length > 20
  const webhookSecretValid = !!STRIPE_WEBHOOK_SECRET && STRIPE_WEBHOOK_SECRET.length > 20
  
  let status = 'not-configured'
  if (secretKeyValid && publishableKeyValid && webhookSecretValid) {
    status = 'fully-configured'
  } else if (secretKeyValid || publishableKeyValid) {
    status = 'partial'
  }
  
  res.json({
    configured: !!stripe,
    secretKeyValid,
    publishableKeyValid,
    webhookSecretValid,
    webhookSetupNeeded: secretKeyValid && publishableKeyValid && !webhookSecretValid,
    status
  })
})

// Configure Stripe keys
app.post('/api/admin/stripe/configure', (req, res) => {
  try {
    const { publishableKey, secretKey, webhookSecret } = req.body
    
    // Validate input
    if (!publishableKey || !secretKey) {
      return res.status(400).json({ error: 'Both publishable key and secret key are required' })
    }
    
    // Validate key formats
    if (!publishableKey.startsWith('pk_')) {
      return res.status(400).json({ error: 'Invalid publishable key format. Should start with pk_test_ or pk_live_' })
    }
    
    if (!secretKey.startsWith('sk_')) {
      return res.status(400).json({ error: 'Invalid secret key format. Should start with sk_test_ or sk_live_' })
    }
    
    if (webhookSecret && !webhookSecret.startsWith('whsec_')) {
      return res.status(400).json({ error: 'Invalid webhook secret format. Should start with whsec_' })
    }
    
    // For development, provide instructions for manual setup
    const envContent = [
      '# Stripe Configuration (Added via Admin Panel)',
      `STRIPE_SECRET_KEY=${secretKey}`,
      `STRIPE_PUBLISHABLE_KEY=${publishableKey}`,
      webhookSecret ? `STRIPE_WEBHOOK_SECRET=${webhookSecret}` : '# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here',
      '',
      '# App Configuration',
      'APP_DOMAIN=http://localhost:3000',
      'NODE_ENV=development',
      'PORT=3001'
    ].join('\n')
    
    // In production, this would use secure environment variable management
    // For development, we'll provide the configuration for manual setup
    res.json({
      success: true,
      message: 'Keys validated successfully. Please add these to your environment:',
      envConfig: envContent,
      instructions: [
        'For Development:',
        '1. Stop your server (Ctrl+C)',
        '2. Add these variables to your .env file',
        '3. Restart your server (npm start)',
        '',
        'For Production:',
        '1. Add these variables to your hosting platform\'s environment settings',
        '2. Deploy your application',
        '3. Verify configuration via health endpoint'
      ]
    })
    
  } catch (error) {
    console.error('Configure Stripe error:', error)
    res.status(500).json({ error: 'Failed to configure Stripe keys' })
  }
})

// Verify Stripe keys
app.post('/api/admin/stripe/verify', async (req, res) => {
  try {
    const { publishableKey, secretKey, webhookSecret } = req.body
    
    let secretKeyValid = false
    let publishableKeyValid = false
    let webhookSecretValid = false
    
    // Test publishable key format
    publishableKeyValid = publishableKey && publishableKey.startsWith('pk_')
    
    // Test secret key by making a safe API call
    if (secretKey && secretKey.startsWith('sk_')) {
      try {
        const testStripe = require('stripe')(secretKey)
        // Make a safe API call that doesn't create anything
        await testStripe.balance.retrieve()
        secretKeyValid = true
      } catch (stripeError) {
        console.warn('Secret key validation failed:', stripeError.message)
        secretKeyValid = false
      }
    }
    
    // Test webhook secret format
    if (webhookSecret) {
      webhookSecretValid = webhookSecret.startsWith('whsec_')
    }
    
    let status = 'not-configured'
    if (secretKeyValid && publishableKeyValid && webhookSecretValid) {
      status = 'fully-configured'
    } else if (secretKeyValid && publishableKeyValid) {
      status = 'partial'
    } else if (secretKeyValid || publishableKeyValid) {
      status = 'invalid'
    }
    
    res.json({
      secretKeyValid,
      publishableKeyValid,
      webhookSecretValid,
      webhookSetupNeeded: secretKeyValid && publishableKeyValid && !webhookSecretValid,
      status
    })
    
  } catch (error) {
    console.error('Verify Stripe error:', error)
    res.status(500).json({ error: 'Failed to verify Stripe keys' })
  }
})

// ========== RECEIPT ENDPOINTS ==========

// Generate receipt for existing donation
app.post('/api/receipts/generate/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = mockDonations.find(d => d.id === donationId);
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    if (donation.status !== 'succeeded') {
      return res.status(400).json({ error: 'Receipt can only be generated for completed donations' });
    }
    
    const { generateReceiptPDF } = require('./receipts/generateReceiptPDF');
    const result = await generateReceiptPDF(donation);
    
    if (result.success) {
      // Update donation record with receipt info
      donation.receiptUrl = result.receiptUrl;
      donation.receiptFile = result.fileName;
      
      res.json({
        success: true,
        receiptUrl: result.receiptUrl,
        fileName: result.fileName,
        verificationUrl: result.verificationUrl
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to generate receipt' });
    }
    
  } catch (error) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Get receipt HTML for viewing
app.get('/api/receipts/view/:donationId', (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = mockDonations.find(d => d.id === donationId);
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    if (donation.status !== 'succeeded') {
      return res.status(400).json({ error: 'Receipt only available for completed donations' });
    }
    
    const { generateReceiptHTML } = require('./receipts/generateReceiptPDF');
    const receiptHTML = generateReceiptHTML(donation);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Donation Receipt - ${donation.id}</title>
        <style>
          .no-print { margin: 20px; text-align: center; }
          .no-print button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 10px;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button onclick="window.print()">🖨️ Print Receipt</button>
          <button onclick="window.close()">❌ Close</button>
        </div>
        ${receiptHTML}
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Receipt view error:', error);
    res.status(500).json({ error: 'Failed to load receipt' });
  }
});

// Export ledger as CSV
app.get('/api/admin/donations/export/csv', (req, res) => {
  try {
    const { startDate, endDate, clientSlug } = req.query;
    
    let filteredDonations = mockDonations.filter(d => d.status === 'succeeded');
    
    // Apply same filters as ledger
    if (startDate) {
      const start = new Date(startDate);
      filteredDonations = filteredDonations.filter(d => 
        new Date(d.createdAt) >= start
      );
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredDonations = filteredDonations.filter(d => 
        new Date(d.createdAt) <= end
      );
    }
    
    if (clientSlug) {
      filteredDonations = filteredDonations.filter(d => 
        d.clientSlug === clientSlug
      );
    }
    
    // Generate CSV
    const csvHeader = 'Date,Donor Name,Donor Email,Client,Amount,Payment ID,Receipt URL\n';
    const csvRows = filteredDonations.map(d => {
      const date = new Date(d.createdAt).toLocaleDateString('en-US');
      const donorName = (d.donorName || 'Anonymous').replace(/,/g, ';');
      const donorEmail = d.donorEmail || 'Not provided';
      const client = d.clientSlug;
      const amount = `$${(d.amountCents / 100).toFixed(2)}`;
      const paymentId = d.stripePaymentId || 'N/A';
      const receiptUrl = d.receiptUrl || 'Not generated';
      
      return `${date},"${donorName}",${donorEmail},${client},${amount},${paymentId},${receiptUrl}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Set headers for file download
    const filename = `donation_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Donation Verification endpoint
app.get('/api/verify/donation/:donationId', (req, res) => {
  try {
    const { donationId } = req.params;
    
    // Find the donation in our mock database
    const donation = mockDonations.find(d => d.id === donationId);
    
    if (!donation || donation.status !== 'succeeded') {
      return res.status(404).json({ 
        verified: false,
        error: 'Donation not found or not completed' 
      });
    }

    // Return verification details
    const verificationData = {
      id: donation.id,
      amount: donation.amountCents / 100,
      date: donation.createdAt,
      donorName: donation.donorName || 'Anonymous Donor',
      clientProfile: donation.clientSlug || 'General Support',
      verified: true,
      organizationInfo: {
        name: process.env.ORG_LEGAL_NAME || 'CareConnect Foundation',
        ein: process.env.ORG_EIN || '00-0000000',
        address: process.env.ORG_ADDRESS || '123 Main St, City, ST ZIP'
      },
      verificationTimestamp: new Date().toISOString(),
      receiptGenerated: !!donation.receiptUrl
    };

    res.json(verificationData);
    
  } catch (error) {
    console.error('Donation verification error:', error);
    res.status(500).json({ 
      verified: false,
      error: 'Verification system temporarily unavailable' 
    });
  }
});

// ========== V1.7 EMAIL ENDPOINTS ==========

// Email annual statement to donor
app.post('/api/admin/donations/email-statement', async (req, res) => {
  try {
    const { donorEmail, year } = req.body;
    
    if (!donorEmail) {
      return res.status(400).json({ error: 'Donor email is required' });
    }

    const currentYear = new Date().getFullYear();
    const targetYear = year || currentYear;

    // Calculate date range for the year
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    // Find all donations for this donor in the year
    let donorDonations = mockDonations.filter(d => 
      d.status === 'succeeded' && 
      d.donorEmail === donorEmail
    );

    // Filter by year
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    donorDonations = donorDonations.filter(d => {
      const donationDate = new Date(d.createdAt);
      return donationDate >= start && donationDate <= end;
    });

    if (donorDonations.length === 0) {
      return res.status(404).json({ 
        error: `No donations found for ${donorEmail} in ${targetYear}` 
      });
    }

    // Sort by date
    donorDonations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Prepare statement data
    const donationsList = donorDonations.map(donation => ({
      date: donation.createdAt,
      amount: donation.amountCents / 100,
      clientProfile: donation.clientSlug || 'General Support',
      donationId: donation.id
    }));

    const totalAmount = donationsList.reduce((sum, donation) => sum + donation.amount, 0);

    const summaryData = {
      donorName: donorDonations[0].donorName || 'Valued Donor',
      donorEmail: donorEmail,
      donations: donationsList,
      totalAmount: totalAmount,
      dateRange: { start: startDate, end: endDate }
    };

    // Generate PDF
    const { generateStatementHTML, generateStatementPDF } = require('./receiptGenerator');
    const html = generateStatementHTML(summaryData);
    const pdfBuffer = await generateStatementPDF(html, donorEmail);

    // Send email
    const { emailClient } = require('./emailClient');
    const emailResult = await emailClient.sendAnnualSummaryEmail(
      donorEmail,
      summaryData,
      pdfBuffer,
      targetYear
    );

    res.json({
      success: true,
      donorEmail: donorEmail,
      year: targetYear,
      donationCount: donorDonations.length,
      totalAmount: totalAmount,
      emailStatus: emailResult.status,
      emailSent: emailResult.success,
      message: emailResult.message
    });

  } catch (error) {
    console.error('Email statement error:', error);
    res.status(500).json({ error: 'Failed to send annual statement' });
  }
});

// Get email provider status
app.get('/api/admin/emails/status', (req, res) => {
  try {
    const { emailClient } = require('./emailClient');
    const status = emailClient.getProviderStatus();
    res.json(status);
  } catch (error) {
    console.error('Email status error:', error);
    res.status(500).json({ error: 'Failed to get email status' });
  }
});

// Get email logs
app.get('/api/admin/emails/logs', (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const { emailClient } = require('./emailClient');
    
    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const logs = emailClient.getEmailLogs(filters);
    
    res.json({
      logs: logs,
      count: logs.length,
      filters: filters
    });
  } catch (error) {
    console.error('Email logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve email logs' });
  }
});

// Serve receipt PDF files
app.use('/receipts', express.static(path.join(__dirname, 'uploads', 'receipts')));

// Health check endpoints
app.get('/health', healthHandler);
app.get('/ping', pingHandler);

// Admin monitoring endpoints
app.get('/api/admin/watchdog', (req, res) => {
  const status = getWatchdogStatus();
  res.json(status);
});

app.get('/api/admin/diagnostics', async (req, res) => {
  try {
    const diagnostics = await runDiagnostics();
    res.json(diagnostics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run diagnostics', message: error.message });
  }
});

app.get('/api/admin/diagnostics/history', (req, res) => {
  const history = getDiagnosticHistory();
  res.json(history);
});

app.get('/api/admin/troubleshooting', (req, res) => {
  const state = getTroubleshootingState();
  res.json(state);
});

app.get('/api/admin/system-health', async (req, res) => {
  try {
    const [diagnostics, watchdog, troubleshooting] = await Promise.all([
      runDiagnostics(),
      Promise.resolve(getWatchdogStatus()),
      Promise.resolve(getTroubleshootingState())
    ]);
    
    res.json({
      timestamp: new Date().toISOString(),
      diagnostics,
      watchdog,
      troubleshooting
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system health', message: error.message });
  }
});

// Legacy health check endpoint (for backward compatibility)
app.get('/health/legacy', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'CareConnect V1.6 Backend',
    features: {
      audio_recording: true,
      qr_generation: true,
      gofundme_drafts: true,
      stripe_payments: !!stripe,
      donation_receipts: true,
      auto_healing: true,
      health_monitoring: true
    },
    stripe_configured: !!stripe,
    timestamp: new Date().toISOString()
  });
});

// Global error handlers for auto-recovery
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  
  // Attempt webhook reconnection if Stripe-related
  if (err.message && err.message.includes('stripe')) {
    attemptWebhookReconnect();
  }
  
  // Don't exit immediately - let watchdog handle it
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => process.exit(1), 5000);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);
  
  // Attempt webhook reconnection if Stripe-related
  if (reason && reason.toString().includes('stripe')) {
    attemptWebhookReconnect();
  }
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  stopWatchdog();
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received. Shutting down gracefully...');
  stopWatchdog();
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 CareConnect V1 Backend');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📁 Audio uploads: /uploads/audio/`);
  console.log(`📱 QR codes: /uploads/qr/`);
  console.log(`💊 Health check: http://localhost:${PORT}/health`);
  console.log(`🐕 Watchdog: http://localhost:${PORT}/api/admin/watchdog`);
  console.log('========================================\n');
  
  // Start watchdog monitoring
  startWatchdog();
  console.log('✨ Auto-healing enabled - server ready\n');
});

module.exports = app;