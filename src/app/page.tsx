import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { StoreArt, ToolArt } from '@/components/friendly-art';

export default function Home() {
  return <div className="container service-home">
    <div className="home-greeting"><span>스토어 매니저를 위한 연습실</span><strong>나의 첫날을 준비해요 <Sparkles size={16} aria-hidden /></strong></div>
    <section className="welcome-banner" aria-labelledby="welcome-title">
      <div className="welcome-copy"><span className="welcome-badge">12단계 매장 시뮬레이터</span><h1 id="welcome-title">첫 근무도,<br />해본 것처럼!</h1><p>손님 응대부터 POS까지<br />한 번 연습하고 시작해요.</p><Link className="button welcome-button" href="/crew/simulation">연습 시작하기 <ArrowRight size={18} aria-hidden /></Link></div>
      <div className="welcome-art"><StoreArt /></div><span className="welcome-caption">실수해도 괜찮은 가상 매장</span>
    </section>
    <div className="home-section-heading"><h2>필요할 때, 바로 꺼내요</h2><span>나의 근무 도우미</span></div>
    <section className="service-grid" aria-label="근무 도구">
      <Link className="service-card service-questions" href="/crew/questions"><div className="service-card-heading"><h2>매장 Q&A</h2><ChevronRight size={20} aria-hidden /></div><p>궁금한 업무,<br />매뉴얼에 물어보세요.</p><ToolArt kind="chat"/><span className="service-card-action">질문하러 가기 <ArrowRight size={15} aria-hidden /></span></Link>
      <Link className="service-card service-checklist" href="/crew/checklist"><div className="service-card-heading"><h2>오늘의 체크리스트</h2><ChevronRight size={20} aria-hidden /></div><p>하나씩 체크하며<br />빠뜨림 없이 마무리해요.</p><ToolArt kind="check"/><span className="service-card-action">체크리스트 열기 <ArrowRight size={15} aria-hidden /></span></Link>
    </section>
    <Link className="assessment-banner" href="/crew/simulation?mode=test"><ToolArt kind="quiz"/><div><span>구인 · 면접용</span><h2>우리 매장 첫 출근 테스트</h2><p>업무 이해도를 함께 확인해요.</p><strong>테스트 시작하기 <ArrowRight size={16} aria-hidden /></strong></div><ChevronRight className="assessment-arrow" aria-hidden /></Link>
    <div className="home-owner-link"><Link href="/manager/dashboard"><span>경영주이신가요?</span> 연습 기록·점수 확인 및 체크리스트 설정 <ChevronRight size={15} aria-hidden /></Link></div>
  </div>;
}
