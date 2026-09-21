// @vitest-environment node
import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { answerQuestion } from './answer-question';
import { manualPassages, searchManual, parseUploadedManual } from '@/features/manual-reference/manual';
import { createSeed } from '@/domain/seed';
const demo = { apiKeyPresent: false, demoMode: true, provider: vi.fn() };
it('uploaded source wins even when the question exactly matches a store rule', async () => {
  const rules = createSeed().rules;
  const answer = await answerQuestion(rules[0].title, rules, demo, { name: '행사.md', text: `# ${rules[0].title}\n행사 문의는 업로드 문서의 담당 창구에 확인합니다.` });
  expect(answer.answer).toContain('업로드 문서의 담당 창구');
  expect(answer.answer).not.toContain('3,000원');
  expect(answer.rules).toEqual([]);
  expect(answer.sources?.[0].origin).toBe('upload');
});
it('unsupported uploaded source cannot silently fall back to default or store rules', async () => {
  const rules = createSeed().rules;
  const answer = await answerQuestion(rules[0].title, rules, demo, { name: '우산.md', text: '# 우산 보관\n우산함에 보관합니다.' });
  expect(answer.status).toBe('unresolved');
  expect(answer.rules).toEqual([]);
  expect(answer.sources).toEqual([]);
});
it('generic procedural questions prefer confirmed manual over a seed rule while explicit rule titles retain deterministic facts', async () => {
  const rules = createSeed().rules;
  const manual = await answerQuestion('소비기한 확인', rules, demo);
  expect(manual.rules).toEqual([]);
  expect(manual.sources?.length).toBeGreaterThan(0);
  const promotion = await answerQuestion(rules[0].title, rules, demo);
  expect(promotion.rules[0].id).toBe(rules[0].id);
  expect(promotion.answer).toContain('3,000원');
});
it('retrieves confirmed summary passages with actual source URLs and excludes missing bodies', () => {
  expect(manualPassages).toHaveLength(58);
  expect(searchManual('불만 VOC 응대')[0]).toMatchObject({ title: '불만 VOC 응대', status: '본문 요약 확보' });
  expect(searchManual('쿠션언어')).toEqual([]);
});
it('answers from supplied manual with no manager rules and preserves evidence', async () => {
  const answer = await answerQuestion('상품 검수', [], demo);
  expect(answer.status).toBe('resolved');
  expect(answer.answer).toContain('실제 입고 수량');
  expect(answer.sources?.[0].url).toContain('youtu');
  expect(answer.sources).toHaveLength(1);
  expect(answer.rules).toEqual([]);
});
it('does not guess absent topics or pending source bodies', async () => {
  expect((await answerQuestion('쿠션언어', [], demo)).status).toBe('unresolved');
  expect((await answerQuestion('직원 급여 정산 계좌', [], demo)).status).toBe('unresolved');
  expect((await answerQuestion('상품 검수 비밀번호', [], demo)).status).toBe('unresolved');
});
it('uses an uploaded manual and passes the actual question and passages to Gemini', async () => {
  const upload = { name: '매장안내.md', text: '# 우산 보관\n고객 우산은 출입문 옆 우산함에 보관한다.' };
  const sources = parseUploadedManual(upload);
  const provider = vi.fn(async (_prompt: string) => JSON.stringify({ answer: '고객 우산은 출입문 옆 우산함에 보관해 주세요.', sourceIds: [sources[0].id] }));
  const answer = await answerQuestion('우산 보관', [], { apiKeyPresent: true, demoMode: false, provider }, upload);
  expect(answer.mode).toBe('live');
  expect(answer.sources?.[0].origin).toBe('upload');
  expect(provider.mock.calls[0]?.[0]).toContain('출입문 옆 우산함');
});
it('falls back on deadline and fabricated numerical facts without exposing provider errors', async () => {
  const timeout = await answerQuestion('상품 검수', [], { apiKeyPresent: true, demoMode: false, timeoutMs: 5, provider: vi.fn(() => new Promise<string>(() => {})) });
  expect(timeout.mode).toBe('demo');
  const source = searchManual('상품 검수')[0];
  const fabricated = await answerQuestion('상품 검수', [], { apiKeyPresent: true, demoMode: false, provider: vi.fn(async () => JSON.stringify({ answer: '99999원 지급합니다.', sourceIds: [source.id] })) });
  expect(fabricated.mode).toBe('demo');
  expect(fabricated.answer).not.toContain('99999');
});
it('rejects fabricated citations and falls back to actual excerpts', async () => {
  const answer = await answerQuestion('상품 검수', [], { apiKeyPresent: true, demoMode: false, provider: vi.fn(async () => JSON.stringify({ answer: '무조건 환불하세요', sourceIds: ['invented'] })) });
  expect(answer.mode).toBe('demo');
  expect(answer.answer).not.toContain('무조건 환불');
});
it('does not accept a shortened number merely because it is a substring of a source value', async () => {
  const upload = { name: '가상매장.txt', text: '# 가상 상품\n가상 상품의 가격은 1500원입니다.' };
  const provider = vi.fn(async () => JSON.stringify({ answer: '가상 상품은 15원입니다.', sourceIds: ['upload-0'] }));
  const answer = await answerQuestion('가상 상품', [], { apiKeyPresent: true, demoMode: false, provider }, upload);
  expect(answer.mode).toBe('demo');
  expect(answer.answer).toContain('1500원');
});
