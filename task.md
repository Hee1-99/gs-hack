# 첫날.zip MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 경영주가 등록한 하나의 매장 규칙이 신입 스토어 매니저의 2+1 시뮬레이션, 근무 중 Q&A, 체크리스트와 경영주 대시보드까지 이어지는 시연 가능한 웹앱 MVP를 만든다.

**Architecture:** Next.js App Router 앱 안에서 구조화된 Seed와 저장소 인터페이스를 단일 데이터 원천으로 사용한다. 순수 TypeScript 시뮬레이션 엔진이 사실과 행동 판정을 관리하고, 서버 Route Handler의 Gemini 어댑터는 자연어 표현만 생성하며 실패 시 결정론적 데모 응답으로 전환한다.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Gemini server API, Vitest, Testing Library, Playwright, browser local persistence

**Spec:** `prd.md`

## Global Constraints

- 실제 GS25 POS·사내 시스템·상품·개인정보를 사용하지 않고 합성 데이터만 사용한다.
- `GEMINI_API_KEY`는 서버에서만 읽고 클라이언트 코드·로그·Git에 노출하지 않는다.
- 상품·행사 사실과 행동 판정은 LLM이 아닌 구조화 데이터와 결정론적 코드가 관리한다.
- 매뉴얼에 근거가 없는 답변은 생성하지 않고 `경영주 확인 필요`로 기록한다.
- 사용자 노출 문구는 `스토어 매니저`, `경영주`로 통일한다.
- P0를 검증하기 전에는 P1·P2 범위를 시작하지 않는다.

## Review Focus

- Gemini 키 없음·타임아웃·잘못된 응답에서도 데모 모드로 전체 흐름이 이어져야 한다.
- 규칙 수정 전 진행 중인 세션은 스냅샷을 유지하고, 새 세션과 새 Q&A만 최신 규칙을 사용해야 한다.
- POS를 조회하지 않은 정답을 올바른 절차로 평가해서는 안 된다.
- 근거 규칙이 없는 질문은 그럴듯한 답변 대신 미해결 상태와 경영주 확인 안내를 생성해야 한다.
- 손상되거나 오래된 로컬 저장 데이터는 Seed 초기 상태로 안전하게 복구되어야 한다.

---

## Task 1: 프로젝트 기반과 품질 게이트

**Deliverable:** 실행·테스트·빌드가 가능한 Next.js 앱 골격과 공통 검증 명령

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/test/setup.ts`, `tests/e2e/smoke.spec.ts`
- Create: `README.md`

**Interfaces:**
- Produces: `npm run dev`, `npm test`, `npm run test:e2e`, `npm run build`

- [ ] **Step 1: 테스트와 빌드 스크립트가 포함된 프로젝트를 초기화한다.**

  `package.json`에 최소 다음 스크립트를 둔다.

  ```json
  {
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "test": "vitest run",
      "test:watch": "vitest",
      "test:e2e": "playwright test"
    }
  }
  ```

- [ ] **Step 2: 홈 스모크 E2E를 먼저 작성한다.**

  ```ts
  import { expect, test } from '@playwright/test'

  test('shows both demo roles', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /스토어 매니저/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /경영주/ })).toBeVisible()
  })
  ```

- [ ] **Step 3: 최소 홈과 레이아웃을 구현하고 스모크 테스트를 통과시킨다.**
- [ ] **Step 4: `.env.local`이 Git 추적 대상이 아닌지 `git status --short --ignored`로 확인한다.**
- [ ] **Step 5: `npm test`, `npm run build`, 스모크 E2E를 실행하고 실제 결과를 `progress.md`에 기록한다.**

## Task 2: 도메인 모델, 합성 Seed, 저장소

**Deliverable:** 모든 기능이 공유하는 타입 안전 데이터와 새로고침 후 유지되는 저장소

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/seed.ts`
- Create: `src/data/store-repository.ts`
- Create: `src/data/local-store-repository.ts`
- Test: `src/data/local-store-repository.test.ts`

