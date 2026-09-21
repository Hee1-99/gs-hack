'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Barcode, Check, CheckCircle2, ClipboardCheck, Clock3, CreditCard, FileText, GraduationCap, Monitor, PackageCheck, Play, RotateCcw, ScanLine, ShieldCheck, ShoppingBag, Sparkles, X } from 'lucide-react';
import { trainingChapters, trainingSteps, trainingSubtotal, trainingTotal, trainingTransaction, type TrainingMode, type TrainingStep } from './training-data';
import { useTrainingStore, type TrainingAttempt } from './training-store';
import { getAttemptSteps } from './training-engine';
import { requestTrainingGrade } from './training-grade-client';
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
    <div className="pos-top"><span><Monitor size={15}/> GStep POS</span><span className="pos-online"><i/>연습 전용</span></div>
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

function duration(ms:number) {const seconds=Math.round(ms/1000);return `${Math.floor(seconds/60)}분 ${seconds%60}초`;}
function TrainingResult({ attempt, onRetry }: { attempt: TrainingAttempt; onRetry: () => void }) {
  const steps=getAttemptSteps(attempt),correct=attempt.answers.filter(answer=>answer.correct).length;
  const title=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{title.current?.focus();},[]);
  return <section className="training-result" aria-labelledby="result-title">
    <div className="result-intro"><span className="training-kicker">{attempt.mode==='test'?'TEST COMPLETE':'PRACTICE COMPLETE'}</span><div className="result-check"><Check size={30}/></div><h1 id="result-title" ref={title} tabIndex={-1}>끝까지 해냈어요!</h1><p>{attempt.candidateName}님의 {attempt.mode==='test'?'테스트':'연습'} 결과예요.</p><div className="score-display"><strong>{attempt.score}</strong><span>/ 100점</span></div><p className="result-count">총 {steps.length}단계 중 <strong>{correct}단계 기준 충족</strong></p>
    {attempt.courseVersion===2&&<div className="training-score-breakdown"><span>정확도 <strong>{attempt.accuracyScore} / 90</strong></span><span>시간 보너스 <strong>{attempt.timeScore} / 10</strong></span><span>답안 작성 시간 <strong>{duration(attempt.totalElapsedMs??0)}</strong></span></div>}
    <div className="result-actions"><button className="button" onClick={onRetry}><RotateCcw size={16}/>다시 연습하기</button><Link className="button secondary" href="/crew/questions">매뉴얼에 질문하기<ArrowRight size={16}/></Link></div></div>
    <div className="chapter-scores">{[...new Set(steps.map(step=>step.chapter))].map(chapter=>{const chapterSteps=steps.filter(step=>step.chapter===chapter),count=attempt.answers.filter(answer=>answer.correct&&chapterSteps.some(step=>step.id===answer.stepId)).length;return <div key={chapter}><span>{chapter}</span><strong>{count}<small> / {chapterSteps.length}</small></strong><progress value={count} max={chapterSteps.length} aria-label={`${chapter} 기준 충족 수`}/></div>;})}</div>
    <div className="result-review"><h2>단계별 다시 보기</h2><p>답안, 채점 방식과 교육 근거를 함께 확인해요.</p>{attempt.answers.map((answer,index)=>{const step=steps[index];return <details key={step.id} className={answer.correct?'review-correct':'review-incorrect'}><summary><span className="review-mark">{answer.correct?<Check size={16}/>:<X size={16}/>}</span><span>{String(index+1).padStart(2,'0')} <strong>{step.title}</strong></span><span className="review-status">{answer.correct?'기준 충족':'복습하기'}</span></summary><div className="review-body"><p>내 답안: {answer.answerText??step.choices.find(choice=>choice.id===answer.choiceId)?.label}</p>{step.kind==='short-answer'?<><p><strong>{answer.gradingMode==='gemini'?'Gemini 의미 채점':'기본 기준 채점 · 데모'} · {answer.accuracyPoints}점</strong></p><p>{answer.feedback}</p><p>예시 답안: {step.sampleAnswer}</p></>:!answer.correct&&<p><strong>정답: {step.choices.find(choice=>choice.id===step.correctChoiceId)?.label}</strong></p>}{answer.elapsedMs!==undefined&&<p>답안 작성 {duration(answer.elapsedMs)} · 시간 보너스 {answer.timeBonus}점</p>}<p>{step.explanation}</p><a href={step.source.url} target="_blank" rel="noreferrer">교육 근거 · {step.source.title} ↗</a></div></details>;})}</div>
    <p className="training-footnote">{attempt.courseVersion===1?'이전 12단계 코스의 기록이에요. 당시의 정답 비율과 점수를 그대로 보존하며 새 시간 기준으로 다시 채점하지 않아요.':'정확도 90점 + 시간 보너스 최대 10점. 천천히 정확히 답해도 90점을 받을 수 있어요. 틀린 객관식 답안에는 시간 점수가 없어요. 주관식은 기준 70점 이상일 때만 시간 보너스를 받아요.'} 채용 합격을 자동 판정하지 않아요.</p>
  </section>;
}

