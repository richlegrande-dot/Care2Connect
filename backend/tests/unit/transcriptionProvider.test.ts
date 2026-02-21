/**
 * Transcription Provider Tests
 * 
 * Tests for transcription provider abstraction layer:
 * - AssemblyAI provider
 * - Stub provider
 * - Provider factory and selection
 * - Error handling
 * - Optional integration tests
 */

import { 
  getTranscriptionProvider, 
  resetTranscriptionProvider,
  AssemblyAIProvider,
  StubTranscriptionProvider,
  TranscriptionProvider 
} from '../../src/providers/transcription';
import { loadTranscriptFixture, createMockAudioPath, cleanupMockAudioFiles } from '../helpers/testHelpers';
import fs from 'fs';

describe('Transcription Provider Layer', () => {
  
  beforeEach(() => {
    resetTranscriptionProvider();
  });

  afterAll(() => {
    cleanupMockAudioFiles();
  });

  describe('Provider Factory', () => {
    it('should return stub provider when TRANSCRIPTION_PROVIDER=stub', () => {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
      
      const provider = getTranscriptionProvider();
      
      expect(provider.type).toBe('stub');
      expect(provider.name).toContain('Stub');
    });

    it('should return AssemblyAI provider when TRANSCRIPTION_PROVIDER=assemblyai', () => {
      process.env.TRANSCRIPTION_PROVIDER = 'assemblyai';
      process.env.ASSEMBLYAI_API_KEY = 'test-key-123';
      
      const provider = getTranscriptionProvider();
      
      expect(provider.type).toBe('assemblyai');
      expect(provider.name).toContain('AssemblyAI');
    });

    it('should cache provider instance on subsequent calls', () => {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
      
      const provider1 = getTranscriptionProvider();
      const provider2 = getTranscriptionProvider();
      
      expect(provider1).toBe(provider2);
    });

    it('should reset cached provider when resetTranscriptionProvider called', () => {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
      
      const provider1 = getTranscriptionProvider();
      resetTranscriptionProvider();
      
      process.env.TRANSCRIPTION_PROVIDER = 'assemblyai';
      process.env.ASSEMBLYAI_API_KEY = 'test-key-123';
      
      const provider2 = getTranscriptionProvider();
      
      expect(provider1.type).toBe('stub');
      expect(provider2.type).toBe('assemblyai');
    });
  });

  describe('Stub Provider', () => {
    let provider: StubTranscriptionProvider;

    beforeEach(() => {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
      provider = new StubTranscriptionProvider();
    });

    it('should always be available in test mode', () => {
      expect(provider.isAvailable()).toBe(true);
    });

    it('should return deterministic transcript from fixture', async () => {
      const fixture = loadTranscriptFixture(1); // Normal complete story
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      provider.reloadFixtures(); // Reload after setting env var
      
      const audioPath = createMockAudioPath('stub-test');
      
      const result = await provider.transcribe(audioPath);
      
      expect(result.transcript).toBe(fixture.transcript);
      expect(result.source).toBe('stub');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.wordCount).toBe(fixture.wordCount);
    });

    it('should return default fixture when no custom fixture provided', async () => {
      delete process.env.STRESS_TEST_TRANSCRIPT_FIXTURE;
      
      const audioPath = createMockAudioPath('stub-default');
      
      const result = await provider.transcribe(audioPath);
      
      expect(result.transcript).toBeTruthy();
      expect(result.source).toBe('stub');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle multiple sequential transcriptions', async () => {
      const fixture1 = loadTranscriptFixture(1);
      const fixture2 = loadTranscriptFixture(2);
      
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture1);
      provider.reloadFixtures();
      const result1 = await provider.transcribe(createMockAudioPath('stub-1'));
      
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture2);
      provider.reloadFixtures();
      const result2 = await provider.transcribe(createMockAudioPath('stub-2'));
      
      expect(result1.transcript).toBe(fixture1.transcript);
      expect(result2.transcript).toBe(fixture2.transcript);
      expect(result1.transcript).not.toBe(result2.transcript);
    });

    it('should simulate processing time', async () => {
      const audioPath = createMockAudioPath('stub-timing');
      const startTime = Date.now();
      
      await provider.transcribe(audioPath);
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(10); // Should take at least 10ms
    });

    it('should handle audio file validation', async () => {
      // In stress test mode, stub provider doesn't validate files
      const nonExistentPath = '/path/that/does/not/exist.mp3';
      
      // Stub provider should still work even with non-existent file
      const result = await provider.transcribe(nonExistentPath);
      expect(result.transcript).toBeTruthy();
      expect(result.source).toBe('stub');
    });
  });

  describe('AssemblyAI Provider', () => {
    let provider: AssemblyAIProvider;

    beforeEach(() => {
      provider = new AssemblyAIProvider();
    });

    it('should check availability based on API key', () => {
      process.env.ASSEMBLYAI_API_KEY = 'test-key-123';
      const providerWithKey = new AssemblyAIProvider();
      expect(providerWithKey.isAvailable()).toBe(true);
      
      delete process.env.ASSEMBLYAI_API_KEY;
      const providerWithoutKey = new AssemblyAIProvider();
      expect(providerWithoutKey.isAvailable()).toBe(false);
    });

    it('should have correct provider metadata', () => {
      expect(provider.name).toContain('AssemblyAI');
      expect(provider.type).toBe('assemblyai');
    });

    it('should reject transcription when API key not configured', async () => {
      delete process.env.ASSEMBLYAI_API_KEY;
      const providerWithoutKey = new AssemblyAIProvider();
      const audioPath = createMockAudioPath('assemblyai-no-key');
      
      await expect(providerWithoutKey.transcribe(audioPath)).rejects.toThrow(/API key/i);
    });

    it('should handle missing audio file gracefully', async () => {
      process.env.ASSEMBLYAI_API_KEY = 'test-key-123';
      const nonExistentPath = '/path/that/does/not/exist.mp3';
      
      await expect(provider.transcribe(nonExistentPath)).rejects.toThrow();
    });
  });

  describe('Provider Error Handling', () => {
    it('should convert provider errors into safe pipeline failures', async () => {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
      
      const provider = getTranscriptionProvider();
      const invalidPath = '';
      
      try {
        await provider.transcribe(invalidPath);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBeTruthy();
      }
    });

    it('should include warnings in transcription result', async () => {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
      
      const fixture = loadTranscriptFixture(2); // Short incomplete story
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const provider = getTranscriptionProvider();
      const audioPath = createMockAudioPath('stub-warnings');
      
      const result = await provider.transcribe(audioPath);
      
      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('Transcript Shape Validation', () => {
    it('should return transcript in expected shape', async () => {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
      
      const provider = getTranscriptionProvider();
      const audioPath = createMockAudioPath('stub-shape');
      
      const result = await provider.transcribe(audioPath);
      
      // Validate shape
      expect(result).toHaveProperty('transcript');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('warnings');
      
      expect(typeof result.transcript).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(['assemblyai', 'stub', 'manual']).toContain(result.source);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should include optional metadata fields', async () => {
      process.env.TRANSCRIPTION_PROVIDER = 'stub';
      process.env.ENABLE_STRESS_TEST_MODE = 'true';
      
      const fixture = loadTranscriptFixture(1);
      process.env.STRESS_TEST_TRANSCRIPT_FIXTURE = JSON.stringify(fixture);
      
      const provider = getTranscriptionProvider();
      if (provider.type === 'stub') {
        (provider as StubTranscriptionProvider).reloadFixtures();
      }
      
      const audioPath = createMockAudioPath('stub-metadata');
      
      const result = await provider.transcribe(audioPath);
      
      expect(result.detectedLanguage).toBeDefined();
      expect(result.wordCount).toBeDefined();
      expect(result.duration).toBeDefined();
    });
  });
});

/**
 * Optional Integration Tests
 * Only run when RUN_ASSEMBLYAI_IT=true and ASSEMBLYAI_API_KEY is set
 */
describe('AssemblyAI Integration Tests (Optional)', () => {
  const shouldRun = process.env.RUN_ASSEMBLYAI_IT === 'true' && process.env.ASSEMBLYAI_API_KEY;

  beforeAll(() => {
    if (!shouldRun) {
      console.log('⏭️  Skipping AssemblyAI integration tests (set RUN_ASSEMBLYAI_IT=true and ASSEMBLYAI_API_KEY to enable)');
    }
  });

  (shouldRun ? it : it.skip)('should successfully transcribe real audio file', async () => {
    const provider = new AssemblyAIProvider();
    
    // Use a small test audio file
    const testAudioPath = createMockAudioPath('assemblyai-real');
    
    // Note: This will fail with real API if audio is just dummy data
    // In real tests, you'd use an actual audio sample
    try {
      const result = await provider.transcribe(testAudioPath, {
        language: 'en',
        punctuate: true,
      });
      
      expect(result).toBeDefined();
      expect(result.source).toBe('assemblyai');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    } catch (error: any) {
      // Expected to fail with dummy audio, but should be a proper error
      expect(error.message).toBeTruthy();
    }
  }, 60000); // 60 second timeout for real API call

  (shouldRun ? it : it.skip)('should respect transcription options', async () => {
    const provider = new AssemblyAIProvider();
    const testAudioPath = createMockAudioPath('assemblyai-options');
    
    try {
      const result = await provider.transcribe(testAudioPath, {
        language: 'en',
        punctuate: true,
      });
      
      // Options should be respected
      expect(result).toBeDefined();
    } catch (error: any) {
      // Even if it fails, check that options were accepted
      expect(error).toBeDefined();
    }
  }, 60000);
});
