/**
 * Jan v4.0 Fragment & Incomplete Speech Processor
 * 
 * Handles real-world speech patterns including fragments, filler words,
 * and incomplete sentences that affect field extraction accuracy.
 * 
 * Target: Improve parsing of fragmented and noisy speech input
 */

export interface FragmentProcessingResult {
  cleanedTranscript: string;
  originalTranscript: string;
  fillerWordsRemoved: string[];
  fragmentsReconstructed: string[];
  incompletenessPenalty: number; // 0.0-1.0, higher = more incomplete
}

export interface FragmentProcessingOptions {
  preserveStoryContent: boolean; // Keep fillers for story but clean for extraction
  aggressiveMode: boolean; // More aggressive cleaning for very noisy speech
  reconstructFragments: boolean; // Attempt to reconstruct sentence fragments
}

/**
 * Filler Word Detection and Removal
 * Removes speech fillers that interfere with keyword extraction
 */
class FillerWordProcessor {
  private readonly STANDARD_FILLERS = [
    'uh', 'uhh', 'uhhh', 'um', 'umm', 'ummm',
    'er', 'err', 'errr', 'ah', 'ahh', 'ahhh',
    'hmm', 'hmmm', 'mmm', 'mhm'
  ];

  private readonly CONVERSATIONAL_FILLERS = [
    'like', 'you know', 'i mean', 'basically', 'literally',
    'kind of', 'sort of', 'well', 'so', 'yeah', 'ok', 'okay',
    'right', 'actually', 'honestly', 'obviously'
  ];

  private readonly STUTTERING_PATTERNS = [
    // Repeated letter patterns: "wasss", "sooo", "neeed"
    /\b(\w)\1{2,}\w*/gi,
    // Repeated word fragments: "i i i need", "my my name"
    /\b(\w+)\s+\1\s+\1\b/gi,
    /\b(\w+)\s+\1\b/gi
  ];

  private readonly EMOTIONAL_ARTIFACTS = [
    // Artifacts in brackets/asterisks: *crying*, [sobbing]
    /\*[^*]*?\*/g,
    /\[[^\]]*?\]/g,
    /\{[^}]*?\}/g,
    // Parenthetical emotional states: (hiccup), (cough)
    /\([^)]{0,20}\)/g
  ];

  processFillers(
    transcript: string, 
    options: FragmentProcessingOptions
  ): { cleanedText: string; removedFillers: string[] } {
    let cleaned = transcript;
    const removedFillers: string[] = [];

    // Remove emotional artifacts first
    for (const pattern of this.EMOTIONAL_ARTIFACTS) {
      const matches = cleaned.match(pattern) || [];
      removedFillers.push(...matches);
      cleaned = cleaned.replace(pattern, ' ');
    }

    // Remove standard fillers (always safe to remove)
    for (const filler of this.STANDARD_FILLERS) {
      const pattern = new RegExp(`\\b${filler}+\\b`, 'gi');
      const matches = cleaned.match(pattern) || [];
      if (matches.length > 0) {
        removedFillers.push(...matches);
        cleaned = cleaned.replace(pattern, ' ');
      }
    }

    // Remove conversational fillers (only if aggressive mode or extraction context)
    if (options.aggressiveMode || !options.preserveStoryContent) {
      for (const filler of this.CONVERSATIONAL_FILLERS) {
        const pattern = new RegExp(`\\b${filler}\\b`, 'gi');
        const matches = cleaned.match(pattern) || [];
        if (matches.length > 0) {
          // Only remove if appearing frequently (likely filler, not content)
          const frequency = matches.length;
          const wordsCount = cleaned.split(/\s+/).length;
          if (frequency / wordsCount > 0.05) { // More than 5% of words
            removedFillers.push(...matches);
            cleaned = cleaned.replace(pattern, ' ');
          }
        }
      }
    }

    // Fix stuttering patterns
    for (const pattern of this.STUTTERING_PATTERNS) {
      const originalCleaned = cleaned;
      cleaned = cleaned.replace(pattern, (match, p1) => {
        if (p1 && p1.length > 1) {
          removedFillers.push(`stutter_fix: ${match} -> ${p1}`);
          return p1;
        }
        return match;
      });
    }

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return { cleanedText: cleaned, removedFillers };
  }
}

/**
 * Fragment Reconstruction
 * Attempts to reconstruct meaning from sentence fragments
 */
