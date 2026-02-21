export function detectStripeKeyType(key?: string): 'secret'|'publishable'|'unknown'|'invalid' {
  if (!key) return 'unknown';
  if (key.startsWith('sk_')) return 'secret';
  if (key.startsWith('pk_')) return 'publishable';
  // Check for common placeholder or invalid formats
  if (key.includes('your_') || key.includes('placeholder') || key.includes('test_key')) return 'invalid';
  return 'unknown';
}

export function validateStripeKey(key?: string): { valid: boolean; reason?: string } {
  if (!key) return { valid: false, reason: 'Key not provided' };
  
  const type = detectStripeKeyType(key);
  if (type === 'invalid') return { valid: false, reason: 'Key appears to be a placeholder' };
  if (type === 'unknown') return { valid: false, reason: 'Key format not recognized (expected sk_test_/sk_live_/pk_test_/pk_live_)' };
  
  return { valid: true };
}

export function resolveStripeKeysFromEnv() {
  const envKey = process.env.STRIPE_KEY || process.env.STRIPE_SECRET_KEY || process.env.STRIPE_PUBLISHABLE_KEY;
  const result: { secret?: string; publishable?: string } = {};
  if (!envKey) {
    if (process.env.STRIPE_SECRET_KEY) result.secret = process.env.STRIPE_SECRET_KEY;
    if (process.env.STRIPE_PUBLISHABLE_KEY) result.publishable = process.env.STRIPE_PUBLISHABLE_KEY;
    return result;
  }
  const t = detectStripeKeyType(envKey);
  if (t === 'secret') result.secret = envKey;
  if (t === 'publishable') result.publishable = envKey;
  // Do not write to .env automatically; runtime-only mapping
  return result;
}
