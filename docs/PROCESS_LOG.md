# Process log

One entry per step, oldest first. Each entry records which tool did the work, what was asked, what came out, and what changed along the way, including what went wrong.

## Entry format

```
## YYYY-MM-DD — <phase and step>

- Tool and mode: Cursor Agent | Cursor Plan | Cursor Ask | Claude (claude.ai)
- Skills: <name (native | imported | project)>, ...
- Prompt: <one or two sentences>
- Produced: <files created or changed, commit hash>
- Changed or rejected: <what was corrected, refused or re-prompted, and why>
- Takeaway: <what to keep doing or do differently>
```

## Entries

## 2026-10-06 — Phase 1: repository and exchange type

- Tool and mode: Cursor Agent
- Skills: none
- Prompt: Sign in to GitHub, pick an exchange type, create the public repository `easy-exchange`, take an empty-repository screenshot, make the first commit.
- Produced: `2aa3c28` `docs: add project README for book exchange`, pushed to `main` at https://github.com/Lakshna15/easy-exchange. GitHub showed "This repository is empty." before the push. This commit is no longer in `main`'s history: GitHub's activity log shows the Phase 2 push moving `main` from `2aa3c28` to `d2d6b03`, a new first commit.
- Changed or rejected: The agent could not click Cursor's Accounts icon. `gh auth status` already showed `Lakshna15` signed in to github.com, so it used that. The remote already existed, so no second repository was created. Lakshna confirmed books, one-for-one, a first commit and a push.
- Takeaway: Check what already exists (sign-in, remote) before creating anything.

## 2026-10-06 — Phase 2: workspace before any code

- Tool and mode: Cursor Agent
- Skills: imported `frontend-design`, `webapp-testing`, `test-driven-development`, `requesting-code-review`; project `spec-driven-implementer` (created in this step)
- Prompt: Create `.cursor/rules/project.mdc`, import skills, write one custom skill and a prompt log. No application code.
- Produced: `d2d6b03` `chore: add Cursor rules, skills, and prompt log`: an always-on rule (spec first, no extra features, tests named with scenario IDs), four imported skills with their sources and licenses, the custom skill `spec-driven-implementer`, `docs/prompt-log.md` and `docs/workspace-setup.md`.
- Changed or rejected: The Python helper scripts of `webapp-testing` were left out on purpose.
- Takeaway: Recording each skill's source and license next to it makes the imported skills easy to explain.

## 2026-10-06 — Plan and spec drafts v0 (books), outside Cursor

- Tool and mode: prepared outside Cursor, in a folder around the cloned repository. The drafts themselves say they were "prepared before opening Cursor".
- Skills: project `write-spec`, `implement-from-spec`, `verify-against-spec` (written with the drafts)
- Prompt: not recorded.
- Produced: `docs/PLAN.md` v0, `docs/specs/01` to `06` v0, `docs/PLAYBOOK.md`, the three project skills. Not committed at the time.
- Changed or rejected: Nothing yet. These drafts are the input to the steps below.
- Takeaway: Drafts that live outside the repository are invisible to the history and easy to lose.

## 2026-10-06 — Review of the project folder

- Tool and mode: Claude (claude.ai), reading the folder on Lakshna's computer
- Skills: none
- Prompt: "Check what I have done in Cursor."
- Produced: A list of problems. The plan and specs were outside git (the outer folder was its own empty repository). The rules and the custom skill pointed to spec files that do not exist (`specs/requirements.md`, `specs/api.md` and others). There were two implementer skills, two READMEs and two AGENTS files. The logs were out of date.
- Changed or rejected: Lakshna switched the exchange type from books to plants.
- Takeaway: Review the repository's state before adding to it; every problem found here would have confused the agent later.

## 2026-10-06 — Merge into one repository, steps 1–3

