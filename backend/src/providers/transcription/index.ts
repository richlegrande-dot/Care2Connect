/**
 * Transcription Provider Factory
 *
 * Central entry point for all transcription operations
 */

import { TranscriptionProvider, getTranscriptionProviderConfig } from "./types";
import { AssemblyAIProvider } from "./assemblyai";
import { StubTranscriptionProvider } from "./stub";

let cachedProvider: TranscriptionProvider | null = null;

/**
 * Get configured transcription provider
 */
export function getTranscriptionProvider(): TranscriptionProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const config = getTranscriptionProviderConfig();

  console.log(`[Transcription Provider] Initializing: ${config.provider}`);

  switch (config.provider) {
    case "assemblyai":
      cachedProvider = new AssemblyAIProvider();
      if (!cachedProvider.isAvailable()) {
        throw new Error(
          "AssemblyAI provider selected but API key not configured",
        );
      }
      break;

    case "stub":
      if (!config.enableStressTestMode) {
        console.warn(
          "[Transcription Provider] WARNING: Stub provider requires ENABLE_STRESS_TEST_MODE=true",
        );
      }
      cachedProvider = new StubTranscriptionProvider();
      break;

    default:
      console.warn(
        `[Transcription Provider] Unknown provider: ${config.provider}, falling back to AssemblyAI`,
      );
      cachedProvider = new AssemblyAIProvider();
  }

  console.log(
    `[Transcription Provider] Using: ${cachedProvider.name} (type: ${cachedProvider.type})`,
  );

  return cachedProvider;
}

/**
 * Reset cached provider (useful for tests)
 */
export function resetTranscriptionProvider(): void {
  cachedProvider = null;
}

/**
 * Check if transcription provider is available
 */
export function isTranscriptionProviderAvailable(): boolean {
  try {
    const provider = getTranscriptionProvider();
    return provider.isAvailable();
  } catch (error) {
    console.error(
      "[Transcription Provider] Error checking availability:",
      error,
    );
    return false;
  }
}

// Export types and providers
export * from "./types";
export { AssemblyAIProvider } from "./assemblyai";
export { StubTranscriptionProvider } from "./stub";
