import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface GovernmentAccessLog {
  id: string;
  userId: string;
  agencyType: 'federal' | 'state' | 'local' | 'partner';
  agencyName: string;
  accessorId: string;
  resourceAccessed: string;
  dataFields: string[];
  purpose: string;
  legalBasis: string;
  consentGranted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  auditLevel: 'standard' | 'high' | 'critical';
}

interface AccessContext {
  endpoint: string;
  method: string;
  dataAccessed: string[];
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Government partner organizations
const GOVERNMENT_AGENCIES = {
  hud: {
    name: 'U.S. Department of Housing and Urban Development',
    type: 'federal' as const,
    allowedResources: ['housing', 'shelter', 'voucher'],
    auditLevel: 'high' as const
  },
  hhs: {
    name: 'U.S. Department of Health and Human Services',
    type: 'federal' as const,
    allowedResources: ['healthcare', 'mental-health', 'benefits'],
    auditLevel: 'critical' as const
  },
  dol: {
    name: 'U.S. Department of Labor',
    type: 'federal' as const,
    allowedResources: ['employment', 'training', 'unemployment'],
    auditLevel: 'high' as const
  },
  snap: {
    name: 'Supplemental Nutrition Assistance Program',
    type: 'federal' as const,
    allowedResources: ['benefits', 'food-assistance'],
    auditLevel: 'high' as const
  },
  local_health: {
    name: 'Local Health Department',
    type: 'local' as const,
    allowedResources: ['healthcare', 'mental-health', 'emergency'],
    auditLevel: 'high' as const
  },
  social_services: {
    name: 'County Social Services',
    type: 'local' as const,
    allowedResources: ['benefits', 'housing', 'emergency'],
    auditLevel: 'standard' as const
  }
};

// Resources requiring government audit logging
const GOVERNMENT_RESOURCES = {
  '/api/housing/applications': {
    dataFields: ['personal_info', 'income', 'housing_history', 'disability_status'],
    sensitivityLevel: 'high' as const,
    legalBasis: 'Housing assistance program eligibility verification'
  },
  '/api/benefits/snap/apply': {
    dataFields: ['personal_info', 'income', 'household_size', 'assets'],
    sensitivityLevel: 'high' as const,
    legalBasis: 'SNAP eligibility verification and fraud prevention'
  },
  '/api/healthcare/appointments': {
    dataFields: ['personal_info', 'health_conditions', 'insurance_info'],
    sensitivityLevel: 'critical' as const,
    legalBasis: 'Healthcare coordination and Medicaid eligibility'
  },
  '/api/health/records': {
    dataFields: ['personal_info', 'medical_history', 'medications', 'diagnoses'],
    sensitivityLevel: 'critical' as const,
    legalBasis: 'HIPAA-compliant healthcare coordination'
  },
  '/api/mental-health/sessions': {
    dataFields: ['personal_info', 'mental_health_status', 'treatment_history'],
    sensitivityLevel: 'critical' as const,
    legalBasis: 'Mental health service coordination and crisis prevention'
  },
  '/api/employment/training/enroll': {
    dataFields: ['personal_info', 'employment_history', 'skills', 'education'],
    sensitivityLevel: 'medium' as const,
    legalBasis: 'Workforce development program eligibility'
  },
  '/api/legal/consultation': {
    dataFields: ['personal_info', 'legal_issues', 'case_details'],
    sensitivityLevel: 'high' as const,
    legalBasis: 'Legal aid coordination and public defender assignment'
  },
  '/api/emergency/request': {
    dataFields: ['personal_info', 'location', 'emergency_type', 'health_status'],
    sensitivityLevel: 'critical' as const,
    legalBasis: 'Emergency response and public safety'
  }
};

export const governmentResourceAccessLogger = () => {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const endpoint = req.path;
    const resource = GOVERNMENT_RESOURCES[endpoint as keyof typeof GOVERNMENT_RESOURCES];
    
    // Skip non-government resources
    if (!resource) {
      return next();
    }

    try {
      const userId = req.user?.userId;
      const accessorRole = req.user?.roles?.[0];
      const isGovernmentAccess = isGovernmentAccessor(req.user);

      // Create access context
      const accessContext: AccessContext = {
        endpoint,
        method: req.method,
        dataAccessed: resource.dataFields,
        sensitivityLevel: resource.sensitivityLevel
      };

      // Pre-access logging
      await logGovernmentAccess({
        userId: userId || 'anonymous',
        accessorId: req.user?.userId || 'system',
        resourceAccessed: endpoint,
        dataFields: resource.dataFields,
        purpose: extractPurpose(req),
        legalBasis: resource.legalBasis,
        consentGranted: await hasValidConsent(userId, 'government_access'),
        timestamp: new Date(),
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        sessionId: req.user?.sessionId || 'unknown',
        agencyType: determineAgencyType(accessorRole),
        agencyName: determineAgencyName(accessorRole),
        auditLevel: resource.sensitivityLevel === 'critical' ? 'critical' : 'high'
      });

      // Add response logging
      const originalSend = res.send;
      res.send = function(data) {
        // Log successful access
        if (res.statusCode < 400) {
          logSuccessfulAccess(accessContext, req.user, data);
        } else {
          logFailedAccess(accessContext, req.user, res.statusCode);
        }
        
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Government access logging failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint,
        userId: req.user?.userId,
        timestamp: new Date().toISOString()
      });

      // Continue with request even if logging fails
      next();
    }
  };
};

