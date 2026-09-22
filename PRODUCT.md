# Product

## Register

product

## Product Snapshot

- **Name:** GStep
- **Submission snapshot:** 2026-09-22
- **Status:** Deployed MVP with guest practice and Supabase-backed store collaboration
- **Primary platform:** Mobile-first responsive web app; desktop supported
- **Live product:** https://gs-hack-seven.vercel.app
- **Positioning:** Learn the sequence from verified public education summaries, then rehearse decisions and customer communication in a safe synthetic store.

## Users

### 스토어 매니저

A Korean-speaking first-time or early-tenure store manager who needs to understand what to check, in what order, and how to explain it before or during a shift. They need short, obvious mobile actions, a safe place to make mistakes, evidence-backed answers, and a record they can resume.

### 경영주

An owner who needs to prepare store-specific checklist items and supplemental rules, invite a staff member, and review only that store's practice, test, customer-chat, question, and date-specific checklist records. GStep is an education workspace, not a surveillance or automated hiring system.

## Problem

Reading a manual does not recreate the pressure of choosing the next action, explaining a policy, or responding to a customer. Existing onboarding also separates learning content, on-shift questions, daily checklists, and owner review. The result is a gap between “I saw the instruction” and “I can apply it in order.”

## Product Purpose

GStep closes that gap with one continuous loop:

1. Learn from confirmed public education summaries.
2. Apply the sequence in a graphical synthetic store/POS.
3. Explain decisions in written answers and customer dialogue.
4. Receive deterministic and AI-assisted feedback with clear provenance.
5. Reuse the same knowledge in Q&A and a daily checklist.
6. Share store-scoped progress with the owner when accounts are connected.

The current course contains 36 stages across six work areas. Practice mode gives immediate feedback; interview test mode withholds answers until completion. The separate AI customer practice automatically concludes after a bounded exchange and returns four-part coaching.

## Core Experience

| Surface | Primary job | Product behavior |
|---|---|---|
| Home | Decide what to do next | Leads with practice, then AI conversation, Q&A, checklist, account, and owner entry |
| Simulator | Rehearse a shift | Full 36-stage course or one chapter; selection and written-answer tasks; resumable progress |
| Interview test | Review job understanding together | Optional alias, hidden feedback until completion, educational score only |
| AI customer practice | Practice natural wording | Promotion, complaint, and refund scenarios; up to three replies; automatic or manual finish; four coaching criteria |
| Store Q&A | Get a useful answer without invented policy | Separates cited manual answers, general guidance, and questions requiring store confirmation |
| Daily checklist | Complete and revisit work | Status is keyed by local date; historical dates remain selectable |
| Owner workspace | Understand store education state | Store-scoped practice/test/chat scores, staff questions, date-specific completion, checklist authoring, account and invites |
| Sources | Inspect provenance | Shows collected and missing content, source links, synthetic-data notice, and policy limits |

## Course Model

The six chapters are 근무 준비, 상품 관리, POS 판매, 결제·서비스, 위생·안전, and 고객 응대. The complete course has 36 stages and can also be taken chapter by chapter.

- Multiple-choice stages are evaluated by structured answer data.
- Five written-answer stages are evaluated against server-owned rubrics.
- Accuracy contributes up to 90 points.
- Time contributes up to 10 points only after the answer meets its correctness threshold.
- AI and network waiting time is excluded from solving time; time spent away or refreshing during a step is not.
- Practice reveals feedback immediately. Test mode reveals it only in the final review.
- Legacy 12-stage records remain readable and are not silently rewritten as 36-stage results.

## AI Contract

AI improves language and coaching; it does not own product facts, permissions, or objective answer keys.

- Gemini is called only from server routes. The API key is never exposed to the browser.
- Written grading uses allowed question IDs and server-owned rubrics. Output shape and score ranges are validated.
- Manual Q&A retrieves confirmed passages first and preserves source IDs, excerpts, and links.
- General guidance is labeled as general and does not receive a fabricated manual citation.
- Missing evidence becomes an unresolved/store-confirmation response instead of a guessed policy.
- Customer dialogue receives bounded scenario facts and produces coaching, not a hiring decision.
- Provider failure keeps the learner's input and exposes a retry path. Demo mode provides explicit, repeatable fallback behavior.

## Content and Provenance

The default corpus is generated from `docs/gs25-store-manager-training-map.md`.

- 78 Korean education videos or entries were inventoried.
- 58 have confirmed body summaries and may enter the runtime corpus.
- 20 have uncollected bodies and are excluded from runtime grounding.
- Uploaded UTF-8 `.md`/`.txt` manuals are limited to 20KB and replace default retrieval for that browser account context.
- Uploaded content is stored in the browser and sent to the server only when a question is asked.
- Products, prices, transactions, store names, POS artwork, scenarios, and test accounts are synthetic.
- GStep is not a GS25 official service and does not claim that public summaries are a complete or current internal manual.

