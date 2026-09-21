import type { Metadata } from 'next';
import Link from 'next/link';
import localFont from 'next/font/local';
import './globals.css';
import './reference-theme.css';
import './gstep.css';
import { StoreProvider } from '@/data/store-provider';
import { AppNavigation } from '@/components/app-navigation';
import { GStepLogo } from '@/components/gstep-logo';
import { AuthProvider } from '@/features/auth/auth-provider';
import { AccountMenu } from '@/features/auth/account-menu';
import { TrainingCloudSync } from '@/features/auth/training-cloud-sync';

const storeSans = localFont({
  src: './fonts/noto-sans-kr-latin-hangul-variable.woff2',
  variable: '--font-store-sans',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: true,
  fallback: ['Arial', 'sans-serif'],
});

export const metadata: Metadata = { title: 'GStep | 매뉴얼로 배우고 AI와 연습하는 첫 근무', description: '실제 GS25 공개 교육 매뉴얼 기반 업무 퀴즈, AI 서술형 피드백과 고객 대화 연습. 스토어 매니저의 첫 성장을 함께합니다.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" className={storeSans.variable}><body className={storeSans.className}><AuthProvider>
    <a className="skip-link" href="#main">본문으로 건너뛰기</a>
    <TrainingCloudSync />
    <header className="site-header"><Link className="brand" href="/" aria-label="GStep 홈"><GStepLogo /></Link><div className="header-actions"><AccountMenu /></div></header>
    <main id="main"><StoreProvider>{children}</StoreProvider></main>
    <footer className="site-footer"><strong>GStep · 한 걸음씩, 더 자신 있는 근무.</strong><p>GS25 공개 교육 매뉴얼 기반 · 가상 매장·POS · GS25 공식 서비스가 아닙니다.</p><span>AI 채점은 학습 피드백입니다. 정확한 매장 지침은 경영주에게 확인하세요.</span><p><Link href="/sources">교육 자료와 출처</Link> · <Link href="/login">계정 연결</Link></p></footer>
    <AppNavigation />
  </AuthProvider></body></html>;
}
