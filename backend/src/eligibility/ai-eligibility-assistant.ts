import { getValidEnvKey } from "../utils/keys";
import logger from "../config/logger";
import { PrismaClient } from "@prisma/client";
import type {
  EligibilityAssessmentResult,
  RulesEngineResult,
  QuestionnaireResponse,
} from "./rules-engine";

const prisma = new PrismaClient();

// V1: AI eligibility analysis is OPTIONAL - system works with rules engine only
// OpenAI removed to eliminate V1 dependency

export interface AIEligibilityAnalysis {
  overallAssessment: {
    eligibilityLabel:
      | "likely_eligible"
      | "possibly_eligible"
      | "unlikely_eligible"
      | "needs_review";
    confidenceLevel: number; // 0-100
    explanation: string;
    keyStrengths: string[];
    potentialBarriers: string[];
  };
  programAnalysis: Array<{
    programId: string;
    programName: string;
    aiAssessment:
      | "strongly_recommended"
      | "recommended"
      | "consider"
      | "unlikely"
      | "not_recommended";
    explanation: string;
    applicationPriority: number; // 1-10 (10 highest)
    estimatedApprovalTime: string;
    tips: string[];
  }>;
  actionPlan: {
    immediateSteps: string[];
    shortTermGoals: string[];
    longTermStrategy: string[];
    emergencyContacts: string[];
  };
  documentation: {
    criticalDocuments: string[];
    additionalHelpfulDocs: string[];
    whereToObtain: Array<{
      document: string;
      sources: string[];
    }>;
  };
  disclaimer: string;
}

// AI Analysis prompt template
const ELIGIBILITY_ANALYSIS_PROMPT = `
You are an expert benefits counselor and social worker specializing in public assistance program eligibility. 
Analyze the provided eligibility assessment results and user situation to provide personalized, actionable guidance.

IMPORTANT DISCLAIMERS:
- This is informational guidance only, not legal advice
- Actual eligibility must be determined by program administrators
- Encourage users to apply even if assessment suggests low likelihood
- Always provide emergency resources for crisis situations

USER SITUATION:
{user_situation}

RULES ENGINE ASSESSMENT:
{rules_assessment}

PROGRAM DETAILS:
{program_details}

Provide a comprehensive analysis in the following JSON format:

{
  "overallAssessment": {
    "eligibilityLabel": "likely_eligible|possibly_eligible|unlikely_eligible|needs_review",
    "confidenceLevel": 85,
    "explanation": "Clear, empathetic explanation of overall assessment",
    "keyStrengths": ["Specific advantages that support eligibility"],
    "potentialBarriers": ["Challenges that may affect eligibility"]
  },
  "programAnalysis": [
    {
      "programId": "program_id",
      "programName": "Program Name",
      "aiAssessment": "strongly_recommended|recommended|consider|unlikely|not_recommended",
      "explanation": "Why this program is/isn't a good fit",
      "applicationPriority": 8,
      "estimatedApprovalTime": "2-4 weeks",
      "tips": ["Specific application tips for this program"]
    }
  ],
  "actionPlan": {
    "immediateSteps": ["Actions to take today or this week"],
    "shortTermGoals": ["Goals for next 1-3 months"],
    "longTermStrategy": ["Strategies for ongoing stability"],
    "emergencyContacts": ["Crisis resources if situation worsens"]
  },
  "documentation": {
    "criticalDocuments": ["Must-have documents"],
    "additionalHelpfulDocs": ["Nice-to-have supporting documents"],
    "whereToObtain": [
      {
        "document": "Birth certificate",
        "sources": ["County vital records office", "Online at state website"]
      }
    ]
  },
  "disclaimer": "Standardized disclaimer about informational nature"
}

Focus on:
1. Practical, actionable advice
2. Trauma-informed, respectful language
3. Addressing immediate needs first
4. Building long-term stability
5. Connecting to local resources
`;

export class AIEligibilityAssistant {
  private promptVersion = "1.0";

