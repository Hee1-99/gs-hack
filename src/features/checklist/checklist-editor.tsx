'use client';
import { useState } from 'react';
import { useStore, StoreLoading } from '@/data/store-provider';
import { checklistItemInputSchema, type ChecklistItem } from '@/domain/types';
import type { StoreRepository } from '@/data/store-repository';
function ItemForm({ item, repo, onCreated }: { item?: ChecklistItem; repo: StoreRepository; onCreated?: () => void }) {
  const [message, setMessage] = useState(''); const prefix = item?.id ?? 'new-item';
  return <form className="panel item-form" aria-label={item?.title ?? '새 업무 항목'} onSubmit={event => { event.preventDefault(); const parsed = checklistItemInputSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget))); if (!parsed.success) { setMessage('모든 항목을 공백 없이 입력해 주세요.'); return; } try { const result = repo.saveChecklistItem(parsed.data, item?.id); setMessage(result.persisted ? '업무 항목을 저장했어요.' : '브라우저에 저장하지 못했어요. 임시로만 적용돼요.'); if (!item && result.persisted) onCreated?.(); } catch { setMessage('저장하지 못했어요. 입력을 확인하고 다시 시도해 주세요.'); } }}><h2>{item?.title ?? '새 업무 항목'}</h2><div className="two-fields"><label htmlFor={`${prefix}-title`}>업무 이름<input id={`${prefix}-title`} name="title" defaultValue={item?.title} required maxLength={100}/></label><label htmlFor={`${prefix}-category`}>분류<input id={`${prefix}-category`} name="category" defaultValue={item?.category} required maxLength={50}/></label></div><label htmlFor={`${prefix}-description`}>업무 설명<textarea id={`${prefix}-description`} name="description" defaultValue={item?.description} required maxLength={2000} rows={2}/></label><div className="form-actions"><button className="button" type="submit">{item ? '항목 저장' : '항목 등록'}</button><span className="save-message" role="status">{message}</span></div></form>;
}
export function ChecklistEditor() {
  const store = useStore(); const [creating, setCreating] = useState(false);
  if (!store) return <StoreLoading/>;
  return <><div className="page-heading heading-with-action"><div><p className="eyebrow">SMALL TASKS, CLEAR GUIDANCE</p><h1>업무 관리</h1><p>스토어 매니저가 확인할 일을 구체적으로 적어 주세요.</p></div><button className="button secondary" aria-expanded={creating} onClick={() => setCreating(value => !value)}>{creating ? '작성 닫기' : '업무 항목 추가'}</button></div><div className="inline-note"><p>이름과 설명을 바꿔도 기존 업무의 진행 상태는 유지돼요.</p></div><div className="form-list">{creating && <ItemForm repo={store.repo} onCreated={() => setCreating(false)}/>}{store.state.checklistItems.map(item => <ItemForm key={item.id} item={item} repo={store.repo}/>)}</div></>;
}
