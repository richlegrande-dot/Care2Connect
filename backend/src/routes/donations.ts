import { Router } from "express";
import { DonationController } from "../controllers/donationController";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

/**
 * POST /api/donations/cashapp/qr
 * Generate QR code for Cash App
 */
router.post(
  "/cashapp/qr",
  [body("cashtag").isString().notEmpty().withMessage("Cashtag is required")],
  validateRequest,
  DonationController.generateCashAppQR,
);

/**
 * GET /api/donations/gofundme/:profileId/story
 * Generate GoFundMe campaign story
 */
router.get(
  "/gofundme/:profileId/story",
  [
    param("profileId")
      .isString()
      .notEmpty()
      .withMessage("Profile ID is required"),
  ],
  validateRequest,
  DonationController.generateGoFundMeStory,
);

/**
 * POST /api/donations/validate
 * Validate donation information
 */
router.post(
  "/validate",
  [
    body("cashtag")
      .optional()
      .isString()
      .withMessage("Cashtag must be a string"),
    body("gofundmeUrl")
      .optional()
      .isURL()
      .withMessage("GoFundMe URL must be valid"),
  ],
  validateRequest,
  DonationController.validateDonationInfo,
);

/**
 * POST /api/donations/track
 * Track donation (analytics only)
 */
router.post(
  "/track",
  [
    body("userId").isString().notEmpty().withMessage("User ID is required"),
    body("platform").isString().notEmpty().withMessage("Platform is required"),
    body("amount")
      .optional()
      .isNumeric()
      .withMessage("Amount must be a number"),
    body("reference")
      .optional()
      .isString()
      .withMessage("Reference must be a string"),
    body("donorEmail")
      .optional()
      .isEmail()
      .withMessage("Donor email must be valid"),
    body("message")
      .optional()
      .isString()
      .withMessage("Message must be a string"),
  ],
  validateRequest,
  DonationController.trackDonation,
);

/**
 * GET /api/donations/stats/:userId
 * Get donation statistics
 */
router.get(
  "/stats/:userId",
  [param("userId").isString().notEmpty().withMessage("User ID is required")],
  validateRequest,
  DonationController.getDonationStats,
);

/**
 * GET /api/donations/social/:profileId
 * Generate social media appeal
 */
router.get(
  "/social/:profileId",
  [
    param("profileId")
      .isString()
      .notEmpty()
      .withMessage("Profile ID is required"),
    query("platform")
      .optional()
      .isIn(["twitter", "facebook", "instagram"])
      .withMessage("Platform must be twitter, facebook, or instagram"),
  ],
  validateRequest,
  DonationController.generateSocialMediaAppeal,
);

export default router;
