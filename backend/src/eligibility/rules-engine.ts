import logger from "../config/logger";
import { PrismaClient } from "@prisma/client";
import type {
  AidProgram,
  ProgramCategory,
  Jurisdiction,
  EligibilityResult,
  HousingStatus,
  IncomeSource,
} from "@prisma/client";

const prisma = new PrismaClient();

export interface UserProfile {
  householdSize: number;
  hasChildren: boolean;
  isVeteran: boolean;
  hasDisability: boolean;
  currentHousingStatus: HousingStatus;
  monthlyIncome?: number;
  incomeSource: IncomeSource[];
  state: string;
  county?: string;
  zipCode?: string;
  age?: number;
  isPregnant?: boolean;
  isStudent?: boolean;
}

export interface QuestionnaireResponse {
  // Household Information
  householdSize: number;
  hasChildren: boolean;
  childrenAges?: number[];
  isPregnant?: boolean;

  // Demographics
  age?: number;
  isVeteran: boolean;
  hasDisability: boolean;
  disabilityTypes?: string[];

  // Housing
  currentHousingStatus: HousingStatus;
  monthsHomeless?: number;
  evictionHistory?: boolean;

  // Income & Benefits
  monthlyIncome?: number;
  incomeSource: IncomeSource[];
  currentlyReceivingBenefits?: string[];

  // Location
  state: string;
  county?: string;
  zipCode?: string;

  // Citizenship & Legal
  isCitizen?: boolean;
  hasValidId?: boolean;

  // Other Circumstances
  fleeDomesticViolence?: boolean;
  hasSubstanceUse?: boolean;
  hasCriminalBackground?: boolean;
  isStudent?: boolean;
}

export interface RulesEngineResult {
  programId: string;
  programName: string;
  eligibilityStatus:
    | "eligible"
    | "possibly_eligible"
    | "ineligible"
    | "needs_review";
  matchedCriteria: string[];
  failedCriteria: string[];
  missingInformation: string[];
  confidenceScore: number; // 0-100
  notes: string[];
}

export interface EligibilityAssessmentResult {
  overallResult: EligibilityResult;
  programResults: RulesEngineResult[];
  recommendedPrograms: string[];
  nextSteps: string[];
  requiredDocuments: string[];
  confidenceScore: number;
}

// Federal Income Guidelines (2024 - update annually)
const FEDERAL_POVERTY_GUIDELINES = {
  2024: {
    1: 15060, // Annual income for household of 1
    2: 20440,
    3: 25820,
    4: 31200,
    5: 36580,
    6: 41960,
    7: 47340,
    8: 52720,
  },
};

// Program-specific income limits as percentage of FPL
const INCOME_LIMITS = {
  SNAP: 130, // 130% of Federal Poverty Level
  TANF: 50, // Generally around 50% FPL (varies by state)
  HOUSING: 30, // HUD programs typically 30% or 50% AMI
  MEDICAID: 138, // 138% FPL in expansion states
  WIC: 185, // 185% FPL
  LIHEAP: 150, // 150% FPL for energy assistance
  CHILDCARE: 85, // 85% State Median Income (varies)
};

export class EligibilityRulesEngine {
  private programs: AidProgram[] = [];

  constructor() {
    this.initializePrograms();
  }

  private async initializePrograms(): Promise<void> {
    try {
      this.programs = await prisma.aidProgram.findMany({
        where: { isActive: true },
      });
      logger.info(
        `Loaded ${this.programs.length} aid programs for eligibility assessment`,
      );
    } catch (error) {
      logger.error("Failed to load aid programs:", error);
    }
  }

