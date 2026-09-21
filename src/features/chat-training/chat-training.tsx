'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bot, BookOpen, Check, CircleHelp, LoaderCircle, MessageCircle, RotateCcw, Send, Sparkles, UserRound } from 'lucide-react';
import { CLIENT_REQUEST_TIMEOUT_MS } from '@/ai/timeouts';
import { chatScenarios, getChatScenario } from './scenarios';
import { chatResponseSchema, criterionLabels, MAX_CHAT_TURNS, type ChatAttempt, type ChatScenarioId } from './types';
import { useChatHistory } from './use-chat-history';
import styles from './chat-training.module.css';

export function ChatTraining() {
  const history = useChatHistory();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<'reply' | 'finish' | null>(null);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const scope = useRef(history.scope); scope.current = history.scope;
  const attempt = history.history.find(record => record.id === activeId);
  useEffect(() => { abort.current?.abort(); busy.current = false; setPending(null); setActiveId(null); setDraft(''); setError(''); }, [history.scope]);
  useEffect(() => { if (attempt?.status === 'completed') resultHeading.current?.focus(); }, [attempt?.status]);
  useEffect(() => { if (attempt && attempt.messages.length > 1) end.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' }); }, [attempt?.messages.length]);
  useEffect(() => () => abort.current?.abort(), []);
  if (!history.ready) return <p role="status" className={styles.loading}>응대 연습 기록을 불러오고 있어요…</p>;
  async function start(id: ChatScenarioId) {
    if (busy.current) return;
    const scenario = getChatScenario(id); const at = new Date().toISOString();
    const next: ChatAttempt = { id: crypto.randomUUID(), scenarioId: id, scenarioTitle: scenario.title, createdAt: at, updatedAt: at, status: 'active', messages: [{ id: crypto.randomUUID(), role: 'customer', text: scenario.opening, at }], feedback: null, mode: 'demo', sources: [] };
    busy.current = true;
    if (await history.save(next)) { setActiveId(next.id); setDraft(''); setError(''); }
    busy.current = false;
  }
  async function request(action: 'reply' | 'finish') {
    if (!attempt || busy.current || attempt.status === 'completed' || (action === 'reply' && (!draft.trim() || attempt.messages.filter(message => message.role === 'manager').length >= MAX_CHAT_TURNS))) return;
    const current = attempt; const activeScope = history.scope; const text = draft.trim();
    const messages = action === 'reply' ? [...current.messages, { id: crypto.randomUUID(), role: 'manager' as const, text, at: new Date().toISOString() }] : current.messages;
    if (!messages.some(message => message.role === 'manager')) return;
    busy.current = true; setPending(action); setError('');
    const controller = new AbortController(); abort.current = controller;
    try {
      const response = await fetch('/api/ai/chat-training', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenarioId: current.scenarioId, messages: messages.map(({ role, text: content }) => ({ role, text: content })), action }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(CLIENT_REQUEST_TIMEOUT_MS)]) });
      if (!response.ok) throw new Error('request failed');
      const reply = chatResponseSchema.parse(await response.json());
      if (scope.current !== activeScope) return;
      if (action === 'reply' && !reply.message || action === 'finish' && !reply.feedback) throw new Error('missing response');
      const at = new Date().toISOString();
      const next: ChatAttempt = { ...current, messages: action === 'reply' ? [...messages, { id: crypto.randomUUID(), role: 'customer', text: reply.message!, at }] : messages, status: action === 'finish' ? 'completed' : 'active', feedback: reply.feedback ?? null, mode: reply.mode, sources: reply.sources, updatedAt: at };
      if (await history.save(next)) { if (action === 'reply') setDraft(''); }
    } catch {
      if (scope.current === activeScope) setError(action === 'finish' ? '피드백을 불러오지 못했어요. 대화는 그대로 있어요. 다시 평가해 주세요.' : '고객 답변을 불러오지 못했어요. 작성한 답변은 그대로 있어요. 연결을 확인하고 다시 보내 주세요.');
    } finally {
      if (scope.current === activeScope) { busy.current = false; setPending(null); if (action === 'reply') input.current?.focus(); }
    }
  }
  function leave() { setActiveId(null); setDraft(''); setError(''); }
  const turnCount = attempt?.messages.filter(message => message.role === 'manager').length ?? 0;
  return <div className={styles.page}>
    {history.error && <div role="alert" className={styles.error}><p>{history.error}</p>{history.history.length > 0 && <button className="button secondary" disabled={Boolean(pending)} onClick={() => void history.save(attempt ?? history.history[0])}>기록 저장 다시 시도</button>}</div>}
    {!attempt ? <>
      <header className={styles.header}><div><p className={styles.eyebrow}>말로 해보면 더 익숙해져요</p><h1>AI 고객 응대 연습</h1><p>고객의 말에 직접 답하고,<br/>나만의 응대 피드백을 받아보세요.</p></div><span className={styles.heroIcon}><MessageCircle size={40}/><Sparkles size={18}/></span></header>
      <div className={styles.guide}><Bot size={19}/><span>상황 선택 → 고객과 대화 → 응대 점수·피드백</span></div>
      <div className={styles.scenarios}>{chatScenarios.map(scenario => <button key={scenario.id} className={styles.scenario} onClick={() => void start(scenario.id)}><span className={styles.scenarioEmoji} aria-hidden>{scenario.emoji}</span><span><strong>{scenario.title}</strong><small>{scenario.description}</small><em>{scenario.goal}</em></span><ArrowRight size={19}/></button>)}</div>
      <p className={styles.note}>가상 고객과 최대 {MAX_CHAT_TURNS}번 대화해요. 점수는 연습을 돕는 AI 코칭이며 채용 판단에 사용하지 않아요.</p>
      <section className={styles.history} aria-label="응대 연습 기록"><div className={styles.sectionTitle}><h2>내 응대 기록</h2><span>{history.cloudConnected ? '계정별 기록' : '이 브라우저에 저장'}</span></div>{history.history.length ? history.history.map(record => <button key={record.id} onClick={() => { setActiveId(record.id); setDraft(''); setError(''); }} className={styles.record}><div><strong>{record.scenarioTitle}</strong><small>{new Date(record.updatedAt).toLocaleDateString('ko-KR')} · {record.messages.filter(message => message.role === 'manager').length}회 답변</small></div><span>{record.status === 'completed' ? `${record.feedback?.score}점` : '이어서 하기'}</span><ArrowRight size={17}/></button>) : <p className={styles.empty}>위에서 연습할 상황을 골라 주세요.</p>}</section>
    </> : attempt.status === 'completed' && attempt.feedback ? <>
      <button className={styles.back} onClick={leave}><ArrowLeft size={17}/>상황 선택</button>
      <section className={styles.result}><span className={styles.resultIcon}><Check size={28}/></span><p className={styles.eyebrow}>{attempt.scenarioTitle}</p><h1 ref={resultHeading} tabIndex={-1}>응대 연습을 마쳤어요</h1><div className={styles.score}><strong>{attempt.feedback.score}</strong><span>/ 100점</span></div><span className={styles.mode}>{attempt.mode === 'live' ? 'Gemini 대화 코칭' : '데모 · 표현 기반 점검'}</span><p>{attempt.feedback.summary}</p><div className={styles.rubric}>{attempt.feedback.criteria.map(item => <div key={item.id}><div><strong>{criterionLabels[item.id]}</strong><span>{item.score} / {item.maxScore}</span></div><progress value={item.score} max={item.maxScore}/><p>{item.comment}</p></div>)}</div><div className={styles.feedbackText}><section><h2>잘한 점</h2>{attempt.feedback.strengths.map((text, index) => <p key={index}>{text}</p>)}</section><section><h2>다음엔 이렇게 말해 보세요</h2>{attempt.feedback.improvements.map((text, index) => <p key={index}>{text}</p>)}</section></div><p className={styles.note}>점수는 이 대화에 대한 AI 코칭 추정치예요. 실제 업무 능력이나 채용 적합성을 판단하지 않아요.</p><button className="button" onClick={() => void start(attempt.scenarioId)}><RotateCcw size={16}/>같은 상황 다시 연습</button><Link className={styles.manualLink} href="/crew/questions">매뉴얼에 더 물어보기<ArrowRight size={16}/></Link></section>
      <details className={styles.sources}><summary><BookOpen size={16}/>코칭 근거 · {attempt.sources.length}개</summary>{attempt.sources.map(source => <div key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a><p>{source.excerpt}</p></div>)}</details>
      <details className={styles.review}><summary>내 대화 다시 보기</summary>{attempt.messages.map(message => <p key={message.id}><strong>{message.role === 'manager' ? '나' : '고객'}:</strong> {message.text}</p>)}</details>
    </> : <>
      <div className={styles.topBar}><button className={styles.back} onClick={leave} disabled={Boolean(pending)}><ArrowLeft size={17}/>나가기</button><span>내 답변 {turnCount} / {MAX_CHAT_TURNS}</span></div>
      <header className={styles.conversationHeading}><h1>{attempt.scenarioTitle}</h1><p>{getChatScenario(attempt.scenarioId).goal}</p></header>
      <div className={styles.customerBar}><span><UserRound size={20}/></span><div><strong>연습 고객</strong><small>{pending === 'reply' ? '고객이 답변을 생각하고 있어요…' : turnCount === 0 ? '첫 질문을 기다리고 있어요' : attempt.mode === 'live' ? 'Gemini와 대화 중' : '데모 고객 · 기본 응답'}</small></div><span className={styles.online}/></div>
      <div className={styles.messages} role="log" aria-label="고객과의 대화" aria-live="polite">{attempt.messages.map(message => <div key={message.id} className={message.role === 'manager' ? styles.myMessage : styles.customerMessage}><span>{message.role === 'manager' ? '나 · 스토어 매니저' : '고객'}</span><p>{message.text}</p></div>)}{pending && <div className={styles.pendingBubble} role="status"><LoaderCircle size={17}/>{pending === 'finish' ? '대화를 읽고 코칭을 준비하고 있어요…' : '고객이 답변을 입력하고 있어요…'}</div>}<div ref={end}/></div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {turnCount < MAX_CHAT_TURNS ? <form className={styles.compose} onSubmit={event => { event.preventDefault(); void request('reply'); }}><label htmlFor="customer-reply">고객에게 할 말<textarea ref={input} id="customer-reply" rows={3} maxLength={1200} value={draft} onChange={event => setDraft(event.target.value)} placeholder="실제 고객에게 말하듯 직접 입력해 보세요." disabled={Boolean(pending)} required/></label><div><span>{draft.length} / 1200</span><button className="button" type="submit" disabled={Boolean(pending) || !draft.trim()}><Send size={16}/>{pending === 'reply' ? '답변 보내는 중…' : '답변 보내기'}</button></div></form> : <p className={styles.limit}>대화를 끝까지 연습했어요. 이제 피드백을 확인해 보세요.</p>}
      <button className={styles.finish} onClick={() => void request('finish')} disabled={Boolean(pending) || turnCount === 0}><Sparkles size={17}/>{pending === 'finish' ? '응대 평가 중…' : '대화 마치고 피드백 보기'}<ArrowRight size={16}/></button>
      <details className={styles.hint}><summary><CircleHelp size={15}/>어떻게 연습하나요?</summary><p>고객에게 한 번 이상 답변하면 언제든 마칠 수 있어요. 경청·공감, 사실 확인, 명확한 설명, 후속 대응을 기준으로 대화에 나온 표현을 평가해요.</p><p>가격과 상품은 가상 설정이며 실제 거래는 발생하지 않아요. 모르는 매장 정책은 확인하겠다고 안내해 보세요.</p></details>
    </>}
  </div>;
}