  async analyzeEligibility(
    rulesEngineResult: EligibilityAssessmentResult,
    questionnaire: QuestionnaireResponse,
    userContext?: {
      location?: string;
      urgentNeeds?: string[];
      previousApplications?: string[];
    },
  ): Promise<AIEligibilityAnalysis> {
    try {
      logger.info("Starting AI eligibility analysis");

      // Prepare user situation summary
      const userSituation = this.formatUserSituation(
        questionnaire,
        userContext,
      );

      // Format rules engine results
      const rulesAssessment = this.formatRulesAssessment(rulesEngineResult);

      // Get program details for analysis
      const programDetails = await this.getProgramDetails(
        rulesEngineResult.programResults,
      );

      // Call OpenAI for analysis
      const analysis = await this.callAnalysisAPI(
        userSituation,
        rulesAssessment,
        programDetails,
      );

      if (!analysis) {
        throw new Error("Failed to generate AI analysis");
      }

      // Enhance with local resources and emergency contacts
      await this.enhanceWithLocalResources(
        analysis,
        questionnaire.state,
        questionnaire.zipCode,
      );

      // Add standardized disclaimer
      analysis.disclaimer = this.generateDisclaimer();

      logger.info(
        `AI eligibility analysis completed: ${analysis.overallAssessment.eligibilityLabel}`,
      );

      return analysis;
    } catch (error) {
      logger.error("AI eligibility analysis failed:", error);

      // Return fallback analysis
      return this.generateFallbackAnalysis(rulesEngineResult, questionnaire);
    }
  }

  private formatUserSituation(
    questionnaire: QuestionnaireResponse,
    userContext?: any,
  ): string {
    const situation = [];

    // Demographics
    situation.push(`Household size: ${questionnaire.householdSize}`);
    if (questionnaire.hasChildren) {
      situation.push(
        `Has children (ages: ${questionnaire.childrenAges?.join(", ") || "not specified"})`,
      );
    }
    if (questionnaire.age) {
      situation.push(`Age: ${questionnaire.age}`);
    }

    // Housing
    situation.push(`Current housing: ${questionnaire.currentHousingStatus}`);
    if (questionnaire.monthsHomeless) {
      situation.push(`Homeless for ${questionnaire.monthsHomeless} months`);
    }

    // Income
    if (questionnaire.monthlyIncome) {
      situation.push(`Monthly income: $${questionnaire.monthlyIncome}`);
    }
    if (questionnaire.incomeSource.length > 0) {
      situation.push(
        `Income sources: ${questionnaire.incomeSource.join(", ")}`,
      );
    }

    // Special circumstances
    if (questionnaire.isVeteran) situation.push("Veteran status");
    if (questionnaire.hasDisability) situation.push("Has disability");
    if (questionnaire.isPregnant) situation.push("Currently pregnant");
    if (questionnaire.fleeDomesticViolence)
      situation.push("Fleeing domestic violence");

    // Location
    situation.push(
      `Location: ${questionnaire.state}${questionnaire.county ? ", " + questionnaire.county + " County" : ""}`,
    );

    // Current benefits
    if (questionnaire.currentlyReceivingBenefits?.length) {
      situation.push(
        `Currently receiving: ${questionnaire.currentlyReceivingBenefits.join(", ")}`,
      );
    }

    // Context
    if (userContext?.urgentNeeds?.length) {
      situation.push(`Urgent needs: ${userContext.urgentNeeds.join(", ")}`);
    }

    return situation.join("\n");
  }

  private formatRulesAssessment(result: EligibilityAssessmentResult): string {
    const assessment = [];

    assessment.push(`Overall Result: ${result.overallResult}`);
    assessment.push(`Confidence Score: ${result.confidenceScore}%`);
    assessment.push(
      `Recommended Programs: ${result.recommendedPrograms.length}`,
    );
    assessment.push("");

    // Program breakdown
    assessment.push("Program Assessment Results:");
    result.programResults.forEach((program) => {
      assessment.push(`\n${program.programName}:`);
      assessment.push(`  Status: ${program.eligibilityStatus}`);
      assessment.push(`  Confidence: ${program.confidenceScore}%`);

      if (program.matchedCriteria.length > 0) {
        assessment.push(`  Matched: ${program.matchedCriteria.join(", ")}`);
      }

      if (program.failedCriteria.length > 0) {
        assessment.push(`  Failed: ${program.failedCriteria.join(", ")}`);
      }

      if (program.missingInformation.length > 0) {
        assessment.push(`  Missing: ${program.missingInformation.join(", ")}`);
      }
    });

    return assessment.join("\n");
  }

