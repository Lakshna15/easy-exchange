# 06 — Milestones

Status: Approved
Last updated: 2026-10-06
Depends on: all other specs

## Purpose

The order in which the app is built. Each milestone is one focused session and one commit. A milestone is done only when its "Done when" line is true and its scenarios have passing tests.

## Rules for every milestone

- Build only what the milestone lists.
- Write tests for the listed scenarios before the code.
- `npm run lint`, `npm run typecheck` and `npm test` pass before the commit.
- If the spec turns out to be wrong, change the spec first, in the same commit.
- Before using a Next.js API, read its page in `node_modules/next/dist/docs/`.

## M0 — Scaffold

- Scope: REQ-NFR-6, REQ-NFR-7.
- Scenarios: AC-NFR-4 (setup part).
- Build: Next.js app with TypeScript and Tailwind, Cache Components off, `src/server/db.ts` with the three tables in `04-architecture.md`, the seed in `05-behavior.md`, Vitest with one passing test, the scripts in `04-architecture.md`, `.env.example`, and a README with setup commands.
- Notes: `create-next-app` may refuse to run in a folder that already has files. Scaffold in a temporary folder and copy the result in, keeping `docs/`, `.cursor/`, `AGENTS.md` and this repository's `.gitignore` entries. Record the installed versions in `04-architecture.md`.
- Done when: `npm run dev` serves a home page that shows the number of seeded plants read from the database.

## M1 — Swap rules

- Scope: REQ-NFR-5.
- Scenarios: AC-NFR-3.
- Build: `src/domain` with the status constants and the pure swap transition function, and tests for T1 to T7.
- Done when: every row of the transition table has a passing test, and the module imports nothing outside `src/domain`.

## M2 — Accounts

- Scope: REQ-AUTH-1 to REQ-AUTH-7, REQ-NFR-1.
- Scenarios: AC-AUTH-1 to AC-AUTH-7.
- Build: register, login, logout, the session helpers, the shared header and the app's visual style, and an empty members-only `/shelf` page to prove protection.
- Done when: Dana can register, log out, log back in, and a visitor cannot open `/shelf`.

## M3 — Plant listings

- Scope: REQ-PLANT-1 to REQ-PLANT-9.
- Scenarios: AC-PLANT-1 to AC-PLANT-7.
- Build: list, edit and remove a plant, and the shelf page.
- Notes: AC-PLANT-5 and AC-PLANT-7 need swaps. Test them at the service level with swap rows created directly in the test database.
- Done when: Alice can list, edit and remove a plant, and Ben cannot change Alice's plants.

## M4 — Browse

- Scope: REQ-BROWSE-1 to REQ-BROWSE-9.
- Scenarios: AC-BROWSE-1 to AC-BROWSE-8.
- Build: the browse page with search and the three filters, and the plant's page without the request form.
- Notes: AC-BROWSE-1 and AC-BROWSE-7 need a reserved plant. Test them with rows created directly in the test database.
- Done when: a visitor can find *Snake plant* by searching `plant` with the filters Houseplant, Potted plant and Raleigh, and reload the result.

## M5 — Swaps

- Scope: REQ-SWAP-1 to REQ-SWAP-13.
- Scenarios: AC-SWAP-1 to AC-SWAP-14.
- Build: the request form on the plant's page, the swap service using the M1 rules inside a transaction, and the swaps page.
- Done when: Alice and Ben can complete a swap of *Golden pothos* for *Monstera* in two browser windows, and Chidi's competing request is cancelled on acceptance.

## M6 — Polish and verify

- Scope: REQ-NFR-1 to REQ-NFR-4 across every page.
- Scenarios: AC-NFR-1, AC-NFR-2, and AC-NFR-4 in full.
- Build: empty and error states, responsive and keyboard fixes, final README, the verification report in `docs/VERIFICATION.md`.
- Done when: the `verify-against-spec` report shows no `Missing`, `Fail` or `Differs from spec` rows, and the hand checklist for AC-NFR-1 and AC-NFR-2 is complete.

## Out of scope

Anything listed as out of scope in `01-overview.md`. Ideas that come up during the build go into `docs/PLAN.md` under a "Later" heading, not into the code.
