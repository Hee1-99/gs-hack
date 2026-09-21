# FirstDay.zip MVP Implementation Plan

> **For agentic workers:** Follow `AGENTS.md` using tools available in the current session. No external skill or sub-agent is required. Steps use checkbox (`- [ ]`) syntax; only executed and verified work may be checked.

**Goal:** Build a demonstrable web app MVP where one store rule registered by the `경영주` carries through a new `스토어 매니저`'s 2+1 simulation, on-shift Q&A, checklist, and the manager dashboard.

**Architecture:** Use structured seed data and a repository interface as the single source of truth within a Next.js App Router application. A pure TypeScript simulation engine manages facts and behavioral evaluation, while a Gemini adapter in a server Route Handler generates only natural-language expression and falls back to deterministic demo responses on failure.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Gemini server API, Vitest, Testing Library, Playwright, browser-local persistence

**Spec:** `prd.md`

## Execution Schedule and Evidence

- All Tasks 1–16 are required P0 work. Complete one eligible task at a time in numeric order, except when a documented blocker permits a later independent task whose dependencies are already verified.
- Tasks 1–9: establish the complete demo flow (planning estimate: 3–4 hours). Tasks 10–15: failure recovery and browser reliability (3–5 hours). Task 16: release rehearsal and evidence (1 hour). Total planning envelope: 7–10 hours, not a claimed runtime or a per-task delay requirement.
- Measure actual active work toward the 420-minute target under `AGENTS.md`. Do not slow down to match estimates. Task 9 is a core-flow checkpoint; Task 16 owns final completion.
- Each task boundary requires `npm test`, `npm run build`, and relevant browser tests for changed flows, even where an individual step lists only targeted tests. If a command cannot run, record blocked rather than passed. Run the complete E2E suite at the final gate.
- A later task may find that an earlier implementation already satisfies its criteria. Verify that evidence and mark it complete without rewriting code or duplicating tests. Do not create a fixed number of tests or screenshots just to fill time.
- For document-only maintenance, use a reproducible document check instead of inventing an application test. Do not start application implementation just because a planning edit was requested.

## Global Constraints

- Use only synthetic data—never real GS25 POS data, internal systems, products, or personal information.
- Read `GEMINI_API_KEY` only on the server, and never expose it in client code, logs, or Git.
- Structured data and deterministic code—not the LLM—manage product and promotion facts and behavioral evaluation.
- Do not generate answers without support in the manual; record them as `경영주 확인 필요`.
- Standardize user-facing role labels as `스토어 매니저` and `경영주`.
- Do not begin P1 or P2 scope before P0 is verified.

## Review Focus

- The full flow must continue in demo mode when the Gemini key is absent, a request times out, or the response is invalid.
- Sessions already in progress before a rule edit must retain their snapshot; only new sessions and new Q&A requests use the latest rule.
- A correct answer without a POS lookup must not be evaluated as following the correct procedure.
- A question without a supporting rule must produce an unresolved status and a prompt to confirm with the `경영주`, not a plausible-sounding answer.
- Corrupted or stale locally stored data must recover safely to the seed state.

---

## Task 1: Project Foundation and Quality Gates

**Depends on:** none

**Deliverable:** A Next.js application skeleton that can run, test, and build, with shared verification commands

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/test/setup.ts`, `tests/e2e/smoke.spec.ts`
- Create: `README.md`

**Interfaces:**
- Produces: `npm run dev`, `npm test`, `npm run test:e2e`, `npm run build`

- [x] **Step 1: Initialize the project with test and build scripts.**

  Include at least the following scripts in `package.json`:

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

- [x] **Step 2: Write the home-page smoke E2E first.**

  ```ts
  import { expect, test } from '@playwright/test'

  test('shows both demo roles', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /스토어 매니저/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /경영주/ })).toBeVisible()
  })
  ```

- [x] **Step 3: Implement the minimum home page and layout, and make the smoke test pass.**
- [x] **Step 4: Confirm with `git check-ignore .env.local` and `git ls-files -- .env.local` that `.env.local` is ignored and not tracked, without reading or printing its contents.**
- [x] **Step 5: Run `npm test`, `npm run build`, and the smoke E2E, then record the actual results in `progress.md`.**

## Task 2: Domain Model, Synthetic Seed, and Repository

**Depends on:** Task 1

**Deliverable:** Type-safe shared data for every feature and a repository that persists after refresh

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/seed.ts`
- Create: `src/data/store-repository.ts`
- Create: `src/data/local-store-repository.ts`
- Test: `src/data/local-store-repository.test.ts`

