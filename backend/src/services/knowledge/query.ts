/**
 * Knowledge Query Service
 * 
 * Provides runtime knowledge search and recommendation matching for:
 * - Pipeline troubleshooting
 * - Donation draft generation guidance
 * - Native language processing rules
 * - Quality improvements
 * 
 * Uses Postgres full-text search for fast, relevant matching.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface KnowledgeSearchParams {
  queryText?: string;
  tags?: string[];
  stage?: string;
  limit?: number;
}

export interface KnowledgeMatch {
  id: string;
  sourceId: string;
  chunkText: string;
  tags: string[];
  language: string | null;
  metadata: any;
  score: number;
  snippet: string;
}

export interface RecommendedAction {
  type: 'CHECK_ENV' | 'CHECK_ENDPOINT' | 'RETRY' | 'FALLBACK' | 'RUN_SQL' | 'SHOW_GUIDANCE';
  payload: any;
  description: string;
}

export interface RecommendationResult {
  matchedChunks: KnowledgeMatch[];
  suggestedActions: RecommendedAction[];
  confidence: number;
}

/**
 * Search knowledge vault for relevant content
 */
export async function searchKnowledge(params: KnowledgeSearchParams): Promise<KnowledgeMatch[]> {
  const { queryText, tags, stage, limit = 10 } = params;
  
  try {
    // Build where clause
    const where: any = {
      isDeleted: false,
    };
    
    // Filter by tags if provided
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }
    
    // Filter by stage in metadata if provided
    if (stage) {
      where.metadata = {
        path: ['appliesToStages'],
        array_contains: stage,
      };
    }
    
    // If no text query, just return filtered results
    if (!queryText || queryText.trim() === '') {
      const chunks = await prisma.knowledgeChunk.findMany({
        where,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });
      
      return chunks.map(chunk => ({
        id: chunk.id,
        sourceId: chunk.sourceId,
        chunkText: chunk.chunkText,
        tags: chunk.tags,
        language: chunk.language,
        metadata: chunk.metadata,
        score: 1.0,
        snippet: chunk.chunkText.substring(0, 200) + (chunk.chunkText.length > 200 ? '...' : ''),
      }));
    }
    
    // Use Postgres ILIKE for text search (can be upgraded to full-text search later)
    const searchPattern = `%${queryText.toLowerCase()}%`;
    
    const chunks = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, 
        "sourceId", 
        "chunkText", 
        tags, 
        language, 
        metadata,
        CASE
          WHEN LOWER("chunkText") LIKE $1 THEN 10
          ELSE 1
        END as score
      FROM "knowledge_chunks"
      WHERE "isDeleted" = false
        AND LOWER("chunkText") LIKE $1
        ${tags && tags.length > 0 ? `AND tags && ARRAY[$2]::text[]` : ''}
      ORDER BY score DESC, "updatedAt" DESC
      LIMIT $${tags && tags.length > 0 ? '3' : '2'}
    `, searchPattern, ...(tags && tags.length > 0 ? [tags] : []), limit);
    
    return chunks.map(chunk => ({
      id: chunk.id,
      sourceId: chunk.sourceId,
      chunkText: chunk.chunkText,
      tags: chunk.tags || [],
      language: chunk.language,
      metadata: chunk.metadata,
      score: chunk.score || 1,
      snippet: chunk.chunkText.substring(0, 200) + (chunk.chunkText.length > 200 ? '...' : ''),
    }));
  } catch (error) {
    console.error('[KnowledgeQuery] Search error:', error);
    return [];
  }
}

/**
 * Get recommended actions for a pipeline failure
 */
export async function getRecommendedActions(params: {
  stage: string;
  error?: string;
  context?: any;
}): Promise<RecommendationResult> {
  const { stage, error, context } = params;
  
  try {
    // Build search query from error message and context
    const searchTerms: string[] = [];
    
    if (error) {
      // Extract key terms from error message (remove noise)
      const errorTerms = error
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(term => term.length > 3 && !['error', 'failed', 'undefined'].includes(term));
      
      searchTerms.push(...errorTerms);
    }
    
    // Add context-based terms
    if (context) {
      if (context.engine) searchTerms.push(context.engine.toLowerCase());
      if (context.language) searchTerms.push(context.language.toLowerCase());
      if (context.transcriptLength === 0) searchTerms.push('empty', 'transcript');
    }
    
    // Search for relevant knowledge chunks
    const matches = await searchKnowledge({
      queryText: searchTerms.join(' '),
      tags: [stage, 'TROUBLESHOOTING', 'COMMON_FAILURE'],
      stage,
      limit: 5,
    });
    
    // Extract actions from metadata
    const actions: RecommendedAction[] = [];
    
    for (const match of matches) {
      if (match.metadata && match.metadata.actions && Array.isArray(match.metadata.actions)) {
        for (const action of match.metadata.actions) {
          if (action.type && action.payload) {
            actions.push({
              type: action.type,
              payload: action.payload,
              description: action.description || `Action from ${match.tags.join(', ')}`,
            });
          }
        }
      }
    }
    
    // Calculate confidence based on match quality
    const confidence = matches.length > 0 
      ? Math.min(1.0, matches.reduce((sum, m) => sum + m.score, 0) / matches.length / 10)
      : 0;
    
    return {
      matchedChunks: matches,
      suggestedActions: actions,
      confidence,
    };
  } catch (error) {
    console.error('[KnowledgeQuery] Error getting recommendations:', error);
    return {
      matchedChunks: [],
      suggestedActions: [],
      confidence: 0,
    };
  }
}

/**
 * Get donation draft template from knowledge vault
 */
export async function getDonationDraftTemplate(): Promise<KnowledgeMatch | null> {
  try {
    const results = await searchKnowledge({
      tags: ['DONATION_DRAFT', 'TEMPLATE'],
      stage: 'DRAFT',
      limit: 1,
    });
    
    return results[0] || null;
  } catch (error) {
    console.error('[KnowledgeQuery] Error getting draft template:', error);
    return null;
  }
}

/**
 * Get native language processing rules
 */
export async function getNativeLanguageRules(language?: string): Promise<KnowledgeMatch[]> {
  try {
    const results = await searchKnowledge({
      tags: ['NATIVE_LANGUAGE', 'TRANSCRIPTION', 'ANALYSIS'],
      queryText: language || undefined,
      limit: 5,
    });
    
    return results;
  } catch (error) {
    console.error('[KnowledgeQuery] Error getting language rules:', error);
    return [];
  }
}

/**
 * Get symptoms-based troubleshooting guidance
 */
export async function findTroubleshootingBySymptoms(symptoms: string[]): Promise<KnowledgeMatch[]> {
  try {
    // Search for chunks with matching symptoms in metadata
    const chunks = await prisma.knowledgeChunk.findMany({
      where: {
        isDeleted: false,
        tags: {
          hasSome: ['TROUBLESHOOTING', 'COMMON_FAILURE'],
        },
      },
      take: 10,
    });
    
    // Filter and score by symptom match
    const matches: KnowledgeMatch[] = [];
    
    for (const chunk of chunks) {
      if (chunk.metadata && Array.isArray(chunk.metadata.symptoms)) {
        const chunkSymptoms = chunk.metadata.symptoms.map((s: string) => s.toLowerCase());
        const matchCount = symptoms.filter(s => 
          chunkSymptoms.some(cs => cs.includes(s.toLowerCase()) || s.toLowerCase().includes(cs))
        ).length;
        
        if (matchCount > 0) {
          matches.push({
            id: chunk.id,
            sourceId: chunk.sourceId,
            chunkText: chunk.chunkText,
            tags: chunk.tags,
            language: chunk.language,
            metadata: chunk.metadata,
            score: matchCount / symptoms.length,
            snippet: chunk.chunkText.substring(0, 200) + (chunk.chunkText.length > 200 ? '...' : ''),
          });
        }
      }
    }
    
    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('[KnowledgeQuery] Error finding by symptoms:', error);
    return [];
  }
}

/**
 * Log knowledge usage for telemetry
 */
export function logKnowledgeUsage(params: {
  ticketId?: string;
  stage: string;
  chunkIds: string[];
  outcome: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}): void {
  // Async logging (fire and forget)
  const { ticketId, stage, chunkIds, outcome } = params;
  
  console.log(`[KnowledgeUsage] stage=${stage} chunks=${chunkIds.length} outcome=${outcome}${ticketId ? ` ticket=${ticketId}` : ''}`);
  
  // Could store this in a dedicated telemetry table if needed
  // For now, just console logging is sufficient
}
