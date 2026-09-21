'use client';
import { useState } from 'react';
import { Check, ClipboardCheck, Clock3, PackageCheck, ShieldCheck, Tags, CircleHelp, CalendarDays } from 'lucide-react';
import { useStore, StoreLoading } from '@/data/store-provider';
import { checklistDateSchema, checklistStatusSchema, localDateKey } from '@/domain/types';
import { ResetData } from '@/components/reset-data';
import styles from './checklist.module.css';

const itemIcons = [PackageCheck, Clock3, Tags, ShieldCheck];
const statusLabels = { pending: '대기', done: '완료', needs_manager: '경영주 확인 필요' } as const;
function dateLabel(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

export function Checklist() {
  const store = useStore();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState<string[]>([]);
  const today = localDateKey();
  const [selectedDate, setSelectedDate] = useState(today);
  if (!store) return <StoreLoading />;
  const { repo, state } = store;
  const selectedProgress = state.checklistProgress.filter(progress => progress.date === selectedDate);
  const checklistDone = state.checklistItems.filter(item => selectedProgress.find(progress => progress.itemId === item.id)?.status === 'done').length;
  const checklistTotal = state.checklistItems.length;
  const heading = selectedDate === today ? '오늘의 체크리스트' : `${dateLabel(selectedDate)} 체크리스트`;
  return <>
    <div className={`page-heading ${styles.heading}`}><div><p className="eyebrow">하나씩 확인하면 든든해요</p><h1>{heading}</h1><p>날짜를 골라 지난 기록을 확인하거나 오늘의 업무를 표시해 주세요.</p></div><div className={styles.datePicker}><label htmlFor="checklist-date"><CalendarDays size={17} aria-hidden />체크리스트 날짜</label><div><input id="checklist-date" type="date" value={selectedDate} max={today} onChange={event => { const parsed = checklistDateSchema.safeParse(event.target.value); if (parsed.success && parsed.data <= today) { setSelectedDate(parsed.data); setMessage(''); } }} />{selectedDate !== today && <button type="button" className="button secondary" onClick={() => setSelectedDate(today)}>오늘</button>}</div></div></div>
    <section className={styles.progressCard} aria-label={`${heading} 진행 상황`}>
      <div className={styles.progressTop}><div><span className={styles.progressCaption}>{selectedDate === today ? '오늘도 차근차근' : `${dateLabel(selectedDate)} 기록`}</span><p><strong>{checklistDone}</strong><span> / {checklistTotal}개 완료</span></p></div><div className={styles.progressIcon} aria-hidden="true"><ClipboardCheck size={42} strokeWidth={1.8} /><span><Check size={15} strokeWidth={3} /></span></div></div>
      <progress value={checklistDone} max={Math.max(1, checklistTotal)} aria-label="업무 완료 현황" />
      <span className={styles.progressHint}>{checklistTotal > 0 && checklistDone === checklistTotal ? `${selectedDate === today ? '오늘' : '선택한 날짜'}의 확인을 모두 마쳤어요!` : '확인을 마치면 아래에서 완료로 바꿔 주세요.'}</span>
    </section>
    <p role="status" className={`save-message ${styles.saveMessage}`}>{message}</p>
    <div className={`checklist-items ${styles.items}`}>{state.checklistItems.map((item, index) => {
      const status = selectedProgress.find(progress => progress.itemId === item.id)?.status ?? 'pending';
      const Icon = itemIcons[index % itemIcons.length];
      return <article key={item.id} className={`checklist-row status-${status} ${styles.item} ${styles[status]}`}>
        <div className={styles.itemIcon} aria-hidden="true">{status === 'done' ? <Check size={28} strokeWidth={2.3} /> : <Icon size={27} strokeWidth={1.8} />}</div>
        <div className={styles.copy}><div className={styles.itemMeta}><span className={styles.category}>{item.category}</span><span className={styles.badge}>{status === 'done' ? <Check size={12} aria-hidden /> : status === 'needs_manager' ? <CircleHelp size={12} aria-hidden /> : <Clock3 size={12} aria-hidden />}{statusLabels[status]}</span></div><h2>{item.title}</h2><p>{item.description}</p></div>
        <label className={`status-control ${styles.statusControl}`} htmlFor={`status-${item.id}`}><span className="sr-only">{item.title} 상태</span><select id={`status-${item.id}`} value={status} disabled={saving.includes(item.id)} onChange={async event => { const nextStatus = checklistStatusSchema.parse(event.target.value); setSaving(current => [...current, item.id]); try { const result = await repo.setChecklistStatus(item.id, nextStatus, selectedDate); setMessage(result.persisted ? `${dateLabel(selectedDate)} 업무 상태를 저장했어요.` : '브라우저에 저장하지 못했어요. 현재 화면에서만 임시로 적용돼요.'); } catch { setMessage('저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.'); } finally { setSaving(current => current.filter(id => id !== item.id)); } }}><option value="pending">대기</option><option value="done">완료</option><option value="needs_manager">경영주 확인 필요</option></select></label>
      </article>;
    })}</div>
    {!state.checklistItems.length && <div className="empty-state"><h2>등록된 업무가 없어요</h2><p>경영주의 체크리스트 설정에서 추가해 주세요.</p></div>}
    <ResetData />
  </>;
}
