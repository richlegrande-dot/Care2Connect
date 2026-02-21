import { Router } from "express";
import { ChatController } from "../controllers/chatController";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

/**
 * POST /api/chat
 * Send a message to the AI assistant
 */
router.post(
  "/",
  [
    body("userId").isString().notEmpty().withMessage("User ID is required"),
    body("message").isString().notEmpty().withMessage("Message is required"),
  ],
  validateRequest,
  ChatController.sendMessage,
);

/**
 * GET /api/chat/:userId/history
 * Get conversation history
 */
router.get(
  "/:userId/history",
  [
    param("userId").isString().notEmpty().withMessage("User ID is required"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be 1-100"),
  ],
  validateRequest,
  ChatController.getConversationHistory,
);

/**
 * GET /api/chat/:userId/starters
 * Get conversation starters
 */
router.get(
  "/:userId/starters",
  [param("userId").isString().notEmpty().withMessage("User ID is required")],
  validateRequest,
  ChatController.getConversationStarters,
);

/**
 * DELETE /api/chat/:userId
 * Clear conversation history
 */
router.delete(
  "/:userId",
  [
    param("userId").isString().notEmpty().withMessage("User ID is required"),
    body("confirmClear")
      .isBoolean()
      .equals("true")
      .withMessage("Confirmation required"),
  ],
  validateRequest,
  ChatController.clearConversation,
);

/**
 * GET /api/chat/:userId/stats
 * Get chat statistics
 */
router.get(
  "/:userId/stats",
  [param("userId").isString().notEmpty().withMessage("User ID is required")],
  validateRequest,
  ChatController.getChatStats,
);

export default router;
