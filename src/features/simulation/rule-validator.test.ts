import { describe, expect, it } from 'vitest';
import { createSeed } from '@/domain/seed';
import { recordEvent, startSession } from './engine';
import { validateSession } from './rule-validator';
const seed = createSeed();
const snapshot = { rules: seed.rules, products: seed.products, promotions: seed.promotions };
describe('deterministic procedure validation', () => {
  it.each([
    ['answer', ['answer'], false, true, false],
    ['lookup then answer', ['lookup', 'answer'], true, false, true],
    ['late lookup', ['answer', 'lookup'], true, true, false],
    ['late lookup then correction', ['answer', 'lookup', 'answer'], true, true, false],
    ['wrong product', ['wrong', 'answer'], false, true, false],
    ['confirmation without lookup', ['manager', 'answer'], false, true, false],
  ] as const)('%s has deterministic outcomes', (_name, actions, lookup, early, followed) => {
    let session = startSession(seed.scenarios[0], snapshot);
    for (const action of actions) {
      const input = action === 'answer' ? { type: 'answer' as const, text: '금액과 무관한 자유 문장', intent: 'apply' as const, total: 3000 } : action === 'manager' ? { type: 'manager_confirmation' as const } : { type: 'pos_lookup' as const, productId: action === 'wrong' ? 'tea-b' : 'coffee-a' };
      session = recordEvent(session, input);
    }
    expect(validateSession(session)).toMatchObject({ promotionLookupPerformed: lookup, definitiveBeforeLookup: early, finalAnswerCorrect: true, procedureFollowed: followed });
  });
  it('requires confirmation before the final exception answer, not afterward', () => {
    let session = startSession(seed.scenarios[1], snapshot);
    session = recordEvent(session, { type: 'pos_lookup', productId: 'coffee-a' });
    session = recordEvent(session, { type: 'answer', text: '확인할게요', intent: 'check_manager', total: null });
    session = recordEvent(session, { type: 'manager_confirmation' });
    expect(validateSession(session).procedureFollowed).toBe(false);
  });
  it('does not treat a lucky answer as a verified procedure', () => {
    const session = recordEvent(startSession(seed.scenarios[0], snapshot), { type: 'answer', text: '행사가 적용돼요.', intent: 'apply', total: 3000 });
    expect(validateSession(session)).toMatchObject({ finalAnswerCorrect: true, promotionLookupPerformed: false, definitiveBeforeLookup: true, procedureFollowed: false });
  });
  it('accepts a correct answer after looking up the relevant product', () => {
    let session = startSession(seed.scenarios[0], snapshot);
    session = recordEvent(session, { type: 'pos_lookup', productId: 'coffee-a' });
    session = recordEvent(session, { type: 'answer', text: '확인한 행사 안내', intent: 'apply', total: 3000 });
    expect(validateSession(session)).toMatchObject({ finalAnswerCorrect: true, promotionLookupPerformed: true, definitiveBeforeLookup: false, procedureFollowed: true, expectedTotal: 3000 });
  });
  it('requires manager confirmation for the mixed-product exception', () => {
    let session = startSession(seed.scenarios[1], snapshot);
    session = recordEvent(session, { type: 'pos_lookup', productId: 'coffee-a' });
    session = recordEvent(session, { type: 'manager_confirmation' });
    session = recordEvent(session, { type: 'answer', text: '경영주에게 확인할게요.', intent: 'check_manager', total: null });
    expect(validateSession(session)).toMatchObject({ expectedIntent: 'check_manager', managerConfirmationRequested: true, procedureFollowed: true });
  });
});
