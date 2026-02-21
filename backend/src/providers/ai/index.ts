/**
 * AI Provider Factory
 *
 * Central entry point for all AI operations
 * Abstracts provider selection based on environment configuration
 */

import { AIProvider, getProviderConfig } from "./types";
import { RulesBasedAIProvider } from "./rules";
import { NoOpAIProvider } from "./none";

let cachedProvider: AIProvider | null = null;

/**
 * Get configured AI provider instance
 */
export function getAIProvider(): AIProvider {
  // Return cached provider if available
  if (cachedProvider) {
    return cachedProvider;
  }

  const config = getProviderConfig();

  console.log(`[AI Provider] Initializing provider: ${config.aiProvider}`);

  switch (config.aiProvider) {
    case "none":
      cachedProvider = new NoOpAIProvider();
      break;

    case "rules":
    case "template": // Template mode uses rules provider
      cachedProvider = new RulesBasedAIProvider();
      break;

    case "openai":
      // OpenAI provider is DEPRECATED and NOT RECOMMENDED for V1
      console.warn(
        "[AI Provider] WARNING: OpenAI provider is deprecated for V1 mode",
      );
      console.warn("[AI Provider] Consider using AI_PROVIDER=rules instead");
      throw new Error(
        "OpenAI provider not available in V1 mode. Use AI_PROVIDER=rules",
      );

    default:
      console.warn(
        `[AI Provider] Unknown provider: ${config.aiProvider}, falling back to rules`,
      );
      cachedProvider = new RulesBasedAIProvider();
  }

  console.log(
    `[AI Provider] Using: ${cachedProvider.name} (type: ${cachedProvider.type})`,
  );

  return cachedProvider;
}

/**
 * Reset cached provider (useful for tests)
 */
export function resetAIProvider(): void {
  cachedProvider = null;
}

/**
 * Check if AI provider is available
 */
export function isAIProviderAvailable(): boolean {
  try {
    const provider = getAIProvider();
    return provider.isAvailable();
  } catch (error) {
    console.error("[AI Provider] Error checking availability:", error);
    return false;
  }
}

// Export types and providers
export * from "./types";
export { RulesBasedAIProvider } from "./rules";
export { NoOpAIProvider } from "./none";
