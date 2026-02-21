/**
 * Alerts Subsystem
 *
 * Handles operational alerts via email or webhook when critical issues occur.
 * Includes cooldown to prevent alert spam.
 */

// SMTP/email alerts archived — email transport removed

export type AlertMode = "none" | "email" | "webhook";

export interface AlertConfig {
  mode: AlertMode;
  emailTo?: string;
  webhookUrl?: string;
  failureThreshold: number;
  cooldownMinutes: number;
}

export interface AlertPayload {
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  failingServices?: string[];
  blockingReasons?: string[];
  recommendedFix?: string[];
  context?: Record<string, any>;
}

class AlertManager {
  private config: AlertConfig;
  private lastAlertTimes: Map<string, number> = new Map();
  private failureCounters: Map<string, number> = new Map();

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AlertConfig {
    return {
      mode: (process.env.ALERT_MODE || "none") as AlertMode,
      emailTo: process.env.OPS_ALERT_EMAIL_TO,
      webhookUrl: process.env.OPS_ALERT_WEBHOOK_URL,
      failureThreshold: parseInt(
        process.env.ALERT_FAILURE_THRESHOLD || "3",
        10,
      ),
      cooldownMinutes: parseInt(process.env.ALERT_COOLDOWN_MINUTES || "15", 10),
    };
  }

  public async sendAlert(
    alertKey: string,
    payload: AlertPayload,
  ): Promise<void> {
    // Check cooldown
    if (!this.canSendAlert(alertKey)) {
      console.log(`⏳ Alert suppressed (cooldown): ${alertKey}`);
      return;
    }

    // Update last alert time
    this.lastAlertTimes.set(alertKey, Date.now());

    // Send via configured channel
    switch (this.config.mode) {
      case "email":
        await this.sendEmailAlert(payload);
        break;
      case "webhook":
        await this.sendWebhookAlert(payload);
        break;
      case "none":
        console.log(
          `⚠️  Alert (suppressed, ALERT_MODE=none): ${payload.title}`,
        );
        break;
    }
  }

  private canSendAlert(alertKey: string): boolean {
    const lastAlert = this.lastAlertTimes.get(alertKey);
    if (!lastAlert) return true;

    const cooldownMs = this.config.cooldownMinutes * 60 * 1000;
    return Date.now() - lastAlert > cooldownMs;
  }

  public incrementFailureCounter(key: string): number {
    const current = this.failureCounters.get(key) || 0;
    const newCount = current + 1;
    this.failureCounters.set(key, newCount);
    return newCount;
  }

  public resetFailureCounter(key: string): void {
    this.failureCounters.delete(key);
  }

  public shouldTriggerAlert(key: string): boolean {
    const count = this.failureCounters.get(key) || 0;
    return count >= this.config.failureThreshold;
  }

  private async sendEmailAlert(payload: AlertPayload): Promise<void> {
    // Email alerts have been archived and disabled. If alerts are required,
    // configure ALERT_MODE=webhook and set OPS_ALERT_WEBHOOK_URL. This function
    // intentionally no-ops to avoid SMTP dependency.
    console.warn(
      "⚠️  sendEmailAlert called but SMTP support is archived. Enable webhook alerts instead.",
    );
  }

  private async sendWebhookAlert(payload: AlertPayload): Promise<void> {
    if (!this.config.webhookUrl) {
      console.error(
        "❌ Webhook alert configured but OPS_ALERT_WEBHOOK_URL not set",
      );
      return;
    }

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          source: "CareConnect Backend",
          environment: process.env.NODE_ENV || "development",
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with ${response.status}`);
      }

      console.log(`🔔 Alert sent to webhook: ${this.config.webhookUrl}`);
    } catch (error) {
      console.error("❌ Failed to send webhook alert:", error);
    }
  }

  private formatEmailBody(payload: AlertPayload): string {
    let body = `${payload.title}\n\n`;
    body += `Severity: ${payload.severity.toUpperCase()}\n`;
    body += `Timestamp: ${payload.timestamp}\n\n`;
    body += `Message:\n${payload.message}\n\n`;

    if (payload.failingServices?.length) {
      body += `Failing Services:\n`;
      payload.failingServices.forEach((s) => (body += `  • ${s}\n`));
      body += "\n";
    }

    if (payload.blockingReasons?.length) {
      body += `Blocking Reasons:\n`;
      payload.blockingReasons.forEach((r) => (body += `  • ${r}\n`));
      body += "\n";
    }

    if (payload.recommendedFix?.length) {
      body += `Recommended Fixes:\n`;
      payload.recommendedFix.forEach((f, i) => (body += `  ${i + 1}. ${f}\n`));
    }

    return body;
  }

  private formatEmailHtml(payload: AlertPayload): string {
    const severityColor = {
      critical: "#dc2626",
      warning: "#f59e0b",
      info: "#3b82f6",
    }[payload.severity];

    return `
      <div style="font-family: system-ui, sans-serif; max-width: 600px;">
        <div style="background: ${severityColor}; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">${payload.title}</h2>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Severity: ${payload.severity.toUpperCase()}</p>
        </div>
        <div style="border: 1px solid #e5e7eb; padding: 24px; border-radius: 0 0 8px 8px;">
          <p><strong>Timestamp:</strong> ${payload.timestamp}</p>
          <p>${payload.message}</p>
          
          ${
            payload.failingServices?.length
              ? `
            <h3 style="color: #374151; margin-top: 24px;">Failing Services</h3>
            <ul style="color: #6b7280;">
              ${payload.failingServices.map((s) => `<li>${s}</li>`).join("")}
            </ul>
          `
              : ""
          }
          
          ${
            payload.blockingReasons?.length
              ? `
            <h3 style="color: #374151; margin-top: 24px;">Blocking Reasons</h3>
            <ul style="color: #6b7280;">
              ${payload.blockingReasons.map((r) => `<li>${r}</li>`).join("")}
            </ul>
          `
              : ""
          }
          
          ${
            payload.recommendedFix?.length
              ? `
            <h3 style="color: #374151; margin-top: 24px;">Recommended Fixes</h3>
            <ol style="color: #6b7280;">
              ${payload.recommendedFix.map((f) => `<li>${f}</li>`).join("")}
            </ol>
          `
              : ""
          }
        </div>
        <div style="margin-top: 16px; padding: 12px; background: #f3f4f6; border-radius: 8px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">CareConnect Backend • ${process.env.NODE_ENV || "development"}</p>
        </div>
      </div>
    `;
  }

  public getConfig(): AlertConfig {
    return this.config;
  }
}

// Singleton instance
export const alertManager = new AlertManager();