**Interfaces:**
- Produces: `StoreRepository`, `createLocalStoreRepository(storage)`, `resetToSeed()`
- Produces types: `StoreRule`, `Product`, `Promotion`, `Scenario`, `SimulationSession`, `ChecklistProgress`, `QuestionLog`

- [x] **Step 1: Write a failing test showing that empty or corrupted storage recovers from the seed.**

  ```ts
  it('recovers invalid persisted data with seed data', () => {
    storage.setItem('firstday.zip', '{broken')
    const repo = createLocalStoreRepository(storage)
    expect(repo.getStore().name).toBe('GS25 첫날점')
    expect(repo.listProducts()).toHaveLength(3)
  })
  ```

- [x] **Step 2: Define the entity types and exact synthetic-data values.**
- [x] **Step 3: Implement the repository interface and localStorage adapter.**
- [x] **Step 4: Add tests for incrementing rule versions, saving checklist state, saving question logs, and resetting all data.**
- [x] **Step 5: Run the relevant tests and the full test suite, then record the results.**

## Task 3: Manager Manual Management and Role-specific Shells

**Depends on:** Task 2

**Deliverable:** Role switching, manager manual viewing/editing/saving, and rule-version display

**Files:**
- Create: `src/app/manager/layout.tsx`, `src/app/manager/manual/page.tsx`
- Create: `src/app/crew/layout.tsx`, `src/app/crew/page.tsx`
- Create: `src/features/manual/manual-editor.tsx`
- Test: `src/features/manual/manual-editor.test.tsx`

**Interfaces:**
- Consumes: `StoreRepository.listRules()`, `StoreRepository.updateRule()`
- Produces: latest saved `StoreRule` with incremented `version` and `updatedAt`

- [x] **Step 1: Write a component test showing that saving a rule increments its version and displays the edited content again.**
- [x] **Step 2: Implement a mobile-first `스토어 매니저` shell and a responsive `경영주` shell.**
- [x] **Step 3: Implement a manual editor for title, content, category, and exception handling.**
- [x] **Step 4: Display the synthetic-data notice and save success/failure states.**
- [x] **Step 5: Add and pass an E2E test showing that the rule and version persist after refresh.**
- [x] **Step 6: Allow the `경영주` to create a missing rule with a stable ID, validate required fields, and verify that it appears after refresh.**

## Task 4: Deterministic Simulation Engine and Virtual POS

**Depends on:** Task 2

**Deliverable:** A pure domain engine whose results vary based on rule snapshots, action logs, and POS lookups

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

- [x] **Step 1: Write a failing test that treats a correct answer without a POS lookup as a process violation.**

  ```ts
  it('does not treat a lucky answer as a verified procedure', () => {
    const result = validateSession(sessionWithCorrectAnswerButNoLookup)
    expect(result.finalAnswerCorrect).toBe(true)
    expect(result.promotionLookupPerformed).toBe(false)
    expect(result.procedureFollowed).toBe(false)
  })
  ```

- [x] **Step 2: Implement state transitions that include rule snapshots and event types.**
- [x] **Step 3: Implement a POS that retrieves product name, price, inventory, and promotion conditions, and records a `pos_lookup` event.**
- [x] **Step 4: Add a test proving that an in-progress session uses the old rule while a new session uses the edited rule.**
- [x] **Step 5: Make the complete pure-domain test suite pass.**

## Task 5: Gemini Adapter and Demo Fallback

