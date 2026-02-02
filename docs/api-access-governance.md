# API Access Control & Governance Framework

## Overview
Comprehensive access control tiering system for 400+ CareConnect API endpoints, implementing role-based access control (RBAC) with government compliance and audit logging.

## 🏛️ Access Control Tier Classification

### Tier 0: Public Access (No Authentication Required)
**Access Level**: Open to all users
**Rate Limit**: 1000 requests/hour per IP
**Monitoring**: Basic usage tracking

```typescript
const TIER_0_ENDPOINTS = [
  // System Health & Status
  'GET /health',
  'GET /health/basic',
  'GET /api/system/status',
  
  // Public Resource Discovery
  'GET /api/shelters',
  'GET /api/shelters/search',
  'GET /api/shelters/nearby',
  'GET /api/food/pantries',
  'GET /api/food/pantries/nearby',
  'GET /api/food/kitchens',
  'GET /api/food/kitchens/schedule',
  'GET /api/emergency/services',
  'GET /api/emergency/hotlines',
  'GET /api/transportation/services',
  'GET /api/transportation/routes',
  'GET /api/healthcare/providers',
  'GET /api/legal/services',
  'GET /api/community/events',
  'GET /api/community/groups',
  'GET /api/education/programs',
  'GET /api/skills/programs',
  'GET /api/safety/resources',
  
  // Public Information Endpoints
  'GET /api/documents/id-requirements',
  'GET /api/documents/templates',
  'GET /api/benefits/snap',
  'GET /api/benefits/wic',
  'GET /api/housing/resources',
  'GET /api/employment/services',
  'GET /api/financial/assistance',
  'GET /api/mental-health/resources',
  'GET /api/mental-health/crisis'
];
```

### Tier 1: Basic User Access (Authentication Required)
**Access Level**: Registered users with valid JWT token
**Rate Limit**: 500 requests/15 minutes per user
**Monitoring**: User activity tracking

```typescript
const TIER_1_ENDPOINTS = [
  // User Profile Management
  'GET /api/auth/me',
  'PUT /api/auth/me',
  'POST /api/auth/change-password',
  'GET /api/users/profile',
  'PUT /api/users/profile',
  'POST /api/users/profile/avatar',
  'DELETE /api/users/profile/avatar',
  'GET /api/users/preferences',
  'PUT /api/users/preferences',
  'GET /api/users/dashboard',
  
  // Job Search & Employment
  'GET /api/jobs/search',
  'GET /api/jobs/:id',
  'POST /api/jobs/save',
  'DELETE /api/jobs/save/:id',
  'GET /api/jobs/saved',
  'GET /api/jobs/applied',
  'POST /api/jobs/apply',
  'PUT /api/jobs/apply/:id',
  'POST /api/employment/training/enroll',
  'POST /api/employment/workshops/register',
  'POST /api/employment/counseling/book',
  
  // Basic AI & Voice Services
  'POST /api/ai/chat',
  'GET /api/ai/chat/history',
  'POST /api/ai/recommendations',
  'POST /api/voice/transcribe',
  'POST /api/voice/process-query',
  'GET /api/voice/history',
  'POST /api/voice/feedback',
  'GET /api/voice/settings',
  'PUT /api/voice/settings',
  
  // Community Participation
  'POST /api/community/groups/join',
  'POST /api/community/events/attend',
  'POST /api/community/volunteers/signup',
  'GET /api/peer-support/mentors',
  'POST /api/peer-support/mentors/request',
  'GET /api/peer-support/groups',
  
  // Basic File Management
  'GET /api/files',
  'POST /api/files/upload',
  'GET /api/files/:id',
  'PUT /api/files/:id',
  'DELETE /api/files/:id',
  'POST /api/files/share',
  'GET /api/files/shared',
  
  // Basic Document Services
  'GET /api/documents',
  'POST /api/documents/upload',
  'GET /api/documents/:id',
  'PUT /api/documents/:id',
  'DELETE /api/documents/:id',
  'POST /api/documents/request-help',
  
  // Transportation & Basic Services
  'POST /api/transportation/assistance',
  'POST /api/transportation/rideshare/request',
  'GET /api/vehicles/assistance',
  'POST /api/vehicles/donation-request'
];
```