class FragmentReconstructor {
  private readonly INCOMPLETE_INTRODUCTIONS = [
    /^(my name is|i'm|this is|call me)\s+(\w+)\s*\.?\s*$/gi,
    /^(i|we)\s+(need|require|want)\s+/gi,
    /^(help|assistance|support)\s+(with|for)\s+/gi
  ];

  private readonly SENTENCE_CONNECTORS = [
    // Hanging conjunctions: "and", "but", "so", "because"
    /\s+(and|but|so|because)\s*$/gi,
    // Trailing ellipsis or dashes
    /\.{2,}$/g,
    /—+$/g,
    /–+$/g
  ];

  private readonly FRAGMENT_MARKERS = [
    '...', '—', '–', '..', '....', '*pause*', '[pause]'
  ];

  reconstructFragments(
    transcript: string,
    options: FragmentProcessingOptions
  ): { reconstructedText: string; reconstructions: string[] } {
    if (!options.reconstructFragments) {
      return { reconstructedText: transcript, reconstructions: [] };
    }

    let reconstructed = transcript;
    const reconstructions: string[] = [];

    // Split by sentence boundaries and process fragments
    const sentences = this.splitIntoSentences(reconstructed);
    const processedSentences: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const nextSentence = sentences[i + 1];
      
      let processed = sentence;

      // Handle incomplete introductions
      const incompleteIntro = this.handleIncompleteIntroduction(processed, nextSentence);
      if (incompleteIntro.wasReconstructed) {
        reconstructions.push(incompleteIntro.reconstruction);
        processed = incompleteIntro.result;
      }

      // Handle hanging conjunctions
      const hangingConjunction = this.handleHangingConjunction(processed, nextSentence);
      if (hangingConjunction.wasReconstructed) {
        reconstructions.push(hangingConjunction.reconstruction);
        processed = hangingConjunction.result;
      }

      // Bridge sentence fragments with markers
      const bridgedFragment = this.bridgeFragments(processed, nextSentence);
      if (bridgedFragment.wasReconstructed) {
        reconstructions.push(bridgedFragment.reconstruction);
        processed = bridgedFragment.result;
        // Skip next sentence as it was merged
        i++;
      }

      processedSentences.push(processed);
    }

    return {
      reconstructedText: processedSentences.join(' '),
      reconstructions
    };
  }

  private handleIncompleteIntroduction(
    sentence: string, 
    nextSentence?: string
  ): { result: string; wasReconstructed: boolean; reconstruction: string } {
    for (const pattern of this.INCOMPLETE_INTRODUCTIONS) {
      const match = sentence.match(pattern);
      if (match && nextSentence) {
        // Try to combine with next sentence for complete introduction
        const combined = `${sentence} ${nextSentence}`;
        return {
          result: combined,
          wasReconstructed: true,
          reconstruction: `incomplete_intro: "${sentence}" + "${nextSentence}"`
        };
      }
    }

    return { result: sentence, wasReconstructed: false, reconstruction: '' };
  }

  private handleHangingConjunction(
    sentence: string,
    nextSentence?: string
  ): { result: string; wasReconstructed: boolean; reconstruction: string } {
    for (const pattern of this.SENTENCE_CONNECTORS) {
      if (pattern.test(sentence) && nextSentence) {
        // Remove hanging conjunction and merge with next sentence
        const cleaned = sentence.replace(pattern, '');
        const combined = `${cleaned} ${nextSentence}`;
        return {
          result: combined,
          wasReconstructed: true,
          reconstruction: `hanging_conjunction: "${sentence}" + "${nextSentence}"`
        };
      }
    }

    return { result: sentence, wasReconstructed: false, reconstruction: '' };
  }

  private bridgeFragments(
    sentence: string,
    nextSentence?: string
  ): { result: string; wasReconstructed: boolean; reconstruction: string } {
    if (!nextSentence) {
      return { result: sentence, wasReconstructed: false, reconstruction: '' };
    }

    // Check if sentence ends with fragment markers
    const hasFragmentMarker = this.FRAGMENT_MARKERS.some(marker => 
      sentence.includes(marker)
    );

    if (hasFragmentMarker) {
      // Clean fragment markers and combine sentences
      let cleaned = sentence;
      for (const marker of this.FRAGMENT_MARKERS) {
        cleaned = cleaned.replace(marker, ' ');
      }
      
      const combined = `${cleaned} ${nextSentence}`.replace(/\s+/g, ' ').trim();
      return {
        result: combined,
        wasReconstructed: true,
        reconstruction: `fragment_bridge: "${sentence}" + "${nextSentence}"`
      };
    }

    return { result: sentence, wasReconstructed: false, reconstruction: '' };
  }

  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries but preserve content
    return text
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }
}

/**
 * Incompleteness Assessment
 * Measures how fragmented/incomplete the speech is
 */
class IncompletenessAssessor {
  private readonly INCOMPLETENESS_INDICATORS = [
    // Fragment markers
    { pattern: /\.{2,}/g, weight: 0.1, name: 'ellipsis' },
    { pattern: /—+/g, weight: 0.1, name: 'em_dash' },
    { pattern: /–+/g, weight: 0.1, name: 'en_dash' },
    
    // Emotional artifacts
    { pattern: /\*[^*]*\*/g, weight: 0.05, name: 'emotional_asterisk' },
    { pattern: /\[[^\]]*\]/g, weight: 0.05, name: 'emotional_bracket' },
    
    // Excessive fillers
    { pattern: /\b(?:uh|um|er|ah){3,}/gi, weight: 0.2, name: 'excessive_fillers' },
    
    // Repeated stutters
    { pattern: /\b(\w+)\s+\1\s+\1\b/gi, weight: 0.15, name: 'stuttering' },
    