**Depends on:** Task 4

**Deliverable:** Customer and coach server APIs that do not expose secrets, with deterministic responses during failures

**Files:**
- Create: `src/ai/types.ts`, `src/ai/gemini-client.ts`, `src/ai/demo-responses.ts`
- Create: `src/app/api/ai/customer/route.ts`
- Create: `src/app/api/ai/coach/route.ts`
- Test: `src/ai/gemini-client.test.ts`

**Interfaces:**
- Produces: `generateCustomerReply(input): Promise<AiReply>`
- Produces: `generateCoaching(input): Promise<AiReply>`
- `AiReply` includes `content`, `mode: 'gemini' | 'demo'`, `groundingRuleIds`

- [x] **Step 1: Write tests showing that a missing key, timeout, and invalid format all return `mode: 'demo'`.**
- [x] **Step 1a: Test that `AI_DEMO_MODE=true` prevents every provider call even when a key is configured; keep this setting for unattended tests and browser runs.**
- [x] **Step 2: Initialize the official Gemini server SDK only inside the Route Handler.**
- [x] **Step 3: Restrict input and output schemas so they cannot change fixed facts or validation results.**
- [x] **Step 4: Remove API keys and full prompts from error objects and logs.**
- [x] **Step 5: Pass the demo-mode integration test without a real key, and record real-key verification as a separate status.**

## Task 6: Simulation UI, Feedback, and Retry

**Depends on:** Task 3, Task 4, Task 5

**Deliverable:** A screen that compares an incorrect first attempt with an improved retry after a POS lookup

**Files:**
- Create: `src/app/crew/simulation/page.tsx`
- Create: `src/features/simulation/simulation-shell.tsx`
- Create: `src/features/simulation/feedback-panel.tsx`
- Test: `src/features/simulation/simulation-shell.test.tsx`
- Test: `tests/e2e/simulation.spec.ts`

**Interfaces:**
- Consumes: simulation engine, customer API, coach API, repository
- Produces: completed sessions and feedback persisted for dashboard use

- [x] **Step 1: Write an E2E test showing process-omission feedback after the first attempt gives a definitive answer without a lookup.**
- [x] **Step 2: Implement conversation, action buttons, the virtual POS, and current progress as one screen flow.**
- [x] **Step 3: Display deterministic validation results separately from AI coaching text.**
- [x] **Step 4: Implement a variant-scenario retry and a before/after behavior comparison.**
- [x] **Step 5: Pass the E2E showing improved results when the retry answers after a POS lookup.**

## Task 7: Grounded Work Q&A

**Depends on:** Task 3, Task 5

**Deliverable:** Answers grounded in the latest manual rules, citations, and unresolved-question logging

**Files:**
- Create: `src/features/qa/rule-search.ts`
- Create: `src/app/api/ai/qa/route.ts`
- Create: `src/app/crew/support/page.tsx`
- Test: `src/features/qa/rule-search.test.ts`
- Test: `tests/e2e/qa.spec.ts`

**Interfaces:**
- Produces: `findRelevantRules(question, rules): StoreRule[]`
- Produces Q&A response: `answer`, `ruleIds`, `ruleVersion`, `resolutionStatus`

- [x] **Step 1: Write a failing test showing that a question without a related rule is returned as unresolved.**
- [x] **Step 2: Implement deterministic rule search appropriate for the small dataset.**
- [x] **Step 3: Implement the Q&A Route so Gemini generates phrasing only when supporting rules exist.**
- [x] **Step 4: Display the rule title/version, demo mode, and `경영주 확인 필요` state in the UI.**
- [x] **Step 5: Pass the E2E showing that after the `경영주` edits a rule, a new question reflects the changed content.**

## Task 8: Work Checklist and Manager Dashboard

**Depends on:** Task 6, Task 7

**Deliverable:** A persistent checklist and a support-oriented operational summary

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