  private async getProgramDetails(
    programResults: RulesEngineResult[],
  ): Promise<string> {
    const programIds = programResults.map((r) => r.programId);

    try {
      const programs = await prisma.aidProgram.findMany({
        where: {
          id: { in: programIds },
        },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          jurisdiction: true,
          resourceLinks: true,
        },
      });

      return programs
        .map((program) => {
          return `${program.name} (${program.category}):
Description: ${program.description || "No description available"}
Jurisdiction: ${program.jurisdiction}
Resources: ${JSON.stringify(program.resourceLinks)}`;
        })
        .join("\n\n");
    } catch (error) {
      logger.error("Failed to fetch program details:", error);
      return "Program details unavailable";
    }
  }

  private async callAnalysisAPI(
    userSituation: string,
    rulesAssessment: string,
    programDetails: string,
  ): Promise<AIEligibilityAnalysis | null> {
    const prompt = ELIGIBILITY_ANALYSIS_PROMPT.replace(
      "{user_situation}",
      userSituation,
    )
      .replace("{rules_assessment}", rulesAssessment)
      .replace("{program_details}", programDetails);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert benefits counselor. Provide comprehensive, empathetic eligibility guidance in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      return JSON.parse(content) as AIEligibilityAnalysis;
    } catch (error) {
      if (error instanceof SyntaxError) {
        logger.error("Invalid JSON response from OpenAI:", error.message);
      } else {
        logger.error("OpenAI API call failed:", error);
      }
      return null;
    }
  }

  private async enhanceWithLocalResources(
    analysis: AIEligibilityAnalysis,
    state: string,
    zipCode?: string,
  ): Promise<void> {
    // Add state-specific emergency contacts
    const stateResources = this.getStateEmergencyResources(state);
    analysis.actionPlan.emergencyContacts.push(...stateResources);

    // Add document acquisition sources by state
    analysis.documentation.whereToObtain = this.enhanceDocumentSources(
      analysis.documentation.whereToObtain,
      state,
    );

    // Add local program offices if available
    if (zipCode) {
      const localOffices = await this.findLocalProgramOffices(state, zipCode);
      if (localOffices.length > 0) {
        analysis.actionPlan.immediateSteps.push(
          `Visit local assistance office: ${localOffices[0]}`,
        );
      }
    }
  }

  private getStateEmergencyResources(state: string): string[] {
    const resources = [
      "211 - Dial 2-1-1 for local resources and assistance",
      "National Suicide Prevention Lifeline: 988",
      "Crisis Text Line: Text HOME to 741741",
    ];

    // State-specific resources
    const stateResources: Record<string, string[]> = {
      CA: [
        "California Homeless Hotline: 1-916-654-1345",
        "CalWORKs Information: 1-877-847-3663",
      ],
      NY: [
        "NYC Human Resources Administration: 311",
        "NY State OTDA: 1-800-342-3009",
      ],
      TX: [
        "Texas Health and Human Services: 2-1-1",
        "Texas Homeless Network: 1-512-482-8270",
      ],
      FL: ["Florida Department of Children and Families: 1-866-762-2237"],
    };

    if (stateResources[state]) {
      resources.push(...stateResources[state]);
    }

    return resources;
  }

  private enhanceDocumentSources(
    existing: Array<{ document: string; sources: string[] }>,
    state: string,
  ): Array<{ document: string; sources: string[] }> {
    const enhanced = [...existing];

    // Add state-specific document sources
    const commonDocs = [
      {
        document: "Birth Certificate",
        sources: [
          `${state} Department of Health Vital Records`,
          "VitalChek.com (online ordering)",
          "Local county clerk office",
        ],
      },
      {
        document: "Social Security Card",
        sources: [
          "Social Security Administration office",
          "SSA.gov online replacement",
          "Call SSA: 1-800-772-1213",
        ],
      },
      {
        document: "State ID or Driver's License",
        sources: [
          `${state} Department of Motor Vehicles`,
          "Local DMV office",
          "Online renewal (if eligible)",
        ],
      },
    ];

    // Merge with existing, avoiding duplicates
    commonDocs.forEach((commonDoc) => {
      const existing = enhanced.find((doc) =>
        doc.document.toLowerCase().includes(commonDoc.document.toLowerCase()),
      );

      if (!existing) {
        enhanced.push(commonDoc);
      } else {
        // Merge sources
        const newSources = commonDoc.sources.filter(
          (source) =>
            !existing.sources.some((existingSource) =>
              existingSource.toLowerCase().includes(source.toLowerCase()),
            ),
        );
        existing.sources.push(...newSources);
      }
    });

    return enhanced;
  }

  private async findLocalProgramOffices(
    state: string,
    zipCode: string,
  ): Promise<string[]> {
    try {
      // This would typically query a database of local offices
      // For now, return generic state office information
      const stateOffices: Record<string, string[]> = {
        CA: [
          "County Social Services Department",
          "CalWORKs Office",
          "CalFresh Office",
        ],
        NY: [
          "Local Department of Social Services",
          "SNAP Center",
          "TANF Office",
        ],
        TX: ["Health and Human Services Office", "SNAP Office", "TANF Office"],
      };

      return stateOffices[state] || ["Local Social Services Department"];
    } catch (error) {
      logger.error("Failed to find local program offices:", error);
      return [];
    }
  }

  private generateFallbackAnalysis(
    rulesEngineResult: EligibilityAssessmentResult,
    questionnaire: QuestionnaireResponse,
  ): AIEligibilityAnalysis {
    return {
      overallAssessment: {
        eligibilityLabel:
          rulesEngineResult.overallResult === "LIKELY_ELIGIBLE"
            ? "likely_eligible"
            : "possibly_eligible",
        confidenceLevel: rulesEngineResult.confidenceScore,
        explanation:
          "Basic assessment completed. Please consult with a benefits counselor for detailed guidance.",
        keyStrengths: ["Assessment completed"],
        potentialBarriers: ["Limited analysis available"],
      },
      programAnalysis: rulesEngineResult.programResults.map((program) => ({
        programId: program.programId,
        programName: program.programName,
        aiAssessment:
          program.eligibilityStatus === "eligible" ? "recommended" : "consider",
        explanation: `Rules-based assessment: ${program.eligibilityStatus}`,
        applicationPriority: program.eligibilityStatus === "eligible" ? 8 : 5,
        estimatedApprovalTime: "2-6 weeks",
        tips: ["Contact program office for current requirements"],
      })),
      actionPlan: {
        immediateSteps: rulesEngineResult.nextSteps.slice(0, 3),
        shortTermGoals: ["Complete applications for eligible programs"],
        longTermStrategy: ["Work with case manager for ongoing support"],
        emergencyContacts: this.getStateEmergencyResources(questionnaire.state),
      },
      documentation: {
        criticalDocuments: rulesEngineResult.requiredDocuments.slice(0, 5),
        additionalHelpfulDocs: [],
        whereToObtain: [],
      },
      disclaimer: this.generateDisclaimer(),
    };
  }

  private generateDisclaimer(): string {
    return `IMPORTANT DISCLAIMER: This assessment provides informational guidance only and is not a guarantee of eligibility or benefits approval. Actual eligibility determinations must be made by authorized program administrators. Requirements and availability may vary by location and change over time. Please verify all information with official program sources before making decisions. In emergency situations, contact 911 or your local crisis services immediately.`;
  }

  // Public utility methods
  async enhanceExistingAssessment(
    assessmentId: string,
    additionalContext?: any,
  ): Promise<AIEligibilityAnalysis | null> {
    try {
      const assessment = await prisma.aidEligibilityAssessment.findUnique({
        where: { id: assessmentId },
        include: {
          programs: true,
        },
      });

      if (!assessment) {
        return null;
      }

      const questionnaire =
        assessment.questionnaireData as QuestionnaireResponse;
      const rulesResult =
        assessment.rulesEngineResult as EligibilityAssessmentResult;

      return this.analyzeEligibility(
        rulesResult,
        questionnaire,
        additionalContext,
      );
    } catch (error) {
      logger.error("Failed to enhance existing assessment:", error);
      return null;
    }
  }

  async generateSimplifiedGuidance(
    programIds: string[],
    userSituation: string,
  ): Promise<{ guidance: string; nextSteps: string[] }> {
    try {
      const programs = await prisma.aidProgram.findMany({
        where: { id: { in: programIds } },
      });

      const prompt = `
        Provide brief, practical guidance for someone in this situation: ${userSituation}
        
        Available programs: ${programs.map((p) => p.name).join(", ")}
        
        Return JSON: { "guidance": "brief explanation", "nextSteps": ["step1", "step2"] }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || "{}");

      return {
        guidance:
          result.guidance ||
          "Consult with a benefits counselor for personalized assistance.",
        nextSteps: result.nextSteps || [
          "Contact local assistance office",
          "Gather required documents",
        ],
      };
    } catch (error) {
      logger.error("Failed to generate simplified guidance:", error);
      return {
        guidance:
          "Please consult with a local benefits counselor for assistance.",
        nextSteps: [
          "Call 211 for local resources",
          "Visit local social services office",
        ],
      };
    }
  }
}

// Export singleton instance
export const aiEligibilityAssistant = new AIEligibilityAssistant();
