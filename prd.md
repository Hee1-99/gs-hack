# FirstDay.zip Product Requirements — current revision

Date: 2026-09-21. This revision records the user's latest requested product behavior. Original Tasks 1–16 remain historical release evidence; Task17 gates the new behavior. The prior 420-minute planning target was evaluated honestly at the first release; revision time is separately measured and never padded.

## Product

A first-shift simulator for a `스토어 매니저`: choose a concrete action in a graphic store/POS, complete all 12 stages, and receive a deterministic score. The same course supports an interview `테스트` with feedback withheld until completion. The `경영주` reviews practice/test records and scores and configures the checklist. Store Q&A searches the supplied GS25 education summaries or uploaded manual and asks Gemini to explain supported content.

## P0 revision flow

1. Home presents **연습 시작하기** as the main action, with **테스트 시작하기**, **매장 Q&A**, and **체크리스트** immediately accessible. There is no **경영주로 시작** mode card.
2. `/crew` redirects to the unified `/crew/simulation`; the separate **첫걸음** and **응대 연습** navigation is removed.
3. Simulator shows one current mission, customer graphics, a familiar POS-style panel, action choices, and stage progress.
4. The 12 stages cover handover, discrepancy check, scanning, promotion lookup, discount/points, card completion, receipt, pending sale, complaint response, expiry complaint, disposal registration and handover reporting.
5. Practice shows immediate correct/incorrect feedback and source; test records answers without showing feedback until all stages are complete.
6. Final result shows 0–100 score, chapter breakdown, chosen/correct actions and source links. Retry creates a separate record. An unfinished attempt can resume after refresh.
7. Q&A retrieves only confirmed supplied manual summaries or the user's uploaded `.md`/`.txt` manual. Answers show preserved source excerpts and links; missing evidence produces an unresolved answer. Manager-added rules remain available as a secondary feature.
8. The owner uses **연습 기록·점수** and **체크리스트 설정**. The operational **업무 관리** dashboard is removed. Additional rules are accessible as secondary settings.

## Grounding and evaluation

- The authoritative supplied document is `docs/gs25-store-manager-training-map.md`. It contains 58 confirmed video-body summaries and 20 uncollected bodies. Only confirmed summaries enter the default runtime corpus. Original source links and collection limitations are preserved.
- This is public education material summarized in the supplied document, not a complete current internal operating manual. Uncollected bodies are never filled by model guesses. Latest store policies require separate confirmation.
- Products, transaction amounts and POS artwork are synthetic. No official assets, live POS or financial transactions are used.
- Gemini is server-only and generates Q&A explanations from retrieved evidence; source IDs and numerical claims are checked and invalid/failed output falls back to cited excerpts.
- Quiz scoring is deterministic, independent of Gemini. Test results support a human interview; the app does not predict personal suitability or make hiring decisions.
- Upload supports UTF-8 `.md`/`.txt`, maximum20KB. Uploaded manuals replace default manual retrieval. Uploads persist locally and are sent to the server/Gemini when asking a question. PDF/HWP extraction is not implemented and is not advertised.
- Demo mode remains functional without an API key. Automated tests and builds force `AI_DEMO_MODE=true`; live Gemini checks are bounded and separate.

## State and limits

- Browser-local persistence: existing rules/checklists/questions in `firstday.zip`; quiz attempts in `firstday-training-v1`; uploaded manual in `firstday-uploaded-manual-v1`.
- No authentication, cross-device owner account, secure proctoring or hiring decision automation. Test alias is optional; real names are unnecessary.
- A quiz record includes course version, selected answers, final score and timestamps. Scores/history remain visible after reload. Invalid saved scores recover safely.
- Confirmed reset clears all three app data areas and keeps unrelated browser keys untouched. Save failures must be visible.
- Keyboard navigation, focus on stage/result changes, reduced motion, and 390×844/1440×900 layouts are required.

## Acceptance evidence — Task17

- [x] Home, unified simulator, Q&A and narrowed owner navigation work in an actual browser.
- [x] Incorrect POS action yields92 and complete correct retry yields100; both records persist and are visible to owner.
- [x] Test hides explanations until completion, resumes after refresh, and preserves alias/mode.
- [x] Confirmed manual and uploaded text produce evidence-backed answers; unsupported questions remain unresolved.
- [x] Gemini live answer verified separately from repeatable demo-mode tests.
- [x] Checklist settings preserve item status; confirmed reset covers quiz/upload and legacy data.
- [x] Full unit/integration tests, build and complete production E2E pass; Figma and actual rendered screens inspected.
- [x] Existing Git target and deployed app verified with exact outcomes in progress.md.

## Reference-driven visual revision — Task18

The user's three mobile app screenshots define the revised visual direction: cyan highlights, a pale lavender canvas, large rounded white service cards, original dimensional store/tool illustrations and fixed mobile bottom navigation with a raised simulator action. PRODUCT.md and DESIGN.md record this direction. Existing practice/test, source-grounded Q&A, checklist and owner workflows remain unchanged. Mobile navigation must not obstruct controls, and all primary pages must remain usable at 390×844 and 1440×900 with keyboard access and reduced motion.

## GStep expansion — Task19 (authoritative current request)

GStep replaces the prior brand. Highlight actual supplied GS25 public training/manual sources on the landing, without implying a complete current internal manual or official affiliation. Retain the cyan reference identity with a new original step logo.

The course expands across confirmed manual processes and includes objective decisions plus free-text customer responses. Gemini grades free text with a validated rubric and explains its score; objective correctness remains deterministic. Timing adds at most10% of score and cannot reward an incorrect answer. Record per-step elapsed time and show accuracy/time breakdown. Do not present a local/demo result as real AI evaluation. A separate multi-turn Gemini customer-chat simulator supports practice and feedback. Scores support learning, never automatic hiring decisions.

Q&A adopts a diligent, warm store-manager persona. It may answer general questions using model knowledge, clearly marked as general AI guidance; only cited manual passages are labeled manual-grounded. Do not invent exact store-specific policies or source citations when missing. Add varied FAQ examples.

Supabase replaces browser-only persistence for signed-in users: email/password accounts, 스토어 매니저/경영주 roles, store-scoped sharing, owner settings and team training history. Enforce data access in RLS rather than merely hiding UI. Preserve a clearly labeled local demo when unconfigured or signed out. Existing training histories require version-safe handling. Live auth/database verification is separate from tests and requires the intended project's connection settings.