- [x] **Step 1: Write tests for completed and confirmation-needed states and their aggregations.**
- [x] **Step 2: Implement a checklist with four tasks and three states.**
- [x] **Step 3: Implement refresh persistence and reset after confirmation.**
- [x] **Step 4: Implement a dashboard summarizing training, questions, checklist status, and confirmation-needed items.**
- [x] **Step 5: Test that counts are accurate and there is no language about scores, rankings, or suitability judgments.**
- [x] **Step 6: Allow the `경영주` to create/edit checklist items with stable IDs; verify that saved changes appear in the `스토어 매니저` checklist after refresh without clearing unrelated progress.**

## Task 9: Core-flow Verification and Demo Documentation

**Depends on:** Task 8

**Deliverable:** A reproducible demo and submission evidence from the initial state through the final dashboard

**Files:**
- Modify: `tests/e2e/demo-flow.spec.ts`
- Modify: `README.md`
- Modify: `progress.md`
- Modify: `task.md`

**Interfaces:**
- Consumes: all P0 features
- Produces: verified demo script and reproducible commands

- [x] **Step 1: Write the full P0 vertical-flow E2E.**

  ```ts
  test('completes the manager-to-crew-to-manager demo loop', async ({ page }) => {
    // Reset seed → edit rule → incorrect first attempt → POS retry
    // → latest-rule Q&A → checklist → manager dashboard aggregation
  })
  ```

- [x] **Step 2: Check core mobile and desktop screens, keyboard navigation, labels, loading states, empty states, and error states.**
- [x] **Step 3: Run `npm test`, `npm run test:e2e`, and `npm run build` from a clean state.**
- [x] **Step 4: Verify forced demo mode and the mocked missing-key case. Run a separate bounded live Gemini smoke check when an existing key is available; this is pre-authorized. Record the actual result or `not run` with the missing prerequisite, then restore forced demo mode for regression tests.**
- [x] **Step 5: Document installation, environment variables, synthetic data, the demo flow, demo mode, and known limitations in the README.**
- [x] **Step 6: Check that no secret values or real data appear in Git-tracked files, build output, or the browser bundle.**
- [x] **Step 7: Record the core-flow checkpoint and outstanding P0 evidence in `docs/verification-matrix.md`, then continue to Task 10. Do not end the run at this checkpoint.**

## Task 10: Persistence Failure and Recovery

**Depends on:** Task 9

**Deliverable:** Honest saved/unsaved behavior and safe recovery for the existing local repository.

**Files:** Repository adapter and tests under `src/data/`; shared persistence UI; `tests/e2e/persistence.spec.ts`.

- [x] **Step 1: Reproduce malformed JSON, valid JSON with an invalid schema, and an unsupported storage version in repository tests.**
- [x] **Step 2: Test storage reads/writes that throw (including quota failure); implement a recoverable seed or an explicit in-memory mode with an unsaved-state notice. Do not show a successful durable save after a failed write.**
- [x] **Step 3: Verify valid saved rules, checklist items, questions, and sessions survive refresh; recovery affects only the app's storage key and never unrelated browser data.**
- [x] **Step 4: Browser-test cancelled reset, confirmed reset, and loading the recovered seed. Verify that reset clears the app's history and counts consistently.**
- [x] **Step 5: Run targeted recovery tests, the full suite, build, and affected E2E; record actual recovery behavior and remaining limits.**

## Task 11: Simulation Event Ordering and Snapshot Integrity

**Depends on:** Task 10

**Deliverable:** Reproducible evaluation of the current primary and variant scenarios under out-of-order and repeated actions.

**Files:** Simulation engine, validator, structured facts and tests; `tests/e2e/simulation.spec.ts`.

