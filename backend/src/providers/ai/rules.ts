/**
 * Rules-Based AI Provider
 * 
 * Implements AI operations using rules, patterns, and templates
 * NO external API calls - fully deterministic
 */

import {
  AIProvider,
  ExtractedProfileData,
  DonationPitch,
  GoFundMeDraft,
  ResourceClassification,
} from './types';
import {
  extractName,
  extractAge,
  extractPhone,
  extractEmail,
  extractLocation,
  extractNeeds,
  extractSkills,
  calculateConfidence,
  generateTemplateSummary,
  scoreKeywords,
  NEEDS_KEYWORDS,
} from '../../utils/extraction/rulesEngine';
import {
  generateDonationPitchFromTemplate,
  generateStoryFromTemplate,
} from '../../utils/templates/storyTemplates';

export class RulesBasedAIProvider implements AIProvider {
  readonly name = 'Rules-Based Provider';
  readonly type = 'rules' as const;

  isAvailable(): boolean {
    return true; // Always available - no external dependencies
  }

  /**
   * Extract profile data using rules and patterns
   */
  async extractProfileData(transcript: string): Promise<ExtractedProfileData> {
    const name = extractName(transcript);
    const age = extractAge(transcript);
    const phone = extractPhone(transcript);
    const email = extractEmail(transcript);
    const location = extractLocation(transcript);
    const urgentNeeds = extractNeeds(transcript, 3);
    const skills = extractSkills(transcript, 5);
    
    const confidence = calculateConfidence(name, age, urgentNeeds, phone, email);
    const summary = generateTemplateSummary(name, urgentNeeds, transcript.length);
    
    // Generate donation pitch
    const donationPitch = generateDonationPitchFromTemplate({
      name,
      primaryNeed: urgentNeeds[0],
      skills,
    });
    
    return {
      name,
      age,
      location,
      phone,
      email,
      skills,
      urgentNeeds,
      summary,
      donationPitch,
      tags: urgentNeeds,
      extractionMethod: 'rules',
      confidence,
    };
  }

  /**
   * Generate donation pitch from template
   */
  async generateDonationPitch(
    profileData: Partial<ExtractedProfileData>
  ): Promise<DonationPitch> {
    const pitch = generateDonationPitchFromTemplate({
      name: profileData.name,
      primaryNeed: profileData.urgentNeeds?.[0],
      skills: profileData.skills,
    });

    return {
      pitch,
      length: pitch.length,
      method: 'template',
    };
  }

  /**
   * Generate GoFundMe draft from form data or transcript
   */
  async generateGoFundMeDraft(input: {
    transcript?: string;
    formData?: any;
  }): Promise<GoFundMeDraft> {
    // In V1 rules mode, we prioritize form data over AI extraction
    if (input.formData) {
      const { title, description, goalAmount, name, primaryNeed } = input.formData;
      
      const story = generateStoryFromTemplate({
        name,
        primaryNeed,
        description,
        goalAmount,
      });
      
      return {
        title: title || story.title,
        story: story.story,
        goalAmount: goalAmount ? parseInt(goalAmount, 10) : undefined,
        category: primaryNeed || 'General Support',
        summary: story.excerpt,
        generationMethod: 'form',
      };
    }
    
    // If only transcript provided, extract basic info and use template
    if (input.transcript) {
      const profileData = await this.extractProfileData(input.transcript);
      
      const story = generateStoryFromTemplate({
        name: profileData.name,
        primaryNeed: profileData.urgentNeeds?.[0],
        description: profileData.summary,
      });
      
      return {
        title: story.title,
        story: story.story,
        category: profileData.urgentNeeds?.[0] || 'General Support',
        beneficiary: profileData.name,
        location: profileData.location,
        summary: story.excerpt,
        tags: profileData.tags,
        generationMethod: 'template',
      };
    }
    
    // Fallback: minimal draft
    return {
      title: 'Support Needed',
      story: 'A community member is seeking support. Please edit this draft to add their story.',
      category: 'General Support',
      summary: 'A community member is seeking support.',
      generationMethod: 'template',
    };
  }

  /**
   * Classify resource using keyword scoring
   */
  async classifyResource(resource: {
    name: string;
    description: string;
    address?: string;
  }): Promise<ResourceClassification> {
    const text = `${resource.name} ${resource.description}`.toLowerCase();
    
    // Score each category
    const categoryScores: Array<{ category: string; score: number }> = [];
    
    for (const [category, keywords] of Object.entries(NEEDS_KEYWORDS)) {
      const score = scoreKeywords(text, keywords);
      if (score > 0) {
        categoryScores.push({ category, score });
      }
    }
    
    // Sort by score
    categoryScores.sort((a, b) => b.score - a.score);
    
    // Top category
    const topCategory = categoryScores[0] || { category: 'GENERAL', score: 0 };
    
    // Confidence based on score gap
    let confidenceScore = 0.5; // Base confidence
    if (topCategory.score >= 5) {
      confidenceScore = 0.9;
    } else if (topCategory.score >= 3) {
      confidenceScore = 0.75;
    } else if (topCategory.score >= 1) {
      confidenceScore = 0.6;
    }
    
    return {
      category: topCategory.category,
      confidenceScore,
      alternativeCategories: categoryScores.slice(1, 4).map(c => ({
        category: c.category,
        score: c.score / Math.max(topCategory.score, 1),
      })),
      method: 'keywords',
    };
  }
}
