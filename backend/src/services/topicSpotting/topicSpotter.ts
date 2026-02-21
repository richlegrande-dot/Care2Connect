/**
 * Topic Spotter - Deterministic Field Extraction
 * Converts transcript → structured GoFundMe fields
 * NO API KEYS REQUIRED
 */

import * as fs from 'fs';
import * as path from 'path';

interface TopicTaxonomy {
  gofundme: any;
  donationPage: any;
  confidence: {
    high: number;
    medium: number;
    low: number;
  };
  followUpQuestions: Record<string, string>;
}

interface ExtractedField {
  value: string;
  confidence: number;
  source: 'extracted' | 'inferred' | 'manual';
  snippet?: string; // Original text that led to extraction
}

interface ExtractionResult {
  fields: {
    name?: ExtractedField;
    age?: ExtractedField;
    location?: ExtractedField;
    beneficiary?: ExtractedField;
    category?: ExtractedField;
    goalAmount?: ExtractedField;
    title?: ExtractedField;
    story?: ExtractedField;
    displayName?: ExtractedField;
  };
  missingFields: string[];
  followUpQuestions: string[];
  metadata: {
    wordCount: number;
    sentenceCount: number;
    hasPersonalPronouns: boolean;
    hasNumbers: boolean;
  };
}

export class TopicSpotter {
  private taxonomy: TopicTaxonomy;
  private phraseHints: Record<string, string[]> = {};

  constructor() {
    // Load taxonomy
    const taxonomyPath = path.join(__dirname, 'topicTaxonomy.json');
    this.taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf-8'));

    // Load phrase hints (learning dictionary)
    const hintsPath = path.join(__dirname, '..', '..', 'config', 'phraseHints.json');
    if (fs.existsSync(hintsPath)) {
      this.phraseHints = JSON.parse(fs.readFileSync(hintsPath, 'utf-8'));
    }
  }

  /**
   * Extract structured fields from transcript
   */
  extract(transcript: string): ExtractionResult {
    const result: ExtractionResult = {
      fields: {},
      missingFields: [],
      followUpQuestions: [],
      metadata: this.analyzeMetadata(transcript)
    };

    const normalizedText = transcript.toLowerCase();

    // Extract name
    const name = this.extractName(transcript, normalizedText);
    if (name) result.fields.name = name;

    // Extract age
    const age = this.extractAge(transcript, normalizedText);
    if (age) result.fields.age = age;

    // Extract location
    const location = this.extractLocation(transcript, normalizedText);
    if (location) result.fields.location = location;

    // Extract goal amount
    const goalAmount = this.extractGoalAmount(transcript, normalizedText);
    if (goalAmount) result.fields.goalAmount = goalAmount;

    // Extract category
    const category = this.extractCategory(normalizedText);
    if (category) result.fields.category = category;

    // Extract beneficiary
    const beneficiary = this.extractBeneficiary(normalizedText);
    if (beneficiary) result.fields.beneficiary = beneficiary;

    // Generate title
    const title = this.generateTitle(result.fields, normalizedText);
    if (title) result.fields.title = title;

    // Story is the full transcript (cleaned)
    result.fields.story = {
      value: transcript.trim(),
      confidence: 1.0,
      source: 'extracted'
    };

    // Generate display name
    if (result.fields.name) {
      result.fields.displayName = {
        value: result.fields.name.value.split(' ')[0], // First name only
        confidence: result.fields.name.confidence,
        source: 'inferred'
      };
    }

    // Identify missing fields
    result.missingFields = this.identifyMissingFields(result.fields);

    // Generate follow-up questions
    result.followUpQuestions = this.generateFollowUpQuestions(result.missingFields);

    return result;
  }

  private extractName(transcript: string, normalized: string): ExtractedField | undefined {
    // Pattern: "My name is X" or "I'm X" or "I am X"
    const patterns = [
      /my name is ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/,
      /i'm ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/,
      /i am ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/,
      /this is ([A-Z][a-z]+(?: [A-Z][a-z]+)+)/
    ];

    for (const pattern of patterns) {
      const match = transcript.match(pattern);
      if (match) {
        return {
          value: match[1],
          confidence: this.taxonomy.confidence.high,
          source: 'extracted',
          snippet: match[0]
        };
      }
    }

    // Check phrase hints
    if (this.phraseHints.name) {
      for (const hint of this.phraseHints.name) {
        if (normalized.includes(hint.toLowerCase())) {
          const regex = new RegExp(hint, 'i');
          const match = transcript.match(regex);
          if (match) {
            return {
              value: match[0],
              confidence: this.taxonomy.confidence.medium,
              source: 'extracted',
              snippet: match[0]
            };
          }
        }
      }
    }

    return undefined;
  }

  private extractAge(transcript: string, normalized: string): ExtractedField | undefined {
    // Pattern: "X years old" or "I'm X" (when X is a number)
    const patterns = [
      /(\d{1,2}) years? old/i,
      /i'm (\d{1,2})/i,
      /i am (\d{1,2})/i,
      /age (\d{1,2})/i
    ];

    for (const pattern of patterns) {
      const match = transcript.match(pattern);
      if (match) {
        const age = parseInt(match[1]);
        if (age >= 1 && age <= 120) {
          return {
            value: age.toString(),
            confidence: this.taxonomy.confidence.high,
            source: 'extracted',
            snippet: match[0]
          };
        }
      }
    }

    return undefined;
  }

