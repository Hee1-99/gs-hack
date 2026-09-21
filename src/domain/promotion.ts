import type { Product, Promotion } from './types';
export const money = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;
export function promotionFor(productId: string, promotions: Promotion[]) { return promotions.find(promo => promo.productIds.includes(productId)); }
export function totalFor(product: Product, quantity: number, promotion?: Promotion) {
  if (!promotion) return product.price * quantity;
  const group = promotion.buyQuantity + promotion.freeQuantity;
  return (Math.floor(quantity / group) * promotion.buyQuantity + quantity % group) * product.price;
}
export function promotionDescription(product: Product, promotion?: Promotion) {
  if (!promotion) return '등록된 행사 없음';
  const quantity = promotion.buyQuantity + promotion.freeQuantity;
  return `${promotion.buyQuantity}+${promotion.freeQuantity} · ${quantity}개 ${money(totalFor(product, quantity, promotion))} · ${promotion.allowMix ? '등록 상품 혼합 가능' : '동일 상품만 적용'}`;
}
