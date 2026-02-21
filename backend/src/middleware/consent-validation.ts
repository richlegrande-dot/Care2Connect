import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

interface ConsentRequirement {
  type: "privacy" | "data_sharing" | "government_access" | "pii_access";
  version: string;
  description: string;
  required: boolean;
}

interface ConsentRecord {
  userId: string;
  consentType: string;
  consentVersion: string;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  context?: any;
}

// Government resource endpoints requiring consent
const GOVERNMENT_RESOURCE_ENDPOINTS = new Set([
  "/api/healthcare/appointments",
  "/api/health/records",
  "/api/mental-health/sessions",
  "/api/housing/applications",
  "/api/benefits/snap/apply",
  "/api/benefits/wic/apply",
  "/api/legal/consultation",
  "/api/documents/verify",
  "/api/documents/id/request",
  "/api/financial/assistance/apply",
  "/api/emergency/request",
  "/api/ai/analyze-needs",
]);

// PII access endpoints requiring consent
const PII_ACCESS_ENDPOINTS = new Set([
  "/api/users/profile",
  "/api/health/records",
  "/api/health/medications",
  "/api/career/resume",
  "/api/legal/consultation",
  "/api/documents/upload",
  "/api/housing/applications",
  "/api/financial/assistance/apply",
]);

const CONSENT_REQUIREMENTS: Record<string, ConsentRequirement> = {
  privacy_policy: {
    type: "privacy",
    version: "2.0",
    description: "CareConnect Privacy Policy and Terms of Service",
    required: true,
  },

  data_sharing: {
    type: "data_sharing",
    version: "1.0",
    description:
      "Consent to share data with service providers and partner organizations",
    required: true,
  },

  government_access: {
    type: "government_access",
    version: "1.0",
    description:
      "Consent for government agencies to access your information for benefit verification and service coordination",
    required: true,
  },

  pii_access: {
    type: "pii_access",
    version: "1.0",
    description:
      "Consent to collect and process personally identifiable information",
    required: true,
  },

  health_data: {
    type: "pii_access",
    version: "1.0",
    description:
      "Consent to collect and process health-related information (HIPAA compliance)",
    required: true,
  },

  location_data: {
    type: "pii_access",
    version: "1.0",
    description:
      "Consent to access and process location information for service matching",
    required: false,
  },
};

export const validateConsent = (requiredConsents: string[] = []) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Skip consent validation for public endpoints
      if (!req.user) {
        return next();
      }

      const userId = req.user.userId;
      const endpoint = req.path;

      // Determine required consents based on endpoint
      const endpointConsents = determineRequiredConsents(
        endpoint,
        requiredConsents,
      );

      if (endpointConsents.length === 0) {
        return next();
      }

      // Check user's consent records
      const userConsents = await getUserConsents(userId);
      const missingConsents = [];
      const outdatedConsents = [];

      for (const consentType of endpointConsents) {
        const requirement = CONSENT_REQUIREMENTS[consentType];
        const userConsent = userConsents.find(
          (c) => c.consentType === consentType,
        );

        if (!userConsent || !userConsent.granted) {
          missingConsents.push({
            type: consentType,
            requirement: requirement,
          });
        } else if (userConsent.consentVersion !== requirement.version) {
          outdatedConsents.push({
            type: consentType,
            currentVersion: userConsent.consentVersion,
            requiredVersion: requirement.version,
            requirement: requirement,
          });
        }
      }

      // If consent is missing or outdated, return consent requirements
      if (missingConsents.length > 0 || outdatedConsents.length > 0) {
        return res.status(451).json({
          error: "Consent Required",
          code: "CONSENT_REQUIRED",
          message: "User consent is required to access this resource",
          requiredConsents: {
            missing: missingConsents,
            outdated: outdatedConsents,
          },
          consentUrl: `${process.env.FRONTEND_URL}/consent`,
          timestamp: new Date().toISOString(),
        });
      }

      // Log consent-gated access
      logger.info("Consent-gated access granted", {
        userId,
        endpoint,
        requiredConsents: endpointConsents,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString(),
      });

      next();
    } catch (error) {
      logger.error("Consent validation error", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user?.userId,
        endpoint: req.path,
        timestamp: new Date().toISOString(),
      });

      return res.status(500).json({
        error: "Consent Validation Error",
        code: "CONSENT_VALIDATION_ERROR",
        message: "Unable to validate user consent",
      });
    }
  };
};

function determineRequiredConsents(
  endpoint: string,
  explicitConsents: string[],
): string[] {
  const consents = new Set(explicitConsents);

  // Always require privacy policy consent for authenticated endpoints
  consents.add("privacy_policy");

  // Check if endpoint requires government access consent
  if (GOVERNMENT_RESOURCE_ENDPOINTS.has(endpoint)) {
    consents.add("government_access");
    consents.add("data_sharing");
  }

  // Check if endpoint requires PII access consent
  if (PII_ACCESS_ENDPOINTS.has(endpoint)) {
    consents.add("pii_access");
  }

  // Health-related endpoints
  if (endpoint.includes("/health") || endpoint.includes("/mental-health")) {
    consents.add("health_data");
  }

  // Location-based endpoints
  if (endpoint.includes("/nearby") || endpoint.includes("/search")) {
    consents.add("location_data");
  }

  return Array.from(consents);
}

