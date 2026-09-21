import { expect, it } from 'vitest';
import { createSeed } from '@/domain/seed';
import { findRelevantRules } from './rule-search';
it('returns no support for a question outside the manual', () => {
  expect(findRelevantRules('택배는 어떻게 보내요?', createSeed().rules)).toEqual([]);
});
it('finds the promotion rule and returns the currently saved content', () => {
  const seed = createSeed();
  seed.rules[0].content = '새로 저장한 안내 문장입니다.'; seed.rules[0].version = 2;
  const rules = findRelevantRules('행사 문의는 POS 확인 후 안내', seed.rules);
  expect(rules).toHaveLength(1);
  expect(rules[0]).toMatchObject({ id: 'promotion-response', version: 2, content: '새로 저장한 안내 문장입니다.' });
});
it('does not resolve a dangerous unrelated question on one coincidental word', () => {
  expect(findRelevantRules('행사 중 화재가 나면 어떻게 해요?', createSeed().rules)).toEqual([]);
});
it('leaves blank and ambiguous questions unresolved', () => {
  const rules = createSeed().rules;
  expect(findRelevantRules('   ', rules)).toEqual([]);
  rules.push({ ...rules[0], id: 'another-promotion' });
  expect(findRelevantRules(rules[0].title, rules)).toEqual([]);
});
