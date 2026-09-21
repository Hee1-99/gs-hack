# 첫날.zip

처음 근무하는 스토어 매니저의 고객 응대 연습과 매장 규칙 확인을 돕는 합성 데이터 데모입니다. 실제 GS25 운영 시스템이나 공식 매뉴얼이 아닙니다.

## 개발

Node.js 24 이상에서 `npm ci` 후 `npm run dev`로 시작합니다. `.env.example`을 참고하여 서버 전용 설정을 `.env.local`에 둡니다. 키를 Git이나 브라우저 코드에 넣지 않습니다.

## 검증

PowerShell:

```powershell
$env:AI_DEMO_MODE='true'
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

E2E는 기존 개발 서버를 재사용하지 않고 포트 3100에서 프로덕션 서버를 시작합니다. 실제 Gemini 검증은 자동 회귀와 분리합니다.

각 E2E는 별도 브라우저 컨텍스트와 저장소를 사용합니다. 데스크톱 1440×900과 모바일 390×844에서 실행하며 재시도는 0회입니다. 실패 시 `test-results/`에 스크린샷·trace, `playwright-report/`에 보고서를 남깁니다. `npx playwright show-trace <trace.zip 경로>`로 실패 시점을 확인합니다. 확인용 화면은 `docs/evidence/`에 저장됩니다. 빌드 출력 경로는 `.firstday-build`이며, 환경값이 디스크 캐시에 남는 것을 막기 위해 Turbopack 파일 캐시를 사용하지 않습니다. 예전 `.next` 출력은 실행·게시하지 않습니다.

`AI_DEMO_MODE=true`이면 키가 있어도 외부 호출이 없습니다. 명시적으로 `false`일 때만 Gemini를 사용하며, 키 누락·12초 초과·할당량·출력 오류는 데모 응답으로 복구합니다. SDK에는 API의 최소 제한(10초)보다 긴 15초를 전달하고 브라우저는 최대 20초 대기합니다. `GEMINI_MODEL` 기본값은 `gemini-3.8-flash`입니다. 실호출은 별도 서버에서 `node scripts/live-smoke.mjs`로 검증합니다. 2026-09-21 고객·코치·Q&A 실제 호출이 모두 성공했습니다. 이전 HTTP 400은 앱이 API 최소 10초보다 짧은 8초 deadline을 보낸 것이 원인이었으며 수정했습니다. 자동 회귀와 실호출 결과는 분리해 기록합니다.

## 데모 순서

1. 경영주 대시보드에서 데모 데이터를 초기화하고 매장 매뉴얼의 행사 규칙을 수정합니다.
2. 스토어 매니저로 전환해 응대 연습을 시작합니다. POS 없이 4,500원으로 답하면 정답과 확인 절차 모두 보완이 필요합니다.
3. 같은 상황을 다시 연습합니다. 캔커피 A를 조회하고 3,000원으로 답하면 절차를 지킨 결과와 이전 시도 비교가 나타납니다.
4. 매장 Q&A의 행사 규칙 버튼을 눌러 수정된 내용과 버전을 확인하고, 매뉴얼에 없는 택배 질문을 남깁니다.
5. 체크리스트에서 입고 확인을 완료, 소비기한 확인을 경영주 확인 필요로 선택합니다.
6. 경영주 대시보드에서 완료 연습 2회, 완료 업무 1/4, 질문 2개, 확인 필요 2개를 확인합니다.

## 데이터와 한계

- 가상 매장 1개, 합성 상품 3개, 행사 1개, 기본/혼합 상품 상황 2개를 제공합니다. 실제 GS25 데이터·공식 매뉴얼·로고를 사용하지 않습니다.
- 인증 없는 역할 전환 데모입니다. 같은 브라우저의 `firstday.zip` localStorage에만 저장하며, 다른 기기·동시 탭 동기화와 실제 POS 연동은 지원하지 않습니다. 저장이 불가능하면 임시 상태임을 표시합니다.
- 가격·행사 계산·평가는 코드와 구조화된 데이터가 결정합니다. Gemini는 허용된 소개 문구와 사실 문장의 순서를 선택합니다. 자유로운 사실 생성이나 자유문장 채점은 하지 않습니다. UI에 선택한 안내 유형과 금액으로 평가한다는 점을 표시합니다.
- Q&A는 작은 매뉴얼에 맞춘 보수적인 검색입니다. 근거가 없거나 여러 규칙이 동시에 맞으면 경영주 확인으로 남깁니다. 과거 답변·미해결 기록과 진행 중 연습의 규칙 사본은 이후 수정으로 바뀌지 않습니다.
- 대시보드의 연습 수는 재도전을 포함한 완료 시도 수, 업무 수는 현재 항목 중 완료 수, 질문 수는 누적 기록 수입니다. 확인 필요 수는 과거 미해결 질문과 현재 확인 요청 업무의 합입니다. 역할극의 확인 요청은 업무 요청에 포함하지 않습니다.
- 데이터 초기화는 확인 후 이 앱의 저장 키만 덮어씁니다. 브라우저 데이터를 지우면 기록이 사라집니다.

현재 구현 단계와 실제 검증 결과는 `progress.md`와 `docs/verification-matrix.md`를 참조하세요. 테스트 결과를 실서비스·실제 Gemini 검증으로 해석하지 않습니다.

## Published demo

- App: https://gs-hack-seven.vercel.app
- Source: https://github.com/Hee1-99/gs-hack
- Production uses real Gemini with deterministic fallback; automated regression stays forced demo. Verified customer, coach and grounded Q&A live, plus full desktop/mobile deployed journeys on2026-09-21. Data remains local to each browser.
- Vercel uses the Next.js preset and `.firstday-build` output. Deploy with `vercel deploy --prod --build-env AI_DEMO_MODE=true --env AI_DEMO_MODE=false`; configure the existing key as a sensitive server-side production variable. Never upload `.env.local`.
