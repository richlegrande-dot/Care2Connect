import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { eligibilityRulesEngine } from '../eligibility/rules-engine';
import { aiEligibilityAssistant } from '../eligibility/ai-eligibility-assistant';
import type { 
  QuestionnaireResponse, 
  UserProfile, 
  EligibilityAssessmentResult 
} from '../eligibility/rules-engine';
import type { AIEligibilityAnalysis } from '../eligibility/ai-eligibility-assistant';
import logger from '../config/logger';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const QuestionnaireSchema = z.object({
  // Household Information
  householdSize: z.number().min(1).max(20),
  hasChildren: z.boolean(),
  childrenAges: z.array(z.number().min(0).max(25)).optional(),
  isPregnant: z.boolean().optional(),
  
  // Demographics
  age: z.number().min(16).max(120).optional(),
  isVeteran: z.boolean(),
  hasDisability: z.boolean(),
  disabilityTypes: z.array(z.string()).optional(),
  
  // Housing
  currentHousingStatus: z.enum([
    'HOUSED', 'TEMPORARILY_HOUSED', 'UNSHELTERED', 'SHELTER',
    'TRANSITIONAL_HOUSING', 'AT_RISK', 'DOUBLED_UP', 'HOTEL_MOTEL', 'OTHER'
  ]),
  monthsHomeless: z.number().min(0).optional(),
  evictionHistory: z.boolean().optional(),
  
  // Income & Benefits
  monthlyIncome: z.number().min(0).optional(),
  incomeSource: z.array(z.enum([
    'EMPLOYMENT', 'SSI', 'SSDI', 'UNEMPLOYMENT', 'TANF', 'SNAP',
    'VETERANS_BENEFITS', 'PENSION', 'FAMILY_SUPPORT', 'OTHER', 'NONE'
  ])),
  currentlyReceivingBenefits: z.array(z.string()).optional(),
  
  // Location
  state: z.string().length(2),
  county: z.string().optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  
  // Citizenship & Legal
  isCitizen: z.boolean().optional(),
  hasValidId: z.boolean().optional(),
  
  // Other Circumstances
  fleeDomesticViolence: z.boolean().optional(),
  hasSubstanceUse: z.boolean().optional(),
  hasCriminalBackground: z.boolean().optional(),
  isStudent: z.boolean().optional()
});

const AssessmentContextSchema = z.object({
  location: z.string().optional(),
  urgentNeeds: z.array(z.string()).optional(),
  previousApplications: z.array(z.string()).optional(),
  preferredLanguage: z.string().optional(),
  hasTransportation: z.boolean().optional()
});

