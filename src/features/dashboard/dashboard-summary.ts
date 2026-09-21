import type { StoreState } from '@/domain/types';
export function summarizeDashboard(state: StoreState) {
  const sessions = [...new Map(state.sessions.map(item => [item.id, item])).values()];
  const questions = [...new Map(state.questions.map(item => [item.id, item])).values()];
  const progress = new Map(state.checklistProgress.map(item => [item.itemId, item.status]));
  const needsItems = state.checklistItems.filter(item => progress.get(item.id) === 'needs_manager');
  const unresolved = questions.filter(question => question.status === 'unresolved');
  return { completedTraining: sessions.filter(session => session.status === 'completed').length, checklistDone: state.checklistItems.filter(item => progress.get(item.id) === 'done').length, checklistTotal: state.checklistItems.length, questions: questions.length, needsManager: needsItems.length + unresolved.length, unresolved, needsItems, sessions };
}