  async assessEligibility(
    profile: UserProfile,
    questionnaire: QuestionnaireResponse,
  ): Promise<EligibilityAssessmentResult> {
    logger.info("Starting eligibility assessment for user profile");

    // Ensure programs are loaded
    if (this.programs.length === 0) {
      await this.initializePrograms();
    }

    const programResults: RulesEngineResult[] = [];
    let overallConfidence = 0;

    // Assess each program
    for (const program of this.programs) {
      const result = await this.assessProgramEligibility(
        program,
        profile,
        questionnaire,
      );
      programResults.push(result);
    }

    // Calculate overall results
    const eligiblePrograms = programResults.filter(
      (r) => r.eligibilityStatus === "eligible",
    );
    const possiblyEligiblePrograms = programResults.filter(
      (r) => r.eligibilityStatus === "possibly_eligible",
    );

    // Determine overall result
    let overallResult: EligibilityResult;
    if (eligiblePrograms.length > 0) {
      overallResult = EligibilityResult.LIKELY_ELIGIBLE;
    } else if (possiblyEligiblePrograms.length > 0) {
      overallResult = EligibilityResult.POSSIBLY_ELIGIBLE;
    } else if (
      programResults.some((r) => r.eligibilityStatus === "needs_review")
    ) {
      overallResult = EligibilityResult.NEEDS_REVIEW;
    } else {
      overallResult = EligibilityResult.LIKELY_INELIGIBLE;
    }

    // Calculate average confidence
    overallConfidence =
      programResults.reduce((sum, r) => sum + r.confidenceScore, 0) /
      programResults.length;

    // Generate recommendations and next steps
    const recommendedPrograms = this.generateRecommendations(
      programResults,
      questionnaire,
    );
    const nextSteps = this.generateNextSteps(programResults, questionnaire);
    const requiredDocuments = this.aggregateRequiredDocuments(programResults);

    const result: EligibilityAssessmentResult = {
      overallResult,
      programResults,
      recommendedPrograms,
      nextSteps,
      requiredDocuments,
      confidenceScore: Math.round(overallConfidence),
    };

    logger.info(
      `Eligibility assessment complete: ${overallResult} (${eligiblePrograms.length} eligible programs)`,
    );

    return result;
  }

  private async assessProgramEligibility(
    program: AidProgram,
    profile: UserProfile,
    questionnaire: QuestionnaireResponse,
  ): Promise<RulesEngineResult> {
    const matchedCriteria: string[] = [];
    const failedCriteria: string[] = [];
    const missingInformation: string[] = [];
    const notes: string[] = [];
    let confidenceScore = 100;

    try {
      const criteria = (program.basicCriteria as any) || {};

      // Income Assessment
      if (criteria.incomeLimit) {
        const result = this.assessIncome(
          program,
          profile,
          questionnaire,
          criteria,
        );
        if (result.passed) {
          matchedCriteria.push(result.criterion);
        } else if (result.failed) {
          failedCriteria.push(result.criterion);
        } else {
          missingInformation.push(result.criterion);
          confidenceScore -= 20;
        }
      }

      // Household Size Assessment
      if (criteria.householdSizeMin || criteria.householdSizeMax) {
        const result = this.assessHouseholdSize(
          program,
          questionnaire,
          criteria,
        );
        if (result.passed) {
          matchedCriteria.push(result.criterion);
        } else {
          failedCriteria.push(result.criterion);
        }
      }

      // Age Assessment
      if (criteria.ageMin || criteria.ageMax) {
        const result = this.assessAge(program, questionnaire, criteria);
        if (result.passed !== undefined) {
          if (result.passed) {
            matchedCriteria.push(result.criterion);
          } else {
            failedCriteria.push(result.criterion);
          }
        } else {
          missingInformation.push("Age information");
          confidenceScore -= 15;
        }
      }

      // Housing Status Assessment
      if (criteria.housingRequirements) {
        const result = this.assessHousingStatus(
          program,
          questionnaire,
          criteria,
        );
        if (result.passed) {
          matchedCriteria.push(result.criterion);
        } else if (result.failed) {
          failedCriteria.push(result.criterion);
        }
      }

      // Special Population Assessment
      const specialPopResult = this.assessSpecialPopulations(
        program,
        questionnaire,
        criteria,
      );
      matchedCriteria.push(...specialPopResult.matched);
      if (specialPopResult.bonus) {
        notes.push(`Priority eligibility due to ${specialPopResult.bonus}`);
        confidenceScore += 10;
      }

      // Geographic Assessment
      if (criteria.states || criteria.counties) {
        const result = this.assessGeographic(program, questionnaire, criteria);
        if (result.passed) {
          matchedCriteria.push(result.criterion);
        } else {
          failedCriteria.push(result.criterion);
        }
      }

      // Citizenship Assessment
      if (criteria.citizenshipRequired) {
        const result = this.assessCitizenship(program, questionnaire, criteria);
        if (result.passed !== undefined) {
          if (result.passed) {
            matchedCriteria.push(result.criterion);
          } else {
            failedCriteria.push(result.criterion);
          }
        } else {
          missingInformation.push("Citizenship status");
          confidenceScore -= 25;
        }
      }

      // Determine eligibility status
      let eligibilityStatus:
        | "eligible"
        | "possibly_eligible"
        | "ineligible"
        | "needs_review";

      if (failedCriteria.length === 0 && missingInformation.length === 0) {
        eligibilityStatus = "eligible";
      } else if (failedCriteria.length === 0 && missingInformation.length > 0) {
        eligibilityStatus = "possibly_eligible";
      } else if (this.hasHardFailures(failedCriteria)) {
        eligibilityStatus = "ineligible";
      } else {
        eligibilityStatus = "needs_review";
      }

      return {
        programId: program.id,
        programName: program.name,
        eligibilityStatus,
        matchedCriteria,
        failedCriteria,
        missingInformation,
        confidenceScore: Math.max(0, confidenceScore),
        notes,
      };
    } catch (error) {
      logger.error(
        `Error assessing eligibility for program ${program.name}:`,
        error,
      );

      return {
        programId: program.id,
        programName: program.name,
        eligibilityStatus: "needs_review",
        matchedCriteria: [],
        failedCriteria: ["Assessment error occurred"],
        missingInformation: [],
        confidenceScore: 0,
        notes: ["Error during assessment - manual review required"],
      };
    }
  }