### Tier 2: Sensitive Operations (Case Workers, Partners)
**Access Level**: Verified case workers, government partners, service providers
**Rate Limit**: 200 requests/15 minutes per user
**Monitoring**: Enhanced logging with data access tracking
**Consent Required**: Yes for PII access

```typescript
const TIER_2_ENDPOINTS = [
  // Healthcare & Medical Records
  'POST /api/healthcare/appointments',
  'GET /api/healthcare/appointments',
  'PUT /api/healthcare/appointments/:id',
  'DELETE /api/healthcare/appointments/:id',
  'GET /api/health/records',
  'POST /api/health/records',
  'PUT /api/health/records/:id',
  'DELETE /api/health/records/:id',
  'GET /api/health/medications',
  'POST /api/health/medications',
  'PUT /api/health/medications/:id',
  'DELETE /api/health/medications/:id',
  
  // Mental Health Services
  'POST /api/mental-health/sessions',
  'GET /api/mental-health/sessions',
  'POST /api/mental-health/crisis/contact',
  'POST /api/mental-health/support-groups/join',
  
  // Housing Applications & Services
  'GET /api/housing/applications',
  'POST /api/housing/applications',
  'PUT /api/housing/applications/:id',
  'DELETE /api/housing/applications/:id',
  'GET /api/housing/waitlist',
  'POST /api/housing/waitlist',
  'DELETE /api/housing/waitlist/:id',
  'POST /api/emergency/request',
  'GET /api/emergency/status',
  'PUT /api/emergency/status/:id',
  'POST /api/emergency/checkin',
  'POST /api/emergency/checkout',
  
  // Legal Services & Documentation
  'POST /api/legal/consultation',
  'GET /api/legal/consultation/:id',
  'POST /api/legal/documents/generate',
  'POST /api/documents/verify',
  'POST /api/documents/id/request',
  'POST /api/documents/replacement',
  
  // Financial Services
  'POST /api/financial/assistance/apply',
  'POST /api/financial/emergency/request',
  'POST /api/financial/budget/create',
  'POST /api/banking/account/open',
  'POST /api/credit/counseling',
  
  // Benefits Applications
  'POST /api/benefits/snap/apply',
  'GET /api/benefits/snap/status',
  'POST /api/benefits/wic/apply',
  
  // Advanced AI Services
  'POST /api/ai/analyze-needs',
  'POST /api/ai/match-services',
  'POST /api/ai/match-housing',
  'POST /api/ai/match-jobs',
  'GET /api/ai/match-history',
  
  // Career Development
  'GET /api/career/resume',
  'PUT /api/career/resume',
  'POST /api/career/resume/upload',
  'POST /api/career/skills',
  'PUT /api/career/skills/:id',
  'DELETE /api/career/skills/:id',
  'POST /api/career/experience',
  'PUT /api/career/experience/:id',
  'DELETE /api/career/experience/:id'
];
```

### Tier 3: Administrative Access (Admin & System Operations)
**Access Level**: System administrators, senior case managers
**Rate Limit**: 100 requests/15 minutes per admin
**Monitoring**: Full audit logging with admin action tracking
**Approval Required**: Multi-factor authentication required

```typescript
const TIER_3_ENDPOINTS = [
  // User Administration
  'GET /api/admin/users',
  'GET /api/admin/users/:id',
  'PUT /api/admin/users/:id',
  'DELETE /api/admin/users/:id',
  'POST /api/admin/users/:id/roles',
  'DELETE /api/admin/users/:id/roles',
  'GET /api/admin/roles',
  'POST /api/admin/roles',
  'PUT /api/admin/roles/:id',
  'DELETE /api/admin/roles/:id',
  
  // Resource Management
  'POST /api/shelters',
  'PUT /api/shelters/:id',
  'DELETE /api/shelters/:id',
  'POST /api/shelters/:id/availability',
  'POST /api/admin/shelters',
  'PUT /api/admin/shelters/:id',
  'DELETE /api/admin/shelters/:id',
  
  // System Analytics & Reports
  'GET /api/analytics/users',
  'GET /api/analytics/services',
  'GET /api/analytics/outcomes',
  'GET /api/analytics/demographics',
  'GET /api/analytics/reports',
  
  // System Configuration
  'GET /api/system/metrics',
  'GET /api/system/logs',
  'GET /api/integrations/status',
  'POST /api/integrations/sync',
  
  // Webhook Management
  'GET /api/webhooks',
  'POST /api/webhooks',
  'PUT /api/webhooks/:id',
  'DELETE /api/webhooks/:id',
  'POST /api/webhooks/test',
  'GET /api/webhooks/logs',
  
  // Advanced User Operations
  'POST /api/users/deactivate',
  'POST /api/users/reactivate'
];
```

