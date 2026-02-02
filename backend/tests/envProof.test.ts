import envProof, { loadDotenvFile } from '../src/utils/envProof';
import path from 'path';

// Use actual fs for this test since setup.ts mocks it
const actualFs = jest.requireActual('fs');

describe('envProof', () => {
  const tmpPath = path.resolve(__dirname, '.test.env');
  
  afterEach(() => {
    try { actualFs.unlinkSync(tmpPath); } catch {}
  });

  it('loads dotenv file and produces fingerprints without exposing values', () => {
    const content = 'OPENAI_API_KEY=sk_test_abc123\nDATABASE_URL=postgresql://user:pass@localhost:5432/db';
    actualFs.writeFileSync(tmpPath, content, 'utf-8');
    
    // Verify file was written
    expect(actualFs.existsSync(tmpPath)).toBe(true);

    const loaded = loadDotenvFile(tmpPath);
    if (!loaded.loaded) {
      console.error('Failed to load:', loaded.error?.message, 'Path:', tmpPath);
    }
    expect(loaded.loaded).toBe(true);
    const proof = envProof.getEnvProof(['OPENAI_API_KEY', 'DATABASE_URL']);
    expect(proof.dotenvLoaded).toBe(true);
    expect(proof.dotenvParsedKeyCount).toBeGreaterThanOrEqual(2);
    expect(proof.keys.OPENAI_API_KEY.present).toBe(true);
    expect(typeof proof.keys.OPENAI_API_KEY.fingerprint).toBe('string');
    expect(proof.keys.OPENAI_API_KEY.fingerprint!.length).toBe(10);
    expect(proof.keys.DATABASE_URL.present).toBe(true);
  });
});
