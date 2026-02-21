import request from 'supertest';
import app from '../src/server';

// TODO: This test imports full server - needs refactoring

describe('non-blocking startup', () => {
  it('/health/status returns JSON even with invalid DB/OpenAI', async () => {
    // Simulate missing/invalid DB in env
    process.env.DATABASE_URL = 'invalid-url';
    // Ensure OPENAI_API_KEY absent
    delete process.env.OPENAI_API_KEY;

    const res = await request(app).get('/health/status').expect(200);
    expect(res.body).toBeDefined();
    // envProof must be present and include keys
    expect(res.body.envProof).toBeDefined();
    expect(res.body.envProof.keys).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(res.body.envProof.keys, 'DATABASE_URL')).toBe(true);
  });
});
