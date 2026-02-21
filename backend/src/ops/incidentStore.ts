/**
 * Incident Management System
 * Handles service outages and health issues with persistent storage
 */

import fs from "fs";
import path from "path";

export interface Incident {
  id: string;
  service: "openai" | "stripe" | "prisma" | "cloudflare" | "tunnel" | "speech";
  severity: "info" | "warn" | "critical";
  status: "open" | "investigating" | "resolved";
  firstSeenAt: Date;
  lastSeenAt: Date;
  resolvedAt?: Date;
  summary: string;
  details: string;
  lastCheckPayload?: any;
  recommendation?: string;
}

export interface CreateIncidentInput {
  service: Incident["service"];
  severity: Incident["severity"];
  summary: string;
  details: string;
  lastCheckPayload?: any;
  recommendation?: string;
}

class IncidentStore {
  private storageDir = path.join(process.cwd(), "backend", "storage", "ops");
  private filePath = path.join(this.storageDir, "incidents.json");
  private incidents: Map<string, Incident> = new Map();

  constructor() {
    this.ensureStorageDir();
    this.loadFromFile();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  private generateId(): string {
    return `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(data);

        // Convert dates back from strings
        Object.entries(parsed).forEach(([id, incident]: [string, any]) => {
          this.incidents.set(id, {
            ...incident,
            firstSeenAt: new Date(incident.firstSeenAt),
            lastSeenAt: new Date(incident.lastSeenAt),
            resolvedAt: incident.resolvedAt
              ? new Date(incident.resolvedAt)
              : undefined,
          });
        });
      }
    } catch (error) {
      console.warn("Failed to load incidents from file:", error);
      this.incidents.clear();
    }
  }

  private saveToFile(): void {
    try {
      const serializable = Object.fromEntries(this.incidents.entries());
      fs.writeFileSync(this.filePath, JSON.stringify(serializable, null, 2));
    } catch (error) {
      console.error("Failed to save incidents to file:", error);
    }
  }

  async createIncident(input: CreateIncidentInput): Promise<Incident> {
    const id = this.generateId();
    const now = new Date();

    const incident: Incident = {
      id,
      service: input.service,
      severity: input.severity,
      status: "open",
      firstSeenAt: now,
      lastSeenAt: now,
      summary: input.summary,
      details: input.details,
      lastCheckPayload: input.lastCheckPayload,
      recommendation: input.recommendation,
    };

    this.incidents.set(id, incident);
    this.saveToFile();

    console.warn(
      `🚨 New ${incident.severity} incident: ${incident.summary} (${id})`,
    );

    return incident;
  }

  async updateIncident(
    id: string,
    lastCheckPayload?: any,
  ): Promise<Incident | null> {
    const incident = this.incidents.get(id);
    if (!incident) return null;

    incident.lastSeenAt = new Date();
    if (lastCheckPayload !== undefined) {
      incident.lastCheckPayload = lastCheckPayload;
    }

    this.incidents.set(id, incident);
    this.saveToFile();

    return incident;
  }

  async resolveIncident(id: string): Promise<Incident | null> {
    const incident = this.incidents.get(id);
    if (!incident) return null;

    incident.status = "resolved";
    incident.resolvedAt = new Date();

    this.incidents.set(id, incident);
    this.saveToFile();

    console.log(`✅ Resolved incident: ${incident.summary} (${id})`);

    return incident;
  }

  async findOpenIncident(
    service: string,
    summary: string,
  ): Promise<Incident | null> {
    for (const incident of this.incidents.values()) {
      if (
        incident.service === service &&
        incident.status === "open" &&
        incident.summary === summary
      ) {
        return incident;
      }
    }
    return null;
  }

  async getIncidents(status?: Incident["status"]): Promise<Incident[]> {
    const incidents = Array.from(this.incidents.values());

    if (status) {
      return incidents.filter((inc) => inc.status === status);
    }

    return incidents.sort(
      (a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime(),
    );
  }

  async getIncidentsByService(service: string): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .filter((inc) => inc.service === service)
      .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
  }

  async getOpenIncidents(): Promise<Incident[]> {
    return this.getIncidents("open");
  }
}

// Singleton instance
export const incidentStore = new IncidentStore();

// Helper functions
export async function createOrUpdateIncident(
  service: Incident["service"],
  severity: Incident["severity"],
  summary: string,
  details: string,
  lastCheckPayload?: any,
  recommendation?: string,
): Promise<Incident> {
  // Check if we already have an open incident for this issue
  const existingIncident = await incidentStore.findOpenIncident(
    service,
    summary,
  );

  if (existingIncident) {
    // Update existing incident
    return (
      (await incidentStore.updateIncident(
        existingIncident.id,
        lastCheckPayload,
      )) || existingIncident
    );
  } else {
    // Create new incident
    return await incidentStore.createIncident({
      service,
      severity,
      summary,
      details,
      lastCheckPayload,
      recommendation,
    });
  }
}

export async function resolveIncidentsByService(
  service: string,
): Promise<void> {
  const incidents = await incidentStore.getIncidentsByService(service);

  for (const incident of incidents) {
    if (incident.status === "open") {
      await incidentStore.resolveIncident(incident.id);
    }
  }
}