export function TrainingShell({initialMode='practice'}:{initialMode?:TrainingMode}) {
  const store=useTrainingStore();
  const [mode,setMode]=useState<TrainingMode>(initialMode),[name,setName]=useState(''),[chapter,setChapter]=useState('all');
  const [activeId,setActiveId]=useState<string|null>(null),[feedbackIndex,setFeedbackIndex]=useState<number|null>(null),[selected,setSelected]=useState<string|null>(null),[answerText,setAnswerText]=useState('');
  const [pending,setPending]=useState(false),[error,setError]=useState(''),[clock,setClock]=useState(Date.now());
  const pendingRef=useRef(false),selectedAt=useRef<number|null>(null),submittedElapsed=useRef<number|null>(null);
  const heading=useRef<HTMLHeadingElement>(null),feedbackHeading=useRef<HTMLHeadingElement>(null);
  const session=store.attempts.find(attempt=>attempt.id===activeId)??null;
  const steps=session?getAttemptSteps(session):trainingSteps,index=feedbackIndex??session?.answers.length??0,step=steps[index];
  const feedback=feedbackIndex!==null?session?.answers[feedbackIndex]:null,showResult=session?.status==='completed'&&feedbackIndex===null;
  const latestCompleted=[...store.attempts].reverse().find(attempt=>attempt.status==='completed');
  const courseSteps=chapter==='all'?trainingSteps:trainingSteps.filter(step=>step.chapter===chapter);
  const elapsed=session?.stageStartedAt?Math.max(0,(selectedAt.current??clock)-Date.parse(session.stageStartedAt)):0;
  useEffect(()=>{if(activeId)heading.current?.focus();},[activeId,index,showResult]);
  useEffect(()=>{if(feedbackIndex!==null)feedbackHeading.current?.focus();},[feedbackIndex]);
  useEffect(()=>{if(!session||session.status==='completed'||feedbackIndex!==null)return;const timer=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(timer);},[session?.id,session?.status,feedbackIndex]);
  if(!store.ready)return <p role="status" className="loading">연습 기록을 불러오는 중이에요…</p>;
  function clearAnswer(){setSelected(null);setAnswerText('');setError('');selectedAt.current=null;submittedElapsed.current=null;setClock(Date.now());}
  function begin(nextMode=mode,retryChapter?:string){if(pendingRef.current)return;const chosenChapter=retryChapter??chapter;const attempt=store.start(nextMode,name,chosenChapter==='all'?undefined:chosenChapter);setMode(nextMode);setActiveId(attempt.id);setFeedbackIndex(null);clearAnswer();}
  function advance(){if(session)store.beginStep(session.id);setFeedbackIndex(null);clearAnswer();}
  async function submit(){
    if(!session||!step||feedback||pendingRef.current||(step.kind==='short-answer'?!answerText.trim():!selected))return;
    const elapsedMs=submittedElapsed.current??Math.max(0,(step.kind==='short-answer'?Date.now():selectedAt.current??Date.now())-Date.parse(session.stageStartedAt??new Date().toISOString()));
    submittedElapsed.current=elapsedMs;pendingRef.current=true;setPending(true);setError('');
    try {
      const grade=step.kind==='short-answer'?await requestTrainingGrade(step.id,answerText.trim()):null;
      const updated=store.answer(session.id,step.id,selected??'written',{elapsedMs,...(grade?{answerText:answerText.trim(),accuracyPoints:grade.score,gradingMode:grade.mode,feedback:grade.feedback}:{})});
      if(!updated||updated.answers.length===session.answers.length)return;
      if(session.mode==='practice')setFeedbackIndex(index);else{store.beginStep(session.id);clearAnswer();}
    }catch{setError('채점 응답을 받지 못했어요. 답안은 유지돼요. 다시 제출해 주세요.');}
    finally{pendingRef.current=false;setPending(false);}
  }
  return <div className="training-shell">
    {store.persistence==='memory'&&<p className="error-message" role="alert">브라우저 저장에 실패했어요. 새로고침하면 기록을 잃을 수 있어요.</p>}
    {store.persistence==='recovered'&&<p role="status" className="inline-note">손상된 연습 기록을 복구했어요. 정상적인 이전 기록은 유지해요.</p>}
    {showResult&&session?<TrainingResult attempt={session} onRetry={()=>begin('practice',new Set(steps.map(item=>item.chapter)).size===1?steps[0].chapter:'all')}/>:session&&step?<>
      <div className="training-topline"><button className="training-back" disabled={pending} onClick={()=>{setActiveId(null);setFeedbackIndex(null);clearAnswer();}}><ArrowLeft size={16}/>나가기</button><span>{session.mode==='test'?'채용 테스트':'매장 시뮬레이터'}</span><strong>{index+1}<span> / {steps.length}</span></strong></div>
      <div className="training-progress" role="progressbar" aria-label="시뮬레이터 진행률" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={session.answers.length}>{steps.map((item,i)=><span key={item.id} className={i<session.answers.length?'done':i===index?'current':''}/>)}</div>
      <div className="training-stage-heading"><p className="training-kicker">{step.chapter} <span>STEP {String(index+1).padStart(2,'0')} · {step.kind==='short-answer'?'직접 쓰는 답안':'행동 선택'}</span></p><h1 ref={heading} tabIndex={-1}>{step.title}</h1><p>{step.situation}</p><span className="training-timer"><Clock3 size={14}/>{feedback?duration(feedback.elapsedMs??0):duration(elapsed)} <small>정확도가 먼저예요</small></span></div>
      <div className="training-arena"><section className="training-customer"><CounterScene step={step} answered={Boolean(feedback)}/><div className="training-prompt"><span>이번 단계의 미션</span><h2>{step.question}</h2><p>{step.kind==='short-answer'?'고객에게 할 말을 직접 적어 주세요.':'POS의 행동 버튼을 선택해 주세요.'}</p></div><div className="training-source-note"><FileText size={14}/><span>{session.mode==='test'?'테스트 중에는 정답과 해설이 표시되지 않아요.':`교육 근거 · ${step.source.title}`}</span></div></section><section className="training-terminal" aria-label="가상 POS">
      {step.kind==='short-answer'?<div className="training-written"><span className="pill">직접 쓰는 상황 답안</span><label htmlFor="training-answer">고객에게 할 말<textarea id="training-answer" maxLength={1500} rows={6} value={answerText} disabled={pending||Boolean(feedback)} onChange={event=>{setAnswerText(event.target.value);if(!error)submittedElapsed.current=null;}} placeholder="확인할 내용과 다음 행동을 자연스럽게 설명해 보세요."/></label><p>말투만 보지 않고, 상황 확인과 필요한 행동이 담겼는지 평가해요.</p>{session.mode==='practice'&&<details><summary>채점 기준 보기</summary><ul>{step.rubric?.map(item=><li key={item.id}>{item.label}</li>)}</ul></details>}</div>:<PosDisplay step={step} answered={Boolean(feedback?.correct)} selected={selected??feedback?.choiceId??null} onAction={id=>{setSelected(id);selectedAt.current=Date.now();submittedElapsed.current=null;setClock(Date.now());}} disabled={pending||Boolean(feedback)}/>}
      {!feedback&&<div className="training-submit">{pending?<div className="training-grading" role="status"><div className="grading-orbit"><Sparkles size={24}/></div><strong>{step.kind==='short-answer'?'AI 채점을 요청하고 있어요':'답안과 시간을 확인 중이에요'}</strong><span>매뉴얼의 기준을 확인하고 있어요.</span></div>:<p aria-live="polite">{step.kind==='short-answer'?`${answerText.length} / 1500자`:selected?<><CheckCircle2 size={16}/>{step.choices.find(choice=>choice.id===selected)?.label}</>:'POS에서 다음 행동을 골라 주세요.'}</p>}{error&&<p role="alert">{error}</p>}<button className="button" disabled={pending||(step.kind==='short-answer'?!answerText.trim():!selected)} onClick={()=>void submit()}>{pending?'채점 중…':session.mode==='test'?index===steps.length-1?'제출하고 점수 보기':'답 제출하고 다음 단계':'이 행동으로 진행'}<ArrowRight size={17}/></button></div>}</section></div>
      {feedback&&<section className={`training-feedback ${feedback.correct?'correct':'incorrect'}`} aria-live="polite"><div className="feedback-symbol">{feedback.correct?<Check size={23}/>:<RotateCcw size={23}/>}</div><div><h2 ref={feedbackHeading} tabIndex={-1}>{feedback.correct?'좋아요, 정확한 순서예요!':'이 단계는 다시 기억해 두세요.'}</h2>{step.kind==='short-answer'?<><p><strong>{feedback.gradingMode==='gemini'?'Gemini 의미 채점':'기본 기준 채점 · 데모'} · {feedback.accuracyPoints}점</strong></p><p>{feedback.feedback}</p></>:!feedback.correct&&<p><strong>{step.choices.find(choice=>choice.id===step.correctChoiceId)?.label}</strong></p>}<p>{step.explanation}</p>{feedback.elapsedMs!==undefined&&<p>{duration(feedback.elapsedMs)} · 시간 보너스 {feedback.timeBonus}점</p>}<a href={step.source.url} target="_blank" rel="noreferrer">{step.source.title} · 교육 자료 보기 ↗</a></div><button className="button" onClick={advance}>{session.status==='completed'?'최종 점수 보기':'다음 단계'}<ArrowRight size={16}/></button></section>}
      <p className="training-footnote">공개 교육맵의 확인된 요약에 근거해요. 객관식은 마지막 선택까지, 주관식은 제출까지의 시간을 기록해요. 백그라운드·새로고침 시간은 포함하고 채점·해설 확인 시간은 제외해요.</p>
    </>:<>
      <div className="training-landing-heading"><p className="training-kicker">GSTEP · LEARN BY DOING</p><h1>첫 근무, 미리 해보세요.</h1><p>입고와 진열부터 결제·위생·고객 응대까지.<br/>실제 상황을 고르고, 직접 답하고, 익혀요.</p></div>
      <div className="training-mode-switch" aria-label="연습 방식"><button className={mode==='practice'?'active':''} aria-pressed={mode==='practice'} onClick={()=>setMode('practice')}><GraduationCap size={19}/>차근차근 연습</button><button className={mode==='test'?'active':''} aria-pressed={mode==='test'} onClick={()=>setMode('test')}><ShieldCheck size={19}/>채용 테스트</button></div>
      <label className="training-course-picker" htmlFor="course-chapter">연습할 업무<select id="course-chapter" value={chapter} onChange={event=>setChapter(event.target.value)}><option value="all">매장의 하루 전체 · {trainingSteps.length}단계</option>{trainingChapters.map(item=><option key={item} value={item}>{item} · {trainingSteps.filter(step=>step.chapter===item).length}단계</option>)}</select></label>
      <div className="training-launch"><div className="training-launch-copy"><span className="training-launch-badge"><Sparkles size={14}/>{mode==='practice'?'실수해도 괜찮아요':'면접에서 함께 확인해요'}</span><h2>{mode==='practice'?`${chapter==='all'?'매장의 하루':chapter}를\n${courseSteps.length}단계로 연습해요`:'스토어 매니저\n업무 이해도 테스트'}</h2><p>{mode==='practice'?'행동 선택과 직접 쓰는 답안으로 연습해요. 바로 해설을 확인하고 마지막에 정확도와 시간 점수를 함께 봐요.':'정답과 해설은 마지막에 한 번에 확인해요. 직접 쓰는 답안은 매뉴얼 기준에 따라 AI가 평가해요.'}</p><div className="training-meta"><span><Clock3 size={15}/>약 {Math.ceil(courseSteps.length*.6)}분</span><span><ClipboardCheck size={15}/>{courseSteps.length}개 상황</span><span><Monitor size={15}/>선택 + 주관식</span></div>{mode==='test'&&<label className="candidate-label" htmlFor="candidate-name">테스트 참여자 별칭<input id="candidate-name" placeholder="예: 지원자 A (실명 입력 불필요)" maxLength={40} value={name} onChange={event=>setName(event.target.value)}/></label>}<button className="button launch-button" onClick={()=>begin()}><Play size={17} fill="currentColor"/>{mode==='practice'?'연습 시작하기':'테스트 시작하기'}<ArrowRight size={17}/></button></div><div className="launch-visual"><CounterScene step={trainingSteps.find(step=>step.id==='scan')!} answered={false}/><div className="launch-pos-preview"><span><Monitor size={17}/> GStep POS</span><div><span>{trainingTransaction.productName} <small>× {trainingTransaction.quantity}</small></span><strong>{trainingTotal.toLocaleString('ko-KR')}원</strong></div><p><Barcode size={21}/>직접 고르고, 설명하고, 배워요.</p></div></div></div>
      {store.active&&<div className="training-resume"><div><strong>진행 중인 {store.active.mode==='test'?'테스트':'연습'}이 있어요</strong><span>{store.active.candidateName} · {store.active.answers.length} / {getAttemptSteps(store.active).length}단계 완료</span></div><button className="button secondary" onClick={()=>{store.beginStep(store.active!.id);setActiveId(store.active!.id);setMode(store.active!.mode);setFeedbackIndex(null);clearAnswer();}}>이어서 하기<ArrowRight size={16}/></button></div>}
      {latestCompleted&&<div className="training-resume"><div><strong>최근 {latestCompleted.mode==='test'?'테스트':'연습'} · {latestCompleted.score}점</strong><span>{latestCompleted.candidateName} · {getAttemptSteps(latestCompleted).length}단계 완료</span></div><button className="button secondary" onClick={()=>{setActiveId(latestCompleted.id);setFeedbackIndex(null);clearAnswer();}}>지난 결과 보기<ArrowRight size={16}/></button></div>}
      <div className="training-curriculum">{trainingChapters.map((item,i)=><div key={item}><span>0{i+1}</span><h3>{item}</h3><p>{trainingSteps.filter(step=>step.chapter===item).length}개 상황 · 직접 실습</p></div>)}</div>
      <details className="training-scoring-help"><summary>점수와 시간은 어떻게 계산하나요?</summary><p>정확도 최대 90점, 시간 보너스 최대 10점이에요. 정확한 답은 3분 안에 선택·제출하면 시간 보너스 10점, 3분부터 10분 사이에는 점차 줄고 10분 이후에는 0점이에요. 늦어도 정확도 점수는 줄지 않아요. 객관식 오답과 기준 70점 미만 주관식에는 시간 점수가 없어요.</p><p>주관식은 매뉴얼의 항목별 기준으로 Gemini가 0·50·100점을 평가하고 평균을 사용해요. AI를 사용할 수 없으면 핵심 표현을 확인하는 기본 채점으로 전환하고 데모라고 표시해요.</p></details>
      <p className="training-footnote">확인된 공개 교육 요약을 활용한 연습이에요. 상품·가격·화면은 합성 데이터이며 실제 설비·안전·결제 지침은 최신 공식 자료를 확인해 주세요.</p>
    </>}
  </div>;
}
