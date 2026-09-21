import type { SimulationSession, VerifiedResults } from '@/domain/types';
import { promotionFor, totalFor } from '@/domain/promotion';

export function validateSession(session: SimulationSession): VerifiedResults {
  const { scenario, snapshot, events } = session;
  const product = snapshot.products.find(product => product.id === scenario.productId);
  if (!product) throw new Error('연습 상품을 찾을 수 없어요.');
  const promotion = promotionFor(product.id, snapshot.promotions);
  const rules = snapshot.rules.filter(rule => scenario.ruleIds.includes(rule.id));
  const exception = scenario.kind === 'mixed' && !promotion?.allowMix;
  const needsManager = exception && rules.some(rule => rule.requireManagerOnException);
  const expectedIntent = needsManager ? 'check_manager' : promotion && !exception ? 'apply' : 'not_apply';
  const expectedTotal = needsManager ? null : totalFor(product, scenario.quantity, exception ? undefined : promotion);
  let promotionLookupPerformed = false;
  let definitiveBeforeLookup = false;
  let managerConfirmationRequested = false;
  let managerConfirmedBeforeAnswer = false;
  for (const event of events) {
    if (event.type === 'pos_lookup' && event.productId === product.id) promotionLookupPerformed = true;
    if (event.type === 'answer' && event.intent !== 'check_manager' && !promotionLookupPerformed) definitiveBeforeLookup = true;
    if (event.type === 'manager_confirmation') managerConfirmationRequested = true;
    if (event.type === 'answer') managerConfirmedBeforeAnswer = managerConfirmationRequested;
  }
  const answer = events.findLast(event => event.type === 'answer');
  const finalAnswerCorrect = !!answer && answer.intent === expectedIntent && (expectedTotal === null || answer.total === expectedTotal);
  const requiresLookup = rules.some(rule => rule.requirePosLookup);
  return {
    promotionLookupPerformed, definitiveBeforeLookup, managerConfirmationRequested, finalAnswerCorrect, expectedTotal, expectedIntent,
    procedureFollowed: finalAnswerCorrect && (!requiresLookup || (promotionLookupPerformed && !definitiveBeforeLookup)) && (!needsManager || managerConfirmedBeforeAnswer),
  };
}
