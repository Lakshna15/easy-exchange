# Verification report

- Skill: project `verify-against-spec` (read-only: it reports and does not fix).
- Run: 2026-10-06, at commit `d31db31`. Scope: everything.
- Specs: `docs/specs/02-requirements.md` (45 requirements) and `docs/specs/05-behavior.md` (40 scenarios).

## Result

| Check | Result |
|-------|--------|
| Requirements | **45 of 45 Pass** |
| Scenarios | **40 of 40 Pass** |
| `npm test` | 141 of 141 tests pass |
| Browser checks (`bash e2e/run-all.sh`) | 33 of 33 pass |
| `npm run lint`, `npm run typecheck` | Clean |
| Fresh clone, following only the README, production build (AC-NFR-4) | Pass: 9 plants listed, Alice logs in, no `.env` tracked, no secrets found |

## How the evidence was gathered

1. Every `REQ` was listed from `02-requirements.md` and every `AC` from `05-behavior.md`.
2. Each `AC` was matched to the unit tests whose names start with its ID, and to the browser checks that name it. The results are the real output of `npm test` (Vitest JSON) and `e2e/run-all.sh` at this commit.
3. Each `REQ` was matched to the code that implements it (`file:line`) and to the scenarios that cite it. The code was then read to judge whether it does what the requirement says, including the server-side checks. A passing test is evidence, not proof.
4. Status values: `Pass`, `Fail`, `Untested`, `Missing`, `Differs from spec`.

## Requirements

