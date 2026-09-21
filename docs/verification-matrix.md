# Current revision verification — Task17 (2026-09-21)

The original release evidence below is historical. Latest user request replaces role-choice/chat/operational-dashboard behavior with the following verified contract.

| Current requirement | Evidence | Actual local result |
|---|---|---|
| Clear practice/test landing, unified simulator, no owner start card | page.test.tsx; smoke.spec.ts; navigation.spec.ts | Passed |
| Twelve manual-grounded steps, graphic customer/POS, full quiz and score | training-engine.test.ts; simulation.spec.ts | Incorrect POS92, correct retry100; source links and both records verified |
| Interview test, no feedback until finished, alias and refresh recovery | simulation.spec.ts; dashboard.spec.ts | Passed desktop/mobile |
| Confirmed manual and uploaded text priority, source preservation, refusal | manual-answer.test.ts; manual-qa.spec.ts; consistency.spec.ts | 58 confirmed summaries,20 pending excluded; upload priority and unsupported answer verified |
| Server Gemini and failure handling | AI tests; ai-failure.spec.ts; bounded Node route smoke | Actual live Gemini1call200/mode live/source verified; forced demo regressions pass |
| Owner scores/history and checklist configuration only | dashboard tests; dashboard.spec.ts; reset.spec.ts | Score filters/detail sources, item-state preservation and all-store reset verified |
| Mobile/keyboard/reduced motion and error recovery | usability.spec.ts; persistence.spec.ts; store-provider.test.tsx | 390×844 and1440×900, no overflow, focus flow, StrictMode recovery fixed |
| Figma and actual UI visual review | https://www.figma.com/design/KYOkEnYcKTRuPpe6hi3QPW ; docs/evidence/figma-redesign.png and revision-*.png | Figma clipping fixed; screenshots inspected |
| Full release gate | npm test; AI_DEMO_MODE=true npm run build; npm run test:e2e |82/82 unit/integration, build exit0,44/44 production E2E38.7s, retries0 |
| Secret boundary | node scripts/check-secret-boundary.mjs |1018files inspected,0leaks, .env.local ignored/untracked |
| Publication/deployment | progress.md iteration27 onward | Source a7114bd on origin/main; dpl_8E4U1w4WvrKmoi1hNN6zyP8ZmyDr READY; live manual200/live/source-valid; deployed desktop/mobile2/2 passed30.4s |

Computer Browser entry point returned `Unable to load browser request-header policy`, matching the prior three-failure blocker. No interactive browser operation is claimed. Actual UI behavior was exercised with the project's Chromium E2E runner and inspected rendered screenshots. Figma MCP was operational.

---
# P0 verification matrix

Final local gate (2026-09-21): 59 unit/integration tests, production build, and 32 production-server E2E cases passed. Automated regression uses synthetic data and forced demo mode. Live API and publication are recorded separately.

## PRD acceptance evidence

