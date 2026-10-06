# 02 — Requirements

Status: Approved
Last updated: 2026-10-06
Depends on: `01-overview.md`

## Purpose

The complete list of what the app must do. Each requirement is one testable behavior with a stable ID. Scenarios that prove them are in `05-behavior.md`.

## Accounts

| ID | Requirement |
|----|-------------|
| REQ-AUTH-1 | A visitor can register with a display name (2–40 characters), an email address, a city (1–60 characters) and a password (8–72 characters, and at most 72 bytes in UTF-8, because the password hash ignores anything after 72 bytes). |
| REQ-AUTH-2 | Email addresses are unique. They are trimmed and compared without regard to letter case. |
| REQ-AUTH-3 | Passwords are stored only as salted hashes. A password or hash never appears in a response, a page or a log. |
| REQ-AUTH-4 | A member can log in with email and password and can log out. A session lasts 7 days and survives a page reload. |
| REQ-AUTH-5 | A failed login shows one message that is the same whether the email is unknown or the password is wrong. |
| REQ-AUTH-6 | A visitor who opens a members-only page is sent to the login page and returned to that page after logging in. A return address that is not a path inside the app is ignored. |
| REQ-AUTH-7 | The city a member registers with is stored trimmed and is shown as the location of every plant they list. |

## Plants

| ID | Requirement |
|----|-------------|
| REQ-PLANT-1 | A member can list a plant with a common name (1–80 characters), an optional botanical name (up to 120 characters), a plant type, a form and an optional description (up to 1000 characters). |
| REQ-PLANT-2 | Plant type is one of: Houseplant, Succulent or cactus, Herb, Vegetable, Flower, Tree or shrub, Other. |
| REQ-PLANT-3 | Form is one of: Cutting, Seedling, Potted plant, Seeds. |
| REQ-PLANT-4 | A newly listed plant has status `AVAILABLE` and belongs to the member who listed it. |
| REQ-PLANT-5 | The owner can edit a plant while it is `AVAILABLE`. |
| REQ-PLANT-6 | The owner can remove a plant while it is `AVAILABLE` and no `PENDING` swap involves it. Removal sets the status to `REMOVED` and keeps the record. |
| REQ-PLANT-7 | Only the owner can edit or remove a plant. The server refuses anyone else. |
| REQ-PLANT-8 | The shelf page shows the member's plants that are not `REMOVED`, each with its status, newest first. |
| REQ-PLANT-9 | Listing or editing a plant requires the member to confirm that it shows no visible pests or disease. The server refuses a submission without the confirmation. |

## Browsing

| ID | Requirement |
|----|-------------|
| REQ-BROWSE-1 | Anyone can see the list of `AVAILABLE` plants, newest first. Each entry shows the common name, the botanical name if there is one, the plant type, the form and the owner's city. |
| REQ-BROWSE-2 | The list can be searched by text. A plant matches when the text is contained in its common name or its botanical name, ignoring case for the letters A–Z. |
| REQ-BROWSE-3 | The list can be filtered by plant type, by form and by city. Search and filters combine: a plant must satisfy all of them. |
| REQ-BROWSE-4 | Search text and filters are kept in the page address, so a result page can be reloaded or shared. |
| REQ-BROWSE-5 | When nothing matches, the page says so and offers a way to clear the search and filters. |
| REQ-BROWSE-6 | A plant's page shows the common name, botanical name, plant type, form, description, status, the date it was listed, and the owner's display name and city. It never shows the owner's email. |
| REQ-BROWSE-7 | A member's own plants are marked as theirs in the list and on the plant's page, and offer no way to request them. |
| REQ-BROWSE-8 | The page of a `RESERVED` or `SWAPPED` plant is shown with its status and no way to request it. The page of a `REMOVED` plant reports that the plant was not found. |
| REQ-BROWSE-9 | The city filter offers the cities of the members who have `AVAILABLE` plants, in alphabetical order, each once even when members spell it with different letter case. Matching a city ignores letter case. |

