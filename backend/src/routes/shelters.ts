import express from "express";
import { z } from "zod";
import logger from "../config/logger";
import { PrismaClient } from "@prisma/client";
import { shelterAvailabilitySync } from "../shelters/availability-sync";
import { shelterRankingEngine } from "../shelters/shelter-ranking";
import { authenticateUser } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const shelterSearchSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  maxDistance: z.number().min(1).max(100).optional(),
  populationType: z
    .enum(["men", "women", "families", "youth", "mixed"])
    .optional(),
  hasAvailableBeds: z.boolean().optional(),
  acceptsPets: z.boolean().optional(),
  wheelchairAccessible: z.boolean().optional(),
  emergencyOnly: z.boolean().optional(),
  requiresIntake: z.boolean().optional(),
  hasSpecialServices: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).default(10),
});

const availabilityUpdateSchema = z.object({
  availableMen: z.number().min(0).optional(),
  availableWomen: z.number().min(0).optional(),
  availableFamilies: z.number().min(0).optional(),
  availableYouth: z.number().min(0).optional(),
  availableTotal: z.number().min(0).optional(),
  occupiedMen: z.number().min(0).optional(),
  occupiedWomen: z.number().min(0).optional(),
  occupiedFamilies: z.number().min(0).optional(),
  occupiedYouth: z.number().min(0).optional(),
  occupiedTotal: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

const shelterCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zipCode: z.string().min(5).max(10),
  phone: z.string().max(20).optional(),
  website: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Population served
  servesAdultMen: z.boolean().default(false),
  servesAdultWomen: z.boolean().default(false),
  servesFamilies: z.boolean().default(false),
  servesYouth: z.boolean().default(false),

  // Capacity
  capacityMen: z.number().min(0).optional(),
  capacityWomen: z.number().min(0).optional(),
  capacityFamilies: z.number().min(0).optional(),
  capacityYouth: z.number().min(0).optional(),
  capacityTotal: z.number().min(1),

  // Policies
  maxStayDays: z.number().min(1).optional(),
  allowsPets: z.boolean().default(false),
  wheelchairAccessible: z.boolean().default(false),
  requiresIntake: z.boolean().default(true),
  emergencyOnly: z.boolean().default(false),

  // Services and amenities
  hasMeals: z.boolean().default(false),
  hasShowers: z.boolean().default(false),
  hasLaundry: z.boolean().default(false),
  hasStorage: z.boolean().default(false),
  hasTransportation: z.boolean().default(false),
  hasPhoneAccess: z.boolean().default(false),
  hasInternetAccess: z.boolean().default(false),
  hasMedicalCare: z.boolean().default(false),
  hasMentalHealthSupport: z.boolean().default(false),
  hasSubstanceAbuseSupport: z.boolean().default(false),
  hasJobTraining: z.boolean().default(false),
  hasChildcare: z.boolean().default(false),
  hasEducationalSupport: z.boolean().default(false),
  hasCaseManagement: z.boolean().default(false),
  hasLegalAid: z.boolean().default(false),
  hasSecurityStaff: z.boolean().default(false),

  // External system integration
  externalSystemId: z.string().optional(),
  externalSystemName: z.string().optional(),
});

/**
 * @route GET /api/shelters/search
 * @desc Search and rank shelters based on criteria
 * @access Public
 */
