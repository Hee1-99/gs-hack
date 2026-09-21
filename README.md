# GStep

실제 공개 GS25 교육 자료를 바탕으로, 스토어 매니저가 첫 근무를 미리 경험하는 AI 업무 연습 앱입니다. 제공된 매뉴얼에서 본문을 확인한 58개 요약을 사용합니다. 최신 내부 매뉴얼 전체를 의미하지 않으며 상품·가격·POS 그래픽은 교육용 합성 데이터입니다.

- **36단계 업무 연습**: 근무 준비, 상품 관리, POS 판매, 결제·서비스, 위생·안전, 고객 응대의 6개 영역. 전체 또는 영역별 연습을 선택합니다.
- **서술형 AI 채점**: 고객 응대 등 5문항을 Gemini가 기준별로 평가합니다. 객관식은 정해진 답으로 채점합니다. 정확도 90점 + 응답 시간 10점으로 결과를 보여줍니다.
- **AI 고객 대화**: 행사 문의·불만·환불 상황의 손님과 자유롭게 대화하고 4항목의 코칭을 받습니다. 대화 점수는 퀴즈 점수와 별도입니다.
- **매장 Q&A**: 매뉴얼 근거, 일반적인 조언, 매장 확인이 필요한 질문을 구분하는 친절한 선배 매니저. 12개 추천 질문과 텍스트 매뉴얼 업로드를 지원합니다.
- **계정과 매장**: 아이디·비밀번호로 로그인하고, 경영주는 새 매장과 직원 초대를 만들며 스토어 매니저는 초대 코드로 참여합니다. 기록·체크리스트·추가 규칙을 Supabase에 저장합니다.

## 실행과 검증

Node.js 24에서 `npm ci`, `npm run dev`. `.env.example`의 설정을 `.env.local`에 넣습니다. Gemini 키는 서버에서만 읽고, Supabase는 공개 publishable/anon 키만 사용합니다.

반복 가능한 회귀 검사는 외부 AI와 실제 계정 저장소를 사용하지 않는 빌드에서 실행합니다. PowerShell의 환경 변수는 `.env.local`보다 우선합니다.

```powershell
$env:AI_DEMO_MODE='true'
$env:NEXT_PUBLIC_SUPABASE_URL=''
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=''
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY=''
npm test
npm run build
npm run test:e2e
```

E2E는 포트 3100의 프로덕션 서버에서 데스크톱 1440×900·모바일 390×844를 검사합니다. 재시도는 0회, 실패 trace는 `test-results/`에 남습니다. 빌드 전에 개발 서버를 종료하세요. 빌드 출력은 `.firstday-build`입니다. 실제 계정 연결 빌드는 Supabase 환경 변수 덮어쓰기를 제거한 새 터미널에서 실행합니다.

## 점수와 AI

정확도를 먼저 평가하고 시간 보너스를 더합니다. 객관식 정답 또는 서술형 기준 점수 70점 이상일 때만 시간 보너스가 있으며, 3분 이내는 10점, 이후 10분까지 점차 줄어듭니다. 빠른 오답은 보너스를 받지 않습니다. AI 응답과 해설을 기다리는 시간은 제외하고, 문제 풀이 도중 새로고침하거나 다른 탭으로 이동한 시간은 포함합니다.

서술형은 서버의 허용된 문항·루브릭으로 Gemini에 요청하고 구조·점수 범위를 검증합니다. AI 호출 실패 시 명시적인 키워드 기반 데모 평가를 제공합니다. HTTP 오류는 답안을 유지하고 다시 제출할 수 있습니다. `AI_DEMO_MODE=true`는 외부 AI를 호출하지 않습니다. 대기 애니메이션도 객관식 검증과 실제 AI 요청을 구분합니다.

자료 생성은 `node scripts/generate-manual-reference.mjs`를 사용합니다. 출처는 `docs/gs25-store-manager-training-map.md`이며 미확보 본문 20개는 제외합니다. 업로드는 UTF-8 `.md`/`.txt`, 최대 20KB입니다. 업로드 문서는 계정별 브라우저 저장소에 보관하며 질문할 때 서버 및 Gemini에 전달합니다. 일반 답변에 매뉴얼 출처를 임의로 붙이지 않습니다.

별도 라이브 서버·배포에서 아래 스모크를 한 번씩 실행할 수 있습니다. 실제 응답을 검증하고 키나 답변 전문은 출력하지 않습니다.

```text
node scripts/live-training-grade-smoke.mjs <URL>
node scripts/live-chat-smoke.mjs <URL>
node scripts/live-general-qa-smoke.mjs <URL>
node scripts/live-manual-smoke.mjs <URL>
```

## Supabase와 저장

설정·마이그레이션·RLS 검증은 [supabase/README.md](supabase/README.md)를 참고하세요. 아이디는 내부 인증 주소로 변환하지만 사용자에게 이메일을 요구하지 않습니다. Supabase의 Confirm email은 꺼야 합니다. 최초 SQL 적용은 SQL Editor 또는 관리 권한이 있는 배포 경로에서 실행합니다.

경영주는 자신의 매장 직원 기록·점수를 조회하고 체크리스트·추가 규칙을 설정합니다. 스토어 매니저는 자기 기록과 체크리스트 상태만 저장합니다. 권한은 RLS로 검사하며, 화면의 역할 선택만으로 기존 매장 권한을 얻을 수 없습니다. 현재는 계정당 매장 1개, 초대당 직원 1명입니다.

로그인하지 않은 체험은 브라우저에만 저장합니다. 체험 기록을 로그인 계정으로 자동 합치지 않습니다. 기존 12단계 기록과 점수는 보존하며 새 36단계 기록과 구분합니다. 체험 초기화는 앱의 퀴즈·대화·업로드·체크리스트·Q&A를 지우고 다른 사이트의 데이터와 클라우드 기록은 건드리지 않습니다.

점수는 교육 피드백입니다. 실제 POS 연동, 부정행위 방지 시험 인증, 자동 채용 판단 기능은 없습니다. 매장별 최신 정책은 별도 확인이 필요합니다.

## 디자인과 배포

청록색·라벤더 배경·둥근 카드의 사용자 제공 레퍼런스를 적용했습니다. GStep 로고와 그래픽은 직접 작성한 SVG입니다. 제품·디자인 기준은 `PRODUCT.md`, `DESIGN.md`에 기록합니다.

- App: https://gs-hack-seven.vercel.app
- Source: https://github.com/Hee1-99/gs-hack
- 이전 레퍼런스 디자인 Figma: https://www.figma.com/design/KYOkEnYcKTRuPpe6hi3QPW?node-id=6-15

기존 프로젝트에 `vercel deploy --prod --build-env AI_DEMO_MODE=true --env AI_DEMO_MODE=false`로 배포합니다. Supabase 공개 설정은 Vercel 빌드 환경에도 필요하며, `.env.local`은 업로드하지 않습니다. 실제 검증 결과는 `progress.md`, `docs/verification-matrix.md`에서 로컬·라이브·배포를 구분해 기록합니다.