- Tool and mode: Cursor Agent
- Skills: none
- Prompt: Make the folder one clean repository that continues the GitHub history: link `origin`, point `main` at `origin/main` without touching files, restore GitHub-only files, set aside duplicates as `.local`, commit the drafts as they are, then fix references, merge duplicates and logs, commit and push. Show every move and delete first and wait for an OK. Never use `reset --hard`, `clean` or a force push.
- Produced: `origin` linked and tracked; `AGENTS.md`, `README.md` and `.gitignore` set aside as `.local`; `f23c3e9` `docs: plan and spec drafts v0 (books, as-is)`.
- Changed or rejected: The local copy of the GitHub repository had been deleted before this step, so the prompt was rewritten to rebuild the history from GitHub instead of moving a nested `.git`. Cursor's free usage ran out after step 3.
- Takeaway: A prompt with numbered steps and a "Done when" check made it clear exactly where the work stopped.

## 2026-10-06 — Merge into one repository, steps 4–6

- Tool and mode: Claude (claude.ai), continuing from `f23c3e9`
- Skills: none
- Prompt: The same merge prompt, steps 4 to 6.
- Produced: One `README.md`, `AGENTS.md` and `.gitignore` (merged from the `.local` copies). Every reference now points to `docs/PLAN.md` and `docs/specs/01` to `06`. `implement-from-spec` was folded into `spec-driven-implementer` and deleted. `docs/prompt-log.md` was merged into this file and deleted. `docs/PLAYBOOK.md` was deleted; commit `f23c3e9` keeps it in history. `docs/workspace-setup.md` lists only skills that exist.
- Changed or rejected: The `log-process` skill, planned for Cursor's native `/create-skill`, was not created because Cursor's usage had run out. This log is kept by hand instead.
- Takeaway: Fixing the references before planning means every later prompt can point the agent at files that exist.

## 2026-10-06 — Spike: check the stack before planning

- Tool and mode: Claude (claude.ai), in a throwaway folder outside the repository
- Skills: none
- Prompt: Before the plan commits to a stack, prove that the planned pieces install and run in the build environment.
- Produced: Findings only, no repository files. Prisma's engine download is blocked (HTTP 403), so Prisma could not run its tests here. Next.js 16.4 with Node's built-in `node:sqlite` passed `next build`, `next start` (data kept between requests, cookies read), `next dev`, and a Vitest transaction test. Google Fonts cannot be fetched at build time. `create-next-app` 16.4 turns on Cache Components and tells agents to read its bundled docs before writing code.
- Changed or rejected: Prisma dropped in favor of `node:sqlite`. Cache Components turned off. Fonts to come from npm. All three are recorded in plan v1 with reasons.
- Takeaway: A short spike before the plan avoided a plan that could not be built.

## 2026-10-06 — Phase 1: plan v1 for the plant exchange

- Tool and mode: Claude (claude.ai). Cursor's Plan mode was the intended tool; its usage had run out.
- Skills: none. Each decision is written with its strongest counter-argument, as the v0 playbook asked of the planning step.
- Prompt: Rewrite plan v0 (books) as plan v1 for a plant exchange, using Lakshna's decisions, and settle every open question with a reason.
- Produced: `docs/PLAN.md` v1.
- Changed or rejected: Lakshna decided three things through a multiple-choice question: list cuttings, seedlings, potted plants and seeds as one listing type with a form; require a city, show it and filter by it; make presentation slides. Claude added a plant-health confirmation (open question 7) and, after the spike, replaced Prisma with `node:sqlite` (open question 8). The city became required; it was optional in v0.
- Takeaway: A "Decided by" column keeps the human's choices visible next to the AI's recommendations.

## 2026-10-06 — Phase 2: specs v1

