import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { listOwnerStaffActivity, saveLearningRecord } from './cloud';
const storeId='00000000-0000-4000-8000-000000000001', userId='00000000-0000-4000-8000-000000000002', id='00000000-0000-4000-8000-000000000003';
it('rejects absent or mismatched record identity before making any request', async () => {
  const from=vi.fn(); const client={from} as unknown as SupabaseClient;
  await expect(saveLearningRecord(client,{storeId,userId,kind:'quiz',id,payload:{score:100}})).rejects.toThrow();
  await expect(saveLearningRecord(client,{storeId,userId,kind:'quiz',id,payload:{id:userId}})).rejects.toThrow();
  expect(from).not.toHaveBeenCalled();
});

it('lists every crew member with validated question and checklist activity', async () => {
  const at='2026-09-22T00:00:00.000Z';
  const members=[{user_id:userId,display_name:'민지',role:'crew'},{user_id:'owner',display_name:'점주',role:'owner'},{user_id:'idle',display_name:'신입',role:'crew'}];
  const states=[{user_id:userId,questions:[{id:'q1',question:'택배는 어떻게 받아요?',answer:'확인이 필요해요.',rules:[],status:'unresolved',mode:'demo',createdAt:at}],checklist_progress:[{itemId:'stock',date:'2026-09-22',status:'done',updatedAt:at}],updated_at:at}];
  const from=vi.fn((table:string)=>({select:()=>({eq:async()=>({data:table==='gstep_memberships'?members:states,error:null})})}));
  const activity=await listOwnerStaffActivity({from} as unknown as SupabaseClient,storeId);
  expect(activity).toHaveLength(2);
  expect(activity[0]).toMatchObject({user_id:userId,display_name:'민지',questions:[{question:'택배는 어떻게 받아요?'}],checklist_progress:[{itemId:'stock',date:'2026-09-22',status:'done'}]});
  expect(activity[1]).toMatchObject({user_id:'idle',display_name:'신입',questions:[],checklist_progress:[]});
});
