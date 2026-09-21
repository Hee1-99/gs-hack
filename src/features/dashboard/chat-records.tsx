'use client';
import { useEffect, useState } from 'react';
import { MessageCircleMore, ChevronDown } from 'lucide-react';
import { CHAT_STORAGE_KEY, CHAT_UPDATED_EVENT, parseChatHistory, criterionLabels, type ChatAttempt } from '@/features/chat-training/types';
import styles from './dashboard.module.css';

export function useGuestChatRecords(enabled: boolean) {
  const [records, setRecords] = useState<ChatAttempt[]>([]);
  useEffect(() => {
    if (!enabled) return;
    const update = () => { try { setRecords(parseChatHistory(localStorage.getItem(CHAT_STORAGE_KEY))); } catch { setRecords([]); } };
    update(); window.addEventListener(CHAT_UPDATED_EVENT, update); window.addEventListener('storage', update);
    return () => { window.removeEventListener(CHAT_UPDATED_EVENT, update); window.removeEventListener('storage', update); };
  }, [enabled]);
  return enabled ? records : [];
}

export function ChatRecords({ records }: { records: (ChatAttempt & { displayName?: string })[] }) {
  return <section className={styles.chatRecords} aria-labelledby="chat-records-title"><div className={styles.recordsHeading}><h2 id="chat-records-title">AI 고객 대화 기록</h2><span className="small-note">{records.filter(record => record.status === 'completed').length}회 완료</span></div>
    {!records.length ? <p className={styles.chatEmpty}><MessageCircleMore size={21} aria-hidden/>AI 손님과 연습한 대화와 피드백이 여기에 모여요.</p> : <div className={styles.records}>{records.map(record => <details key={record.id} className={styles.record}><summary><span className={styles.avatar} aria-hidden><MessageCircleMore size={19}/></span><span className={styles.recordIdentity}><strong>{record.displayName && `${record.displayName} · `}{record.scenarioTitle}</strong><span>{record.mode === 'live' ? 'Gemini' : '데모'} · <time dateTime={record.createdAt}>{new Date(record.createdAt).toLocaleString('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time></span></span><span className={styles.score}>{record.feedback ? <><strong>{record.feedback.score}</strong><span>점</span></> : <span className={styles.inProgress}>연습 중</span>}</span><ChevronDown size={18} aria-hidden/></summary><div className={styles.resultBody}>{record.feedback && <><p className={styles.resultLabel}>{record.feedback.summary}</p><div className={styles.chatCriteria}>{record.feedback.criteria.map(item => <div key={item.id}><span>{criterionLabels[item.id]}</span><strong>{item.score}<small> / 25</small></strong><p>{item.comment}</p></div>)}</div></>}<ol className={styles.transcript}>{record.messages.map(message => <li key={message.id}><strong>{message.role === 'manager' ? '스토어 매니저' : 'AI 손님'}</strong><p>{message.text}</p></li>)}</ol><p className="small-note">대화 점수는 AI의 학습 피드백이며 업무 퀴즈 점수와 별도로 확인해요.</p></div></details>)}</div>}
  </section>;
}
