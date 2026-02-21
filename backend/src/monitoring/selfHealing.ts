import { prisma } from "../utils/database";
import { alertManager } from "./alertManager";
import { metricsCollector } from "./metricsCollector";

/**
 * Self-healing utilities for automatic recovery
 */
export class SelfHealing {
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectBackoffMs: number = 2000;

  /**
   * Attempt to reconnect to database with exponential backoff
   */
  public async reconnectDatabase(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max database reconnection attempts reached");

      // Send alert when max attempts reached
      await alertManager.alertDbReconnectExceeded(
        this.reconnectAttempts,
        this.maxReconnectAttempts,
      );

      return false;
    }

    this.reconnectAttempts++;
    metricsCollector.incrementDbReconnectAttempts();

    const backoffTime =
      this.reconnectBackoffMs * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 Attempting database reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    );

    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log("✅ Database reconnected successfully");

      this.reconnectAttempts = 0; // Reset on success
      metricsCollector.resetDbReconnectAttempts();

      return true;
    } catch (error) {
      console.error(`❌ Database reconnection failed: ${error}`);

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`⏳ Retrying in ${backoffTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        return this.reconnectDatabase();
      }

      return false;
    }
  }

  /**
   * Monitor database connection and attempt recovery
   */
  public startDatabaseMonitoring(intervalMs: number = 60000): void {
    setInterval(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        console.warn("⚠️  Database connection lost, attempting recovery...");
        await this.reconnectDatabase();
      }
    }, intervalMs);
  }

  /**
   * Setup graceful shutdown handlers
   */
  public setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  Received ${signal}, starting graceful shutdown...`);

      try {
        // Close database connections safely
        if (prisma && typeof prisma.$disconnect === "function") {
          await prisma.$disconnect();
          console.log("✅ Database connections closed");
        } else {
          console.warn(
            "⚠️  Prisma client not available or $disconnect not a function",
          );
        }

        // Add other cleanup here (close Redis, queues, etc.)

        console.log("✅ Graceful shutdown complete");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  }

  /**
   * Handle uncaught errors gracefully
   */
  public setupErrorHandlers(): void {
    process.on("uncaughtException", (error: Error) => {
      console.error("💥 Uncaught Exception:", error);
      console.error(error.stack);

      // Log to file/monitoring service here

      // Exit to allow supervisor to restart
      console.error("🔄 Exiting for supervisor restart...");
      process.exit(1);
    });

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.error("💥 Unhandled Rejection at:", promise);
      console.error("Reason:", reason);

      // Log to file/monitoring service here

      // For unhandled rejections, we may not want to exit immediately
      // but we should log it prominently
    });
  }
}

// Singleton instance
export const selfHealing = new SelfHealing();
