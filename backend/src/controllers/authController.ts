import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  /**
   * Create anonymous user session
   */
  static async createAnonymousUser(req: Request, res: Response) {
    try {
      const user = await prisma.user.create({
        data: {
          anonymous: true,
          consentGiven: false,
          isProfilePublic: false,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          anonymous: user.anonymous,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Anonymous user creation error:', error);
      res.status(500).json({
        error: 'Failed to create anonymous user',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Register new user with email (optional)
   */
  static async registerUser(req: Request, res: Response) {
    try {
      const {
        email,
        phone,
        location,
        zipCode,
        consentGiven = false,
        isProfilePublic = false,
      } = req.body;

      // Check if email already exists
      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return res.status(409).json({
            error: 'Email already registered',
            message: 'A user with this email already exists',
          });
        }
      }

      const user = await prisma.user.create({
        data: {
          email,
          phone,
          location,
          zipCode,
          anonymous: !email, // If no email, remain anonymous
          consentGiven,
          isProfilePublic,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          location: user.location,
          zipCode: user.zipCode,
          anonymous: user.anonymous,
          consentGiven: user.consentGiven,
          isProfilePublic: user.isProfilePublic,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('User registration error:', error);
      res.status(500).json({
        error: 'Failed to register user',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Update user consent and privacy settings
   */
  static async updateConsent(req: Request, res: Response) {
    try {
      const { userId, consentGiven, isProfilePublic } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          consentGiven,
          isProfilePublic: isProfilePublic !== undefined ? isProfilePublic : user.isProfilePublic,
          updatedAt: new Date(),
        },
      });

      res.status(200).json({
        success: true,
        data: {
          userId: updatedUser.id,
          consentGiven: updatedUser.consentGiven,
          isProfilePublic: updatedUser.isProfilePublic,
          updatedAt: updatedUser.updatedAt,
        },
      });
    } catch (error) {
      console.error('Consent update error:', error);
      res.status(500).json({
        error: 'Failed to update consent',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get user information
   */
  static async getUserInfo(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            select: {
              id: true,
              name: true,
              bio: true,
              skills: true,
              urgentNeeds: true,
              longTermGoals: true,
              cashtag: true,
              gofundmeUrl: true,
              viewCount: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            location: user.location,
            zipCode: user.zipCode,
            anonymous: user.anonymous,
            consentGiven: user.consentGiven,
            isProfilePublic: user.isProfilePublic,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error('Get user info error:', error);
      res.status(500).json({
        error: 'Failed to get user information',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
}