async function getUserConsents(userId: string): Promise<ConsentRecord[]> {
  // This would typically query your database
  // For now, return mock data or implement with your ORM
  try {
    // Example with Prisma (adjust based on your setup)
    // const consents = await prisma.userConsent.findMany({
    //   where: { userId }
    // });
    // return consents;

    // Mock implementation - replace with actual database query
    return [];
  } catch (error) {
    logger.error("Failed to fetch user consents", { userId, error });
    return [];
  }
}

// Consent recording endpoint middleware
export const recordConsent = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { consentType, granted, version } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (!consentType || typeof granted !== "boolean") {
      return res.status(400).json({
        error: "Invalid consent data",
        code: "INVALID_CONSENT_DATA",
        message: "consentType and granted fields are required",
      });
    }

    const consentRecord: ConsentRecord = {
      userId,
      consentType,
      consentVersion:
        version || CONSENT_REQUIREMENTS[consentType]?.version || "1.0",
      granted,
      timestamp: new Date(),
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      context: {
        endpoint: req.path,
        method: req.method,
      },
    };

    // Save consent record to database
    await saveConsentRecord(consentRecord);

    // Log consent action
    logger.info("User consent recorded", {
      ...consentRecord,
      action: granted ? "granted" : "revoked",
    });

    res.status(200).json({
      message: "Consent recorded successfully",
      consentId: `${userId}-${consentType}-${Date.now()}`,
      timestamp: consentRecord.timestamp,
    });
  } catch (error) {
    logger.error("Failed to record consent", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
      body: req.body,
    });

    res.status(500).json({
      error: "Failed to record consent",
      code: "CONSENT_RECORD_ERROR",
    });
  }
};

async function saveConsentRecord(record: ConsentRecord): Promise<void> {
  // Implement database save logic here
  // Example with Prisma:
  // await prisma.userConsent.upsert({
  //   where: {
  //     userId_consentType: {
  //       userId: record.userId,
  //       consentType: record.consentType
  //     }
  //   },
  //   update: {
  //     granted: record.granted,
  //     consentVersion: record.consentVersion,
  //     timestamp: record.timestamp,
  //     ipAddress: record.ipAddress,
  //     userAgent: record.userAgent,
  //     context: record.context
  //   },
  //   create: record
  // });

  logger.info("Consent record saved", {
    userId: record.userId,
    type: record.consentType,
  });
}

// Consent withdrawal middleware
export const withdrawConsent = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { consentType } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    // Record consent withdrawal
    const withdrawalRecord: ConsentRecord = {
      userId,
      consentType,
      consentVersion: CONSENT_REQUIREMENTS[consentType]?.version || "1.0",
      granted: false,
      timestamp: new Date(),
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      context: {
        action: "withdrawal",
        endpoint: req.path,
      },
    };

    await saveConsentRecord(withdrawalRecord);

    logger.warn("User consent withdrawn", withdrawalRecord);

    res.status(200).json({
      message: "Consent withdrawn successfully",
      consentType,
      timestamp: withdrawalRecord.timestamp,
      impact: getConsentWithdrawalImpact(consentType),
    });
  } catch (error) {
    logger.error("Failed to withdraw consent", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
      consentType: req.params.consentType,
    });

    res.status(500).json({
      error: "Failed to withdraw consent",
    });
  }
};

function getConsentWithdrawalImpact(consentType: string): string[] {
  const impacts: Record<string, string[]> = {
    government_access: [
      "Government benefit applications will be disabled",
      "Housing assistance applications will be unavailable",
      "Healthcare coordination with government programs will be limited",
    ],
    pii_access: [
      "Profile information cannot be saved",
      "Document upload and storage will be disabled",
      "Personalized service matching will be limited",
    ],
    health_data: [
      "Health record access will be disabled",
      "Medical appointment scheduling will be unavailable",
      "Health-related service matching will be limited",
    ],
    location_data: [
      "Location-based service discovery will be disabled",
      "Nearby resource searches will be unavailable",
      "Emergency location services will be limited",
    ],
  };

  return impacts[consentType] || ["Some features may be limited"];
}

// Get user consent status
export const getConsentStatus = async (
  req: Request & { user?: any },
  res: Response,
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const userConsents = await getUserConsents(userId);

    const consentStatus = Object.entries(CONSENT_REQUIREMENTS).map(
      ([type, requirement]) => {
        const userConsent = userConsents.find((c) => c.consentType === type);

        return {
          type,
          requirement,
          granted: userConsent?.granted || false,
          version: userConsent?.consentVersion,
          isUpToDate: userConsent?.consentVersion === requirement.version,
          grantedAt: userConsent?.timestamp,
          required: requirement.required,
        };
      },
    );

    res.json({
      userId,
      consents: consentStatus,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to get consent status", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
    });

    res.status(500).json({
      error: "Failed to get consent status",
    });
  }
};
