'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { createLocalStoreRepository } from './local-store-repository';
import type { PersistenceStatus, StoreRepository } from './store-repository';
import type { StoreState } from '@/domain/types';

type StoreContextValue = { repo: StoreRepository; state: StoreState; persistence: PersistenceStatus };
const StoreContext = createContext<StoreContextValue | null>(null);
export function StoreProvider({ children, initialRepository }: { children: React.ReactNode; initialRepository?: StoreRepository }) {
  const [value, setValue] = useState<StoreContextValue | null>(() => initialRepository ? { repo: initialRepository, state: initialRepository.getSnapshot(), persistence: initialRepository.getPersistenceStatus() } : null);
  useEffect(() => {
    let repo = initialRepository;
    if (!repo) {
      let storage: Storage | null = null;
      try { storage = window.localStorage; } catch { /* blocked storage uses explicit memory mode */ }
      repo = createLocalStoreRepository(storage);
    }
    const activeRepo = repo;
    const update = () => setValue({ repo: activeRepo, state: activeRepo.getSnapshot(), persistence: activeRepo.getPersistenceStatus() });
    update();
    return activeRepo.subscribe(update);
  }, [initialRepository]);
  return <StoreContext.Provider value={value}>
    {value?.persistence === 'memory' && <div className="persistence-notice" role="alert">이 브라우저에 저장할 수 없어 임시로 사용 중이에요. 새로고침하면 변경 내용이 사라질 수 있어요. 저장 공간과 브라우저 설정을 확인해 주세요.</div>}
    {value?.persistence === 'recovered' && <div className="persistence-notice" role="status">저장된 데이터를 읽지 못해 가상 매장 기본값으로 복구했어요.</div>}
    {children}
  </StoreContext.Provider>;
}
export function useStore() { return useContext(StoreContext); }
export function StoreLoading() { return <p className="loading" role="status">이 브라우저의 매장 기록을 불러오고 있어요…</p>; }
