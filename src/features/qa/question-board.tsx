'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, BookOpen, CircleHelp, Upload, FileText, MessagesSquare, Check } from 'lucide-react';
import { useStore, StoreLoading } from '@/data/store-provider';
import { questionSchema } from '@/domain/types';
import { CLIENT_REQUEST_TIMEOUT_MS } from '@/ai/timeouts';
import { MAX_UPLOAD_BYTES, UPLOADED_MANUAL_KEY, type UploadedManual } from '@/features/manual-reference/upload';
import styles from './question-board.module.css';
import { questionExamples } from './faq';
import { useAuth } from '@/features/auth/auth-provider';
export function QuestionBoard() {
  const store = useStore();
  const auth = useAuth();
  const uploadScope = auth.user ? `${auth.membership?.store_id ?? 'unassigned'}:${auth.user.id}` : 'guest';
  const uploadKey = uploadScope === 'guest' ? UPLOADED_MANUAL_KEY : `${UPLOADED_MANUAL_KEY}:${uploadScope}`;
  const currentScope = useRef(uploadScope); currentScope.current = uploadScope;
  const [question, setQuestion] = useState('');
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [error, setError] = useState('');
  const [manual, setManual] = useState<UploadedManual | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [exampleCategory, setExampleCategory] = useState(0);
  useEffect(() => {
    setManual(null); setUploadMessage(''); setQuestion(''); setError(''); setPending(false); pendingRef.current = false;
    try {
      const raw = localStorage.getItem(uploadKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.name === 'string' && typeof saved.text === 'string' && saved.text.trim() && new TextEncoder().encode(saved.text).length <= MAX_UPLOAD_BYTES) setManual(saved);
    } catch { setUploadMessage('저장한 매뉴얼을 불러오지 못했어요. 다시 업로드해 주세요.'); }
  }, [uploadKey]);
  if (!store) return <StoreLoading/>;
  const { repo, state } = store;
  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pendingRef.current) return;
    setQuestion(text); setPending(true); pendingRef.current = true; setError('');
    const generation = repo.getResetGeneration();
    const requestScope = uploadScope;
    try {
      const rules = repo.listRules();
      const response = await fetch('/api/ai/qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: trimmed, rules, ...(manual ? { manual } : {}) }), signal: AbortSignal.timeout(CLIENT_REQUEST_TIMEOUT_MS) });
      if (!response.ok) throw new Error('request failed');
      const log = questionSchema.parse(await response.json());
      if (generation !== repo.getResetGeneration() || requestScope !== currentScope.current) return;
      await repo.saveQuestion(log); setQuestion('');
    } catch { if (requestScope === currentScope.current) setError('답변을 불러오지 못했어요. 질문은 그대로 남아 있어요. 연결을 확인하고 다시 질문해 주세요.'); }
    finally { if (requestScope === currentScope.current) { setPending(false); pendingRef.current = false; } }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!/\.(md|txt)$/i.test(file.name) || file.size > MAX_UPLOAD_BYTES) { setUploadMessage('20KB 이하의 .md 또는 .txt 파일을 선택해 주세요. PDF·HWP는 텍스트로 내보낸 뒤 올려 주세요.'); return; }
    const fileScope = uploadScope;
    try {
      const text = (await file.text()).trim();
      if (fileScope !== currentScope.current) return;
      if (!text || new TextEncoder().encode(text).length > MAX_UPLOAD_BYTES || text.includes('\u0000')) throw new Error('invalid');
      const next = { name: file.name.slice(0, 100), text };
      localStorage.setItem(uploadKey, JSON.stringify(next));
      setManual(next); setUploadMessage('업로드한 매뉴얼을 다음 질문부터 사용해요.');
    } catch { setUploadMessage('파일을 읽거나 저장하지 못했어요. UTF-8 텍스트와 브라우저 저장 공간을 확인해 주세요.'); }
  }
  function removeManual() {
    try { localStorage.removeItem(uploadKey); setManual(null); setUploadMessage('기본 교육 매뉴얼로 돌아왔어요.'); }
    catch { setUploadMessage('매뉴얼을 삭제하지 못했어요. 브라우저 저장 공간을 확인해 주세요.'); }
  }
  return <div className={styles.board}><header className={styles.header}><div className="page-heading"><p className="eyebrow">성실한 선배 매니저와 함께</p><h1>매장 Q&A</h1><p>업무도, 첫 근무의 작은 고민도 물어보세요.<br/>근거가 있는 답변과 일반 안내를 구분해 드려요.</p></div><div className={styles.headerIllustration} aria-hidden><MessagesSquare size={43} strokeWidth={1.8}/><span><Check size={18} strokeWidth={3}/></span></div></header>
    <div className="inline-note manual-active-source"><FileText size={16} aria-hidden/><span>{manual ? manual.name : 'GS25 공개 교육 요약 · 58개 자료'}</span><span className={styles.sourceTag}>사용 중</span></div>
    <section className="question-compose panel" aria-labelledby="question-heading"><div className="form-heading"><h2 id="question-heading">지금 무엇이 궁금하세요?</h2><CircleHelp size={22} aria-hidden/></div><form onSubmit={event => { event.preventDefault(); void ask(question); }}><label htmlFor="question">매장에 궁금한 점<textarea id="question" value={question} onChange={event => setQuestion(event.target.value)} disabled={pending} maxLength={500} required rows={3} placeholder="예: 첫 출근인데 무엇부터 준비하면 좋을까요?"/></label><div className="form-actions"><button className="button" disabled={pending || !question.trim()} type="submit"><Send size={16} aria-hidden/>{pending ? '규칙 확인 중…' : '질문하기'}</button><span className="small-note">실제 점포 정책은 확인하고, 일반적인 고민도 함께 풀어요.</span></div></form>
    {!manual && <div className="faq"><div className={styles.exampleTabs} aria-label="추천 질문 분야">{questionExamples.map((group, index) => <button key={group.category} className={index === exampleCategory ? styles.exampleActive : ''} aria-pressed={index === exampleCategory} onClick={() => setExampleCategory(index)}>{group.category}</button>)}</div><div>{questionExamples[exampleCategory].questions.map(title => <button className="faq-button" key={title} onClick={() => void ask(title)} disabled={pending}>{title}</button>)}</div></div>}
    {!manual && <details className="manual-extra"><summary>매장 추가 규칙 · {state.rules.length}개</summary><div className="faq">{state.rules.map(rule => <button className="faq-button" key={rule.id} onClick={() => void ask(rule.title)} disabled={pending}>{rule.title}</button>)}</div></details>}</section>
    <details className="panel manual-upload"><summary><Upload size={17} aria-hidden/> 매뉴얼 업로드 · 자료 안내</summary><p className="small-note">기본 자료는 제공된 GS25 교육맵의 확인된 영상 요약 58개예요. 본문 미확보 20개는 답변에 사용하지 않아요. 최신 점포 지침은 별도 확인이 필요해요.</p><label htmlFor="manual-upload">내 매뉴얼 선택 (.md / .txt, 최대 20KB)<input id="manual-upload" type="file" accept=".md,.txt,text/plain,text/markdown" disabled={pending} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }}/></label><p className="small-note">파일은 이 브라우저에 저장되며 질문할 때 서버와 Gemini로 전달돼요. 개인정보나 비밀 정보는 올리지 마세요. 업로드 시 기본 자료 대신 내 매뉴얼에서 찾아요.</p>{manual && <button className="button secondary" onClick={removeManual} disabled={pending}>기본 매뉴얼로 돌아가기</button>}{uploadMessage && <p role="status">{uploadMessage}</p>}</details>
    {pending && <p role="status" className={`inline-note ${styles.thinking}`}><span aria-hidden>•••</span>매뉴얼과 질문을 살펴보고 답변을 준비하고 있어요…</p>}{error && <p role="alert" className="error-message">{error}</p>}
    <section className="question-history" aria-labelledby="history-heading"><div className="section-heading"><h2 id="history-heading">질문 기록</h2><span className="small-note">{state.questions.length}개의 질문</span></div>{!state.questions.length ? <div className="empty-state"><div className={styles.emptyIcon}><MessagesSquare size={29} aria-hidden/></div><h3>아직 질문이 없어요</h3><p>질문을 적거나 위의 업무 버튼을 눌러 보세요.</p></div> : [...state.questions].reverse().map(log => <article className="question-entry" key={log.id} data-testid="question-log"><div className="question-entry-heading"><h3>{log.question}</h3><span className={`pill ${log.status === 'unresolved' ? 'warning-pill' : ''}`}>{log.status === 'unresolved' ? '경영주 확인 필요' : log.answerKind === 'general' ? '일반 AI 안내' : '매뉴얼 근거 있음'}</span></div><p className="preserve-lines">{log.answer}</p>{!!log.sources?.length && <details className="answer-evidence"><summary>답변 근거 · {log.sources.length}개</summary>{log.sources.map(source => <div key={source.id}><strong>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a> : source.title}</strong><p className="small-note">{source.status}</p><p>{source.excerpt}</p></div>)}</details>}<div className="source-list">{log.rules.map(rule => <span key={rule.id}><BookOpen size={14} aria-hidden/>{rule.title} · v{rule.version}</span>)}<span className="small-note">{log.mode === 'demo' ? '데모 모드 · 기본 안내' : log.answerKind === 'manual' || !log.answerKind ? 'Gemini · 매뉴얼 기반 답변' : 'Gemini · 일반 AI 안내'}</span><time className="small-note" dateTime={log.createdAt}>{new Date(log.createdAt).toLocaleString('ko-KR')}</time></div></article>)}</section>
  </div>;
}
