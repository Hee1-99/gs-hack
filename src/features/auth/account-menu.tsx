'use client';
import Link from 'next/link';
import { Award, ChartColumn, CircleUserRound, ClipboardCheck, ListChecks, LockKeyhole, MessageSquareText } from 'lucide-react';
import { useAuth } from './auth-provider';
import styles from './account-menu.module.css';

function SignedOutOwnerPreview() {
  const tabs = [
    { label: '교육 현황', icon: ChartColumn },
    { label: '질문 내역', icon: MessageSquareText },
    { label: '체크리스트 설정', icon: ClipboardCheck },
    { label: '내 계정', icon: CircleUserRound },
  ];
  return <div className={styles.signedOut}>
    <div className={styles.preview} data-testid="owner-preview" aria-hidden="true" inert>
      <div className={styles.previewBar}><strong>경영주 페이지</strong><span>시작 화면</span></div>
      <div className={styles.previewTabs}>{tabs.map(({ label, icon: Icon }, index) => <span key={label} className={index === 0 ? styles.activeTab : undefined}><Icon size={17}/>{label}</span>)}</div>
      <div className={styles.previewHeading}><div><p>경영주</p><h2>매장 교육 현황</h2><span>소속 스토어 매니저의 연습과 업무 현황을 한눈에 확인해요.</span></div><span className={styles.accountButton}>내 계정</span></div>
      <div className={styles.previewActions}><div><MessageSquareText size={19}/><span><strong>질문 내역</strong><small>스토어 매니저가 물어본 내용</small></span></div><div><ListChecks size={19}/><span><strong>체크리스트 만들기</strong><small>매장 업무 항목 설정</small></span></div></div>
      <dl className={styles.previewStats}>
        <div><dt><ClipboardCheck size={18}/>완료한 연습·테스트</dt><dd>—</dd></div>
        <div><dt><Award size={18}/>평균 점수</dt><dd>—</dd></div>
        <div><dt><ListChecks size={18}/>구인 테스트</dt><dd>—</dd></div>
        <div><dt><MessageSquareText size={18}/>AI 대화 연습</dt><dd>—</dd></div>
      </dl>
      <section className={styles.previewSection}><div><h3>체크리스트 완료 현황</h3><span>날짜별 완료 여부를 확인해요.</span></div><div className={styles.previewRows}><i/><i/></div></section>
      <section className={styles.previewSection}><div><h3>최근 기록</h3><span>연습과 테스트 결과가 여기에 쌓여요.</span></div><div className={styles.previewRecord}><i/><span/><strong>—</strong></div></section>
    </div>
    <section className={styles.prompt} aria-labelledby="owner-login-title">
      <span className={styles.lockIcon}><LockKeyhole size={24} aria-hidden/></span>
      <p>경영주 전용</p>
      <h1 id="owner-login-title">경영주로 로그인하여 확인해 보세요</h1>
      <span>로그인 후 소속 스토어 매니저의 기록과 체크리스트를 안전하게 확인할 수 있어요.</span>
      <Link href="/login" className="button">경영주로 로그인</Link>
    </section>
  </div>;
}

export function AccountMenu(){const auth=useAuth();return <>{auth.ready && !auth.error && (!auth.user || auth.membership?.role === 'owner') && <Link href="/manager/dashboard">경영주 페이지</Link>}<Link href="/login">{!auth.ready?'계정 확인 중':auth.user?'내 계정':'로그인'}</Link></>;}
export function OwnerGate({children}:{children:React.ReactNode}){const auth=useAuth();if(!auth.ready)return <p className="loading" role="status">계정을 확인하고 있어요…</p>;if(auth.error || (auth.user&&!auth.membership))return <section className="panel"><h1>매장 연결을 확인해 주세요</h1><p>{auth.error||'로그인한 계정에 연결된 매장이 없어요.'}</p><Link href="/login" className="button">계정과 매장 확인</Link></section>;if(!auth.user)return <SignedOutOwnerPreview/>;if(auth.membership?.role!=='owner')return <section className="panel"><h1>경영주 전용 화면이에요</h1><p>스토어 매니저는 내 연습과 체크리스트를 이용할 수 있어요.</p><Link href="/crew/simulation" className="button">내 연습으로 가기</Link></section>;return <>{children}</>;}

export function AccountBoundary({children}:{children:React.ReactNode}) { const auth=useAuth(); if(!auth.ready)return <p className="loading" role="status">계정을 확인하고 있어요…</p>; if(auth.error || (auth.user&&!auth.membership))return <section className="panel"><h1>계정과 매장을 확인해 주세요</h1><p>{auth.error || "기록을 저장할 매장을 연결해 주세요."}</p><Link className="button" href="/login">계정과 매장 확인</Link></section>; return <>{children}</>; }
