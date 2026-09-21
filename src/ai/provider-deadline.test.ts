// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@google/genai', () => ({ GoogleGenAI: class {
  models = { generateContent: async (request: { config: { httpOptions: { timeout: number } } }) => {
    // Reproduces the live API's HTTP 400 for manually set deadlines below 10 seconds.
    if (request.config.httpOptions.timeout < 10_000) throw new Error('Minimum allowed deadline is 10s.');
    return { text: JSON.stringify({ intro: '저기요, 궁금한 게 있어요.', order: ['question'], groundingRuleIds: ['promotion-response'] }) };
  } };
} }));
import { POST } from '@/app/api/ai/customer/route';
import { startSession } from '@/features/simulation/engine';
import { createSeed } from '@/domain/seed';
afterEach(() => vi.unstubAllEnvs());
it('uses a provider-accepted deadline so a valid live reply is not silently replaced by demo', async () => {
  vi.stubEnv('AI_DEMO_MODE', 'false'); vi.stubEnv('GEMINI_API_KEY', 'SYNTHETIC_TEST_KEY');
  const seed = createSeed();
  const response = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify(startSession(seed.scenarios[0], seed)) }));
  expect((await response.json()).mode).toBe('gemini');
});
