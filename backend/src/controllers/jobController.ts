import { Request, Response } from 'express';
import { JobSearchService, JobSearchParams } from '../services/jobSearchService';
import { prisma } from '../utils/database';

const jobSearchService = new JobSearchService();

export class JobController {
  /**
   * Search for jobs
   */
  static async searchJobs(req: Request, res: Response) {
    try {
      const {
        userId,
        keywords,
        location,
        radius,
        limit,
        salaryMin,
        experienceLevel,
        jobType,
      } = req.query;

      const searchParams: JobSearchParams = {
        keywords: keywords as string,
        location: location as string,
        radius: radius ? parseInt(radius as string) : undefined,
        limit: limit ? parseInt(limit as string) : 10,
        salaryMin: salaryMin ? parseInt(salaryMin as string) : undefined,
        experienceLevel: experienceLevel as any,
        jobType: jobType as any,
      };

      // Get user profile for personalization if userId provided
      let userProfile = null;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId as string },
          include: { profile: true },
        });
        userProfile = user?.profile;
      }

      const jobs = await jobSearchService.searchJobs(searchParams);

      // Cache results if user is provided
      if (userId && jobs.length > 0) {
        await prisma.jobsCache.create({
          data: {
            userId: userId as string,
            keywords: searchParams.keywords,
            location: searchParams.location,
            radius: searchParams.radius,
            jobResults: jobs as any,
            totalResults: jobs.length,
            source: 'mixed',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          jobs,
          searchParams,
          totalResults: jobs.length,
        },
      });
    } catch (error) {
      console.error('Job search error:', error);
      res.status(500).json({
        error: 'Job search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get personalized job recommendations
   */
  static async getJobRecommendations(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user || !user.profile) {
        return res.status(404).json({
          error: 'User or profile not found',
        });
      }

      // Generate search parameters based on user profile
      const searchParams: JobSearchParams = {
        keywords: user.profile.skills.join(' '),
        location: (user.location || user.zipCode) || undefined,
        limit: 10,
        experienceLevel: 'entry', // Assume entry level for homeless individuals
      };

      const jobs = await jobSearchService.searchJobs(searchParams);
      const suggestions = await jobSearchService.getJobSuggestions(user.profile);

      // Cache results
      if (jobs.length > 0) {
        await prisma.jobsCache.create({
          data: {
            userId,
            keywords: searchParams.keywords,
            location: (searchParams.location as string) || undefined,
            jobResults: jobs as any,
            totalResults: jobs.length,
            source: 'recommendations',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          jobs,
          suggestions,
          profile: {
            skills: user.profile.skills,
            location: user.location,
          },
        },
      });
    } catch (error) {
      console.error('Job recommendations error:', error);
      res.status(500).json({
        error: 'Failed to get job recommendations',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get cached job searches
   */
  static async getCachedJobs(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 5 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const cachedSearches = await prisma.jobsCache.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          keywords: true,
          location: true,
          jobResults: true,
          totalResults: true,
          source: true,
          createdAt: true,
        },
      });

      const totalSearches = await prisma.jobsCache.count({
        where: { userId },
      });

      res.status(200).json({
        success: true,
        data: {
          searches: cachedSearches,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalSearches,
            pages: Math.ceil(totalSearches / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Cached jobs error:', error);
      res.status(500).json({
        error: 'Failed to get cached job searches',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Generate cover letter for a specific job
   */
  static async generateCoverLetter(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { jobId, jobTitle, company, jobDescription } = req.body;

      if (!jobTitle || !company) {
        return res.status(400).json({
          error: 'Job details required',
          message: 'Job title and company are required',
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user || !user.profile) {
        return res.status(404).json({
          error: 'User or profile not found',
        });
      }

      const jobListing = {
        id: jobId || 'manual',
        title: jobTitle,
        company,
        description: jobDescription || '',
        location: '',
        salary: '',
        type: '',
        url: '',
        postedDate: '',
        source: 'manual',
      };

      const coverLetter = await jobSearchService.generateCoverLetter(jobListing, user.profile);

      res.status(200).json({
        success: true,
        data: {
          coverLetter,
          jobDetails: {
            title: jobTitle,
            company,
          },
          profile: {
            name: user.profile.name,
            skills: user.profile.skills,
          },
        },
      });
    } catch (error) {
      console.error('Cover letter generation error:', error);
      res.status(500).json({
        error: 'Failed to generate cover letter',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Get job search suggestions
   */
  static async getJobSuggestions(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user || !user.profile) {
        return res.status(404).json({
          error: 'User or profile not found',
        });
      }

      const suggestions = await jobSearchService.getJobSuggestions(user.profile);

      res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      console.error('Job suggestions error:', error);
      res.status(500).json({
        error: 'Failed to get job suggestions',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Clear job search cache
   */
  static async clearJobCache(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { confirmClear } = req.body;

      if (!confirmClear) {
        return res.status(400).json({
          error: 'Confirmation required',
          message: 'Please confirm clearing cache by setting confirmClear to true',
        });
      }

      const deletedCount = await prisma.jobsCache.deleteMany({
        where: { userId },
      });

      res.status(200).json({
        success: true,
        data: {
          deletedSearches: deletedCount.count,
        },
      });
    } catch (error) {
      console.error('Clear job cache error:', error);
      res.status(500).json({
        error: 'Failed to clear job cache',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
}