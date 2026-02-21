import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

/**
 * POST /api/auth/anonymous
 * Create anonymous user session
 */
router.post("/anonymous", AuthController.createAnonymousUser);

/**
 * POST /api/auth/register
 * Register new user with email (optional)
 */
router.post(
  "/register",
  [
    body("email").optional().isEmail().withMessage("Valid email required"),
    body("phone").optional().isString().withMessage("Phone must be a string"),
    body("location")
      .optional()
      .isString()
      .withMessage("Location must be a string"),
    body("zipCode")
      .optional()
      .isString()
      .withMessage("Zip code must be a string"),
  ],
  validateRequest,
  AuthController.registerUser,
);

/**
 * POST /api/auth/update-consent
 * Update user consent and privacy settings
 */
router.post(
  "/update-consent",
  [
    body("userId").isString().notEmpty().withMessage("User ID is required"),
    body("consentGiven").isBoolean().withMessage("Consent must be boolean"),
    body("isProfilePublic")
      .optional()
      .isBoolean()
      .withMessage("Profile visibility must be boolean"),
  ],
  validateRequest,
  AuthController.updateConsent,
);

/**
 * GET /api/auth/user/:userId
 * Get user information
 */
router.get("/user/:userId", AuthController.getUserInfo);

export default router;
