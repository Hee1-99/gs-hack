import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checklistProgressSchema, localDateKey, questionSchema, type ChecklistProgress, type QuestionLog } from '@/domain/types';

export type Membership = { user_id: string; store_id: string; role: 'owner' | 'crew'; display_name: string; store_name: string };
export type LearningRecord = { store_id: string; user_id: string; kind: 'quiz' | 'chat'; record_id: string; payload: unknown; updated_at: string; display_name?: string };
export type OwnerStaffActivity = { user_id: string; display_name: string; questions: QuestionLog[]; checklist_progress: ChecklistProgress[]; updated_at: string | null };
export function cloudError(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (code === '42P01' || code === 'PGRST202' || code === 'PGRST205') return '서버에 매장 데이터 구성이 아직 적용되지 않았어요. 운영자에게 연결 설정을 요청해 주세요.';
  if (code === '42501') return '이 매장의 변경 권한이 없어요. 로그인한 계정과 매장을 확인해 주세요.';
  if (code === '40001') return '다른 기기에서 변경한 내용이 있어요. 새로고침 후 다시 저장해 주세요.';
  return '서버에 연결하지 못했어요. 연결을 확인하고 다시 시도해 주세요.';
}
export async function getMembership(client: SupabaseClient): Promise<Membership | null> {
  const { data, error } = await client.rpc('gstep_my_membership');
  if (error) throw error;
  return data?.[0] ?? null;
}
export async function listLearningRecords(client: SupabaseClient, storeId: string, kind?: 'quiz' | 'chat'): Promise<LearningRecord[]> {
  let query = client.from('gstep_learning_records').select('*').eq('store_id', storeId).order('updated_at', { ascending: false }).limit(500);
  if (kind) query = query.eq('kind', kind);
  const [records, members] = await Promise.all([query, client.from('gstep_memberships').select('user_id,display_name').eq('store_id', storeId)]);
  if (records.error) throw records.error;
  if (members.error) throw members.error;
  const names = new Map<string, string>((members.data ?? []).map(member => [member.user_id, member.display_name]));
  return (records.data ?? []).map(record => ({ ...record, display_name: names.get(record.user_id) }));
}
export async function listOwnerStaffActivity(client: SupabaseClient, storeId: string): Promise<OwnerStaffActivity[]> {
  const [members, states] = await Promise.all([
    client.from('gstep_memberships').select('user_id,display_name,role').eq('store_id', storeId),
    client.from('gstep_staff_state').select('user_id,questions,checklist_progress,updated_at').eq('store_id', storeId),
  ]);
  if (members.error) throw members.error;
  if (states.error) throw states.error;
  const stateByUser = new Map<string, { questions?: unknown; checklist_progress?: unknown; updated_at?: unknown }>((states.data ?? []).map(state => [state.user_id, state]));
  return (members.data ?? []).filter(member => member.role === 'crew').map(member => {
    const state = stateByUser.get(member.user_id);
    const questions = z.array(questionSchema).safeParse(state?.questions);
    const progress = Array.isArray(state?.checklist_progress) ? state.checklist_progress.flatMap(item => {
      const normalized = item && typeof item === 'object' && !('date' in item) ? { ...item, date: localDateKey() } : item;
      const parsed = checklistProgressSchema.safeParse(normalized); return parsed.success ? [parsed.data] : [];
    }) : [];
    return { user_id: member.user_id, display_name: member.display_name, questions: questions.success ? questions.data : [], checklist_progress: progress, updated_at: typeof state?.updated_at === 'string' ? state.updated_at : null };
  });
}
const recordInput = z.object({ storeId: z.uuid(), userId: z.uuid(), kind: z.enum(['quiz', 'chat']), id: z.uuid(), payload: z.object({ id: z.uuid() }).passthrough() }).refine(value => value.id === value.payload.id, { message: 'record identity mismatch' });
export async function saveLearningRecord(client: SupabaseClient, input: { storeId: string; userId: string; kind: 'quiz' | 'chat'; id: string; payload: unknown }) {
  const safe = recordInput.parse(input);
  if (new TextEncoder().encode(JSON.stringify(safe.payload)).length > 200_000) throw new Error('record too large');
  const { error } = await client.from('gstep_learning_records').upsert({ store_id: safe.storeId, user_id: safe.userId, kind: safe.kind, record_id: safe.id, payload: safe.payload, updated_at: new Date().toISOString() }, { onConflict: 'store_id,user_id,kind,record_id' });
  if (error) throw error;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('gstep-cloud-records-updated'));
}
