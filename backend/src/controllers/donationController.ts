import { Request, Response } from "express";
import { DonationService } from "../services/donationService";
import { prisma } from "../utils/database";

const donationService = new DonationService();

export class DonationController {
  /**
   * Generate QR code for Cash App
   */
  static async generateCashAppQR(req: Request, res: Response) {
    try {
      const { cashtag } = req.body;

      if (!cashtag) {
        return res.status(400).json({
          error: "Cashtag required",
          message: "Please provide a Cash App cashtag",
        });
      }

      // Validate cashtag
      const validation = donationService.validateCashtag(cashtag);
      if (!validation.valid) {
        return res.status(400).json({
          error: "Invalid cashtag",
          message: validation.error,
        });
      }

      // Generate QR code
      const qrCodeUrl = await donationService.generateCashAppQRCode(
        validation.formatted!,
      );

      res.status(200).json({
        success: true,
        data: {
          cashtag: validation.formatted,
          qrCodeUrl,
          cashAppUrl: `https://cash.app/${validation.formatted}`,
        },
      });
    } catch (error) {
      console.error("QR generation error:", error);
      res.status(500).json({
        error: "Failed to generate QR code",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Generate GoFundMe campaign story
   */
  static async generateGoFundMeStory(req: Request, res: Response) {
    try {
      const { profileId } = req.params;

      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          user: {
            select: {
              location: true,
            },
          },
        },
      });

      if (!profile) {
        return res.status(404).json({
          error: "Profile not found",
        });
      }

      const profileData = {
        name: profile.name,
        bio: profile.bio,
        skills: profile.skills,
        urgentNeeds: profile.urgentNeeds,
        longTermGoals: profile.longTermGoals,
        housingStatus: profile.housingStatus,
        location: profile.user.location,
      };

      const story = await donationService.generateGoFundMeStory(profileData);

      res.status(200).json({
        success: true,
        data: {
          story,
          profileData,
        },
      });
    } catch (error) {
      console.error("GoFundMe story generation error:", error);
      res.status(500).json({
        error: "Failed to generate GoFundMe story",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Validate donation information
   */
  static async validateDonationInfo(req: Request, res: Response) {
    try {
      const { cashtag, gofundmeUrl } = req.body;
      const results: any = {};

      if (cashtag) {
        results.cashtag = donationService.validateCashtag(cashtag);
      }

      if (gofundmeUrl) {
        results.gofundmeUrl = donationService.validateGoFundMeUrl(gofundmeUrl);
      }

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({
        error: "Validation failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Track donation (analytics only)
   */
  static async trackDonation(req: Request, res: Response) {
    try {
      const { userId, platform, amount, reference, donorEmail, message } =
        req.body;

      if (!userId || !platform) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "User ID and platform are required",
        });
      }

      const result = await donationService.trackDonation({
        userId,
        platform,
        amount,
        reference,
        donorEmail,
        message,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Donation tracking error:", error);
      res.status(500).json({
        error: "Failed to track donation",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Get donation statistics
   */
  static async getDonationStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const stats = await donationService.getDonationStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Donation stats error:", error);
      res.status(500).json({
        error: "Failed to get donation statistics",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Generate social media appeal
   */
  static async generateSocialMediaAppeal(req: Request, res: Response) {
    try {
      const { profileId } = req.params;
      const { platform = "twitter" } = req.query;

      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          user: {
            select: {
              location: true,
            },
          },
        },
      });

      if (!profile) {
        return res.status(404).json({
          error: "Profile not found",
        });
      }

      const profileData = {
        name: profile.name,
        bio: profile.bio,
        skills: profile.skills,
        urgentNeeds: profile.urgentNeeds,
        cashtag: profile.cashtag,
        gofundmeUrl: profile.gofundmeUrl,
      };

      const appeal = await donationService.generateSocialMediaAppeal(
        profileData,
        platform as "twitter" | "facebook" | "instagram",
      );

      res.status(200).json({
        success: true,
        data: {
          appeal,
          platform,
          profileUrl: `/profile/${profileId}`,
        },
      });
    } catch (error) {
      console.error("Social media appeal error:", error);
      res.status(500).json({
        error: "Failed to generate social media appeal",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
}
