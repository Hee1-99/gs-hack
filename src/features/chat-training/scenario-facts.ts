import 'server-only';
import { createSeed } from '@/domain/seed';
import { money, promotionDescription, promotionFor } from '@/domain/promotion';
import type { ChatScenarioId } from './types';

// Fictional details that the customer can disclose when asked. Coaching only
// assesses details already visible to the learner or disclosed in the dialogue.
export const customerDetails = {
  complaint: { purpose: '물건을 계산하려고 기다리고 있었어요. 계산을 도와주실 수 있나요?' },
  refund: {
    product: '이 봉지 과자예요. 봉지 옆면이 벌어져 있는 걸 방금 발견했어요.',
    purchase: '조금 전 이 매장에서 카드로 샀어요. 카드 결제 내역은 보여 드릴 수 있어요.',
    consumption: '아직 먹지는 않았어요. 포장 상태가 걱정돼서 바로 가져왔어요.',
  },
};

// This one source supplies both the learner's briefing and Gemini's context.
// Transaction details are synthetic; these are not current store policies.
export function getScenarioFacts(id: ChatScenarioId): string[] {
  if (id === 'promotion') {
    const seed = createSeed(); const product = seed.products[0];
    return [
      `연습용 POS 조회 결과: ${product.name} 1개 ${money(product.price)}`,
      `행사 조건: ${promotionDescription(product, promotionFor(product.id, seed.promotions))}`,
      '위 조회 결과를 고객에게 설명해 주세요. 이 채팅에서는 실제 POS를 조작하지 않아요.',
    ];
  }
  if (id === 'complaint') return [
    '고객은 기다리는 동안 안내를 받지 못해 불편함을 표현하고 있어요.',
    '대기가 길어진 원인과 예상 대기 시간은 아직 확인되지 않았어요.',
    '불편을 인정한 뒤 어떤 도움을 원하는지 확인하고, 다음 안내를 약속해 주세요. 원인이나 시간을 지어낼 필요는 없어요.',
  ];
  return [
    '고객은 방금 산 상품의 포장에 이상이 있다고 말하며 영수증을 찾지 못하고 있어요.',
    '상품 종류, 포장의 이상 상태, 결제 수단·구매 내역은 아직 확인되지 않았어요.',
    '교환·환불 가능 여부와 보상 기준은 제공되지 않았어요. 필요한 사실을 확인한 뒤 경영주에게 확인할 내용을 안내해 주세요.',
  ];
}