// POST /api/eligibility/assess
// Conduct comprehensive eligibility assessment
router.post('/assess', 
  validateRequest({ body: z.object({
    questionnaire: QuestionnaireSchema,
    context: AssessmentContextSchema.optional(),
    userId: z.string().optional(), // For authenticated users
    sessionId: z.string().optional(), // For anonymous sessions
    includeAIAnalysis: z.boolean().default(true)
  })}),
  async (req, res) => {
    try {
      const { questionnaire, context, userId, sessionId, includeAIAnalysis } = req.body;
      
      logger.info('Starting eligibility assessment', {
        userId: userId || 'anonymous',
        sessionId,
        householdSize: questionnaire.householdSize,
        housingStatus: questionnaire.currentHousingStatus
      });

      // Convert questionnaire to UserProfile for rules engine
      const userProfile: UserProfile = {
        householdSize: questionnaire.householdSize,
        hasChildren: questionnaire.hasChildren,
        isVeteran: questionnaire.isVeteran,
        hasDisability: questionnaire.hasDisability,
        currentHousingStatus: questionnaire.currentHousingStatus,
        monthlyIncome: questionnaire.monthlyIncome,
        incomeSource: questionnaire.incomeSource,
        state: questionnaire.state,
        county: questionnaire.county,
        zipCode: questionnaire.zipCode,
        age: questionnaire.age,
        isPregnant: questionnaire.isPregnant,
        isStudent: questionnaire.isStudent
      };

      // Run rules engine assessment
      const rulesEngineResult = await eligibilityRulesEngine.assessEligibility(
        userProfile, 
        questionnaire
      );

      let aiAnalysis: AIEligibilityAnalysis | null = null;
      
      // Run AI analysis if requested
      if (includeAIAnalysis) {
        try {
          aiAnalysis = await aiEligibilityAssistant.analyzeEligibility(
            rulesEngineResult,
            questionnaire,
            context
          );
        } catch (aiError) {
          logger.warn('AI analysis failed, proceeding with rules engine result only:', aiError);
        }
      }

      // Save assessment to database
      const assessment = await prisma.aidEligibilityAssessment.create({
        data: {
          userId,
          sessionId,
          programIds: rulesEngineResult.recommendedPrograms,
          inputProfileSnapshot: userProfile,
          questionnaireData: questionnaire,
          rulesEngineResult,
          aiAssessment: aiAnalysis || {},
          overallResult: rulesEngineResult.overallResult,
          confidenceScore: rulesEngineResult.confidenceScore
        }
      });

      // Prepare response
      const response = {
        success: true,
        assessmentId: assessment.id,
        results: {
          overall: {
            eligibility: rulesEngineResult.overallResult,
            confidence: rulesEngineResult.confidenceScore,
            recommendedPrograms: rulesEngineResult.recommendedPrograms.length,
            eligiblePrograms: rulesEngineResult.programResults.filter(
              r => r.eligibilityStatus === 'eligible'
            ).length
          },
          programs: rulesEngineResult.programResults.map(program => ({
            id: program.programId,
            name: program.programName,
            eligibilityStatus: program.eligibilityStatus,
            confidence: program.confidenceScore,
            matchedCriteria: program.matchedCriteria,
            failedCriteria: program.failedCriteria,
            missingInformation: program.missingInformation,
            notes: program.notes
          })),
          nextSteps: rulesEngineResult.nextSteps,
          requiredDocuments: rulesEngineResult.requiredDocuments
        },
        aiAnalysis: aiAnalysis || undefined,
        metadata: {
          assessmentDate: assessment.createdAt,
          location: `${questionnaire.state}${questionnaire.county ? ', ' + questionnaire.county + ' County' : ''}`,
          disclaimer: 'This assessment provides informational guidance only. Actual eligibility must be determined by program administrators.'
        }
      };

      logger.info('Eligibility assessment completed successfully', {
        assessmentId: assessment.id,
        overallResult: rulesEngineResult.overallResult,
        eligiblePrograms: response.results.overall.eligiblePrograms
      });

      res.json(response);

    } catch (error) {
      logger.error('Eligibility assessment failed:', error);
      res.status(500).json({
        success: false,
        error: 'Assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: {
          message: 'Please contact your local social services office for assistance',
          emergencyContacts: [
            '211 - Dial 2-1-1 for local resources',
            'Crisis Text Line: Text HOME to 741741'
          ]
        }
      });
    }
  }
);

// GET /api/eligibility/programs
// Get all available aid programs with filtering
router.get('/programs', async (req, res) => {
  try {
    const {
      category,
      jurisdiction,
      state,
      includeInactive = 'false'
    } = req.query;

    const whereClause: any = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (jurisdiction) {
      whereClause.jurisdiction = jurisdiction;
    }
    
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    // Filter by state if specified
    if (state) {
      whereClause.OR = [
        { jurisdiction: 'FEDERAL' },
        {
          AND: [
            { jurisdiction: { in: ['STATE', 'COUNTY', 'CITY', 'LOCAL'] } },
            {
              basicCriteria: {
                path: ['states'],
                array_contains: state
              }
            }
          ]
        }
      ];
    }

    const programs = await prisma.aidProgram.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { jurisdiction: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group programs by category
    const groupedPrograms = programs.reduce((acc: any, program) => {
      const category = program.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: program.id,
        name: program.name,
        description: program.description,
        jurisdiction: program.jurisdiction,
        resourceLinks: program.resourceLinks,
        basicCriteria: program.basicCriteria
      });
      return acc;
    }, {});

    res.json({
      success: true,
      programs: groupedPrograms,
      summary: {
        totalPrograms: programs.length,
        categories: Object.keys(groupedPrograms),
        byJurisdiction: programs.reduce((acc: any, p) => {
          acc[p.jurisdiction] = (acc[p.jurisdiction] || 0) + 1;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    logger.error('Failed to fetch programs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve programs'
    });
  }
});

// GET /api/eligibility/programs/:id
// Get detailed information about a specific program
router.get('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const program = await prisma.aidProgram.findUnique({
      where: { id }
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    // Get recent assessment statistics for this program
    const recentAssessments = await prisma.aidEligibilityAssessment.findMany({
      where: {
        programIds: {
          has: program.id
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        overallResult: true,
        confidenceScore: true
      }
    });

    const eligibilityStats = {
      totalAssessments: recentAssessments.length,
      likelyEligible: recentAssessments.filter(a => a.overallResult === 'LIKELY_ELIGIBLE').length,
      possiblyEligible: recentAssessments.filter(a => a.overallResult === 'POSSIBLY_ELIGIBLE').length,
      averageConfidence: recentAssessments.length > 0 
        ? Math.round(recentAssessments.reduce((sum, a) => sum + a.confidenceScore, 0) / recentAssessments.length)
        : 0
    };

    res.json({
      success: true,
      program: {
        ...program,
        statistics: eligibilityStats
      }
    });

  } catch (error) {
    logger.error('Failed to fetch program details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve program details'
    });
  }
});

// GET /api/eligibility/history/:userId
// Get assessment history for a user
router.get('/history/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = '10', offset = '0' } = req.query;
    
    // Verify user can access this history
    if (req.user?.id !== userId && !req.user?.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const assessments = await prisma.aidEligibilityAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 50),
      skip: Number(offset),
      select: {
        id: true,
        createdAt: true,
        overallResult: true,
        confidenceScore: true,
        programIds: true,
        questionnaireData: true
      }
    });

    // Get program names for each assessment
    const enrichedAssessments = await Promise.all(
      assessments.map(async (assessment) => {
        const programs = await prisma.aidProgram.findMany({
          where: {
            id: { in: assessment.programIds }
          },
          select: { id: true, name: true }
        });

        const questionnaireData = assessment.questionnaireData as any;

        return {
          id: assessment.id,
          date: assessment.createdAt,
          overallResult: assessment.overallResult,
          confidenceScore: assessment.confidenceScore,
          recommendedPrograms: programs,
          householdSize: questionnaireData.householdSize,
          housingStatus: questionnaireData.currentHousingStatus,
          location: `${questionnaireData.state}${questionnaireData.county ? ', ' + questionnaireData.county : ''}`
        };
      })
    );

    const totalAssessments = await prisma.aidEligibilityAssessment.count({
      where: { userId }
    });

    res.json({
      success: true,
      assessments: enrichedAssessments,
      pagination: {
        total: totalAssessments,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: totalAssessments > Number(offset) + Number(limit)
      }
    });

  } catch (error) {
    logger.error('Failed to fetch assessment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment history'
    });
  }
});

