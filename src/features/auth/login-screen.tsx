'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './auth-provider';
import { createSeed } from '@/domain/seed';
import { readSupabaseConfig } from '@/lib/supabase/config';
import { cloudError } from '@/lib/supabase/cloud';
import styles from './auth.module.css';
import { credentialError } from './credential-error';

export function LoginScreen() {
 const auth=useAuth();
 const [mode,setMode]=useState<'login'|'signup'>('login');
 const [role,setRole]=useState<'crew'|'owner'>('crew');
 const [pending,setPending]=useState(false);
 const [message,setMessage]=useState('');
 const [invite,setInvite]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 async function credentials(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!auth.client||pending)return;setPending(true);setMessage('');
  const form=new FormData(event.currentTarget);const username=String(form.get('username')??'').trim().toLowerCase();const password=String(form.get('password')??'');
  if(!/^[a-z0-9_]{4,24}$/.test(username)){setMessage('아이디는 영문, 숫자, 밑줄(_)로 4~24자 입력해 주세요.');setPending(false);return;}
  if(mode==='signup'&&password!==String(form.get('passwordConfirm')??'')){setMessage('비밀번호가 서로 달라요. 다시 확인해 주세요.');setPending(false);return;}
  const email=`${username}@id.gstep.invalid`;
  try{
   if(mode==='signup'){
    const config=readSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if(!config){setMessage('회원가입 연결 설정을 확인해 주세요.');return;}
    // A reserved internal address must never trigger a confirmation message.
    const response=await fetch(`${config.url}/auth/v1/settings`,{headers:{apikey:config.key},cache:'no-store',signal:AbortSignal.timeout(8000)});
    if(!response.ok)throw new Error('settings unavailable');
    const settings=await response.json();
    if(settings.mailer_autoconfirm!==true){setMessage('회원가입 준비 중이에요. 운영자가 이메일 확인을 꺼야 아이디로 바로 가입할 수 있어요.');return;}
    if(settings.disable_signup===true||settings.external?.email===false){setMessage('지금은 새 계정을 만들 수 없어요. 운영자에게 가입 설정을 확인해 주세요.');return;}
   }
   const result=mode==='signup'?await auth.client.auth.signUp({email,password}):await auth.client.auth.signInWithPassword({email,password});
   if(result.error){setMessage(credentialError(result.error,mode));return;}
   if(mode==='signup'&&!result.data.session)setMessage('바로 로그인하지 못했어요. 운영자에게 계정 인증 설정을 확인해 주세요.');
   else {setMode('login');setShowPassword(false);await auth.refreshMembership();}
  }catch{setMessage('연결하지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.');}finally{setPending(false);}
 }
 async function connect(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!auth.client||pending)return;setPending(true);setMessage('');const form=new FormData(event.currentTarget);
  try{const seed=createSeed();const {error}=role==='owner'?await auth.client.rpc('gstep_create_store',{store_name:String(form.get('storeName')??'').trim(),display_name:String(form.get('displayName')??'').trim(),initial_rules:seed.rules,initial_checklist:seed.checklistItems}):await auth.client.rpc('gstep_join_store',{invite_token:String(form.get('invite')??'').trim(),display_name:String(form.get('displayName')??'').trim()});if(error){setMessage(error.code==='22023'?'초대 코드가 없거나 만료됐어요. 경영주에게 새 코드를 요청해 주세요.':cloudError(error));return;}await auth.refreshMembership();}catch(cause){setMessage(cloudError(cause));}finally{setPending(false);}
 }
 if(!auth.ready)return <p className="loading" role="status">계정을 확인하고 있어요…</p>;
 return <div className={`container ${styles.page}`}><div className="page-heading"><p className="eyebrow">나의 연습을 이어서</p><h1>{auth.user?'내 계정과 매장':mode==='signup'?'회원가입':'로그인'}</h1><p>매장을 연결하면 연습 기록과 체크리스트를 함께 확인해요.</p></div>
 {auth.error&&!auth.user&&<div role="alert" className="error-message">{auth.error}<button className="button secondary" onClick={()=>void auth.refreshMembership()}>다시 연결하기</button></div>}
 {!auth.configured?<section className={`panel ${styles.card}`}><h2>지금은 체험 모드예요</h2><p>로그인 서버 연결을 준비 중이에요. 현재 연습 기록은 이 브라우저에만 저장돼요.</p><Link href="/crew/simulation" className="button">로그인 없이 연습하기</Link><p className="small-note">운영자가 Supabase 연결과 데이터베이스 구성을 완료하면 아이디 로그인을 사용할 수 있어요.</p></section>:auth.user?<section className={`panel ${styles.card}`}><p className={styles.accountId}>{auth.user.email?.endsWith('@id.gstep.invalid')?`아이디 ${auth.user.email.slice(0,-'@id.gstep.invalid'.length)}`:'연결된 계정'}</p>{auth.error?<div role="alert" className="error-message">{auth.error}<button className="button secondary" onClick={()=>void auth.refreshMembership()}>다시 연결하기</button></div>:auth.membership?<><span className="pill">{auth.membership.role==='owner'?'경영주':'스토어 매니저'}</span><h2>{auth.membership.store_name}</h2><p>{auth.membership.display_name}님, 이 매장에 연결되어 있어요.</p>{auth.membership.role==='owner'?<nav className={styles.ownerLinks} aria-label="경영주 바로가기"><Link href="/manager/dashboard">교육 현황·점수</Link><Link href="/manager/questions">질문 내역</Link><Link href="/manager/checklist">체크리스트 만들기</Link></nav>:<Link className="button" href="/crew/simulation">내 연습으로 가기</Link>}{auth.membership.role==='owner'&&<div className={styles.invite}><h3>스토어 매니저 초대</h3><p>한 명이 사용할 수 있는 24시간 유효 초대 코드를 만들어요.</p><button className="button secondary" disabled={pending} onClick={async()=>{if(!auth.client)return;setPending(true);setMessage('');try{const {data,error}=await auth.client.rpc('gstep_create_invite');if(error)throw error;setInvite(String(data));}catch(cause){setMessage(cloudError(cause));}finally{setPending(false);}}}>초대 코드 만들기</button>{invite&&<label>초대 코드<input readOnly value={invite} onFocus={event=>event.target.select()}/></label>}</div>}</>:<form onSubmit={connect}><h2>매장을 연결해 주세요</h2><div className={styles.switcher} role="group" aria-label="매장 연결 방식"><button type="button" aria-pressed={role==='crew'} onClick={()=>setRole('crew')}>스토어 매니저</button><button type="button" aria-pressed={role==='owner'} onClick={()=>setRole('owner')}>경영주</button></div><label>표시 이름<input name="displayName" maxLength={40} required autoComplete="nickname"/></label>{role==='owner'?<><label>새 매장 이름<input name="storeName" maxLength={80} required placeholder="예: 첫날 연습점"/></label><p className="small-note">새로 만든 매장의 경영주로 등록돼요. 다른 매장의 권한은 생기지 않아요.</p></>:<label>경영주에게 받은 초대 코드<input name="invite" required maxLength={48} autoComplete="off"/></label>}<button className="button" disabled={pending}>{pending?'연결 중…':role==='owner'?'내 매장 만들기':'초대로 매장 연결'}</button></form>}<button className={`button secondary ${styles.logout}`} disabled={pending} onClick={async()=>{setPending(true);try{await auth.signOut();setMode('login');setShowPassword(false);setMessage('');setInvite('');}catch{setMessage('로그아웃하지 못했어요. 다시 시도해 주세요.');}finally{setPending(false);}}}>로그아웃</button></section>:<section className={`panel ${styles.card}`}><div className={styles.switcher} role="group" aria-label="계정 작업"><button disabled={pending} aria-pressed={mode==='login'} onClick={()=>{setMode('login');setShowPassword(false);setMessage('');}}>로그인</button><button disabled={pending} aria-pressed={mode==='signup'} onClick={()=>{setMode('signup');setShowPassword(false);setMessage('');}}>회원가입</button></div><form onSubmit={credentials}><label htmlFor="auth-username">아이디<input id="auth-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={4} maxLength={24} pattern="[A-Za-z0-9_]{4,24}" required disabled={pending} aria-describedby="username-help"/></label><p id="username-help" className="small-note">영문, 숫자, 밑줄(_) 4~24자 · 대소문자를 구분하지 않아요.</p><label htmlFor="auth-password">비밀번호<input id="auth-password" name="password" type={showPassword?'text':'password'} minLength={8} maxLength={72} autoComplete={mode==='login'?'current-password':'new-password'} required disabled={pending}/></label><button type="button" className={styles.passwordToggle} aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)}>{showPassword?'비밀번호 숨기기':'비밀번호 보기'}</button>{mode==='signup'&&<label htmlFor="auth-password-confirm">비밀번호 확인<input id="auth-password-confirm" name="passwordConfirm" type={showPassword?'text':'password'} autoComplete="new-password" required disabled={pending}/></label>}{mode==='signup'&&<p className="small-note">비밀번호는 8자 이상 입력해 주세요. 가입 후 매장을 만들거나 초대 코드로 참여할 수 있어요.</p>}<button className="button" disabled={pending}>{pending?'계정 확인 중…':mode==='login'?'아이디로 로그인':'아이디로 회원가입'}</button></form><Link className="text-link" href="/crew/simulation">먼저 체험해 보기</Link></section>}
 {message&&<p role="status" className={`inline-note ${styles.message}`}>{message}</p>}</div>;
}
