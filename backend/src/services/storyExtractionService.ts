import { getValidEnvKey } from "../utils/keys";
import {
  GoFundMeDraft,
  GoFundMeDraftSchema,
  checkRequiredFields,
  validateGoFundMeDraft,
} from "../schemas/gofundmeDraft.schema";
import { JsonRepairUtil } from "../utils/jsonRepair";
import { getAIProvider } from "../providers/ai";
import {
  extractGoalAmount,
  extractUrgency,
  validateGoFundMeData,
  generateDefaultGoalAmount,
  extractName,
} from "../utils/extraction/rulesEngine";
import { extractSignals } from "./speechIntelligence/transcriptSignalExtractor";

// Phase 2: Load v2c category enhancement
let CategoryEnhancements_v2c: any = null;
try {
  if (process.env.USE_V2C_ENHANCEMENTS === "true") {
    CategoryEnhancements_v2c = require("./CategoryEnhancements_v2c.js");
    console.log(
      "✅ CategoryEnhancements_v2c loaded - Phase 2 category improvements active",
    );
  }
} catch (error) {
  console.warn(
    "⚠️ CategoryEnhancements_v2c not found, using baseline category classification",
  );
}

export interface ExtractionResult {
  draft: GoFundMeDraft;
  success: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
}

export class StoryExtractionService {
  constructor() {
    // V1: Using AI provider abstraction (rules/template mode)
    const provider = getAIProvider();
    console.log("[StoryExtraction] Using AI provider:", provider.name);
  }

