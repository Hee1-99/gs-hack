import type { ChatScenarioId } from './types';
export const chatScenarios: { id: ChatScenarioId; title: string; description: string; opening: string; goal: string; emoji: string; sourceTitles: string[] }[] = [
  { id: 'promotion', title: '행사 상품 문의', description: '헷갈리는 행사 조건을 차분하게 설명해요.', opening: '안녕하세요. 이 캔커피 A 세 개 사면 행사 적용되나요? 다른 음료랑 섞어도 되는지 궁금해요.', goal: '조건 확인 → 정확한 안내 → 이해 확인', emoji: '☕', sourceTitles: ['할인·적립 방법', '다빈도 VOC 유형 및 예방'] },
  { id: 'complaint', title: '불편을 겪은 고객', description: '감정을 받아들이고 해결할 다음 행동을 찾아요.', opening: '아까부터 기다렸는데 아무도 안내를 안 해 주네요. 왜 이렇게 오래 걸려요?', goal: '경청·공감 → 상황 확인 → 후속 안내', emoji: '💬', sourceTitles: ['불만 VOC 응대', '다빈도 VOC 유형 및 예방'] },
  { id: 'refund', title: '교환·환불 문의', description: '처리를 약속하기 전에 필요한 사실을 확인해요.', opening: '조금 전에 산 상품인데 포장이 이상해요. 영수증은 못 찾겠고, 지금 바로 환불해 주세요.', goal: '불편 공감 → 구매 상황 확인 → 담당자 연결', emoji: '🛍️', sourceTitles: ['불만 VOC 응대', '소비기한 VOC 응대'] },
];
export function getChatScenario(id: ChatScenarioId) { return chatScenarios.find(scenario => scenario.id === id)!; }