| ID | Status | Evidence | Note |
|----|--------|----------|------|
| REQ-AUTH-1 | Pass | `src/domain/validation.ts:15`, `src/server/auth.ts:18`; scenarios AC-AUTH-1, AC-AUTH-7 | Byte limit added after the code review (see REVIEW.md). |
| REQ-AUTH-2 | Pass | `src/domain/validation.ts:7`, `src/server/auth.ts:23`; scenarios AC-AUTH-2 |  |
| REQ-AUTH-3 | Pass | `src/server/auth.ts:27`, `src/server/auth.ts:8`; scenarios AC-AUTH-3 | Also checked the dev server log: Server Action arguments are logged as `{}`, never the form fields. |
| REQ-AUTH-4 | Pass | `src/server/auth.ts:43`, `src/server/session.ts:9`, `src/server/session-token.ts:6`; scenarios AC-AUTH-1, AC-AUTH-6 | Cookie and token both expire after 7 days. |
| REQ-AUTH-5 | Pass | `src/server/auth.ts:11`, `src/server/auth.ts:16`; scenarios AC-AUTH-4 |  |
| REQ-AUTH-6 | Pass | `src/server/session.ts:32`, `src/domain/navigation.ts:2`; scenarios AC-AUTH-5 |  |
| REQ-AUTH-7 | Pass | `src/domain/validation.ts:25`, `src/server/plants.ts:171`; scenarios AC-AUTH-1, AC-PLANT-1 |  |
| REQ-PLANT-1 | Pass | `src/domain/validation.ts:47`, `src/server/plants.ts:49`; scenarios AC-PLANT-1, AC-PLANT-2 |  |
| REQ-PLANT-2 | Pass | `src/domain/constants.ts:4`; scenarios AC-PLANT-2 |  |
| REQ-PLANT-3 | Pass | `src/domain/constants.ts:25`; scenarios AC-PLANT-2 |  |
| REQ-PLANT-4 | Pass | `src/server/plants.ts:57`; scenarios AC-PLANT-1 |  |
| REQ-PLANT-5 | Pass | `src/server/plants.ts:71`; scenarios AC-PLANT-3, AC-PLANT-5 |  |
| REQ-PLANT-6 | Pass | `src/server/plants.ts:89`; scenarios AC-PLANT-5, AC-PLANT-6, AC-PLANT-7 |  |
| REQ-PLANT-7 | Pass | `src/server/plants.ts:29`, `src/app/plants/[id]/edit/page.tsx:25`; scenarios AC-PLANT-4 |  |
| REQ-PLANT-8 | Pass | `src/server/plants.ts:122`, `src/app/shelf/page.tsx:12`; scenarios AC-PLANT-1, AC-PLANT-6; 1 named unit test(s) |  |
| REQ-PLANT-9 | Pass | `src/domain/validation.ts:57`, `src/app/plants/PlantForm.tsx:72`; scenarios AC-PLANT-1, AC-PLANT-2, AC-PLANT-3 |  |
| REQ-BROWSE-1 | Pass | `src/server/plants.ts:148`, `src/app/page.tsx:16`; scenarios AC-BROWSE-1 |  |
| REQ-BROWSE-2 | Pass | `src/server/plants.ts:154`; scenarios AC-BROWSE-2 |  |
| REQ-BROWSE-3 | Pass | `src/server/plants.ts:157`, `src/domain/browse.ts:4`; scenarios AC-BROWSE-3, AC-BROWSE-8 |  |
| REQ-BROWSE-4 | Pass | `src/domain/browse.ts:13`, `src/app/page.tsx:31`; scenarios AC-BROWSE-3 |  |
| REQ-BROWSE-5 | Pass | `src/app/page.tsx:85`; scenarios AC-BROWSE-4 |  |
| REQ-BROWSE-6 | Pass | `src/server/plants.ts:129`, `src/app/plants/[id]/page.tsx:47`; scenarios AC-BROWSE-5 |  |
| REQ-BROWSE-7 | Pass | `src/server/plants.ts:177`, `src/app/plants/[id]/page.tsx:58`; scenarios AC-BROWSE-6 |  |
| REQ-BROWSE-8 | Pass | `src/server/plants.ts:137`, `src/app/not-found.tsx:7`; scenarios AC-PLANT-6, AC-BROWSE-7 |  |
| REQ-BROWSE-9 | Pass | `src/server/plants.ts:181`; scenarios AC-BROWSE-8 |  |
| REQ-SWAP-1 | Pass | `src/server/swaps.ts:46`, `src/app/plants/[id]/RequestSwapForm.tsx:10`; scenarios AC-SWAP-1 |  |
| REQ-SWAP-2 | Pass | `src/server/swaps.ts:57`; scenarios AC-SWAP-2 |  |
| REQ-SWAP-3 | Pass | `src/server/swaps.ts:66`; scenarios AC-SWAP-3 |  |
| REQ-SWAP-4 | Pass | `src/server/swaps.ts:122`, `src/app/plants/[id]/page.tsx:90`; scenarios AC-SWAP-4 |  |
| REQ-SWAP-5 | Pass | `src/domain/swaps.ts:37`, `src/server/swaps.ts:87`; scenarios AC-SWAP-5 |  |
| REQ-SWAP-6 | Pass | `src/domain/swaps.ts:16`, `src/server/swaps.ts:98`, `src/server/swaps.ts:110`; scenarios AC-SWAP-6, AC-SWAP-7 | Includes a test where a plant changed before the accept and nothing changed at all. |
| REQ-SWAP-7 | Pass | `src/domain/swaps.ts:38`; scenarios AC-SWAP-8 |  |
| REQ-SWAP-8 | Pass | `src/domain/swaps.ts:39`; scenarios AC-SWAP-9 |  |
| REQ-SWAP-9 | Pass | `src/domain/swaps.ts:40`; scenarios AC-SWAP-10 |  |
| REQ-SWAP-10 | Pass | `src/domain/swaps.ts:49`; scenarios AC-SWAP-11 |  |
| REQ-SWAP-11 | Pass | `src/server/swaps.ts:133`, `src/app/swaps/SwapSteps.tsx:19`; scenarios AC-SWAP-1, AC-SWAP-14; 1 named unit test(s) |  |
| REQ-SWAP-12 | Pass | `src/server/swaps.ts:158`; scenarios AC-SWAP-12 |  |
| REQ-SWAP-13 | Pass | `src/server/swaps.ts:92`, `src/server/swaps.ts:146`; scenarios AC-SWAP-13 |  |
| REQ-NFR-1 | Pass | `src/app/actions/form-state.ts:20`, `src/domain/validation.ts:70`; scenarios AC-AUTH-7, AC-PLANT-2 |  |
| REQ-NFR-2 | Pass | `src/app/actions/swaps.ts:15`, `src/app/actions/plants.ts:26`; scenarios AC-PLANT-4, AC-SWAP-13 |  |
| REQ-NFR-3 | Pass | `src/components/PlantTag.tsx:40`, `src/app/layout.tsx:21`; scenarios AC-NFR-1 | All eight screens measured at 360 px in headless Chromium. |
| REQ-NFR-4 | Pass | `src/components/form-controls.tsx:24`, `src/app/globals.css:38`; scenarios AC-NFR-2 | Keyboard-only run with a visible-focus check at every Tab stop. |
| REQ-NFR-5 | Pass | `src/domain/swaps.ts:48`; scenarios AC-NFR-3 |  |
| REQ-NFR-6 | Pass | `README.md:8`, `src/server/seed.ts:11`; scenarios AC-NFR-4 | Fresh clone, README commands only, production build: passed. |
| REQ-NFR-7 | Pass | `.env.example:8`, `.gitignore:18`; scenarios AC-NFR-4 | `git ls-files` shows no `.env`; a secret scan of the clone found nothing. |

