/**
 * Admin Authentication Middleware
 * Secure cookie-based authentication for admin routes
 */

const crypto = require('crypto');

// Hardcoded admin password (server-side only)
const ADMIN_PASSWORD = 'Hayfield::';

// In-memory session store (use Redis in production)
const activeSessions = new Map();

// Generate secure session token
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create admin session
 * @param {string} password - Password to validate
 * @returns {object|null} - Session object or null if invalid
 */
function createAdminSession(password) {
  if (password !== ADMIN_PASSWORD) {
    return null;
  }

  const sessionId = generateSessionToken();
  const session = {
    id: sessionId,
    createdAt: new Date(),
    lastActivity: new Date(),
  };

  activeSessions.set(sessionId, session);
  
  // Auto-expire after 8 hours of inactivity
  setTimeout(() => {
    activeSessions.delete(sessionId);
  }, 8 * 60 * 60 * 1000);

  return session;
}

/**
 * Validate admin session
 * @param {string} sessionId - Session ID from cookie
 * @returns {boolean} - True if valid
 */
function validateSession(sessionId) {
  if (!sessionId) return false;
  
  const session = activeSessions.get(sessionId);
  if (!session) return false;

  // Update last activity
  session.lastActivity = new Date();
  return true;
}

/**
 * Destroy admin session
 * @param {string} sessionId - Session ID to destroy
 */
function destroySession(sessionId) {
  activeSessions.delete(sessionId);
}

/**
 * Express middleware to protect admin routes
 */
function requireAdminAuth(req, res, next) {
  const sessionId = req.cookies?.admin_session;

  if (!validateSession(sessionId)) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Admin authentication required'
    });
  }

  req.adminSessionId = sessionId;
  next();
}

/**
 * Mask email for display
 * @param {string} email - Email to mask
 * @returns {string} - Masked email (e.g., j***@gmail.com)
 */
function maskEmail(email) {
  if (!email) return 'N/A';
  
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  
  const maskedLocal = local[0] + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone for display
 * @param {string} phone - Phone to mask
 * @returns {string} - Masked phone (e.g., (555) ***-1290)
 */
function maskPhone(phone) {
  if (!phone) return 'N/A';
  
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ***-${digits.slice(6)}`;
  }
  
  // Fallback
  return `***-${digits.slice(-4)}`;
}

module.exports = {
  createAdminSession,
  validateSession,
  destroySession,
  requireAdminAuth,
  maskEmail,
  maskPhone,
};
