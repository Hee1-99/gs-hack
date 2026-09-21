// @vitest-environment node
import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { createSeed } from '@/domain/seed';
import { questionSchema } from '@/domain/types';
import { answerQuestion } from './answer-question';
it('preserves the full permitted manual content and exception in a valid persisted answer', async () => {
  const seed = createSeed(); const rule = seed.rules[0];
  rule.content = '가'.repeat(2000); rule.exception = '나'.repeat(2000);
  const reply = await answerQuestion(rule.title, seed.rules, { apiKeyPresent: false, demoMode: true, provider: vi.fn() });
  expect(reply.answer).toContain(rule.content); expect(reply.answer).toContain(rule.exception);
  expect(questionSchema.safeParse(reply).success).toBe(true);
});
