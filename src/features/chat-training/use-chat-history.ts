'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { cloudError, listLearningRecords, saveLearningRecord } from '@/lib/supabase/cloud';
import { CHAT_STORAGE_KEY, CHAT_UPDATED_EVENT, chatAttemptSchema, parseChatHistory, type ChatAttempt } from './types';

export function useChatHistory() {
  const auth = useAuth();
  const scope = !auth.ready ? 'loading' : auth.user ? `${auth.membership?.store_id ?? 'unassigned'}:${auth.user.id}` : 'guest';
  const key = scope === 'guest' ? CHAT_STORAGE_KEY : `${CHAT_STORAGE_KEY}:${scope}`;
  const currentScope = useRef(scope); currentScope.current = scope;
  const records = useRef<ChatAttempt[]>([]);
  const [history, setHistory] = useState<ChatAttempt[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    records.current = []; setHistory([]); setReady(false); setError('');
    if (scope === 'loading') return;
    async function load() {
      let local: ChatAttempt[] = [];
      try { local = parseChatHistory(localStorage.getItem(key)); } catch { setError('이 브라우저에 기록을 저장할 수 없어요. 현재 화면에서 연습할 수 있지만 새로고침하면 사라질 수 있어요.'); }
      if (auth.client && auth.user && auth.membership) {
        try {
          const remote = (await listLearningRecords(auth.client, auth.membership.store_id, 'chat')).filter(record => record.user_id === auth.user!.id).flatMap(record => { const parsed = chatAttemptSchema.safeParse(record.payload); return parsed.success ? [parsed.data] : []; });
          const byId = new Map(local.map(record => [record.id, record]));
          remote.forEach(record => { if (!byId.has(record.id) || byId.get(record.id)!.updatedAt < record.updatedAt) byId.set(record.id, record); });
          local = [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 100);
        } catch (cause) { if (!cancelled) setError(`${cloudError(cause)} 현재 계정의 이 브라우저 기록을 표시해요.`); }
      }
      if (cancelled || currentScope.current !== scope) return;
      records.current = local; setHistory(local); setReady(true);
    }
    void load();
    return () => { cancelled = true; };
  }, [scope, key, auth.client, auth.user, auth.membership]);
  async function save(attempt: ChatAttempt) {
    if (!ready || currentScope.current !== scope) return false;
    const safe = chatAttemptSchema.parse(attempt);
    const next = [safe, ...records.current.filter(record => record.id !== safe.id)].slice(0, 100);
    records.current = next; setHistory(next); setError('');
    let localSaved = true;
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { localSaved = false; setError('브라우저 저장에 실패했어요. 이 화면을 나가기 전에 결과를 확인해 주세요.'); }
    if (auth.client && auth.user && auth.membership) {
      try { await saveLearningRecord(auth.client, { storeId: auth.membership.store_id, userId: auth.user.id, kind: 'chat', id: safe.id, payload: safe }); }
      catch (cause) { if (currentScope.current === scope) setError(`${cloudError(cause)} ${localSaved ? '응대 기록은 이 브라우저에 남아 있어요.' : '현재 화면에만 기록이 남아 있어요. 저장을 다시 시도해 주세요.'}`); }
    }
    window.dispatchEvent(new CustomEvent(CHAT_UPDATED_EVENT));
    return currentScope.current === scope;
  }
  return { history, ready, error, save, scope, cloudConnected: Boolean(auth.user && auth.membership), signedIn: Boolean(auth.user) };
}
