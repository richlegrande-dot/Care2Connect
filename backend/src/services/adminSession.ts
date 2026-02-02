import crypto from 'crypto';

type Session = { token: string; expiresAt: number };

const sessions = new Map<string, Session>();

export function createSession(ttlSeconds = 1800) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + ttlSeconds * 1000;
  sessions.set(token, { token, expiresAt });
  return token;
}

export function validateSession(token?: string) {
  if (!token) return false;
  const s = sessions.get(token);
  if (!s) return false;
  if (Date.now() > s.expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function revokeSession(token?: string) {
  if (!token) return;
  sessions.delete(token);
}

export default { createSession, validateSession, revokeSession };
