'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Grid2X2, ClipboardCheck, UserRound } from 'lucide-react';

const items = [
  { href: '/', label: '홈', icon: Home },
  { href: '/crew/questions', label: '매장 Q&A', icon: MessageCircle },
  { href: '/crew/simulation', label: '시뮬레이터', icon: Grid2X2, main: true },
  { href: '/crew/checklist', label: '체크리스트', icon: ClipboardCheck },
  { href: '/manager/dashboard', label: '기록', icon: UserRound },
];
export function AppNavigation() {
  const path = usePathname();
  return <nav className="app-bottom-nav" aria-label="모바일 메뉴">{items.map(({ href, label, icon: Icon, main }) =>
    <Link href={href} key={href} className={main ? 'nav-main-action' : undefined} aria-current={path === href ? 'page' : undefined}>
      <span className="nav-icon"><Icon size={25} strokeWidth={1.8} aria-hidden /></span><span>{label}</span>
    </Link>)}</nav>;
}
