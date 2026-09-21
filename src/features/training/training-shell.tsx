'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Barcode, Check, CheckCircle2, ClipboardCheck, Clock3, CreditCard, FileText, GraduationCap, Monitor, PackageCheck, Play, RotateCcw, ScanLine, ShieldCheck, ShoppingBag, Sparkles, X } from 'lucide-react';
import { trainingChapters, trainingSteps, trainingSubtotal, trainingTotal, trainingTransaction, type TrainingMode, type TrainingStep } from './training-data';
import { useTrainingStore, type TrainingAttempt } from './training-store';
import './training.css';

function CounterScene({ step, answered }: { step: TrainingStep; answered: boolean }) {
  return <div className={`counter-scene ${answered ? 'scene-answered' : ''}`} aria-label="가상 매장 카운터 장면" role="img">
    <div className="scene-window"><span/><span/><span/></div>
    <div className="scene-shelf"><i/><i/><i/><i/><i/><i/><i/><i/></div>
    <div className="scene-bubble" key={step.id}><span>{step.chapter === '근무 준비' || step.screen === 'waste' || step.screen === 'report' ? '함께 일하는 스토어 매니저' : '손님'}</span><p>{step.customer}</p></div>
    <div className="scene-person" aria-hidden="true"><div className="person-hair"/><div className="person-head"><i/><i/><span/></div><div className="person-body"/><div className="person-arm"/></div>
    <div className="scene-counter"><div className="scene-bag"><ShoppingBag size={24}/></div><div className="scene-drinks"><i/><i/><i/></div><div className="scene-terminal"><CreditCard size={19}/><span/></div></div>
    <span className="scene-caption">가상 매장 · 연습용 그래픽</span>
  </div>;
}

