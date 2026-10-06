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
- Produced: `2aa3c28` `docs: add project README for book exchange`, pushed to `main` at https://github.com/Lakshna15/easy-exchange. GitHub showed "This repository is empty." before the push.
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
