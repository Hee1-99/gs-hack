import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createTrainingAttempt } from '@/features/training/training-engine';
import { getTrainingSnapshot, setTrainingScope, useTrainingStore } from '@/features/training/training-store';
import { listLearningRecords, saveLearningRecord } from '@/lib/supabase/cloud';
import { useAuth } from './auth-provider';
import { TrainingCloudSync } from './training-cloud-sync';
vi.mock('./auth-provider',()=>({useAuth:vi.fn()}));
vi.mock('@/lib/supabase/cloud',async original=>({...await original<typeof import('@/lib/supabase/cloud')>(),listLearningRecords:vi.fn(),saveLearningRecord:vi.fn()}));
const userId='00000000-0000-4000-8000-000000000001',storeId='00000000-0000-4000-8000-000000000002';
const guest={configured:false,ready:true,user:null,membership:null,client:null,error:'',refreshMembership:vi.fn(),signOut:vi.fn()};
const account={...guest,configured:true,client:{} as SupabaseClient,user:{id:userId} as User,membership:{store_id:storeId,user_id:userId,role:'crew' as const,display_name:'직원',store_name:'매장'}};
function Start(){const store=useTrainingStore();return <button onClick={()=>store.start('practice','계정 연습')}>start own</button>;}
beforeEach(()=>{localStorage.clear();setTrainingScope('test-reset');setTrainingScope(null);vi.mocked(useAuth).mockReturnValue(guest);vi.mocked(listLearningRecords).mockResolvedValue([]);vi.mocked(saveLearningRecord).mockResolvedValue(undefined);vi.clearAllMocks();});
it('never uploads guest attempts after signing in and uploads new attempts only to the current account',async()=>{
 const attempt=createTrainingAttempt('practice','guest history');localStorage.setItem('firstday-training-v1',JSON.stringify({version:1,attempts:[attempt]}));
 const view=render(<><TrainingCloudSync/><Start/></>);
 act(()=>{window.dispatchEvent(new StorageEvent('storage',{key:'firstday-training-v1'}));});expect(getTrainingSnapshot().attempts).toHaveLength(1);
 vi.mocked(useAuth).mockReturnValue(account);view.rerender(<><TrainingCloudSync/><Start/></>);
 await waitFor(()=>expect(listLearningRecords).toHaveBeenCalled());await waitFor(()=>expect(getTrainingSnapshot().attempts).toHaveLength(0));
 expect(saveLearningRecord).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'start own'}));
 await waitFor(()=>expect(saveLearningRecord).toHaveBeenCalledWith(account.client,expect.objectContaining({storeId,userId,payload:expect.objectContaining({candidateName:'계정 연습'})})));
 expect(JSON.parse(localStorage.getItem('firstday-training-v1')!).attempts[0].id).toBe(attempt.id);
});
it('merges only own records even when an owner query returns linked staff records',async()=>{
 const mine=createTrainingAttempt('practice','mine'),staff=createTrainingAttempt('practice','staff');vi.mocked(useAuth).mockReturnValue(account);
 vi.mocked(listLearningRecords).mockResolvedValue([{store_id:storeId,user_id:userId,kind:'quiz',record_id:mine.id,payload:mine,updated_at:mine.startedAt},{store_id:storeId,user_id:'other',kind:'quiz',record_id:staff.id,payload:staff,updated_at:staff.startedAt}]);
 render(<TrainingCloudSync/>);await waitFor(()=>expect(getTrainingSnapshot().attempts.map(item=>item.id)).toEqual([mine.id]));expect(saveLearningRecord).not.toHaveBeenCalled();
});