  /**
   * Extract structured GoFundMe data from transcript (Enhanced V1: Uses intelligent parsing)
   */
  async extractGoFundMeData(
    transcript: string,
    formData?: any,
  ): Promise<ExtractionResult> {
    try {
      const aiProvider = getAIProvider();
      console.log(
        "[StoryExtraction] Generating GoFundMe draft using:",
        aiProvider.name,
      );

      // First, use enhanced signal extraction to get better parsing
      const signals = await extractSignals({ text: transcript });
      console.log("[StoryExtraction] Enhanced signals extracted:", {
        name: signals.nameCandidate,
        goalAmount: signals.goalAmount,
        urgency: signals.urgencyLevel,
        category:
          signals.needsCategories.length > 0
            ? signals.needsCategories[0].category
            : "NONE",
      });

      // Use AI provider abstraction with enhanced signals as hints
      const draftResult = await aiProvider.generateGoFundMeDraft({
        transcript,
        formData, // Optional form data for V1 form-driven approach
        extractedSignals: signals, // Pass enhanced signals to improve AI generation
      });

      // Apply intelligent fallbacks for missing data with Phase 2 category enhancement
      let enhancedCategory =
        draftResult.category ||
        (signals.needsCategories.length > 0
          ? signals.needsCategories[0].category
          : "General Support");

      // Phase 2: Apply v2c category enhancement if available
      if (
        CategoryEnhancements_v2c &&
        process.env.USE_V2C_ENHANCEMENTS === "true"
      ) {
        const v2cCategory = CategoryEnhancements_v2c.getEnhancedCategory(
          transcript,
          { originalCategory: enhancedCategory },
        );
        if (v2cCategory && v2cCategory !== enhancedCategory) {
          console.log(
            `🎯 Phase 2 Category Enhancement: ${enhancedCategory} → ${v2cCategory}`,
          );
          enhancedCategory = v2cCategory;
        }
      }

      let extractedData: any = {
        title: draftResult.title || this.generateFallbackTitle(signals),
        story: draftResult.story || transcript,
        goalAmount:
          draftResult.goalAmount ||
          signals.goalAmount ||
          signals.dataValidation.suggestions.goalAmount,
        category: enhancedCategory,
        beneficiary:
          draftResult.beneficiary ||
          signals.nameCandidate ||
          "Individual in need",
        location:
          draftResult.location ||
          (signals.locationCandidates.length > 0
            ? signals.locationCandidates[0]
            : null),
        summary:
          draftResult.summary ||
          this.generateFallbackSummary(transcript, signals),
        tags: draftResult.tags || this.generateFallbackTags(signals),
        urgency: this.normalizeUrgencyLevel(signals.urgencyLevel),
        timeline:
          draftResult.timeline ||
          this.estimateTimelineFromUrgency(signals.urgencyLevel),
        extractedAt: new Date(),
        lastUpdated: new Date(),
      };

      // Validate the enhanced data using our validation system
      const dataValidation = validateGoFundMeData(
        extractedData.title,
        extractedData.story,
        extractedData.goalAmount,
        extractedData.category,
        extractedData.beneficiary,
        transcript,
      );

      // Apply suggestions if validation suggests improvements
      if (!dataValidation.isComplete) {
        console.log(
          "[StoryExtraction] Applying suggestions for incomplete data",
        );
        for (const [field, suggestion] of Object.entries(
          dataValidation.suggestions,
        )) {
          if (!extractedData[field] || extractedData[field] === null) {
            extractedData[field] = suggestion;
            console.log(
              `[StoryExtraction] Applied suggestion for ${field}:`,
              suggestion,
            );
          }
        }
      }

      // Normalize date fields if AI returned ISO strings
      if (extractedData && typeof extractedData.extractedAt === "string") {
        try {
          extractedData.extractedAt = new Date(extractedData.extractedAt);
        } catch {}
      }
      if (extractedData && typeof extractedData.lastUpdated === "string") {
        try {
          extractedData.lastUpdated = new Date(extractedData.lastUpdated);
        } catch {}
      }

      // Validate against schema
      const validation = validateGoFundMeDraft(extractedData);
      if (!validation.success) {
        console.error("Schema validation failed:", validation.error);
        return this.createFallbackResult(transcript, validation.error.issues);
      }

      const draft = validation.data;

      // Check for missing fields and generate follow-up questions (enhanced)
      const missingFields = checkRequiredFields(draft);
      const enhancedMissingFields = signals.missingFields.filter(
        (field) =>
          !["name", "goalAmount", "story"].includes(field) ||
          !draft[field as keyof GoFundMeDraft],
      );

      draft.missingFields = [
        ...new Set([...missingFields, ...enhancedMissingFields]),
      ];
      draft.followUpQuestions = this.generateEnhancedFollowUpQuestions(
        draft.missingFields,
        signals,
        dataValidation,
      ).filter((q): q is NonNullable<typeof q> => q !== null);

      // Calculate enhanced confidence
      const confidence = this.calculateEnhancedConfidence(
        draft,
        signals,
        dataValidation,
      );

      return {
        draft,
        success: true,
        confidence,
        errors: [],
        warnings:
          draft.missingFields.length > 0
            ? ["Some fields enhanced with intelligent suggestions"]
            : [],
      };
    } catch (error) {
      console.error("Story extraction error:", error);
      return this.createFallbackResult(transcript, [
        error instanceof Error ? error.message : "Unknown error",
      ]);
    }
  }

  /**
   * Merge follow-up answers into existing draft
   */
  async mergeFollowUpAnswers(
    draft: GoFundMeDraft,
    answers: Array<{ field: string; answer: string }>,
  ): Promise<GoFundMeDraft> {
    const updatedDraft = { ...draft };

    for (const answer of answers) {
      const fieldName = answer.field as keyof GoFundMeDraft;

      if (
        updatedDraft[fieldName] &&
        typeof updatedDraft[fieldName] === "object"
      ) {
        const fieldData = updatedDraft[fieldName] as any;

        // Parse the answer based on field type
        let parsedValue = this.parseAnswerByField(answer.field, answer.answer);

        fieldData.value = parsedValue;
        fieldData.confidence = 1.0; // Manual answers have high confidence
        fieldData.source = "followup";
      }
    }

    // Re-check missing fields
    updatedDraft.missingFields = checkRequiredFields(updatedDraft);
    updatedDraft.followUpQuestions = this.generateFollowUpQuestions(
      updatedDraft.missingFields,
    ).filter((q): q is NonNullable<typeof q> => q !== null);
    updatedDraft.lastUpdated = new Date();

    return updatedDraft;
  }

