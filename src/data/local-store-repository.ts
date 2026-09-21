import { createSeed } from '@/domain/seed';
import { checklistItemInputSchema, checklistStatusSchema, questionSchema, ruleInputSchema, sessionSchema, stateSchema } from '@/domain/types';
import type { StoreState } from '@/domain/types';
import type { PersistenceStatus, StoreRepository } from './store-repository';

export const STORAGE_KEY = 'firstday.zip';
type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>;
const clone = <T,>(value: T): T => structuredClone(value);

export function createLocalStoreRepository(storage: StorageAdapter | null): StoreRepository {
  let state = createSeed();
  let persistence: PersistenceStatus = 'saved';
  let resetGeneration = 0;
  const listeners = new Set<() => void>();
  function persist(next: StoreState, recovered = false) {
    state = stateSchema.parse(next);
    try {
      if (!storage) throw new Error('No storage');
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      persistence = recovered ? 'recovered' : 'saved';
    } catch { persistence = 'memory'; }
    listeners.forEach(listener => listener());
    return { persisted: persistence !== 'memory' };
  }
  try {
    if (!storage) throw new Error('No storage');
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) persist(state);
    else {
      try { state = stateSchema.parse(JSON.parse(raw)); }
      catch { persist(createSeed(), true); }
    }
  } catch { persistence = 'memory'; }
  const mutate = (change: (draft: StoreState) => void) => {
    const draft = clone(state); change(draft); return persist(draft);
  };
  return {
    getSnapshot: () => clone(state),
    getPersistenceStatus: () => persistence,
    getResetGeneration: () => resetGeneration,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getStore: () => clone(state.store),
    listProducts: () => clone(state.products),
    listRules: () => clone(state.rules),
    updateRule: (id, input) => mutate(draft => {
      const rule = draft.rules.find(rule => rule.id === id);
      if (!rule) throw new Error('규칙을 찾지 못했어요. 화면을 새로고침해 주세요.');
      Object.assign(rule, ruleInputSchema.parse(input), { version: rule.version + 1, updatedAt: new Date().toISOString() });
    }),
    createRule: input => mutate(draft => {
      draft.rules.push({ ...ruleInputSchema.parse(input), id: crypto.randomUUID(), version: 1, updatedAt: new Date().toISOString(), topic: 'general', requirePosLookup: false, requireManagerOnException: true });
    }),
    listChecklistItems: () => clone(state.checklistItems),
    saveChecklistItem: (input, id) => mutate(draft => {
      const parsed = checklistItemInputSchema.parse(input);
      if (id) {
        const existing = draft.checklistItems.find(item => item.id === id);
        if (!existing) throw new Error('항목을 찾지 못했어요.');
        Object.assign(existing, parsed);
      } else draft.checklistItems.push({ ...parsed, id: crypto.randomUUID() });
    }),
    setChecklistStatus: (itemId, status) => mutate(draft => {
      if (!draft.checklistItems.some(item => item.id === itemId)) throw new Error('항목을 찾지 못했어요.');
      const progress = { itemId, status: checklistStatusSchema.parse(status), updatedAt: new Date().toISOString() };
      const index = draft.checklistProgress.findIndex(item => item.itemId === itemId);
      if (index < 0) draft.checklistProgress.push(progress); else draft.checklistProgress[index] = progress;
    }),
    saveQuestion: question => mutate(draft => {
      if (!draft.questions.some(existing => existing.id === question.id)) draft.questions.push(questionSchema.parse(question));
    }),
    saveSession: session => mutate(draft => {
      const parsed = sessionSchema.parse(session);
      const index = draft.sessions.findIndex(existing => existing.id === session.id);
      if (index < 0) draft.sessions.push(parsed); else draft.sessions[index] = parsed;
    }),
    resetToSeed: () => { resetGeneration++; return persist(createSeed()); },
  };
}
