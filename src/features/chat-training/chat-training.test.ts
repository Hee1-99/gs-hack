// @vitest-environment node
import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { handleChatTraining } from './server';
import { chatRequestSchema } from './types';
import { getScenarioFacts } from './scenario-facts';
const demo = { apiKeyPresent: false, demoMode: true, provider: vi.fn() };
const messages = [{ role: 'customer' as const, text: '이 커피 세 개 행사인가요?' }, { role: 'manager' as const, text: '안녕하세요. POS에서 상품과 행사 조건을 확인한 뒤 정확하게 안내해 드리겠습니다.' }];
it('uses scenario facts on server and returns a bounded customer turn in demo mode', async () => {
  const result = await handleChatTraining({ scenarioId: 'promotion', messages, action: 'reply' }, demo);
  expect(result.mode).toBe('demo'); expect(result.message?.length).toBeGreaterThan(10); expect(demo.provider).not.toHaveBeenCalled();
  expect(result.shouldFinish).toBe(false);
});
it('signals a natural customer closure so the client can move to feedback early', async () => {
  const result = await handleChatTraining({ scenarioId: 'promotion', messages: [{ role: 'customer', text: '행사 상품인가요?' }, { role: 'manager', text: '같은 캔커피 A 세 개를 고르시면 3,000원이고 다른 음료와 섞으면 적용되지 않아요. 세 개로 준비해 드릴까요?' }], action: 'reply' }, demo);
  expect(result.message).toContain('감사합니다');
  expect(result.shouldFinish).toBe(true);
});
it('evaluates the actual transcript, keeps citations real and derives the total from four rubric items', async () => {
  const result = await handleChatTraining({ scenarioId: 'promotion', messages, action: 'finish' }, demo);
  expect(result.feedback?.criteria).toHaveLength(4);
  expect(result.feedback?.score).toBe(result.feedback?.criteria.reduce((sum, item) => sum + item.score, 0));
  expect(result.feedback?.criteria[0].comment).toContain('경청·공감 관련 표현');
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
it('gives the learner and coach the same scenario facts before any reply', async () => {
  const result = await handleChatTraining({ scenarioId: 'promotion', messages, action: 'reply' }, demo);
  expect(result.facts).toEqual(getScenarioFacts('promotion'));
  expect(result.facts.join(' ')).toContain('1,500원');
  expect(result.facts.join(' ')).toContain('3,000원');
  expect(result.facts.join(' ')).toContain('동일 상품만');
});
it('does not require unprovided policy, wait time or medical assumptions when coaching', async () => {
  const provider = vi.fn(async (_prompt: string) => '{}');
  await handleChatTraining({ scenarioId: 'refund', messages, action: 'finish' }, { apiKeyPresent: true, demoMode: false, provider });
  const prompt = JSON.parse(provider.mock.calls[0][0]);
  expect(prompt.constraints).toContain('미제공 정보를 모른다는 이유로 감점하지');
  expect(prompt.constraints).toContain('소비기한 문제나 건강 이상을 임의로 가정하지');
  expect(prompt.constraints).toContain('연락 예정 시점이나 연락처 수집을 필수 행동으로 요구하지');
  expect(prompt.constraints).toContain('오늘 중으로');
  expect(prompt.constraints).toContain('마지막 고객 질문에 아직 답할 차례가 오지 않은');
  expect(prompt.learnerVisibleFacts).toEqual(getScenarioFacts('refund'));
});
it('makes demo follow-ups respond to the actual situation rather than generic instructions', async () => {
  const complaint = await handleChatTraining({ scenarioId: 'complaint', messages: [{ role: 'customer', text: '왜 기다려야 하나요?' }, { role: 'manager', text: '기다리시게 해서 죄송합니다.' }], action: 'reply' }, demo);
  expect(complaint.message).toContain('기다리는');
  const refund = await handleChatTraining({ scenarioId: 'refund', messages: [{ role: 'customer', text: '환불해 주세요.' }, { role: 'manager', text: '상품과 결제 내역을 확인하겠습니다.' }], action: 'reply' }, demo);
  expect(refund.message).toContain('카드 결제 내역');
});
it('lets a manager discover fictional customer details by asking instead of looping questions', async () => {
  const result = await handleChatTraining({ scenarioId: 'refund', messages: [{ role: 'customer', text: '환불해 주세요.' }, { role: 'manager', text: '어떤 상품을 구매하셨고, 어디가 이상한지 보여 주시겠어요?' }], action: 'reply' }, demo);
  expect(result.message).toContain('봉지 과자');
  expect(result.message).toContain('옆면');
});
it('uses factual-inquiry empathy criteria without demanding an apology or hedging a confirmed rule', async () => {
  const provider = vi.fn(async (_prompt: string) => '{}');
  await handleChatTraining({ scenarioId: 'promotion', messages: [{ role: 'customer', text: '이 커피 세 개 행사인가요? 다른 음료와 섞어도 되나요?' }, { role: 'manager', text: '안녕하세요. 캔커피 A는 같은 상품 세 개에 3,000원입니다. 다른 음료와 섞는 것은 적용되지 않아요. 세 개로 준비해 드릴까요?' }], action: 'finish' }, { apiKeyPresent: true, demoMode: false, provider });
  const prompt = JSON.parse(provider.mock.calls[0][0]);
  expect(prompt.scenarioRubric).toContain('사과나 감정 공감을 의무로 요구하지');
  expect(prompt.scenarioRubric).toContain('적용되지 않아요');
  expect(prompt.scenarioRubric).toContain('확인된 조건을 정중하고 정확하게');
  expect(prompt.scenarioRubric).toContain('억지로 감점');
  await handleChatTraining({ scenarioId: 'complaint', messages, action: 'finish' }, { apiKeyPresent: true, demoMode: false, provider });
  const complaintPrompt = JSON.parse(provider.mock.calls[1][0]);
  expect(complaintPrompt.scenarioRubric).toContain('표현한 불편');
  expect(complaintPrompt.scenarioRubric).not.toBe(prompt.scenarioRubric);
});