  /**
   * Build the system prompt for AI extraction
   */
  private buildSystemPrompt(): string {
    return `You are an AI assistant that extracts structured data from spoken stories to help create GoFundMe campaigns.

CRITICAL: You MUST return valid JSON that matches this exact structure:

{
  "name": {"value": "string or null", "confidence": 0.0-1.0},
  "dateOfBirth": {"value": "MM/DD/YYYY or null", "confidence": 0.0-1.0},
  "location": {
    "value": {
      "country": "string",
      "state": "string or null", 
      "zip": "string or null",
      "city": "string or null"
    },
    "confidence": 0.0-1.0
  },
  "beneficiary": {"value": "myself|someone-else|charity or null", "confidence": 0.0-1.0},
  "category": {"value": "Medical|Emergency|Memorial|Education|Nonprofit|Housing|Animal|Environment|Community|Sports|Creative|Travel|Family|Business|Dreams|Faith|Competitions|Other or null", "confidence": 0.0-1.0},
  "goalAmount": {"value": number or null, "confidence": 0.0-1.0},
  "title": {"value": "string or null", "confidence": 0.0-1.0},
  "storyBody": {"value": "string or null", "confidence": 0.0-1.0},
  "shortSummary": {"value": "string or null", "confidence": 0.0-1.0},
  "contact": {
    "value": {
      "email": "string or null",
      "phone": "string or null",
      "preferredMethod": "email|phone|none or null"
    },
    "confidence": 0.0-1.0
  },
  "consentToPublish": false,
  "transcript": "full transcript here",
  "missingFields": [],
  "followUpQuestions": [],
  "extractedAt": "2024-01-01T00:00:00.000Z",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}

EXTRACTION GUIDELINES:
- Only extract information explicitly mentioned in the story
- Use confidence scores: 0.8-1.0 (very clear), 0.5-0.7 (somewhat clear), 0.1-0.4 (unclear/inferred), 0.0 (not mentioned)
- For title: Create a compelling, dignified title from the story (10+ chars)
- For storyBody: Use the person's own words but clean up for readability (50+ chars)
- For shortSummary: 1-2 sentence summary under 200 chars
- For category: Choose the most relevant category from the list
- For goalAmount: Only extract if specific amount mentioned, otherwise null
- For beneficiary: "myself" unless clearly helping someone else
- Be respectful and maintain dignity
- Set consentToPublish to false (will be handled separately)`;
  }

  /**
   * Build the user prompt with the transcript
   */
  private buildUserPrompt(transcript: string): string {
    return `Please extract GoFundMe campaign data from this story transcript:

"${transcript}"

Return the data as valid JSON following the exact structure specified in the system prompt.`;
  }

