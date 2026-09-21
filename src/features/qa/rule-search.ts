import type { StoreRule } from '@/domain/types';
const stopWords = new Set(['어떻게', '어디', '어디에', '무엇', '뭐', '뭐예요', '알려줘', '알려주세요', '궁금해요', '하나요', '해요', '해야', '되나요', '인가요', '대해', '대한', '관련', '좀', '후', '규칙', '문의', '안내', '확인', '방법']);
function tokens(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}+]+/gu, ' ').split(/\s+/).map(word => word.replace(/(해주세요|해요|하나요|인가요|되나요|에서는|에서|에게|으로|에는|은|는|을|를|이|가|에|와|과)$/u, '')).filter(word => word.length >= 2 && !stopWords.has(word));
}
// Conservative matching: all meaningful terms must be supported by one rule.
// A lone shared word never licenses an answer about a different subject.
export function findRelevantRules(question: string, rules: StoreRule[]): StoreRule[] {
  if (!question.trim()) return [];
  const terms = tokens(question);
  if (!terms.length) return [];
  const candidates = rules.filter(rule => {
    const titleTerms = tokens(rule.title);
    const corpus = `${rule.title} ${rule.content} ${rule.exception}`.normalize('NFKC').toLowerCase();
    return terms.some(term => titleTerms.includes(term)) && terms.every(term => corpus.includes(term));
  });
  return candidates.length === 1 ? structuredClone(candidates) : [];
}
