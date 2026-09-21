'use client';
import { useRef, useState } from 'react';
import { useStore, StoreLoading } from '@/data/store-provider';
import type { AnswerIntent, SimulationSession } from '@/domain/types';
import { requestSimulationAi } from '@/ai/client';
import { completeSession, recordEvent, startSession } from './engine';
import { VirtualPos } from './virtual-pos';
import { FeedbackPanel } from './feedback-panel';

export function SimulationShell() {
  const store = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [error, setError] = useState('');
  const [retryRole, setRetryRole] = useState<'customer' | 'coach' | null>(null);
  const [intent, setIntent] = useState<AnswerIntent>('apply');
  const [total, setTotal] = useState('');
  const [answer, setAnswer] = useState('');
  if (!store) return <StoreLoading/>;
  const { repo, state } = store;
  const session = state.sessions.find(item => item.id === activeId) ?? state.sessions.at(-1);

  async function fetchReply(role: 'customer' | 'coach', input: SimulationSession) {
    pendingRef.current = true; setPending(true); setError(''); setRetryRole(null);
    try {
      const reply = await requestSimulationAi(role, input);
      const current = repo.getSnapshot().sessions.find(item => item.id === input.id);
      if (!current) return;
      if (role === 'customer') repo.saveSession({ ...current, customerMode: reply.mode, events: current.events.map((event, index) => index === 0 && event.type === 'customer' ? { ...event, text: reply.content } : event) });
      else repo.saveSession({ ...current, coaching: reply });
    } catch { setError('응답을 불러오지 못했어요. 연습 기록은 유지되며 기본 안내로 계속할 수 있어요.'); setRetryRole(role); }
    finally { pendingRef.current = false; setPending(false); }
  }
  function start(variant = false, previousId: string | null = null) {
    if (pendingRef.current) return;
    const latest = repo.getSnapshot();
    const next = startSession(latest.scenarios[variant ? 1 : 0], latest, previousId);
    repo.saveSession(next); setActiveId(next.id); setIntent('apply'); setTotal(''); setAnswer('');
    void fetchReply('customer', next);
  }
  return <><div className="page-heading"><p className="eyebrow">PRACTICE BEFORE YOUR SHIFT</p><h1>고객 응대 연습</h1><p>확인하고 안내하는 순서를, 실수해도 괜찮은 곳에서.</p></div>
    {!session ? <section className="training-start"><div><span className="pill">첫 번째 상황</span><h2>행사 중인 상품을 물어본다면?</h2><p>가상 고객의 질문에 답하고, 필요한 순간 POS를 조회해요.</p><button className="button" onClick={() => start()}>연습 시작</button></div></section> : <>
      <div className="session-meta"><span className="pill">{session.scenario.title}</span><span className="small-note">시작 시 매뉴얼 {session.snapshot.rules.filter(rule => session.scenario.ruleIds.includes(rule.id)).map(rule => `v${rule.version}`).join(', ')} 적용</span></div>
      {pending && <p role="status" className="inline-note">응답을 준비하고 있어요…</p>}
      {error && <div role="alert" className="error-message"><p>{error}</p>{retryRole && <button className="button secondary" disabled={pending} onClick={() => void fetchReply(retryRole, session)}>응답 다시 불러오기</button>}</div>}
      {session.status === 'completed' ? <FeedbackPanel session={session} previous={state.sessions.find(item => item.id === session.previousAttemptId)} pending={pending} onRetry={variant => start(variant, session.id)}/> : <div className="simulation-grid"><section className="panel conversation" aria-labelledby="conversation-title"><div className="form-heading"><h2 id="conversation-title">고객과의 대화</h2><span className="pill">{session.customerMode === 'demo' ? '데모 모드' : 'Gemini 표현'}</span></div><div className="customer-bubble"><span>가상 고객</span><p className="preserve-lines">{session.events.find(event => event.type === 'customer')?.text}</p></div>
        <form aria-label="고객 응대 답변" onSubmit={event => {
          event.preventDefault(); if (pendingRef.current || !answer.trim()) return;
          const current = repo.getSnapshot().sessions.find(item => item.id === session.id);
          if (!current || current.status === 'completed') return;
          const amount = intent === 'check_manager' ? null : Number(total);
          if (amount !== null && (!total.trim() || !Number.isSafeInteger(amount) || amount < 0)) { setError('안내할 총액을 0 이상의 숫자로 입력해 주세요.'); return; }
          const completed = completeSession(recordEvent(current, { type: 'answer', intent, total: amount, text: answer.trim() }));
          repo.saveSession(completed); void fetchReply('coach', completed);
        }}><label htmlFor="answer-intent">안내할 내용<select id="answer-intent" value={intent} onChange={event => setIntent(event.target.value as AnswerIntent)} disabled={pending}><option value="apply">행사 적용 안내</option><option value="not_apply">행사 미적용 안내</option><option value="check_manager">경영주에게 확인 후 안내</option></select></label>{intent !== 'check_manager' && <label htmlFor="answer-total">안내할 총액<input id="answer-total" inputMode="numeric" type="number" min="0" step="1" value={total} onChange={event => setTotal(event.target.value)} required disabled={pending} placeholder="원 단위로 입력"/></label>}<label htmlFor="answer-text">고객에게 할 말<textarea id="answer-text" value={answer} onChange={event => setAnswer(event.target.value)} required maxLength={500} rows={3} disabled={pending} placeholder="고객에게 어떻게 설명할지 적어 보세요."/></label><p className="small-note">선택한 안내 내용과 총액으로 판정해요. 자유롭게 쓴 말투는 점수로 평가하지 않아요.</p><div className="form-actions"><button className="button" disabled={pending || !answer.trim()} type="submit">답변하고 결과 보기</button><button className="button secondary" type="button" disabled={pending || session.events.some(event => event.type === 'manager_confirmation')} onClick={() => { const current = repo.getSnapshot().sessions.find(item => item.id === session.id); if (current) repo.saveSession(recordEvent(current, { type: 'manager_confirmation' })); }}>경영주 확인 요청</button></div></form>
        <div className="action-log"><h3>이번 연습의 행동 기록</h3><ol>{session.events.map(event => <li key={event.id}>{event.type === 'customer' ? '고객 질문 듣기' : event.type === 'pos_lookup' ? `${session.snapshot.products.find(product => product.id === event.productId)?.name} POS 조회` : event.type === 'manager_confirmation' ? '경영주 확인 요청함' : '고객에게 답변함'}</li>)}</ol></div>
      </section><VirtualPos key={session.id} snapshot={session.snapshot} disabled={pending} onLookup={productId => { const current = repo.getSnapshot().sessions.find(item => item.id === session.id); if (current) repo.saveSession(recordEvent(current, { type: 'pos_lookup', productId })); }}/></div>}
    </>}
  </>;
}