| Criterion | Concrete evidence | Result |
|---|---|---|
| One-session manager-to-worker-to-dashboard journey | tests/e2e/demo-flow.spec.ts; docs/evidence/demo-flow-{desktop,mobile}.png | 2 attempts, 1/4 checklist, 2 questions, 2 confirmation-needed |
| POS action changes feedback | engine/rule-validator tests; simulation.spec.ts | No-POS violation, successful lookup/retry |
| Shared rules and promotion facts | promotion.ts, virtual-pos tests, answer-question tests | 1,500 unit / 3,000 for three from structured data |
| Latest rules and immutable active snapshots | simulation.spec.ts, qa.spec.ts | Active v1 preserved, new v2 applied |
| Checklist persistence and aggregation | dashboard.spec.ts, consistency.spec.ts | Stable IDs and all three states survive refresh |
| Unsupported questions remain unresolved | rule-search tests, qa.spec.ts | Ambiguous/coincidental terms cannot invent answers |
| Missing-key/demo operation | AI boundary/provider tests; complete demo E2E | Forced demo invokes SDK zero times |
| Tests and production build | progress.md Iteration23 | 59 tests, build exit0, 32 E2E |
| Reproducible setup and demo | README.md, docs/demo-script.md, .env.example | Both roles, retry, rule edit, Q&A, checklist, reset documented |
| Added rule preserves old question history | consistency.spec.ts | Old unresolved unchanged; new answer cites added rule |
| Persistence failure recovery | repository tests, persistence.spec.ts | Invalid JSON/schema/version/missing references recover; quota gives honest memory notice |
| Event ordering and duplicate prevention | engine/rule-validator tests, simulation.spec.ts | Early answer remains violation; confirmation must precede final answer; no duplicate completion |
| AI failure and secret boundaries | boundary/route/provider tests; check-secret-boundary.mjs | Bounded requests, safe fallback, no raw error, zero secret hits |
| Keyboard/mobile/navigation/reset | usability.spec.ts, navigation.spec.ts | 390x844 and 1440x900; Tab journey, focus return, direct/back/refresh pass |
| Tasks10–16 release gates | task.md, progress.md | All local and external release gates passed |
| Honest recorded evidence | progress.md historical results and failure screenshots | Only observed passes checked; prior failures retained |

## Task checkbox mapping

| Task | Checkboxes | Evidence |
|---|---|---|
| 1 | All | Home/role smoke tests and screenshots |
| 2 | All | Repository/domain tests and seed initialization |
| 3 | All | Manual component and browser edit/version/persistence tests |
| 4 | All | Pure engine, validator, virtual POS tests |
| 5 | All | AI provider/route tests; live smoke after deadline repair (Iteration20) |
| 6 | All | Simulation retry, comparison and action-log browser tests |
| 7 | All | Rule-search, answer-question and Q&A browser tests |
| 8 | All | Checklist/dashboard tests and reset flow |
| 9 | All | Single-session demo-flow at both viewports |
| 10 | All | Recovery/read/write/quota tests; Iteration16 and final integrity case |
| 11 | All | Ordering/deduplication/snapshot tests; Iteration17 |
| 12 | All | Provider/schema/size/deadline/HTTP failure recovery; Iteration18 |
| 13 | All | Long-answer, stale-reset, added-rule and three-status tests; Iteration19 |
| 14 | All | Keyboard/reading-order/viewport evidence; Iteration21 |
| 15 | All | Production server configuration and full navigation regression; Iteration22 |
| 16 | Steps1–4 | Bounded residual review, demo script, canary/staged scan, final59/32; Iteration23 |
| 16 | Steps5–6 | Production READY, remote commit verified, deployed full journey2/2; Iteration25 |

## Residual review and known limits

The bounded final review found one real defect: shape-valid saved sessions could omit referenced product facts. A failing repository test reproduced it; cross-reference/event/completion validation now recovers safely, verified in unit tests and both browser widths. An earlier persistence fixture hydration race was fixed with observable readiness; its failure screenshot and context remain in docs/evidence/persistence-fixture-race-before.*.

Gemini rejected the old explicit 8-second deadline (provider minimum10). The SDK deadline is now15 seconds, local cancellation12, browser20. Separate live production-server smoke passed customer, coach and grounded Q&A. Historical ignored .next cache is preserved after blocked deletion; current .firstday-build and staged files have zero secret hits, and both output directories are excluded from uploads.

P0 uses one browser's local data with demo role switching; no authentication, cross-device sync or real POS. AI selects constrained wording while deterministic code owns facts and evaluation. Q&A deliberately requires clear rule support; historical unresolved questions remain historical counts.

## External release

