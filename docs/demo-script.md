# Current revision demo — 2026-09-21

Use a fresh browser context. Automated demo uses AI_DEMO_MODE=true. Live calls are a separate check.

1. Start at `/`. No owner start card or separate response-practice navigation. Open **연습 시작하기**, then start the12-stage course.
2. Choose the correct action except at 상품·행사 조회: deliberately choose 영수증 재출력. Read feedback and finish every stage. Result92/100.
3. Retry and choose all correct actions, including 상품·행사 조회. Finish:100/100. Both attempts remain saved.
4. In 매장 Q&A ask **상품 검수**. Expand 답변 근거 to see the confirmed manual source. Ask **직원 급여 정산 계좌**: unresolved. Upload a small `.md` and ask a term contained in it; its passage becomes the answer source.
5. Open 체크리스트, mark 입고 상품 확인 complete and 소비기한 확인 as needing owner confirmation. Refresh and verify states.
6. Open 경영주 관리:2 completed records, average96. Expand a record for selected step answers and sources. Checklist settings edit items without changing their existing completion status.
7. Start home **테스트 시작하기** with optional 지원자 A alias. Complete several stages, refresh, resume. No explanation appears during test; final score and review appear after stage12.
8. Reset from the checklist footer: cancel keeps data; confirm clears quiz, upload and existing app records. Unrelated browser keys remain.

See tests/e2e/demo-flow.spec.ts, simulation.spec.ts, manual-qa.spec.ts, reset.spec.ts and usability.spec.ts for exact assertions. Figma reference: https://www.figma.com/design/KYOkEnYcKTRuPpe6hi3QPW .