## Scenarios

| ID | Status | Evidence | Scenario |
|----|--------|----------|----------|
| AC-AUTH-1 | Pass | 2 unit tests in `tests/server/auth.test.ts`; 1 browser check | Register |
| AC-AUTH-2 | Pass | 1 unit test in `tests/server/auth.test.ts` | Duplicate email, ignoring case and spaces |
| AC-AUTH-3 | Pass | 1 unit test in `tests/server/auth.test.ts` | Password is hashed |
| AC-AUTH-4 | Pass | 3 unit tests in `tests/server/auth.test.ts`, `tests/server/session-token.test.ts`; 1 browser check | Login failure does not reveal which part was wrong |
| AC-AUTH-5 | Pass | 8 unit tests in `tests/domain/return-path.test.ts`; 2 browser checks | Return to the page after login |
| AC-AUTH-6 | Pass | 1 unit test in `tests/server/session-token.test.ts`; 1 browser check | Log out |
| AC-AUTH-7 | Pass | 1 unit test in `tests/server/auth.test.ts`; 1 browser check | Registration errors keep the input |
| AC-PLANT-1 | Pass | 2 unit tests in `tests/server/browse.test.ts`, `tests/server/plants.test.ts`; 1 browser check | List a plant |
| AC-PLANT-2 | Pass | 1 unit test in `tests/server/plants.test.ts`; 1 browser check | Invalid listings are refused |
| AC-PLANT-3 | Pass | 2 unit tests in `tests/server/plants.test.ts`; 1 browser check | Edit an available plant |
| AC-PLANT-4 | Pass | 1 unit test in `tests/server/plants.test.ts`; 1 browser check | Only the owner can change a plant |
| AC-PLANT-5 | Pass | 1 unit test in `tests/server/plants.test.ts` | A reserved plant is locked |
| AC-PLANT-6 | Pass | 1 unit test in `tests/server/plants.test.ts`; 1 browser check | Remove a plant |
| AC-PLANT-7 | Pass | 1 unit test in `tests/server/plants.test.ts` | A plant with a pending swap cannot be removed |
| AC-BROWSE-1 | Pass | 1 unit test in `tests/server/browse.test.ts`; 1 browser check | Visitors see available plants only |
| AC-BROWSE-2 | Pass | 2 unit tests in `tests/server/browse.test.ts`; 1 browser check | Search matches the common or the botanical name |
| AC-BROWSE-3 | Pass | 2 unit tests in `tests/server/browse.test.ts`; 1 browser check | Search and filters combine and live in the address |
| AC-BROWSE-4 | Pass | 1 unit test in `tests/server/browse.test.ts`; 1 browser check | Nothing matches |
| AC-BROWSE-5 | Pass | 1 unit test in `tests/server/browse.test.ts`; 1 browser check | The plant's page hides the email |
| AC-BROWSE-6 | Pass | 1 unit test in `tests/server/browse.test.ts`; 1 browser check | Own plants cannot be requested |
| AC-BROWSE-7 | Pass | 1 unit test in `tests/server/browse.test.ts`; 1 browser check | Plants that are no longer available |
| AC-BROWSE-8 | Pass | 2 unit tests in `tests/server/browse.test.ts`; 1 browser check | Filter by city |
| AC-SWAP-1 | Pass | 2 unit tests in `tests/server/swaps.test.ts`; 1 browser check | Request a swap |
| AC-SWAP-2 | Pass | 2 unit tests in `tests/server/swaps.test.ts` | Invalid requests are refused |
| AC-SWAP-3 | Pass | 1 unit test in `tests/server/swaps.test.ts`; 1 browser check | One pending request per plant |
| AC-SWAP-4 | Pass | 1 unit test in `tests/server/swaps.test.ts`; 1 browser check | Nothing to offer |
| AC-SWAP-5 | Pass | 1 unit test in `tests/server/swaps.test.ts` | Decline |
| AC-SWAP-6 | Pass | 2 unit tests in `tests/server/swaps.test.ts`; 3 browser checks | Accept reserves both plants and cancels competing requests |
| AC-SWAP-7 | Pass | 1 unit test in `tests/server/swaps.test.ts` | A stale accept changes nothing |
| AC-SWAP-8 | Pass | 1 unit test in `tests/server/swaps.test.ts` | Requester cancels a pending request |
| AC-SWAP-9 | Pass | 2 unit tests in `tests/server/swaps.test.ts` | Cancelling an accepted swap frees the plants |
| AC-SWAP-10 | Pass | 2 unit tests in `tests/server/swaps.test.ts`; 2 browser checks | Complete |
| AC-SWAP-11 | Pass | 1 unit test in `tests/server/swaps.test.ts` | Finished swaps never change |
| AC-SWAP-12 | Pass | 1 unit test in `tests/server/swaps.test.ts`; 2 browser checks | Email appears only after acceptance |
| AC-SWAP-13 | Pass | 2 unit tests in `tests/server/swaps.test.ts`; 1 browser check | Wrong person or wrong role |
| AC-SWAP-14 | Pass | 1 unit test in `tests/server/swaps.test.ts` | The page offers only allowed actions |
| AC-NFR-1 | Pass | 4 browser checks | Narrow screens |
| AC-NFR-2 | Pass | 2 browser checks | Keyboard and labels |
| AC-NFR-3 | Pass | 62 unit tests in `tests/domain/swaps.test.ts` | The swap rules are fully tested |
| AC-NFR-4 | Pass | 5 unit tests in `tests/server/seed.test.ts`; 1 browser check | Fresh setup |

