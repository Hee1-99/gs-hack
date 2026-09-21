import { expect, it } from 'vitest';
import { createSeed } from '@/domain/seed';
import { completeSession, recordEvent, startSession } from './engine';
it('keeps the existing snapshot while a new session receives edited rules', () => {
  const seed = createSeed();
  const first = startSession(seed.scenarios[0], seed);
  const old = first.snapshot.rules[0].content;
  seed.rules[0].content = '새 지침'; seed.rules[0].version = 2;
  const second = startSession(seed.scenarios[0], seed, first.id);
  expect(first.snapshot.rules[0]).toMatchObject({ content: old, version: 1 });
  expect(second.snapshot.rules[0]).toMatchObject({ content: '새 지침', version: 2 });
  expect(second.id).not.toBe(first.id);
  expect(second.previousAttemptId).toBe(first.id);
});
it('keeps transitions immutable and refuses events after completion', () => {
  const seed = createSeed();
  const first = startSession(seed.scenarios[0], seed);
  const answered = recordEvent(first, { type: 'answer', intent: 'apply', total: 3000, text: '안내' });
  expect(first.events).toHaveLength(1);
  expect(answered.events).toHaveLength(2);
  const completed = completeSession(answered);
  expect(completed.status).toBe('completed');
  expect(recordEvent(completed, { type: 'pos_lookup', productId: 'coffee-a' })).toEqual(completed);
});
it('deduplicates event IDs and repeated completion without losing a lookup', () => {
  const seed = createSeed();
  let session = startSession(seed.scenarios[0], seed);
  session = recordEvent(session, { type: 'pos_lookup', productId: 'coffee-a', id: 'lookup-once' });
  session = recordEvent(session, { type: 'pos_lookup', productId: 'coffee-a', id: 'lookup-once' });
  session = completeSession(recordEvent(session, { type: 'answer', text: '내용은 채점하지 않음', intent: 'apply', total: 3000 }));
  expect(completeSession(session)).toEqual(session);
  expect(session.events.filter(event => event.type === 'pos_lookup')).toHaveLength(1);
  expect(session.results?.procedureFollowed).toBe(true);
});
