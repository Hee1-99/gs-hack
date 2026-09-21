import Link from 'next/link';
import { ArrowUpRight, BookOpen, MessageCircle, ClipboardCheck } from 'lucide-react';

export default function Home() {
  return <div className="home container">
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">FIRST SHIFT, FIRST STEP</p><h1>처음이라도,<br /><span>해본 것처럼.</span></h1><p className="hero-description">첫 고객을 만나기 전, 한 번의 연습.<br />근무 중에는 우리 매장 규칙을 바로 확인하세요.</p><span className="small-note">로그인 없는 데모용 역할 전환</span></div>
      <div className="practice-note" aria-label="첫날의 연습 순서"><div className="note-top"><span>첫날 준비 노트</span><span aria-hidden>01 / 03</span></div><div className="note-question"><MessageCircle aria-hidden size={24}/><p>“이 상품, 행사 중인가요?”</p></div><p className="note-answer">바로 답하기 전에,<br /><strong>먼저 확인해도 괜찮아요.</strong></p><div className="note-steps"><span>질문 듣기</span><span>POS 확인</span><span>안내하기</span></div><div className="note-bottom">실수해도 괜찮은 가상 매장</div></div>
    </section>
    <section className="role-section" aria-labelledby="role-title"><div className="section-heading"><h2 id="role-title">어떤 첫날을 준비하시나요?</h2><p>역할을 선택해 시작하세요.</p></div><div className="role-grid">
      <Link className="role-card crew-card" href="/crew"><span className="role-number">01 / 배우고 연습하기</span><div className="role-title"><h3>스토어 매니저로 시작</h3><ArrowUpRight aria-hidden/></div><p>고객 응대를 연습하고,<br />궁금한 규칙과 오늘 할 일을 확인해요.</p><span className="role-bottom"><MessageCircle size={17} aria-hidden/> 응대 연습 <BookOpen size={17} aria-hidden/> 매장 Q&A <ClipboardCheck size={17} aria-hidden/> 체크리스트</span></Link>
      <Link className="role-card manager-card" href="/manager/manual"><span className="role-number">02 / 알려주고 살펴보기</span><div className="role-title"><h3>경영주로 시작</h3><ArrowUpRight aria-hidden/></div><p>우리 매장 규칙을 등록하고,<br />교육과 업무에서 필요한 도움을 살펴봐요.</p><span className="role-bottom">매장 매뉴얼 · 업무 관리 · 대시보드</span></Link>
    </div></section>
  </div>;
}