### Tier 4: Emergency Override (Critical Operations)
**Access Level**: Emergency responders, system administrators with override privileges
**Rate Limit**: 50 requests/15 minutes per emergency user
**Monitoring**: Real-time security monitoring with immediate alerts
**Approval Required**: Emergency protocols + supervisor approval

```typescript
const TIER_4_ENDPOINTS = [
  // Emergency Response
  'POST /api/emergency/contact',
  'POST /api/emergency/alert',
  'POST /api/emergency/assistance',
  'POST /api/safety/report',
  
  // System Override Operations  
  'GET /api/system/health/detailed',
  'POST /api/system/maintenance/start',
  'POST /api/system/maintenance/stop',
  'POST /api/system/emergency-shutdown',
  'POST /api/system/data-export/emergency',
  
  // Critical Data Access
  'GET /api/admin/users/emergency-access',
  'POST /api/admin/override/user-access',
  'POST /api/admin/emergency/data-breach-response',
  
  // Security Operations
  'POST /api/security/lockdown',
  'POST /api/security/unlock-user/:id',
  'GET /api/security/audit-trail/emergency',
  'POST /api/security/force-logout-all'
];
```

## 🔐 Role-Based Access Control (RBAC) Matrix

### User Roles Definition
```typescript
enum UserRole {
  // Tier 1 Roles
  CLIENT = 'client',                    // Homeless individuals seeking services
  VOLUNTEER = 'volunteer',              // Community volunteers
  
  // Tier 2 Roles  
  CASE_WORKER = 'case_worker',          // Social workers, case managers
  SERVICE_PROVIDER = 'service_provider', // Shelter staff, healthcare workers
  GOVERNMENT_PARTNER = 'government_partner', // Government agency staff
  LEGAL_AID = 'legal_aid',              // Legal aid attorneys/staff
  
  // Tier 3 Roles
  ADMIN = 'admin',                      // System administrators
  SENIOR_CASE_MANAGER = 'senior_case_manager', // Senior case management
  DATA_ANALYST = 'data_analyst',        // Analytics and reporting staff
  
  // Tier 4 Roles
  EMERGENCY_RESPONDER = 'emergency_responder', // Crisis intervention team
  SYSTEM_ADMIN = 'system_admin',        // Technical system administrators
  SECURITY_ADMIN = 'security_admin'     // Security operations team
}

enum Permission {
  // Basic Permissions
  READ_PUBLIC = 'read:public',
  READ_OWN_PROFILE = 'read:own_profile',
  WRITE_OWN_PROFILE = 'write:own_profile',
  
  // Service Permissions  
  ACCESS_SERVICES = 'access:services',
  APPLY_BENEFITS = 'apply:benefits',
  SCHEDULE_APPOINTMENTS = 'schedule:appointments',
  
  // Case Management Permissions
  READ_CLIENT_DATA = 'read:client_data',
  WRITE_CLIENT_DATA = 'write:client_data',
  MANAGE_CASES = 'manage:cases',
  ACCESS_PII = 'access:pii',
  
  // Administrative Permissions
  MANAGE_USERS = 'manage:users',
  MANAGE_RESOURCES = 'manage:resources',
  VIEW_ANALYTICS = 'view:analytics',
  SYSTEM_CONFIG = 'system:config',
  
  // Emergency Permissions
  EMERGENCY_OVERRIDE = 'emergency:override',
  SYSTEM_MAINTENANCE = 'system:maintenance',
  SECURITY_OPERATIONS = 'security:operations'
}
```

