# 02 — Requirements

Status: Draft
Last updated: 2026-10-06
Depends on: `01-overview.md`

## Purpose

The complete list of what the app must do. Each requirement is one testable behavior with a stable ID. Scenarios that prove them are in `05-behavior.md`.

## Accounts

| ID | Requirement |
|----|-------------|
| REQ-AUTH-1 | A visitor can register with a display name (2–40 characters), an email address and a password (8–72 characters). |
| REQ-AUTH-2 | Email addresses are unique. They are trimmed and compared without regard to letter case. |
| REQ-AUTH-3 | Passwords are stored only as salted hashes. A password or hash never appears in a response, a page or a log. |
| REQ-AUTH-4 | A member can log in with email and password and can log out. A session lasts 7 days and survives a page reload. |
| REQ-AUTH-5 | A failed login shows one message that is the same whether the email is unknown or the password is wrong. |
| REQ-AUTH-6 | A visitor who opens a members-only page is sent to the login page and returned to that page after logging in. A return address that is not a path inside the app is ignored. |
| REQ-AUTH-7 | A member can set an optional city (up to 60 characters) at registration. |

## Books

| ID | Requirement |
|----|-------------|
| REQ-BOOK-1 | A member can list a book with a title (1–200 characters), an author (1–120 characters), a genre, a condition and an optional description (up to 1000 characters). |
| REQ-BOOK-2 | Genre is one of: Fiction, Non-fiction, Mystery, Sci-Fi & Fantasy, Romance, Biography, Children, Textbook, Other. |
| REQ-BOOK-3 | Condition is one of: Like new, Good, Fair, Worn. |
| REQ-BOOK-4 | A newly listed book has status `AVAILABLE` and belongs to the member who listed it. |
| REQ-BOOK-5 | The owner can edit a book while it is `AVAILABLE`. |
| REQ-BOOK-6 | The owner can remove a book while it is `AVAILABLE` and no `PENDING` swap involves it. Removal sets the status to `REMOVED` and keeps the record. |
| REQ-BOOK-7 | Only the owner can edit or remove a book. The server refuses anyone else. |
| REQ-BOOK-8 | The shelf page shows the member's books that are not `REMOVED`, each with its status, newest first. |

## Browsing

| ID | Requirement |
|----|-------------|
| REQ-BROWSE-1 | Anyone can see the list of `AVAILABLE` books, newest first. Each entry shows title, author, genre and condition. |
| REQ-BROWSE-2 | The list can be searched by text. A book matches when the text is contained in its title or its author, ignoring case for the letters A–Z. |
| REQ-BROWSE-3 | The list can be filtered by genre and by condition. Search and filters combine: a book must satisfy all of them. |
| REQ-BROWSE-4 | Search text and filters are kept in the page address, so a result page can be reloaded or shared. |
| REQ-BROWSE-5 | When nothing matches, the page says so and offers a way to clear the search and filters. |
| REQ-BROWSE-6 | A book's page shows title, author, genre, condition, description, status, and the owner's display name and city. It never shows the owner's email. |
| REQ-BROWSE-7 | A member's own books are marked as theirs in the list and on the book's page, and offer no way to request them. |
| REQ-BROWSE-8 | The page of a `RESERVED` or `SWAPPED` book is shown with its status and no way to request it. The page of a `REMOVED` book reports that the book was not found. |

## Swaps

| ID | Requirement |
|----|-------------|
| REQ-SWAP-1 | A member can request an `AVAILABLE` book they do not own by offering exactly one of their own `AVAILABLE` books, with an optional message (up to 500 characters). The swap starts as `PENDING`. |
| REQ-SWAP-2 | The server refuses a request when the requester owns the requested book, does not own the offered book, or either book is not `AVAILABLE`. |
| REQ-SWAP-3 | A member can have at most one `PENDING` swap for the same requested book. |
| REQ-SWAP-4 | A member with no `AVAILABLE` books sees an explanation and a link to list a book, instead of the request form. |
| REQ-SWAP-5 | The owner can accept or decline a `PENDING` swap. Declining sets it to `DECLINED` and changes no book. |
| REQ-SWAP-6 | Accepting sets the swap to `ACCEPTED`, sets both books to `RESERVED`, and sets every other `PENDING` swap that involves either book to `CANCELLED`. All of these happen together or not at all. |
| REQ-SWAP-7 | The requester can cancel a `PENDING` swap. It becomes `CANCELLED` and no book changes. |
| REQ-SWAP-8 | Either participant can cancel an `ACCEPTED` swap. It becomes `CANCELLED` and both books return to `AVAILABLE`. |
| REQ-SWAP-9 | Either participant can mark an `ACCEPTED` swap completed. It becomes `COMPLETED` and both books become `SWAPPED`. |
| REQ-SWAP-10 | A swap in a terminal status can never change again. |
| REQ-SWAP-11 | The swaps page lists the member's incoming and outgoing swaps separately, newest first. Each shows both books, the other participant's display name, the message, the status, and only the actions that member may take. |
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
| REQ-NFR-6 | A new developer can run the app with the commands in the README. A seed command creates three demo members and at least nine books. |
| REQ-NFR-7 | No secret is committed. `.env.example` lists every environment variable the app needs. |

## Out of scope

See `01-overview.md`.

## Open questions

See `docs/PLAN.md` section 6. Answers settled during planning are written into the requirements above.