- Tool and mode: Claude (claude.ai)
- Skills: project `write-spec` (followed step by step: read the plan and all specs first, stable IDs, Given/When/Then with named data, no code, finish with its checks)
- Prompt: Rewrite the six spec files, in order, so they match plan v1. The BOOK IDs may be renamed to PLANT once, because the specs were never approved and no code exists. Keep every other ID.
- Produced: `docs/specs/01` to `06` v1: 45 requirements, 40 acceptance scenarios, seed data of nine plants, the transition table T1–T7 unchanged.
- Changed or rejected: The write-spec checks were run as a script: every requirement has a scenario, every scenario cites existing requirements, no duplicate or undefined IDs, no leftover book wording. A read-through audit (the read-only review step) found four gaps a developer would have to ask about, all in `03-features.md`: where a member lands after listing, editing, removing and requesting; what a visitor sees instead of the request form; what a non-owner sees on an edit page. All four fixed, then every spec marked Approved. One wrong citation was caught before the audit: AC-NFR-4 cited REQ-NFR-1 and -2, which it does not prove.
- Takeaway: Scripting the skill's checks makes "every requirement has a test" verifiable, not a promise.

## 2026-10-06 — Phase 3, M0: scaffold

- Tool and mode: Claude (claude.ai)
- Skills: project `spec-driven-implementer`; imported `test-driven-development`
- Prompt: Build milestone M0 and nothing else: Next.js with TypeScript and Tailwind, the three tables, the seed, Vitest, the scripts, `.env.example` and a README. Scaffold in a temporary folder and copy in.
- Produced: Next.js 16.4 app (Cache Components off), `src/server/db.ts` (schema with `CHECK` constraints generated from `src/domain/constants.ts`), `src/server/seed.ts` and `scripts/seed.ts`, 4 tests for AC-NFR-4, README setup for Windows and macOS/Linux, installed versions recorded in `04-architecture.md`.
- Changed or rejected: The tests were written first and failed because the modules did not exist. Two problems were found and fixed: the seed script crashed under `tsx` (top-level `await` in a CommonJS file), and Vitest warned about an ESM config file loaded as CommonJS (renamed to `vitest.config.mts`). Next.js's own agent-rules block was added to `AGENTS.md`, because `next dev` writes it there anyway. The architecture spec was updated in the same commit: the seed data lives in `src/server/seed.ts` so tests can use it.
- Takeaway: The "Done when" line gave a check anyone can repeat: the home page reads "9 plants are waiting for a new home" from the database.

## 2026-10-06 — Phase 3, M1: swap rules

- Tool and mode: Claude (claude.ai)
- Skills: project `spec-driven-implementer`; imported `test-driven-development`
- Prompt: Build milestone M1: the pure swap transition function and tests for T1 to T7, written as one table-driven test before the function exists.
- Produced: `src/domain/swaps.ts` (`decideSwapAction`, `allowedSwapActions`) and `tests/domain/swaps.test.ts`: all 60 status × action × role combinations, written out by hand from the table in `05-behavior.md`, plus checks that the cases cover all 60 and that the module imports nothing outside `src/domain`. 77 new tests.
- Changed or rejected: The tests failed first because the module did not exist. The expected results were written as literal tables rather than computed, so the tests cannot share a bug with the code.
- Takeaway: Writing the refusal reasons (FORBIDDEN or CONFLICT) as a fixed order in the spec made every one of the 53 refusal cases decidable without asking.

## 2026-10-06 — Phase 3, M2: accounts and the visual style

- Tool and mode: Claude (claude.ai)
- Skills: project `spec-driven-implementer`; imported `test-driven-development`, `frontend-design`, `webapp-testing`
- Prompt: Build milestone M2: register, login, logout, the session helpers, the shared header and the app's visual style, and an empty members-only `/shelf`. Use the frontend-design skill for the header and forms.
- Produced: `src/domain/validation.ts`, `src/domain/navigation.ts`, `src/server/auth.ts`, `session-token.ts`, `session.ts`, `result.ts`; Server Actions in `src/app/actions/auth.ts`; `/register`, `/login`, `/shelf`; the header; `docs/DESIGN.md`. Tests for AC-AUTH-1 to -7 (service and token level, 18 new). A browser check (Python Playwright, following `webapp-testing`) of the "Done when" line and the form behaviors: 8 checks.
- Changed or rejected: Read the Next.js 16.4 docs bundled in `node_modules` first (forms, cookies, redirect, `refresh`). The frontend-design skill's plan → review → build loop rejected a first idea (a herbarium sheet with typewriter text) as too close to its "broadsheet" and "monospace label" defaults. The browser check failed three times, and each failure taught something: (1) my selector was wrong, because Next.js adds a hidden `role="alert"` route announcer; (2) my server helper did not stop the old server; (3) a real defect: `db:reset` deleted the database file under the running app, and SQLite then refused every write ("attempt to write a readonly database"). The spec was changed first (`04-architecture.md`: reset empties the tables in place), then the code, with a new test; the checks then passed, including a reset while the app was running.
- Takeaway: A browser check finds problems that unit tests cannot, including problems in how the app is run, not only in what it does.

