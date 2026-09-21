import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
export default function CrewHome() {
  return <><div className="page-heading"><p className="eyebrow">READY FOR YOUR FIRST DAY</p><h1>오늘의 첫걸음</h1><p>한 번 연습하고, 모르는 순간에는 다시 확인해요.</p></div><section className="training-start"><div><span className="pill">근무 전 연습</span><h2>고객의 행사 문의,<br />차근차근 응대해 볼까요?</h2><p>고객의 질문을 듣고 가상 POS에서 확인한 뒤 안내해요.<br />잘못 답해도 다시 연습할 수 있어요.</p><Link className="button" href="/crew/simulation">응대 연습 시작 <ArrowRight size={18} aria-hidden/></Link></div><div className="training-number" aria-hidden>첫<br/>걸음.</div></section><div className="quick-links"><Link href="/crew/questions"><h2>궁금할 때, 매장 Q&A</h2><p>경영주가 저장한 규칙에서 답을 찾아요.</p><ArrowRight aria-hidden/></Link><Link href="/crew/checklist"><h2>오늘의 체크리스트</h2><p>한 가지씩 확인하고 필요한 도움을 남겨요.</p><ArrowRight aria-hidden/></Link></div></>;
}
