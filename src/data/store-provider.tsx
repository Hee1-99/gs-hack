'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createLocalStoreRepository } from './local-store-repository';
import { createCloudStoreRepository } from './cloud-store-repository';
import { useAuth } from '@/features/auth/auth-provider';
import { cloudError } from '@/lib/supabase/cloud';
import type { PersistenceStatus, StoreRepository } from './store-repository';
import type { StoreState } from '@/domain/types';

type StoreContextValue = { repo: StoreRepository; state: StoreState; persistence: PersistenceStatus };
const StoreContext = createContext<StoreContextValue | null>(null);
export function StoreProvider({ children, initialRepository }: { children: React.ReactNode; initialRepository?: StoreRepository }) {
  const auth=useAuth();
  const browserRepository = useRef<StoreRepository | null>(null);
  const scope=initialRepository?'injected':auth.user?`${auth.user.id}:${auth.membership?.store_id??'unlinked'}`:'guest';
  const [value, setValue] = useState<(StoreContextValue & {scope:string}) | null>(() => initialRepository ? { repo: initialRepository, state: initialRepository.getSnapshot(), persistence: initialRepository.getPersistenceStatus(),scope:'injected' } : null);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  useEffect(() => {
    let disposed=false;let unsubscribe:(()=>void)|undefined;setError('');
    if(!initialRepository&&(!auth.ready||auth.error))return;
    function connect(repo:StoreRepository){if(disposed)return;const update=()=>setValue({repo,state:repo.getSnapshot(),persistence:repo.getPersistenceStatus(),scope});update();unsubscribe=repo.subscribe(update);}
    if(initialRepository)connect(initialRepository);
    else if(auth.user){
      if(auth.membership&&auth.client)void createCloudStoreRepository(auth.client,auth.membership).then(connect).catch(cause=>{if(!disposed)setError(cloudError(cause));});
    }else{
      if(!browserRepository.current){let storage:Storage|null=null;try{storage=window.localStorage;}catch{}browserRepository.current=createLocalStoreRepository(storage);}
      connect(browserRepository.current);
    }
    return ()=>{disposed=true;unsubscribe?.();};
  },[initialRepository,auth.ready,auth.user,auth.membership,auth.client,auth.error,scope,retry]);
  const visible=value?.scope===scope&&(initialRepository||(auth.ready&&!auth.error))?value:null;
  const saveError=visible?.repo.getLastError?.();
  return <StoreContext.Provider value={visible}>
    {error&&<div className="persistence-notice" role="alert">{error}<button className="button secondary" onClick={()=>setRetry(v=>v+1)}>다시 연결하기</button></div>}
    {saveError&&<div className="persistence-notice" role="alert">{saveError}</div>}
    {visible?.persistence === 'memory' && <div className="persistence-notice" role="alert">이 브라우저에 저장할 수 없어 임시로 사용 중이에요. 새로고침하면 변경 내용이 사라질 수 있어요. 저장 공간과 브라우저 설정을 확인해 주세요.</div>}
    {visible?.persistence === 'recovered' && <div className="persistence-notice" role="status">저장된 데이터를 읽지 못해 가상 매장 기본값으로 복구했어요.</div>}
    {children}
  </StoreContext.Provider>;
}
export function useStore() { return useContext(StoreContext); }
export function StoreLoading() { return <p className="loading" role="status">매장 기록을 불러오고 있어요…</p>; }
