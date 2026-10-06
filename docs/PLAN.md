# Easy Exchange — Plan

Status: v1, approved. Replaces the v0 draft (a book swap), which is kept in commit `f23c3e9`.
Last updated: 2026-10-06

## 1. Goal

Build a small web app where neighbours swap plants one-for-one, with no money involved. A listing is one cutting, seedling, potted plant or packet of seeds.

The project succeeds when:

- Two different members can complete a swap end to end: list plants, request, accept, complete.
- Every behavior in the app traces back to a requirement in `docs/specs/`, and every requirement has a test or a hand check.
- The repository shows the process: plan, then specs, then one commit per milestone, with a log of the tools, prompts and skills used.

## 2. Problem and users

People who grow plants end up with extras: cuttings from pruning, seedlings they over-sowed, seeds they saved, a pothos that outgrew its shelf. Selling them is not worth the effort, and throwing them away feels wasteful. A swap gives the plant a new home and gives the owner something new to grow.

Plants are alive and fragile, so they change hands in person. That makes two things matter more than in a book swap: **where** a member is, and whether a plant is **healthy**.

| User | Wants to |
|------|----------|
| Visitor | See which plants are on offer nearby before signing up. |
| Member | List plants, find one they want, offer one of theirs for it. |
| Plant owner | Review incoming offers and accept the one they like. |

## 3. Scope

In the first version:

- Accounts: register with a city, log in, log out.
- Plants: list, edit, remove, see my shelf. Each listing has a form: cutting, seedling, potted plant or seeds.
- Browse: list available plants; search by common or botanical name; filter by plant type, form and city.
- Swaps: request one plant by offering one plant, accept, decline, cancel, mark completed.

Left out on purpose:

| Left out | Why |
|----------|-----|
| Money, prices, payments | It is an exchange, and payments add legal and security weight. |
| Shipping | Live plants travel badly. Swaps are handed over in person. |
| Chat or messaging | The two members get each other's email once a swap is accepted. |
| Photos and image upload | File storage adds work that shows nothing about the exchange itself. The description carries size, pot and care notes. |
| Maps and distance search | A city filter is enough for a class-size demo. Distance needs a geocoding service. |
| Ratings and reviews | Needs many completed swaps to mean anything. |
| Multi-plant swaps | One-for-one keeps the state rules small enough to test fully. |
| Care guides, seasons, plant encyclopedia | Content, not exchange. |
| Email notifications, password reset | Needs an email service. |
| Admin and moderation | Not needed for a class-size demo. |
| Deployment | The app runs locally for the presentation. |

## 4. Key decisions

Each decision lists the strongest argument against it, so the choice can be revisited on purpose.

| Decision | Choice | Alternatives considered | Why | Strongest argument against |
|----------|--------|-------------------------|-----|----------------------------|
| Kind of exchange | Plants, one-for-one. *Decided by Lakshna.* | Books (v0), vinyl, coins | In-person handoff and plant health give the app real reasons for its rules. | Plant data is less uniform than book data: no ISBN, and names vary. Mitigation: the common name is required and the botanical name is optional. |
| What a listing is | One listing type with a form: cutting, seedling, potted plant or seeds. *Decided by Lakshna.* | Potted plants only; seeds only | Covers what people actually trade, with one table and one filter. | A seed packet and a potted plant are not equal in value. The owner decides by accepting or declining. |
| Location | Every member gives a city at registration. It is shown on their plants and can be used as a filter. *Decided by Lakshna.* | City shown only (v0); map distance | In-person handoff makes "near me" the first thing a visitor filters on. | Free-text cities can be misspelled and split the filter. Mitigation: the filter offers only cities in use, trimmed and matched without regard to letter case. |
| City required | Required at registration. In v0 it was optional. | Optional | The city filter only works if every plant has a city. | One more field at sign-up. |
| Plant health | Listing or editing a plant requires ticking "No visible pests or disease". | Nothing; photo proof | Pests spread between collections. A declaration sets the norm at almost no cost. | It is self-declared and cannot be checked. Accepted for v1. |
| Stack | Next.js 16 (App Router) + TypeScript + Tailwind | Express + templates; separate React and API | One codebase and one dev server. | Next.js 16 changed many APIs. Mitigation: read the docs that ship in `node_modules/next/dist/docs/` before writing code. |
| Next.js caching model | Cache Components **off**: pages render at request time. | Next.js 16's default, Cache Components on | Every page depends on the session or on live listings, so there is nothing useful to prerender. The request-time model is simpler to reason about and to test. | Next.js plans to make Cache Components the only model in its next major version. Revisit before upgrading. |
| Database | SQLite through Node's built-in `node:sqlite`, with plain SQL in one server module | Prisma (v0), Postgres, JSON files | A spike on 2026-10-06 showed that Prisma's engine download is blocked in the build sandbox, so its tests could not run there. `node:sqlite` needs no download and no native build. It worked in `next build`, `next dev` and Vitest, and Next.js 16.4's own docs name it. | It needs Node.js 22.13 or newer and prints an "experimental" warning on Node 22. There is no ORM, so the SQL is hand-written. Mitigation: SQL lives only in `src/server`, and tests cover every query. |
| Mutations | Server Actions | REST API routes | Less boilerplate, and the app is the only client. | Harder to call from other tools. Not needed. |
| Auth | Email and password, bcrypt hash, signed httpOnly cookie | Auth library; demo user switcher | Small and fully understood. A switcher would not exercise the authorization rules. | Hand-rolled auth is easy to get wrong. Mitigation: a security review in milestone 6. |
| Swap rules | A pure module with no I/O | Rules inside the server actions | Every state transition can be unit tested without a database. | One more layer to read. |
| Closing competing requests | Automatic when one request is accepted | Leave them pending | A reserved plant must not look obtainable. | A member's request disappears without them doing anything. The swaps page shows it as cancelled. |
| Completing a swap | Either member marks it completed | Both members confirm | One click is enough for a first version. | One member can close a swap the other disputes. Accepted for v1. |
| Removing a plant | Soft removal (status `REMOVED`) | Hard delete | Past swaps keep pointing at a real plant. | Removed rows stay in the database. |
| Contact details | Email hidden until a swap is accepted | Always visible | Privacy by default. | Members cannot ask questions before requesting. Accepted: the description carries the details. |