| Check | Result |
|---|---|
| Local live Gemini | Three HTTP200 genuine live responses, grounded and fixed-price-valid; Iteration20 |
| Git | https://github.com/Hee1-99/gs-hack main; implementation bb4e9f2, deployment config9871955 confirmed remotely |
| Vercel | https://gs-hack-seven.vercel.app; dpl_6uuDzAKtfHYFht7sCWVAayNccrGH READY |
| Deployed browser journey | Both viewports passed; demo-flow-deployed-{desktop,mobile}.png; actual Gemini customer/coach/Q&A HTTP200 with valid grounds |
| Duration | completed-before-duration-target; measured intervals in progress.md, no artificial waiting |

## Current revision evidence (Tasks17–18)

Historical tables above describe the initial release. The current simulator-first release and reference-driven redesign use the following checks:

| Requirement | Evidence |
|---|---|
| 12-step practice, incorrect action and retry, final deterministic score | tests/e2e/simulation.spec.ts and demo-flow.spec.ts |
| Test mode, hidden feedback, refresh recovery and owner history | tests/e2e/simulation.spec.ts and dashboard.spec.ts |
| Confirmed manual, uploaded text, unsupported question and latest supplemental rule | tests/e2e/manual-qa.spec.ts, qa.spec.ts and consistency.spec.ts |
| Checklist status/settings, persistence and reset | tests/e2e/dashboard.spec.ts and reset.spec.ts; checklist.test.tsx |
| Screenshot-reference theme, fixed mobile navigation, card spacing and control clearance | tests/e2e/reference-design.spec.ts; revision---mobile.png and revision--crew-checklist-mobile.png |
| All routes at mobile/desktop sizes and keyboard operation | tests/e2e/usability.spec.ts; revision-*.png |
| Actual external release status and measured duration | Latest Task18 checkpoint in progress.md (local and remote checks recorded separately) |

## GStep revision (Task19)

| Requirement | Evidence |
|---|---|
| GStep identity, public manual provenance, source limits and AI entry points | page.test.tsx; smoke.spec.ts; gstep-home-mobile/desktop.png; /sources |
| Six chapters,36steps,5written answers; legacy12 retained; accuracy/time breakdown | training-v2.test.ts, training-engine.test.ts, training-store.test.tsx; simulation.spec.ts |
| Validated server Gemini grading; AI latency excluded; retry retains input | training-grader.test.ts; simulation.spec.ts; live-training-grade-smoke.mjs actual200/gemini |
| Freeform AI customer, four rubric criteria, scoped records and useful general Q&A | chat-training tests and E2E; general-question.test.ts; actual live chat reply/finish and generalQA200 |
| ID/password signup without email verification; roles and account boundaries | username-login.test.tsx; auth-isolation.test.tsx; auth.spec.ts demo fallback |
| Scoped cloud state; queue identity remains correct across account switches | cloud-store-repository.test.ts actualSDK/custom-fetch header test; training-cloud-sync.test.tsx |
| Store/member/record RLS and invite restrictions | supabase/verify-rls.mjs exact migration executed locally11checks; live evidence separately recorded in progress.md |
| Final local regression |125unit/integration, production build and56desktop/mobile E2E pass; full gate after ID/password and race fix |
| Actual remote account journey and deployed AI | Latest Task19 release checkpoint in progress.md; never inferred from local results |

Task19 deployed evidence: source f3425bffe1790e929b9e380e703f78e337a9bf27, deployment dpl_6TC3FWH3HYEu9uaU74fbFKQs69gL independently READY. Deployed navigation4/4; actual ID/password signup and store creation, login/logout/refresh, six-step course with Gemini written score100 and final100, remote checklist persistence, owner A record visibility and owner B isolation verified. Actual Gemini customer chat and70point evaluation persisted across refresh and were rendered in an independent owner browser. Screenshots: gstep-account-*.png. SDK role/store checks10/10 and local exact SQL11/11 are separate evidence.

Bounded additional live stale-version conflict probe remains unverified:20second status0 on three direct executions, retries stopped, root cause unknown. This is not recorded as a successful conflict response or proof of no mutation. Details in supabase/README.md and progress.md. Normal save, live isolation and primary user journeys passed.
