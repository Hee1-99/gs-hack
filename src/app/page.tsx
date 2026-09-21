import Link from 'next/link';
import { trainingTransaction, trainingTotal } from '@/features/training/training-data';
import { ArrowRight, BookOpen, ClipboardCheck, GraduationCap, ScanLine, Sparkles, Timer, ListChecks } from 'lucide-react';

export default function Home() {
  return <div className="container launch-page">
    <div className="launch-heading"><span className="launch-kicker"><span /> 스토어 매니저의 첫 근무 준비</span><h1>첫 출근 전에,<br className="mobile-break" /> 한 번 해보세요.</h1><p>가상 매장에서 직접 선택하고, 끝까지 풀면 점수가 나와요.</p></div>
    <section className="launch-practice" aria-labelledby="practice-title">
      <div className="launch-practice-copy"><span className="launch-tag"><Sparkles size={14} aria-hidden /> 처음이라면 여기부터</span><h2 id="practice-title">실수해도 괜찮은<br />나의 첫 번째 근무.</h2><p>손님을 맞이하고, POS를 확인하고, 상품을 관리해요.<br />한 단계씩 배우는 매장 시뮬레이터.</p><div className="launch-meta"><span><ListChecks size={15} aria-hidden /> 단계별 퀴즈</span><span><Timer size={15} aria-hidden /> 내 속도로 연습</span></div><Link className="button launch-cta" href="/crew/simulation">연습 시작하기 <ArrowRight size={18} aria-hidden /></Link></div>
      <div className="counter-preview" aria-hidden="true"><div className="preview-wall"><span>FIRSTDAY MART</span><div className="preview-shelf"><i/><i/><i/><i/><i/></div></div><div className="preview-bubble">이 상품, 행사 중인가요?<span>먼저 POS에서 확인해 볼까요?</span></div><div className="preview-person"><div className="preview-hair"/><div className="preview-face"/><div className="preview-shirt"/></div><div className="preview-terminal"><div className="preview-terminal-bar"><span>판매 등록</span><ScanLine size={14}/></div><div className="preview-receipt"><span>{trainingTransaction.productName} <b>{trainingTransaction.quantity}개</b></span><span>행사 적용 <b>2+1</b></span><strong>결제 금액 <b>{trainingTotal.toLocaleString('ko-KR')}원</b></strong></div><div className="preview-keys"><i/><i/><i/><i/><i/><i/></div></div><div className="preview-counter"/><span className="preview-caption">교육용 가상 POS · 합성 거래</span></div>
    </section>
    <section className="launch-tools" aria-label="테스트와 근무 도구">
      <Link className="launch-tool test-tool" href="/crew/simulation?mode=test"><div className="tool-icon"><GraduationCap aria-hidden /></div><div><span className="tool-label">구인 · 면접용</span><h2>스토어 매니저 테스트</h2><p>도움말 없이 풀고, 마지막에 결과를 확인해요.</p><span className="tool-action">테스트 시작하기 <ArrowRight size={16} aria-hidden /></span></div></Link>
      <Link className="launch-tool" href="/crew/questions"><div className="tool-icon"><BookOpen aria-hidden /></div><div><span className="tool-label">일하다 궁금할 때</span><h2>매장 Q&A</h2><p>GS 교육 매뉴얼에서 근거를 찾아 답해요.</p><span className="tool-action">질문하러 가기 <ArrowRight size={16} aria-hidden /></span></div></Link>
      <Link className="launch-tool" href="/crew/checklist"><div className="tool-icon"><ClipboardCheck aria-hidden /></div><div><span className="tool-label">빠뜨리지 않도록</span><h2>오늘의 체크리스트</h2><p>오늘 할 일을 하나씩 확인해요.</p><span className="tool-action">체크리스트 열기 <ArrowRight size={16} aria-hidden /></span></div></Link>
    </section>
    <div className="launch-owner"><span>경영주이신가요?</span><Link href="/manager/dashboard">연습 기록·점수 확인 및 체크리스트 설정 <ArrowRight size={14} aria-hidden /></Link></div>
  </div>;
}