## 5. Risks

| Risk | Mitigation |
|------|------------|
| The agent builds things the specs do not ask for. | `spec-driven-implementer` skill, `AGENTS.md`, and a `verify-against-spec` audit after each milestone. |
| Cursor's free usage runs out. | It did, on 2026-10-06. Claude continues with the same rules and skills, and `docs/PROCESS_LOG.md` records which tool did each step. |
| The agent writes code from outdated framework knowledge. | Next.js 16.4 ships a warning to agents and its own docs. Read the relevant guide in `node_modules/next/dist/docs/` before writing code that uses a Next.js API. |
| The build sandbox blocks some downloads (Prisma engines, Google Fonts). | Spike before committing to a dependency. Prefer packages that install from npm alone. |
| Lakshna's computer runs a Node.js version older than 22.13. | The README states the version. The app stops with a clear message if `node:sqlite` is missing. |
| `create-next-app` may refuse to run in a folder that already has files. | Scaffold in a temporary folder and copy the result in. |
| Two people accept requests for the same plant at once. | The accept step runs in one transaction and re-checks that both plants are `AVAILABLE`. |
| Misspelled cities split the city filter. | Filter options come from cities in use, trimmed, without regard to letter case. |
| Scope creep. | The non-goals above are repeated in the overview spec. |

## 6. Open questions, settled

| # | Question | Answer | Reason | Decided by |
|---|----------|--------|--------|------------|
| 1 | Who completes a swap? | Either participant. | One click is enough for v1. Requiring both doubles the states. | Draft answer kept |
| 2 | Can visitors browse without an account? | Yes. | People decide to join after seeing what is on offer. | Draft answer kept |
| 3 | Do we show photos? | No, not in v1. | Image upload is out of scope. The description carries the details. | Draft answer kept |
| 4 | Is there a limit on open requests per member? | No overall limit; at most one pending request per member for the same plant. | Stops repeated requests for one plant without blocking normal use. | Draft answer kept |
| 5 | Does location matter? | Yes: city required, shown on every plant, and filterable. | Plants are handed over in person. | Lakshna |
| 6 | What can be listed? | Cuttings, seedlings, potted plants and seeds, as one listing type with a form. | Covers what people actually trade. | Lakshna |
| 7 | How do we handle plant health? | A required "No visible pests or disease" confirmation on every listing and edit. | Cheap, and sets the norm. | Claude's recommendation, accepted |
| 8 | Which database? | `node:sqlite` instead of Prisma. | See the spike in section 4. | Claude, after the spike |

## 7. Process

| Phase | Tool | Skills | Output | Commit |
|-------|------|--------|--------|--------|
| 0 Setup | Cursor Agent | Native project rules; imported skills; project `spec-driven-implementer` | Rules and skills | `d2d6b03` |
| 0 Merge | Cursor Agent, then Claude | none | One repository, references fixed | `f23c3e9`, `336a120` |
| 1 Plan | Claude | Each decision written with its strongest counter-argument | This file, v1 | `docs: plan v1` |
| 2 Specs | Claude | Project `write-spec`; a read-only audit | `docs/specs/*` approved | `docs: specs v1` |
| 3 Build | Claude | Project `spec-driven-implementer`; imported `test-driven-development`, `frontend-design` | Code and tests | One commit per milestone |
| 4 Verify | Claude | Project `verify-against-spec`; imported `webapp-testing`, `requesting-code-review` | Coverage report, browser run, fixes | `docs: verification`, `fix: ...` |
| 5 Present | Claude | none | Slides | none |

Cursor's native skills (`/review`, `/canvas`) can be added when its usage resets. Each step's prompt and result are in `docs/PROCESS_LOG.md`.
