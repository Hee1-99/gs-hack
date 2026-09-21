import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { saveLearningRecord } from './cloud';
const storeId='00000000-0000-4000-8000-000000000001', userId='00000000-0000-4000-8000-000000000002', id='00000000-0000-4000-8000-000000000003';
it('rejects absent or mismatched record identity before making any request', async () => {
  const from=vi.fn(); const client={from} as unknown as SupabaseClient;
  await expect(saveLearningRecord(client,{storeId,userId,kind:'quiz',id,payload:{score:100}})).rejects.toThrow();
  await expect(saveLearningRecord(client,{storeId,userId,kind:'quiz',id,payload:{id:userId}})).rejects.toThrow();
  expect(from).not.toHaveBeenCalled();
});
