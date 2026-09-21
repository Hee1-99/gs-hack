import type { ChecklistItem, ChecklistItemInput, ChecklistStatus, Product, QuestionLog, RuleInput, SimulationSession, Store, StoreRule, StoreState } from '@/domain/types';
export type PersistenceStatus = 'saved' | 'recovered' | 'memory';
export type SaveResult = { persisted: boolean };
export type RepositorySave = SaveResult | Promise<SaveResult>;
export interface StoreRepository {
  getSnapshot(): StoreState;
  getPersistenceStatus(): PersistenceStatus;
  getResetGeneration(): number;
  subscribe(listener: () => void): () => void;
  getStore(): Store;
  listProducts(): Product[];
  listRules(): StoreRule[];
  isCloud?: boolean;
  getLastError?(): string;
  updateRule(id: string, input: RuleInput): RepositorySave;
  createRule(input: RuleInput): RepositorySave;
  listChecklistItems(): ChecklistItem[];
  saveChecklistItem(input: ChecklistItemInput, id?: string): RepositorySave;
  setChecklistStatus(itemId: string, status: ChecklistStatus): RepositorySave;
  saveQuestion(question: QuestionLog): RepositorySave;
  saveSession(session: SimulationSession): RepositorySave;
  resetToSeed(): RepositorySave;
}