**Interfaces:**
- Produces: `StoreRepository`, `createLocalStoreRepository(storage)`, `resetToSeed()`
- Produces types: `StoreRule`, `Product`, `Promotion`, `Scenario`, `SimulationSession`, `ChecklistProgress`, `QuestionLog`

- [ ] **Step 1: 비어 있거나 손상된 저장소가 Seed로 복구되는 실패 테스트를 작성한다.**

  ```ts
  it('recovers invalid persisted data with seed data', () => {
    storage.setItem('firstday.zip', '{broken')
    const repo = createLocalStoreRepository(storage)
    expect(repo.getStore().name).toBe('GS25 첫날점')
    expect(repo.listProducts()).toHaveLength(3)
  })
  ```

- [ ] **Step 2: 엔티티 타입과 합성 데이터의 정확한 값을 정의한다.**
- [ ] **Step 3: 저장소 인터페이스와 localStorage 어댑터를 구현한다.**
- [ ] **Step 4: 규칙 버전 증가, 체크리스트 저장, 질문 로그 저장, 전체 초기화 테스트를 추가한다.**
- [ ] **Step 5: 관련 테스트와 전체 테스트를 실행하고 결과를 기록한다.**

## Task 3: 경영주 매뉴얼 관리와 역할별 셸

**Deliverable:** 역할 전환, 경영주 매뉴얼 조회·수정·저장, 규칙 버전 표시

**Files:**
- Create: `src/app/manager/layout.tsx`, `src/app/manager/manual/page.tsx`
- Create: `src/app/crew/layout.tsx`, `src/app/crew/page.tsx`
- Create: `src/features/manual/manual-editor.tsx`
- Test: `src/features/manual/manual-editor.test.tsx`

**Interfaces:**
- Consumes: `StoreRepository.listRules()`, `StoreRepository.updateRule()`
- Produces: latest saved `StoreRule` with incremented `version` and `updatedAt`

- [ ] **Step 1: 규칙 저장 시 버전이 증가하고 수정 내용이 다시 표시되는 컴포넌트 테스트를 작성한다.**
- [ ] **Step 2: 모바일 우선 스토어 매니저 셸과 반응형 경영주 셸을 구현한다.**
- [ ] **Step 3: 제목·내용·분류·예외 대응을 수정하는 매뉴얼 편집기를 구현한다.**
- [ ] **Step 4: 합성 데이터 안내와 저장 성공·실패 상태를 표시한다.**
- [ ] **Step 5: 새로고침 후 규칙과 버전이 유지되는 E2E를 추가해 통과시킨다.**

## Task 4: 결정론적 시뮬레이션 엔진과 가상 POS

**Deliverable:** 규칙 스냅샷, 행동 로그, POS 조회에 따라 결과가 달라지는 순수 도메인 엔진

**Files:**
- Create: `src/features/simulation/engine.ts`
- Create: `src/features/simulation/rule-validator.ts`
- Create: `src/features/simulation/virtual-pos.tsx`
- Test: `src/features/simulation/engine.test.ts`
- Test: `src/features/simulation/rule-validator.test.ts`

**Interfaces:**
- Produces: `startSession(scenario, rules): SimulationSession`
- Produces: `recordEvent(session, event): SimulationSession`
- Produces: `validateSession(session): VerifiedResults`

- [ ] **Step 1: POS 미조회 정답을 절차 미준수로 판정하는 실패 테스트를 작성한다.**

  ```ts
  it('does not treat a lucky answer as a verified procedure', () => {
    const result = validateSession(sessionWithCorrectAnswerButNoLookup)
    expect(result.finalAnswerCorrect).toBe(true)
    expect(result.promotionLookupPerformed).toBe(false)
    expect(result.procedureFollowed).toBe(false)
  })
  ```

