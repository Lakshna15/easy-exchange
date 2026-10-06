# 04 — Architecture

Status: Draft
Last updated: 2026-10-06
Depends on: `02-requirements.md`, `05-behavior.md`

## Purpose

Defines how the app is built: the stack, the folders, the data model and the conventions the code must follow. This is the only spec that names libraries and files.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js, App Router, TypeScript in strict mode |
| Styling | Tailwind CSS |
| Database | SQLite, accessed through Prisma |
| Validation | Zod |
| Password hashing | bcryptjs |
| Session token | jose (signed JWT in a cookie) |
| Tests | Vitest |

Use the current stable release of each. Milestone 0 records the installed versions here:

| Package | Version |
|---------|---------|
| next | filled in at M0 |
| prisma | filled in at M0 |

The app runs as one process on one machine. There is no separate API server.

## Folders

```
src/
  app/          Routes: pages, layouts and forms. No rules, no database calls.
  components/   Reusable UI.
  domain/       Pure rules: swap transitions, validation schemas, constants. No I/O.
  server/       Database client, session, and one service file per area: auth, books, swaps.
prisma/
  schema.prisma
  seed.ts
tests/          Tests for domain and server.
docs/           Plan, specs, playbook, process log.
```

Layering rules:

- `domain` imports nothing from `server`, `app` or any I/O library.
- `server` is the only place that talks to the database or reads the session.
- `app` calls `server` functions. It never imports the database client.

## Data model

All IDs are generated strings. All tables have `createdAt`. `Book` and `Swap` also have `updatedAt`.

### User

| Field | Type | Rule |
|-------|------|------|
| id | string | Primary key. |
| email | string | Unique. Stored trimmed and lower-cased. |
| displayName | string | 2–40 characters. |
| city | string, optional | Up to 60 characters. |
| passwordHash | string | bcrypt hash. Never selected for display. |

### Book

| Field | Type | Rule |
|-------|------|------|
| id | string | Primary key. |
| ownerId | string | References User. |
| title | string | 1–200 characters. |
| author | string | 1–120 characters. |
| genre | string | `FICTION`, `NON_FICTION`, `MYSTERY`, `SCIFI_FANTASY`, `ROMANCE`, `BIOGRAPHY`, `CHILDREN`, `TEXTBOOK`, `OTHER`. |
| condition | string | `LIKE_NEW`, `GOOD`, `FAIR`, `WORN`. |
| description | string, optional | Up to 1000 characters. |
| status | string | `AVAILABLE`, `RESERVED`, `SWAPPED`, `REMOVED`. Default `AVAILABLE`. |

Index on (`status`, `createdAt`).

### Swap

| Field | Type | Rule |
|-------|------|------|
| id | string | Primary key. |
| requesterId | string | References User. |
| ownerId | string | References User. Owner of the requested book. |
| requestedBookId | string | References Book. |
| offeredBookId | string | References Book. |
| message | string, optional | Up to 500 characters. |
| status | string | `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED`, `COMPLETED`. Default `PENDING`. |

Indexes on `requesterId`, `ownerId`, `requestedBookId` and `offeredBookId`.

Allowed values for `genre`, `condition` and both `status` fields are defined once in `domain` and enforced by Zod. Use database enums only if the installed Prisma version supports them for SQLite.

### Invariants

These hold after every completed action:

1. `Swap.ownerId` is the owner of the requested book, `Swap.requesterId` is the owner of the offered book, and the two differ.
2. Both books of a `PENDING` swap are `AVAILABLE`.
3. A book is `RESERVED` exactly when one `ACCEPTED` swap involves it.
4. A book is `SWAPPED` exactly when one `COMPLETED` swap involves it.
5. No two `PENDING` swaps share the same requester and requested book.

## Swap rules module

`src/domain/swaps.ts` exports one pure function that takes the current swap status, the action (`accept`, `decline`, `cancel`, `complete`) and the actor's role (`owner`, `requester`, `other`), and returns either the next swap status with the new status for both books, or a refusal with a reason. It implements the transition table in `05-behavior.md` and nothing else.

`src/server/swaps.ts` loads the swap, works out the actor's role, calls the pure function, and applies the result inside one database transaction. For `accept`, the same transaction re-checks that both books are `AVAILABLE` and cancels the competing `PENDING` swaps.

## Sessions and authorization

- Logging in sets a cookie named `ee_session` holding a JWT signed with HS256 and the `SESSION_SECRET` environment variable. The payload holds only the user ID and the expiry.
- The cookie is `httpOnly`, `sameSite=lax`, path `/`, 7 days, and `secure` in production.
- `src/server/session.ts` exports `getCurrentUser()` and `requireUser()`. Every members-only page and every mutation calls `requireUser()`. Route-level redirects are a convenience and never the only check.
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
| `NOT_FOUND` | The book or swap does not exist or is hidden from this user. |
| `VALIDATION` | Input failed validation. Carries per-field errors. |
| `CONFLICT` | The action is not allowed in the current state: book not available, swap not pending, duplicate request. |

Expected failures are returned, not thrown. Unexpected errors are thrown and shown by the app's error page without internal detail.

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite file location. |
| `SESSION_SECRET` | At least 32 random characters. |

## Testing

| Layer | Tool | Covers |
|-------|------|--------|
| Domain | Vitest | Every row of the transition table, validation schemas. |
| Services | Vitest against a temporary SQLite database | Scenarios in `05-behavior.md` that read or write data. |
| Pages | Hand checklist in milestone 6 | Layout, keyboard use, full flows in the browser. |

A test that proves a scenario starts its name with the scenario ID, for example `AC-SWAP-6: accepting reserves both books`.

## Scripts

`package.json` provides `dev`, `build`, `lint`, `typecheck`, `test`, `db:push` and `db:seed`.

## Out of scope

Caching, background jobs, file storage, rate limiting, and deployment configuration.
