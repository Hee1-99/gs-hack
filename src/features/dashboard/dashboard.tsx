'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, ClipboardCheck, ListChecks, SlidersHorizontal, X, Award, MessageSquareText, UserRound } from 'lucide-react';
import { useTrainingStore } from '@/features/training/training-store';
import { getAttemptSteps, validateTrainingAttempt } from '@/features/training/training-engine';
import { useAuth } from '@/features/auth/auth-provider';
import { useCloudTrainingRecords } from '@/features/auth/use-cloud-training-records';
import { chatAttemptSchema } from '@/features/chat-training/types';
import { ChatRecords, useGuestChatRecords } from './chat-records';
import { summarizeTraining } from './training-summary';
import { useStore } from '@/data/store-provider';
import { useOwnerStaffActivity } from './use-owner-staff-activity';
import type { OwnerStaffActivity } from '@/lib/supabase/cloud';
import { localDateKey } from '@/domain/types';
import styles from './dashboard.module.css';

type Filter = 'all' | 'practice' | 'test';
export function Dashboard() {
  const training = useTrainingStore();
  const auth = useAuth();
  const cloud = useCloudTrainingRecords();
  const store = useStore();
  const staffCloud = useOwnerStaffActivity();
  const guestChats = useGuestChatRecords(!auth.user);
  const [filter, setFilter] = useState<Filter>('all');
  const [checklistDate,setChecklistDate]=useState(localDateKey);
  if (!training.ready || !auth.ready || (auth.user && cloud.loading && !cloud.records.length)) return <p className="loading" role="status">연습 기록을 불러오고 있어요…</p>;
  const attempts = auth.user ? cloud.records.filter(record => record.kind === 'quiz').flatMap(record => {
    const attempt = validateTrainingAttempt(record.payload);
    return attempt ? [{ ...attempt, id: `${record.user_id}:${attempt.id}`, candidateName: record.display_name ? `${record.display_name}${attempt.mode === 'test' ? ` · ${attempt.candidateName}` : ''}` : attempt.candidateName }] : [];
  }) : training.attempts;
  const chats = auth.user ? cloud.records.filter(record => record.kind === 'chat').flatMap(record => {
    const parsed = chatAttemptSchema.safeParse(record.payload);
    return parsed.success ? [{ ...parsed.data, id: `${record.user_id}:${parsed.data.id}`, displayName: record.display_name }] : [];
  }) : guestChats;
  const summary = summarizeTraining(attempts);
  const records = summary.recent.filter(attempt => filter === 'all' || attempt.mode === filter);
  const localStaff:OwnerStaffActivity[] = store ? [{ user_id: 'guest', display_name: '체험 스토어 매니저', questions: store.state.questions, checklist_progress: store.state.checklistProgress, updated_at: null }] : [];
  const staffActivity = auth.user ? staffCloud.records : localStaff;
  const checklistTotal = store?.state.checklistItems.length ?? 0;
  return <>
    <div className="page-heading heading-with-action"><div><p className="eyebrow">경영주</p><h1>매장 교육 현황</h1><p>소속 스토어 매니저의 연습, 질문, 체크리스트 완료 여부를 확인해요.</p></div><Link className="button secondary" href="/login"><UserRound size={18} aria-hidden />내 계정</Link></div>
    <div className={styles.ownerActions}><Link href="/manager/questions"><MessageSquareText size={19} aria-hidden/><span><strong>질문 내역</strong><small>스토어 매니저가 물어본 내용</small></span><ArrowRight size={17} aria-hidden/></Link><Link href="/manager/checklist"><ListChecks size={19} aria-hidden/><span><strong>체크리스트 만들기</strong><small>매장 업무 항목 설정</small></span><ArrowRight size={17} aria-hidden/></Link></div>
    {auth.user && <div className={styles.cloudStatus}><span>{auth.membership?.store_name} · 연결된 매장의 기록</span><button className="button secondary" disabled={cloud.loading||staffCloud.loading} onClick={() => void Promise.all([cloud.refresh(),staffCloud.refresh()])}>{cloud.loading||staffCloud.loading ? '불러오는 중…' : '기록 새로고침'}</button></div>}
    {cloud.error && <p role="alert" className="error-message">{cloud.error} 기록 새로고침으로 다시 불러올 수 있어요.</p>}
    {training.persistence === 'memory' && <p className="persistence-notice" role="alert">연습 기록을 임시로 보관하고 있어요. 새로고침하면 기록이 사라질 수 있어요.</p>}
    {training.persistence === 'recovered' && <p className="persistence-notice" role="status">저장된 연습 기록을 읽지 못해 빈 기록으로 복구했어요.</p>}
    <dl className={styles.stats}>
      <div><dt><ClipboardCheck aria-hidden />완료한 연습·테스트</dt><dd data-testid="training-count">{summary.completed}<span>회</span></dd></div>
      <div><dt><Award aria-hidden />평균 점수</dt><dd data-testid="training-average">{summary.averageScore ?? '—'}<span>{summary.averageScore === null ? '완료 후 표시' : '/ 100'}</span></dd></div>
      <div><dt><ListChecks aria-hidden />완료한 구인 테스트</dt><dd>{summary.tests}<span>회</span></dd></div>
      <div><dt><MessageSquareText aria-hidden />AI 대화 연습</dt><dd>{chats.filter(record=>record.status==='completed').length}<span>회</span></dd></div>
    </dl>
    <section className={styles.checklistOverview} aria-labelledby="checklist-overview-title"><div className={styles.recordsHeading}><div><h2 id="checklist-overview-title">체크리스트 완료 현황</h2><p>날짜별 완료 여부를 현재 체크리스트 기준으로 확인해요.</p></div><div className={styles.checklistDate}><label htmlFor="owner-checklist-date">확인 날짜</label><input id="owner-checklist-date" type="date" value={checklistDate} max={localDateKey()} onChange={event=>setChecklistDate(event.target.value)}/><Link href="/manager/checklist" className="text-link">항목 설정</Link></div></div>
      {staffCloud.error&&<p role="alert" className="error-message">{staffCloud.error}</p>}
      {staffCloud.loading&&!staffActivity.length?<p className="loading" role="status">완료 현황을 불러오고 있어요…</p>:!staffActivity.length?<div className={styles.inlineEmpty}>아직 연결된 스토어 매니저가 없어요.</div>:<div className={styles.staffChecklist}>{staffActivity.map(member=>{const latest=new Map(member.checklist_progress.filter(item=>item.date===checklistDate).map(item=>[item.itemId,item.status]));const done=store?.state.checklistItems.filter(item=>latest.get(item.id)==='done').length??0;const needs=store?.state.checklistItems.filter(item=>latest.get(item.id)==='needs_manager').length??0;return <article key={member.user_id}><div><span className={styles.avatar} aria-hidden>{member.display_name.slice(0,1)}</span><span><strong>{member.display_name}</strong><small>{needs?`경영주 확인 ${needs}개`:'확인 요청 없음'}</small></span></div><div><strong>{done} / {checklistTotal}</strong><span>완료</span></div><progress aria-label={`${member.display_name} ${checklistDate} 체크리스트 완료율`} max={Math.max(checklistTotal,1)} value={done}/></article>;})}</div>}
    </section>
    <section aria-labelledby="records-heading">
      <div className={styles.recordsHeading}><h2 id="records-heading">최근 기록</h2><div className={styles.filters} role="group" aria-label="기록 유형">{([{ value: 'all', label: '전체' }, { value: 'practice', label: '연습' }, { value: 'test', label: '구인 테스트' }] as const).map(option => <button key={option.value} aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>{option.label}</button>)}</div></div>
      {!records.length ? <div className={styles.empty}><ClipboardCheck size={36} aria-hidden /><h3>{filter === 'all' ? '아직 연습 기록이 없어요' : `${filter === 'test' ? '구인 테스트' : '연습'} 기록이 없어요`}</h3><p>스토어 매니저가 시뮬레이터를 진행하면 단계별 결과가 여기에 저장돼요.</p><Link href="/crew/simulation" className="button">시뮬레이터 열기<ArrowRight size={16} aria-hidden /></Link></div> : <div className={styles.records}>{records.map(attempt => <details key={attempt.id} className={styles.record}>
        <summary><span className={styles.avatar} aria-hidden>{attempt.candidateName.slice(0, 1)}</span><span className={styles.recordIdentity}><strong>{attempt.candidateName}</strong><span>{attempt.mode === 'test' ? '구인 테스트' : '연습'} · <time dateTime={attempt.startedAt}>{new Date(attempt.startedAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></span></span><span className={styles.score}>{attempt.status === 'completed' ? <><strong>{attempt.score}</strong><span>점</span></> : <span className={styles.inProgress}>진행 중<br />{attempt.answers.length} / {getAttemptSteps(attempt).length}단계</span>}</span><ChevronDown size={18} aria-hidden /></summary>
        <div className={styles.resultBody}><p className={styles.resultLabel}>{attempt.status === 'completed' ? `${attempt.answers.filter(answer => answer.correct).length}개 기준 충족 · ${getAttemptSteps(attempt).length}개 단계 완료` : `${attempt.answers.length}개 단계 응답 · 완료 후 점수가 표시돼요`}</p>
          {attempt.courseVersion === 2 && attempt.status === 'completed' && <p className={styles.scoreBreakdown}>정확도 {attempt.accuracyScore} / 90 · 응답 시간 {attempt.timeScore} / 10 · 총 {Math.round((attempt.totalElapsedMs ?? 0) / 1000)}초</p>}
          {attempt.courseVersion === 1 && <p className="small-note">이전 12단계 기록 · 당시의 점수 기준을 유지해요.</p>}
          {!attempt.answers.length ? <p className="small-note">아직 제출한 답변이 없어요.</p> : <ol className={styles.steps}>{attempt.answers.map(answer => {
            const step = getAttemptSteps(attempt).find(item => item.id === answer.stepId);
            return <li key={answer.stepId}><span className={answer.correct ? styles.correct : styles.incorrect}>{answer.correct ? <Check size={15} aria-hidden /> : <X size={15} aria-hidden />}<span className="sr-only">{answer.correct ? '정답' : '오답'}</span></span><div><strong>{step?.title ?? answer.stepId}</strong><p>{answer.answerText ?? step?.choices.find(choice => choice.id === answer.choiceId)?.label ?? '선택한 답변'}</p>{answer.feedback && <p className={styles.aiFeedback}>{answer.gradingMode === 'gemini' ? 'AI 피드백' : '데모 피드백'} · {answer.feedback}</p>}{answer.elapsedMs !== undefined && <span className={styles.answerTime}>{Math.round(answer.elapsedMs / 1000)}초 · 정확도 {answer.accuracyPoints}점{answer.gradingMode === 'gemini' ? ' · AI 채점' : ''}</span>}{step && <a href={step.source.url} target="_blank" rel="noreferrer">교육 근거 · {step.source.title}</a>}</div></li>;
          })}</ol>}
        </div>
      </details>)}</div>}
      <p className={styles.note}>{auth.user ? '소속 매장에서 공유하는 교육 기록이에요.' : '체험 모드 · 이 브라우저에 저장된 기록이에요.'} 점수는 교육 내용의 이해도를 확인하는 참고 자료이며, 채용 적합성을 자동 판정하지 않아요.</p>
    </section>
    <ChatRecords records={chats}/>
    <Link href="/manager/manual" className={styles.settings}><SlidersHorizontal size={18} aria-hidden /><span><strong>매장 추가 규칙</strong><span>우리 매장에만 필요한 안내를 덧붙여요.</span></span><ArrowRight size={18} aria-hidden /></Link>
  </>;
}
