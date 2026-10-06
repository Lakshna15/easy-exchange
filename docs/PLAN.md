# Easy Exchange — Plan

Status: Draft v0. To be challenged and revised in Cursor (Playbook phase 1) before any spec is approved.
Last updated: 2026-10-06

## 1. Goal

Build a small web app where readers swap books one-for-one, with no money involved.

The project succeeds when:

- Two different users can complete a swap end to end: list books, request, accept, complete.
- Every behavior in the app traces back to a requirement in `docs/specs/`, and every requirement has a test.
- The repository shows the process: plan, then specs, then one commit per milestone, with a log of the prompts and skills used.

## 2. Problem and users

Readers finish books and leave them on a shelf. Selling them is slow and earns little. A swap gives the book a new reader and gives the owner something new to read.

| User | Wants to |
|------|----------|
| Visitor | See which books are available before signing up. |
| Member | List books, find a book they want, offer one of theirs for it. |
| Book owner | Review incoming offers and accept the one they like. |

## 3. Scope

In the first version:

- Accounts: register, log in, log out.
- Books: list, edit, remove, see my shelf.
- Browse: list available books, search by title or author, filter by genre and condition.
- Swaps: request one book by offering one book, accept, decline, cancel, mark completed.

Left out on purpose:

| Left out | Why |
|----------|-----|
| Money, prices, payments | It is an exchange, and payments add legal and security weight. |
| Chat or messaging | The two members get each other's email once a swap is accepted. |
| Image upload | File storage adds work that shows nothing about the exchange itself. |
| Ratings and reviews | Needs many completed swaps to mean anything. |
| Multi-book swaps | One-for-one keeps the state rules small enough to test fully. |
| Email notifications, password reset | Needs an email service. |
| Admin and moderation | Not needed for a class-size demo. |
| Deployment | The app runs locally for the presentation. |

## 4. Key decisions

| Decision | Choice | Alternatives considered | Why |
|----------|--------|-------------------------|-----|
| Kind of exchange | Books, one-for-one | Plants, vinyl, collectibles | Everyone understands the data, and it needs no grading system. |
| Stack | Next.js (App Router) + TypeScript + Tailwind | Express + templates; separate React and API | One codebase and one dev server. |
| Database | SQLite through Prisma | Postgres; JSON files | Zero setup, a real relational model, transactions for the accept step. |
| Mutations | Server Actions | REST API routes | Less boilerplate, and no API consumer other than the app. |
| Auth | Email and password, bcrypt hash, signed httpOnly cookie | Auth library; demo user switcher | Small and fully understood. A switcher would not exercise the authorization rules. |
| Swap rules | A pure module with no I/O | Rules inside the server actions | Every state transition can be unit tested without a database. |
| Closing competing requests | Automatic when one request is accepted | Leave them pending | A reserved book must not look obtainable. |
| Completing a swap | Either member marks it completed | Both members confirm | One click is enough for a first version. See open question 1. |
| Removing a book | Soft removal (status `REMOVED`) | Hard delete | Past swaps keep pointing at a real book. |
| Contact details | Email hidden until a swap is accepted | Always visible | Privacy by default. |

## 5. Risks

| Risk | Mitigation |
|------|------------|
| The agent builds things the specs do not ask for. | `spec-driven-implementer` skill, `AGENTS.md`, and a `verify-against-spec` audit after each milestone. |
| Limited usage on Cursor's free tier. | Small milestones, one fresh chat per milestone, specs referenced by file instead of pasted. |
| The agent uses outdated setup steps for Next.js or Prisma. | Milestone 0 is only scaffold plus a database round trip. The prompt tells the agent to check current docs. |
| `create-next-app` may refuse to run in a folder that already has files. | Scaffold in a temporary subfolder and move the result to the root. |
| Two people accept requests for the same book at once. | The accept step runs in one transaction and re-checks that both books are `AVAILABLE`. |
| Scope creep. | The non-goals above are repeated in the overview spec. |

## 6. Open questions to settle during planning

| # | Question | Options | Draft answer |
|---|----------|---------|--------------|
| 1 | Who completes a swap? | Either member; both must confirm | Either member. |
| 2 | Can visitors browse without an account? | Yes; login required | Yes. |
| 3 | Do we show book covers? | No; fetch by ISBN from Open Library | No in v1. |
| 4 | Is there a limit on open requests per member? | No limit; a fixed cap | No limit. |
| 5 | Does location matter? | Free-text city shown on the book; filter by city | Show city, no filter. |

## 7. Process

| Phase | Cursor mode | Skills | Output | Commit |
|-------|-------------|--------|--------|--------|
| 0 Setup | Agent | Native project rules; imported skills installed | Skills available, process log started | `chore: project kit and skills` |
| 1 Plan | Plan | Native Plan mode | `docs/PLAN.md` v1 | `docs: plan` |
| 2 Specs | Agent, then Ask | Project `write-spec` | `docs/specs/*` approved | `docs: specs v1` |
| 3 Build | Agent, one chat per milestone | Project `spec-driven-implementer`; imported `test-driven-development`, `frontend-design`, `webapp-testing` | Code and tests | One commit per milestone |
| 4 Verify | Agent | Project `verify-against-spec`; native `/review`; imported `requesting-code-review`, `webapp-testing` | Coverage report, fixes | `fix: ...` |
| 5 Present | Ask | Native `/canvas` | `docs/PROCESS_LOG.md` complete | `docs: process log` |

Each step's prompt is recorded in `docs/PROCESS_LOG.md`.
