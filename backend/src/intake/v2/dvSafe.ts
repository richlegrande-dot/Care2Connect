/**
 * V2 DV-Safe Mode Utilities
 *
 * Provides safety-first features for domestic violence survivors:
 *   - Storage minimization: redact sensitive fields before DB persist
 *   - Log sanitization: strip sensitive values from server logs
 *   - Panic button: configurable neutral URL via env var
 *
 * @module intake/v2/dvSafe
 */

// ── DV-sensitive signals ───────────────────────────────────────

export const DV_SENSITIVE_SIGNALS = new Set([
  'fleeing_dv',
  'fleeing_trafficking',
  'has_protective_order',
  'experienced_violence_recently',
  'feels_safe_current_location',
]);

// ── Storage minimization ───────────────────────────────────────

/**
 * Redact raw safety-field values for database storage.
 * Replaces sensitive values with '[REDACTED]' so scoring provenance
 * is preserved (the signal contributed) but raw answers are not stored.
 */
export function redactSensitiveModules(
  modules: Record<string, unknown>
): { redacted: Record<string, unknown>; sensitiveDataRedacted: boolean } {
  const redacted = JSON.parse(JSON.stringify(modules)) as Record<string, unknown>;
  const safety = redacted.safety as Record<string, unknown> | undefined;
  let didRedact = false;

  if (safety) {
    for (const field of DV_SENSITIVE_SIGNALS) {
      if (field in safety && safety[field] !== undefined) {
        safety[field] = '[REDACTED]';
        didRedact = true;
      }
    }
  }

  return { redacted, sensitiveDataRedacted: didRedact };
}

// ── Log sanitization ───────────────────────────────────────────

/**
 * Strip DV-sensitive field values from a log payload.
 * Returns a new object safe for logging — no mutation.
 */
export function sanitizeForLogging(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const sanitized = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;

  // Walk top-level and nested module keys
  for (const key of Object.keys(sanitized)) {
    const val = sanitized[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const nested = val as Record<string, unknown>;
      for (const field of DV_SENSITIVE_SIGNALS) {
        if (field in nested) {
          nested[field] = '[LOG_REDACTED]';
        }
      }
    }
  }

  // Also sanitize if the payload itself is a module object
  for (const field of DV_SENSITIVE_SIGNALS) {
    if (field in sanitized) {
      sanitized[field] = '[LOG_REDACTED]';
    }
  }

  return sanitized;
}

// ── Panic button ───────────────────────────────────────────────

/**
 * The panic button URL — defaults to Google.com (neutral, not suspicious).
 * Operators can configure via DV_PANIC_BUTTON_URL env var.
 */
export function getPanicButtonUrl(): string {
  return process.env.DV_PANIC_BUTTON_URL || 'https://www.google.com';
}

/**
 * Returns the panic-button config for the frontend.
 * Includes URL and instructions for IndexedDB/sessionStorage clearing.
 */
export function getPanicButtonConfig(): {
  url: string;
  clearIndexedDB: boolean;
  clearSessionStorage: boolean;
  clearLocalStorage: boolean;
} {
  return {
    url: getPanicButtonUrl(),
    clearIndexedDB: true,
    clearSessionStorage: true,
    clearLocalStorage: true,
  };
}