  private extractLocation(transcript: string, normalized: string): ExtractedField | undefined {
    // Pattern: "in {city}, {state}" or "from {city}"
    const cityStatePattern = /in ([A-Z][a-z]+(?: [A-Z][a-z]+)?),? ([A-Z]{2}|[A-Z][a-z]+)/;
    const cityPattern = /(?:in|from|living in|located in) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/;

    let match = transcript.match(cityStatePattern);
    if (match) {
      return {
        value: `${match[1]}, ${match[2]}`,
        confidence: this.taxonomy.confidence.high,
        source: 'extracted',
        snippet: match[0]
      };
    }

    match = transcript.match(cityPattern);
    if (match) {
      return {
        value: match[1],
        confidence: this.taxonomy.confidence.medium,
        source: 'extracted',
        snippet: match[0]
      };
    }

    return undefined;
  }

  private extractGoalAmount(transcript: string, normalized: string): ExtractedField | undefined {
    // Pattern: "$X" or "X dollars" or "raise X"
    const patterns = [
      /\$([0-9,]+)/,
      /([0-9,]+) dollars?/i,
      /(?:raise|need|goal of|target) \$?([0-9,]+)/i
    ];

    for (const pattern of patterns) {
      const match = transcript.match(pattern);
      if (match) {
        const amount = match[1].replace(/,/g, '');
        return {
          value: amount,
          confidence: this.taxonomy.confidence.high,
          source: 'extracted',
          snippet: match[0]
        };
      }
    }

    return undefined;
  }

  private extractCategory(normalized: string): ExtractedField | undefined {
    const categories = this.taxonomy.gofundme.category;
    let bestMatch: { category: string; count: number; keywords: string[] } | undefined;

    for (const [category, keywords] of Object.entries(categories)) {
      if (category === 'other') continue;
      
      const matchedKeywords: string[] = [];
      let count = 0;
      
      for (const keyword of keywords as string[]) {
        if (normalized.includes(keyword)) {
          count++;
          matchedKeywords.push(keyword);
        }
      }

      if (count > 0 && (!bestMatch || count > bestMatch.count)) {
        bestMatch = { category, count, keywords: matchedKeywords };
      }
    }

    if (bestMatch) {
      const confidence = Math.min(
        this.taxonomy.confidence.high,
        this.taxonomy.confidence.medium + (bestMatch.count * 0.1)
      );

      return {
        value: bestMatch.category,
        confidence,
        source: 'extracted',
        snippet: bestMatch.keywords.join(', ')
      };
    }

    return undefined;
  }

  private extractBeneficiary(normalized: string): ExtractedField | undefined {
    const keywords = this.taxonomy.gofundme.beneficiary.keywords;

    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return {
          value: keyword === 'myself' || keyword === 'for me' ? 'Self' : keyword,
          confidence: this.taxonomy.confidence.high,
          source: 'extracted',
          snippet: keyword
        };
      }
    }

    // Default to 'Self' if no explicit beneficiary mentioned
    return {
      value: 'Self',
      confidence: this.taxonomy.confidence.low,
      source: 'inferred'
    };
  }

  private generateTitle(fields: any, normalized: string): ExtractedField | undefined {
    const name = fields.name?.value;
    const category = fields.category?.value;

    if (!name) return undefined;

    const firstName = name.split(' ')[0];

    // Check for help-related keywords
    const hasHelp = /help|support|assist|aid/.test(normalized);
    
    let title = '';
    if (hasHelp && category) {
      title = `Help ${firstName} with ${category}`;
    } else if (category) {
      title = `${firstName}'s ${category} fundraiser`;
    } else {
      title = `Help ${firstName} get back on their feet`;
    }

    // Capitalize properly
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Truncate to max length
    const maxLength = this.taxonomy.gofundme.title.maxLength;
    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3) + '...';
    }

    return {
      value: title,
      confidence: this.taxonomy.confidence.medium,
      source: 'inferred'
    };
  }

  private analyzeMetadata(transcript: string) {
    const words = transcript.split(/\s+/).filter(w => w.length > 0);
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const hasPersonalPronouns = /\b(i|me|my|myself|we|us|our)\b/i.test(transcript);
    const hasNumbers = /\d/.test(transcript);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      hasPersonalPronouns,
      hasNumbers
    };
  }

  private identifyMissingFields(fields: any): string[] {
    const required = ['name', 'goalAmount', 'location', 'category'];
    const missing: string[] = [];

    for (const field of required) {
      if (!fields[field] || fields[field].confidence < this.taxonomy.confidence.low) {
        missing.push(field);
      }
    }

    return missing;
  }

  private generateFollowUpQuestions(missingFields: string[]): string[] {
    const questions: string[] = [];
    const questionMap = this.taxonomy.followUpQuestions;

    for (const field of missingFields) {
      const key = `missing${field.charAt(0).toUpperCase() + field.slice(1)}`;
      if (questionMap[key]) {
        questions.push(questionMap[key]);
      }
    }

    // Limit to top 3 most important questions
    return questions.slice(0, 3);
  }

  /**
   * Update phrase hints based on user corrections
   * This creates the "learning" feedback loop
   */
  updatePhraseHints(field: string, originalValue: string, correctedValue: string, snippet: string) {
    if (!this.phraseHints[field]) {
      this.phraseHints[field] = [];
    }

    // Add the snippet as a new phrase hint if not already present
    if (!this.phraseHints[field].includes(snippet)) {
      this.phraseHints[field].push(snippet);
    }

    // Save updated hints
    const hintsPath = path.join(__dirname, '..', '..', 'config', 'phraseHints.json');
    const dir = path.dirname(hintsPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(hintsPath, JSON.stringify(this.phraseHints, null, 2));
  }
}

export const topicSpotter = new TopicSpotter();
