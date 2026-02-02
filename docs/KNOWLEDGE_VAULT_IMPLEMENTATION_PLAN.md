# Knowledge Vault Admin System - Implementation Plan

**Date:** December 16, 2025  
**Status:** 🔨 IN PROGRESS - Schema Complete, Backend & Frontend Pending  
**Agent:** GitHub Copilot (Claude Sonnet 4.5)

---

## ✅ Completed: Database Schema

### Prisma Schema Updates Applied

**Migration:** `20251216230946_add_knowledge_vault_audit_logging`

#### 1. Enhanced KnowledgeSource Model
```prisma
model KnowledgeSource {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  sourceType  KnowledgeSourceType
  title       String
  url         String?
  licenseNote String?  @db.Text
  metadata    Json?    // NEW: Additional flexible metadata
  
  fetchedAt   DateTime?
  contentHash String?
  
  // NEW: Soft delete support
  isDeleted Boolean @default(false)
  deletedAt DateTime?
  
  chunks KnowledgeChunk[]
  
  @@index([sourceType])
  @@index([createdAt])
  @@index([isDeleted]) // NEW
  @@map("knowledge_sources")
}
```

#### 2. Enhanced KnowledgeChunk Model
```prisma
model KnowledgeChunk {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt // NEW
  
  sourceId String
  source   KnowledgeSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  
  chunkText String   @db.Text
  tags      String[]
  language  String?
  metadata  Json?    // NEW: Additional flexible metadata
  
  // NEW: Soft delete support
  isDeleted Boolean @default(false)
  deletedAt DateTime?
  
  @@index([sourceId])
  @@index([language])
  @@index([isDeleted]) // NEW
  @@map("knowledge_chunks")
}
```

#### 3. NEW: KnowledgeAuditLog Model
```prisma
model KnowledgeAuditLog {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  
  // Who made the change
  actor String @default("admin")
  
  // What was changed
  action     AuditAction // CREATE, UPDATE, DELETE
  entityType AuditEntityType // KNOWLEDGE_SOURCE, KNOWLEDGE_CHUNK
  entityId   String // References KnowledgeSource.id or KnowledgeChunk.id
  
  // Change details
  beforeJson Json? // State before (null for CREATE)
  afterJson  Json? // State after (null for DELETE)
  diffJson   Json? // Computed diff of changed fields
  
  // Optional context
  reason String? @db.Text
  
  @@index([action])
  @@index([entityType])
  @@index([entityId])
  @@index([createdAt])
  @@map("knowledge_audit_logs")
}
```

#### 4. NEW: Audit Enums
```prisma
enum AuditAction {
  CREATE
  UPDATE
  DELETE
}

enum AuditEntityType {
  KNOWLEDGE_SOURCE
  KNOWLEDGE_CHUNK
}
```

---

## 🔨 TODO: Backend Implementation

### 1. Authentication Middleware

**File:** `backend/src/middleware/adminAuth.ts` (NEW)

```typescript
/**
 * Admin authentication middleware
 * Reuses the same password mechanism as the health page
 */
import { Request, Response, NextFunction } from 'express';

export interface AdminAuthRequest extends Request {
  adminUser?: string;
}

export function requireAdminAuth(req: AdminAuthRequest, res: Response, next: NextFunction) {
  // Check for admin token in:
  // 1. Cookie: admin_session
  // 2. Header: x-admin-password or Authorization: Bearer <token>
  // 3. Query param: token (for development only)
  
  const cookieToken = req.cookies?.admin_session;
  const headerToken = req.headers['x-admin-password'] || 
                     req.headers.authorization?.replace('Bearer ', '');
  const queryToken = req.query.token;
  
  const providedToken = cookieToken || headerToken || queryToken;
  const validToken = process.env.ADMIN_PASSWORD || 'changeme'; // Same as health page
  
  if (providedToken === validToken) {
    req.adminUser = 'admin';
    next();
  } else {
    res.status(401).json({ 
      error: 'Authorization required',
      message: 'Admin password required to access this endpoint'
    });
  }
}
```

### 2. Audit Logging Service

**File:** `backend/src/services/auditLogger.ts` (NEW)

