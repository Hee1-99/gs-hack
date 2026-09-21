// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { POST as customer } from '@/app/api/ai/customer/route';
import { POST as coach } from '@/app/api/ai/coach/route';
import { createSeed } from '@/domain/seed';
import { startSession } from '@/features/simulation/engine';
afterEach(() => vi.unstubAllEnvs());
it('both routes work in forced demo even with a key configured', async () => {
  vi.stubEnv('AI_DEMO_MODE', 'true'); vi.stubEnv('GEMINI_API_KEY', 'SYNTHETIC_TEST_KEY');
  const seed = createSeed(); const session = startSession(seed.scenarios[0], seed);
  for (const handler of [customer, coach]) {
    const response = await handler(new Request('http://localhost/api', { method: 'POST', body: JSON.stringify(session) }));
    expect(response.status).toBe(200);
    const reply = await response.json();
    expect(reply.mode).toBe('demo'); expect(reply.groundingRuleIds).toEqual(['promotion-response']);
    expect(JSON.stringify(reply)).not.toContain('SYNTHETIC_TEST_KEY');
  }
});
it('rejects invalid requests with a safe message', async () => {
  const response = await customer(new Request('http://localhost/api', { method: 'POST', body: '{not-json' }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: '요청 내용을 확인한 뒤 다시 시도해 주세요.' });
});