- [x] **Step 1: Add table-driven failing cases for answer-before-lookup, lookup-before-answer, lookup-after-answer, wrong-product lookup, and manager-confirmation events. Assert actual expected outcomes, not only snapshots.**
- [x] **Step 2: Ensure a later lookup never erases an earlier unverified definitive answer and an unrelated product lookup cannot satisfy verification. Derive quantities/prices from shared structured facts.**
- [x] **Step 3: Verify a manager rule edit leaves the active session snapshot unchanged, while a new session uses the new version; retry has a distinct session ID and linked prior attempt.**
- [x] **Step 4: Verify duplicate submission, double-click, and returning from the POS do not duplicate completion or lose events. Keep structured answer intent separate from free-form AI phrasing so evaluation does not depend on an LLM verdict.**
- [x] **Step 5: Run the full suite/build and browser first-attempt/retry flow; record deterministic feedback and dashboard counts for both attempts.**

## Task 12: AI Boundary, Timeout, and Grounding Failures

**Depends on:** Task 11

**Deliverable:** Stable customer, coach, and Q&A routes under provider failures without a live paid call.

**Files:** `src/ai/`, all three AI Route Handlers and tests, browser request-failure scenarios.

- [x] **Step 1: Use mocked provider responses for timeout, quota response, empty text, malformed output, unknown rule IDs, and conflicting price/promotion claims; add failing cases only where coverage is absent.**
- [x] **Step 2: Apply a finite timeout/abort policy and validate request size/schema. Reject invalid user requests clearly; use deterministic fallback for provider failures without unbounded retries.**
- [x] **Step 3: Verify server-generated grounding and deterministic verdicts remain authoritative. Render facts from structured data and discard contradictory generated facts; do not rely on prompt instructions alone.**
- [x] **Step 4: Verify forced demo mode makes zero outbound provider calls, fallback displays `데모 모드`, and UI recovers from a failed HTTP request. Use synthetic canary strings in mocked errors to assert raw credentials/prompts never reach responses or logs.**
- [x] **Step 5: Run relevant route/browser tests, full tests and build in forced demo mode. Keep live Gemini evidence separate; bounded live checks are pre-authorized, and `not run` must state the concrete missing prerequisite.**

## Task 13: Manual, Q&A, Checklist, and Dashboard Consistency

**Depends on:** Task 12

**Deliverable:** The manager's edits and worker actions produce consistent, explainable results throughout the existing P0 flow.

**Files:** Manual editor, rule search, checklist, dashboard summary and associated tests.

- [x] **Step 1: Test blank/whitespace input, ambiguous question matches, and unsupported questions. A coincidental keyword must not produce an unsupported definitive answer.**
- [x] **Step 2: Browser-test unresolved question → manager adds a supporting synthetic rule → new question receives that rule/version. Preserve the original question record and distinguish past unresolved history from a new resolved answer.**
- [x] **Step 3: Verify manager-created and edited checklist items retain stable IDs; transitions among all three states persist and update dashboard counts without duplication.**
- [x] **Step 4: Define and test dashboard counting semantics for completed training attempts, checklist completion, question count, and confirmation-needed items. Verify empty, partially complete, repeated action, and reset states. Document these semantics without adding personnel scoring.**
- [x] **Step 5: Run targeted tests, full tests/build, and the changed user flows; link the observed counts and rule versions in the verification matrix.**

## Task 14: Responsive, Keyboard, and Failure-state Usability

**Depends on:** Task 13

**Deliverable:** Both roles can complete the same P0 journey on a small screen and with keyboard controls.

**Files:** Existing pages/components/styles, targeted component/E2E tests, browser evidence.

- [x] **Step 1: Inspect home, manual editor, simulation/POS/feedback, Q&A, checklist, and dashboard at 390×844 and 1440×900; record concrete overflow, hidden-control, or reading-order failures before fixing them.**
- [x] **Step 2: Complete role switching, editing, POS lookup, retry, Q&A and checklist by keyboard; verify labels, visible focus, focus return after dialogs, and announcements for async status.**
- [x] **Step 3: Verify disabled/pending behavior prevents duplicate actions and loading/empty/error/save-failure states give an actionable next step. Ensure retry preserves entered content where appropriate.**
- [x] **Step 4: Fix observed usability defects while preserving the established flow; visibly distinguish synthetic data, demo role switching, generated wording, and manager-confirmation status. Do not redesign working screens just to consume time.**
- [x] **Step 5: Run relevant regression tests, full tests/build, and repeat only affected browser checks; record viewports and screenshots of the verified flow.**

