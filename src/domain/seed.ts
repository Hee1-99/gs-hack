import type { StoreState } from './types';

// Entirely synthetic. Public education-map categories informed organization only.
export function createSeed(): StoreState {
  return {
    schemaVersion: 1,
    store: { id: 'firstday', name: 'GS25 첫날점', synthetic: true },
    rules: [
      { id: 'promotion-response', title: '행사 문의는 POS 확인 후 안내', category: '고객 응대 · POS', content: '행사 문의를 받으면 해당 상품을 가상 POS에서 조회하고, 표시된 행사 조건과 수량을 확인한 뒤 안내합니다.', exception: '서로 다른 상품을 섞거나 조건이 불분명하면 확정 안내하지 않고 경영주 확인을 요청합니다.', topic: 'promotion', requirePosLookup: true, requireManagerOnException: true, version: 1, updatedAt: '2026-09-21T00:00:00.000Z' },
      { id: 'inventory-check', title: '입고 상품과 소비기한 확인', category: '상품·소비기한', content: '입고 상품의 수량과 포장 상태를 확인하고, 소비기한과 가격표를 점검합니다.', exception: '이상하거나 판단하기 어려운 상품은 별도로 표시하고 경영주에게 확인합니다.', topic: 'inventory', requirePosLookup: false, requireManagerOnException: true, version: 1, updatedAt: '2026-09-21T00:00:00.000Z' },
    ],
    products: [
      { id: 'coffee-a', name: '캔커피 A', price: 1500, inventory: 12 },
      { id: 'tea-b', name: '보리차 B', price: 1800, inventory: 8 },
      { id: 'milk-c', name: '우유 C', price: 2200, inventory: 6 },
    ],
    promotions: [{ id: 'coffee-two-plus-one', productIds: ['coffee-a'], buyQuantity: 2, freeQuantity: 1, allowMix: false }],
    scenarios: [
      { id: 'promotion-basic', title: '같은 상품의 행사 문의', productId: 'coffee-a', quantity: 3, kind: 'single', ruleIds: ['promotion-response'], customerQuestion: '이 캔커피 세 개를 사면 행사 적용되나요? 얼마인가요?' },
      { id: 'promotion-mixed', title: '다른 상품을 섞어 사는 문의', productId: 'coffee-a', quantity: 3, kind: 'mixed', ruleIds: ['promotion-response'], customerQuestion: '캔커피와 다른 음료를 섞어서 세 개 사도 같은 행사인가요?' },
    ],
    checklistItems: [
      { id: 'stock', title: '입고 상품 확인', category: '상품·소비기한', description: '합성 입고 목록과 상품 수량, 포장 상태를 확인해요.' },
      { id: 'expiry', title: '소비기한 확인', category: '상품·소비기한', description: '가상 진열 상품의 소비기한 표시를 살펴봐요.' },
      { id: 'display', title: '진열·가격표 확인', category: '상품·소비기한', description: '상품과 가격표가 맞는지 확인해요.' },
      { id: 'hygiene', title: '시설·위생 확인', category: '안전·시설', description: '주변을 살펴보고 도움이 필요한 사항을 표시해요.' },
    ],
    checklistProgress: [], sessions: [], questions: [],
  };
}