## Swaps

| ID | Requirement |
|----|-------------|
| REQ-SWAP-1 | A member can request an `AVAILABLE` plant they do not own by offering exactly one of their own `AVAILABLE` plants, with an optional message (up to 500 characters). The swap starts as `PENDING`. |
| REQ-SWAP-2 | The server refuses a request when the requester owns the requested plant, does not own the offered plant, or either plant is not `AVAILABLE`. |
| REQ-SWAP-3 | A member can have at most one `PENDING` swap for the same requested plant. |
| REQ-SWAP-4 | A member with no `AVAILABLE` plants sees an explanation and a link to list a plant, instead of the request form. |
| REQ-SWAP-5 | The owner can accept or decline a `PENDING` swap. Declining sets it to `DECLINED` and changes no plant. |
| REQ-SWAP-6 | Accepting sets the swap to `ACCEPTED`, sets both plants to `RESERVED`, and sets every other `PENDING` swap that involves either plant to `CANCELLED`. All of these happen together or not at all. |
| REQ-SWAP-7 | The requester can cancel a `PENDING` swap. It becomes `CANCELLED` and no plant changes. |
| REQ-SWAP-8 | Either participant can cancel an `ACCEPTED` swap. It becomes `CANCELLED` and both plants return to `AVAILABLE`. |
| REQ-SWAP-9 | Either participant can mark an `ACCEPTED` swap completed. It becomes `COMPLETED` and both plants become `SWAPPED`. |
| REQ-SWAP-10 | A swap in a terminal status can never change again. |
| REQ-SWAP-11 | The swaps page lists the member's incoming and outgoing swaps separately, newest first. Each shows both plants, the other participant's display name, the message, the status, and only the actions that member may take. |
| REQ-SWAP-12 | A participant sees the other participant's email only while the swap is `ACCEPTED` or `COMPLETED`. |
| REQ-SWAP-13 | Only the two participants can see or act on a swap. The server refuses anyone else. |

## Quality

| ID | Requirement |
|----|-------------|
| REQ-NFR-1 | Every form input is validated on the server. A rejected form keeps what the user typed and shows each error next to its field. |
| REQ-NFR-2 | Every action that changes data checks the session and the permission on the server, whatever the page shows or hides. |
| REQ-NFR-3 | Every page is usable at widths from 360 px up, with no horizontal scrolling. |
| REQ-NFR-4 | Every form control has a visible label, and every action can be reached and triggered with the keyboard. |
| REQ-NFR-5 | The swap rules in `05-behavior.md` are implemented in one module that performs no input or output, with a unit test for every row of the transition table. |
| REQ-NFR-6 | A new developer can run the app with the commands in the README. A seed command creates three demo members and nine plants. |
| REQ-NFR-7 | No secret is committed. `.env.example` lists every environment variable the app needs. |

## Out of scope

See `01-overview.md`.

## Open questions

None. The answers settled during planning (`docs/PLAN.md` section 6) are written into the requirements above.

## Changes from v0

- `REQ-BOOK-1` to `REQ-BOOK-8` became `REQ-PLANT-1` to `REQ-PLANT-8`. This is a one-time rename, allowed because the v0 specs were never approved and no code existed. From approval on, IDs are frozen.
- New: REQ-PLANT-9 (health confirmation), REQ-BROWSE-9 (city filter).
- Changed: REQ-AUTH-1 (city required), REQ-AUTH-7 (city stored trimmed and shown on plants; was "optional city"), REQ-BROWSE-1, -2, -3, -6 (plant fields; filters are plant type, form and city), REQ-NFR-6 (nine plants).

## Changes after approval

- 2026-10-06, milestone 6 code review: REQ-AUTH-1 also limits the password to 72 bytes. bcrypt ignores everything after 72 bytes, so a 40-character password of accented letters (80 bytes) matched a different password with the same first 72 bytes.
