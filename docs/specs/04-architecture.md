# 04 — Architecture

Status: Approved
Last updated: 2026-10-06
Depends on: `02-requirements.md`, `05-behavior.md`

## Purpose

Defines how the app is built: the stack, the folders, the data model and the conventions the code must follow. This is the only spec that names libraries and files.

## Stack

| Concern | Choice |
|---------|--------|
| Runtime | Node.js 22.13 or newer (24 LTS recommended). Needed for `node:sqlite` without a flag. |
| Framework | Next.js 16, App Router, TypeScript in strict mode. Cache Components **off**: pages render at request time. |
| Styling | Tailwind CSS 4. Fonts installed from npm, not fetched from Google at build time. |
| Database | SQLite through Node's built-in `node:sqlite`, with plain SQL in `src/server`. |
| Validation | Zod |
| Password hashing | bcryptjs |
| Session token | jose (signed JWT in a cookie) |
| Tests | Vitest |
| Lint | ESLint with `eslint-config-next` |

Use the current stable release of each. Versions installed at milestone 0 (2026-10-06):

| Package | Version |
|---------|---------|
| next | 16.4.0 |
| react | 19.3.0 |
| typescript | 5.9.3 (`create-next-app` pins 5.x) |
| tailwindcss | 4.3.3 |
| zod | 4.6.5 |
| bcryptjs | 3.0.3 |
| jose | 6.2.12 |
| vitest | 5.0.3 |
| eslint | 9.39.5 |
| tsx | 4.23.15 (runs the seed script) |

The app runs as one process on one machine. There is no separate API server.

Next.js 16 changed many APIs. Before using a Next.js API, read its page in `node_modules/next/dist/docs/`. In particular, `params` and `searchParams` are Promises.

## Folders

```
src/
  app/          Routes: pages, layouts, Server Actions and forms. No rules and no SQL.
  components/   Reusable UI.
  domain/       Pure rules: swap transitions, validation schemas, constants. No I/O.
  server/       Database, session, and one service file per area: auth, plants, swaps.
scripts/
  seed.ts       Command line for db:seed and db:reset. The data itself is in src/server/seed.ts,
                so tests can seed an in-memory database.
tests/          Tests for domain and server.
docs/           Plan, specs, process log, verification report.
```

Layering rules:

- `domain` imports nothing from `server`, `app` or any I/O library.
- `server` is the only place that talks to the database or reads the session.
- `app` calls `server` functions. It never runs SQL.

## Data model

All IDs are random UUID strings. Times are ISO 8601 strings in UTC. Every table has `createdAt`; `plants` and `swaps` also have `updatedAt`. "Newest first" means by `createdAt`, with ties broken by insertion order.

### users

| Column | Type | Rule |
|--------|------|------|
| id | text | Primary key. |
| email | text | Unique. Stored trimmed and lower-cased. |
| displayName | text | 2–40 characters. |
| city | text | 1–60 characters, stored trimmed. |
| passwordHash | text | bcrypt hash. Never selected for display. |

### plants

| Column | Type | Rule |
|--------|------|------|
| id | text | Primary key. |
| ownerId | text | References `users`. |
| commonName | text | 1–80 characters. |
| botanicalName | text, nullable | Up to 120 characters. |
| plantType | text | `HOUSEPLANT`, `SUCCULENT_CACTUS`, `HERB`, `VEGETABLE`, `FLOWER`, `TREE_SHRUB`, `OTHER`. |
| form | text | `CUTTING`, `SEEDLING`, `POTTED`, `SEEDS`. |
| description | text, nullable | Up to 1000 characters. |
| status | text | `AVAILABLE`, `RESERVED`, `SWAPPED`, `REMOVED`. Default `AVAILABLE`. |

Index on (`status`, `createdAt`).

The health confirmation is checked on every listing and edit (REQ-PLANT-9) and is not stored: every plant in the database has passed it.

### swaps

| Column | Type | Rule |
|--------|------|------|
| id | text | Primary key. |
| requesterId | text | References `users`. |
| ownerId | text | References `users`. Owner of the requested plant. |
| requestedPlantId | text | References `plants`. |
| offeredPlantId | text | References `plants`. |
| message | text, nullable | Up to 500 characters. |
| status | text | `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED`, `COMPLETED`. Default `PENDING`. |

Indexes on `requesterId`, `ownerId`, `requestedPlantId` and `offeredPlantId`.

Allowed values for `plantType`, `form` and both `status` columns are defined once in `src/domain` and enforced by Zod at the edge. The tables repeat them as `CHECK` constraints as a second line of defence. Foreign keys are switched on.

### Invariants

These hold after every completed action:

