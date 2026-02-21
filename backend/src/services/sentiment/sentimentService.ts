/**
 * Sentiment & Empathy Service
 * Offline sentiment analysis + "agent empathy" proxy scoring
 * NO API KEYS REQUIRED
 */

// Note: Install vader-sentiment: npm install vader-sentiment
// @ts-ignore
import * as vader from "vader-sentiment";

interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  compound: number; // Overall score from -1 (most negative) to +1 (most positive)
}

interface EmpathySignals {
  gratitudeScore: number;
  distressScore: number;
  self_advocacyScore: number;
  supportRequestScore: number;
  overallEmpathyScore: number;
}

interface AnalysisResult {
  sentiment: SentimentScore;
  empathy: EmpathySignals;
  needsUrgency: "low" | "medium" | "high";
  metadata: {
    textLength: number;
    sentenceCount: number;
    avgSentenceLength: number;
  };
}

export class SentimentService {
  private gratitudePhrases = [
    "thank you",
    "grateful",
    "appreciate",
    "thankful",
    "blessing",
    "blessed",
    "gratitude",
  ];

  private distressPhrases = [
    "desperate",
    "urgent",
    "crisis",
    "emergency",
    "critical",
    "struggling",
    "suffering",
    "pain",
    "fear",
    "scared",
    "worried",
    "anxious",
    "stressed",
    "overwhelmed",
  ];

  private selfAdvocacyPhrases = [
    "I can",
    "I will",
    "I am working",
    "I am trying",
    "I have been",
    "I want to",
    "I hope to",
    "I am determined",
    "I am committed",
    "my goal",
  ];

  private supportRequestPhrases = [
    "need help",
    "asking for",
    "please help",
    "support me",
    "assist me",
    "help me",
    "could you",
    "would appreciate",
    "looking for support",
    "seeking assistance",
  ];

  /**
   * Analyze transcript for sentiment and empathy signals
   */
  analyze(transcript: string): AnalysisResult {
    const sentiment = this.analyzeSentiment(transcript);
    const empathy = this.analyzeEmpathy(transcript);
    const needsUrgency = this.calculateNeedsUrgency(sentiment, empathy);
    const metadata = this.extractMetadata(transcript);

    return {
      sentiment,
      empathy,
      needsUrgency,
      metadata,
    };
  }

  private analyzeSentiment(text: string): SentimentScore {
    try {
      // VADER sentiment analysis
      const result = vader.SentimentIntensityAnalyzer.polarity_scores(text);

      return {
        positive: result.pos || 0,
        negative: result.neg || 0,
        neutral: result.neu || 0,
        compound: result.compound || 0,
      };
    } catch (error) {
      console.error("[Sentiment] VADER analysis failed:", error);

      // Fallback: simple keyword-based sentiment
      return this.fallbackSentiment(text);
    }
  }

  private fallbackSentiment(text: string): SentimentScore {
    const normalized = text.toLowerCase();

    const positiveWords = [
      "good",
      "great",
      "happy",
      "hope",
      "grateful",
      "thankful",
      "blessed",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "sad",
      "hopeless",
      "desperate",
      "struggling",
      "crisis",
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (normalized.includes(word)) positiveCount++;
    }

    for (const word of negativeWords) {
      if (normalized.includes(word)) negativeCount++;
    }

    const total = positiveCount + negativeCount || 1;
    const compound = (positiveCount - negativeCount) / total;

    return {
      positive: positiveCount / total,
      negative: negativeCount / total,
      neutral: 1 - (positiveCount + negativeCount) / total,
      compound,
    };
  }

  private analyzeEmpathy(text: string): EmpathySignals {
    const normalized = text.toLowerCase();

    // Count occurrences of each category
    const gratitudeScore = this.scorePhrasesPresence(
      normalized,
      this.gratitudePhrases,
    );
    const distressScore = this.scorePhrasesPresence(
      normalized,
      this.distressPhrases,
    );
    const self_advocacyScore = this.scorePhrasesPresence(
      normalized,
      this.selfAdvocacyPhrases,
    );
    const supportRequestScore = this.scorePhrasesPresence(
      normalized,
      this.supportRequestPhrases,
    );

    // Calculate overall empathy score
    // High empathy = high support request + distress, with gratitude and self-advocacy balancing
    const overallEmpathyScore =
      supportRequestScore * 0.4 +
      distressScore * 0.3 +
      self_advocacyScore * 0.2 +
      gratitudeScore * 0.1;

    return {
      gratitudeScore,
      distressScore,
      self_advocacyScore,
      supportRequestScore,
      overallEmpathyScore: Math.min(1.0, overallEmpathyScore),
    };
  }

  private scorePhrasesPresence(text: string, phrases: string[]): number {
    let count = 0;

    for (const phrase of phrases) {
      if (text.includes(phrase)) {
        count++;
      }
    }

    // Normalize to 0-1 scale
    // Assume max 5 occurrences is "very high"
    return Math.min(1.0, count / 5);
  }

  private calculateNeedsUrgency(
    sentiment: SentimentScore,
    empathy: EmpathySignals,
  ): "low" | "medium" | "high" {
    // High urgency indicators:
    // - Very negative sentiment (compound < -0.5)
    // - High distress score (> 0.6)
    // - High support request score (> 0.6)

    const urgencyScore =
      empathy.distressScore * 0.4 +
      empathy.supportRequestScore * 0.3 +
      Math.abs(Math.min(0, sentiment.compound)) * 0.3;

    if (urgencyScore > 0.7) return "high";
    if (urgencyScore > 0.4) return "medium";
    return "low";
  }

  private extractMetadata(text: string) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength =
      sentences.length > 0 ? text.length / sentences.length : 0;

    return {
      textLength: text.length,
      sentenceCount: sentences.length,
      avgSentenceLength,
    };
  }

  /**
   * Get human-readable interpretation
   */
  interpret(analysis: AnalysisResult): string {
    const { sentiment, empathy, needsUrgency } = analysis;

    let interpretation = "";

    // Sentiment interpretation
    if (sentiment.compound > 0.5) {
      interpretation += "The story has a positive and hopeful tone. ";
    } else if (sentiment.compound < -0.5) {
      interpretation +=
        "The story conveys significant distress or difficulty. ";
    } else {
      interpretation += "The story has a balanced emotional tone. ";
    }

    // Empathy interpretation
    if (empathy.self_advocacyScore > 0.6) {
      interpretation +=
        "The individual shows strong self-advocacy and determination. ";
    }

    if (empathy.distressScore > 0.6) {
      interpretation +=
        "There are clear distress signals indicating urgent need. ";
    }

    if (empathy.gratitudeScore > 0.4) {
      interpretation +=
        "Gratitude is expressed, showing appreciation for potential support. ";
    }

    // Urgency
    interpretation += `Overall need urgency: ${needsUrgency.toUpperCase()}.`;

    return interpretation;
  }
}

export const sentimentService = new SentimentService();
