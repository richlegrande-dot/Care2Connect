/**
 * Donation Draft Requirements
 *
 * Defines validation rules and quality checks for GoFundMe drafts.
 * Used to determine if a draft is ready or needs more information.
 */

export interface DraftRequirements {
  required: {
    title: boolean;
    story: boolean;
    beneficiaryName: boolean; // Can be "Anonymous" temporarily
    goalAmount: boolean; // MUST be user-provided
  };
  recommended: {
    location: boolean;
    category: boolean;
    duration: boolean; // How long help is needed
  };
  optional: {
    email: boolean;
    phone: boolean;
    socialMedia: boolean;
  };
}

export const MINIMUM_STORY_LENGTH = 100; // characters
export const MINIMUM_TITLE_LENGTH = 10; // characters
export const MAXIMUM_STORY_LENGTH = 5000; // GoFundMe limit
export const MINIMUM_GOAL_AMOUNT = 100; // $1.00 USD minimum
export const MAXIMUM_GOAL_AMOUNT = 100000000; // $1,000,000 USD maximum

export interface DonationDraftData {
  title?: string;
  story?: string;
  beneficiaryName?: string;
  goalAmount?: number; // In cents
  location?: string;
  category?: string;
  duration?: string;
  email?: string;
  phone?: string;
}

export interface ValidationResult {
  isComplete: boolean;
  missingFields: string[];
  recommendedFields: string[];
  qualityScore: number; // 0.0-1.0
  issues: string[];
  suggestedQuestions: string[];
}

/**
 * Validate draft completeness and quality
 */
export function validateDraftCompleteness(
  draft: DonationDraftData,
): ValidationResult {
  const missingFields: string[] = [];
  const recommendedFields: string[] = [];
  const issues: string[] = [];
  const suggestedQuestions: string[] = [];
  let qualityScore = 1.0;

  // === REQUIRED FIELDS ===

  // Title
  if (!draft.title || draft.title.trim().length === 0) {
    missingFields.push("title");
    suggestedQuestions.push("What should the title of your fundraiser be?");
    qualityScore -= 0.25;
  } else if (draft.title.trim().length < MINIMUM_TITLE_LENGTH) {
    issues.push(`Title too short (minimum ${MINIMUM_TITLE_LENGTH} characters)`);
    qualityScore -= 0.1;
  }

  // Story
  if (!draft.story || draft.story.trim().length === 0) {
    missingFields.push("story");
    suggestedQuestions.push("Can you tell us more about your situation?");
    qualityScore -= 0.3;
  } else if (draft.story.trim().length < MINIMUM_STORY_LENGTH) {
    issues.push(`Story too short (minimum ${MINIMUM_STORY_LENGTH} characters)`);
    qualityScore -= 0.15;
  } else if (draft.story.trim().length > MAXIMUM_STORY_LENGTH) {
    issues.push(`Story too long (maximum ${MAXIMUM_STORY_LENGTH} characters)`);
    qualityScore -= 0.1;
  }

  // Beneficiary Name
  if (!draft.beneficiaryName || draft.beneficiaryName.trim().length === 0) {
    missingFields.push("beneficiaryName");
    suggestedQuestions.push("What is your full name?");
    qualityScore -= 0.2;
  }

  // Goal Amount (CRITICAL - must be user-provided)
  if (!draft.goalAmount || draft.goalAmount <= 0) {
    missingFields.push("goalAmount");
    suggestedQuestions.push("How much money do you need to raise?");
    qualityScore -= 0.35; // Heaviest penalty
  } else if (draft.goalAmount < MINIMUM_GOAL_AMOUNT) {
    issues.push(`Goal amount too low (minimum $${MINIMUM_GOAL_AMOUNT / 100})`);
    qualityScore -= 0.1;
  } else if (draft.goalAmount > MAXIMUM_GOAL_AMOUNT) {
    issues.push(`Goal amount too high (maximum $${MAXIMUM_GOAL_AMOUNT / 100})`);
    qualityScore -= 0.1;
  }

  // === RECOMMENDED FIELDS ===

  // Location
  if (!draft.location || draft.location.trim().length === 0) {
    recommendedFields.push("location");
    suggestedQuestions.push("Where are you located? (City, State)");
    qualityScore -= 0.05;
  }

  // Category
  if (!draft.category || draft.category.trim().length === 0) {
    recommendedFields.push("category");
    // Don't ask user - can be inferred from needs
  }

  // Duration
  if (!draft.duration || draft.duration.trim().length === 0) {
    recommendedFields.push("duration");
    suggestedQuestions.push("How long will you need this financial help?");
    qualityScore -= 0.03;
  }

  // === OPTIONAL FIELDS (no penalty) ===

  // Email, Phone, Social Media - tracked but not penalized

  // Calculate final score
  qualityScore = Math.max(qualityScore, 0.0);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    recommendedFields,
    qualityScore,
    issues,
    suggestedQuestions,
  };
}

/**
 * Generate user-friendly prompt for missing information
 */