function PosDisplay({ step, answered, selected, onAction, disabled }: { step: TrainingStep; answered: boolean; selected: string | null; onAction: (id: string) => void; disabled: boolean }) {
  const isProducts = ['scan', 'promotion', 'discount', 'payment', 'receipt', 'hold'].includes(step.screen);
  const scanned = step.screen !== 'scan' || answered;
  const saleDone = (step.screen === 'payment' && answered) || step.screen === 'receipt';
  return <div className={`training-pos ${answered ? 'pos-updated' : ''}`}>
    <div className="pos-top"><span><Monitor size={15}/> FIRSTDAY POS</span><span className="pos-online"><i/>연습 전용</span></div>
    <div className="pos-app">
      <div className="pos-toolbar"><span className="pos-tab">{isProducts ? '상품 판매' : step.chapter === '근무 준비' ? '근무 인수인계' : '업무 확인'}</span><span>가상 매장 01</span></div>
      <div className="pos-workspace">
        {isProducts ? <>
          <div className="pos-columns"><span>상품명</span><span>수량</span><span>금액</span></div>
          <div className={`pos-product ${scanned ? 'has-product' : ''}`}>
            {scanned ? <><span><i>01</i> {trainingTransaction.productName} <small>연습용 상품</small></span><strong>{trainingTransaction.quantity}</strong><strong>{trainingSubtotal.toLocaleString('ko-KR')}</strong></> : <div className="pos-scan-wait"><Barcode size={42}/><span>상품 바코드를 스캔해 주세요</span><small>아래에서 할 일을 선택하세요</small></div>}
          </div>
          <div className="pos-total"><span>연습 행사 할인<strong>{scanned ? `−${trainingTransaction.discount.toLocaleString('ko-KR')}` : '0'}<small>원</small></strong></span><span>합계<strong>{scanned ? trainingTotal.toLocaleString('ko-KR') : '0'}<small>원</small></strong></span></div>
          <div className={`pos-status ${saleDone ? 'approved' : ''}`}>{saleDone ? <><CheckCircle2 size={16}/> 결제 완료 · 승인 확인</> : step.screen === 'payment' ? <><CreditCard size={16}/> 카드 승인 대기</> : step.screen === 'promotion' ? <><ScanLine size={16}/> 상품·행사 정보 조회</> : step.screen === 'hold' ? <><Clock3 size={16}/> 미결제 상품 목록</> : <><Barcode size={16}/> {scanned ? '등록한 상품을 확인하세요' : '상품 등록 대기'}</>}</div>
        </> : <div className="pos-task-display"><div className="pos-task-icon">{step.chapter === '근무 준비' ? <ClipboardCheck size={34}/> : step.screen === 'waste' ? <PackageCheck size={34}/> : <FileText size={34}/>}</div><strong>{step.title}</strong><p>{step.chapter === '근무 준비' ? '인계사항 · 점검표 · 미완료 업무' : step.screen === 'waste' ? '연습용 상품 2개 · 판매 제외' : '상황 확인 → 조치 → 후속 전달'}</p><span>아래에서 다음 행동을 선택하세요</span></div>}
      </div>
      <div className="pos-actions" role="group" aria-label="POS 행동 선택">
        {step.choices.map((choice, index) => <button type="button" key={choice.id} className="pos-action" aria-pressed={selected === choice.id} disabled={disabled} onClick={() => onAction(choice.id)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{choice.label}</strong>{choice.detail && <small>{choice.detail}</small>}</button>)}
      </div>
    </div>
    <div className="pos-chin"><i/><span>SIMULATION TERMINAL</span></div>
  </div>;
}

function TrainingResult({ attempt, onRetry }: { attempt: TrainingAttempt; onRetry: () => void }) {
  const correct = attempt.answers.filter(answer => answer.correct).length;
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus(); }, []);
  return <section className="training-result" aria-labelledby="result-title">
    <div className="result-intro"><span className="training-kicker">{attempt.mode === 'test' ? 'TEST COMPLETE' : 'PRACTICE COMPLETE'}</span><div className="result-check"><Check size={30}/></div><h1 id="result-title" ref={title} tabIndex={-1}>끝까지 해냈어요!</h1><p>{attempt.candidateName}님의 {attempt.mode === 'test' ? '테스트' : '연습'} 결과예요.</p><div className="score-display"><strong>{attempt.score}</strong><span>/ 100점</span></div><p className="result-count">총 {trainingSteps.length}단계 중 <strong>{correct}단계 정답</strong></p><div className="result-actions"><button className="button" onClick={onRetry}><RotateCcw size={16}/>다시 연습하기</button><Link className="button secondary" href="/crew/questions">매뉴얼에 질문하기<ArrowRight size={16}/></Link></div></div>
    <div className="chapter-scores">{trainingChapters.map(chapter => {
      const steps = trainingSteps.filter(step => step.chapter === chapter);
      const count = attempt.answers.filter(answer => answer.correct && steps.some(step => step.id === answer.stepId)).length;
      return <div key={chapter}><span>{chapter}</span><strong>{count}<small> / {steps.length}</small></strong><progress value={count} max={steps.length} aria-label={`${chapter} 정답 수`}/></div>;
    })}</div>
    <div className="result-review"><h2>단계별 다시 보기</h2><p>선택한 행동과 교육 근거를 함께 확인해요.</p>{attempt.answers.map((answer, index) => {
      const step = trainingSteps[index];
      return <details key={step.id} className={answer.correct ? 'review-correct' : 'review-incorrect'}><summary><span className="review-mark">{answer.correct ? <Check size={16}/> : <X size={16}/>}</span><span>{String(index + 1).padStart(2, '0')} <strong>{step.title}</strong></span><span className="review-status">{answer.correct ? '정답' : '복습하기'}</span></summary><div className="review-body"><p>내 선택: {step.choices.find(choice => choice.id === answer.choiceId)?.label}</p>{!answer.correct && <p><strong>정답: {step.choices.find(choice => choice.id === step.correctChoiceId)?.label}</strong></p>}<p>{step.explanation}</p><a href={step.source.url} target="_blank" rel="noreferrer">교육 근거 · {step.source.title} ↗</a></div></details>;
    })}</div>
    <p className="training-footnote">결과는 이 브라우저의 경영주 화면에서 확인할 수 있어요. 교육 퀴즈 점수이며 직무 적합성이나 채용 합격을 자동 판정하지 않아요.</p>
  </section>;
}

