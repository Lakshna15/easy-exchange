# Code review: milestones M0–M6

- Skill: imported `requesting-code-review`, using the checklist and output format in its `code-reviewer.md`.
- Range: `bae9247` (M0) to `d31db31` (M6). Requirements: `docs/specs/`.
- Reviewer: Claude (claude.ai). **This is a self-review, not an independent one.** The skill asks for a separate reviewer that has not seen the work; this review was done by the same agent that wrote the code. An independent pass is recommended before the presentation: Cursor's built-in `/review` on the same range when Cursor's usage resets, or a separate review agent.

## Strengths

- **The rules are isolated and fully tested.** `src/domain/swaps.ts` holds the whole lifecycle as one pure function. Its tests cover all 60 status × action × role combinations, from expectations written by hand rather than computed. `actOnSwap` in `src/server/swaps.ts` only applies the decision.
- **Authorization sits next to the data.** Every Server Action checks the session, and every service checks ownership or role beside the SQL it protects (`updatePlant`, `removePlant`, `actOnSwap`). Bound arguments that arrive from the browser, such as a swap ID, are re-validated on the server.
- **Multi-step changes are atomic.** `withTransaction` in `src/server/db.ts` wraps them in `BEGIN IMMEDIATE`, with rollback on error. Accepting a swap re-checks both plants inside the same transaction, and a test shows nothing changes when that check fails.
- **The SQL is safe.** Every query is parameterized, and search text is escaped for `LIKE`, so `%` and `_` are matched literally.
- **Privacy is enforced in the queries.** The plant page never selects the email. `listSwaps` returns the other member's email only while a swap is accepted or completed, and tests check the absence of both emails.
- **Tests use real behavior.** They run against an in-memory SQLite database with no mocks, and each test name carries the scenario ID it proves.
- **Login reveals nothing.** Failed logins get one message, and the password comparison takes about as long for unknown emails.

## Issues

### Critical

None found.

### Important

1. **Fixed in `d31db31`: passwords longer than 72 bytes were silently cut.**
   - File: `src/domain/validation.ts`, `registerSchema.password`.
   - What was wrong: bcrypt ignores everything after 72 bytes. A 40-character password of accented letters is 80 bytes, and it matched a different password with the same first 72 bytes. This was confirmed with a script before fixing.
   - Fix: REQ-AUTH-1 was changed first (`02-requirements.md`, "Changes after approval"), then a test was added (it failed), then a byte-length rule.
2. **Open: logging out does not invalidate the token.**
   - File: `src/server/session.ts`, `endSession`.
   - What's wrong: the cookie is deleted, but the signed token stays valid until it expires (7 days).
   - Why it matters: a copied token keeps working after logout.
   - Fix if needed: a sessions table, or a per-member token version checked in `getCurrentUser`.
   - Accepted for v1: no requirement covers it and the app runs locally. Listed as a gap in `VERIFICATION.md`.
3. **Open: no limit on login attempts.**
   - File: `src/app/actions/auth.ts`, `loginAction`.
   - Why it matters: it allows password guessing.
   - Rate limiting is out of scope in `04-architecture.md`. It is needed before any deployment.

### Minor

1. Registration says "An account with this email already exists" (`src/server/auth.ts`), which tells anyone whether an email is registered. REQ-AUTH-2 asks for an error on the email field; acceptable for a class demo.
2. The login cookie is `secure` in production only (`src/server/session.ts`). Opening a production build at a network address over plain HTTP drops it. Documented in the README's troubleshooting table.
3. Swap cards link to both plants. If a plant is removed after its swap was declined or cancelled, the link shows "Plant not found". The card still names the plant, so the history stays readable.
4. On Node.js 22, `node:sqlite` prints an "experimental" warning. Harmless, and documented in the README.
5. The browse page keeps a city from a shared link selected even when no plants are listed there (`src/app/page.tsx`). Intentional, but the spec doesn't mention it.

## Recommendations

- Get an independent review (see above) and act on what it finds before the presentation.
- Before any deployment: revocable sessions, login rate limiting, and a schema migration tool.
- Run `bash e2e/run-all.sh` after any change; the browser checks caught problems the unit tests could not.

## Declined to judge

- Visual taste: covered by the design review in `docs/DESIGN.md`, not by this code review.
- Behavior under heavy load: out of scope (`05-behavior.md`, "Out of scope").

## Assessment

**Ready to merge?** With fixes. The one Important issue that affected correctness (password bytes) is fixed. The two open Important items are accepted limitations of a local first version and are recorded as gaps.
