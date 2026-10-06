# 06 — Milestones

Status: Draft
Last updated: 2026-10-06
Depends on: all other specs

## Purpose

The order in which the app is built. Each milestone is one Cursor chat and one commit. A milestone is done only when its "Done when" line is true and its scenarios have passing tests.

## Rules for every milestone

- Build only what the milestone lists.
- Write tests for the listed scenarios before the code.
- `npm run lint`, `npm run typecheck` and `npm test` pass before the commit.
- If the spec turns out to be wrong, change the spec first, in the same commit.

## M0 — Scaffold

- Scope: REQ-NFR-6, REQ-NFR-7.
- Scenarios: AC-NFR-4.
- Build: Next.js app with TypeScript and Tailwind, Prisma with the three tables in `04-architecture.md`, the seed in `05-behavior.md`, Vitest with one passing test, the scripts in `04-architecture.md`, `.env.example`, and a README with setup commands.
- Notes: `create-next-app` may refuse to run in a folder that already has files. Scaffold in a temporary subfolder and move the result to the root, keeping `docs/`, `.cursor/`, `.agents/`, `AGENTS.md` and this repository's `.gitignore` entries. Check the current Next.js and Prisma setup docs instead of relying on memory. Record installed versions in `04-architecture.md`.
- Done when: `npm run dev` serves a home page that shows the number of seeded books read from the database.

## M1 — Swap rules

- Scope: REQ-NFR-5.
- Scenarios: AC-NFR-3.
- Build: `src/domain` with the status constants and the pure swap transition function, and tests for T1 to T7.
- Done when: every row of the transition table has a passing test, and the module imports nothing outside `src/domain`.

## M2 — Accounts

- Scope: REQ-AUTH-1 to REQ-AUTH-7, REQ-NFR-1.
- Scenarios: AC-AUTH-1 to AC-AUTH-7.
- Build: register, login, logout, the session helpers, the shared header, and an empty members-only `/shelf` page to prove protection.
- Done when: Dana can register, log out, log back in, and a visitor cannot open `/shelf`.

## M3 — Books

- Scope: REQ-BOOK-1 to REQ-BOOK-8.
- Scenarios: AC-BOOK-1 to AC-BOOK-7.
- Build: list, edit and remove a book, and the shelf page.
- Notes: AC-BOOK-5 and AC-BOOK-7 need swaps. Test them at the service level with swap records created directly in the test database.
- Done when: Alice can list, edit and remove a book, and Ben cannot change Alice's books.

## M4 — Browse

- Scope: REQ-BROWSE-1 to REQ-BROWSE-8.
- Scenarios: AC-BROWSE-1 to AC-BROWSE-7.
- Build: the browse page with search and filters, and the book's page without the request form.
- Notes: AC-BROWSE-1 and AC-BROWSE-7 need a reserved book. Test them with records created directly in the test database.
- Done when: a visitor can find *Pride and Prejudice* by searching `austen` and filtering by Romance, and reload the result.

## M5 — Swaps

- Scope: REQ-SWAP-1 to REQ-SWAP-13.
- Scenarios: AC-SWAP-1 to AC-SWAP-14.
- Build: the request form on the book's page, the swap service using the M1 rules inside a transaction, and the swaps page.
- Done when: Alice and Ben can complete a swap of *Emma* for *Dune* in two browser windows, and Chidi's competing request is cancelled on acceptance.

## M6 — Polish and verify

- Scope: REQ-NFR-1 to REQ-NFR-4 across every page.
- Scenarios: AC-NFR-1, AC-NFR-2.
- Build: empty and error states, responsive and keyboard fixes, final README.
- Done when: the `verify-against-spec` report shows no `Missing`, `Fail` or `Differs from spec` rows, and the hand checklist for AC-NFR-1 and AC-NFR-2 is complete.

## Out of scope

Anything listed as out of scope in `01-overview.md`. Ideas that come up during the build go into `docs/PLAN.md` under a "Later" heading, not into the code.
