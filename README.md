# 첫날.zip

첫 근무를 준비하는 스토어 매니저가 매장 상황을 12단계 퀴즈로 연습하는 앱입니다. 공개 GS25 교육 자료의 확인된 요약을 사용하며, 상품·가격·POS 화면은 교육용 합성 데이터입니다.

## 실행과 검증

Node.js24에서 `npm ci`, `npm run dev`. 서버 전용 Gemini 설정은 `.env.local`에만 둡니다. `.env.example`을 참고하세요.

```powershell
$env:AI_DEMO_MODE='true'
npm test
npm run build
npm run test:e2e
```

E2E는 포트3100의 생산 서버를 새로 시작하고 데스크톱1440×900/모바일390×844를 검증합니다. 재시도0회, 실패 trace는 `test-results/`, 보고서는 `playwright-report/`입니다. 개발 서버는 빌드 전에 종료하세요. 빌드 출력은 `.firstday-build`입니다.

## 사용 순서

1. 첫 화면의 **연습 시작하기** → **연습 시작하기**를 누릅니다.
2. 고객 상황을 읽고 POS의 행동을 선택합니다. 각 단계의 해설을 확인하고 12단계를 마치면 점수가 나옵니다.
3. **테스트 시작하기**는 면접용입니다. 별칭을 입력할 수 있으며 해설은 종료 후 표시됩니다.
4. **매장 Q&A**에서 상품 검수 등 업무를 질문하면 매뉴얼 출처와 함께 답합니다. 자료 안내를 펼쳐 `.md`/`.txt`를 올릴 수 있습니다.
5. **체크리스트**에서 오늘 할 일을 표시합니다.
6. 상단 **경영주 관리**에서 연습·테스트 기록과 점수, 단계별 답변을 봅니다. **체크리스트 설정**에서 항목을 편집합니다. 추가 매장 규칙은 보조 기능입니다.

## 매뉴얼과 AI

- `docs/gs25-store-manager-training-map.md`에서 확인된 본문 요약58개를 `node scripts/generate-manual-reference.mjs`로 생성합니다. 본문 미확보20개는 사용하지 않습니다.
- 매뉴얼 검색은 보수적 키워드 검색입니다. 표현에 따라 답을 못 찾을 수 있으며, 근거가 없으면 경영주 확인으로 남깁니다.
- 업로드는 UTF-8 `.md`/`.txt`20KB 이하입니다. PDF/HWP는 텍스트로 내보내야 합니다. 업로드된 문서는 브라우저에 저장되고 질문할 때 서버와 Gemini에 전달됩니다.
- Gemini는 검색된 근거로 답변을 작성하고 출처 ID/숫자를 검사합니다. API 실패·시간 초과·출력 오류는 근거 요약으로 대체합니다. UI에 Gemini/데모 모드를 구분합니다.
- `AI_DEMO_MODE=true`이면 외부 API를 부르지 않습니다. 실제 연결 검증은 별도 live 서버 또는 배포에서 `node scripts/live-manual-smoke.mjs <URL>`로1회 실행합니다.
- 퀴즈 점수는 AI 없이 결정론적으로 계산합니다. 직원의 채용 적합성을 자동 판정하지 않습니다.

## 저장과 한계

로그인 없는 체험판입니다. 같은 브라우저에만 기록되며 다른 기기와 공유되지 않습니다. 실제 채용용 인증·부정행위 방지·실제 POS 연동은 없습니다. 자료는 최신 점포 정책을 보장하지 않습니다.

규칙/체크리스트/Q&A는 `firstday.zip`, 퀴즈는 `firstday-training-v1`, 업로드 문서는 `firstday-uploaded-manual-v1`에 저장합니다. 체크리스트 하단에서 확인 후 초기화하면 앱의 세 저장 영역을 초기화합니다. 이전 버전의 대화형 연습 자료는 내부 호환성을 위해 남지만 새 점수 기록과 합산하지 않습니다.

## 디자인과 배포

- Figma: https://www.figma.com/design/KYOkEnYcKTRuPpe6hi3QPW?node-id=6-15
- App: https://gs-hack-seven.vercel.app
- Source: https://github.com/Hee1-99/gs-hack
- 기존 프로젝트에 `vercel deploy --prod --build-env AI_DEMO_MODE=true --env AI_DEMO_MODE=false`로 배포합니다. `.env.local`은 업로드하지 않습니다.

최신 실제 검증 결과는 `progress.md`, `docs/verification-matrix.md`를 확인하세요. 로컬 테스트, 실제 Gemini와 배포 검증은 서로 구분합니다.

제공된 모바일 앱 레퍼런스를 바탕으로 청록색·라벤더 배경·둥근 흰색 카드와 모바일 하단 메뉴를 적용했습니다. 제품/디자인 기준은 `PRODUCT.md`, `DESIGN.md`에 기록하며, 매장과 도구 그래픽은 직접 작성한 SVG입니다.
