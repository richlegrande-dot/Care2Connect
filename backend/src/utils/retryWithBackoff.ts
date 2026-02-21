/**
 * Retry with Exponential Backoff
 *
 * Provides resilient retry logic for transient failures in pipeline operations.
 * Uses exponential backoff: 2s, 4s, 8s, 16s, etc.
 */

export interface RetryOptions {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[]; // Error messages/codes to retry
  onRetry?: (error: Error, attempt: number) => void;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 2000, // 2 seconds
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENOTFOUND",
    "ECONNABORTED",
    "ENETUNREACH",
    "EAI_AGAIN",
    "rate_limit_exceeded",
    "service_unavailable",
    "timeout",
    "connection",
    "429", // Too many requests
    "500", // Internal server error
    "502", // Bad gateway
    "503", // Service unavailable
    "504", // Gateway timeout
  ],
};

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };

  let lastError: Error | undefined;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // First attempt or retry
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryableError(lastError, opts.retryableErrors)) {
        throw lastError; // Non-retryable, fail immediately
      }

      // Last attempt exhausted
      if (attempt >= opts.maxRetries) {
        throw new Error(
          `Operation failed after ${opts.maxRetries + 1} attempts: ${lastError.message}`,
        );
      }

      // Notify about retry
      if (opts.onRetry) {
        opts.onRetry(lastError, attempt + 1);
      }

      // Wait before retry
      await sleep(delay);

      // Increase delay for next retry (exponential backoff)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error("Unknown error during retry");
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error, retryableErrors?: string[]): boolean {
  if (!retryableErrors || retryableErrors.length === 0) {
    return true; // Retry all errors if no specific list provided
  }

  const errorMessage = error.message.toLowerCase();
  const errorCode = (error as any).code?.toLowerCase() || "";
  const errorName = error.name.toLowerCase();

  return retryableErrors.some((retryable) => {
    const retryableLower = retryable.toLowerCase();
    return (
      errorMessage.includes(retryableLower) ||
      errorCode.includes(retryableLower) ||
      errorName.includes(retryableLower)
    );
  });
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with circuit breaker pattern (prevents cascading failures)
 */
export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 60000, // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === "OPEN") {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure >= this.resetTimeout) {
        // Try half-open
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN - too many recent failures");
      }
    }

    try {
      const result = await operation();

      // Success - reset circuit
      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      // Failure - update circuit
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = "OPEN";
      }

      throw error;
    }
  }

  getState(): { state: "CLOSED" | "OPEN" | "HALF_OPEN"; failureCount: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
    };
  }

  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Timeout wrapper for promises
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = "Operation timed out",
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
    ),
  ]);
}

/**
 * Retry configuration presets
 */
export const RETRY_PRESETS = {
  // For quick API calls (transcription, analysis)
  QUICK: {
    maxRetries: 2,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },

  // For longer operations (AssemblyAI transcription)
  STANDARD: {
    maxRetries: 3,
    initialDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },

  // For critical operations that should be retried aggressively
  AGGRESSIVE: {
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 60000,
    backoffMultiplier: 3,
  },

  // For database operations
  DATABASE: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
      "ECONNRESET",
      "ETIMEDOUT",
      "ECONNREFUSED",
      "connection",
      "lock",
      "deadlock",
    ],
  },
};
