import { z } from 'zod';

// GoFundMe Category Schema
export const GoFundMeCategorySchema = z.enum([
  'Medical',
  'Emergency',
  'Memorial',
  'Education',
  'Nonprofit',
  'Housing',
  'Animal',
  'Environment',
  'Community',
  'Sports',
  'Creative',
  'Travel',
  'Family',
  'Business',
  'Dreams',
  'Faith',
  'Competitions',
  'Other'
]);

// Location Schema
export const LocationSchema = z.object({
  country: z.string().default('United States'),
  state: z.string().optional(),
  zip: z.string().min(5, 'ZIP code must be at least 5 digits').optional(),
  city: z.string().optional()
});

// Contact Schema
export const ContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  preferredMethod: z.enum(['email', 'phone', 'none']).optional()
});

// Field Confidence Schema
export const FieldConfidenceSchema = z.object({
  value: z.any().optional(),
  confidence: z.number().min(0).max(1),
  source: z.enum(['extracted', 'manual', 'followup']).default('extracted')
});

// GoFundMe Draft Schema
export const GoFundMeDraftSchema = z.object({
  // Required fields with confidence tracking
  name: FieldConfidenceSchema.extend({
    value: z.string().optional()
  }),
  
  dateOfBirth: FieldConfidenceSchema.extend({
    value: z.string().optional() // Format: MM/DD/YYYY
  }),
  
  location: FieldConfidenceSchema.extend({
    value: LocationSchema.optional()
  }),
  
  beneficiary: FieldConfidenceSchema.extend({
    value: z.enum(['myself', 'someone-else', 'charity']).optional()
  }),
  
  category: FieldConfidenceSchema.extend({
    value: GoFundMeCategorySchema.optional()
  }),
  
  goalAmount: FieldConfidenceSchema.extend({
    value: z.number().positive().optional()
  }),
  
  title: FieldConfidenceSchema.extend({
    // Allow shorter titles in extraction pass; UI will enforce longer titles later
    value: z.string().optional()
  }),
  
  storyBody: FieldConfidenceSchema.extend({
    // Story length validated by UI; accept shorter bodies from AI extraction
    value: z.string().optional()
  }),
  
  shortSummary: FieldConfidenceSchema.extend({
    value: z.string().max(200, 'Summary must be 200 characters or less').optional()
  }),
  
  contact: FieldConfidenceSchema.extend({
    value: ContactSchema.optional()
  }),
  
  // Required consent
  consentToPublish: z.boolean(),
  
  // Meta information
  transcript: z.string().optional(),
  missingFields: z.array(z.string()),
  
  // Follow-up questions
  followUpQuestions: z.array(z.object({
    field: z.string(),
    question: z.string(),
    type: z.enum(['text', 'select', 'number', 'date']).default('text'),
    options: z.array(z.string()).optional() // For select type
  })),
  
  // Processing metadata
  extractedAt: z.date().default(() => new Date()),
  lastUpdated: z.date().default(() => new Date())
});

// Follow-up Answer Schema
export const FollowUpAnswerSchema = z.object({
  field: z.string(),
  answer: z.string(),
  confidence: z.number().min(0).max(1).default(1.0) // Manual answers have high confidence
});

// Types
export type GoFundMeCategory = z.infer<typeof GoFundMeCategorySchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type FieldConfidence = z.infer<typeof FieldConfidenceSchema>;
export type GoFundMeDraft = z.infer<typeof GoFundMeDraftSchema>;
export type FollowUpAnswer = z.infer<typeof FollowUpAnswerSchema>;

// Validation helpers
export const validateGoFundMeDraft = (data: unknown) => {
  return GoFundMeDraftSchema.safeParse(data);
};

export const validateFollowUpAnswer = (data: unknown) => {
  return FollowUpAnswerSchema.safeParse(data);
};

// Helper to check required fields completion
export const checkRequiredFields = (draft: GoFundMeDraft): string[] => {
  const requiredFields = [
    'name',
    'dateOfBirth', 
    'location',
    'category',
    'goalAmount',
    'title',
    'storyBody',
    'shortSummary'
  ];
  
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    const fieldData = draft[field as keyof GoFundMeDraft] as FieldConfidence;
    if (!fieldData?.value || fieldData.confidence < 0.3) {
      missing.push(field);
    }
  }
  
  return missing;
};