## 2026-10-06 — Phase 3, M3: plant listings

- Tool and mode: Claude (claude.ai)
- Skills: project `spec-driven-implementer`; imported `test-driven-development`, `frontend-design`, `webapp-testing`
- Prompt: Build milestone M3: list, edit and remove a plant, and the shelf page. Reuse the components and styles from M2. Test AC-PLANT-5 and AC-PLANT-7 with swap rows inserted directly.
- Produced: `src/server/plants.ts` (create, update, remove, shelf, edit access, plant details), the plant validation schema, `/plants/new`, `/plants/[id]/edit` (with a two-step Remove), `/shelf` with plant tags, and the plant page `/plants/[id]`. `tests/helpers.ts` and 9 service tests for AC-PLANT-1 to -7 and REQ-PLANT-8. A browser check of the "Done when" line: 6 checks.
- Changed or rejected: The plant page belongs to M4, but F2 says a member lands on it after listing, so a first version was built here and M4 finishes it. The design plan's "one bold thing", the nursery stake tag with the city in its point, became `PlantTag`. Three things went wrong on the way. (1) Two browser checks failed because the script read the address before Next.js finished navigating; it now waits for the new address. (2) The tag CSS did not reach the dev server's stylesheet: the production build had it, a stale Turbopack dev cache did not; deleting `.next/dev` fixed it. (3) ESLint flagged `aria-invalid` on radio buttons as unsupported; it was removed, and the error is linked from the fieldset instead.
- Takeaway: Screenshots caught what the tests could not: every test passed while the tags were rendering unstyled.

## 2026-10-06 — Phase 3, M4: browse

- Tool and mode: Claude (claude.ai)
- Skills: project `spec-driven-implementer`; imported `test-driven-development`, `webapp-testing`
- Prompt: Build milestone M4: the browse page with search and the three filters, and the plant's page without the request form. Test AC-BROWSE-1 and -7 with rows changed directly in the test database.
- Produced: `src/domain/browse.ts` (filters to and from the address), `listAvailablePlants` and `listCities` in `src/server/plants.ts`, the browse page `/` (Next.js `<Form>` for a GET search), and the finished plant page. 12 service tests (AC-BROWSE-1 to -8, the browse part of AC-PLANT-1). A browser check: 9 checks, all passing on the first run.
- Changed or rejected: Read the bundled `<Form>` docs before using it. Two edge cases were added as tests while writing the search: `%` and `_` in the search text are matched literally, not as SQL wildcards; and unknown filter values in the address are ignored rather than trusted. The first page draft showed "Clear search and filters" twice when nothing matched; one was removed.
- Takeaway: The city filter's spec line ("each once even when members spell it with different letter case") turned directly into a test: Dana registers as "durham", and Durham still appears once.

## 2026-10-06 — Phase 3, M5: swaps

