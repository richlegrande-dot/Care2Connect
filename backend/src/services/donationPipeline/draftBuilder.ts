/**
 * Draft Builder Service
 * 
 * Generates high-quality GoFundMe drafts with structured formatting,
 * needs info gating, and editable JSON structure for iteration.
 * 
 * Features:
 * - Title generation: "Help {Name} with {PrimaryNeed}"
 * - Story formatting with paragraphs and structure
 * - "How funds will help" bullet section
 * - 90-word excerpt for preview
 * - Missing field detection and gating
 * - Quality scoring
 */

import { PrismaClient } from '@prisma/client';
import { ExtractedSignals } from '../speechIntelligence/transcriptSignalExtractor';
import {
  validateDraftCompleteness,
  suggestGoalAmount,
  suggestCategory,
  suggestDuration,
  DonationDraftData
} from '../../schemas/donationDraftRequirements';

const prisma = new PrismaClient();

export interface DraftInput {
  ticketId: string;
  transcript: string;
  signals: ExtractedSignals;
  userProvidedData?: {
    goalAmount?: number; // in cents
    beneficiaryName?: string;
    location?: string;
    duration?: string;
  };
}

export interface GeneratedDraft {
  title: string;
  story: string;
  excerpt: string; // 90-word summary
  howFundsHelp: string[];
  breakdown: string[];
  goalAmount?: number; // in cents
  beneficiary?: string;
  location?: string;
  category?: string;
  timeline?: string;
  urgency?: 'low' | 'medium' | 'high';
  tags: string[];
  qualityScore: number;
  missingFields: string[];
  suggestedQuestions: string[];
  templateUsed?: string;
  knowledgeUsed?: string[];
  editableJson: any;
}

/**
 * Generate a complete GoFundMe draft from transcript signals
 */
export async function generateDraft(input: DraftInput): Promise<GeneratedDraft> {
  const { signals, userProvidedData } = input;
  
  // Extract primary information
  const name = userProvidedData?.beneficiaryName || signals.nameCandidate || 'Anonymous';
  const goalAmount = userProvidedData?.goalAmount || undefined;
  const location = userProvidedData?.location || signals.locationCandidates[0] || undefined;
  const duration = userProvidedData?.duration || suggestDuration(signals.urgencyScore, signals.needsCategories.map(c => c.category));
  
  // Generate title
  const title = generateTitle(name, signals);
  
  // Format story with structure
  const story = formatStory(input.transcript, signals);
  
  // Generate "How funds will help" bullets
  const howFundsHelp = generateHowFundsHelp(signals, goalAmount);
  
  // Extract key points breakdown
  const breakdown = signals.keyPoints.slice(0, 7);
  
  // Generate excerpt (90 words)
  const excerpt = generateExcerpt(story);
  
  // Determine category and urgency
  const category = suggestCategory(signals.needsCategories.map(c => c.category));
  const urgency = determineUrgency(signals.urgencyScore);
  
  // Generate tags
  const tags = generateTags(signals);
  
  // Validate completeness
  const validation = validateDraftCompleteness({
    title,
    story,
    beneficiaryName: name,
    goalAmount,
    location,
    category,
    duration
  });
  
  // Create editable JSON structure
  const editableJson = {
    titlePattern: 'Help {Name} with {PrimaryNeed}',
    storyStructure: {
      introduction: story.split('\n\n')[0] || '',
      situation: story.split('\n\n')[1] || '',
      needs: story.split('\n\n')[2] || '',
      impact: story.split('\n\n')[3] || '',
      gratitude: story.split('\n\n')[4] || ''
    },
    suggestedGoalAmounts: suggestGoalAmount(signals.needsCategories.map(c => c.category)),
    confidence: signals.confidence,
    urgencyScore: signals.urgencyScore,
    needsBreakdown: signals.needsCategories
  };
  
  return {
    title,
    story,
    excerpt,
    howFundsHelp,
    breakdown,
    goalAmount,
    beneficiary: name,
    location,
    category,
    timeline: duration,
    urgency,
    tags,
    qualityScore: validation.qualityScore,
    missingFields: validation.missingFields,
    suggestedQuestions: validation.suggestedQuestions,
    editableJson
  };
}

/**
 * Generate title: "Help {Name} with {PrimaryNeed}"
 */
