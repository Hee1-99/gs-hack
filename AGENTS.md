# FirstDay.zip Agent Working Rules

## Start-up Order

At the start of every iteration, read the following in order:

1. `goal.md`
2. `prd.md`
3. `task.md`
4. `progress.md`
5. Relevant code and tests

## One Iteration

1. Select one incomplete P0 task in `task.md` whose explicit dependencies are satisfied. Tasks 1–9 establish the core flow; Tasks 10–16 are required P0 reliability and release gates, not optional P1 work.
2. Begin with that task's first incomplete checkbox.
3. Add a failing test first, or reproduce the failure with an existing verification command.
4. Write the minimum implementation needed to satisfy the acceptance criteria.
5. Run the relevant tests, then run the full test suite and build at the task boundary.
6. For user-flow work, verify the actual behavior in a browser.
7. Mark only verified checkboxes as complete and append the results to `progress.md`.
8. At the next iteration, reread the documents and reassess the current state.

## Long-run Execution and Resume

- The execution target is at least **420 active work minutes (7 hours)** of useful implementation, diagnosis, and verification, planned as a 7–10 hour work session. This is a planning target, not a guarantee that a prompt controls the host runtime.
- On the first implementation iteration, record `runStartedAt`, `lastCheckpointAt`, `activeWorkMinutes: 0`, and `excludedPauseMinutes: 0` in `progress.md`, using ISO 8601 timestamps with a timezone. Documentation preparation does not start this timer.
- At each iteration boundary and at least every 30 minutes of ongoing work, append the measured interval and cumulative `activeWorkMinutes`. Count implementation and actual tool/test execution; exclude known idle time, permission waits, stopped sessions, and unrelated work. Never infer work duration from token counts or inflate it after a restart. If timing evidence is missing, record the interval as unknown rather than counting it.
- Before a context reset or host interruption, record the exact next checkbox, changed files, latest command and result, running process/port if any, unresolved failure count by root cause, and verification still needed. On resume, inspect the actual files and processes before continuing; preserve the original run start and accumulated active minutes.
- Continue through eligible tasks without asking for permission at each task boundary. A core-flow success at Task 9 is a checkpoint, not completion of the extended P0 scope.
- When approaching 420 minutes, finish the current coherent change and its verification. Time alone never marks a task complete. If work remains after 420 minutes, continue until the final gates pass or an actual stop condition applies.
- Do not sleep to meet the duration target, rerun unchanged successful tests without a new reason, manufacture defects, expand to P1/P2, or add cosmetic churn. If all required tasks and one bounded residual review finish earlier, record `completed-before-duration-target` with the measured time and stop honestly.
- This file does not install or start a Ralph runner. A host time/token/usage limit or interruption requires an honest checkpoint; do not claim an unattended run continued while the host was stopped.

## Working Principles

- Do not implement P1 or P2 features before completing the P0 vertical flow.
- Do not start multiple independent features in the same iteration.
- Keep AI output separate from deterministic evaluation.
- Do not duplicate store rules or promotion information by hardcoding them in the UI, prompts, and validation code.
- User-facing role names must consistently use `스토어 매니저` and `경영주`.
- Do not use real GS25 data or official brand assets. Clearly label synthetic data in the UI.
- Read secrets only from `.env.local`; never print or commit them.
- Even when modifying `.env.local`, never copy its contents into logs or `progress.md`.
- Do not overwrite user-owned changes or clean up unrelated files.

## YOLO Execution Authorization

- The user has pre-authorized real Gemini calls, deployment, and Git publication for this project's implementation run. Do not ask for separate confirmation for these actions or their ordinary prerequisites: local Git initialization, project commits, pushes, and deployment updates to the verified project target.
- Use existing credentials and authenticated accounts. Resolve the intended repository, branch, and deployment project from actual configuration before publishing; ask only for missing information that cannot be determined, not renewed approval. Do not overwrite unrelated changes, force-push history, or delete remote resources.
- After the local gates pass, proceed with Git publication and deployment when credentials and targets are available. Verify the remote commit, deployment status, and deployed app; record exact outcomes and URLs. A missing key, login, target, or tool is a concrete blocker, not a reason to request the same authorization again.
- Real Gemini smoke verification is pre-authorized, including normal API usage on the existing account. Keep calls bounded to the necessary synthetic-data checks; do not purchase subscriptions, upgrade plans, or run unbounded paid loops. Existing server-side secret configuration for the verified deployment target is authorized; never print secret values or publish `.env.local`.
- This is project-level authorization, not a change to the host sandbox or approval policy. Respect enforced tool permissions and usage limits. Unrelated destructive actions, real data, and new paid service purchases remain outside this authorization.

