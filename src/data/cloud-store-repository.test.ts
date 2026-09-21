import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { expect, it, vi } from 'vitest';
import { createSeed } from '@/domain/seed';
import type { Membership } from '@/lib/supabase/cloud';
import { createCloudStoreRepository } from './cloud-store-repository';
const member:Membership={user_id:'00000000-0000-4000-8000-000000000001',store_id:'00000000-0000-4000-8000-000000000002',role:'owner',display_name:'연습자',store_name:'팀 매장'};
function backend(staffProgress: unknown[] = []){
 const seed=createSeed(); const result=vi.fn().mockResolvedValue({data:2,error:null});
 const rpc=vi.fn((...args:unknown[])=>({setHeader:()=>result(...args)}));
 const getSession=vi.fn().mockResolvedValue({data:{session:{user:{id:member.user_id},access_token:'synthetic-owner-token'}},error:null});
 const from=vi.fn((table:string)=>{const response={data:table==='gstep_store_content'?{rules:seed.rules,checklist_items:seed.checklistItems,version:1}:table==='gstep_staff_state'?{checklist_progress:staffProgress,questions:[],version:3}:null,error:null}; const query={select:()=>query,eq:()=>query,single:async()=>response,maybeSingle:async()=>response};return query;});
 return {client:{from,rpc,auth:{getSession}} as unknown as SupabaseClient,rpc,result,getSession};
}
it('uses only remote rules and own state, and denies crew configuration writes',async()=>{
 const {client,rpc}=backend();const repo=await createCloudStoreRepository(client,{...member,role:'crew'});
 expect(repo.getStore().name).toBe('팀 매장');expect(repo.getSnapshot().sessions).toEqual([]);expect(repo.getSnapshot().questions).toEqual([]);
 await expect(repo.createRule({title:'권한 테스트',content:'내용',category:'분류',exception:'예외'})).rejects.toThrow('경영주만');expect(rpc).not.toHaveBeenCalled();
});
it('loads and saves each checklist date through the existing staff-state RPC',async()=>{
 const yesterday='2026-09-20';
 const {client,rpc}=backend([{itemId:'stock',date:yesterday,status:'done',updatedAt:'2026-09-20T10:00:00.000Z'}]);
 const repo=await createCloudStoreRepository(client,{...member,role:'crew'});
 expect(repo.getSnapshot().checklistProgress).toContainEqual(expect.objectContaining({itemId:'stock',date:yesterday,status:'done'}));
 await repo.setChecklistStatus('expiry','needs_manager',yesterday);
 expect(rpc).toHaveBeenLastCalledWith('gstep_save_staff_state',expect.objectContaining({target_store:member.store_id,expected_version:3,next_progress:expect.arrayContaining([expect.objectContaining({itemId:'expiry',date:yesterday,status:'needs_manager'})])}));
});
it('promotes legacy cloud checklist progress to today when date is absent',async()=>{
 const {client}=backend([{itemId:'stock',status:'done',updatedAt:'2026-09-20T10:00:00.000Z'}]);
 const repo=await createCloudStoreRepository(client,{...member,role:'crew'});
 expect(repo.getSnapshot().checklistProgress).toEqual([
  expect.objectContaining({itemId:'stock',date:expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),status:'done'}),
 ]);
});
it('does not change displayed state when remote save fails and queues subsequent versioned saves',async()=>{
 const {client,rpc,result}=backend();const repo=await createCloudStoreRepository(client,member);const rule=repo.listRules()[0];
 result.mockResolvedValueOnce({data:null,error:{code:'40001'}});
 await expect(repo.updateRule(rule.id,{...rule,title:'실패 제목'})).rejects.toThrow('다른 기기');expect(repo.listRules()[0].title).toBe(rule.title);
 await repo.updateRule(rule.id,{...rule,title:'저장 제목'});expect(repo.listRules()[0].title).toBe('저장 제목');
 expect(rpc).toHaveBeenLastCalledWith('gstep_save_content',expect.objectContaining({target_store:member.store_id,expected_version:1}));
 await repo.updateRule(rule.id,{...rule,title:'다음 제목'});expect(rpc).toHaveBeenLastCalledWith('gstep_save_content',expect.objectContaining({expected_version:2}));
});

function identityBackend() {
 const seed=createSeed();
 let actor=member.user_id;
 const sent:string[]=[];
 const client=createClient('https://example.supabase.co','sb_publishable_synthetic_test',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:async(input,init)=>{
  const url=String(input);
  if(url.includes('/rpc/')){sent.push(new Headers(init?.headers).get('Authorization')??'');return new Response('2',{status:200,headers:{'Content-Type':'application/json'}});}
  return new Response(JSON.stringify(url.includes('gstep_store_content')?{rules:seed.rules,checklist_items:seed.checklistItems,version:1}:null),{status:200,headers:{'Content-Type':'application/json'}});
 }}});
 const getSession=vi.spyOn(client.auth,'getSession').mockImplementation(async()=>({data:{session:{user:{id:actor},access_token:`synthetic-${actor}`} as Session},error:null}));
 return {client,sent,getSession,setActor:(id:string)=>{actor=id;}};
}
it('rejects a detached account repository after the shared client changes accounts',async()=>{
 const backend=identityBackend();const repo=await createCloudStoreRepository(backend.client,member);
 backend.setActor('00000000-0000-4000-8000-000000000099');
 await expect(repo.setChecklistStatus(repo.listChecklistItems()[0].id,'done')).rejects.toThrow('계정');
 expect(backend.sent).toEqual([]);
});
it('pins the verified identity on the actual SDK request even if auth changes before fetch',async()=>{
 const backend=identityBackend();const repo=await createCloudStoreRepository(backend.client,member);
 backend.getSession.mockClear();
 backend.getSession.mockImplementationOnce(async()=>{
  backend.setActor('00000000-0000-4000-8000-000000000099');
  return {data:{session:{user:{id:member.user_id},access_token:'synthetic-captured-account-token'} as Session},error:null};
 });
 await repo.setChecklistStatus(repo.listChecklistItems()[0].id,'done');
 expect(backend.getSession).toHaveBeenCalledTimes(2);
 expect(backend.sent).toEqual(['Bearer synthetic-captured-account-token']);
});
it('checks identity again when each queued write begins',async()=>{
 const {client,rpc,result,getSession}=backend();const repo=await createCloudStoreRepository(client,member);
 let release!:(value:{data:number,error:null})=>void;
 result.mockImplementationOnce(()=>new Promise(resolve=>{release=resolve;}));
 const first=repo.setChecklistStatus(repo.listChecklistItems()[0].id,'done');
 const second=repo.setChecklistStatus(repo.listChecklistItems()[0].id,'pending');
 const rejected=expect(second).rejects.toThrow('계정');
 await vi.waitFor(()=>expect(result).toHaveBeenCalledTimes(1));
 getSession.mockResolvedValue({data:{session:{user:{id:'other-user'},access_token:'synthetic-other-token'}},error:null});
 release({data:2,error:null});
 await first;await rejected;expect(rpc).toHaveBeenCalledTimes(1);
});
