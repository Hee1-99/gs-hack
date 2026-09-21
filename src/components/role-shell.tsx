'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BookOpen, ClipboardCheck, Gamepad2, ChartColumn, Settings2 } from 'lucide-react';
export function RoleShell({ role, children }: { role: 'crew' | 'manager'; children: React.ReactNode }) {
  const path = usePathname();
  const manager = role === 'manager';
  const links = manager ? [{label:'연습 기록·점수',href:'/manager/dashboard',icon:ChartColumn}, {label:'체크리스트 설정',href:'/manager/checklist',icon:ClipboardCheck}] : [{label:'시뮬레이터',href:'/crew/simulation',icon:Gamepad2}, {label:'매장 Q&A',href:'/crew/questions',icon:BookOpen}, {label:'체크리스트',href:'/crew/checklist',icon:ClipboardCheck}];
  return <div className={`container workspace workspace--${role}`}><div className="role-bar"><span><strong>{manager ? '경영주 관리' : '스토어 매니저'}</strong></span><Link className="switch-role" href="/"><ArrowLeft size={15} aria-hidden/>시작 화면</Link></div>
    <nav className="tabs" aria-label={manager ? '경영주 메뉴' : '스토어 매니저 메뉴'}>{links.map(({label,href,icon:Icon}) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}><Icon size={17} aria-hidden/>{label}</Link>)}{manager && <Link className="secondary-tab" href="/manager/manual" aria-current={path === '/manager/manual' ? 'page' : undefined}><Settings2 size={15} aria-hidden/>추가 매장 규칙</Link>}</nav>{children}
  </div>;
}
