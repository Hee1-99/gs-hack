'use client';
import { CircleHelp, MessagesSquare } from 'lucide-react';
import { useStore, StoreLoading } from '@/data/store-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { useOwnerStaffActivity } from './use-owner-staff-activity';
import type { OwnerStaffActivity } from '@/lib/supabase/cloud';
import styles from './dashboard.module.css';

export function OwnerQuestions(){
  const auth=useAuth();
  const store=useStore();
  const cloud=useOwnerStaffActivity();
  if(!store)return <StoreLoading/>;
  const local:OwnerStaffActivity={user_id:'guest',display_name:'체험 스토어 매니저',questions:store.state.questions,checklist_progress:store.state.checklistProgress,updated_at:null};
  const staff=auth.user?cloud.records:[local];
  const questions=staff.flatMap(member=>member.questions.map(question=>({question,member}))).sort((a,b)=>b.question.createdAt.localeCompare(a.question.createdAt));
  return <>
    <div className="page-heading"><p className="eyebrow">경영주</p><h1>스토어 매니저 질문 내역</h1><p>소속 스토어 매니저가 매장 Q&amp;A에서 무엇을 물었는지 확인해요.</p></div>
    {cloud.error&&<p role="alert" className="error-message">{cloud.error}</p>}
    <div className={styles.recordsHeading}><h2>최근 질문</h2><span className="small-note">{questions.length}개</span></div>
    {cloud.loading&&!questions.length?<p className="loading" role="status">질문 내역을 불러오고 있어요…</p>:!questions.length?<div className={styles.empty}><MessagesSquare size={36} aria-hidden/><h3>아직 질문 내역이 없어요</h3><p>스토어 매니저가 매장 Q&amp;A를 이용하면 질문과 답변이 여기에 표시돼요.</p></div>:<div className={styles.questionRecords}>{questions.map(({question,member})=><article key={`${member.user_id}:${question.id}`} className={styles.questionRecord}><div><span className={styles.avatar} aria-hidden><CircleHelp size={20}/></span><div><strong>{member.display_name}</strong><time dateTime={question.createdAt}>{new Date(question.createdAt).toLocaleString('ko-KR')}</time></div><span className={`pill ${question.status==='unresolved'?'warning-pill':''}`}>{question.status==='unresolved'?'경영주 확인 필요':question.answerKind==='general'?'일반 안내':'매뉴얼 근거 있음'}</span></div><h2>{question.question}</h2><p>{question.answer}</p>{question.sources?.length?<details><summary>답변 근거 {question.sources.length}개</summary>{question.sources.map(source=><p key={source.id}>{source.title} · {source.excerpt}</p>)}</details>:null}</article>)}</div>}
    <p className={styles.note}>질문 내역은 소속 매장의 경영주에게만 표시돼요. 답변의 매장별 적용 여부는 경영주가 확인해 주세요.</p>
  </>;
}
