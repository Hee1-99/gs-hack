'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './auth-provider';
import { cloudError, listLearningRecords, type LearningRecord } from '@/lib/supabase/cloud';

export function useCloudTrainingRecords(kind?: 'quiz' | 'chat') {
  const auth = useAuth();
  const scope = auth.user && auth.membership ? `${auth.membership.store_id}:${auth.user.id}` : null;
  const [value, setValue] = useState<{ scope: string | null; records: LearningRecord[] }>({ scope: null, records: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    if (!auth.ready || auth.error || !auth.client || !auth.membership || !scope) { setLoading(false); return; }
    setLoading(true); setError('');
    try { const records = await listLearningRecords(auth.client, auth.membership.store_id, kind); if (current === generation.current) setValue({ scope, records }); }
    catch (cause) { if (current === generation.current) setError(cloudError(cause)); }
    finally { if (current === generation.current) setLoading(false); }
  }, [auth.ready, auth.error, auth.client, auth.membership, scope, kind]);
  useEffect(() => {
    void refresh();
    const update = () => { void refresh(); };
    window.addEventListener('gstep-cloud-records-updated', update); window.addEventListener('focus', update);
    return () => { generation.current++; window.removeEventListener('gstep-cloud-records-updated', update); window.removeEventListener('focus', update); };
  }, [refresh]);
  return { records: value.scope === scope && !auth.error ? value.records : [], loading, ready: auth.ready && !loading, error, refresh };
}