- [ ] **Step 2: 규칙 스냅샷과 이벤트 타입을 포함한 상태 전이를 구현한다.**
- [ ] **Step 3: 상품명·가격·재고·행사 조건을 조회하고 `pos_lookup` 이벤트를 남기는 POS를 구현한다.**
- [ ] **Step 4: 진행 중 세션은 이전 규칙, 새 세션은 변경된 규칙을 사용하는 테스트를 추가한다.**
- [ ] **Step 5: 순수 도메인 테스트 전체를 통과시킨다.**

## Task 5: Gemini 어댑터와 데모 폴백

**Deliverable:** 비밀 값을 노출하지 않는 고객·코치 서버 API와 장애 시 결정론적 응답

**Files:**
- Create: `src/ai/types.ts`, `src/ai/gemini-client.ts`, `src/ai/demo-responses.ts`
- Create: `src/app/api/ai/customer/route.ts`
- Create: `src/app/api/ai/coach/route.ts`
- Test: `src/ai/gemini-client.test.ts`

**Interfaces:**
- Produces: `generateCustomerReply(input): Promise<AiReply>`
- Produces: `generateCoaching(input): Promise<AiReply>`
- `AiReply` includes `content`, `mode: 'gemini' | 'demo'`, `groundingRuleIds`

- [ ] **Step 1: 키 없음, 타임아웃, 잘못된 형식이 모두 `mode: 'demo'`를 반환하는 테스트를 작성한다.**
- [ ] **Step 2: 공식 Gemini 서버 SDK를 Route Handler 내부에서만 초기화한다.**
- [ ] **Step 3: 고정 사실과 검증 결과를 변경하지 못하도록 입력·출력 스키마를 제한한다.**
- [ ] **Step 4: 오류 객체와 로그에서 API 키 및 전체 프롬프트를 제거한다.**
- [ ] **Step 5: 실제 키 없이 데모 모드 통합 테스트를 통과시키고, 실제 키 검증은 별도 상태로 기록한다.**

## Task 6: 시뮬레이션 UI, 피드백, 재도전

**Deliverable:** 잘못된 첫 시도와 POS 조회 후 개선된 재도전을 비교할 수 있는 화면

**Files:**
- Create: `src/app/crew/simulation/page.tsx`
- Create: `src/features/simulation/simulation-shell.tsx`
- Create: `src/features/simulation/feedback-panel.tsx`
- Test: `src/features/simulation/simulation-shell.test.tsx`
- Test: `tests/e2e/simulation.spec.ts`

**Interfaces:**
- Consumes: simulation engine, customer API, coach API, repository
- Produces: completed sessions and feedback persisted for dashboard use

- [ ] **Step 1: 조회 없이 확정 답변한 첫 시도에서 절차 누락 피드백이 보이는 E2E를 작성한다.**
- [ ] **Step 2: 대화, 행동 버튼, 가상 POS, 현재 진행 상태를 한 화면 흐름으로 구현한다.**
- [ ] **Step 3: 결정론적 검증 결과와 AI 코칭 문구를 분리해 표시한다.**
- [ ] **Step 4: 변형 시나리오 재도전과 전후 행동 비교를 구현한다.**
- [ ] **Step 5: POS 조회 후 응대한 재도전에서 개선된 결과가 보이는 E2E를 통과시킨다.**

## Task 7: 근거 기반 업무 Q&A

**Deliverable:** 최신 매뉴얼 규칙에 근거한 답변, 인용, 미해결 질문 기록

**Files:**
- Create: `src/features/qa/rule-search.ts`
- Create: `src/app/api/ai/qa/route.ts`
- Create: `src/app/crew/support/page.tsx`
- Test: `src/features/qa/rule-search.test.ts`
- Test: `tests/e2e/qa.spec.ts`

**Interfaces:**
- Produces: `findRelevantRules(question, rules): StoreRule[]`
- Produces Q&A response: `answer`, `ruleIds`, `ruleVersion`, `resolutionStatus`

