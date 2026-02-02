export function getValidEnvKey(name: string): string | undefined {
  const v = process.env[name];
  if (!v) return undefined;
  const low = v.toLowerCase();
  if (low.includes('placeholder') || low.includes('your_') || low.includes('xxxx') || low.includes('sk-placeholder')) return undefined;
  if (v.trim() === '' ) return undefined;
  return v;
}