## Task 15: Production-server Browser Regression

**Depends on:** Task 14

**Deliverable:** Isolated, reproducible E2E coverage exercising the built app rather than only its development server.

**Files:** `playwright.config.ts`, `package.json`, `tests/e2e/`, test fixtures, README verification commands.

- [x] **Step 1: Configure and document an E2E production-server command with forced demo mode, isolated test storage/browser contexts, and no dependency on a pre-existing development server. Use the existing test framework rather than adding a second runner.**
- [x] **Step 2: Run the complete journey from a fresh seed at mobile and desktop sizes: manager rule edit, incorrect attempt, POS retry, grounded and unresolved Q&A, checklist changes, and exact dashboard counts.**
- [x] **Step 3: Verify refresh/direct-route entry and back navigation, plus rule edits during an active session. Inspect browser console errors, failed app requests, and hydration problems and fix observed defects.**
- [x] **Step 4: Capture useful failure traces/screenshots using synthetic data, remove arbitrary test sleeps in favor of observable state, and fix fixture isolation rather than masking intermittent failures with broad retries.**
- [x] **Step 5: Run the full suite/build and complete production-server E2E; record commands, environment mode, actual results and evidence paths.**

## Task 16: Final Evidence, Release Rehearsal, and Run Closure

**Depends on:** Task 15

**Deliverable:** A reproducible local release, honest verification record, and accurate duration outcome.

**Files:** `README.md`, `docs/demo-script.md`, `docs/verification-matrix.md`, `progress.md`, `task.md`, `prd.md`; only defect-driven source changes.

- [x] **Step 1: Perform one bounded residual review against the PRD and the failure matrix in `docs/ralph-long-run-audit.md`. For each real remaining defect record a reproducer, fix it, and rerun affected checks. Do not reopen satisfied scope without evidence.**
- [x] **Step 2: Write a reproducible demo script covering both roles, first-attempt failure, POS retry, changed rule, unresolved question, checklist, dashboard and reset. Document setup, commands, data model boundaries, demo fallback and known limitations.**
- [x] **Step 3: Check tracked-file names and ignore rules, inspect server/client imports, and use a synthetic test canary to verify secrets stay out of client bundles and error responses. Never print or copy `.env.local` values into scans, evidence, or logs. Git initialization, commits, pushes, and deployment are pre-authorized; inspect the exact staged files and verified repository/branch/deployment target before publication. Preserve unrelated user changes.**
- [x] **Step 4: After the final code change run `npm test`, `npm run build`, and the complete production-server E2E command; perform the documented demo in a fresh browser context and inspect its rendered results. Preserve failure evidence and report exact command outcomes.**
- [ ] **Step 5: After local gates pass, perform the pre-authorized Git publication and deployment with available credentials and verified targets; confirm the remote commit, final deployment status, and deployed browser flow. Map every PRD acceptance criterion and Task 1–16 checkbox to actual evidence. Record live Gemini, Git publication, and deployment separately with their actual results and URLs; if a prerequisite is missing, record the external blocker and leave unverified work unchecked rather than asking for renewed approval.**
- [ ] **Step 6: Append the final timing/resume record. If active work reached 420 minutes and all gates pass, record `complete`; if all gates and the residual review passed earlier, record `completed-before-duration-target` with actual elapsed work. Otherwise continue eligible work or record a concrete `blocked/interrupted` checkpoint.**

## P1 Backlog — Requires Separate Authorization After Tasks 1–16

These are not part of this long-running P0 prompt. Do not automatically consume them to meet the time target.

- [ ] Expand scenarios for tobacco-product locations, delivery orders, expiration dates, logistics, and shift handoffs
- [ ] Time-based checklists
- [ ] Question-topic classification and repeated-question trends
- [ ] More advanced before/after training behavior comparison
- [ ] Supabase repository adapter and production role permissions