function generateTitle(name: string, signals: ExtractedSignals): string {
  if (signals.needsCategories.length === 0) {
    return `Help ${name}`;
  }
  
  const primaryNeed = signals.needsCategories[0].category;
  
  // Map categories to human-readable needs
  const needPhrases: Record<string, string> = {
    HOUSING: 'Housing and Stability',
    FOOD: 'Food and Basic Needs',
    HEALTHCARE: 'Medical Care',
    EMPLOYMENT: 'Job Search and Employment',
    SAFETY: 'Safety and Security',
    TRANSPORTATION: 'Transportation',
    UTILITIES: 'Utility Bills',
    CHILDCARE: 'Childcare',
    LEGAL: 'Legal Assistance',
    EDUCATION: 'Education',
    MENTAL_HEALTH: 'Mental Health Support',
    ADDICTION: 'Recovery Support'
  };
  
  const needPhrase = needPhrases[primaryNeed] || 'Essential Support';
  
  return `Help ${name} with ${needPhrase}`;
}

/**
 * Format story with proper structure and paragraphs
 */
function formatStory(transcript: string, signals: ExtractedSignals): string {
  // Split into sentences
  const sentences = transcript
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  if (sentences.length === 0) {
    return 'Support needed for difficult circumstances.';
  }
  
  // Create structured story with paragraphs
  const sections: string[] = [];
  
  // Introduction (1-2 sentences)
  const intro = sentences.slice(0, 2).join('. ') + '.';
  sections.push(intro);
  
  // Situation (2-3 sentences about current circumstances)
  const situation = sentences.slice(2, 5).join('. ');
  if (situation) {
    sections.push(situation + '.');
  }
  
  // Needs (focus on primary needs)
  if (signals.needsCategories.length > 0) {
    const primaryNeeds = signals.needsCategories.slice(0, 2);
    const needsSentence = `Help is urgently needed for ${primaryNeeds.map(n => n.category.toLowerCase().replace('_', ' ')).join(' and ')}.`;
    sections.push(needsSentence);
  }
  
  // Impact statement
  sections.push('Your support will make a real difference and help get life back on track.');
  
  // Gratitude
  sections.push('Thank you for taking the time to read and for any help you can provide.');
  
  // Join with double newlines for paragraphs
  return sections.join('\n\n');
}

/**
 * Generate "How funds will help" bullets based on needs
 */
function generateHowFundsHelp(signals: ExtractedSignals, goalAmount?: number): string[] {
  const bullets: string[] = [];
  
  for (const need of signals.needsCategories.slice(0, 4)) {
    const category = need.category;
    
    // Category-specific bullet points
    const needBullets: Record<string, string[]> = {
      HOUSING: [
        'First month\'s rent and security deposit',
        'Moving costs and basic furniture',
        'Temporary housing while finding permanent placement'
      ],
      FOOD: [
        'Groceries and essential nutrition',
        'Meal preparation supplies',
        'Food for family members'
      ],
      HEALTHCARE: [
        'Medical treatment and prescriptions',
        'Doctor visits and follow-up care',
        'Medical equipment or supplies'
      ],
      EMPLOYMENT: [
        'Professional clothing and interview preparation',
        'Transportation to job interviews',
        'Skills training and certification'
      ],
      SAFETY: [
        'Relocation to safe housing',
        'Legal protection and counseling',
        'Emergency supplies and security'
      ],
      TRANSPORTATION: [
        'Vehicle repairs or public transit passes',
        'Gas and maintenance costs',
        'Transportation to work or appointments'
      ],
      UTILITIES: [
        'Electricity and heating bills',
        'Water and essential services',
        'Preventing service disconnection'
      ],
      CHILDCARE: [
        'Daycare costs while working',
        'School supplies and activities',
        'Basic needs for children'
      ],
      LEGAL: [
        'Legal representation and court fees',
        'Document filing and processing',
        'Immigration or custody support'
      ],
      EDUCATION: [
        'Tuition and course fees',
        'Books and learning materials',
        'Skills training programs'
      ],
      MENTAL_HEALTH: [
        'Therapy and counseling sessions',
        'Mental health medication',
        'Support group participation'
      ],
      ADDICTION: [
        'Rehab program costs',
        'Recovery support and medication',
        'Sober living arrangements'
      ]
    };
    
    const categoryBullets = needBullets[category];
    if (categoryBullets && categoryBullets.length > 0) {
      // Add first bullet from this category
      bullets.push(categoryBullets[0]);
    }
  }
  
  // Ensure at least 3 bullets
  while (bullets.length < 3) {
    bullets.push('Essential living expenses and stability');
  }
  
  return bullets.slice(0, 5); // Max 5 bullets
}

