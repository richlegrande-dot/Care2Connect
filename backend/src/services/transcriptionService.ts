import { getValidEnvKey } from '../utils/keys';
import fs from 'fs';
import path from 'path';
import { getTranscriptionProvider } from '../providers/transcription';
import { getAIProvider } from '../providers/ai';

const ASSEMBLYAI_KEY = getValidEnvKey('ASSEMBLYAI_API_KEY');

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  warnings: string[];
  source: 'assemblyai' | 'whisper' | 'manual';
}

export class TranscriptionService {
  /**
   * Check if transcription provider is available
   */
  isAssemblyAIAvailable(): boolean {
    return !!ASSEMBLYAI_KEY;
  }

  /**
   * Transcribe audio file to text using transcription provider
   */
  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    try {
      const provider = getTranscriptionProvider();
      
      if (!provider.isAvailable()) {
        throw new Error('Transcription provider not available. Please use manual transcript mode.');
      }

      // Validate audio file exists and is readable
      if (!fs.existsSync(audioFilePath)) {
        throw new Error('Audio file not found');
      }

      const stats = fs.statSync(audioFilePath);
      if (stats.size === 0) {
        throw new Error('Audio file is empty');
      }

      // Check file size (reasonable limit for most providers)
      const maxSizeBytes = 200 * 1024 * 1024; // 200MB
      if (stats.size > maxSizeBytes) {
        throw new Error('Audio file too large. Maximum size is 200MB.');
      }

      console.log(`[Transcription] Using provider: ${provider.name}`);
      
      // Use provider abstraction
      const result = await provider.transcribe(audioFilePath, {
        language: 'en',
        punctuate: true,
      });

      const warnings = [...result.warnings];
      if (result.confidence < 0.5) {
        warnings.push('Low transcription confidence. Consider re-recording with clearer audio.');
      }
      if (!result.transcript || result.transcript.length < 20) {
        warnings.push('Transcript seems very short. Please check if full story was recorded.');
      }

      console.log(`[Transcription] Completed successfully (${result.wordCount} words)`);

      return {
        transcript: result.transcript || '',
        confidence: result.confidence,
        warnings,
        source: result.source === 'stub' ? 'manual' : result.source, // Map stub to manual for compatibility
      };
    } catch (error) {
      console.error('[Transcription] Error:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process manual transcript input (fallback mode)
   */
  async processManualTranscript(transcript: string): Promise<TranscriptionResult> {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Transcript cannot be empty');
    }

    const cleanTranscript = transcript.trim();
    const warnings = [];

    // Basic validation
    if (cleanTranscript.length < 20) {
      warnings.push('Transcript seems very short. Consider adding more details about your situation.');
    }

    if (cleanTranscript.length > 5000) {
      warnings.push('Transcript is quite long. Consider focusing on the most important points.');
    }

    // Check for potential issues
    if (!/[.!?]/.test(cleanTranscript)) {
      warnings.push('Consider adding proper punctuation to improve story clarity.');
    }

    return {
      transcript: cleanTranscript,
      confidence: 1.0, // Manual input assumed to be accurate
      warnings,
      source: 'manual'
    };
  }

  /**
   * Extract structured profile data from transcript using AI provider
   */
  async extractProfileData(transcript: string): Promise<ExtractedProfileData> {
    try {
      const aiProvider = getAIProvider();
      console.log(`[Profile Extraction] Using provider: ${aiProvider.name}`);
      
      const result = await aiProvider.extractProfileData(transcript);
      
      // Convert to expected format
      return {
        name: result.name || null,
        age: result.age || null,
        skills: result.skills || [],
        job_history: null, // Not extracted by rules provider
        urgent_needs: result.urgentNeeds || [],
        long_term_goals: result.longTermGoals || [],
        housing_status: result.housingStatus || null,
        health_notes: result.healthNotes || null,
        summary: result.summary || '',
        donation_pitch: result.donationPitch || '',
        tags: result.tags || [],
        contact_preferences: result.contactPreferences?.join(', ') || null,
      };
    } catch (error) {
      console.error('[Profile Extraction] Error:', error);
      // Return minimal data instead of throwing - graceful degradation
      return {
        name: null,
        age: null,
        skills: [],
        job_history: null,
        urgent_needs: [],
        long_term_goals: [],
        housing_status: null,
        health_notes: null,
        summary: 'A community member shared their story. Please add details manually.',
        donation_pitch: 'Every contribution helps provide stability and opportunity.',
        tags: [],
        contact_preferences: null,
      };
    }
  }

  /**
   * Generate an enhanced donation pitch
   */
  async generateDonationPitch(profileData: ExtractedProfileData): Promise<string> {
    try {
      const aiProvider = getAIProvider();
      console.log(`[Donation Pitch] Using provider: ${aiProvider.name}`);
      
      const result = await aiProvider.generateDonationPitch({
        name: profileData.name || undefined,
        age: profileData.age || undefined,
        skills: profileData.skills,
        urgentNeeds: profileData.urgent_needs,
      });

      return result.pitch;
    } catch (error) {
      console.error('[Donation Pitch] Error:', error);
      return profileData.donation_pitch || 'Every contribution helps provide stability and opportunity.';
    }
  }

  private validateExtractedData(data: any): ExtractedProfileData {
    // Deprecated - provider abstraction handles validation
    return {
      name: data.name || null,
      age: typeof data.age === 'number' ? data.age : null,
      skills: Array.isArray(data.skills) ? data.skills : [],
      job_history: data.job_history || null,
      urgent_needs: Array.isArray(data.urgent_needs) ? data.urgent_needs : [],
      long_term_goals: Array.isArray(data.long_term_goals) ? data.long_term_goals : [],
      housing_status: data.housing_status || null,
      health_notes: data.health_notes || null,
      summary: data.summary || '',
      donation_pitch: data.donation_pitch || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      contact_preferences: data.contact_preferences || null,
    };
  }
}

export interface ExtractedProfileData {
  name: string | null;
  age: number | null;
  skills: string[];
  job_history: any;
  urgent_needs: string[];
  long_term_goals: string[];
  housing_status: string | null;
  health_notes: string | null;
  summary: string;
  donation_pitch: string;
  tags: string[];
  contact_preferences: string | null;
}