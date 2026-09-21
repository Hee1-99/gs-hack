import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles, BookOpenCheck, MessageCircleMore, BrainCircuit, Check, ShieldCheck } from 'lucide-react';
import { StoreArt, ToolArt } from '@/components/friendly-art';
import passages from '@/features/manual-reference/passages.json';
import { trainingSteps, trainingChapters } from '@/features/training/training-data';

export default function Home() {
  return <div className="container service-home gstep-home">
    <div className="home-greeting"><span>스토어 매니저의 첫 성장, GStep</span><strong><Sparkles size={15} aria-hidden /> Gemini와 함께</strong></div>
    <section className="welcome-banner" aria-labelledby="welcome-title">
      <div className="welcome-copy"><Link className="welcome-badge" href="/sources"><BookOpenCheck size={14} aria-hidden />실제 GS25 교육 매뉴얼 기반<ChevronRight size={13} aria-hidden /></Link><h1 id="welcome-title">매뉴얼에서 배우고,<br />AI와 한 걸음 더.</h1><p>직접 판단하고, 말하고, 응대해 보세요.<br />AI 피드백으로 첫 근무가 달라집니다.</p><Link className="button welcome-button" href="/crew/simulation">연습 시작하기 <ArrowRight size={18} aria-hidden /></Link><span className="hero-course">{trainingChapters.length}개 챕터 · {trainingSteps.length}단계 · 서술형 AI 채점</span></div>
      <div className="welcome-art"><StoreArt /></div><span className="welcome-caption">실수해도 괜찮은 GStep 가상 매장</span>
    </section>
    <Link className="ai-chat-entry" href="/crew/chat"><div className="ai-chat-symbol" aria-hidden><MessageCircleMore size={31}/><span><Sparkles size={12}/></span></div><div><span className="ai-label">말해 보면 더 쉬워져요</span><h2>AI 대화 연습</h2><p>Gemini가 손님이 되어 묻고,<br className="mobile-break"/> 내가 한 응대를 함께 돌아봐요.</p></div><span className="chat-entry-action">대화 시작<ArrowRight size={18} aria-hidden /></span></Link>
    <div className="home-section-heading"><h2>근무 중에도, 곁에서</h2><span>나의 근무 도우미</span></div>
    <section className="service-grid" aria-label="근무 도구">
      <Link className="service-card service-questions" href="/crew/questions"><div className="service-card-heading"><h2>매장 Q&A</h2><ChevronRight size={20} aria-hidden /></div><p>매뉴얼부터 일상 질문까지,<br />친절한 AI 동료에게.</p><ToolArt kind="chat"/><span className="service-card-action">질문하러 가기 <ArrowRight size={15} aria-hidden /></span></Link>
      <Link className="service-card service-checklist" href="/crew/checklist"><div className="service-card-heading"><h2>오늘의 체크리스트</h2><ChevronRight size={20} aria-hidden /></div><p>하나씩 체크하며<br />빠뜨림 없이 마무리해요.</p><ToolArt kind="check"/><span className="service-card-action">체크리스트 열기 <ArrowRight size={15} aria-hidden /></span></Link>
    </section>
    <section className="manual-promise" aria-labelledby="manual-heading"><div className="manual-promise-copy"><span className="ai-label"><BookOpenCheck size={15} aria-hidden /> 배움에는 근거가 있어야 하니까</span><h2 id="manual-heading">실제 업무의 순서를,<br />교육 매뉴얼에서 가져왔어요.</h2><p>GS25 공개 교육 자료 중 본문을 확인한 {passages.length}개 자료를 바탕으로, 근무 준비부터 상품·POS·고객 응대까지 연습합니다.</p><Link href="/sources">어떤 자료로 배우나요?<ArrowRight size={15} aria-hidden /></Link></div><ol className="ai-learning-flow"><li><span><BookOpenCheck size={19} aria-hidden /></span><div><strong>매뉴얼에서 상황을 만들고</strong><p>출처를 따라가며 업무의 이유를 이해해요.</p></div></li><li><span><BrainCircuit size={19} aria-hidden /></span><div><strong>Gemini가 내 응대를 읽고</strong><p>서술형·대화의 좋은 점과 보완점을 짚어요.</p></div></li><li><span><Check size={19} aria-hidden /></span><div><strong>다음 근무를 더 자신 있게</strong><p>정확도와 응답 시간을 보고 다시 연습해요.</p></div></li></ol></section>
    <Link className="assessment-banner" href="/crew/simulation?mode=test"><ToolArt kind="quiz"/><div><span>구인 · 면접용</span><h2>우리 매장 첫 출근 테스트</h2><p>업무 이해도를 함께 확인해요.</p><strong>테스트 시작하기 <ArrowRight size={16} aria-hidden /></strong></div><ChevronRight className="assessment-arrow" aria-hidden /></Link>
    <div className="account-invitation"><ShieldCheck size={23} aria-hidden/><div><strong>기록은 내 계정에, 성장은 우리 매장에.</strong><p>계정을 연결하면 소속 매장의 교육 기록과 체크리스트를 함께 관리할 수 있어요.</p></div><Link href="/login">계정 연결 <ArrowRight size={15} aria-hidden/></Link></div>
    <div className="home-owner-link"><Link href="/manager/dashboard"><span>경영주이신가요?</span> 연습 기록·점수 확인 및 체크리스트 설정 <ChevronRight size={15} aria-hidden /></Link></div>
  </div>;
}