```typescript
import { PrismaClient, AuditAction, AuditEntityType } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLogInput {
  actor: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: any;
  after?: any;
  reason?: string;
}

/**
 * Security: Never log secrets
 * Redact patterns: sk_, whsec_, postgres://, JWT patterns, API keys
 */
function redactSecrets(obj: any): any {
  if (!obj) return obj;
  
  const sensitivePatterns = [
    /sk_\w+/gi,           // Stripe keys
    /whsec_\w+/gi,        // Webhook secrets
    /postgres:\/\/.+/gi,  // Database URLs
    /jwt_\w+/gi,          // JWT tokens
    /Bearer\s+\w+/gi,     // Bearer tokens
  ];
  
  const str = JSON.stringify(obj);
  let redacted = str;
  
  for (const pattern of sensitivePatterns) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  
  return JSON.parse(redacted);
}

/**
 * Compute simple diff between before and after states
 */
function computeDiff(before: any, after: any): any {
  if (!before || !after) return null;
  
  const diff: any = {};
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  
  for (const key of allKeys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = {
        before: before[key],
        after: after[key]
      };
    }
  }
  
  return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Log an audit event
 */
export async function logAudit(input: AuditLogInput) {
  try {
    const beforeRedacted = redactSecrets(input.before);
    const afterRedacted = redactSecrets(input.after);
    const diffComputed = computeDiff(beforeRedacted, afterRedacted);
    
    await prisma.knowledgeAuditLog.create({
      data: {
        actor: input.actor,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeJson: beforeRedacted,
        afterJson: afterRedacted,
        diffJson: diffComputed,
        reason: input.reason
      }
    });
  } catch (error) {
    console.error('[AuditLogger] Failed to log audit event:', error);
    // Don't throw - audit logging failures shouldn't break operations
  }
}
```

### 3. Knowledge Vault CRUD Routes

**File:** `backend/src/routes/admin/knowledge.ts` (NEW)

**Endpoints to implement:**

#### Knowledge Sources
- `GET /admin/knowledge/sources` - List sources (paginate, filter, search)
- `POST /admin/knowledge/sources` - Create source + audit log
- `GET /admin/knowledge/sources/:id` - Get source with chunks
- `PATCH /admin/knowledge/sources/:id` - Update source + audit log
- `DELETE /admin/knowledge/sources/:id` - Soft delete + audit log

#### Knowledge Chunks
- `POST /admin/knowledge/sources/:id/chunks` - Create chunk + audit log
- `PATCH /admin/knowledge/chunks/:id` - Update chunk + audit log
- `DELETE /admin/knowledge/chunks/:id` - Soft delete + audit log

#### Database Overview (Read-Only)
- `GET /admin/knowledge/database/overview` - Safe counts (no PII)

**Example Implementation Structure:**

```typescript
import express from 'express';
import { requireAdminAuth } from '../../middleware/adminAuth';
import { logAudit } from '../../services/auditLogger';
import { PrismaClient, AuditAction, AuditEntityType } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// All routes require admin auth
router.use(requireAdminAuth);

// List sources
router.get('/sources', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      search,
      includeDeleted = 'false'
    } = req.query;
    
    const where: any = {};
    
    if (type) where.sourceType = type;
    if (includeDeleted !== 'true') where.isDeleted = false;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { url: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [sources, total] = await Promise.all([
      prisma.knowledgeSource.findMany({
        where,
        include: {
          _count: { select: { chunks: true } }
        },
        skip,
        take: Number(limit),
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.knowledgeSource.count({ where })
    ]);
    
    res.json({
      sources,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// Create source
router.post('/sources', async (req, res) => {
  try {
    const { title, sourceType, url, licenseNote, metadata, tags } = req.body;
    
    const source = await prisma.knowledgeSource.create({
      data: {
        title,
        sourceType,
        url,
        licenseNote,
        metadata
      }
    });
    
    await logAudit({
      actor: req.adminUser || 'admin',
      action: AuditAction.CREATE,
      entityType: AuditEntityType.KNOWLEDGE_SOURCE,
      entityId: source.id,
      after: source,
      reason: req.body.reason
    });
    
    res.status(201).json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create source' });
  }
});

// Get source with chunks
router.get('/sources/:id', async (req, res) => {
  try {
    const source = await prisma.knowledgeSource.findUnique({
      where: { id: req.params.id },
      include: {
        chunks: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!source) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch source' });
  }
});

// Update source
router.patch('/sources/:id', async (req, res) => {
  try {
    const before = await prisma.knowledgeSource.findUnique({
      where: { id: req.params.id }
    });
    
    if (!before) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    const { title, sourceType, url, licenseNote, metadata } = req.body;
    
    const after = await prisma.knowledgeSource.update({
      where: { id: req.params.id },
      data: {
        title,
        sourceType,
        url,
        licenseNote,
        metadata
      }
    });
    
    await logAudit({
      actor: req.adminUser || 'admin',
      action: AuditAction.UPDATE,
      entityType: AuditEntityType.KNOWLEDGE_SOURCE,
      entityId: after.id,
      before,
      after,
      reason: req.body.reason
    });
    
    res.json(after);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update source' });
  }
});

// Soft delete source
router.delete('/sources/:id', async (req, res) => {
  try {
    const before = await prisma.knowledgeSource.findUnique({
      where: { id: req.params.id }
    });
    
    if (!before) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    const after = await prisma.knowledgeSource.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
    
    await logAudit({
      actor: req.adminUser || 'admin',
      action: AuditAction.DELETE,
      entityType: AuditEntityType.KNOWLEDGE_SOURCE,
      entityId: after.id,
      before,
      reason: req.body.reason
    });
    
    res.json({ message: 'Source deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

// Database overview (safe counts only)
router.get('/database/overview', async (req, res) => {
  try {
    const [
      knowledgeSourceCount,
      knowledgeChunkCount,
      recordingTicketCount,
      supportTicketCount,
      stripeAttributionCount
    ] = await Promise.all([
      prisma.knowledgeSource.count({ where: { isDeleted: false } }),
      prisma.knowledgeChunk.count({ where: { isDeleted: false } }),
      prisma.recordingTicket.count(),
      prisma.supportTicket.count(),
      prisma.stripeAttribution.count()
    ]);
    
    res.json({
      tables: [
        { name: 'KnowledgeSource', count: knowledgeSourceCount },
        { name: 'KnowledgeChunk', count: knowledgeChunkCount },
        { name: 'RecordingTicket', count: recordingTicketCount },
        { name: 'SupportTicket', count: supportTicketCount },
        { name: 'StripeAttribution', count: stripeAttributionCount }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch database overview' });
  }
});

export default router;
```