## Verification Rules

- Do not record a test as `passed` unless it was actually run.
- A successful local build does not mean deployment succeeded or that the real Gemini connection works.
- Classify verification completed without Gemini as `demo mode` verification.
- For tests that require environment variables, check only whether the key exists and never print its value.
- Keep `AI_DEMO_MODE=true` for repeatable automated tests and their production builds, including builds that load `.env.local`. Run a separate, bounded real Gemini smoke check with demo mode disabled when an existing key is available; no additional approval is required. Restore forced demo mode for regression checks. Missing credentials must not block demo-mode work; record live verification as `not run` with the concrete reason when unavailable.
- E2E coverage must include, at minimum, editing manager rules, an incorrect attempt, retrying after a POS lookup, Q&A, the checklist, and the dashboard flow.
- At every task boundary run the full unit/integration suite and production build; run the relevant browser scenarios for changed user flows. At Task 16 also run the entire E2E suite against the production server. Record failures rather than weakening assertions or adding blanket skips.

## Computer-use at Bottlenecks

- Use the available `computer-use` skill when browser or desktop UI behavior blocks progress and code, logs, CLI tools, or automated tests are insufficient. Examples include focus failures, hidden controls, dialogs, and browser automation failures that need visual inspection.
- Read the installed skill's `SKILL.md` and required runtime guidance before using it. Verify a live controllable target, inspect its current state, take the smallest authorized action, and verify the resulting state. A screenshot alone does not establish control access.
- Switch to this diagnosis when useful rather than repeating speculative fixes until the third failure. Preserve the same root-cause failure counter across tools and follow the existing three-failure stop rule.
- Record the bottleneck, tool/actions, observed result, and evidence in `progress.md`; return to normal implementation and automated verification afterward. Computer-use evidence supplements rather than replaces required tests, builds, and E2E gates.
- If the runtime is unavailable, attempt only documented recovery, record the exact blocker, and continue independent eligible P0 work. Do not invent APIs, claim unperformed UI actions, or make the entire run depend on an unavailable skill.
- The YOLO Execution Authorization also applies to computer-use actions. Reuse authenticated sessions for the authorized Gemini, Git, and deployment work without renewed confirmation; request user input only when login interaction or missing information is actually required. Respect the remaining scope and host limits.

## Failure and Stop Rules

- If the same root-cause failure occurs three times, stop making speculative changes.
- Record the command, key error, attempted fix, and required human decision in `progress.md`.
- Do not ask again for actions covered by the YOLO Execution Authorization. Ask a human only for unresolved access requirements, missing target information, new paid purchases, or destructive actions outside that scope. Never expose secret values or introduce real data.
- Mark the affected checkbox blocked and continue an independent eligible P0 task if one exists. Stop the run and ask a human when no authorized useful work remains or the failure affects the whole environment. Never reset a root-cause failure counter by changing the command spelling or starting a new iteration.
- End the Ralph loop only after Tasks 1–16 and all PRD P0 criteria have evidence, with the 420-minute target evaluated as above, or at an explicit safety/host stop. Record `complete`, `completed-before-duration-target`, or `blocked/interrupted` accurately. Do not label blocked or interrupted work complete.

## Recording Format

At the end of each iteration, append the following to `progress.md`:

- Iteration number and time
- Selected task
- Changed files
- Verification commands run and their actual results
- Failures and fixes
- Known limitations or blockers
- Next incomplete task
- Run start, checkpoint time, measured active interval, cumulative active minutes, excluded pause minutes, and any timing uncertainty
- Exact next checkbox and the command or action to resume with

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
