import { Router } from "express";
import { JobController } from "../controllers/jobController";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

/**
 * GET /api/jobs/search
 * Search for jobs
 */
router.get(
  "/search",
  [
    query("keywords")
      .optional()
      .isString()
      .withMessage("Keywords must be a string"),
    query("location")
      .optional()
      .isString()
      .withMessage("Location must be a string"),
    query("radius")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Radius must be 1-100 miles"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be 1-50"),
    query("salaryMin")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Minimum salary must be positive"),
    query("experienceLevel")
      .optional()
      .isIn(["entry", "mid", "senior"])
      .withMessage("Invalid experience level"),
    query("jobType")
      .optional()
      .isIn(["full-time", "part-time", "contract", "temporary"])
      .withMessage("Invalid job type"),
    query("userId")
      .optional()
      .isString()
      .withMessage("User ID must be a string"),
  ],
  validateRequest,
  JobController.searchJobs,
);

/**
 * GET /api/jobs/recommendations/:userId
 * Get personalized job recommendations
 */
router.get(
  "/recommendations/:userId",
  [param("userId").isString().notEmpty().withMessage("User ID is required")],
  validateRequest,
  JobController.getJobRecommendations,
);

/**
 * GET /api/jobs/cached/:userId
 * Get cached job searches
 */
router.get(
  "/cached/:userId",
  [
    param("userId").isString().notEmpty().withMessage("User ID is required"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("Limit must be 1-20"),
  ],
  validateRequest,
  JobController.getCachedJobs,
);

/**
 * POST /api/jobs/cover-letter/:userId
 * Generate cover letter for a specific job
 */
router.post(
  "/cover-letter/:userId",
  [
    param("userId").isString().notEmpty().withMessage("User ID is required"),
    body("jobTitle").isString().notEmpty().withMessage("Job title is required"),
    body("company")
      .isString()
      .notEmpty()
      .withMessage("Company name is required"),
    body("jobId").optional().isString().withMessage("Job ID must be a string"),
    body("jobDescription")
      .optional()
      .isString()
      .withMessage("Job description must be a string"),
  ],
  validateRequest,
  JobController.generateCoverLetter,
);

/**
 * GET /api/jobs/suggestions/:userId
 * Get job search suggestions
 */
router.get(
  "/suggestions/:userId",
  [param("userId").isString().notEmpty().withMessage("User ID is required")],
  validateRequest,
  JobController.getJobSuggestions,
);

/**
 * DELETE /api/jobs/cache/:userId
 * Clear job search cache
 */
router.delete(
  "/cache/:userId",
  [
    param("userId").isString().notEmpty().withMessage("User ID is required"),
    body("confirmClear")
      .isBoolean()
      .equals("true")
      .withMessage("Confirmation required"),
  ],
  validateRequest,
  JobController.clearJobCache,
);

export default router;