### 4. Audit Log Routes

**File:** `backend/src/routes/admin/audit.ts` (NEW)

```typescript
import express from 'express';
import { requireAdminAuth } from '../../middleware/adminAuth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdminAuth);

// List audit logs
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      entityId,
      startDate,
      endDate
    } = req.query;
    
    const where: any = {};
    
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [logs, total] = await Promise.all([
      prisma.knowledgeAuditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.knowledgeAuditLog.count({ where })
    ]);
    
    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get single audit log
router.get('/:id', async (req, res) => {
  try {
    const log = await prisma.knowledgeAuditLog.findUnique({
      where: { id: req.params.id }
    });
    
    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }
    
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

export default router;
```

### 5. DB Diagnostics & Self-Heal Routes

**File:** `backend/src/routes/admin/db.ts` (NEW)

```typescript
import express from 'express';
import { requireAdminAuth } from '../../middleware/adminAuth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
let prisma = new PrismaClient();

router.use(requireAdminAuth);

// DB Diagnostics
router.get('/diagnostics', async (req, res) => {
  try {
    // Get diagnostic info from watchdog or health service
    // This would integrate with your existing database health checking
    
    res.json({
      status: 'healthy',
      lastPingAt: new Date(),
      failureCount: 0,
      lastError: null,
      recommendedAction: 'No action needed'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendedAction: 'Run self-heal or check database connectivity'
    });
  }
});

// Self-Heal
router.post('/self-heal', async (req, res) => {
  try {
    console.log('[DB Self-Heal] Starting self-heal process...');
    
    // 1. Disconnect current client
    await prisma.$disconnect();
    console.log('[DB Self-Heal] Disconnected Prisma client');
    
    // 2. Create new client
    prisma = new PrismaClient();
    console.log('[DB Self-Heal] Created new Prisma client');
    
    // 3. Test connection
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('[DB Self-Heal] Connection test passed');
    
    // 4. Verify key tables exist
    const tableChecks = await Promise.all([
      prisma.knowledgeSource.count().then(() => ({ table: 'KnowledgeSource', ok: true })),
      prisma.knowledgeChunk.count().then(() => ({ table: 'KnowledgeChunk', ok: true })),
      prisma.recordingTicket.count().then(() => ({ table: 'RecordingTicket', ok: true }))
    ]);
    
    console.log('[DB Self-Heal] Table verification passed');
    
    res.json({
      success: true,
      message: 'Self-heal completed successfully',
      checks: tableChecks,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('[DB Self-Heal] Failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendedAction: 'Check database connectivity and credentials'
    });
  }
});

export default router;
```

### 6. Mount Routes in server.ts

**File:** `backend/src/server.ts` (MODIFY)

```typescript
// Add imports
import adminKnowledgeRoutes from './routes/admin/knowledge';
import adminAuditRoutes from './routes/admin/audit';
import adminDbRoutes from './routes/admin/db';

// Mount routes
app.use('/admin/knowledge', adminKnowledgeRoutes);
app.use('/admin/knowledge/audit', adminAuditRoutes);
app.use('/admin/db', adminDbRoutes);

console.log('[Server] Admin Knowledge Vault routes mounted');
```

---

## 🔨 TODO: Frontend Implementation

### 1. Password Protection Component

**File:** `frontend/components/AdminPasswordGate.tsx` (NEW)

```typescript
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AdminPasswordGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify password with backend
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        localStorage.setItem('adminToken', password);
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Authentication failed');
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center">Admin Access Required</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border rounded"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
```