## Behavior in the code that no spec asks for

| Behavior | Where | Why it is there |
|----------|-------|-----------------|
| A "Skip to content" link | `src/app/layout.tsx` | Keyboard users skip the header (supports REQ-NFR-4). |
| Failed logins take about the same time whether or not the email exists | `src/server/auth.ts` | Supports REQ-AUTH-5: the timing does not reveal which part was wrong. |
| `%` and `_` in search text are matched literally | `src/server/plants.ts` | Without it, `%` would match every plant. |
| Unknown filter values in the address are ignored | `src/domain/browse.ts` | A hand-edited link cannot break the page. |
| An "Edit or remove" link on the owner's own plant page | `src/app/plants/[id]/page.tsx` | Convenience; the shelf has the same link (F2). |
| An error page with a "Try again" button | `src/app/error.tsx` | Required by `04-architecture.md` ("Mutations and errors"); the button is extra. |
| The plant's name as the browser tab title | `src/app/plants/[id]/page.tsx` | Polish from the code review. |

None of these adds a feature, field, page or dependency.

## The three most important gaps

1. **The code review was not independent.** The `requesting-code-review` skill asks for a separate reviewer; the review in `docs/REVIEW.md` was done by the same agent that wrote the code. Run Cursor's `/review` (or a separate agent) before presenting.
2. **The app was built and tested on Linux, not on Windows.** It uses only cross-platform pieces (Node's built-in SQLite, npm packages with Windows builds, no shell commands in `package.json`), but it has not yet been run on Lakshna's Windows computer, and her Node.js version is unknown (22.13 or newer is needed).
3. **Logging out does not revoke the session token, and logins are not rate-limited.** Both are fine for a local demo and both are recorded in `docs/REVIEW.md`; neither is acceptable for a deployed app.

## What could not be checked

- Browsers other than headless Chromium, and real phones. The 360 px checks resize Chromium; they are not a device test.
- Screen readers. Labels, focus and keyboard use were checked; spoken output was not.