  /**
   * Generate follow-up questions for missing fields
   */
  private generateFollowUpQuestions(missingFields: string[]) {
    const questionMap: Record<
      string,
      {
        question: string;
        type: "text" | "select" | "number" | "date";
        options?: string[];
      }
    > = {
      name: {
        question: "What name would you like to use for your campaign?",
        type: "text",
      },
      dateOfBirth: {
        question: "What is your date of birth? (MM/DD/YYYY)",
        type: "date",
      },
      "location.zip": {
        question: "What ZIP code are you currently in?",
        type: "text",
      },
      "location.city": {
        question: "What city are you currently in?",
        type: "text",
      },
      "location.state": {
        question: "What state are you currently in?",
        type: "text",
      },
      category: {
        question: "Which category best fits your situation?",
        type: "select",
        options: [
          "Medical",
          "Emergency",
          "Housing",
          "Education",
          "Family",
          "Community",
          "Memorial",
          "Animal",
          "Creative",
          "Travel",
          "Sports",
          "Business",
          "Dreams",
          "Faith",
          "Nonprofit",
          "Other",
        ],
      },
      goalAmount: {
        question: "What is your fundraising goal amount in dollars?",
        type: "number",
      },
      title: {
        question: "What title would you like for your campaign?",
        type: "text",
      },
      "contact.email": {
        question: "What email address should we use to contact you? (Optional)",
        type: "text",
      },
      "contact.phone": {
        question: "What phone number should we use to contact you? (Optional)",
        type: "text",
      },
    };

    return missingFields
      .map((field) => {
        const questionData = questionMap[field];
        if (questionData) {
          return {
            field,
            question: questionData.question,
            type: questionData.type,
            options: questionData.options,
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  /**
   * Parse answer based on field type
   */
  private parseAnswerByField(field: string, answer: string): any {
    switch (field) {
      case "goalAmount":
        const amount = parseFloat(answer.replace(/[^\d.]/g, ""));
        return isNaN(amount) ? null : amount;

      case "dateOfBirth":
        // Basic date validation for MM/DD/YYYY format
        const dateMatch = answer.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        return dateMatch ? answer : null;

      case "location.zip":
        // Basic ZIP validation
        const zipMatch = answer.match(/(\d{5}(-\d{4})?)/);
        return zipMatch ? zipMatch[1] : answer;

      case "category":
        // Ensure category is valid
        const validCategories = [
          "Medical",
          "Emergency",
          "Memorial",
          "Education",
          "Nonprofit",
          "Housing",
          "Animal",
          "Environment",
          "Community",
          "Sports",
          "Creative",
          "Travel",
          "Family",
          "Business",
          "Dreams",
          "Faith",
          "Competitions",
          "Other",
        ];
        const category = validCategories.find(
          (cat) => cat.toLowerCase() === answer.toLowerCase(),
        );
        return category || answer;

      default:
        return answer.trim();
    }
  }

  /**
   * Generate fallback title based on extracted signals
   */
  private generateFallbackTitle(signals: any): string {
    const name = signals.nameCandidate || "Individual";
    const category =
      signals.needsCategories.length > 0
        ? signals.needsCategories[0].category.toLowerCase()
        : "support";
    const urgency = signals.urgencyLevel;

    if (urgency === "CRITICAL" || urgency === "HIGH") {
      return `Emergency ${category} support needed for ${name}`;
    } else {
      return `Help ${name} with ${category} assistance`;
    }
  }

  /**
   * Generate fallback summary based on transcript and signals
   */
  private generateFallbackSummary(transcript: string, signals: any): string {
    const truncated = transcript.substring(0, 150);
    const category =
      signals.needsCategories.length > 0
        ? signals.needsCategories[0].category.toLowerCase()
        : "support";

    return `${truncated}${transcript.length > 150 ? "..." : ""} - ${category} assistance needed.`;
  }

  /**
   * Generate fallback tags based on extracted signals
   */
  private generateFallbackTags(signals: any): string[] {
    const tags: string[] = [];

    // Add category-based tags
    signals.needsCategories.forEach((category: any) => {
      tags.push(category.category.toLowerCase());
    });

    // Add urgency-based tags
    if (
      signals.urgencyLevel === "CRITICAL" ||
      signals.urgencyLevel === "HIGH"
    ) {
      tags.push("emergency", "urgent");
    }

    // Add location-based tags
    if (signals.locationCandidates.length > 0) {
      tags.push("local community");
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Normalize urgency level to our schema format
   */
  private normalizeUrgencyLevel(urgencyLevel: string): string {
    const mapping: { [key: string]: string } = {
      CRITICAL: "high",
      HIGH: "high",
      MEDIUM: "medium",
      LOW: "low",
    };
    return mapping[urgencyLevel] || "medium";
  }

  /**
   * Estimate timeline based on urgency
   */
  private estimateTimelineFromUrgency(urgencyLevel: string): string | null {
    const mapping: { [key: string]: string } = {
      CRITICAL: "24-48 hours",
      HIGH: "1-2 weeks",
      MEDIUM: "2-4 weeks",
      LOW: "1-2 months",
    };
    return mapping[urgencyLevel] || null;
  }

  /**
   * Generate enhanced follow-up questions based on missing fields and signals
   */
  private generateEnhancedFollowUpQuestions(
    missingFields: string[],
    signals: any,
    validation: any,
  ): Array<string | null> {
    const questions: Array<string | null> = [];

    for (const field of missingFields) {
      switch (field) {
        case "goalAmount":
          if (!signals.goalAmount) {
            const suggested = validation.suggestions.goalAmount;
            questions.push(
              suggested
                ? `We estimated you might need $${suggested} based on your situation. Is this amount correct, or would you like to specify a different goal?`
                : "What is your fundraising goal amount?",
            );
          }
          break;

        case "name":
          if (!signals.nameCandidate) {
            questions.push("Could you please tell us your full name?");
          }
          break;

        case "title":
          const suggestedTitle = validation.suggestions.title;
          if (suggestedTitle) {
            questions.push(
              `We suggested the title "${suggestedTitle}". Would you like to use this or provide a different title?`,
            );
          } else {
            questions.push(
              "What would you like the title of your fundraiser to be?",
            );
          }
          break;

        case "category":
          if (signals.needsCategories.length === 0) {
            questions.push(
              "What category best describes your fundraising need? (Medical, Housing, Emergency, Education, etc.)",
            );
          }
          break;

        default:
          // Use existing method for other fields
          const defaultQuestion = this.generateFollowUpQuestions([field])[0];
          if (defaultQuestion) {
            questions.push(defaultQuestion);
          }
      }
    }

    return questions;
  }

  /**
   * Calculate enhanced confidence score using signals and validation data
   */
  private calculateEnhancedConfidence(
    draft: any,
    signals: any,
    validation: any,
  ): number {
    let confidence = validation.confidence; // Base confidence from validation

    // Boost confidence for extracted goal amounts
    if (signals.goalAmount) {
      confidence += 0.1;
    }

    // Boost confidence for high-quality signal extraction
    if (signals.nameCandidate && signals.confidence.name > 0.7) {
      confidence += 0.1;
    }

    if (signals.needsCategories.length > 0 && signals.confidence.needs > 0.8) {
      confidence += 0.1;
    }

    // Penalize for many missing fields
    const missingPenalty = Math.min(0.3, draft.missingFields.length * 0.05);
    confidence -= missingPenalty;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Calculate overall confidence (original method - keeping for compatibility)
   */
  private calculateOverallConfidence(draft: GoFundMeDraft): number {
    const fields = [
      draft.name,
      draft.location,
      draft.category,
      draft.goalAmount,
      draft.title,
      draft.storyBody,
      draft.shortSummary,
    ];

    const confidenceScores = fields
      .filter((field) => field?.confidence !== undefined)
      .map((field) => field!.confidence);

    if (confidenceScores.length === 0) return 0;

    return (
      confidenceScores.reduce((sum, score) => sum + score, 0) /
      confidenceScores.length
    );
  }

  /**
   * Create fallback result when extraction fails
   */
  private createFallbackResult(
    transcript: string,
    errors: any[] = [],
  ): ExtractionResult {
    const fallbackDraft: GoFundMeDraft = {
      name: { value: undefined, confidence: 0, source: "extracted" as const },
      dateOfBirth: {
        value: undefined,
        confidence: 0,
        source: "extracted" as const,
      },
      location: {
        value: { country: "United States" },
        confidence: 0,
        source: "extracted" as const,
      },
      beneficiary: {
        value: "myself",
        confidence: 0.5,
        source: "extracted" as const,
      },
      category: {
        value: undefined,
        confidence: 0,
        source: "extracted" as const,
      },
      goalAmount: {
        value: undefined,
        confidence: 0,
        source: "extracted" as const,
      },
      title: { value: undefined, confidence: 0, source: "extracted" as const },
      storyBody: {
        value: transcript || undefined,
        confidence: transcript ? 1.0 : 0,
        source: "extracted" as const,
      },
      shortSummary: {
        value: undefined,
        confidence: 0,
        source: "extracted" as const,
      },
      contact: { value: {}, confidence: 0, source: "extracted" as const },
      consentToPublish: false,
      transcript,
      missingFields: [
        "name",
        "dateOfBirth",
        "location",
        "category",
        "goalAmount",
        "title",
        "shortSummary",
      ],
      followUpQuestions: this.generateFollowUpQuestions([
        "name",
        "dateOfBirth",
        "location.zip",
        "category",
        "goalAmount",
        "title",
      ]).filter((q): q is NonNullable<typeof q> => q !== null),
      extractedAt: new Date(),
      lastUpdated: new Date(),
    };

    return {
      draft: fallbackDraft,
      success: false,
      confidence: 0.1,
      errors: errors.map((e) => String(e)),
      warnings: ["Extraction failed - manual entry mode enabled"],
    };
  }
}

export default StoryExtractionService;