### 2. Knowledge Vault Main Page

**File:** `frontend/app/admin/knowledge/page.tsx` (NEW)

Key features:
- Search bar (title, tags, content)
- Filter by source type
- Table with: Title, Type, Updated, #Chunks, Actions
- "New Source" button
- Edit/Delete buttons per row
- Password gate wrapper

### 3. Source Detail/Editor Page

**File:** `frontend/app/admin/knowledge/[sourceId]/page.tsx` (NEW)

Key features:
- Editable fields: title, type, URL, license, metadata (JSON)
- Chunk list with preview
- Add/Edit/Delete chunk buttons
- Save triggers PATCH endpoint + audit log
- Link to view audit logs for this source

### 4. Audit Log List Page

**File:** `frontend/app/admin/knowledge/audit/page.tsx` (NEW)

Key features:
- Table: Timestamp, Action, Entity Type, Entity ID, Summary
- Filters: action, entityType, date range
- Click row to view details
- Search by entityId

### 5. Audit Log Detail Page

**File:** `frontend/app/admin/knowledge/audit/[auditId]/page.tsx` (NEW)

Key features:
- Display: action, actor, timestamp
- Before/After JSON (formatted)
- Diff visualization (highlighted changes)
- "View Entity" link (navigate to source/chunk)

---

## 🔨 TODO: Enhanced DB Hardening

### Runtime Error Detection

**File:** `backend/src/middleware/dbErrorHandler.ts` (NEW)

```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export function handleDbErrors(err: any, req: Request, res: Response, next: NextFunction) {
  // Detect Prisma connection errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P1001' || err.code === 'P1002') {
      // Connection error - trigger self-heal
      console.error('[DB Runtime Error] Connection lost:', err.message);
      
      // Mark dbReady = false (integrate with your watchdog)
      global.dbReady = false;
      
      // Attempt reconnect (limited)
      attemptReconnect();
      
      return res.status(503).json({
        error: 'Database connection error',
        message: 'Service temporarily unavailable',
        code: 'DB_CONNECTION_LOST'
      });
    }
  }
  
  next(err);
}

async function attemptReconnect() {
  // Implement reconnection logic
  // This should integrate with your existing watchdog system
}
```

---

## Testing & Acceptance Criteria

### Authentication
- [ ] Visiting /admin/knowledge without password → blocked
- [ ] Using correct password → access granted
- [ ] Password persists in localStorage
- [ ] Backend endpoints return 401 without valid token

### CRUD Operations
- [ ] Create KnowledgeSource → appears in list, audit log created
- [ ] Add chunk → audit log created
- [ ] Edit chunk → audit log shows before/after
- [ ] Soft delete → audit log created, item hidden
- [ ] All audit logs visible in audit viewer

### Audit Log
- [ ] Audit list shows all changes
- [ ] Filters work (action, entityType, date)
- [ ] Detail view shows correct before/after/diff
- [ ] No secrets exposed in audit logs

### DB Hardening
- [ ] DB failure triggers 503 responses
- [ ] Self-heal endpoint reconnects successfully
- [ ] Diagnostics shows correct status
- [ ] Watchdog behavior unchanged

---

## Security Checklist

- [ ] No API keys, secrets, or credentials stored in knowledge vault
- [ ] Audit logs redact sensitive patterns
- [ ] Admin password required on all endpoints (server-side)
- [ ] Database overview shows counts only, no PII
- [ ] Soft delete preserves history
- [ ] Frontend validates admin token before rendering

---

## Implementation Status

✅ **Completed:**
1. Prisma schema with audit logging
2. Migration applied successfully
3. Soft delete support added
4. Audit enums defined

🔨 **In Progress:**
1. Backend routes and middleware
2. Audit logging service
3. Frontend pages and components

⏳ **Pending:**
1. Password gate component
2. Knowledge vault UI
3. Audit log viewer UI
4. DB self-heal implementation
5. Documentation

---

## Next Steps

1. **Implement backend auth middleware** - Reuse health page password mechanism
2. **Create backend CRUD routes** - Knowledge sources and chunks
3. **Implement audit logging service** - With secret redaction
4. **Build frontend password gate** - Consistent with health page
5. **Create knowledge vault UI** - List, create, edit, delete
6. **Build audit log viewer** - List and detail views
7. **Add DB diagnostics endpoints** - Self-heal and monitoring
8. **Write comprehensive tests** - All CRUD operations and audit logging
9. **Create user documentation** - KNOWLEDGE_VAULT_ADMIN.md

---

**File:** `docs/KNOWLEDGE_VAULT_IMPLEMENTATION_PLAN.md`  
**Last Updated:** December 16, 2025  
**Status:** Schema complete, awaiting backend and frontend implementation