- Tool and mode: Claude (claude.ai)
- Skills: project `spec-driven-implementer`; imported `test-driven-development`, `webapp-testing`
- Prompt: Build milestone M5: the request form on the plant's page, the swap service using the M1 rules inside a transaction, and the swaps page. The accept step must be one transaction; write the AC-SWAP-6 test before the service code.
- Produced: `src/server/swaps.ts` (`requestSwap`, `actOnSwap`, `listSwaps`, `getRequestOptions`), the request form and "offer a swap" area on the plant page (visitor login link, the nothing-to-offer explanation), and `/swaps` with Incoming and Outgoing. 21 service tests for AC-SWAP-1 to -14, including one where a plant stops being available just before an accept and nothing changes at all. A browser check of the "Done when" line with Alice, Ben and Chidi in three separate browser sessions: 8 checks.
- Changed or rejected: The swap service needed no rule logic of its own. It asks the M1 function what an action does and applies the answer, so the 60 rule cases from M1 still hold. All 21 swap tests passed on the first run. The browser check failed three times: twice on my script (Playwright cannot select an option by pattern; an assertion of mine was wrong, since Chidi may see Alice's separate offer for his Lavender), and once on a real redundancy: a swapped plant on the shelf said "Swapped" twice. The explanation now says "Handed over in a completed swap".
- Takeaway: Keeping the rules in a pure module (M1) made the hardest milestone the smoothest one.

## 2026-10-06 — Phase 3/4, M6: polish, verification and review

- Tool and mode: Claude (claude.ai)
- Skills: project `spec-driven-implementer`, `verify-against-spec`; imported `webapp-testing`, `requesting-code-review`
- Prompt: Build milestone M6: empty and error states, responsive and keyboard fixes, the final README. Then verify everything against the specs and review the code. Work through AC-NFR-1 and AC-NFR-2 page by page.
- Produced: `src/app/error.tsx`; the "hand checklist" for AC-NFR-1 and -2 turned into browser checks (all eight screens at 360 px, a visible label on every field, a keyboard-only register → list → request → accept run checking visible focus at every Tab stop); the browser checks moved into `e2e/` with `run-all.sh`; README sections for a two-window demo and troubleshooting; `docs/VERIFICATION.md` (45/45 requirements and 40/40 scenarios Pass, each with `file:line` and test evidence, generated from the real test output); `docs/REVIEW.md`. A fresh clone that followed only the README passed in production mode.
- Changed or rejected: (1) Read the Next.js 16.4 docs first: the error page's prop is now `retry`, not `reset` as in older versions. (2) The code review found a real security edge: bcrypt ignores everything after 72 bytes, so a 40-character password of accented letters matched a different password with the same first 72 bytes. This was confirmed with a script, then fixed spec first (REQ-AUTH-1, "Changes after approval"), then with a test, then in code. (3) The review skill asks for a separate reviewer subagent; none was started, because separate agents run only when Lakshna asks for them. The review is therefore marked as a self-review, and an independent pass is listed as the top gap. (4) The browser-check runner left a server running between runs, so a second run tested the wrong database (18 of 33 passed). The runner now stops the whole process group and refuses to start on a busy port; two runs in a row then passed 33/33.
- Takeaway: Turning the hand checklist into scripts made accessibility checks repeatable instead of a one-time promise.

## 2026-10-07 — Phase 5: presentation slides

- Tool and mode: Claude (claude.ai), with the Slides artifact type
- Skills: none from this repository. The deck reuses the app's colours and fonts from `docs/DESIGN.md`.
- Prompt: Make the class presentation, focused on how the app was built rather than what it does. Every fact on a slide must come from a file in this repository, and each content slide names its source.
- Produced: A 16-slide deck with speaker notes, kept outside the repository as a private Slides artifact that Lakshna shares. It covers the brief, the path from plan to commits, the switch from Cursor to Claude, the skills, one prompt, the plan, the spike, the specs, the build, one requirement traced end to end, the design, what went wrong, verification, a demo and lessons.
- Changed or rejected: Checking the slides against `git log` showed that `2aa3c28` from Phase 1 is no longer in `main`'s history; the Phase 1 entry now says so. The skills slide lists the native skills that were planned but not used (Plan and Ask modes, `/create-skill`, `/review`, `/canvas`) instead of claiming them.
- Takeaway: Naming a source file on every slide made each claim checkable, and checking them found one line in this log that `git log` no longer confirmed.
