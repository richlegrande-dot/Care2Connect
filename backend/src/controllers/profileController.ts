import { Request, Response } from "express";
import { prisma } from "../utils/database";
import {
  TranscriptionService,
  ExtractedProfileData,
} from "../services/transcriptionService";
import { DonationService } from "../services/donationService";
import { v4 as uuidv4 } from "uuid";

const transcriptionService = new TranscriptionService();
const donationService = new DonationService();

export class ProfileController {
  /**
   * Create a new profile from extracted data
   */
  static async createProfile(req: Request, res: Response) {
    try {
      const {
        userId,
        transcript,
        profileData,
        consentGiven = false,
        isProfilePublic = false,
      }: {
        userId?: string;
        transcript: string;
        profileData: ExtractedProfileData;
        consentGiven?: boolean;
        isProfilePublic?: boolean;
      } = req.body;

      // Create or find user
      let user;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          return res.status(404).json({
            error: "User not found",
            message: "The specified user does not exist",
          });
        }
      } else {
        // Create anonymous user
        user = await prisma.user.create({
          data: {
            anonymous: true,
            consentGiven,
            isProfilePublic,
          },
        });
      }

      // Generate enhanced donation pitch
      const enhancedDonationPitch =
        await transcriptionService.generateDonationPitch(profileData);

      // Create profile
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          transcript,
          storySummary: profileData.summary,
          bio: profileData.summary,
          name: profileData.name,
          age: profileData.age,
          skills: profileData.skills,
          jobHistory: profileData.job_history,
          housingStatus: profileData.housing_status,
          healthNotes: profileData.health_notes,
          urgentNeeds: profileData.urgent_needs,
          longTermGoals: profileData.long_term_goals,
          donationPitch: enhancedDonationPitch,
          tags: profileData.tags,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          profileId: profile.id,
          profileUrl: `/profile/${profile.id}`,
          profile: {
            id: profile.id,
            name: profile.name,
            bio: profile.bio,
            skills: profile.skills,
            urgentNeeds: profile.urgentNeeds,
            longTermGoals: profile.longTermGoals,
            donationPitch: profile.donationPitch,
            tags: profile.tags,
          },
        },
      });
    } catch (error) {
      console.error("Profile creation error:", error);
      res.status(500).json({
        error: "Failed to create profile",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Get public profile by ID
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const { profileId } = req.params;

      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          user: {
            select: {
              id: true,
              isProfilePublic: true,
              location: true,
              createdAt: true,
            },
          },
        },
      });

      if (!profile) {
        return res.status(404).json({
          error: "Profile not found",
          message: "The requested profile does not exist",
        });
      }

      if (!profile.user.isProfilePublic) {
        return res.status(403).json({
          error: "Profile not public",
          message: "This profile is not available for public viewing",
        });
      }

      // Increment view count
      await prisma.profile.update({
        where: { id: profileId },
        data: {
          viewCount: { increment: 1 },
          lastViewed: new Date(),
        },
      });

      res.status(200).json({
        success: true,
        data: {
          profile: {
            id: profile.id,
            name: profile.name,
            bio: profile.bio,
            skills: profile.skills,
            urgentNeeds: profile.urgentNeeds,
            longTermGoals: profile.longTermGoals,
            donationPitch: profile.donationPitch,
            cashtag: profile.cashtag,
            gofundmeUrl: profile.gofundmeUrl,
            qrCodeUrl: profile.qrCodeUrl,
            tags: profile.tags,
            viewCount: profile.viewCount + 1,
            createdAt: profile.createdAt,
          },
          user: {
            location: profile.user.location,
            memberSince: profile.user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Profile retrieval error:", error);
      res.status(500).json({
        error: "Failed to retrieve profile",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Update profile information
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const { profileId } = req.params;
      const {
        bio,
        skills,
        urgentNeeds,
        longTermGoals,
        cashtag,
        gofundmeUrl,
        isProfilePublic,
      } = req.body;

      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: { user: true },
      });

      if (!profile) {
        return res.status(404).json({
          error: "Profile not found",
        });
      }

      // Generate QR code if cashtag is provided
      let qrCodeUrl = profile.qrCodeUrl;
      if (cashtag && cashtag !== profile.cashtag) {
        qrCodeUrl = await donationService.generateCashAppQRCode(cashtag);
      }

      // Update profile
      const updatedProfile = await prisma.profile.update({
        where: { id: profileId },
        data: {
          bio: bio || profile.bio,
          skills: skills || profile.skills,
          urgentNeeds: urgentNeeds || profile.urgentNeeds,
          longTermGoals: longTermGoals || profile.longTermGoals,
          cashtag: cashtag || profile.cashtag,
          gofundmeUrl: gofundmeUrl || profile.gofundmeUrl,
          qrCodeUrl,
        },
      });

      // Update user settings
      if (typeof isProfilePublic === "boolean") {
        await prisma.user.update({
          where: { id: profile.userId },
          data: { isProfilePublic },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          profile: updatedProfile,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        error: "Failed to update profile",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Delete profile and associated user data
   */
  static async deleteProfile(req: Request, res: Response) {
    try {
      const { profileId } = req.params;
      const { confirmDelete } = req.body;

      if (!confirmDelete) {
        return res.status(400).json({
          error: "Confirmation required",
          message: "Please confirm deletion by setting confirmDelete to true",
        });
      }

      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: { user: true },
      });

      if (!profile) {
        return res.status(404).json({
          error: "Profile not found",
        });
      }

      // Delete profile (user will be cascade deleted if anonymous)
      await prisma.profile.delete({
        where: { id: profileId },
      });

      res.status(200).json({
        success: true,
        message: "Profile deleted successfully",
      });
    } catch (error) {
      console.error("Profile deletion error:", error);
      res.status(500).json({
        error: "Failed to delete profile",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  /**
   * Search profiles (admin/caseworker functionality)
   */
  static async searchProfiles(req: Request, res: Response) {
    try {
      const { query, tags, location, skills, page = 1, limit = 10 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {
        user: {
          isProfilePublic: true,
        },
      };

      // Add search filters
      if (query) {
        where.OR = [
          { bio: { contains: query as string, mode: "insensitive" } },
          { storySummary: { contains: query as string, mode: "insensitive" } },
          { name: { contains: query as string, mode: "insensitive" } },
        ];
      }

      if (tags) {
        const tagArray = (tags as string).split(",");
        where.tags = { hasSome: tagArray };
      }

      if (skills) {
        const skillArray = (skills as string).split(",");
        where.skills = { hasSome: skillArray };
      }

      if (location) {
        where.user.location = {
          contains: location as string,
          mode: "insensitive",
        };
      }

      const [profiles, total] = await Promise.all([
        prisma.profile.findMany({
          where,
          select: {
            id: true,
            name: true,
            bio: true,
            skills: true,
            tags: true,
            viewCount: true,
            createdAt: true,
            user: {
              select: {
                location: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.profile.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          profiles,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Profile search error:", error);
      res.status(500).json({
        error: "Failed to search profiles",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
}