// GET /api/eligibility/assessment/:id
// Get detailed results of a specific assessment
router.get('/assessment/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const assessment = await prisma.aidEligibilityAssessment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Verify access permissions
    if (assessment.userId && assessment.userId !== req.user?.id && !req.user?.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get program details
    const programs = await prisma.aidProgram.findMany({
      where: {
        id: { in: assessment.programIds }
      }
    });

    res.json({
      success: true,
      assessment: {
        id: assessment.id,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
        overallResult: assessment.overallResult,
        confidenceScore: assessment.confidenceScore,
        questionnaire: assessment.questionnaireData,
        rulesEngineResult: assessment.rulesEngineResult,
        aiAnalysis: assessment.aiAssessment,
        programs: programs.map(program => ({
          id: program.id,
          name: program.name,
          description: program.description,
          category: program.category,
          jurisdiction: program.jurisdiction,
          resourceLinks: program.resourceLinks
        }))
      }
    });

  } catch (error) {
    logger.error('Failed to fetch assessment details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve assessment details'
    });
  }
});

// GET /api/eligibility/quick-guidance
// Get simplified guidance for specific programs and situation
router.get('/quick-guidance', async (req, res) => {
  try {
    const { programs, situation } = req.query;
    
    if (!programs || !situation) {
      return res.status(400).json({
        success: false,
        error: 'Programs and situation parameters are required'
      });
    }

    const programIds = (programs as string).split(',');
    const userSituation = situation as string;

    const guidance = await aiEligibilityAssistant.generateSimplifiedGuidance(
      programIds,
      userSituation
    );

    res.json({
      success: true,
      guidance: guidance.guidance,
      nextSteps: guidance.nextSteps,
      disclaimer: 'This is general guidance only. Please verify information with official program sources.'
    });

  } catch (error) {
    logger.error('Failed to generate quick guidance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate guidance'
    });
  }
});

// GET /api/eligibility/stats
// Get system-wide eligibility assessment statistics
router.get('/stats', authenticate, authorize(['admin', 'analyst']), async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const sinceDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    
    // Overall assessment statistics
    const totalAssessments = await prisma.aidEligibilityAssessment.count({
      where: {
        createdAt: { gte: sinceDate }
      }
    });

    const resultDistribution = await prisma.aidEligibilityAssessment.groupBy({
      by: ['overallResult'],
      where: {
        createdAt: { gte: sinceDate }
      },
      _count: { id: true }
    });

    // Average confidence scores
    const avgConfidence = await prisma.aidEligibilityAssessment.aggregate({
      where: {
        createdAt: { gte: sinceDate }
      },
      _avg: {
        confidenceScore: true
      }
    });

    res.json({
      success: true,
      period: `Last ${days} days`,
      statistics: {
        totalAssessments,
        resultDistribution,
        averageConfidence: Math.round(avgConfidence._avg.confidenceScore || 0),
        activePrograms: await prisma.aidProgram.count({ where: { isActive: true } })
      }
    });

  } catch (error) {
    logger.error('Failed to fetch eligibility statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

export default router;