/**
 * Generate 90-word excerpt for preview
 */
function generateExcerpt(story: string): string {
  const words = story.split(/\s+/);
  
  if (words.length <= 90) {
    return story;
  }
  
  // Take first 90 words and add ellipsis
  const excerpt = words.slice(0, 90).join(' ');
  
  // Try to end at sentence boundary
  const lastPeriod = excerpt.lastIndexOf('.');
  if (lastPeriod > excerpt.length * 0.7) {
    return excerpt.substring(0, lastPeriod + 1);
  }
  
  return excerpt + '...';
}

/**
 * Determine urgency level from score
 */
function determineUrgency(urgencyScore: number): 'low' | 'medium' | 'high' {
  if (urgencyScore >= 0.7) return 'high';
  if (urgencyScore >= 0.4) return 'medium';
  return 'low';
}

/**
 * Generate tags for categorization
 */
function generateTags(signals: ExtractedSignals): string[] {
  const tags: Set<string> = new Set();
  
  // Add need categories as tags
  for (const need of signals.needsCategories) {
    tags.add(need.category.toLowerCase().replace('_', '-'));
  }
  
  // Add urgency tag
  if (signals.urgencyScore > 0.7) {
    tags.add('urgent');
    tags.add('emergency');
  }
  
  // Add location tags if available
  for (const location of signals.locationCandidates.slice(0, 2)) {
    if (location.length <= 20) {
      tags.add(location.toLowerCase());
    }
  }
  
  // Add common tags
  tags.add('community-support');
  tags.add('help-needed');
  
  return Array.from(tags).slice(0, 10); // Max 10 tags
}

/**
 * Update an existing draft with new information
 */
export async function updateDraft(
  ticketId: string,
  updates: Partial<DonationDraftData>
): Promise<GeneratedDraft> {
  // Get existing draft and ticket
  const ticket = await prisma.recordingTicket.findUnique({
    where: { id: ticketId },
    include: {
      donationDraft: true,
      transcriptionSessions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });
  
  if (!ticket || !ticket.donationDraft) {
    throw new Error('Draft not found');
  }
  
  // Merge updates with existing data
  const updatedDraftData: DonationDraftData = {
    title: updates.title || ticket.donationDraft.title,
    story: updates.story || ticket.donationDraft.story,
    beneficiaryName: updates.beneficiaryName || ticket.donationDraft.beneficiary || undefined,
    goalAmount: updates.goalAmount || ticket.donationDraft.goalAmount?.toNumber() || undefined,
    location: updates.location || ticket.donationDraft.location || undefined,
    category: updates.category || ticket.donationDraft.category || undefined,
    duration: updates.duration || ticket.donationDraft.timeline || undefined
  };
  
  // Update database
  await prisma.donationDraft.update({
    where: { id: ticket.donationDraft.id },
    data: {
      title: updatedDraftData.title,
      story: updatedDraftData.story,
      beneficiary: updatedDraftData.beneficiaryName,
      goalAmount: updatedDraftData.goalAmount,
      location: updatedDraftData.location,
      category: updatedDraftData.category,
      timeline: updatedDraftData.duration
    }
  });
  
  // Re-validate
  const validation = validateDraftCompleteness(updatedDraftData);
  
  // Return updated draft structure
  return {
    title: updatedDraftData.title!,
    story: updatedDraftData.story!,
    excerpt: generateExcerpt(updatedDraftData.story!),
    howFundsHelp: [], // Could regenerate from existing editableJson
    breakdown: [],
    goalAmount: updatedDraftData.goalAmount,
    beneficiary: updatedDraftData.beneficiaryName,
    location: updatedDraftData.location,
    category: updatedDraftData.category,
    timeline: updatedDraftData.duration,
    urgency: 'medium',
    tags: [],
    qualityScore: validation.qualityScore,
    missingFields: validation.missingFields,
    suggestedQuestions: validation.suggestedQuestions,
    editableJson: ticket.donationDraft.editableJson
  };
}
