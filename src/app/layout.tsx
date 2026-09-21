import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { StoreProvider } from '@/data/store-provider';

export const metadata: Metadata = { title: '첫날.zip | 첫 근무를 위한 연습', description: '가상 매장에서 연습하고, 매장 규칙을 확인하는 첫 근무 도우미' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>
    <a className="skip-link" href="#main">본문으로 건너뛰기</a>
    <header className="site-header"><Link className="brand" href="/" aria-label="첫날.zip 홈"><span className="brand-mark" aria-hidden>zip</span>첫날<span className="brand-suffix">.zip</span></Link><div className="header-actions"><span className="demo-label">가상 매장 체험</span><Link href="/manager/dashboard">경영주 관리</Link></div></header>
    <main id="main"><StoreProvider>{children}</StoreProvider></main>
    <footer className="site-footer"><strong>연습은 가볍게, 첫날은 든든하게.</strong><p>공개 GS25 교육 자료 기반 · 거래·상품은 합성 데이터 · 실제 POS와 연결되지 않습니다.</p><span>로그인 없는 체험판 · 기록은 이 브라우저에 보관</span></footer>
  </body></html>;
}
