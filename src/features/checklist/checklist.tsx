'use client';
import { useState } from 'react';
import { useStore, StoreLoading } from '@/data/store-provider';
import { checklistStatusSchema } from '@/domain/types';
import { summarizeDashboard } from '@/features/dashboard/dashboard-summary';
import { ResetData } from '@/components/reset-data';
export function Checklist() {
  const store = useStore();
  const [message, setMessage] = useState('');
  if (!store) return <StoreLoading/>;
  const { repo, state } = store;
  const summary = summarizeDashboard(state);
  return <><div className="page-heading"><p className="eyebrow">ONE THING AT A TIME</p><h1>오늘의 체크리스트</h1><p>마친 일은 표시하고, 도움이 필요한 일은 남겨 주세요.</p></div><div className="checklist-progress"><span><strong>{summary.checklistDone}</strong> / {summary.checklistTotal}개 완료</span><progress value={summary.checklistDone} max={Math.max(1, summary.checklistTotal)} aria-label="업무 완료 현황"/></div><p role="status" className="save-message">{message}</p>
    <div className="checklist-items">{state.checklistItems.map((item, index) => { const status = state.checklistProgress.find(progress => progress.itemId === item.id)?.status ?? 'pending'; return <article key={item.id} className={`checklist-row status-${status}`}><span className="item-number">{String(index + 1).padStart(2, '0')}</span><div className="checklist-copy"><span className="small-note">{item.category}</span><h2>{item.title}</h2><p>{item.description}</p></div><label className="status-control" htmlFor={`status-${item.id}`}><span className="sr-only">{item.title} 상태</span><select id={`status-${item.id}`} value={status} onChange={event => { const result = repo.setChecklistStatus(item.id, checklistStatusSchema.parse(event.target.value)); setMessage(result.persisted ? '업무 상태를 저장했어요.' : '브라우저에 저장하지 못했어요. 현재 화면에서만 임시로 적용돼요.'); }}><option value="pending">대기</option><option value="done">완료</option><option value="needs_manager">경영주 확인 필요</option></select></label></article>; })}</div>{!state.checklistItems.length && <div className="empty-state"><h2>등록된 업무가 없어요</h2><p>경영주 모드의 업무 관리에서 추가해 주세요.</p></div>}<ResetData/>
  </>;
}
