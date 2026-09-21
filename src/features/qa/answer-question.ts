import 'server-only';
import type { AiOptions } from '@/ai/types';
import { expressPlan } from '@/ai/gemini-client';
import { createSeed } from '@/domain/seed';
import { money, promotionDescription, promotionFor } from '@/domain/promotion';
import type { QuestionLog, StoreRule } from '@/domain/types';
import { findRelevantRules } from './rule-search';
export async function answerQuestion(question: string, rules: StoreRule[], options: AiOptions): Promise<QuestionLog> {
  const supporting = findRelevantRules(question, rules);
  const base = { id: crypto.randomUUID(), question, rules: supporting, createdAt: new Date().toISOString() };
  if (!supporting.length) return { ...base, answer: '이 질문에 답할 명확한 매장 규칙을 찾지 못했어요. 경영주에게 확인해 주세요. 확인이 필요한 질문으로 남겨둘게요.', status: 'unresolved', mode: 'demo' };
  const rule = supporting[0];
  const clauses: Record<string, string> = { rule: rule.content, exception: `예외 처리: ${rule.exception}` };
  if (rule.topic === 'promotion') {
    const seed = createSeed();
    clauses.facts = seed.products.map(product => `${product.name}: ${money(product.price)} · ${promotionDescription(product, promotionFor(product.id, seed.promotions))}`).join('\n');
  }
  const reply = await expressPlan({ role: 'qa', intros: ['저장된 매장 규칙에서 확인했어요.', '이 매장의 안내 기준을 함께 살펴봐요.', '아래 규칙을 참고해 주세요.'], clauses, groundingRuleIds: supporting.map(rule => rule.id) }, options);
  return { ...base, answer: reply.content, status: 'resolved', mode: reply.mode === 'gemini' ? 'live' : 'demo' };
}
