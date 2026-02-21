/**
 * Incident Ticket System
 * Stores operational incidents with fallback to local file when DB unavailable
 * SECURITY: Sanitizes all stored data, no secrets logged
 */

import path from "path";
import fs from "fs/promises";

export type ServiceName =
  | "openai"
  | "stripe"
  | "prisma"
  | "cloudflare"
  | "tunnel"
  | "speech";
export type Severity = "info" | "warn" | "critical";
export type TicketStatus = "open" | "investigating" | "resolved";

export interface Incident {
  id: string;
  service: ServiceName;
  severity: Severity;
  status: TicketStatus;
  firstSeenAt: Date;
  lastSeenAt: Date;
  resolvedAt?: Date;
  summary: string;
  details: string;
  lastCheckPayload?: any; // sanitized
  recommendation: string;
}

export interface CreateIncidentInput {
  service: ServiceName;
  severity: Severity;
  summary: string;
  details: string;
  lastCheckPayload?: any;
  recommendation: string;
}

/**
 * Sanitize check payload to remove secrets
 */
function sanitizePayload(payload: any): any {
  if (!payload) return null;

  const sanitized = { ...payload };

  // Remove or mask sensitive fields
  const sensitiveKeys = [
    "api_key",
    "token",
    "secret",
    "password",
    "auth",
    "authorization",
    "x-api-key",
    "stripe-signature",
    "webhook-secret",
  ];

  function sanitizeObject(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();

      if (sensitiveKeys.some((sensitive) => keyLower.includes(sensitive))) {
        result[key] =
          typeof value === "string" && value.length > 4
            ? "****" + value.slice(-4)
            : "****";
      } else if (typeof value === "object") {
        result[key] = sanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  return sanitizeObject(sanitized);
}

/**
 * Generate unique incident ID
 */
function generateIncidentId(): string {
  return `inc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * File-based incident storage (fallback when DB unavailable)
 */
class FileIncidentStore {
  private filePath: string;

  constructor() {
    this.filePath = path.join(
      process.cwd(),
      "backend",
      "storage",
      "ops",
      "incidents.json",
    );
  }

  private async ensureDirectory(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async readIncidents(): Promise<Incident[]> {
    try {
      await this.ensureDirectory();
      const data = await fs.readFile(this.filePath, "utf-8");
      const incidents = JSON.parse(data);

      // Convert date strings back to Date objects
      return incidents.map((incident: any) => ({
        ...incident,
        firstSeenAt: new Date(incident.firstSeenAt),
        lastSeenAt: new Date(incident.lastSeenAt),
        resolvedAt: incident.resolvedAt
          ? new Date(incident.resolvedAt)
          : undefined,
      }));
    } catch (error) {
      // File doesn't exist or is invalid - return empty array
      return [];
    }
  }

  private async writeIncidents(incidents: Incident[]): Promise<void> {
    await this.ensureDirectory();
    await fs.writeFile(this.filePath, JSON.stringify(incidents, null, 2));
  }

  async createIncident(input: CreateIncidentInput): Promise<Incident> {
    const incidents = await this.readIncidents();

    const incident: Incident = {
      id: generateIncidentId(),
      service: input.service,
      severity: input.severity,
      status: "open",
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      summary: input.summary,
      details: input.details,
      lastCheckPayload: sanitizePayload(input.lastCheckPayload),
      recommendation: input.recommendation,
    };

    incidents.push(incident);
    await this.writeIncidents(incidents);

    console.log(
      `[INCIDENTS] Created ${incident.severity} incident for ${incident.service}: ${incident.summary}`,
    );
    return incident;
  }

  async updateIncident(
    incidentId: string,
    lastSeenAt?: Date,
  ): Promise<Incident | null> {
    const incidents = await this.readIncidents();
    const incident = incidents.find((i) => i.id === incidentId);

    if (!incident) return null;

    if (lastSeenAt) {
      incident.lastSeenAt = lastSeenAt;
      await this.writeIncidents(incidents);
    }

    return incident;
  }

  async resolveIncident(incidentId: string): Promise<Incident | null> {
    const incidents = await this.readIncidents();
    const incident = incidents.find((i) => i.id === incidentId);

    if (!incident) return null;

    incident.status = "resolved";
    incident.resolvedAt = new Date();
    await this.writeIncidents(incidents);

    console.log(
      `[INCIDENTS] Resolved incident ${incidentId} for ${incident.service}`,
    );
    return incident;
  }

  async getIncidents(status?: TicketStatus): Promise<Incident[]> {
    const incidents = await this.readIncidents();

    if (status) {
      return incidents.filter((i) => i.status === status);
    }

    return incidents;
  }

  async getActiveIncidentForService(
    service: ServiceName,
  ): Promise<Incident | null> {
    const incidents = await this.readIncidents();
    return (
      incidents.find((i) => i.service === service && i.status !== "resolved") ||
      null
    );
  }
}

/**
 * Database incident store (preferred when available)
 */
class DatabaseIncidentStore {
  private prisma: any;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  async createIncident(input: CreateIncidentInput): Promise<Incident> {
    const incident = await this.prisma.incident.create({
      data: {
        id: generateIncidentId(),
        service: input.service,
        severity: input.severity,
        status: "open",
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        summary: input.summary,
        details: input.details,
        lastCheckPayload: sanitizePayload(input.lastCheckPayload),
        recommendation: input.recommendation,
      },
    });

    console.log(
      `[INCIDENTS] Created ${incident.severity} incident for ${incident.service}: ${incident.summary}`,
    );
    return incident;
  }

  async updateIncident(
    incidentId: string,
    lastSeenAt?: Date,
  ): Promise<Incident | null> {
    try {
      const incident = await this.prisma.incident.update({
        where: { id: incidentId },
        data: lastSeenAt ? { lastSeenAt } : {},
      });
      return incident;
    } catch {
      return null;
    }
  }

  async resolveIncident(incidentId: string): Promise<Incident | null> {
    try {
      const incident = await this.prisma.incident.update({
        where: { id: incidentId },
        data: {
          status: "resolved",
          resolvedAt: new Date(),
        },
      });

      console.log(
        `[INCIDENTS] Resolved incident ${incidentId} for ${incident.service}`,
      );
      return incident;
    } catch {
      return null;
    }
  }

  async getIncidents(status?: TicketStatus): Promise<Incident[]> {
    const where = status ? { status } : {};
    return await this.prisma.incident.findMany({
      where,
      orderBy: { firstSeenAt: "desc" },
    });
  }

  async getActiveIncidentForService(
    service: ServiceName,
  ): Promise<Incident | null> {
    return await this.prisma.incident.findFirst({
      where: {
        service,
        status: { not: "resolved" },
      },
    });
  }
}

/**
 * Incident Manager - handles both database and file storage
 */
export class IncidentManager {
  private fileStore: FileIncidentStore;
  private dbStore?: DatabaseIncidentStore;
  private useDatabase: boolean = false;

  constructor(prisma?: any) {
    this.fileStore = new FileIncidentStore();

    if (prisma) {
      this.dbStore = new DatabaseIncidentStore(prisma);
      this.useDatabase = true;
    }
  }

  private getStore() {
    return this.useDatabase && this.dbStore ? this.dbStore : this.fileStore;
  }

  /**
   * Create or update existing incident for service
   */
  async reportIncident(input: CreateIncidentInput): Promise<Incident> {
    try {
      // Check if there's already an active incident for this service
      const existing = await this.getStore().getActiveIncidentForService(
        input.service,
      );

      if (existing) {
        // Update existing incident with new timestamp
        const updated = await this.getStore().updateIncident(
          existing.id,
          new Date(),
        );
        return updated || existing;
      } else {
        // Create new incident
        return await this.getStore().createIncident(input);
      }
    } catch (error) {
      console.error("[INCIDENTS] Error reporting incident:", error);
      // Fallback to file store if database fails
      if (this.useDatabase) {
        console.log("[INCIDENTS] Falling back to file storage");
        this.useDatabase = false;
        return await this.reportIncident(input);
      }
      throw error;
    }
  }

  async resolveIncident(incidentId: string): Promise<Incident | null> {
    try {
      return await this.getStore().resolveIncident(incidentId);
    } catch (error) {
      console.error("[INCIDENTS] Error resolving incident:", error);
      if (this.useDatabase) {
        this.useDatabase = false;
        return await this.resolveIncident(incidentId);
      }
      return null;
    }
  }

  async getIncidents(status?: TicketStatus): Promise<Incident[]> {
    try {
      return await this.getStore().getIncidents(status);
    } catch (error) {
      console.error("[INCIDENTS] Error getting incidents:", error);
      if (this.useDatabase) {
        this.useDatabase = false;
        return await this.getIncidents(status);
      }
      return [];
    }
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return await this.getIncidents("open");
  }

  /**
   * Auto-resolve incidents when service becomes healthy
   */
  async maybeResolveServiceIncident(service: ServiceName): Promise<void> {
    try {
      const activeIncident =
        await this.getStore().getActiveIncidentForService(service);
      if (activeIncident) {
        await this.resolveIncident(activeIncident.id);
      }
    } catch (error) {
      console.error(
        `[INCIDENTS] Error auto-resolving ${service} incident:`,
        error,
      );
    }
  }
}

// Global incident manager instance
let _incidentManager: IncidentManager;

export function getIncidentManager(prisma?: any): IncidentManager {
  if (!_incidentManager) {
    _incidentManager = new IncidentManager(prisma);
  }
  return _incidentManager;
}