    // Incomplete sentence patterns
    { pattern: /\b(?:and|but|so|because)\s*$/gi, weight: 0.1, name: 'hanging_conjunction' },
    { pattern: /^(?:my name is|i'm|i need)\s*$/gim, weight: 0.2, name: 'incomplete_statement' }
  ];

  assessIncompleteness(originalTranscript: string): number {
    const textLength = originalTranscript.length;
    if (textLength === 0) return 1.0; // Completely incomplete

    let incompletenessScore = 0.0;
    const wordCount = originalTranscript.split(/\s+/).length;

    // Check each incompleteness indicator
    for (const indicator of this.INCOMPLETENESS_INDICATORS) {
      const matches = originalTranscript.match(indicator.pattern) || [];
      const occurrences = matches.length;
      
      if (occurrences > 0) {
        // Normalize by word count to handle different transcript lengths
        const normalizedOccurrences = occurrences / wordCount;
        incompletenessScore += normalizedOccurrences * indicator.weight;
      }
    }

    // Additional penalties for very short transcripts with issues
    if (wordCount < 10 && incompletenessScore > 0) {
      incompletenessScore += 0.3; // Short + fragmented = very incomplete
    }

    // Normalize to 0.0-1.0 range
    return Math.min(1.0, incompletenessScore);
  }
}

/**
 * Main Fragment Processor
 * Orchestrates all fragment processing operations
 */
export class FragmentProcessor {
  private fillerProcessor = new FillerWordProcessor();
  private fragmentReconstructor = new FragmentReconstructor();
  private incompletenessAssessor = new IncompletenessAssessor();

  /**
   * Process transcript to handle fragments and improve extraction quality
   */
  processTranscript(
    transcript: string,
    options: FragmentProcessingOptions = {
      preserveStoryContent: false,
      aggressiveMode: false,
      reconstructFragments: true
    }
  ): FragmentProcessingResult {
    try {
      if (!transcript || typeof transcript !== 'string') {
        return {
          cleanedTranscript: '',
          originalTranscript: transcript || '',
          fillerWordsRemoved: [],
          fragmentsReconstructed: [],
          incompletenessPenalty: 1.0
        };
      }

      // Step 1: Remove filler words and artifacts
      const fillerResult = this.fillerProcessor.processFillers(transcript, options);

      // Step 2: Reconstruct sentence fragments
      const reconstructionResult = this.fragmentReconstructor.reconstructFragments(
        fillerResult.cleanedText,
        options
      );

      // Step 3: Assess incompleteness penalty
      const incompletenessPenalty = this.incompletenessAssessor.assessIncompleteness(transcript);

      // Final cleanup
      const finalCleaned = reconstructionResult.reconstructedText
        .replace(/\s+/g, ' ')
        .trim();

      return {
        cleanedTranscript: finalCleaned,
        originalTranscript: transcript,
        fillerWordsRemoved: fillerResult.removedFillers,
        fragmentsReconstructed: reconstructionResult.reconstructions,
        incompletenessPenalty
      };

    } catch (error) {
      console.error('[FRAGMENT_PROCESSOR_ERROR] Fragment processing failed:', {
        error: (error as Error).message,
        transcriptLength: transcript?.length || 0,
        timestamp: new Date().toISOString()
      });

      // Fallback to minimal processing
      return {
        cleanedTranscript: transcript || '',
        originalTranscript: transcript || '',
        fillerWordsRemoved: [],
        fragmentsReconstructed: [],
        incompletenessPenalty: 0.5
      };
    }
  }

  /**
   * Process specifically for keyword extraction (more aggressive cleaning)
   */
  processForExtraction(transcript: string): string {
    const result = this.processTranscript(transcript, {
      preserveStoryContent: false,
      aggressiveMode: true,
      reconstructFragments: true
    });

    return result.cleanedTranscript;
  }

  /**
   * Process for story content (preserve more natural speech)
   */
  processForStory(transcript: string): string {
    const result = this.processTranscript(transcript, {
      preserveStoryContent: true,
      aggressiveMode: false,
      reconstructFragments: true
    });

    return result.cleanedTranscript;
  }

  /**
   * Quick assessment of transcript quality for confidence adjustment
   */
  assessQuality(transcript: string): {
    qualityScore: number; // 0.0-1.0, higher = better quality
    issues: string[];
  } {
    try {
      const incompleteness = this.incompletenessAssessor.assessIncompleteness(transcript);
      const qualityScore = Math.max(0.0, 1.0 - incompleteness);

      const issues: string[] = [];
      if (incompleteness > 0.3) issues.push('high_fragmentation');
      if (incompleteness > 0.5) issues.push('very_incomplete');
      if (transcript.length < 20) issues.push('very_short');
      if (/\*[^*]*\*/g.test(transcript)) issues.push('emotional_artifacts');
      if (/\b(?:uh|um|er|ah){3,}/gi.test(transcript)) issues.push('excessive_fillers');

      return { qualityScore, issues };

    } catch (error) {
      console.error('[QUALITY_ASSESSMENT_ERROR]:', (error as Error).message);
      return { qualityScore: 0.5, issues: ['assessment_failed'] };
    }
  }
}
