import { expect, it } from 'vitest';
import { createSeed } from '@/domain/seed';
import { completeSession, recordEvent, startSession } from '@/features/simulation/engine';
import { summarizeDashboard } from './dashboard-summary';
it('counts completed attempts, valid checklist progress and unresolved work separately', () => {
  const state = createSeed(); const at = new Date().toISOString();
  state.sessions = [completeSession(recordEvent(startSession(state.scenarios[0], state), { type: 'answer', intent: 'apply', total: 3000, text: '안내' })), startSession(state.scenarios[0], state)];
  state.checklistProgress = [{ itemId: 'stock', status: 'done', updatedAt: at }, { itemId: 'expiry', status: 'needs_manager', updatedAt: at }, { itemId: 'missing', status: 'done', updatedAt: at }];
  state.questions = [{ id: 'q1', question: '택배 문의', answer: '확인 필요', rules: [], status: 'unresolved', mode: 'demo', createdAt: at }, { id: 'q2', question: '행사 문의', answer: '등록 규칙', rules: [state.rules[0]], status: 'resolved', mode: 'demo', createdAt: at }];
  expect(summarizeDashboard(state)).toMatchObject({ completedTraining: 1, checklistDone: 1, checklistTotal: 4, questions: 2, needsManager: 2 });
});
it('has zero counts in the seed state and counts repeated records by stable ID once', () => {
  const state = createSeed();
  expect(summarizeDashboard(state)).toMatchObject({ completedTraining: 0, checklistDone: 0, questions: 0, needsManager: 0 });
  const session = completeSession(recordEvent(startSession(state.scenarios[0], state), { type: 'answer', intent: 'apply', total: 3000, text: '안내' }));
  state.sessions = [session, session];
  expect(summarizeDashboard(state).completedTraining).toBe(1);
});
