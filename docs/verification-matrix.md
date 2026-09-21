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
| Tasks10–16 release gates | task.md, progress.md | Local gates complete; external release pending |
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
| 16 | Steps5–6 | Publication/deployment and final timing pending |

## Residual review and known limits

The bounded final review found one real defect: shape-valid saved sessions could omit referenced product facts. A failing repository test reproduced it; cross-reference/event/completion validation now recovers safely, verified in unit tests and both browser widths. An earlier persistence fixture hydration race was fixed with observable readiness; its failure screenshot and context remain in docs/evidence/persistence-fixture-race-before.*.

Gemini rejected the old explicit 8-second deadline (provider minimum10). The SDK deadline is now15 seconds, local cancellation12, browser20. Separate live production-server smoke passed customer, coach and grounded Q&A. Historical ignored .next cache is preserved after blocked deletion; current .firstday-build and staged files have zero secret hits, and both output directories are excluded from uploads.

P0 uses one browser's local data with demo role switching; no authentication, cross-device sync or real POS. AI selects constrained wording while deterministic code owns facts and evaluation. Q&A deliberately requires clear rule support; historical unresolved questions remain historical counts.

## External release

| Check | Result |
|---|---|
| Local live Gemini | Three HTTP200 genuine live responses, grounded and fixed-price-valid; Iteration20 |
| Git | Verified Hee1-99/gs-hack main; publication pending |
| Vercel | Verified hee1-99 account and hee1-99s-projects scope; deployment pending |
| Deployed browser journey | Pending |
| Duration | Measured active intervals in progress.md; no seven-hour claim |