  // Individual assessment methods
  private assessIncome(
    program: AidProgram,
    profile: UserProfile,
    questionnaire: QuestionnaireResponse,
    criteria: any,
  ): { passed?: boolean; failed?: boolean; criterion: string } {
    const monthlyIncome = questionnaire.monthlyIncome || profile.monthlyIncome;

    if (monthlyIncome === undefined) {
      return { criterion: "Income information required" };
    }

    const annualIncome = monthlyIncome * 12;
    const householdSize = questionnaire.householdSize;
    const fpl = this.getFederalPovertyLevel(householdSize);

    // Program-specific income limits
    let incomeLimit: number;

    if (program.category === ProgramCategory.FOOD) {
      incomeLimit = fpl * (INCOME_LIMITS.SNAP / 100);
    } else if (program.category === ProgramCategory.CASH_ASSISTANCE) {
      incomeLimit = fpl * (INCOME_LIMITS.TANF / 100);
    } else if (program.category === ProgramCategory.HOUSING) {
      incomeLimit = fpl * (INCOME_LIMITS.HOUSING / 100);
    } else if (criteria.incomePercentFPL) {
      incomeLimit = fpl * (criteria.incomePercentFPL / 100);
    } else {
      incomeLimit = criteria.incomeLimit || fpl;
    }

    const passed = annualIncome <= incomeLimit;
    const criterion = `Annual income ${passed ? "meets" : "exceeds"} limit of $${incomeLimit.toLocaleString()}`;

    return passed ? { passed: true, criterion } : { failed: true, criterion };
  }

  private assessHouseholdSize(
    program: AidProgram,
    questionnaire: QuestionnaireResponse,
    criteria: any,
  ): { passed: boolean; criterion: string } {
    const householdSize = questionnaire.householdSize;
    let passed = true;
    let criterion = "";

    if (
      criteria.householdSizeMin &&
      householdSize < criteria.householdSizeMin
    ) {
      passed = false;
      criterion = `Household size minimum of ${criteria.householdSizeMin} not met`;
    } else if (
      criteria.householdSizeMax &&
      householdSize > criteria.householdSizeMax
    ) {
      passed = false;
      criterion = `Household size exceeds maximum of ${criteria.householdSizeMax}`;
    } else {
      criterion = `Household size of ${householdSize} meets requirements`;
    }

    return { passed, criterion };
  }

  private assessAge(
    program: AidProgram,
    questionnaire: QuestionnaireResponse,
    criteria: any,
  ): { passed?: boolean; criterion: string } {
    if (!questionnaire.age) {
      return { criterion: "Age information required" };
    }

    let passed = true;
    let criterion = "";

    if (criteria.ageMin && questionnaire.age < criteria.ageMin) {
      passed = false;
      criterion = `Minimum age of ${criteria.ageMin} not met`;
    } else if (criteria.ageMax && questionnaire.age > criteria.ageMax) {
      passed = false;
      criterion = `Age exceeds maximum of ${criteria.ageMax}`;
    } else {
      criterion = `Age of ${questionnaire.age} meets requirements`;
    }

    return { passed, criterion };
  }

