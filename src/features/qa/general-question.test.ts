// @vitest-environment node
import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { answerQuestion } from './answer-question';
const demo = { apiKeyPresent: false, demoMode: true, provider: vi.fn() };
it('helps with general first-shift questions without pretending they came from a manual', async () => {
  const answer = await answerQuestion('첫 출근이라 긴장돼요', [], demo);
  expect(answer.answerKind).toBe('general');
  expect(answer.status).toBe('resolved');
  expect(answer.answer).toContain('메모');
  expect(answer.sources).toEqual([]);
});
it('uses the friendly general AI persona on broader questions and never fabricates sources', async () => {
  const provider = vi.fn(async (_prompt: string) => JSON.stringify({ answer: '인사를 먼저 건네고, 모르는 업무는 메모해 하나씩 확인해 보세요.', needsStoreConfirmation: false }));
  const answer = await answerQuestion('동료와 친해지는 방법', [], { apiKeyPresent: true, demoMode: false, provider });
  expect(answer.mode).toBe('live'); expect(answer.answerKind).toBe('general');
  expect(answer.sources).toEqual([]); expect(provider.mock.calls[0][0]).toContain('성실하고 친근한');
});
it('keeps unknown current store policies and private account details in confirmation state', async () => {
  const answer = await answerQuestion('직원 급여 정산 계좌', [], demo);
  expect(answer.answerKind).toBe('needs_confirmation'); expect(answer.status).toBe('unresolved');
  expect(answer.answer).toContain('경영주');
});