## Data and Permission Model

Guest use remains available without external services. Guest records live only in the current browser and are never silently merged into a signed-in account.

With Supabase connected:

- Username/password auth maps the username to an internal reserved address; the UI does not request email.
- An owner creates a new store and may generate a single-use, 24-hour staff invite.
- Each account belongs to one store in the current model.
- RLS, explicit grants, and `auth.uid()`-checked RPCs enforce role and store scope on the server.
- A store manager can read shared store content and write only their own progress and records.
- An owner can read staff activity in their store and update shared checklist/rule content, but cannot edit a staff score.
- Shared content and staff state use versions. Stale writes fail visibly instead of overwriting newer data.
- Signed-out visitors may open the owner route but see only a blurred, inert, placeholder-only preview and a login action. No local or cloud record is rendered into that preview.

## Product Principles

- Put the next task before explanation.
- Make the user act, not just read.
- Keep evidence visible wherever a policy-like answer appears.
- Separate deterministic evaluation from generative expression.
- Preserve drafts and records through recoverable failures.
- Make privacy and role boundaries true at the data layer, not just in navigation.
- Use `스토어 매니저` and `경영주` consistently.
- Keep owner tools secondary to the learner's core experience.

## Success Criteria

The product succeeds when a first-time user can, without instruction:

1. Enter a practice course and understand the current mission.
2. Make a wrong choice, use the explanation, and improve on a retry.
3. Complete a written answer or customer conversation and understand why the feedback was given.
4. Distinguish a cited manual answer from general advice or a store-confirmation request.
5. Save and revisit a date-specific checklist.
6. Resume their own record after refresh.
7. Connect to a store and expose only their own activity to the correct owner.
8. Use the same core flow at 390×844 and 1440×900 with keyboard focus and reduced-motion support.

## Non-goals and Current Limits

- No official GS25 branding, internal data, real POS integration, inventory, payment, or financial transaction.
- No guarantee that public education summaries reflect the latest store policy; users must confirm current instructions with the owner or official source.
- No automated hiring recommendation, employee ranking, proctoring, anti-cheat certification, surveillance, or performance discipline.
- No PDF/HWP extraction, OCR, or automatic internal-manual synchronization.
- No multi-store account, store transfer, account deletion workflow, multiple-owner delegation, or email-based password recovery in the current MVP.
- No automatic merge between guest browser data and cloud account data.
- AI coaching is nondeterministic and educational; it is not a universal assessment of job ability.

## Brand Personality

Friendly, approachable, clear, and confidence-building. The visual direction comes from three user-supplied mobile references: bright cyan identity, lavender-tinted canvas, large rounded white service cards, and playful dimensional graphics. GStep uses original artwork and an ascending-step G mark rather than official logos or copied mascots.

## Anti-references

Avoid the former text-heavy and ambiguous experience: long introductory blocks before the first action, an owner role-selection card on the home page, separate “first step” and response-practice menus, generic grid icons for the simulator, provider names in user-facing copy, and operational dashboards unrelated to education.

Do not copy official logos, characters, real POS screens, internal procedures, or unsupported current policy into the product.

## Design Principles

- One clear primary action per section.
- Recognizable visual identities for practice, Q&A, checklist, account, and owner review.
- Consistent controls and feedback language across selection, written answer, chat, and retry states.
- Mobile bottom navigation with a raised gamepad simulator action and reserved safe-area space.
- Bundled Noto Sans KR typography, cyan accent, lavender canvas, white rounded surfaces, and original dimensional SVG illustrations.
- Preserve behavior, saved history, and permission boundaries through visual changes.

## Accessibility & Inclusion

The supported reference viewports are 390×844 and 1440×900. Primary controls target at least 44px, focus is visible, stage/result transitions move focus intentionally, reduced motion is respected, and the fixed mobile navigation must not cover actions or focused content. Labels do not rely on color alone. Test aliases make real names unnecessary.

## Evidence and Operations

- Product verification is separated into local unit/integration, production build, production-server E2E, bounded live AI, live Supabase/RLS, and deployed-browser evidence.
- `docs/verification-matrix.md` maps requirements to evidence.
- `docs/training-content-audit.md` records the 36-stage content review.
- `supabase/README.md` records schema, RLS, invite, conflict, and live connection checks.
- `progress.md` is the chronological implementation and release record.

The production alias and GitHub repository are public, while credentials, synthetic verification-account secrets, and `.env.local` remain outside Git.
