'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { SimulationSession } from '@/domain/types';
import { money } from '@/domain/promotion';
import { validateSession } from './rule-validator';
import { coachingPlan, renderPlan } from '@/ai/demo-responses';

export function FeedbackPanel({ session, previous, onRetry, pending }: { session: SimulationSession; previous?: SimulationSession; onRetry: (variant: boolean) => void; pending: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [session.id]);
  const results = validateSession(session);
  const old = previous ? validateSession(previous) : null;
  const reply = session.coaching ?? renderPlan(coachingPlan(session));
  return <section className="feedback" aria-labelledby="feedback-title"><div className="feedback-heading"><span className="eyebrow">PRACTICE REVIEW</span><h2 id="feedback-title" ref={heading} tabIndex={-1}>{results.procedureFollowed ? '확인하고 안내했어요' : '확인 순서를 다시 연습해요'}</h2><p>정답뿐 아니라 어떤 순서로 확인했는지 함께 살펴봐요.</p></div>
    <dl className="result-list" aria-label="행동 기록으로 확인한 결과"><div data-testid="result-lookup"><dt>해당 상품 POS 조회</dt><dd>{results.promotionLookupPerformed ? '조회함' : '미조회'}</dd></div><div data-testid="result-order"><dt>확인 전 확정 안내</dt><dd>{results.definitiveBeforeLookup ? '있음' : '없음'}</dd></div><div><dt>마지막 안내 내용</dt><dd>{results.finalAnswerCorrect ? '조건에 맞음' : '다시 확인 필요'}</dd></div><div><dt>경영주 확인 요청</dt><dd>{results.managerConfirmationRequested ? '요청함' : '요청 없음'}</dd></div></dl>
    <div className="inline-note"><p>{results.expectedIntent === 'check_manager' ? '이 상황은 혼합 행사 조건을 확정하지 않고 경영주에게 확인하는 것이 필요해요.' : `이 상황의 총액: ${money(results.expectedTotal ?? 0)}`}<br/>근거: {session.snapshot.rules.filter(rule => session.scenario.ruleIds.includes(rule.id)).map(rule => `${rule.title} v${rule.version}`).join(', ')}</p></div>
    <div className="coach-note"><div className="form-heading"><h3>코치의 한마디</h3><span className="pill">{reply.mode === 'demo' ? '데모 모드' : 'Gemini 표현'}</span></div><p className="preserve-lines">{reply.content}</p><span className="small-note">위 행동 판정과 매장 근거를 바탕으로 구성한 안내예요.</span></div>
    {old && <div className="comparison"><h3>이전 연습과 비교</h3><table aria-label="이전 연습과 비교"><thead><tr><th scope="col">확인 항목</th><th scope="col">이전 연습</th><th scope="col">이번 연습</th></tr></thead><tbody><tr><th scope="row">POS 조회</th><td>{old.promotionLookupPerformed ? '조회함' : '미조회'}</td><td>{results.promotionLookupPerformed ? '조회함' : '미조회'}</td></tr><tr><th scope="row">확인 전 확정 안내</th><td>{old.definitiveBeforeLookup ? '있음' : '없음'}</td><td>{results.definitiveBeforeLookup ? '있음' : '없음'}</td></tr><tr><th scope="row">안내 절차</th><td>{old.procedureFollowed ? '확인 완료' : '다시 연습'}</td><td>{results.procedureFollowed ? '확인 완료' : '다시 연습'}</td></tr></tbody></table></div>}
    <div className="retry-actions"><button className="button" disabled={pending} onClick={() => onRetry(false)}>같은 상황 다시 연습</button><button className="button secondary" disabled={pending} onClick={() => onRetry(true)}>다른 상품을 섞는 상황 연습</button><Link className="text-link" href="/crew/questions">매장 Q&A로 이동 →</Link></div>
  </section>;
}
