'use client';
import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useStore, StoreLoading } from '@/data/store-provider';
import { ruleInputSchema, type StoreRule } from '@/domain/types';
import type { StoreRepository } from '@/data/store-repository';

function RuleForm({ rule, repo, onCreated }: { rule?: StoreRule; repo: StoreRepository; onCreated?: () => void }) {
  const [message, setMessage] = useState('');
  const prefix = rule?.id ?? 'new';
  return <form className="rule-form panel" aria-label={rule?.title ?? '새 규칙 작성'} onSubmit={event => {
    event.preventDefault();
    const parsed = ruleInputSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) { setMessage('모든 항목을 공백 없이 입력해 주세요. 제목과 분류는 짧게 작성해 주세요.'); return; }
    try {
      const result = rule ? repo.updateRule(rule.id, parsed.data) : repo.createRule(parsed.data);
      setMessage(result.persisted ? '저장했어요. 새로운 질문과 연습부터 적용돼요.' : '브라우저에 저장하지 못했어요. 현재 화면에서만 임시로 적용돼요.');
      if (!rule && result.persisted) onCreated?.();
    } catch { setMessage('저장하지 못했어요. 입력 내용을 확인한 뒤 다시 시도해 주세요.'); }
  }}>
    <div className="form-heading"><h2>{rule?.title ?? '새 규칙 작성'}</h2>{rule && <span className="pill">v{rule.version}</span>}</div>
    {rule && <p className="small-note">수정 시각 <time dateTime={rule.updatedAt}>{new Date(rule.updatedAt).toLocaleString('ko-KR')}</time></p>}
    <div className="two-fields"><label htmlFor={`${prefix}-title`}>규칙 제목<input id={`${prefix}-title`} name="title" defaultValue={rule?.title} required maxLength={100}/></label><label htmlFor={`${prefix}-category`}>분류<input id={`${prefix}-category`} name="category" defaultValue={rule?.category} required maxLength={50}/></label></div>
    <label htmlFor={`${prefix}-content`}>규칙 내용<textarea id={`${prefix}-content`} name="content" defaultValue={rule?.content} required maxLength={2000} rows={3}/></label>
    <label htmlFor={`${prefix}-exception`}>예외 처리<textarea id={`${prefix}-exception`} name="exception" defaultValue={rule?.exception} required maxLength={2000} rows={2}/></label>
    <div className="form-actions"><button className="button" type="submit">{rule ? '규칙 저장' : '규칙 등록'}</button><span role="status" className="save-message">{message}</span></div>
  </form>;
}
export function ManualEditor() {
  const store = useStore();
  const [creating, setCreating] = useState(false);
  if (!store) return <StoreLoading />;
  return <><div className="page-heading heading-with-action"><div><p className="eyebrow">OUR STORE MANUAL</p><h1>우리 매장 매뉴얼</h1><p>{store.state.store.name} · 직접 작성하는 합성 매장 규칙</p></div><button className="button secondary" onClick={() => setCreating(value => !value)} aria-expanded={creating}><Plus size={17} aria-hidden/>{creating ? '작성 닫기' : '새 규칙 추가'}</button></div>
    <div className="inline-note"><BookOpen size={19} aria-hidden/><p>저장한 규칙은 새로운 질문과 연습에 적용돼요. 진행 중인 연습과 과거 기록은 바뀌지 않아요.</p></div>
    {creating && <RuleForm repo={store.repo} onCreated={() => setCreating(false)} />}
    <div className="form-list">{store.state.rules.map(rule => <RuleForm key={rule.id} rule={rule} repo={store.repo}/>)}</div>
  </>;
}