- [ ] **Step 1: 관련 규칙이 없으면 미해결로 반환하는 실패 테스트를 작성한다.**
- [ ] **Step 2: 작은 데이터셋에 맞는 결정론적 규칙 검색을 구현한다.**
- [ ] **Step 3: 근거 규칙이 있을 때만 Gemini가 표현을 생성하도록 Q&A Route를 구현한다.**
- [ ] **Step 4: 규칙 제목·버전, 데모 모드, 경영주 확인 필요 상태를 UI에 표시한다.**
- [ ] **Step 5: 경영주가 규칙을 수정한 뒤 새 질문에 변경 내용이 반영되는 E2E를 통과시킨다.**

## Task 8: 업무 체크리스트와 경영주 대시보드

**Deliverable:** 영속 체크리스트와 지원 목적의 운영 현황 요약

**Files:**
- Create: `src/app/crew/checklist/page.tsx`
- Create: `src/features/checklist/checklist.tsx`
- Create: `src/app/manager/dashboard/page.tsx`
- Create: `src/features/dashboard/dashboard-summary.ts`
- Test: `src/features/dashboard/dashboard-summary.test.ts`
- Test: `tests/e2e/dashboard.spec.ts`

**Interfaces:**
- Consumes: sessions, checklist progress, question logs
- Produces: counts for training, checklist, questions, needs-manager-review

- [ ] **Step 1: 완료·확인 필요 상태와 집계를 검증하는 테스트를 작성한다.**
- [ ] **Step 2: 네 개 업무와 세 상태를 제공하는 체크리스트를 구현한다.**
- [ ] **Step 3: 새로고침 유지와 확인 후 초기화를 구현한다.**
- [ ] **Step 4: 훈련·질문·체크리스트·확인 필요를 요약하는 대시보드를 구현한다.**
- [ ] **Step 5: 점수·순위·적합성 판단 문구가 없고 전체 집계가 정확한지 테스트한다.**

## Task 9: 전 구간 검증, 접근성, 제출 준비

**Deliverable:** 초기 상태부터 마지막 대시보드까지 재현 가능한 데모와 제출 근거

**Files:**
- Modify: `tests/e2e/demo-flow.spec.ts`
- Modify: `README.md`
- Modify: `progress.md`
- Modify: `task.md`

**Interfaces:**
- Consumes: all P0 features
- Produces: verified demo script and reproducible commands

- [ ] **Step 1: 전체 P0 수직 흐름 E2E를 작성한다.**

  ```ts
  test('completes the manager-to-crew-to-manager demo loop', async ({ page }) => {
    // Seed 초기화 → 규칙 수정 → 잘못된 첫 시도 → POS 재도전
    // → 최신 규칙 Q&A → 체크리스트 → 경영주 대시보드 집계
  })
  ```

- [ ] **Step 2: 모바일·데스크톱 핵심 화면, 키보드 이동, 레이블, 로딩·빈 상태·오류 상태를 확인한다.**
- [ ] **Step 3: `npm test`, `npm run test:e2e`, `npm run build`를 깨끗한 상태에서 실행한다.**
- [ ] **Step 4: Gemini 키 없음과 실제 키 사용을 구분해 검증하고 결과를 기록한다.**
- [ ] **Step 5: README에 설치, 환경변수, 합성 데이터, 데모 동선, 데모 모드, 알려진 한계를 기록한다.**
- [ ] **Step 6: 비밀 값과 실제 데이터가 Git 추적 파일·빌드 출력·브라우저 번들에 없는지 점검한다.**
- [ ] **Step 7: P0 수용 기준을 하나씩 실제 증거와 대조하고 모두 충족했을 때만 Ralph 반복을 종료한다.**

## P1 Backlog — P0 완료 후에만 시작

- [ ] 담배 위치·배달 주문·유통기한·물류·인수인계 시나리오 확장
- [ ] 시간대별 체크리스트
- [ ] 질문 주제 분류와 반복 질문 추이
- [ ] 교육 전후 행동 개선 비교 고도화
- [ ] Supabase 저장소 어댑터와 정식 역할 권한
