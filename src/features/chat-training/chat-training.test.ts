// @vitest-environment node
import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { handleChatTraining } from './server';
import { chatRequestSchema } from './types';
const demo = { apiKeyPresent: false, demoMode: true, provider: vi.fn() };
const messages = [{ role: 'customer' as const, text: '이 커피 세 개 행사인가요?' }, { role: 'manager' as const, text: '안녕하세요. POS에서 상품과 행사 조건을 확인한 뒤 정확하게 안내해 드리겠습니다.' }];
it('uses scenario facts on server and returns a bounded customer turn in demo mode', async () => {
  const result = await handleChatTraining({ scenarioId: 'promotion', messages, action: 'reply' }, demo);
  expect(result.mode).toBe('demo'); expect(result.message?.length).toBeGreaterThan(10); expect(demo.provider).not.toHaveBeenCalled();
});
it('evaluates the actual transcript, keeps citations real and derives the total from four rubric items', async () => {
  const result = await handleChatTraining({ scenarioId: 'promotion', messages, action: 'finish' }, demo);
  expect(result.feedback?.criteria).toHaveLength(4);
  expect(result.feedback?.score).toBe(result.feedback?.criteria.reduce((sum, item) => sum + item.score, 0));
  expect(result.sources.length).toBeGreaterThan(0);
});
it('rejects oversized and nonalternating conversations rather than sending them to Gemini', () => {
  expect(chatRequestSchema.safeParse({ scenarioId: 'promotion', messages: Array.from({ length: 20 }, () => messages[1]), action: 'reply' }).success).toBe(false);
  expect(chatRequestSchema.safeParse({ scenarioId: 'promotion', messages: [messages[1]], action: 'reply' }).success).toBe(false);
});
it('falls back when the model invents citations or scores outside the rubric', async () => {
  const provider = vi.fn(async () => JSON.stringify({ summary: '무조건 완벽', strengths: ['좋음'], improvements: ['없음'], criteria: [{ id: 'empathy', score: 999, comment: '완벽' }], sourceIds: ['invented'] }));
  const result = await handleChatTraining({ scenarioId: 'promotion', messages, action: 'finish' }, { apiKeyPresent: true, demoMode: false, provider });
  expect(result.mode).toBe('demo'); expect(result.feedback?.score).toBeLessThanOrEqual(100);
  expect(result.feedback?.sourceIds).not.toContain('invented');
});
