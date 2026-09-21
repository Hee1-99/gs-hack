import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalStoreRepository, STORAGE_KEY } from './local-store-repository';
import { createSeed } from '@/domain/seed';
import { startSession } from '@/features/simulation/engine';

describe('local store repository', () => {
  beforeEach(() => localStorage.clear());
  it.each(['{"schemaVersion":1}', JSON.stringify({ ...createSeed(), schemaVersion: 99 }), '{bad'])('recovers corrupt state without touching unrelated keys', raw => {
    localStorage.setItem(STORAGE_KEY, raw); localStorage.setItem('other-app', 'untouched');
    const repo = createLocalStoreRepository(localStorage);
    expect(repo.getPersistenceStatus()).toBe('recovered');
    expect(repo.getSnapshot().sessions).toEqual([]);
    expect(localStorage.getItem('other-app')).toBe('untouched');
    expect(createLocalStoreRepository(localStorage).getPersistenceStatus()).toBe('saved');
  });
  it('keeps usable in-memory state on denied reads and quota writes, then recovers on a later write', () => {
    let quota = true;
    const storage = { getItem() { throw new DOMException('Denied', 'SecurityError'); }, setItem() { if (quota) throw new DOMException('Full', 'QuotaExceededError'); } };
    const repo = createLocalStoreRepository(storage);
    expect(repo.getPersistenceStatus()).toBe('memory');
    expect(repo.setChecklistStatus('stock', 'done')).toEqual({ persisted: false });
    expect(repo.getSnapshot().checklistProgress[0].status).toBe('done');
    quota = false;
    expect(repo.setChecklistStatus('stock', 'needs_manager')).toEqual({ persisted: true });
    expect(repo.getPersistenceStatus()).toBe('saved');
  });
  it('preserves all saved entity types across refresh and resets their history together', () => {
    const repo = createLocalStoreRepository(localStorage); const seed = repo.getSnapshot();
    repo.saveSession(startSession(seed.scenarios[0], seed));
    repo.saveChecklistItem({ title: '새 업무', category: '합성', description: '점검하기' });
    repo.saveQuestion({ id: 'q', question: '택배?', answer: '확인 필요', rules: [], status: 'unresolved', mode: 'demo', createdAt: new Date().toISOString() });
    repo.updateRule(seed.rules[0].id, { ...seed.rules[0], content: '수정된 규칙' });
    expect(createLocalStoreRepository(localStorage).getSnapshot()).toEqual(repo.getSnapshot());
    repo.resetToSeed(); const reset = createLocalStoreRepository(localStorage).getSnapshot();
    expect(reset.sessions).toEqual([]); expect(reset.questions).toEqual([]); expect(reset.checklistItems).toHaveLength(4); expect(reset.rules[0].version).toBe(1);
  });
  it.each([null, '{broken'])('recovers empty or malformed storage: %s', (raw) => {
    if (raw) localStorage.setItem('firstday.zip', raw);
    const repo = createLocalStoreRepository(localStorage);
    expect(repo.getStore().name).toBe('GS25 첫날점');
    expect(repo.listProducts()).toHaveLength(3);
    expect(repo.listProducts()[0]).toMatchObject({ name: '캔커피 A', price: 1500 });
  });
  it('increments rule versions and persists changes across repository instances', () => {
    const repo = createLocalStoreRepository(localStorage);
    const rule = repo.listRules()[0];
    repo.updateRule(rule.id, { ...rule, content: '새로 저장한 합성 매장 규칙' });
    const saved = createLocalStoreRepository(localStorage).listRules()[0];
    expect(saved.version).toBe(2);
    expect(saved.content).toBe('새로 저장한 합성 매장 규칙');
    expect(saved.updatedAt).not.toBe(rule.updatedAt);
    expect(rule.version).toBe(1);
  });
  it('persists checklist progress and question history, resets only its own key', () => {
    localStorage.setItem('unrelated', 'keep');
    const repo = createLocalStoreRepository(localStorage);
    repo.setChecklistStatus(repo.listChecklistItems()[0].id, 'done');
    repo.saveQuestion({ id: 'question-1', question: '없는 규칙은?', answer: '경영주 확인 필요', rules: [], status: 'unresolved', mode: 'demo', createdAt: new Date().toISOString() });
    const refreshed = createLocalStoreRepository(localStorage);
    expect(refreshed.getSnapshot().checklistProgress[0].status).toBe('done');
    expect(refreshed.getSnapshot().questions).toHaveLength(1);
    refreshed.resetToSeed();
    expect(refreshed.getSnapshot().questions).toEqual([]);
    expect(refreshed.getSnapshot().checklistProgress).toEqual([]);
    expect(refreshed.listRules()[0].version).toBe(1);
    expect(localStorage.getItem('unrelated')).toBe('keep');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).schemaVersion).toBe(1);
  });
  it('returns detached entities so callers cannot silently change stored facts', () => {
    const repo = createLocalStoreRepository(localStorage);
    repo.listProducts()[0].price = 1;
    repo.getSnapshot().rules[0].content = 'tampered';
    expect(repo.listProducts()[0].price).toBe(1500);
    expect(repo.listRules()[0].content).not.toBe('tampered');
  });
  it('recovers a shape-valid session with missing snapshot facts instead of crashing feedback', () => {
    const seed = createSeed();
    const session = startSession(seed.scenarios[0], seed);
    session.snapshot.products = [];
    seed.sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    const repo = createLocalStoreRepository(localStorage);
    expect(repo.getPersistenceStatus()).toBe('recovered');
    expect(repo.getSnapshot().sessions).toEqual([]);
  });
});
