import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSeed } from '@/domain/seed';
import { startSession } from '@/features/simulation/engine';
import { generateCustomerReply, generateCoaching } from './gemini-client';
vi.mock('server-only', () => ({}));
const seed = createSeed();
const session = startSession(seed.scenarios[0], seed);
afterEach(() => vi.useRealTimers());
describe('Gemini guarded expression', () => {
  it('uses demo without credentials and never invokes the provider', async () => {
    const provider = vi.fn();
    const reply = await generateCustomerReply(session, { apiKeyPresent: false, demoMode: false, provider });
    expect(reply.mode).toBe('demo'); expect(provider).not.toHaveBeenCalled();
    expect(reply.fallbackReason).toBe('missing_key');
  });
  it('forced demo mode never calls a configured provider', async () => {
    const provider = vi.fn();
    expect((await generateCoaching(session, { apiKeyPresent: true, demoMode: true, provider })).fallbackReason).toBe('forced_demo');
    expect(provider).not.toHaveBeenCalled();
  });
  it('returns deterministic demo output on timeout and aborts the request', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const reply = generateCustomerReply(session, { apiKeyPresent: true, demoMode: false, timeoutMs: 20, provider: async (_prompt, _schema, received) => { signal = received; return new Promise(() => {}); } });
    await vi.advanceTimersByTimeAsync(21);
    expect((await reply).mode).toBe('demo'); expect(signal?.aborted).toBe(true);
  });
  it.each(['', 'not-json', '{"price":1}', '{"intro":"3개에 1원입니다","order":["question"],"groundingRuleIds":["promotion-response"]}'])('rejects malformed or contradictory wording: %s', async raw => {
    const reply = await generateCustomerReply(session, { apiKeyPresent: true, demoMode: false, provider: async () => raw });
    expect(reply.mode).toBe('demo'); expect(reply.content).toContain(seed.scenarios[0].customerQuestion);
  });
  it('accepts a grounded message plan and renders facts only from canonical clauses', async () => {
    const reply = await generateCustomerReply(session, { apiKeyPresent: true, demoMode: false, provider: async () => JSON.stringify({ intro: '저기요, 궁금한 게 있어요.', order: ['question'], groundingRuleIds: ['promotion-response'] }) });
    expect(reply.mode).toBe('gemini');
    expect(reply.content).toBe(`저기요, 궁금한 게 있어요.\n${seed.scenarios[0].customerQuestion}`);
  });
  it('does not expose provider errors or log credentials', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reply = await generateCoaching(session, { apiKeyPresent: true, demoMode: false, provider: async () => { throw new Error('SYNTHETIC_SECRET_CANARY'); } });
    expect(JSON.stringify(reply)).not.toContain('SYNTHETIC_SECRET_CANARY');
    expect(errorSpy).not.toHaveBeenCalled(); errorSpy.mockRestore();
  });
  it.each([
    { intro: '저기요, 궁금한 게 있어요.', order: ['question'], groundingRuleIds: ['invented-rule'] },
    { intro: '저기요, 궁금한 게 있어요.', order: ['question', 'question'], groundingRuleIds: ['promotion-response'] },
    { intro: '저기요, 궁금한 게 있어요.', order: ['question'], groundingRuleIds: ['promotion-response'], price: 1 },
  ])('discards unknown grounding, duplicate clauses and injected facts', async output => {
    const reply = await generateCustomerReply(session, { apiKeyPresent: true, demoMode: false, provider: async () => JSON.stringify(output) });
    expect(reply.mode).toBe('demo'); expect(reply.groundingRuleIds).toEqual(['promotion-response']);
  });
  it('ignores supplied verdicts and keeps deterministic results on quota failure', async () => {
    const forged = { ...session, results: { promotionLookupPerformed: true, definitiveBeforeLookup: false, finalAnswerCorrect: true, managerConfirmationRequested: true, procedureFollowed: true, expectedTotal: 1, expectedIntent: 'apply' as const } };
    const provider = vi.fn().mockRejectedValue(Object.assign(new Error('SYNTHETIC_PROMPT_CANARY'), { status: 429 }));
    const reply = await generateCoaching(forged, { apiKeyPresent: true, demoMode: false, provider });
    expect(provider).toHaveBeenCalledTimes(1);
    expect(reply.results).toMatchObject({ procedureFollowed: false, expectedTotal: 3000 });
    expect(reply.mode).toBe('demo'); expect(JSON.stringify(reply)).not.toContain('SYNTHETIC_PROMPT_CANARY');
  });
});