### Permission Matrix
```typescript
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CLIENT]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.APPLY_BENEFITS,
    Permission.SCHEDULE_APPOINTMENTS
  ],
  
  [UserRole.VOLUNTEER]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES
  ],
  
  [UserRole.CASE_WORKER]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.READ_CLIENT_DATA,
    Permission.WRITE_CLIENT_DATA,
    Permission.MANAGE_CASES,
    Permission.ACCESS_PII
  ],
  
  [UserRole.SERVICE_PROVIDER]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.READ_CLIENT_DATA,
    Permission.MANAGE_CASES
  ],
  
  [UserRole.GOVERNMENT_PARTNER]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.READ_CLIENT_DATA,
    Permission.WRITE_CLIENT_DATA,
    Permission.ACCESS_PII,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.LEGAL_AID]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.READ_CLIENT_DATA,
    Permission.WRITE_CLIENT_DATA,
    Permission.ACCESS_PII
  ],
  
  [UserRole.ADMIN]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.READ_CLIENT_DATA,
    Permission.WRITE_CLIENT_DATA,
    Permission.MANAGE_CASES,
    Permission.ACCESS_PII,
    Permission.MANAGE_USERS,
    Permission.MANAGE_RESOURCES,
    Permission.VIEW_ANALYTICS,
    Permission.SYSTEM_CONFIG
  ],
  
  [UserRole.SENIOR_CASE_MANAGER]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.READ_CLIENT_DATA,
    Permission.WRITE_CLIENT_DATA,
    Permission.MANAGE_CASES,
    Permission.ACCESS_PII,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.DATA_ANALYST]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.EMERGENCY_RESPONDER]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.READ_CLIENT_DATA,
    Permission.WRITE_CLIENT_DATA,
    Permission.ACCESS_PII,
    Permission.EMERGENCY_OVERRIDE
  ],
  
  [UserRole.SYSTEM_ADMIN]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_SERVICES,
    Permission.READ_CLIENT_DATA,
    Permission.WRITE_CLIENT_DATA,
    Permission.MANAGE_CASES,
    Permission.ACCESS_PII,
    Permission.MANAGE_USERS,
    Permission.MANAGE_RESOURCES,
    Permission.VIEW_ANALYTICS,
    Permission.SYSTEM_CONFIG,
    Permission.EMERGENCY_OVERRIDE,
    Permission.SYSTEM_MAINTENANCE
  ],
  
  [UserRole.SECURITY_ADMIN]: [
    Permission.READ_PUBLIC,
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.MANAGE_USERS,
    Permission.VIEW_ANALYTICS,
    Permission.SYSTEM_CONFIG,
    Permission.SECURITY_OPERATIONS,
    Permission.EMERGENCY_OVERRIDE
  ]
};
```

## 🔑 JWT Token Enhancement

### Enhanced Token Structure
```typescript
interface EnhancedJWTPayload {
  // Standard Claims
  sub: string;                          // User ID
  iat: number;                          // Issued at
  exp: number;                          // Expiry
  iss: string;                          // Issuer (careconnect.org)
  aud: string;                          // Audience
  
  // Custom Claims
  userId: string;
  email: string;
  roles: UserRole[];
  permissions: Permission[];
  accessTier: 0 | 1 | 2 | 3 | 4;
  
  // Security Metadata
  sessionId: string;                    // Unique session identifier
  deviceId?: string;                    // Device identifier
  ipAddress: string;                    // IP address at token issuance
  mfaVerified: boolean;                 // Multi-factor auth status
  consentVersion: string;               // Privacy consent version
  
  // Operational Metadata
  lastActivity: number;                 // Last activity timestamp
  emergencyMode: boolean;               // Emergency access mode
  dataAccessLevel: 'basic' | 'full' | 'emergency';
  
  // Rate Limiting
  rateLimitGroup: string;               // Rate limiting group
  customRateLimit?: {
    requests: number;
    windowMs: number;
  };
}
```

