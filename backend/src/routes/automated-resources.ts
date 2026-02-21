import express from "express";
import { resourceIngestionEngine } from "../ingestion/resource-ingestion";
import { resourceClassifier } from "../ai/resource-classifier";
import { geolocationMapper } from "../geolocation/geocode-mapper";
import { resourceRanking, WeightingProfile } from "../ranking/resource-ranking";
import { resourceRefreshScheduler } from "../scheduler/resource-refresh-cron";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import { PrismaClient } from "@prisma/client";
import logger from "../config/logger";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/automated-resources/discovery/status
// Get overall system status and statistics
router.get("/status", authenticate, async (req, res) => {
  try {
    // Get pipeline statistics
    const rawCount = await prisma.rawResourceRecord.count();
    const classifiedCount = await prisma.classifiedResource.count();
    const geocodedCount = await prisma.geocodedResource.count();
    const rankedCount = await prisma.rankedResource.count();

    // Get recent activity
    const recentRaw = await prisma.rawResourceRecord.count({
      where: {
        extractedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get job status
    const jobStatus = await resourceRefreshScheduler.getJobStatus();

    // Calculate pipeline efficiency
    const pipelineStats = {
      totalSources: 20, // From configured data sources
      rawRecords: rawCount,
      classificationRate:
        rawCount > 0 ? ((classifiedCount / rawCount) * 100).toFixed(1) : "0",
      geocodingRate:
        classifiedCount > 0
          ? ((geocodedCount / classifiedCount) * 100).toFixed(1)
          : "0",
      rankingRate:
        geocodedCount > 0
          ? ((rankedCount / geocodedCount) * 100).toFixed(1)
          : "0",
      overallCompletionRate:
        rawCount > 0 ? ((rankedCount / rawCount) * 100).toFixed(1) : "0",
      recentActivity: recentRaw,
    };

    res.json({
      success: true,
      system: {
        status: "operational",
        version: "2.0",
        lastUpdate: new Date(),
      },
      pipeline: pipelineStats,
      scheduler: {
        activeJobs: jobStatus.activeJobs,
        nextRun: "02:00 AM PST (Daily)",
        lastRun: jobStatus.recentResults[0]?.endTime || null,
      },
      dataQuality: {
        totalResources: rankedCount,
        highQualityResources: await prisma.rankedResource.count({
          where: { overallScore: { gte: 80 } },
        }),
        criticalServices: await prisma.rankedResource.count({
          where: { priorityLevel: "critical" },
        }),
        emergencyServices: await prisma.classifiedResource.count({
          where: { category: "crisis_emergency" },
        }),
      },
    });
  } catch (error) {
    logger.error("Failed to get discovery status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve system status",
    });
  }
});

// POST /api/automated-resources/discovery/refresh
// Manually trigger data refresh
router.post(
  "/refresh",
  authenticate,
  authorize(["admin", "data_manager"]),
  async (req, res) => {
    try {
      const { type = "incremental", sources = [], limit = 100 } = req.body;

      let result;

      switch (type) {
        case "full":
          logger.info("Starting manual full data refresh");
          result =
            await resourceRefreshScheduler.executeJobManually(
              "full_data_refresh",
            );
          break;

        case "ingestion":
          logger.info("Starting manual data ingestion");
          if (sources.length > 0) {
            // Refresh specific sources
            const results = [];
            for (const source of sources) {
              const sourceResult =
                await resourceIngestionEngine.ingestFromSource(source, limit);
              results.push(sourceResult);
            }
            result = {
              success: true,
              recordsProcessed: results.reduce(
                (sum, r) => sum + r.newRecords,
                0,
              ),
              sources: results.length,
            };
          } else {
            result =
              await resourceRefreshScheduler.executeJobManually(
                "data_ingestion",
              );
          }
          break;

        case "classification":
          logger.info("Starting manual classification");
          const classified = await resourceClassifier.classifyRawRecords(limit);
          result = { success: true, recordsProcessed: classified.length };
          break;

        case "geocoding":
          logger.info("Starting manual geocoding");
          const geocoded =
            await geolocationMapper.geocodeUnmappedResources(limit);
          result = { success: true, recordsProcessed: geocoded.length };
          break;

        case "ranking":
          logger.info("Starting manual ranking");
          const ranked = await resourceRanking.rankUnrankedResources(limit);
          result = { success: true, recordsProcessed: ranked.length };
          break;

        default:
          return res.status(400).json({
            success: false,
            error:
              "Invalid refresh type. Use: full, ingestion, classification, geocoding, or ranking",
          });
      }

      res.json({
        success: true,
        message: `${type} refresh completed successfully`,
        result: {
          recordsProcessed: result.recordsProcessed || result.recordsProcessed,
          duration: result.duration || null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error("Manual refresh failed:", error);
      res.status(500).json({
        success: false,
        error: "Refresh operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// GET /api/automated-resources/discovery/sources
// Get configured data sources and their status
router.get("/sources", authenticate, async (req, res) => {
  try {
    const sources = resourceIngestionEngine.getDataSources();

    // Get ingestion statistics for each source
    const sourceStats = await Promise.all(
      sources.map(async (source) => {
        const recentRecords = await prisma.rawResourceRecord.count({
          where: {
            dataSource: source.name,
            extractedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        });

        const totalRecords = await prisma.rawResourceRecord.count({
          where: { dataSource: source.name },
        });

        const lastUpdate = await prisma.rawResourceRecord.findFirst({
          where: { dataSource: source.name },
          orderBy: { extractedAt: "desc" },
          select: { extractedAt: true },
        });

        return {
          ...source,
          statistics: {
            totalRecords,
            recentRecords,
            lastUpdate: lastUpdate?.extractedAt || null,
            status: recentRecords > 0 ? "active" : "inactive",
          },
        };
      }),
    );

    res.json({
      success: true,
      sources: sourceStats,
      summary: {
        totalSources: sources.length,
        activeSources: sourceStats.filter(
          (s) => s.statistics.status === "active",
        ).length,
        totalRecords: sourceStats.reduce(
          (sum, s) => sum + s.statistics.totalRecords,
          0,
        ),
      },
    });
  } catch (error) {
    logger.error("Failed to get data sources:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve data sources",
    });
  }
});

// GET /api/automated-resources/discovery/pipeline
// Get detailed pipeline statistics
router.get("/pipeline", authenticate, async (req, res) => {
  try {
    // Get classification statistics
    const classificationStats =
      await resourceClassifier.getClassificationStats();

    // Get geocoding statistics
    const geocodingStats = await geolocationMapper.getGeocodingStats();

    // Get ranking statistics
    const rankingStats = await resourceRanking.getRankingStats();

    // Get recent job results
    const jobStatus = await resourceRefreshScheduler.getJobStatus();

    res.json({
      success: true,
      pipeline: {
        classification: {
          totalClassified: classificationStats.totalClassified,
          recentlyClassified: classificationStats.recentlyClassified,
          averageConfidence: classificationStats.averageConfidence,
          categoryDistribution: classificationStats.categoryDistribution,
        },
        geocoding: {
          totalGeocoded: geocodingStats.totalGeocoded,
          recentlyGeocoded: geocodingStats.recentlyGeocoded,
          qualityDistribution: geocodingStats.qualityDistribution,
          providerDistribution: geocodingStats.providerDistribution,
        },
        ranking: {
          totalRanked: rankingStats.totalRanked,
          recentlyRanked: rankingStats.recentlyRanked,
          scoreDistribution: rankingStats.scoreDistribution,
          priorityDistribution: rankingStats.priorityDistribution,
        },
      },
      scheduler: {
        recentJobs: jobStatus.recentResults.slice(-10),
        pipelineHealth: jobStatus.pipelineHealth,
      },
    });
  } catch (error) {
    logger.error("Failed to get pipeline statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve pipeline statistics",
    });
  }
});

// GET /api/automated-resources/search
// Search for resources using the automated discovery system
router.get("/search", authenticate, async (req, res) => {
  try {
    const {
      category,
      location,
      radius = 10000, // 10km default
      targetGroups,
      priority,
      limit = 50,
      offset = 0,
      sortBy = "score",
    } = req.query;

    // Build search query
    let whereClause: any = {};

    if (category) {
      whereClause["geocodedResource.classifiedResource.category"] = category;
    }

    if (targetGroups) {
      const groups = Array.isArray(targetGroups)
        ? targetGroups
        : [targetGroups];
      whereClause["geocodedResource.classifiedResource.targetGroups"] = {
        hasSome: groups,
      };
    }

    if (priority) {
      whereClause.priorityLevel = priority;
    }

    // Location-based search
    if (location) {
      const [lat, lng] = location.split(",").map(Number);
      if (lat && lng) {
        // Use Haversine formula to filter by radius
        // Note: This is a simplified approach. For production, consider using PostGIS
        const latRange = radius / 111000; // Rough lat degree conversion
        const lngRange = radius / (111000 * Math.cos((lat * Math.PI) / 180));

        whereClause["geocodedResource.latitude"] = {
          gte: lat - latRange,
          lte: lat + latRange,
        };
        whereClause["geocodedResource.longitude"] = {
          gte: lng - lngRange,
          lte: lng + lngRange,
        };
      }
    }

    // Define sort order
    let orderBy: any = {};
    switch (sortBy) {
      case "score":
        orderBy = { overallScore: "desc" };
        break;
      case "distance":
        orderBy = { proximityScore: "desc" };
        break;
      case "updated":
        orderBy = { updatedAt: "desc" };
        break;
      default:
        orderBy = { overallScore: "desc" };
    }

    // Execute search
    const results = await prisma.rankedResource.findMany({
      where: whereClause,
      include: {
        geocodedResource: {
          include: {
            classifiedResource: {
              select: {
                name: true,
                category: true,
                subcategory: true,
                description: true,
                phone: true,
                email: true,
                website: true,
                hours: true,
                targetGroups: true,
                services: true,
                confidenceScore: true,
              },
            },
          },
        },
      },
      orderBy,
      take: Math.min(Number(limit), 100), // Cap at 100 results
      skip: Number(offset),
    });

    // Calculate distances if location provided
    if (location) {
      const [userLat, userLng] = location.split(",").map(Number);
      results.forEach((result: any) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          result.geocodedResource.latitude,
          result.geocodedResource.longitude,
        );
        result.distanceMeters = Math.round(distance);
      });
    }

    // Format response
    const formattedResults = results.map((result: any) => ({
      id: result.id,
      name: result.geocodedResource.classifiedResource.name,
      category: result.geocodedResource.classifiedResource.category,
      subcategory: result.geocodedResource.classifiedResource.subcategory,
      description: result.geocodedResource.classifiedResource.description,
      address: result.geocodedResource.formattedAddress,
      coordinates: {
        latitude: result.geocodedResource.latitude,
        longitude: result.geocodedResource.longitude,
      },
      contact: {
        phone: result.geocodedResource.classifiedResource.phone,
        email: result.geocodedResource.classifiedResource.email,
        website: result.geocodedResource.classifiedResource.website,
      },
      hours: result.geocodedResource.classifiedResource.hours,
      services: result.geocodedResource.classifiedResource.services,
      targetGroups: result.geocodedResource.classifiedResource.targetGroups,
      scores: {
        overall: result.overallScore,
        availability: result.availabilityScore,
        accessibility: result.accessibilityScore,
        quality: result.qualityScore,
        proximity: result.proximityScore,
      },
      priority: result.priorityLevel,
      distance: result.distanceMeters || null,
      serviceRadius: result.geocodedResource.serviceRadius,
      lastUpdated: result.updatedAt,
    }));

    res.json({
      success: true,
      results: formattedResults,
      metadata: {
        total: results.length,
        limit: Number(limit),
        offset: Number(offset),
        searchCriteria: {
          category,
          location,
          radius: Number(radius),
          targetGroups,
          priority,
          sortBy,
        },
      },
    });
  } catch (error) {
    logger.error("Resource search failed:", error);
    res.status(500).json({
      success: false,
      error: "Search operation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/automated-resources/categories
// Get available resource categories and statistics
router.get("/categories", authenticate, async (req, res) => {
  try {
    const categoryStats = await prisma.classifiedResource.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const categories = await Promise.all(
      categoryStats.map(async (stat) => {
        // Get high-priority count for this category
        const highPriorityCount = await prisma.rankedResource.count({
          where: {
            "geocodedResource.classifiedResource.category": stat.category,
            priorityLevel: { in: ["critical", "high"] },
          },
        });

        // Get average score for this category
        const avgScore = await prisma.rankedResource.aggregate({
          where: {
            "geocodedResource.classifiedResource.category": stat.category,
          },
          _avg: { overallScore: true },
        });

        return {
          category: stat.category,
          totalResources: stat._count.id,
          highPriorityResources: highPriorityCount,
          averageScore: Math.round(avgScore._avg.overallScore || 0),
          displayName: formatCategoryName(stat.category),
        };
      }),
    );

    res.json({
      success: true,
      categories: categories.sort(
        (a, b) => b.totalResources - a.totalResources,
      ),
      summary: {
        totalCategories: categories.length,
        totalResources: categoryStats.reduce(
          (sum, stat) => sum + stat._count.id,
          0,
        ),
      },
    });
  } catch (error) {
    logger.error("Failed to get categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve categories",
    });
  }
});

// POST /api/automated-resources/quality-improvement
// Trigger quality improvement processes
router.post(
  "/quality-improvement",
  authenticate,
  authorize(["admin", "data_manager"]),
  async (req, res) => {
    try {
      const { type = "all", threshold = 70 } = req.body;

      let results: any = {};

      if (type === "all" || type === "classification") {
        logger.info("Starting classification quality improvement");
        await resourceClassifier.reclassifyLowConfidenceResources(threshold);
        results.classification = "completed";
      }

      if (type === "all" || type === "geocoding") {
        logger.info("Starting geocoding quality improvement");
        await geolocationMapper.improveGeocodingQuality();
        results.geocoding = "completed";
      }

      if (type === "all" || type === "ranking") {
        logger.info("Starting ranking quality improvement");
        await resourceRanking.reRankResources(threshold);
        results.ranking = "completed";
      }

      res.json({
        success: true,
        message: "Quality improvement process completed",
        results,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("Quality improvement failed:", error);
      res.status(500).json({
        success: false,
        error: "Quality improvement failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// Helper functions
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatCategoryName(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default router;
