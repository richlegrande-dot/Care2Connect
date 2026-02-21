/**
 * Database Diagnostics and Self-Heal Routes
 * Password-protected endpoints for database health monitoring and recovery
 */

import express, { Response } from "express";
import { requireAdminAuth, AdminAuthRequest } from "../../middleware/adminAuth";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
let prisma = new PrismaClient();

// All routes require admin authentication
router.use(requireAdminAuth);

/**
 * GET /admin/db/diagnostics
 * Get detailed database health diagnostics
 */
router.get("/diagnostics", async (req: AdminAuthRequest, res: Response) => {
  try {
    const startTime = Date.now();

    // Test basic connectivity
    let connectionStatus = "unknown";
    let connectionError = null;
    let queryTime = 0;

    try {
      const queryStart = Date.now();
      await prisma.$queryRaw`SELECT 1 as test`;
      queryTime = Date.now() - queryStart;
      connectionStatus = "healthy";
    } catch (error) {
      connectionStatus = "unhealthy";
      connectionError =
        error instanceof Error ? error.message : "Unknown error";
    }

    // Test table accessibility
    const tableChecks = [];
    const tables = [
      "KnowledgeSource",
      "KnowledgeChunk",
      "KnowledgeAuditLog",
      "RecordingTicket",
      "SupportTicket",
    ];

    for (const table of tables) {
      try {
        let count = 0;
        switch (table) {
          case "KnowledgeSource":
            count = await prisma.knowledgeSource.count();
            break;
          case "KnowledgeChunk":
            count = await prisma.knowledgeChunk.count();
            break;
          case "KnowledgeAuditLog":
            count = await prisma.knowledgeAuditLog.count();
            break;
          case "RecordingTicket":
            count = await prisma.recordingTicket.count();
            break;
          case "SupportTicket":
            count = await prisma.supportTicket.count();
            break;
        }
        tableChecks.push({ table, status: "ok", count });
      } catch (error) {
        tableChecks.push({
          table,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const totalTime = Date.now() - startTime;

    // Determine overall status
    const allTablesOk = tableChecks.every((check) => check.status === "ok");
    const overallStatus =
      connectionStatus === "healthy" && allTablesOk ? "healthy" : "unhealthy";

    // Generate recommendations
    const recommendations = [];
    if (connectionStatus === "unhealthy") {
      recommendations.push("Database connection failed - check DATABASE_URL");
      recommendations.push("Run self-heal to attempt reconnection");
    }
    if (!allTablesOk) {
      recommendations.push("Some tables are not accessible - check migrations");
      recommendations.push("Run: npx prisma migrate deploy");
    }
    if (queryTime > 1000) {
      recommendations.push(
        `Slow query response (${queryTime}ms) - check database performance`,
      );
    }
    if (overallStatus === "healthy") {
      recommendations.push("No action needed - all systems operational");
    }

    res.json({
      status: overallStatus,
      connection: {
        status: connectionStatus,
        queryTime,
        error: connectionError,
      },
      tables: tableChecks,
      diagnostics: {
        totalTime,
        timestamp: new Date().toISOString(),
      },
      recommendations,
    });
  } catch (error) {
    console.error("[DB Diagnostics] Error running diagnostics:", error);
    res.status(500).json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      recommendations: [
        "Critical error running diagnostics",
        "Check server logs for details",
        "Verify DATABASE_URL is correct",
      ],
    });
  }
});

/**
 * POST /admin/db/self-heal
 * Attempt to reconnect to database and verify health
 */
router.post("/self-heal", async (req: AdminAuthRequest, res: Response) => {
  try {
    console.log("[DB Self-Heal] Starting self-heal process...");
    const steps = [];

    // Step 1: Disconnect current client
    try {
      await prisma.$disconnect();
      console.log("[DB Self-Heal] ✅ Disconnected Prisma client");
      steps.push({ step: 1, action: "Disconnect", status: "success" });
    } catch (error) {
      console.error("[DB Self-Heal] ⚠️ Error disconnecting:", error);
      steps.push({
        step: 1,
        action: "Disconnect",
        status: "warning",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Step 2: Create new client
    try {
      prisma = new PrismaClient();
      console.log("[DB Self-Heal] ✅ Created new Prisma client");
      steps.push({ step: 2, action: "Create new client", status: "success" });
    } catch (error) {
      console.error("[DB Self-Heal] ❌ Error creating client:", error);
      steps.push({
        step: 2,
        action: "Create new client",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return res.status(500).json({
        success: false,
        steps,
        error: "Failed to create new Prisma client",
        recommendations: ["Check DATABASE_URL", "Verify Prisma schema"],
      });
    }

    // Step 3: Test connection
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log("[DB Self-Heal] ✅ Connection test passed");
      steps.push({ step: 3, action: "Test connection", status: "success" });
    } catch (error) {
      console.error("[DB Self-Heal] ❌ Connection test failed:", error);
      steps.push({
        step: 3,
        action: "Test connection",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return res.status(500).json({
        success: false,
        steps,
        error: "Database connection test failed",
        recommendations: [
          "Check database server is running",
          "Verify network connectivity",
          "Check DATABASE_URL credentials",
        ],
      });
    }

    // Step 4: Verify key tables exist
    const tableChecks = [];
    const criticalTables = [
      "KnowledgeSource",
      "KnowledgeChunk",
      "RecordingTicket",
    ];

    for (const table of criticalTables) {
      try {
        switch (table) {
          case "KnowledgeSource":
            await prisma.knowledgeSource.count();
            break;
          case "KnowledgeChunk":
            await prisma.knowledgeChunk.count();
            break;
          case "RecordingTicket":
            await prisma.recordingTicket.count();
            break;
        }
        tableChecks.push({ table, status: "ok" });
      } catch (error) {
        tableChecks.push({
          table,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const allTablesOk = tableChecks.every((check) => check.status === "ok");

    if (allTablesOk) {
      console.log("[DB Self-Heal] ✅ Table verification passed");
      steps.push({ step: 4, action: "Verify tables", status: "success" });
    } else {
      console.error("[DB Self-Heal] ⚠️ Some tables failed verification");
      steps.push({
        step: 4,
        action: "Verify tables",
        status: "warning",
        tableChecks,
      });
    }

    console.log("[DB Self-Heal] ✅ Self-heal completed successfully");

    res.json({
      success: true,
      message: "Self-heal completed successfully",
      steps,
      tableChecks,
      timestamp: new Date().toISOString(),
      recommendations: allTablesOk
        ? ["Database is healthy", "No further action needed"]
        : [
            "Some tables failed verification",
            "Run: npx prisma migrate deploy",
            "Check for pending migrations",
          ],
    });
  } catch (error) {
    console.error("[DB Self-Heal] ❌ Self-heal failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      recommendations: [
        "Self-heal process failed",
        "Check database connectivity manually",
        "Review server logs for details",
        "Consider restarting the server",
      ],
    });
  }
});

/**
 * GET /admin/db/connection-info
 * Get safe connection information (no credentials)
 */
router.get("/connection-info", async (req: AdminAuthRequest, res: Response) => {
  try {
    const databaseUrl = process.env.DATABASE_URL || "";

    // Parse URL safely without exposing credentials
    let host = "unknown";
    let database = "unknown";
    let port = "unknown";

    try {
      const url = new URL(databaseUrl);
      host = url.hostname;
      database = url.pathname.substring(1);
      port = url.port || "5432";
    } catch (error) {
      // Invalid URL format
    }

    res.json({
      host,
      port,
      database,
      schema: "public",
      prismaVersion: require("@prisma/client").version || "unknown",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DB Connection Info] Error getting connection info:", error);
    res.status(500).json({
      error: "Failed to get connection info",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
