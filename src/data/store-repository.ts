import type { ChecklistItem, ChecklistItemInput, ChecklistStatus, Product, QuestionLog, RuleInput, SimulationSession, Store, StoreRule, StoreState } from '@/domain/types';
export type PersistenceStatus = 'saved' | 'recovered' | 'memory';
export type SaveResult = { persisted: boolean };
export interface StoreRepository {
  getSnapshot(): StoreState;
  getPersistenceStatus(): PersistenceStatus;
  getResetGeneration(): number;
  subscribe(listener: () => void): () => void;
  getStore(): Store;
  listProducts(): Product[];
  listRules(): StoreRule[];
  updateRule(id: string, input: RuleInput): SaveResult;
  createRule(input: RuleInput): SaveResult;
  listChecklistItems(): ChecklistItem[];
  saveChecklistItem(input: ChecklistItemInput, id?: string): SaveResult;
  setChecklistStatus(itemId: string, status: ChecklistStatus): SaveResult;
  saveQuestion(question: QuestionLog): SaveResult;
  saveSession(session: SimulationSession): SaveResult;
  resetToSeed(): SaveResult;
}