async function logGovernmentAccess(accessLog: Omit<GovernmentAccessLog, 'id'>): Promise<void> {
  const logEntry: GovernmentAccessLog = {
    id: generateAccessLogId(),
    ...accessLog
  };

  // Log to application logger
  logger.warn('Government resource access', {
    type: 'GOVERNMENT_ACCESS',
    ...logEntry,
    compliance: 'AUDIT_REQUIRED'
  });

  // Save to audit database (implement with your ORM)
  try {
    await saveAuditLog(logEntry);
  } catch (error) {
    logger.error('Failed to save government access audit log', {
      error: error instanceof Error ? error.message : 'Unknown error',
      accessLogId: logEntry.id
    });
  }

  // Send to external audit system if configured
  if (process.env.EXTERNAL_AUDIT_ENDPOINT) {
    try {
      await sendToExternalAudit(logEntry);
    } catch (error) {
      logger.error('Failed to send to external audit system', {
        error: error instanceof Error ? error.message : 'Unknown error',
        accessLogId: logEntry.id
      });
    }
  }

  // Real-time monitoring for critical access
  if (logEntry.auditLevel === 'critical') {
    await sendCriticalAccessAlert(logEntry);
  }
}

function isGovernmentAccessor(user: any): boolean {
  if (!user || !user.roles) return false;
  
  const governmentRoles = [
    'government_partner',
    'case_worker',
    'legal_aid',
    'emergency_responder',
    'system_admin'
  ];
  
  return user.roles.some((role: string) => governmentRoles.includes(role));
}

function determineAgencyType(role: string): 'federal' | 'state' | 'local' | 'partner' {
  const roleMapping: Record<string, 'federal' | 'state' | 'local' | 'partner'> = {
    'government_partner': 'federal',
    'case_worker': 'local',
    'legal_aid': 'local', 
    'emergency_responder': 'local',
    'system_admin': 'partner'
  };
  
  return roleMapping[role] || 'partner';
}

function determineAgencyName(role: string): string {
  const agencyMapping: Record<string, string> = {
    'government_partner': 'Federal Agency Partner',
    'case_worker': 'Local Social Services',
    'legal_aid': 'Legal Aid Organization',
    'emergency_responder': 'Emergency Services',
    'system_admin': 'CareConnect System'
  };
  
  return agencyMapping[role] || 'Unknown Agency';
}

function extractPurpose(req: Request): string {
  // Extract purpose from request headers, query params, or body
  const purpose = 
    req.headers['x-access-purpose'] as string ||
    req.query.purpose as string ||
    req.body?.purpose ||
    'Service coordination and eligibility verification';
    
  return purpose;
}

async function hasValidConsent(userId: string, consentType: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    // Check user consent (implement with your consent system)
    // const consent = await prisma.userConsent.findFirst({
    //   where: {
    //     userId,
    //     consentType,
    //     granted: true
    //   }
    // });
    // return !!consent;
    
    // Mock implementation - replace with actual consent check
    return true;
  } catch (error) {
    logger.error('Failed to check consent', { userId, consentType, error });
    return false;
  }
}