1. `swaps.ownerId` is the owner of the requested plant, `swaps.requesterId` is the owner of the offered plant, and the two differ.
2. Both plants of a `PENDING` swap are `AVAILABLE`.
3. A plant is `RESERVED` exactly when one `ACCEPTED` swap involves it.
4. A plant is `SWAPPED` exactly when one `COMPLETED` swap involves it.
5. No two `PENDING` swaps share the same requester and requested plant.

## Database access

- `src/server/db.ts` opens the SQLite file named by `DATABASE_FILE` (default `data/easy-exchange.db`, creating the folder if needed), switches on foreign keys, and creates the tables if they are missing. There is no migration tool: `npm run db:reset` empties the local database and seeds it again. It keeps the file, so it is safe to run while the app is running. (Deleting the file under a running app leaves the app holding a stale handle that SQLite refuses to write to; this was found by the M2 browser check.)
- If `node:sqlite` cannot be loaded, the app stops with a message naming the Node.js version it needs.
- Every service function takes the database handle as its first argument, so tests can pass a fresh in-memory database.
- Multi-step changes run inside `BEGIN IMMEDIATE … COMMIT` through one helper that rolls back on any error.

## Swap rules module

`src/domain/swaps.ts` exports one pure function that takes the current swap status, the action (`accept`, `decline`, `cancel`, `complete`) and the actor's role (`owner`, `requester`, `other`). It returns either the next swap status with the new status for both plants (or none) and whether competing swaps are cancelled, or a refusal with a reason. It implements the transition table in `05-behavior.md` and nothing else.

`src/server/swaps.ts` loads the swap, works out the actor's role, calls the pure function, and applies the result inside one transaction. For `accept`, the same transaction re-checks that both plants are `AVAILABLE` and cancels the competing `PENDING` swaps.

## Sessions and authorization

- Logging in sets a cookie named `ee_session` holding a JWT signed with HS256 and the `SESSION_SECRET` environment variable. The payload holds only the user ID and the expiry.
- The cookie is `httpOnly`, `sameSite=lax`, path `/`, 7 days, and `secure` in production.
- `src/server/session.ts` exports `getCurrentUser()` and `requireUser()`. Every members-only page calls `requireUser()`, which sends visitors to `/login?next=<path>`. Every Server Action checks the session itself and returns `UNAUTHENTICATED` without one.
- Ownership and participant checks happen in the service functions, next to the database call they protect.
- The return address after login is used only if it starts with a single `/`.

## Mutations and errors

Mutations are Server Actions in `src/app` that call a service function and return its result. Every service function returns one of:

- success, with the data the page needs
- failure, with a `code`, a `message` for the user, and optional per-field errors

| Code | Meaning |
|------|---------|
| `UNAUTHENTICATED` | No valid session. |
| `FORBIDDEN` | Signed in but not allowed: not the owner, not a participant, wrong role. |
| `NOT_FOUND` | The plant or swap does not exist or is hidden from this user. |
| `VALIDATION` | Input failed validation. Carries per-field errors. |
| `CONFLICT` | The action is not allowed in the current state: plant not available, swap not pending, duplicate request. |

Expected failures are returned, not thrown. Unexpected errors are thrown and shown by the app's error page without internal detail.

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_FILE` | SQLite file location. Default `data/easy-exchange.db`. |
| `SESSION_SECRET` | At least 32 random characters. |

## Testing

| Layer | Tool | Covers |
|-------|------|--------|
| Domain | Vitest | Every row of the transition table, validation schemas. |
| Services | Vitest against a fresh in-memory SQLite database per test | Scenarios in `05-behavior.md` that read or write data. |
| Pages | Scripted browser checks in `e2e/` (Python Playwright, headless Chromium), run with `bash e2e/run-all.sh` | Redirects, forms keeping their input, what each page shows, swaps between members in separate sessions, 360 px layouts and keyboard-only use. Playwright is not a project dependency, and the checks are not part of `npm test`. |

A test that proves a scenario starts its name with the scenario ID, for example `AC-SWAP-6: accepting reserves both plants`.

## Scripts

`package.json` provides `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `db:seed` and `db:reset`.

## Out of scope

Caching, background jobs, file storage, rate limiting, schema migrations, and deployment configuration.

## Changes from v0

- Prisma replaced by `node:sqlite` with plain SQL (plan v1, decision "Database"). `prisma/` is replaced by `scripts/seed.ts`, and `db:push` by `db:reset`.
- `DATABASE_URL` became `DATABASE_FILE`.
- Cache Components switched off (plan v1, decision "Next.js caching model").
- Book table replaced by `plants`. `genre` and `condition` replaced by `plantType` and `form`.
