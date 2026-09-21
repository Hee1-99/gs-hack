'use client';
import Link from 'next/link';
import { useAuth } from './auth-provider';
export function AccountMenu(){const auth=useAuth();return <>{auth.ready && !auth.error && (!auth.user || auth.membership?.role === 'owner') && <Link href="/manager/dashboard">경영주 관리</Link>}<Link href="/login">{!auth.ready?'계정 확인 중':auth.user?'내 계정':'로그인'}</Link></>;}
export function OwnerGate({children}:{children:React.ReactNode}){const auth=useAuth();if(!auth.ready)return <p className="loading" role="status">계정을 확인하고 있어요…</p>;if(auth.error || (auth.user&&!auth.membership))return <section className="panel"><h1>매장 연결을 확인해 주세요</h1><p>{auth.error||'로그인한 계정에 연결된 매장이 없어요.'}</p><Link href="/login" className="button">계정과 매장 확인</Link></section>;if(auth.user&&auth.membership?.role!=='owner')return <section className="panel"><h1>경영주 전용 화면이에요</h1><p>스토어 매니저는 내 연습과 체크리스트를 이용할 수 있어요.</p><Link href="/crew/simulation" className="button">내 연습으로 가기</Link></section>;return <>{children}</>;}

export function AccountBoundary({children}:{children:React.ReactNode}) { const auth=useAuth(); if(!auth.ready)return <p className="loading" role="status">계정을 확인하고 있어요…</p>; if(auth.error || (auth.user&&!auth.membership))return <section className="panel"><h1>계정과 매장을 확인해 주세요</h1><p>{auth.error || "기록을 저장할 매장을 연결해 주세요."}</p><Link className="button" href="/login">계정과 매장 확인</Link></section>; return <>{children}</>; }