export function TrainingShell({ initialMode = 'practice' }: { initialMode?: TrainingMode }) {
  const store = useTrainingStore();
  const [mode, setMode] = useState<TrainingMode>(initialMode);
  const [name, setName] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedbackIndex, setFeedbackIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedbackHeading = useRef<HTMLHeadingElement>(null);
  const session = store.attempts.find(attempt => attempt.id === activeId) ?? null;
  const index = feedbackIndex ?? session?.answers.length ?? 0;
  const step = trainingSteps[index];
  const feedback = feedbackIndex !== null ? session?.answers[feedbackIndex] : null;
  const showResult = session?.status === 'completed' && feedbackIndex === null;
  const latestCompleted = [...store.attempts].reverse().find(attempt => attempt.status === 'completed');

  useEffect(() => { if (activeId) heading.current?.focus(); }, [activeId, index, showResult]);
  useEffect(() => { if (feedbackIndex !== null) feedbackHeading.current?.focus(); }, [feedbackIndex]);
  if (!store.ready) return <p role="status" className="loading">연습 기록을 불러오는 중이에요…</p>;

  function begin(nextMode = mode) {
    const attempt = store.start(nextMode, name);
    setMode(nextMode); setActiveId(attempt.id); setFeedbackIndex(null); setSelected(null);
  }
  function submit() {
    if (!session || !step || !selected || feedback) return;
    const updated = store.answer(session.id, step.id, selected);
    if (!updated || updated.answers.length === session.answers.length) return;
    if (session.mode === 'practice') setFeedbackIndex(index);
    setSelected(null);
  }

  return <div className="training-shell">
    {store.persistence === 'memory' && <p className="error-message" role="alert">브라우저 저장에 실패했어요. 지금 연습은 계속할 수 있지만 새로고침하면 기록을 잃을 수 있어요.</p>}
    {store.persistence === 'recovered' && <p role="status" className="inline-note">손상된 연습 기록을 초기 상태로 복구했어요.</p>}
    {showResult && session ? <TrainingResult attempt={session} onRetry={() => begin('practice')}/> : session && step ? <>
      <div className="training-topline"><button className="training-back" onClick={() => { setActiveId(null); setFeedbackIndex(null); setSelected(null); }}><ArrowLeft size={16}/>나가기</button><span>{session.mode === 'test' ? '채용 테스트' : '매장 시뮬레이터'}</span><strong>{index + 1}<span> / {trainingSteps.length}</span></strong></div>
      <div className="training-progress" role="progressbar" aria-label="시뮬레이터 진행률" aria-valuemin={0} aria-valuemax={trainingSteps.length} aria-valuenow={session.answers.length}>{trainingSteps.map((item, stepIndex) => <span key={item.id} className={stepIndex < session.answers.length ? 'done' : stepIndex === index ? 'current' : ''}/>)}</div>
      <div className="training-stage-heading"><p className="training-kicker">{step.chapter} <span>STEP {String(index + 1).padStart(2, '0')}</span></p><h1 ref={heading} tabIndex={-1}>{step.title}</h1><p>{step.situation}</p></div>
      <div className="training-arena"><section className="training-customer"><CounterScene step={step} answered={Boolean(feedback)}/><div className="training-prompt"><span>이번 단계의 미션</span><h2>{step.question}</h2><p>POS의 행동 버튼을 선택해 주세요.</p></div><div className="training-source-note"><FileText size={14}/><span>{session.mode === 'test' ? '테스트 중에는 정답과 해설이 표시되지 않아요.' : `교육 근거 · ${step.source.title}`}</span></div></section><section className="training-terminal" aria-label="가상 POS"><PosDisplay step={step} answered={Boolean(feedback?.correct)} selected={selected ?? feedback?.choiceId ?? null} onAction={setSelected} disabled={Boolean(feedback)}/>{!feedback && <div className="training-submit"><p aria-live="polite">{selected ? <><CheckCircle2 size={16}/>{step.choices.find(choice => choice.id === selected)?.label}</> : 'POS에서 다음 행동을 골라 주세요.'}</p><button className="button" disabled={!selected} onClick={submit}>{session.mode === 'test' ? index === trainingSteps.length - 1 ? '제출하고 점수 보기' : '답 제출하고 다음 단계' : '이 행동으로 진행'}<ArrowRight size={17}/></button></div>}</section></div>
      {feedback && <section className={`training-feedback ${feedback.correct ? 'correct' : 'incorrect'}`} aria-live="polite"><div className="feedback-symbol">{feedback.correct ? <Check size={23}/> : <RotateCcw size={23}/>}</div><div><h2 ref={feedbackHeading} tabIndex={-1}>{feedback.correct ? '좋아요, 정확한 순서예요!' : '이 단계는 다시 기억해 두세요.'}</h2>{!feedback.correct && <p><strong>{step.choices.find(choice => choice.id === step.correctChoiceId)?.label}</strong></p>}<p>{step.explanation}</p><a href={step.source.url} target="_blank" rel="noreferrer">{step.source.title} · 교육 자료 보기 ↗</a></div><button className="button" onClick={() => { setFeedbackIndex(null); setSelected(null); }}>{session.status === 'completed' ? '최종 점수 보기' : '다음 단계'}<ArrowRight size={16}/></button></section>}
      <p className="training-footnote">공개 교육맵의 확인된 요약을 바탕으로 구성했어요. 상품·가격·화면은 연습용 합성 데이터예요.</p>
    </> : <>
      <div className="training-landing-heading"><p className="training-kicker">LEARN BY DOING</p><h1>첫 근무, 미리 해보세요.</h1><p>카운터 앞에서 무엇을 할지 고르다 보면<br className="desktop-break"/> 매장의 하루가 익숙해져요.</p></div>
      <div className="training-mode-switch" aria-label="연습 방식"><button className={mode === 'practice' ? 'active' : ''} aria-pressed={mode === 'practice'} onClick={() => setMode('practice')}><GraduationCap size={19}/>차근차근 연습</button><button className={mode === 'test' ? 'active' : ''} aria-pressed={mode === 'test'} onClick={() => setMode('test')}><ShieldCheck size={19}/>채용 테스트</button></div>
      <div className="training-launch"><div className="training-launch-copy"><span className="training-launch-badge"><Sparkles size={14}/>{mode === 'practice' ? '실수해도 괜찮아요' : '면접에서 함께 확인해요'}</span><h2>{mode === 'practice' ? '매장의 하루를\n12단계로 연습해요' : '스토어 매니저\n업무 이해도 테스트'}</h2><p>{mode === 'practice' ? '행동을 고르면 바로 해설을 볼 수 있어요. 마지막에는 점수와 복습할 내용을 알려드려요.' : '정답과 해설은 마지막에 한 번에 확인해요. 면접 중 업무 이해도를 함께 살펴볼 수 있어요.'}</p><div className="training-meta"><span><Clock3 size={15}/>약 5분</span><span><ClipboardCheck size={15}/>{trainingSteps.length}개 상황</span><span><Monitor size={15}/>가상 POS</span></div>{mode === 'test' && <label className="candidate-label" htmlFor="candidate-name">테스트 참여자 별칭<input id="candidate-name" placeholder="예: 지원자 A (실명 입력 불필요)" maxLength={40} value={name} onChange={event => setName(event.target.value)}/></label>}<button className="button launch-button" onClick={() => begin()}><Play size={17} fill="currentColor"/>{mode === 'practice' ? '연습 시작하기' : '테스트 시작하기'}<ArrowRight size={17}/></button></div><div className="launch-visual"><CounterScene step={trainingSteps[2]} answered={false}/><div className="launch-pos-preview"><span><Monitor size={17}/> FIRSTDAY POS</span><div><span>{trainingTransaction.productName} <small>× {trainingTransaction.quantity}</small></span><strong>{trainingTotal.toLocaleString('ko-KR')}원</strong></div><p><Barcode size={21}/>직접 고르고, 확인하고, 배워요.</p></div></div></div>
      {store.active && <div className="training-resume"><div><strong>진행 중인 {store.active.mode === 'test' ? '테스트' : '연습'}이 있어요</strong><span>{store.active.candidateName} · {store.active.answers.length} / {trainingSteps.length}단계 완료</span></div><button className="button secondary" onClick={() => { setActiveId(store.active!.id); setMode(store.active!.mode); setFeedbackIndex(null); setSelected(null); }}>이어서 하기<ArrowRight size={16}/></button></div>}
      {latestCompleted && <div className="training-resume"><div><strong>최근 {latestCompleted.mode === 'test' ? '테스트' : '연습'} · {latestCompleted.score}점</strong><span>{latestCompleted.candidateName} · 12단계 완료</span></div><button className="button secondary" onClick={() => { setActiveId(latestCompleted.id); setFeedbackIndex(null); setSelected(null); }}>지난 결과 보기<ArrowRight size={16}/></button></div>}
      <div className="training-curriculum">{trainingChapters.map((chapter, i) => <div key={chapter}><span>0{i + 1}</span><h3>{chapter}</h3><p>{i === 0 ? '인수인계와 점검' : i === 1 ? '등록부터 결제 완료까지' : '불만·소비기한·폐기 처리'}</p></div>)}</div>
      <p className="training-footnote">GS25 공개 교육맵의 확인된 본문 요약을 활용해요. 실제 POS와 다른 연습용 화면이며, 점수는 업무 적합성이나 채용 합격의 자동 판정에 쓰이지 않아요.</p>
    </>}
  </div>;
}
