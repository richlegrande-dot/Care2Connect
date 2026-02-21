/**
 * No-Op AI Provider
 *
 * Returns minimal/stub responses for all AI operations
 * Used in "none" mode for complete AI disable
 */

import {
  AIProvider,
  ExtractedProfileData,
  DonationPitch,
  GoFundMeDraft,
  ResourceClassification,
} from "./types";

export class NoOpAIProvider implements AIProvider {
  readonly name = "No-Op Provider";
  readonly type = "none" as const;

  isAvailable(): boolean {
    return true; // Always available
  }

  /**
   * Returns minimal profile data
   */
  async extractProfileData(transcript: string): Promise<ExtractedProfileData> {
    console.log("[NoOpAIProvider] Skipping profile extraction - V1 mode");

    return {
      summary:
        "A community member shared their story. Please add details manually.",
      tags: [],
      extractionMethod: "manual",
      confidence: 0,
    };
  }

  /**
   * Returns fallback donation pitch
   */
  async generateDonationPitch(
    profileData: Partial<ExtractedProfileData>,
  ): Promise<DonationPitch> {
    console.log(
      "[NoOpAIProvider] Skipping donation pitch generation - V1 mode",
    );

    const pitch = "Every contribution helps provide stability and opportunity.";

    return {
      pitch,
      length: pitch.length,
      method: "fallback",
    };
  }

  /**
   * Returns minimal GoFundMe draft
   */
  async generateGoFundMeDraft(input: {
    transcript?: string;
    formData?: any;
  }): Promise<GoFundMeDraft> {
    console.log("[NoOpAIProvider] Skipping GoFundMe generation - V1 mode");

    // Use form data if provided
    if (input.formData) {
      return {
        title: input.formData.title || "Support Needed",
        story: input.formData.description || "Please add story details.",
        goalAmount: input.formData.goalAmount
          ? parseInt(input.formData.goalAmount, 10)
          : undefined,
        category: "General Support",
        summary: "A community member is seeking support.",
        generationMethod: "manual",
      };
    }

    return {
      title: "Support Needed",
      story: "Please add story details manually.",
      category: "General Support",
      summary: "A community member is seeking support.",
      generationMethod: "manual",
    };
  }

  /**
   * Returns generic classification
   */
  async classifyResource(resource: {
    name: string;
    description: string;
    address?: string;
  }): Promise<ResourceClassification> {
    console.log("[NoOpAIProvider] Skipping resource classification - V1 mode");

    return {
      category: "GENERAL",
      confidenceScore: 0,
      method: "manual",
    };
  }
}