  private assessHousingStatus(
    program: AidProgram,
    questionnaire: QuestionnaireResponse,
    criteria: any,
  ): { passed?: boolean; failed?: boolean; criterion: string } {
    const housingStatus = questionnaire.currentHousingStatus;
    const requiredStatuses = criteria.housingRequirements || [];

    if (requiredStatuses.length === 0) {
      return { passed: true, criterion: "No housing restrictions" };
    }

    const passed = requiredStatuses.includes(housingStatus);
    const criterion = passed
      ? `Housing status (${housingStatus}) meets program requirements`
      : `Housing status (${housingStatus}) does not meet program requirements`;

    return passed ? { passed: true, criterion } : { failed: true, criterion };
  }

  private assessSpecialPopulations(
    program: AidProgram,
    questionnaire: QuestionnaireResponse,
    criteria: any,
  ): { matched: string[]; bonus?: string } {
    const matched: string[] = [];
    let bonus: string | undefined;

    if (
      questionnaire.isVeteran &&
      (criteria.veteranPreference ||
        program.category === ProgramCategory.HOUSING)
    ) {
      matched.push("Veteran status");
      bonus = "veteran status";
    }

    if (questionnaire.hasDisability && criteria.disabilityAccommodations) {
      matched.push("Disability accommodations available");
    }

    if (questionnaire.hasChildren && criteria.familyPriority) {
      matched.push("Family with children priority");
      bonus = "having children";
    }

    if (questionnaire.isPregnant && criteria.pregnancyPriority) {
      matched.push("Pregnancy priority");
      bonus = "pregnancy";
    }

    if (
      questionnaire.fleeDomesticViolence &&
      criteria.domesticViolencePriority
    ) {
      matched.push("Domestic violence survivor priority");
      bonus = "domestic violence survival";
    }

    return { matched, bonus };
  }

  private assessGeographic(
    program: AidProgram,
    questionnaire: QuestionnaireResponse,
    criteria: any,
  ): { passed: boolean; criterion: string } {
    let passed = true;

    // State requirements
    if (criteria.states && criteria.states.length > 0) {
      passed = criteria.states.includes(questionnaire.state);
      if (!passed) {
        return {
          passed: false,
          criterion: `Program not available in ${questionnaire.state}`,
        };
      }
    }

    // County requirements
    if (
      criteria.counties &&
      criteria.counties.length > 0 &&
      questionnaire.county
    ) {
      passed = criteria.counties.includes(questionnaire.county);
      if (!passed) {
        return {
          passed: false,
          criterion: `Program not available in ${questionnaire.county} County`,
        };
      }
    }

    return {
      passed: true,
      criterion: `Available in ${questionnaire.state}${questionnaire.county ? ", " + questionnaire.county + " County" : ""}`,
    };
  }

  private assessCitizenship(
    program: AidProgram,
    questionnaire: QuestionnaireResponse,
    criteria: any,
  ): { passed?: boolean; criterion: string } {
    if (questionnaire.isCitizen === undefined) {
      return { criterion: "Citizenship status required" };
    }

    if (criteria.citizenshipRequired && !questionnaire.isCitizen) {
      return {
        passed: false,
        criterion: "U.S. citizenship or qualified immigration status required",
      };
    }

    return {
      passed: true,
      criterion: "Citizenship requirements met",
    };
  }

  // Helper methods
  private getFederalPovertyLevel(householdSize: number): number {
    const guidelines = FEDERAL_POVERTY_GUIDELINES[2024];

    if (householdSize <= 8) {
      return guidelines[householdSize as keyof typeof guidelines];
    } else {
      // For each additional person, add $5,380 (2024 guideline)
      return guidelines[8] + (householdSize - 8) * 5380;
    }
  }

  private hasHardFailures(failedCriteria: string[]): boolean {
    // Define criteria that are absolute disqualifiers
    const hardFailures = [
      "income exceeds",
      "not available in",
      "citizenship required",
      "age requirement",
    ];

    return failedCriteria.some((criterion) =>
      hardFailures.some((hardFailure) =>
        criterion.toLowerCase().includes(hardFailure),
      ),
    );
  }

