// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const { sdk } = vi.hoisted(() => ({ sdk: vi.fn() }));
vi.mock('@google/genai', () => ({ GoogleGenAI: sdk }));
import { POST as customer } from '@/app/api/ai/customer/route';
import { POST as coach } from '@/app/api/ai/coach/route';
import { POST as qa } from '@/app/api/ai/qa/route';
import { readLimitedJson } from './route-handler';
import { createSeed } from '@/domain/seed';
import { startSession } from '@/features/simulation/engine';
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); vi.clearAllMocks(); });
const request = (body: string) => new Request('http://localhost/api', { method: 'POST', body });
it('all routes make zero SDK calls in forced demo with a configured key', async () => {
  vi.stubEnv('AI_DEMO_MODE', 'true'); vi.stubEnv('GEMINI_API_KEY', 'SYNTHETIC_KEY_CANARY');
  const seed = createSeed();
  for (const [handler, input] of [[customer, startSession(seed.scenarios[0], seed)], [coach, startSession(seed.scenarios[0], seed)], [qa, { question: seed.rules[0].title, rules: seed.rules }]] as const) {
    const response = await handler(request(JSON.stringify(input)));
    expect(response.status).toBe(200); expect((await response.json()).mode).toBe('demo');
  }
  expect(sdk).not.toHaveBeenCalled();
});
it.each([customer, coach, qa])('rejects oversized and invalid schema with no raw input or SDK call', async handler => {
  for (const body of [JSON.stringify({ question: 'x'.repeat(64_001) }), JSON.stringify({ question: 'SYNTHETIC_INPUT_CANARY', rules: [{ id: 'bad' }] })]) {
    const response = await handler(request(body));
    expect(response.status).toBe(400); expect(await response.text()).not.toContain('SYNTHETIC_INPUT_CANARY');
  }
  expect(sdk).not.toHaveBeenCalled();
});
it('cancels a stalled request body after a finite deadline', async () => {
  vi.useFakeTimers();
  const cancel = vi.fn();
  const body = new ReadableStream({ pull() { return new Promise(() => {}); }, cancel });
  const req = new Request('http://localhost', { method: 'POST', body, duplex: 'half' } as RequestInit);
  const read = readLimitedJson(req, 20);
  const rejection = expect(read).rejects.toThrow('request timeout');
  await vi.advanceTimersByTimeAsync(21); await rejection;
  expect(cancel).toHaveBeenCalledTimes(1);
});
