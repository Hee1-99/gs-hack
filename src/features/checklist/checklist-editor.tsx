'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronDown, ListChecks, Plus } from 'lucide-react';
import { useStore, StoreLoading } from '@/data/store-provider';
import { checklistItemInputSchema, type ChecklistItem } from '@/domain/types';
import type { StoreRepository } from '@/data/store-repository';
import styles from './checklist-editor.module.css';

function ItemForm({ item, repo, onCreated }: { item?: ChecklistItem; repo: StoreRepository; onCreated?: () => void }) {
  const [message, setMessage] = useState('');
  const prefix = item?.id ?? 'new-item';
  return <form className={styles.form} aria-label={item ? `${item.title} 수정` : '새 체크리스트 항목'} onSubmit={event => {
    event.preventDefault();
    const parsed = checklistItemInputSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) { setMessage('항목 이름, 분류, 확인할 내용을 입력해 주세요.'); return; }
    try {
      const result = repo.saveChecklistItem(parsed.data, item?.id);
      setMessage(result.persisted ? '체크리스트에 저장했어요.' : '현재 화면에 적용했어요. 브라우저에 저장하지 못해 새로고침하면 사라질 수 있어요.');
      if (!item && result.persisted) onCreated?.();
    } catch { setMessage('저장하지 못했어요. 입력을 확인하고 다시 시도해 주세요.'); }
  }}>
    <div className="two-fields">
      <label htmlFor={`${prefix}-title`}>항목 이름<input id={`${prefix}-title`} name="title" defaultValue={item?.title} required maxLength={100} placeholder="예: 냉장 진열대 소비기한 확인" /></label>
      <label htmlFor={`${prefix}-category`}>분류<input id={`${prefix}-category`} name="category" defaultValue={item?.category} required maxLength={50} placeholder="예: 상품 관리" /></label>
    </div>
    <label htmlFor={`${prefix}-description`}>확인할 내용<textarea id={`${prefix}-description`} name="description" defaultValue={item?.description} required maxLength={2000} rows={2} placeholder="어디에서 무엇을 확인하는지 적어 주세요." /></label>
    <div className="form-actions"><button className="button" type="submit"><Check size={16} aria-hidden />{item ? '항목 저장' : '항목 등록'}</button><span className="save-message" role="status">{message}</span></div>
  </form>;
}

export function ChecklistEditor() {
  const store = useStore();
  const [creating, setCreating] = useState(false);
  const [createdMessage, setCreatedMessage] = useState('');
  if (!store) return <StoreLoading />;
  return <>
    <div className="page-heading heading-with-action"><div><p className="eyebrow">경영주 · 설정</p><h1>체크리스트 설정</h1><p>스토어 매니저가 근무 중 확인할 항목을 정해 주세요.</p></div><button className="button" aria-expanded={creating} aria-controls="new-checklist-item" onClick={() => { setCreating(value => !value); setCreatedMessage(''); }}><Plus size={18} aria-hidden />{creating ? '작성 닫기' : '체크리스트 항목 추가'}</button></div>
    <div className={styles.toolbar}><span><ListChecks size={18} aria-hidden />등록된 항목 <strong>{store.state.checklistItems.length}개</strong></span><Link className="text-link" href="/crew/checklist">스토어 매니저 화면 보기</Link></div>
    <p role="status" className="save-message">{createdMessage}</p>
    {creating && <section className={`panel ${styles.newItem}`} id="new-checklist-item" aria-labelledby="new-item-heading"><h2 id="new-item-heading">새 체크리스트 항목</h2><ItemForm repo={store.repo} onCreated={() => { setCreating(false); setCreatedMessage('새 항목을 체크리스트에 등록했어요.'); }} /></section>}
    <div className={styles.items}>{store.state.checklistItems.map((item, index) => <details className={styles.item} key={item.id}>
      <summary><span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><span className={styles.copy}><span className="small-note">{item.category}</span><strong>{item.title}</strong><span className={styles.description}>{item.description}</span></span><span className={styles.edit}>수정<ChevronDown size={16} aria-hidden /></span></summary>
      <ItemForm item={item} repo={store.repo} />
    </details>)}</div>
    <p className={styles.note}>항목을 수정해도 스토어 매니저가 표시한 완료 상태는 유지돼요.</p>
  </>;
}