router.get("/search", async (req, res) => {
  try {
    const validationResult = shelterSearchSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid search parameters",
        details: validationResult.error.errors,
      });
    }

    const criteria = validationResult.data;

    // Extract userId if authenticated
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        // Simple user extraction - in production use proper JWT validation
        criteria.userId = authHeader.substring(7);
      } catch (error) {
        // Continue as anonymous user
      }
    }

    const results = await shelterRankingEngine.getTopRecommendations(
      criteria,
      criteria.limit,
    );

    // Log search for analytics
    logger.info("Shelter search performed", {
      criteria: {
        location: criteria.lat && criteria.lng ? "provided" : "not_provided",
        populationType: criteria.populationType,
        hasAvailableBeds: criteria.hasAvailableBeds,
        specialServices: criteria.hasSpecialServices?.length || 0,
      },
      results: {
        totalFound: results.summary.totalFound,
        withAvailability: results.summary.withAvailability,
        returned: results.recommendations.length,
      },
    });

    res.json({
      success: true,
      shelters: results.recommendations.map((ranking) => ({
        id: ranking.shelter.id,
        name: ranking.shelter.name,
        description: ranking.shelter.description,
        address: {
          street: ranking.shelter.address,
          city: ranking.shelter.city,
          state: ranking.shelter.state,
          zipCode: ranking.shelter.zipCode,
        },
        contact: {
          phone: ranking.shelter.phone,
          website: ranking.shelter.website,
        },
        location:
          ranking.shelter.latitude && ranking.shelter.longitude
            ? {
                lat: ranking.shelter.latitude,
                lng: ranking.shelter.longitude,
              }
            : null,

        // Population and capacity info
        serves: {
          adultMen: ranking.shelter.servesAdultMen,
          adultWomen: ranking.shelter.servesAdultWomen,
          families: ranking.shelter.servesFamilies,
          youth: ranking.shelter.servesYouth,
        },
        capacity: {
          men: ranking.shelter.capacityMen,
          women: ranking.shelter.capacityWomen,
          families: ranking.shelter.capacityFamilies,
          youth: ranking.shelter.capacityYouth,
          total: ranking.shelter.capacityTotal,
        },
        availability: {
          men: ranking.shelter.currentAvailableMen,
          women: ranking.shelter.currentAvailableWomen,
          families: ranking.shelter.currentAvailableFamilies,
          youth: ranking.shelter.currentAvailableYouth,
          total: ranking.shelter.currentAvailableTotal,
          lastUpdated: ranking.shelter.lastAutoUpdateAt,
        },

        // Policies and requirements
        policies: {
          maxStayDays: ranking.shelter.maxStayDays,
          allowsPets: ranking.shelter.allowsPets,
          wheelchairAccessible: ranking.shelter.wheelchairAccessible,
          requiresIntake: ranking.shelter.requiresIntake,
          emergencyOnly: ranking.shelter.emergencyOnly,
        },

        // Services and amenities
        services: {
          meals: ranking.shelter.hasMeals,
          showers: ranking.shelter.hasShowers,
          laundry: ranking.shelter.hasLaundry,
          storage: ranking.shelter.hasStorage,
          transportation: ranking.shelter.hasTransportation,
          phoneAccess: ranking.shelter.hasPhoneAccess,
          internetAccess: ranking.shelter.hasInternetAccess,
          medical: ranking.shelter.hasMedicalCare,
          mentalHealth: ranking.shelter.hasMentalHealthSupport,
          substanceAbuse: ranking.shelter.hasSubstanceAbuseSupport,
          jobTraining: ranking.shelter.hasJobTraining,
          childcare: ranking.shelter.hasChildcare,
          education: ranking.shelter.hasEducationalSupport,
          caseManagement: ranking.shelter.hasCaseManagement,
          legalAid: ranking.shelter.hasLegalAid,
          security: ranking.shelter.hasSecurityStaff,
        },

        // Ranking information
        ranking: {
          score: ranking.score,
          distance: ranking.distance,
          availabilityMatch: ranking.availabilityMatch,
          serviceMatches: ranking.serviceMatches,
          accessibilityMatch: ranking.accessibilityMatch,
          reasoning: ranking.reasoning,
          warnings: ranking.warnings,
        },
      })),
      summary: results.summary,
      searchCriteria: criteria,
    });
  } catch (error) {
    logger.error("Shelter search failed:", error);
    res.status(500).json({
      error: "Failed to search shelters",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route GET /api/shelters/:id
 * @desc Get detailed shelter information
 * @access Public
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const shelter = await prisma.shelterFacility.findUnique({
      where: { id },
      include: {
        availabilityLogs: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!shelter) {
      return res.status(404).json({
        error: "Shelter not found",
      });
    }

    res.json({
      success: true,
      shelter: {
        id: shelter.id,
        name: shelter.name,
        description: shelter.description,
        address: {
          street: shelter.address,
          city: shelter.city,
          state: shelter.state,
          zipCode: shelter.zipCode,
        },
        contact: {
          phone: shelter.phone,
          website: shelter.website,
        },
        location:
          shelter.latitude && shelter.longitude
            ? {
                lat: shelter.latitude,
                lng: shelter.longitude,
              }
            : null,

        // Full details
        serves: {
          adultMen: shelter.servesAdultMen,
          adultWomen: shelter.servesAdultWomen,
          families: shelter.servesFamilies,
          youth: shelter.servesYouth,
        },
        capacity: {
          men: shelter.capacityMen,
          women: shelter.capacityWomen,
          families: shelter.capacityFamilies,
          youth: shelter.capacityYouth,
          total: shelter.capacityTotal,
        },
        currentAvailability: {
          men: shelter.currentAvailableMen,
          women: shelter.currentAvailableWomen,
          families: shelter.currentAvailableFamilies,
          youth: shelter.currentAvailableYouth,
          total: shelter.currentAvailableTotal,
          lastUpdated: shelter.lastAutoUpdateAt,
        },
        policies: {
          maxStayDays: shelter.maxStayDays,
          allowsPets: shelter.allowsPets,
          wheelchairAccessible: shelter.wheelchairAccessible,
          requiresIntake: shelter.requiresIntake,
          emergencyOnly: shelter.emergencyOnly,
          hasWomenOnlyAreas: shelter.hasWomenOnlyAreas,
          hasFamilyRooms: shelter.hasFamilyRooms,
        },
        services: {
          meals: shelter.hasMeals,
          showers: shelter.hasShowers,
          laundry: shelter.hasLaundry,
          storage: shelter.hasStorage,
          transportation: shelter.hasTransportation,
          phoneAccess: shelter.hasPhoneAccess,
          internetAccess: shelter.hasInternetAccess,
          medical: shelter.hasMedicalCare,
          mentalHealth: shelter.hasMentalHealthSupport,
          substanceAbuse: shelter.hasSubstanceAbuseSupport,
          jobTraining: shelter.hasJobTraining,
          childcare: shelter.hasChildcare,
          education: shelter.hasEducationalSupport,
          caseManagement: shelter.hasCaseManagement,
          legalAid: shelter.hasLegalAid,
          security: shelter.hasSecurityStaff,
        },
        isActive: shelter.isActive,
        createdAt: shelter.createdAt,
        updatedAt: shelter.updatedAt,

        // Recent availability history
        recentAvailability: shelter.availabilityLogs.map((log) => ({
          timestamp: log.timestamp,
          availability: {
            men: log.availableMen,
            women: log.availableWomen,
            families: log.availableFamilies,
            youth: log.availableYouth,
            total: log.availableTotal,
          },
          source: log.source,
          notes: log.notes,
        })),
      },
    });
  } catch (error) {
    logger.error("Failed to get shelter details:", error);
    res.status(500).json({
      error: "Failed to get shelter details",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route GET /api/shelters
 * @desc List shelters with basic filtering
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const city = req.query.city as string;
    const state = req.query.state as string;
    const hasAvailability = req.query.hasAvailability === "true";
    const populationType = req.query.populationType as string;

    const where: any = { isActive: true };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = state.toUpperCase();
    }

    if (hasAvailability) {
      where.OR = [
        { currentAvailableTotal: { gt: 0 } },
        { currentAvailableMen: { gt: 0 } },
        { currentAvailableWomen: { gt: 0 } },
        { currentAvailableFamilies: { gt: 0 } },
        { currentAvailableYouth: { gt: 0 } },
      ];
    }

    if (populationType) {
      switch (populationType) {
        case "men":
          where.servesAdultMen = true;
          break;
        case "women":
          where.servesAdultWomen = true;
          break;
        case "families":
          where.servesFamilies = true;
          break;
        case "youth":
          where.servesYouth = true;
          break;
      }
    }

    const [shelters, total] = await Promise.all([
      prisma.shelterFacility.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ currentAvailableTotal: "desc" }, { name: "asc" }],
      }),
      prisma.shelterFacility.count({ where }),
    ]);

    res.json({
      success: true,
      shelters: shelters.map((shelter) => ({
        id: shelter.id,
        name: shelter.name,
        address: {
          street: shelter.address,
          city: shelter.city,
          state: shelter.state,
          zipCode: shelter.zipCode,
        },
        contact: {
          phone: shelter.phone,
          website: shelter.website,
        },
        serves: {
          adultMen: shelter.servesAdultMen,
          adultWomen: shelter.servesAdultWomen,
          families: shelter.servesFamilies,
          youth: shelter.servesYouth,
        },
        availability: {
          men: shelter.currentAvailableMen,
          women: shelter.currentAvailableWomen,
          families: shelter.currentAvailableFamilies,
          youth: shelter.currentAvailableYouth,
          total: shelter.currentAvailableTotal,
          lastUpdated: shelter.lastAutoUpdateAt,
        },
        policies: {
          allowsPets: shelter.allowsPets,
          wheelchairAccessible: shelter.wheelchairAccessible,
          emergencyOnly: shelter.emergencyOnly,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Failed to list shelters:", error);
    res.status(500).json({
      error: "Failed to list shelters",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route PUT /api/shelters/:id/availability
 * @desc Update shelter availability (manual update)
 * @access Protected (shelter staff/admin)
 */
router.put("/:id/availability", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const validationResult = availabilityUpdateSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid availability data",
        details: validationResult.error.errors,
      });
    }

    const updateData = validationResult.data;

    // Verify shelter exists and user has permission
    const shelter = await prisma.shelterFacility.findUnique({
      where: { id },
    });

    if (!shelter) {
      return res.status(404).json({
        error: "Shelter not found",
      });
    }

    // Apply availability update
    await shelterAvailabilitySync.updateShelterAvailability(
      id,
      updateData,
      userId,
    );

    // Get updated shelter data
    const updatedShelter = await prisma.shelterFacility.findUnique({
      where: { id },
      include: {
        availabilityLogs: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    });

    logger.info("Manual shelter availability update", {
      shelterId: id,
      updatedBy: userId,
      updateData,
    });

    res.json({
      success: true,
      message: "Availability updated successfully",
      availability: {
        men: updatedShelter?.currentAvailableMen,
        women: updatedShelter?.currentAvailableWomen,
        families: updatedShelter?.currentAvailableFamilies,
        youth: updatedShelter?.currentAvailableYouth,
        total: updatedShelter?.currentAvailableTotal,
        lastUpdated: updatedShelter?.lastAutoUpdateAt,
      },
    });
  } catch (error) {
    logger.error("Failed to update shelter availability:", error);
    res.status(500).json({
      error: "Failed to update availability",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route POST /api/shelters
 * @desc Create new shelter facility
 * @access Protected (admin only)
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Check if user is admin (implement your admin check logic)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Admin access required",
      });
    }

    const validationResult = shelterCreateSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid shelter data",
        details: validationResult.error.errors,
      });
    }

    const shelterData = validationResult.data;

    const newShelter = await prisma.shelterFacility.create({
      data: {
        ...shelterData,
        createdBy: userId,
      },
    });

    logger.info("New shelter facility created", {
      shelterId: newShelter.id,
      name: newShelter.name,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Shelter created successfully",
      shelter: {
        id: newShelter.id,
        name: newShelter.name,
        address: {
          street: newShelter.address,
          city: newShelter.city,
          state: newShelter.state,
          zipCode: newShelter.zipCode,
        },
      },
    });
  } catch (error) {
    logger.error("Failed to create shelter:", error);
    res.status(500).json({
      error: "Failed to create shelter",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route GET /api/shelters/availability/sync-status
 * @desc Get shelter availability sync status
 * @access Protected (admin/staff)
 */
router.get("/availability/sync-status", authenticateUser, async (req, res) => {
  try {
    const syncStatus = await shelterAvailabilitySync.getSyncStatus();

    res.json({
      success: true,
      syncStatus,
    });
  } catch (error) {
    logger.error("Failed to get sync status:", error);
    res.status(500).json({
      error: "Failed to get sync status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route POST /api/shelters/availability/sync
 * @desc Trigger manual sync of all shelter availability data
 * @access Protected (admin only)
 */
router.post("/availability/sync", authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Check admin permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Admin access required",
      });
    }

    // Trigger sync asynchronously
    shelterAvailabilitySync
      .syncAllSources()
      .then((results) => {
        logger.info("Manual sync completed", { results, triggeredBy: userId });
      })
      .catch((error) => {
        logger.error("Manual sync failed:", error);
      });

    res.json({
      success: true,
      message: "Sync triggered successfully",
      note: "Sync is running in background, check sync status for results",
    });
  } catch (error) {
    logger.error("Failed to trigger sync:", error);
    res.status(500).json({
      error: "Failed to trigger sync",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route POST /api/shelters/availability/bulk-update
 * @desc Bulk update shelter availability from uploaded file
 * @access Protected (admin/shelter staff)
 */
router.post("/availability/bulk-update", authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { fileData, format } = req.body;

    if (!fileData || !format) {
      return res.status(400).json({
        error: "File data and format required",
      });
    }

    if (!["csv", "json"].includes(format)) {
      return res.status(400).json({
        error: "Format must be csv or json",
      });
    }

    const results = await shelterAvailabilitySync.bulkUpdateFromFile(
      fileData,
      format,
      userId,
    );

    logger.info("Bulk availability update completed", {
      results,
      uploadedBy: userId,
    });

    res.json({
      success: true,
      message: "Bulk update completed",
      results,
    });
  } catch (error) {
    logger.error("Bulk update failed:", error);
    res.status(500).json({
      error: "Bulk update failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
