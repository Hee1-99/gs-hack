'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, ClipboardCheck, ListChecks, SlidersHorizontal, X, Award, Clock3 } from 'lucide-react';
import { useTrainingStore } from '@/features/training/training-store';
import { trainingSteps } from '@/features/training/training-data';
import { summarizeTraining } from './training-summary';
import styles from './dashboard.module.css';

type Filter = 'all' | 'practice' | 'test';
export function Dashboard() {
  const training = useTrainingStore();
  const [filter, setFilter] = useState<Filter>('all');
  if (!training.ready) return <p className="loading" role="status">연습 기록을 불러오고 있어요…</p>;
  const summary = summarizeTraining(training.attempts);
  const records = summary.recent.filter(attempt => filter === 'all' || attempt.mode === filter);
  return <>
    <div className="page-heading heading-with-action"><div><p className="eyebrow">경영주</p><h1>연습 기록과 점수</h1><p>스토어 매니저가 어떤 단계를 연습했는지 확인해요.</p></div><Link className="button secondary" href="/manager/checklist"><ListChecks size={18} aria-hidden />체크리스트 설정</Link></div>
    {training.persistence === 'memory' && <p className="persistence-notice" role="alert">연습 기록을 임시로 보관하고 있어요. 새로고침하면 기록이 사라질 수 있어요.</p>}
    {training.persistence === 'recovered' && <p className="persistence-notice" role="status">저장된 연습 기록을 읽지 못해 빈 기록으로 복구했어요.</p>}
    <dl className={styles.stats}>
      <div><dt><ClipboardCheck aria-hidden />완료한 연습·테스트</dt><dd data-testid="training-count">{summary.completed}<span>회</span></dd></div>
      <div><dt><Award aria-hidden />평균 점수</dt><dd data-testid="training-average">{summary.averageScore ?? '—'}<span>{summary.averageScore === null ? '완료 후 표시' : '/ 100'}</span></dd></div>
      <div><dt><ListChecks aria-hidden />완료한 구인 테스트</dt><dd>{summary.tests}<span>회</span></dd></div>
      <div><dt><Clock3 aria-hidden />진행 중</dt><dd>{summary.active}<span>회</span></dd></div>
    </dl>
    <section aria-labelledby="records-heading">
      <div className={styles.recordsHeading}><h2 id="records-heading">최근 기록</h2><div className={styles.filters} role="group" aria-label="기록 유형">{([{ value: 'all', label: '전체' }, { value: 'practice', label: '연습' }, { value: 'test', label: '구인 테스트' }] as const).map(option => <button key={option.value} aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>{option.label}</button>)}</div></div>
      {!records.length ? <div className={styles.empty}><ClipboardCheck size={36} aria-hidden /><h3>{filter === 'all' ? '아직 연습 기록이 없어요' : `${filter === 'test' ? '구인 테스트' : '연습'} 기록이 없어요`}</h3><p>스토어 매니저가 시뮬레이터를 진행하면 단계별 결과가 여기에 저장돼요.</p><Link href="/crew/simulation" className="button">시뮬레이터 열기<ArrowRight size={16} aria-hidden /></Link></div> : <div className={styles.records}>{records.map(attempt => <details key={attempt.id} className={styles.record}>
        <summary><span className={styles.avatar} aria-hidden>{attempt.candidateName.slice(0, 1)}</span><span className={styles.recordIdentity}><strong>{attempt.candidateName}</strong><span>{attempt.mode === 'test' ? '구인 테스트' : '연습'} · <time dateTime={attempt.startedAt}>{new Date(attempt.startedAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></span></span><span className={styles.score}>{attempt.status === 'completed' ? <><strong>{attempt.score}</strong><span>점</span></> : <span className={styles.inProgress}>진행 중<br />{attempt.answers.length} / {trainingSteps.length}단계</span>}</span><ChevronDown size={18} aria-hidden /></summary>
        <div className={styles.resultBody}><p className={styles.resultLabel}>{attempt.status === 'completed' ? `${attempt.answers.filter(answer => answer.correct).length}개 정답 · ${trainingSteps.length}개 단계 완료` : `${attempt.answers.length}개 단계 응답 · 완료 후 점수가 표시돼요`}</p>
          {!attempt.answers.length ? <p className="small-note">아직 제출한 답변이 없어요.</p> : <ol className={styles.steps}>{attempt.answers.map(answer => {
            const step = trainingSteps.find(item => item.id === answer.stepId);
            return <li key={answer.stepId}><span className={answer.correct ? styles.correct : styles.incorrect}>{answer.correct ? <Check size={15} aria-hidden /> : <X size={15} aria-hidden />}<span className="sr-only">{answer.correct ? '정답' : '오답'}</span></span><div><strong>{step?.title ?? answer.stepId}</strong><p>{step?.choices.find(choice => choice.id === answer.choiceId)?.label ?? '선택한 답변'}</p>{step && <a href={step.source.url} target="_blank" rel="noreferrer">교육 근거 · {step.source.title}</a>}</div></li>;
          })}</ol>}
        </div>
      </details>)}</div>}
      <p className={styles.note}>이 브라우저에 저장된 기록이에요. 점수는 교육 내용의 이해도를 확인하는 참고 자료이며, 채용 적합성을 자동 판정하지 않아요.</p>
    </section>
    <Link href="/manager/manual" className={styles.settings}><SlidersHorizontal size={18} aria-hidden /><span><strong>매장 추가 규칙</strong><span>우리 매장에만 필요한 안내를 덧붙여요.</span></span><ArrowRight size={18} aria-hidden /></Link>
  </>;
}