  private generateRecommendations(
    programResults: RulesEngineResult[],
    questionnaire: QuestionnaireResponse,
  ): string[] {
    const recommendations: string[] = [];

    // Prioritize by eligibility and program importance
    const eligiblePrograms = programResults
      .filter((r) => r.eligibilityStatus === "eligible")
      .sort((a, b) => b.confidenceScore - a.confidenceScore);

    const possiblePrograms = programResults
      .filter((r) => r.eligibilityStatus === "possibly_eligible")
      .sort((a, b) => b.confidenceScore - a.confidenceScore);

    // High priority recommendations
    if (questionnaire.currentHousingStatus === HousingStatus.UNSHELTERED) {
      const housingPrograms = eligiblePrograms.filter((p) =>
        p.programName.toLowerCase().includes("housing"),
      );
      housingPrograms.forEach((p) => recommendations.push(p.programId));
    }

    // Add other eligible programs
    eligiblePrograms.slice(0, 5).forEach((p) => {
      if (!recommendations.includes(p.programId)) {
        recommendations.push(p.programId);
      }
    });

    // Add possible programs if space allows
    possiblePrograms.slice(0, 3).forEach((p) => {
      if (
        !recommendations.includes(p.programId) &&
        recommendations.length < 8
      ) {
        recommendations.push(p.programId);
      }
    });

    return recommendations;
  }

  private generateNextSteps(
    programResults: RulesEngineResult[],
    questionnaire: QuestionnaireResponse,
  ): string[] {
    const steps: string[] = [];

    const eligiblePrograms = programResults.filter(
      (r) => r.eligibilityStatus === "eligible",
    );
    const possiblePrograms = programResults.filter(
      (r) => r.eligibilityStatus === "possibly_eligible",
    );

    if (eligiblePrograms.length > 0) {
      steps.push("Apply for programs where you appear eligible");
      steps.push("Gather required documentation (see document list)");
      steps.push("Contact program offices to confirm current availability");
    }

    if (possiblePrograms.length > 0) {
      steps.push(
        "Provide additional information to clarify eligibility for some programs",
      );
      steps.push("Speak with a benefits counselor for personalized assistance");
    }

    // Missing information steps
    const needsInfo = programResults.some(
      (r) => r.missingInformation.length > 0,
    );
    if (needsInfo) {
      steps.push("Complete missing information to improve assessment accuracy");
    }

    // Emergency situations
    if (questionnaire.currentHousingStatus === HousingStatus.UNSHELTERED) {
      steps.unshift(
        "Seek immediate shelter assistance - call 211 or local crisis line",
      );
    }

    steps.push("Save this assessment and bring it when applying for benefits");

    return steps;
  }

  private aggregateRequiredDocuments(
    programResults: RulesEngineResult[],
  ): string[] {
    const documents = new Set<string>();

    // Standard documents for most programs
    documents.add(
      "Photo identification (driver's license, state ID, passport)",
    );
    documents.add("Social Security card or verification letter");
    documents.add(
      "Proof of income (pay stubs, benefit letters, bank statements)",
    );
    documents.add("Proof of address or residency");

    // Program-specific documents
    const eligiblePrograms = programResults.filter(
      (r) =>
        r.eligibilityStatus === "eligible" ||
        r.eligibilityStatus === "possibly_eligible",
    );

    eligiblePrograms.forEach((program) => {
      if (
        program.programName.toLowerCase().includes("snap") ||
        program.programName.toLowerCase().includes("food")
      ) {
        documents.add("Household composition verification");
        documents.add("Rent/mortgage receipts");
        documents.add("Utility bills");
      }

      if (program.programName.toLowerCase().includes("housing")) {
        documents.add("Housing history or rental references");
        documents.add("Birth certificates for all household members");
      }

      if (program.programName.toLowerCase().includes("tanf")) {
        documents.add("School enrollment verification (if applicable)");
        documents.add("Work registration or exemption documentation");
      }
    });

    return Array.from(documents).sort();
  }

  // Public methods for program management
  async refreshPrograms(): Promise<void> {
    await this.initializePrograms();
  }

  async getProgramById(programId: string): Promise<AidProgram | null> {
    return prisma.aidProgram.findUnique({
      where: { id: programId },
    });
  }

  async getActivePrograms(): Promise<AidProgram[]> {
    return prisma.aidProgram.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }
}

// Export singleton instance
export const eligibilityRulesEngine = new EligibilityRulesEngine();
