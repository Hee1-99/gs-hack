'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth-provider';
import { cloudError, listLearningRecords, saveLearningRecord } from '@/lib/supabase/cloud';
import { validateTrainingAttempt } from '@/features/training/training-engine';
import { getTrainingSnapshot, mergeTrainingAttempts, setTrainingScope, useTrainingStore } from '@/features/training/training-store';

export function TrainingCloudSync() {
  const auth = useAuth();
  const training = useTrainingStore();
  const [loadedScope, setLoadedScope] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);
  const saved = useRef(new Map<string, string>());
  const queue = useRef<Promise<void>>(Promise.resolve());
  const scope = auth.user ? `${auth.membership?.store_id ?? 'unlinked'}:${auth.user.id}` : null;
  useEffect(() => {
    const current = ++generation.current;
    setLoadedScope(null); setError(''); saved.current.clear();
    if (!auth.ready || auth.error) { setTrainingScope('account-check'); return; }
    setTrainingScope(scope);
    if (!scope || !auth.membership || !auth.client || !auth.user) return;
    const userId = auth.user.id;
    void listLearningRecords(auth.client, auth.membership.store_id, 'quiz').then(records => {
      if (generation.current !== current) return;
      const own = records.filter(record => record.user_id === userId);
      own.forEach(record => { const parsed = validateTrainingAttempt(record.payload); if (parsed) saved.current.set(record.record_id, JSON.stringify(parsed)); });
      mergeTrainingAttempts(own.map(record => record.payload));
      setLoadedScope(scope);
    }).catch(cause => { if (generation.current === current) setError(cloudError(cause)); });
    return () => { generation.current++; };
  }, [scope, auth.ready, auth.error, auth.client, auth.membership, auth.user, retry]);
  useEffect(() => {
    if (!scope || loadedScope !== scope || !auth.client || !auth.membership || !auth.user) return;
    const current = generation.current;
    const client = auth.client; const storeId = auth.membership.store_id; const userId = auth.user.id;
    // Read the active scoped snapshot, never a hook render from the previous account.
    const attempts = getTrainingSnapshot().attempts;
    queue.current = queue.current.catch(() => {}).then(async () => {
      for (const attempt of attempts) {
        if (generation.current !== current) return;
        const signature = JSON.stringify(attempt);
        if (saved.current.get(attempt.id) === signature) continue;
        try {
          await saveLearningRecord(client, { storeId, userId, kind: 'quiz', id: attempt.id, payload: attempt });
          if (generation.current !== current) return;
          saved.current.set(attempt.id, signature); setError('');
        } catch (cause) { if (generation.current === current) setError(cloudError(cause)); return; }
      }
    });
  }, [training.attempts, loadedScope, scope, auth.client, auth.membership, auth.user]);
  return error ? <div className="persistence-notice" role="alert">연습 기록 동기화: {error} 이 기기의 기록은 유지돼요. <button className="button secondary" onClick={() => setRetry(value => value + 1)}>동기화 다시 시도</button></div> : null;
}
