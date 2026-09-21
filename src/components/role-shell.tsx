'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeftRight } from 'lucide-react';
export function RoleShell({ role, children }: { role: 'crew' | 'manager'; children: React.ReactNode }) {
  const path = usePathname();
  const manager = role === 'manager';
  const links = manager ? [['매장 매뉴얼', '/manager/manual'], ['업무 관리', '/manager/checklist'], ['대시보드', '/manager/dashboard']] : [['첫걸음', '/crew'], ['응대 연습', '/crew/simulation'], ['매장 Q&A', '/crew/questions'], ['체크리스트', '/crew/checklist']];
  return <div className="container workspace"><div className="role-bar"><span><strong>{manager ? '경영주' : '스토어 매니저'}</strong> <span className="small-note">데모 모드</span></span><Link className="switch-role" href={manager ? '/crew' : '/manager/manual'}><ArrowLeftRight size={15} aria-hidden/>{manager ? '스토어 매니저' : '경영주'}로 전환</Link></div>
    <nav className="tabs" aria-label={manager ? '경영주 메뉴' : '스토어 매니저 메뉴'}>{links.map(([label, href]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>)}</nav>{children}
  </div>;
}
