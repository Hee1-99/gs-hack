# FirstDay.zip Product Requirements Document

> Status: Reference document for Ralph implementation
> Date: 2026-09-21
> Event: GS 52g PLAI Hackathon Developer League
> Priority: Complete one end-to-end demo flow first.

## 1. One-line Product Definition

FirstDay.zip is a web-based onboarding and work-support service where a new `스토어 매니저` practices with an AI customer before work using store-specific instructions registered by the `경영주`, uses grounded answers and a checklist during work, and where the `경영주` reviews training, questions, and task progress.

## 2. Problem to Solve

- A new `스토어 매니저` serves real customers before having enough opportunity to practice various tasks and store-specific rules.
- It can be difficult to ask the `경영주` every time something is unclear, and concurrent tasks can easily be missed.
- The `경영주` repeats the same training whenever a new `스토어 매니저` joins.
- Verbal instructions can be omitted or interpreted differently, and it is difficult to identify where a `스토어 매니저` gets stuck.

This product tests the hypothesis that it can reduce training burden and adjustment difficulties. Do not imply that outcomes such as reduced training time or improved retention have already been proven.

## 3. Primary Users

### New `스토어 매니저`

- Practices before work in an environment where mistakes are safe.
- Quickly checks store-specific instructions needed during work.
- Avoids missing required tasks and handoff items.
- Records situations that cannot be handled independently as requiring confirmation from the `경영주`.

### `경영주`

- Registers store instructions and checklists once for repeated use.
- Reviews training completion, questions, and checklist progress for the `스토어 매니저`.
- Improves the manual based on unresolved questions.

## 4. Product Principles

1. **Single source of truth:** Store rules are shared by the simulation, work Q&A, checklist, and dashboard.
2. **Separate AI from evaluation:** Gemini handles natural-language expression, while structured data and deterministic code handle product and promotion facts and behavioral evaluation.
3. **Behavior-based feedback:** Even if an answer happens to be correct, giving a definitive answer without checking the POS is treated as a process violation.
4. **No ungrounded answers:** For questions not covered by the manual, do not guess. Direct the user to confirm with the `경영주` and record the question as unresolved.
5. **Synthetic data only:** Do not use real GS25 POS data, products, internal manuals, or customer or worker personal information.
6. **A support tool, not a surveillance tool:** Do not use the checklist or dashboard for personnel evaluation, hiring-suitability decisions, or real-time surveillance.
7. **Failure tolerance:** The full demo must remain available in a clearly labeled demo mode when the Gemini key is missing or a call fails.

## 5. P0 User Journey

1. On the home page, select either `스토어 매니저 모드` or `경영주 모드`.
2. The `경영주` views, edits, and saves the promotion-response rules and checklist for the virtual store `GS25 첫날점`.
3. A new `스토어 매니저` starts a simulation for a 2+1 promotion inquiry.
4. The AI customer asks whether the promotion applies, and the user either answers or looks up the product in the virtual POS.
5. The rule validator compares the POS lookup, response, and request for manager confirmation against the action log.
6. The coach explains what was done well and which steps were missed, with supporting grounds, and offers a retry.
7. In the work-support screen, asking about the same promotion rule displays the manual version and supporting rule.
8. The `스토어 매니저` completes today's checklist or marks an item as `경영주 확인 필요`.
9. In the dashboard, the `경영주` reviews training completion, checklist progress, questions, and items requiring confirmation.
10. When the `경영주` adds a missing rule, it applies to subsequent new Q&A requests and new simulation sessions.

## 6. P0 Functional Requirements

### F1. Role-specific Screens

- Both roles can be selected from the home page.
- Authentication is not implemented, and role switching is labeled as demo-only.
- The `스토어 매니저` screens are mobile-first, while the `경영주` screens are responsive across mobile and desktop.

### F2. Shared Synthetic Data

- Provide one virtual store, three products, one promotion, one primary scenario, and one variant scenario.
- The representative product `캔커피 A` is synthetic data priced at KRW 1,500, with a 2+1 promotion totaling KRW 3,000 for three units.
- Clearly state that all synthetic data is not actual GS25 operational information.

### F3. Store Manual Management

- The `경영주` can edit and save a rule's title, content, category, and exception handling.
- Saving updates the version and modification time.
- An in-progress simulation retains the rule snapshot from when it began.
- Q&A requests and simulations started after a save use the latest rules.

### F4. AI Customer Simulation and Virtual POS

- Record the customer's opening line, the `스토어 매니저` response, POS lookups, and requests for manager confirmation in one session.
- The virtual POS retrieves product name, price, inventory, and promotion conditions from structured data.
- Session state persists while moving between the conversation and POS panel.
- Gemini responses cannot change fixed facts.

### F5. Rule Validation and Coaching

- Evaluation must include, at minimum, `POS lookup performed`, `definitive answer before verification`, `final answer`, and `manager confirmation requested`.
- Deterministic code generates evaluation results.
- Coaching text is generated only from the evaluation results and action log.
- Show the behavioral differences between the first attempt and the retry.

### F6. Store-specific Work Q&A

- Find manual rules related to the question and display the rule title and version with the answer.
- If there is no supporting rule, do not fabricate an answer; direct the user to confirm with the `경영주`.
- Record the question, answer, supporting rule ID, and resolution status.
- Provide frequently asked question buttons.

### F7. Work Checklist

- Provide four default items and display items registered by the `경영주`.
- The available states are `대기`, `완료`, and `경영주 확인 필요`.
- State persists after a refresh.
- Reset occurs only after confirmation.

