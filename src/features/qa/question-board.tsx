'use client';
import { useRef, useState } from 'react';
import { Send, BookOpen, CircleHelp } from 'lucide-react';
import { useStore, StoreLoading } from '@/data/store-provider';
import { questionSchema } from '@/domain/types';
import { CLIENT_REQUEST_TIMEOUT_MS } from '@/ai/timeouts';
export function QuestionBoard() {
  const store = useStore();
  const [question, setQuestion] = useState('');
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [error, setError] = useState('');
  if (!store) return <StoreLoading/>;
  const { repo, state } = store;
  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pendingRef.current) return;
    setQuestion(text); setPending(true); pendingRef.current = true; setError('');
    const generation = repo.getResetGeneration();
    try {
      const rules = repo.listRules();
      const response = await fetch('/api/ai/qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: trimmed, rules }), signal: AbortSignal.timeout(CLIENT_REQUEST_TIMEOUT_MS) });
      if (!response.ok) throw new Error('request failed');
      const log = questionSchema.parse(await response.json());
      if (generation !== repo.getResetGeneration()) return;
      repo.saveQuestion(log); setQuestion('');
    } catch { setError('답변을 불러오지 못했어요. 질문은 그대로 남아 있어요. 연결을 확인하고 다시 질문해 주세요.'); }
    finally { setPending(false); pendingRef.current = false; }
  }
  return <><div className="page-heading"><p className="eyebrow">A LITTLE HELP, RIGHT HERE</p><h1>매장 Q&A</h1><p>우리 매장 규칙에서 찾아보고, 모르는 건 경영주에게 확인해요.</p></div>
    <section className="question-compose panel" aria-labelledby="question-heading"><div className="form-heading"><h2 id="question-heading">지금 무엇이 궁금하세요?</h2><CircleHelp size={22} aria-hidden/></div><form onSubmit={event => { event.preventDefault(); void ask(question); }}><label htmlFor="question">매장에 궁금한 점<textarea id="question" value={question} onChange={event => setQuestion(event.target.value)} disabled={pending} maxLength={500} required rows={3} placeholder="예: 행사 문의는 어떻게 안내하나요?"/></label><div className="form-actions"><button className="button" disabled={pending || !question.trim()} type="submit"><Send size={16} aria-hidden/>{pending ? '규칙 확인 중…' : '질문하기'}</button><span className="small-note">매뉴얼에 없는 내용은 추측하지 않아요.</span></div></form>
    <div className="faq"><span className="small-note">바로 확인하기</span><div>{state.rules.map(rule => <button className="faq-button" key={rule.id} onClick={() => void ask(rule.title)} disabled={pending}>{rule.title}</button>)}</div></div></section>
    {pending && <p role="status" className="inline-note">저장된 규칙에서 답변을 찾고 있어요…</p>}{error && <p role="alert" className="error-message">{error}</p>}
    <section className="question-history" aria-labelledby="history-heading"><div className="section-heading"><h2 id="history-heading">질문 기록</h2><span className="small-note">{state.questions.length}개의 질문</span></div>{!state.questions.length ? <div className="empty-state"><BookOpen size={28} aria-hidden/><h3>아직 질문이 없어요</h3><p>궁금한 점을 적거나 위의 매장 규칙을 눌러 보세요.</p></div> : [...state.questions].reverse().map(log => <article className="question-entry" key={log.id} data-testid="question-log"><div className="question-entry-heading"><h3>{log.question}</h3><span className={`pill ${log.status === 'unresolved' ? 'warning-pill' : ''}`}>{log.status === 'unresolved' ? '경영주 확인 필요' : '매뉴얼 근거 있음'}</span></div><p className="preserve-lines">{log.answer}</p><div className="source-list">{log.rules.map(rule => <span key={rule.id}><BookOpen size={14} aria-hidden/>{rule.title} · v{rule.version}</span>)}<span className="small-note">{log.mode === 'demo' ? '데모 모드' : 'Gemini 표현'}</span><time className="small-note" dateTime={log.createdAt}>{new Date(log.createdAt).toLocaleString('ko-KR')}</time></div></article>)}</section>
  </>;
}
