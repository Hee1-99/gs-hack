import 'server-only';
import type { AiOptions } from '@/ai/types';
import { expressPlan } from '@/ai/gemini-client';
import { createSeed } from '@/domain/seed';
import { money, promotionDescription, promotionFor } from '@/domain/promotion';
import type { QuestionLog, StoreRule } from '@/domain/types';
import { findRelevantRules } from './rule-search';
import { searchManual } from '@/features/manual-reference/manual';
import type { UploadedManual } from '@/features/manual-reference/upload';
import { generateManualAnswer } from '@/ai/manual-answer';
import { generateGeneralAnswer } from '@/ai/general-answer';
export async function answerQuestion(question: string, rules: StoreRule[], options: AiOptions, upload?: UploadedManual): Promise<QuestionLog> {
  const supporting = upload ? [] : findRelevantRules(question, rules);
  const explicitRule = supporting.some(rule => rule.title.trim() === question.trim());
  const syntheticFacts = supporting.some(rule => rule.topic === 'promotion') && /캔커피|2\s*\+\s*1|가상|가격|금액|얼마|수량/.test(question);
  const sources = !upload && (explicitRule || syntheticFacts) ? [] : searchManual(question, upload);
  const useManual = Boolean(upload) || sources.length > 0 || !supporting.length;
  const base = { id: crypto.randomUUID(), question, rules: useManual ? [] : supporting, createdAt: new Date().toISOString() };
  if (useManual) {
    if (!sources.length) {
      const reply = await generateGeneralAnswer(question, options);
      return { ...base, sources: [], answer: reply.answer, answerKind: reply.needsStoreConfirmation ? 'needs_confirmation' : 'general', status: reply.needsStoreConfirmation ? 'unresolved' : 'resolved', mode: reply.mode };
    }
    const reply = await generateManualAnswer(question, sources, options);
    const caution = sources.some(source => /법률|정책|결제|환불|신분|연령|온도|안전/.test(`${source.title} ${source.excerpt}`)) ? '\n\n실제 적용 전 최신 공식 지침 또는 경영주에게 확인해 주세요.' : '';
    return { ...base, ...reply, answer: reply.answer + caution, answerKind: 'manual', status: 'resolved' };
  }
  const rule = supporting[0];
  const clauses: Record<string, string> = { rule: rule.content, exception: `예외 처리: ${rule.exception}` };
  if (rule.topic === 'promotion') {
    const seed = createSeed();
    clauses.facts = seed.products.map(product => `${product.name}: ${money(product.price)} · ${promotionDescription(product, promotionFor(product.id, seed.promotions))}`).join('\n');
  }
  const reply = await expressPlan({ role: 'qa', intros: ['저장된 매장 규칙에서 확인했어요.', '이 매장의 안내 기준을 함께 살펴봐요.', '아래 규칙을 참고해 주세요.'], clauses, groundingRuleIds: supporting.map(rule => rule.id) }, options);
  return { ...base, answer: reply.content, answerKind: 'manual', status: 'resolved', mode: reply.mode === 'gemini' ? 'live' : 'demo' };
}
