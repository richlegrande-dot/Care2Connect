/**
 * AI Provider Abstraction - Type Definitions
 * 
 * Centralizes all AI operations to enable zero-OpenAI mode for V1 testing
 */

export interface ExtractedProfileData {
  name?: string;
  age?: number;
  location?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  jobHistory?: string[];
  urgentNeeds?: string[];
  longTermGoals?: string[];
  housingStatus?: string;
  healthNotes?: string;
  summary: string;
  donationPitch?: string;
  tags?: string[];
  contactPreferences?: string[];
  extractionMethod?: 'openai' | 'rules' | 'template' | 'manual';
  confidence?: number;
}

export interface GoFundMeDraft {
  title: string;
  story: string;
  goalAmount?: number;
  category?: string;
  beneficiary?: string;
  location?: string;
  summary?: string;
  tags?: string[];
  urgency?: 'low' | 'medium' | 'high';
  timeline?: string;
  bullets?: string[]; // "How funds will be used" bullet points
  generationMethod?: 'openai' | 'template' | 'form' | 'manual';
  confidence?: GoFundMeFieldConfidence; // Per-field confidence tracking
}

/**
 * Confidence tracking for each GoFundMe field
 * Used for V1 rules-based extraction quality assurance
 */
export interface GoFundMeFieldConfidence {
  title?: FieldConfidence;
  goalAmount?: FieldConfidence;
  category?: FieldConfidence;
  beneficiary?: FieldConfidence;
  location?: FieldConfidence;
  summary?: FieldConfidence;
  story?: FieldConfidence;
  bullets?: FieldConfidence;
  tags?: FieldConfidence;
  urgency?: FieldConfidence;
  timeline?: FieldConfidence;
}

/**
 * Individual field confidence with evidence
 */
export interface FieldConfidence {
  score: number; // 0.0 to 1.0
  method: 'extracted' | 'inferred' | 'default'; // How value was derived
  evidence?: string; // Text snippet supporting the value
}

export interface DonationPitch {
  pitch: string;
  length: number;
  method: 'openai' | 'template' | 'fallback';
}

export interface ResourceClassification {
  category: string;
  subcategory?: string;
  targetGroups?: string[];
  services?: string[];
  eligibilityCriteria?: string;
  confidenceScore: number;
  alternativeCategories?: Array<{ category: string; score: number }>;
  method: 'openai' | 'keywords' | 'rules' | 'manual';
}

/**
 * Core AI Provider Interface
 * All AI operations must implement this interface
 */
export interface AIProvider {
  readonly name: string;
  readonly type: 'none' | 'rules' | 'template' | 'openai' | 'other';
  
  /**
   * Extract structured profile data from transcript
   */
  extractProfileData(transcript: string): Promise<ExtractedProfileData>;
  
  /**
   * Generate donation pitch from profile data
   */
  generateDonationPitch(profileData: Partial<ExtractedProfileData>): Promise<DonationPitch>;
  
  /**
   * Generate GoFundMe campaign draft
   */
  generateGoFundMeDraft(input: { transcript?: string; formData?: any }): Promise<GoFundMeDraft>;
  
  /**
   * Classify resource into categories
   */
  classifyResource(resource: { name: string; description: string; address?: string }): Promise<ResourceClassification>;
  
  /**
   * Check if provider is available and configured
   */
  isAvailable(): boolean;
}

/**
 * Provider configuration from environment
 */
export interface ProviderConfig {
  aiProvider: 'none' | 'rules' | 'template' | 'openai';
  storyAnalysisMode: 'none' | 'rules' | 'template' | 'openai';
  enableStressTestMode: boolean;
}

export function getProviderConfig(): ProviderConfig {
  return {
    aiProvider: (process.env.AI_PROVIDER || 'rules') as any,
    storyAnalysisMode: (process.env.STORY_ANALYSIS_MODE || 'rules') as any,
    enableStressTestMode: process.env.ENABLE_STRESS_TEST_MODE === 'true',
  };
}