### F8. Manager Dashboard

- Display training completion, completed checklist item count, question count, and confirmation-needed count.
- Display unresolved questions and candidates for manual improvement.
- Do not display evaluative metrics such as scores, rankings, or work suitability.

## 7. AI Runtime Policy

- Call the Gemini API only from a server-side Route Handler.
- Do not expose `GEMINI_API_KEY` in the browser bundle, logs, or error messages.
- Send only the current manual rules, the scenario's fixed facts, and the permitted output role in a request.
- If the API key is missing or a timeout, quota error, or format error occurs, return a deterministic demo response.
- Display `데모 모드` in the UI when a demo response is used.
- Do not store LLM output as the source data for product prices, promotion conditions, or evaluation results.

## 8. Data and State Strategy

The hackathon P0 uses local persistent storage by default so the end-to-end demo can run in the same browser. Keep data access behind a repository interface so it can later be replaced with Supabase.

Core entities:

- `Store`, `StoreRule`, `Product`, `Promotion`, `Scenario`
- `SimulationSession`, `SimulationEvent`, `SimulationFeedback`
- `ChecklistItem`, `ChecklistProgress`, `QuestionLog`

Manage rules, scenarios, and user actions as separate structures. Do not duplicate the same rule text by hardcoding it in the UI, prompts, and validation code.

## 9. Technical Direction

- Next.js App Router + TypeScript
- Responsive UI based on Tailwind CSS
- Gemini server calls with a deterministic demo fallback
- Pure TypeScript simulation engine and rule validator
- Repository adapter using browser-local persistent storage
- Vitest unit and integration tests, plus Playwright tests for core user journeys
- Environment-variable and server/client boundaries designed with Vercel deployment in mind

## 10. P0 Acceptance Criteria

- [x] The flow from the initial state through the final manager dashboard can be demonstrated in one browser session.
- [x] The action logs and feedback actually differ between an answer without a POS lookup and an answer after a lookup.
- [x] The virtual POS, rule validator, and Q&A use the same store rules and promotion data.
- [x] After the `경영주` edits a rule, the change applies to new Q&A requests and new simulation sessions.
- [x] Checklist state persists after refresh and is aggregated in the dashboard.
- [x] Questions not covered by the manual are recorded as unresolved and direct the user to confirm with the `경영주`.
- [x] The core flow continues in demo mode without a Gemini key.
- [x] `npm test`, `npm run build`, and the core Playwright scenarios pass.
- [x] The README documents setup, environment variables, synthetic data, the demo flow, and known limitations.
- [x] The `경영주` can add a missing rule and create/edit checklist items; new Q&A and the checklist use the saved data without rewriting past logs.
- [x] Corrupted or unavailable local storage produces recovery or a visible non-persistent state, never a false saved confirmation.
- [x] Event ordering, wrong-product lookups, duplicate submissions, retries, and immutable rule snapshots are verified deterministically.
- [x] Mocked AI timeout, quota, malformed output, and contradictory facts cannot alter deterministic evaluation or leak raw provider errors.
- [x] The complete flow is verified at mobile and desktop widths, with keyboard navigation and a confirmed reset, against the production server.
- [ ] Tasks 10–16 in `task.md` pass and `docs/verification-matrix.md` maps each P0 criterion to actual evidence.
- [x] No item is marked complete unless it actually passed.

### Extended P0 Run Contract

The core feature checkpoint is Task 9. Release completion includes Tasks 10–16, which strengthen the same P0 flow without adding new business scenarios or infrastructure. Plan at least 420 active work minutes (7 hours), with a 7–10 hour planning envelope; record actual time, not estimates presented as execution. This target does not replace acceptance criteria or authorize idle work. Follow the duration, resume, early-completion, and host-limit rules in `AGENTS.md` and `goal.md`.

Real Gemini calls, deployment, and Git publication are pre-authorized for this run under the YOLO Execution Authorization in `AGENTS.md`; do not request separate confirmation. Keep repeatable regression checks in `AI_DEMO_MODE=true`, which must force the deterministic path even when a local key is present. Run a separate bounded live Gemini smoke check when credentials are available, then publish and deploy after the local gates pass using verified project targets. Record remote commit, deployment URL/status, and live API results independently from local evidence. Missing credentials, targets, or access must be recorded as concrete external blockers and must not stop independent demo-mode work; `not run` never means passed.

## 11. Prioritization and Scope-reduction Rules

If time is limited, reduce the number of screens and scenarios while preserving the following connections:

`Save manager rules → 2+1 simulation → validate POS behavior → grounded Q&A → checklist → manager dashboard`

P1 additions—more scenarios, time-based checklists, question classification, detailed progress, and pre/post-training analysis—require a separate scope decision after all extended P0 gates are verified. They are not automatic work to consume the seven-hour target.

## 12. Explicitly Out of Scope

- Integration with actual GS25 POS, inventory, sales, payment, ordering, refunds, or internal systems
- Use of real product promotions or internal manuals
- Production authentication and accounts based on personal information
- Voice or video analysis
- Worker surveillance or automated decisions about hiring suitability or work performance
- Definitive legal advice about wages, employment agreements, or CCTV
- A separate grocery-shopping recommendation service

## 13. Demo Safeguards

- Maintain a demo mode that reproduces the full flow regardless of real Gemini calls.
- Provide a demo-data reset button and a recoverable seed.
- Visually distinguish synthetic-data notices, AI-generated answer notices, and administrator-confirmation states.
- Keep the route through the product stable so a backup video can show the same core flow as the live demo.