export function generateMissingInfoPrompt(validation: ValidationResult): {
  message: string;
  fieldPrompts: Record<string, string>;
  suggestions: Record<string, string[]>;
} {
  const fieldPrompts: Record<string, string> = {
    title: "What should the title of your fundraiser be?",
    story: "Can you provide more details about your situation?",
    beneficiaryName: "What is your full name?",
    goalAmount: "How much money do you need to raise?",
    location: "Where are you located? (City, State)",
    category: "What category best describes your need?",
    duration: "How long will you need this financial help?",
    email: "What is your email address? (optional)",
    phone: "What is your phone number? (optional)",
  };

  const suggestions: Record<string, string[]> = {
    goalAmount: ["$500", "$1,000", "$2,000", "$5,000", "$10,000"],
    category: [
      "Housing",
      "Medical",
      "Employment",
      "Family",
      "Education",
      "Emergency",
    ],
    duration: ["1 month", "3 months", "6 months", "1 year", "Ongoing"],
    location: [], // Will be populated from transcript if available
  };

  let message = "We need a bit more information to create your fundraiser:\n\n";

  if (validation.missingFields.length > 0) {
    message += `**Required:**\n`;
    validation.missingFields.forEach((field) => {
      message += `- ${fieldPrompts[field] || field}\n`;
    });
  }

  if (validation.recommendedFields.length > 0) {
    message += `\n**Recommended:**\n`;
    validation.recommendedFields.forEach((field) => {
      message += `- ${fieldPrompts[field] || field}\n`;
    });
  }

  if (validation.issues.length > 0) {
    message += `\n**Issues to address:**\n`;
    validation.issues.forEach((issue) => {
      message += `- ${issue}\n`;
    });
  }

  return {
    message,
    fieldPrompts,
    suggestions,
  };
}

/**
 * Format goal amount for display
 */
export function formatGoalAmount(amountCents: number): string {
  const dollars = amountCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

/**
 * Suggest goal amount based on needs categories
 */
export function suggestGoalAmount(needsCategories: string[]): number[] {
  // Default suggestions
  const defaultSuggestions = [50000, 100000, 200000, 500000]; // $500, $1k, $2k, $5k

  // Category-specific suggestions (in cents)
  const categoryAmounts: Record<string, number[]> = {
    HOUSING: [100000, 200000, 300000, 500000], // $1k-$5k (rent/deposit)
    HEALTHCARE: [200000, 500000, 1000000, 2000000], // $2k-$20k (medical)
    EMPLOYMENT: [50000, 100000, 150000, 300000], // $500-$3k (job search)
    SAFETY: [150000, 250000, 400000, 600000], // $1.5k-$6k (relocation)
    TRANSPORTATION: [100000, 200000, 300000, 500000], // $1k-$5k (car/repairs)
    FOOD: [25000, 50000, 100000, 200000], // $250-$2k (groceries)
    UTILITIES: [50000, 100000, 150000, 300000], // $500-$3k (bills)
    CHILDCARE: [100000, 200000, 400000, 600000], // $1k-$6k (daycare)
    LEGAL: [200000, 500000, 1000000, 1500000], // $2k-$15k (attorney)
    EDUCATION: [150000, 300000, 500000, 1000000], // $1.5k-$10k (tuition)
    MENTAL_HEALTH: [100000, 200000, 400000, 800000], // $1k-$8k (therapy)
    ADDICTION: [300000, 500000, 1000000, 1500000], // $3k-$15k (rehab)
  };

  // Use highest-priority category if available
  if (needsCategories.length > 0) {
    const primaryCategory = needsCategories[0];
    if (categoryAmounts[primaryCategory]) {
      return categoryAmounts[primaryCategory];
    }
  }

  return defaultSuggestions;
}

/**
 * Suggest category based on needs
 */
export function suggestCategory(needsCategories: string[]): string {
  if (needsCategories.length === 0) {
    return "Emergency";
  }

  // Map internal categories to GoFundMe categories
  const categoryMapping: Record<string, string> = {
    HOUSING: "Housing",
    HEALTHCARE: "Medical",
    EMPLOYMENT: "Business",
    SAFETY: "Emergency",
    TRANSPORTATION: "Transportation",
    FOOD: "Emergency",
    UTILITIES: "Bills",
    CHILDCARE: "Family",
    LEGAL: "Legal",
    EDUCATION: "Education",
    MENTAL_HEALTH: "Medical",
    ADDICTION: "Medical",
  };

  const primaryCategory = needsCategories[0];
  return categoryMapping[primaryCategory] || "Emergency";
}

/**
 * Suggest duration based on needs and urgency
 */
export function suggestDuration(
  urgencyScore: number,
  needsCategories: string[],
): string {
  // High urgency = shorter duration
  if (urgencyScore > 0.7) {
    return "1-2 months";
  }

  // Housing/employment typically longer
  if (
    needsCategories.includes("HOUSING") ||
    needsCategories.includes("EMPLOYMENT")
  ) {
    return "3-6 months";
  }

  // Default
  return "2-3 months";
}
