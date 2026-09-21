import type { SimulationSession } from '@/domain/types';
import { validateSession } from '@/features/simulation/rule-validator';
import type { AiReply, MessagePlan } from './types';

export function customerPlan(session: SimulationSession): MessagePlan {
  return { role: 'customer', intros: ['저기요, 궁금한 게 있어요.', '안녕하세요. 하나 여쭤봐도 될까요?', '이 상품에 대해 물어볼게요.'], clauses: { question: session.scenario.customerQuestion }, groundingRuleIds: session.scenario.ruleIds };
}
export function coachingPlan(session: SimulationSession): MessagePlan {
  const results = validateSession(session);
  return { role: 'coach', intros: ['이번 응대를 함께 돌아볼까요?', '기록된 행동을 차근차근 살펴봐요.', '다음 응대를 위한 연습을 이어가요.'], groundingRuleIds: session.scenario.ruleIds, results,
    clauses: {
      lookup: results.promotionLookupPerformed ? '해당 상품을 POS에서 조회했어요.' : '이번에는 해당 상품의 POS 조회를 놓쳤어요.',
      order: results.definitiveBeforeLookup ? '확인하기 전에 확정 안내를 했어요. 다음에는 먼저 POS에서 조건을 확인해 주세요.' : '확인 전 확정 안내는 하지 않았어요.',
      answer: results.finalAnswerCorrect ? '마지막에 선택한 안내 내용은 이 시나리오의 조건과 맞아요.' : '마지막 안내 내용이 시나리오의 조건과 달라요. POS와 예외 처리 규칙을 다시 살펴봐요.',
      confirmation: results.managerConfirmationRequested ? '경영주 확인 요청을 기록했어요.' : results.expectedIntent === 'check_manager' ? '이 예외 상황에는 경영주 확인 요청이 필요해요.' : '이 상황에는 추가 경영주 확인 요청이 필수는 아니에요.',
    },
  };
}
export function renderPlan(plan: MessagePlan, intro = plan.intros[0], order = Object.keys(plan.clauses), mode: AiReply['mode'] = 'demo'): AiReply {
  return { content: [intro, ...order.map(id => plan.clauses[id])].join('\n'), mode, groundingRuleIds: [...plan.groundingRuleIds], ...(plan.results ? { results: plan.results } : {}) };
}