function generateAccessLogId(): string {
  return `gov-access-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function saveAuditLog(logEntry: GovernmentAccessLog): Promise<void> {
  // Implement database save with your ORM
  // Example with Prisma:
  // await prisma.governmentAccessLog.create({
  //   data: logEntry
  // });
  
  logger.info('Government access audit log saved', { 
    id: logEntry.id,
    resource: logEntry.resourceAccessed 
  });
}

async function sendToExternalAudit(logEntry: GovernmentAccessLog): Promise<void> {
  const auditEndpoint = process.env.EXTERNAL_AUDIT_ENDPOINT;
  const auditKey = process.env.EXTERNAL_AUDIT_KEY;
  
  if (!auditEndpoint || !auditKey) return;

  try {
    const response = await fetch(auditEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auditKey}`,
        'X-Audit-Source': 'careconnect-api'
      },
      body: JSON.stringify({
        ...logEntry,
        source: 'careconnect',
        version: '1.0'
      })
    });

    if (!response.ok) {
      throw new Error(`External audit API returned ${response.status}`);
    }

    logger.info('Government access log sent to external audit', { 
      id: logEntry.id,
      status: response.status 
    });
  } catch (error) {
    throw error;
  }
}

async function sendCriticalAccessAlert(logEntry: GovernmentAccessLog): Promise<void> {
  const alertData = {
    type: 'CRITICAL_GOVERNMENT_ACCESS',
    severity: 'HIGH',
    message: `Critical government resource access: ${logEntry.resourceAccessed}`,
    userId: logEntry.userId,
    accessorId: logEntry.accessorId,
    agency: logEntry.agencyName,
    timestamp: logEntry.timestamp,
    dataFields: logEntry.dataFields
  };

  // Send to monitoring system
  logger.error('CRITICAL GOVERNMENT ACCESS ALERT', alertData);

  // Send to Slack/Teams if configured
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 CRITICAL: Government access to sensitive data`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Resource', value: logEntry.resourceAccessed, short: true },
              { title: 'Agency', value: logEntry.agencyName, short: true },
              { title: 'User ID', value: logEntry.userId, short: true },
              { title: 'Data Fields', value: logEntry.dataFields.join(', '), short: false },
              { title: 'Time', value: logEntry.timestamp.toISOString(), short: true }
            ]
          }]
        })
      });
    } catch (error) {
      logger.error('Failed to send Slack alert', { error });
    }
  }
}

function logSuccessfulAccess(context: AccessContext, user: any, responseData: any): void {
  logger.info('Government resource access completed', {
    type: 'GOVERNMENT_ACCESS_SUCCESS',
    endpoint: context.endpoint,
    method: context.method,
    userId: user?.userId,
    dataAccessed: context.dataAccessed,
    sensitivityLevel: context.sensitivityLevel,
    responseSize: typeof responseData === 'string' ? responseData.length : JSON.stringify(responseData).length,
    timestamp: new Date().toISOString()
  });
}

function logFailedAccess(context: AccessContext, user: any, statusCode: number): void {
  logger.warn('Government resource access failed', {
    type: 'GOVERNMENT_ACCESS_FAILURE',
    endpoint: context.endpoint,
    method: context.method,
    userId: user?.userId,
    statusCode,
    sensitivityLevel: context.sensitivityLevel,
    timestamp: new Date().toISOString()
  });
}

// Export government access report generator
export const generateGovernmentAccessReport = async (
  startDate: Date,
  endDate: Date,
  agencyType?: string
) => {
  try {
    // Query audit logs from database
    // const logs = await prisma.governmentAccessLog.findMany({
    //   where: {
    //     timestamp: {
    //       gte: startDate,
    //       lte: endDate
    //     },
    //     ...(agencyType && { agencyType })
    //   },
    //   orderBy: { timestamp: 'desc' }
    // });

    // Mock data for now
    const logs: GovernmentAccessLog[] = [];

    const report = {
      period: { start: startDate, end: endDate },
      totalAccesses: logs.length,
      byAgency: logs.reduce((acc, log) => {
        acc[log.agencyName] = (acc[log.agencyName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byResource: logs.reduce((acc, log) => {
        acc[log.resourceAccessed] = (acc[log.resourceAccessed] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      criticalAccesses: logs.filter(log => log.auditLevel === 'critical').length,
      unconsentedAccesses: logs.filter(log => !log.consentGranted).length,
      details: logs
    };

    return report;
  } catch (error) {
    logger.error('Failed to generate government access report', {
      error: error instanceof Error ? error.message : 'Unknown error',
      startDate,
      endDate,
      agencyType
    });
    throw error;
  }
};
