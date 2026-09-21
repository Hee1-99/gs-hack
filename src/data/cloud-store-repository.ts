import type { SupabaseClient } from '@supabase/supabase-js';
import { createSeed } from '@/domain/seed';
import { stateSchema, type StoreState } from '@/domain/types';
import { cloudError, type Membership } from '@/lib/supabase/cloud';
import { createLocalStoreRepository } from './local-store-repository';
import type { StoreRepository, SaveResult } from './store-repository';

export async function createCloudStoreRepository(client: SupabaseClient, membership: Membership): Promise<StoreRepository> {
  const [content, staff] = await Promise.all([
    client.from('gstep_store_content').select('*').eq('store_id', membership.store_id).single(),
    client.from('gstep_staff_state').select('*').eq('store_id', membership.store_id).eq('user_id', membership.user_id).maybeSingle(),
  ]);
  if (content.error) throw content.error;
  if (staff.error) throw staff.error;
  let contentVersion = content.data.version;
  let staffVersion = staff.data?.version ?? 0;
  const seed = createSeed();
  let state: StoreState = stateSchema.parse({ ...seed, store: { ...seed.store, id: membership.store_id, name: membership.store_name }, rules: content.data.rules, checklistItems: content.data.checklist_items, checklistProgress: staff.data?.checklist_progress ?? [], questions: staff.data?.questions ?? [], sessions: [] });
  const listeners = new Set<() => void>();
  let lastError = '';
  let queue: Promise<unknown> = Promise.resolve();
  function save(kind: 'content' | 'staff', change: (draft: StoreRepository) => unknown): Promise<SaveResult> {
    const run = async () => {
      if (kind === 'content' && membership.role !== 'owner') { lastError = '매장 규칙과 체크리스트 설정은 경영주만 변경할 수 있어요.'; listeners.forEach(fn => fn()); throw new Error(lastError); }
      const draft = createLocalStoreRepository({ getItem: () => JSON.stringify(state), setItem: () => {} });
      await change(draft);
      const next = draft.getSnapshot();
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      if (sessionError || !session?.access_token || session.user.id !== membership.user_id) {
        lastError = '로그인 계정이 변경되어 이전 계정의 저장을 중단했어요. 현재 계정에서 다시 시도해 주세요.';
        listeners.forEach(fn => fn()); throw new Error(lastError);
      }
      // Pin this request's identity. The shared client's session can change after
      // the check above; Supabase preserves an explicitly supplied Authorization.
      const request = kind === 'content'
        ? client.rpc('gstep_save_content', { target_store: membership.store_id, expected_version: contentVersion, next_rules: next.rules, next_checklist: next.checklistItems })
        : client.rpc('gstep_save_staff_state', { target_store: membership.store_id, expected_version: staffVersion, next_progress: next.checklistProgress, next_questions: next.questions.slice(-500) });
      const response = await request.setHeader('Authorization', `Bearer ${session.access_token}`);
      if (response.error) { lastError = cloudError(response.error); listeners.forEach(fn => fn()); throw new Error(lastError); }
      if (kind === 'content') contentVersion = response.data; else staffVersion = response.data;
      state = next; lastError = ''; listeners.forEach(fn => fn());
      return { persisted: true };
    };
    const pending = queue.then(run, run); queue = pending; return pending;
  }
  return {
    isCloud: true, getLastError: () => lastError,
    getSnapshot: () => structuredClone(state), getPersistenceStatus: () => 'saved', getResetGeneration: () => 0,
    subscribe: fn => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    getStore: () => structuredClone(state.store), listProducts: () => structuredClone(state.products), listRules: () => structuredClone(state.rules), listChecklistItems: () => structuredClone(state.checklistItems),
    updateRule: (id,input) => save('content', draft => draft.updateRule(id,input)), createRule: input => save('content', draft => draft.createRule(input)),
    saveChecklistItem: (input,id) => save('content', draft => draft.saveChecklistItem(input,id)), setChecklistStatus: (id,status) => save('staff', draft => draft.setChecklistStatus(id,status)),
    saveQuestion: input => save('staff', draft => draft.saveQuestion(input)),
    saveSession: async () => { throw new Error('이전 연습 방식은 계정에 저장할 수 없어요. 새 시뮬레이터를 사용해 주세요.'); },
    resetToSeed: async () => { throw new Error('공유 매장 데이터는 데모 초기화로 삭제할 수 없어요.'); },
  };
}
