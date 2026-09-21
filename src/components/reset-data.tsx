'use client';
import { useRef, useState } from 'react';
import { useStore } from '@/data/store-provider';
import { resetTrainingData } from '@/features/training/training-store';
import { UPLOADED_MANUAL_KEY } from '@/features/manual-reference/upload';
export function ResetData() {
  const store = useStore();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [message, setMessage] = useState('');
  if (!store) return null;
  return <div className="reset-section"><div><h2>데모를 처음부터 시작하기</h2><p>이 브라우저의 매뉴얼, 연습, 질문, 업무 기록을 기본값으로 되돌려요.</p></div><button ref={trigger} className="button secondary" onClick={() => dialog.current?.showModal()}>데모 데이터 초기화</button><p className="small-note" role="status">{message}</p>
    <dialog ref={dialog} onClose={() => trigger.current?.focus()} aria-labelledby="reset-title"><h2 id="reset-title">데모 데이터를 초기화할까요?</h2><p>직접 작성한 규칙과 체크리스트, 업로드한 매뉴얼, 연습·테스트·질문 기록이 삭제됩니다. 다른 사이트의 데이터는 바뀌지 않아요.</p><div className="form-actions"><button className="button secondary" autoFocus onClick={() => dialog.current?.close()}>취소</button><button className="button" onClick={() => { const result = store.repo.resetToSeed(); const trainingSaved = resetTrainingData(); let uploadSaved = true; try { localStorage.removeItem(UPLOADED_MANUAL_KEY); } catch { uploadSaved = false; } dialog.current?.close(); setMessage(result.persisted && trainingSaved !== false && uploadSaved ? '기본 가상 매장으로 초기화했어요.' : '현재 화면만 초기화했어요. 브라우저 저장에 실패해 새로고침하면 이전 기록이 나타날 수 있어요.'); }}>초기화하기</button></div></dialog>
  </div>;
}