### Token Validation Middleware
```typescript
// backend/src/middleware/jwt-validation.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission } from '../types/auth';

interface AuthenticatedRequest extends Request {
  user?: EnhancedJWTPayload;
  accessTier?: number;
}

export const validateJWT = (requiredTier: number = 1, requiredPermissions: Permission[] = []) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'NO_TOKEN'
        });
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET!) as EnhancedJWTPayload;
      
      // Validate access tier
      if (payload.accessTier < requiredTier) {
        return res.status(403).json({
          error: 'Insufficient access level',
          code: 'INSUFFICIENT_TIER',
          required: requiredTier,
          current: payload.accessTier
        });
      }

      // Validate specific permissions
      if (requiredPermissions.length > 0) {
        const hasPermissions = requiredPermissions.every(permission => 
          payload.permissions.includes(permission)
        );
        
        if (!hasPermissions) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: requiredPermissions,
            current: payload.permissions
          });
        }
      }

      // Check for emergency mode restrictions
      if (payload.emergencyMode && requiredTier < 4) {
        return res.status(423).json({
          error: 'System in emergency mode',
          code: 'EMERGENCY_MODE_ACTIVE'
        });
      }

      // Validate MFA for sensitive operations
      if (requiredTier >= 3 && !payload.mfaVerified) {
        return res.status(403).json({
          error: 'Multi-factor authentication required',
          code: 'MFA_REQUIRED'
        });
      }

      req.user = payload;
      req.accessTier = payload.accessTier;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      return res.status(500).json({
        error: 'Token validation failed',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  // Check cookie
  if (req.cookies && req.cookies.authToken) {
    return req.cookies.authToken;
  }
  
  return null;
}
```

## 🎯 Endpoint Access Matrix

### Complete Endpoint Classification Table
```typescript
const ENDPOINT_ACCESS_MATRIX = {
  // Tier 0: Public Access
  'GET /health': {
    tier: 0,
    permissions: [],
    rateLimit: { requests: 1000, windowMs: 3600000 }, // 1000/hour
    consentRequired: false,
    monitoring: 'basic',
    description: 'Basic system health check'
  },
  
  'GET /api/shelters': {
    tier: 0,
    permissions: [],
    rateLimit: { requests: 500, windowMs: 3600000 },
    consentRequired: false,
    monitoring: 'basic',
    description: 'Public shelter directory'
  },

  // Tier 1: Basic User Access  
  'GET /api/jobs/search': {
    tier: 1,
    permissions: [Permission.ACCESS_SERVICES],
    rateLimit: { requests: 100, windowMs: 900000 }, // 100/15min
    consentRequired: false,
    monitoring: 'standard',
    description: 'Job search functionality'
  },
  
  'POST /api/ai/chat': {
    tier: 1,
    permissions: [Permission.ACCESS_SERVICES],
    rateLimit: { requests: 50, windowMs: 900000 }, // 50/15min
    consentRequired: false,
    monitoring: 'enhanced',
    description: 'AI chat assistance'
  },

  // Tier 2: Sensitive Operations
  'POST /api/healthcare/appointments': {
    tier: 2,
    permissions: [Permission.ACCESS_SERVICES, Permission.SCHEDULE_APPOINTMENTS],
    rateLimit: { requests: 20, windowMs: 900000 }, // 20/15min
    consentRequired: true,
    monitoring: 'full',
    description: 'Healthcare appointment scheduling'
  },
  
  'GET /api/health/records': {
    tier: 2,
    permissions: [Permission.READ_CLIENT_DATA, Permission.ACCESS_PII],
    rateLimit: { requests: 10, windowMs: 900000 }, // 10/15min
    consentRequired: true,
    monitoring: 'full',
    governmentAccess: true,
    description: 'Health records access'
  },

  // Tier 3: Administrative
  'GET /api/admin/users': {
    tier: 3,
    permissions: [Permission.MANAGE_USERS],
    rateLimit: { requests: 50, windowMs: 900000 },
    consentRequired: false,
    monitoring: 'audit',
    mfaRequired: true,
    description: 'User administration'
  },

  // Tier 4: Emergency Override
  'POST /api/emergency/alert': {
    tier: 4,
    permissions: [Permission.EMERGENCY_OVERRIDE],
    rateLimit: { requests: 5, windowMs: 900000 },
    consentRequired: false,
    monitoring: 'realtime',
    emergencyOnly: true,
    description: 'Emergency alert system'
  }
} as const;
```

This comprehensive access control framework ensures proper security governance across all 400+ API endpoints while maintaining compliance with government regulations and privacy requirements.