# 05 — Expected behavior

Status: Draft
Last updated: 2026-10-06
Depends on: `01-overview.md`, `02-requirements.md`

## Purpose

Defines exactly how the app behaves: the swap lifecycle and the acceptance scenarios that prove each requirement. Tests are written from this file.

## Example data

The seed command creates this data. Scenarios refer to it by name.

| Member | Email | City | Books (title, author, genre, condition) |
|--------|-------|------|------------------------------------------|
| Alice | alice@example.com | Charlotte | *Emma*, Jane Austen, Fiction, Good · *Sapiens*, Yuval Noah Harari, Non-fiction, Like new · *The Hobbit*, J. R. R. Tolkien, Sci-Fi & Fantasy, Fair |
| Ben | ben@example.com | Raleigh | *Dune*, Frank Herbert, Sci-Fi & Fantasy, Like new · *Educated*, Tara Westover, Biography, Good · *Clean Code*, Robert C. Martin, Textbook, Worn |
| Chidi | chidi@example.com | Durham | *Gone Girl*, Gillian Flynn, Mystery, Good · *Pride and Prejudice*, Jane Austen, Romance, Fair · *Matilda*, Roald Dahl, Children, Good |

All seeded books are `AVAILABLE`. Each scenario starts from this data unless it says otherwise.

## Swap lifecycle

A swap is created as `PENDING` by a valid request (REQ-SWAP-1 to REQ-SWAP-3). After that, only these transitions exist:

| Row | From | Action | Allowed actor | To | Effect on the two books |
|-----|------|--------|---------------|----|-------------------------|
| T1 | `PENDING` | accept | Owner | `ACCEPTED` | Both become `RESERVED`. Every other `PENDING` swap involving either book becomes `CANCELLED`. |
| T2 | `PENDING` | decline | Owner | `DECLINED` | None. |
| T3 | `PENDING` | cancel | Requester | `CANCELLED` | None. |
| T4 | `ACCEPTED` | cancel | Owner or requester | `CANCELLED` | Both become `AVAILABLE`. |
| T5 | `ACCEPTED` | complete | Owner or requester | `COMPLETED` | Both become `SWAPPED`. |
| T6 | `DECLINED`, `CANCELLED`, `COMPLETED` | any | Anyone | Refused | None. |
| T7 | Any | any action not listed in T1–T5 for that status and actor | Anyone | Refused | None. |

A refused action changes nothing and tells the user why. The reason is decided in this order:

1. The actor is not a participant: `FORBIDDEN`.
2. No one may take this action while the swap has its current status: `CONFLICT`.
3. The other participant may take this action, but this one may not: `FORBIDDEN`.

Book statuses change only through this table and through listing (new book is `AVAILABLE`) and removal (`AVAILABLE` to `REMOVED`). `SWAPPED` and `REMOVED` never change.

## Acceptance scenarios

### Accounts

**AC-AUTH-1 — Register** (REQ-AUTH-1, REQ-AUTH-4, REQ-AUTH-7)
- Given no account uses `dana@example.com`
- When a visitor registers as "Dana" with that email, city "Asheville" and password `correct-horse-1`
- Then the account exists, Dana is signed in, and she is on `/shelf`, which is empty.

**AC-AUTH-2 — Duplicate email, ignoring case and spaces** (REQ-AUTH-2)
- Given Alice's account exists
- When a visitor registers with the email ` Alice@Example.com `
- Then registration is refused with an error on the email field, and no account is created.

**AC-AUTH-3 — Password is hashed** (REQ-AUTH-3)
- Given Dana registered with password `correct-horse-1`
- Then the stored value differs from `correct-horse-1` and verifies against it, and no page or action result contains either.

**AC-AUTH-4 — Login failure does not reveal which part was wrong** (REQ-AUTH-5)
- When a visitor logs in as `nobody@example.com` with any password, and then as `alice@example.com` with a wrong password
- Then both attempts show "Email or password is incorrect." and no session is created.

**AC-AUTH-5 — Return to the page after login** (REQ-AUTH-6)
- Given a visitor opens `/books/new`
- When they are sent to the login page and log in as Alice
- Then they arrive at `/books/new`.
- And when the login page is opened with the return address `https://evil.example`, logging in leads to `/`.

**AC-AUTH-6 — Log out** (REQ-AUTH-4)
- Given Alice is signed in
- When she logs out and opens `/shelf`
- Then she is sent to the login page.

**AC-AUTH-7 — Registration errors keep the input** (REQ-AUTH-1, REQ-NFR-1)
- When a visitor registers as "Dana" with `dana@example.com` and the password `short`
- Then the password field shows an error, the name and email fields still hold what was typed, and no account is created.

### Books

**AC-BOOK-1 — List a book** (REQ-BOOK-1, REQ-BOOK-4, REQ-BOOK-8)
- Given Alice is signed in
- When she lists *Beloved* by Toni Morrison, Fiction, Good, with no description
- Then *Beloved* is first on her shelf with status `AVAILABLE` and first in the browse list.

**AC-BOOK-2 — Invalid listings are refused** (REQ-BOOK-1, REQ-BOOK-2, REQ-BOOK-3, REQ-NFR-1)
- When Alice submits a listing with an empty title, or a 201-character title, or the genre `POETRY`, or the condition `MINT`
- Then each submission is refused with an error on that field, and no book is created.

**AC-BOOK-3 — Edit an available book** (REQ-BOOK-5)
- When Alice changes the condition of *Emma* from Good to Fair
- Then the book's page and the browse list show Fair.

**AC-BOOK-4 — Only the owner can change a book** (REQ-BOOK-7, REQ-NFR-2)
- Given Ben is signed in
- When Ben opens `/books/[id]/edit` for *Emma*, or submits an edit or a removal for *Emma* directly
- Then each is refused with `FORBIDDEN` and *Emma* is unchanged.

**AC-BOOK-5 — A reserved book is locked** (REQ-BOOK-5, REQ-BOOK-6)
- Given an `ACCEPTED` swap involves *Emma*
- When Alice submits an edit or a removal for *Emma*
- Then each is refused with `CONFLICT` and *Emma* is unchanged.

**AC-BOOK-6 — Remove a book** (REQ-BOOK-6, REQ-BOOK-8, REQ-BROWSE-8)
- Given no swap involves *The Hobbit*
- When Alice removes it
- Then it is gone from her shelf and from the browse list, its page reports that it was not found, and its record remains with status `REMOVED`.

**AC-BOOK-7 — A book with a pending swap cannot be removed** (REQ-BOOK-6)
- Given Alice has a `PENDING` request for *Dune* offering *Emma*
- When Alice removes *Emma*, or Ben removes *Dune*
- Then each is refused with `CONFLICT` and a message naming the pending swap as the reason.

### Browsing

**AC-BROWSE-1 — Visitors see available books only** (REQ-BROWSE-1)
- Given Ben accepted Alice's request for *Dune* offering *Emma*, and Alice removed *The Hobbit*
- When a visitor opens `/`
- Then the other six books are listed, newest first, and *Dune*, *Emma* and *The Hobbit* are not.

**AC-BROWSE-2 — Search matches title or author** (REQ-BROWSE-2)
- When a visitor searches `dune`
- Then only *Dune* is listed.
- When a visitor searches `AUSTEN`
- Then only *Emma* and *Pride and Prejudice* are listed.

**AC-BROWSE-3 — Search and filters combine and live in the address** (REQ-BROWSE-3, REQ-BROWSE-4)
- When a visitor searches `austen` and picks the genre Romance
- Then only *Pride and Prejudice* is listed.
- And reloading the page shows the same search text, filter and result.

**AC-BROWSE-4 — Nothing matches** (REQ-BROWSE-5)
- When a visitor searches `zzzz`
- Then the page says no books match and offers a link that clears the search and filters.

**AC-BROWSE-5 — The book's page hides the email** (REQ-BROWSE-6)
- When anyone opens the page for *Dune*
- Then it shows the title, author, genre, condition, status, "Ben" and "Raleigh", and the text `ben@example.com` appears nowhere in the response.

**AC-BROWSE-6 — Own books cannot be requested** (REQ-BROWSE-7)
- Given Alice is signed in
- Then *Emma* carries a "Your book" badge in the browse list, and its page has no request form.

**AC-BROWSE-7 — Books that are no longer available** (REQ-BROWSE-8)
- Given Ben accepted Alice's request for *Dune* offering *Emma*, and Alice removed *The Hobbit*
- When Chidi opens the page for *Dune*
- Then it shows the status Reserved and no request form.
- When Chidi opens the page for *The Hobbit*
- Then the page reports that the book was not found.

### Swaps

**AC-SWAP-1 — Request a swap** (REQ-SWAP-1, REQ-SWAP-11)
- Given Alice is signed in
- When she requests *Dune* offering *Emma* with the message "Happy to meet on campus"
- Then a `PENDING` swap exists, it appears under Outgoing for Alice and under Incoming for Ben with both titles and the message, and both books are still `AVAILABLE`.

**AC-SWAP-2 — Invalid requests are refused** (REQ-SWAP-2)
- When Alice requests *Emma* (her own book), or requests *Dune* offering *Educated* (Ben's book)
- Then each is refused with `FORBIDDEN` and no swap is created.
- When Alice requests *Dune* while *Dune* is `RESERVED`, or requests *Dune* offering *Emma* while *Emma* is `RESERVED`
- Then each is refused with `CONFLICT` and no swap is created.

**AC-SWAP-3 — One pending request per book** (REQ-SWAP-3)
- Given Alice has a `PENDING` request for *Dune* offering *Emma*
- When she requests *Dune* again offering *Sapiens*
- Then it is refused with `CONFLICT`. After she cancels the first request, the same request succeeds.

**AC-SWAP-4 — Nothing to offer** (REQ-SWAP-4)
- Given Dana is signed in and has no `AVAILABLE` books
- When she opens the page for *Dune*
- Then she sees an explanation and a link to `/books/new` in place of the request form.

**AC-SWAP-5 — Decline** (REQ-SWAP-5)
- Given Alice has a `PENDING` request for *Dune* offering *Emma*
- When Ben declines it
- Then the swap is `DECLINED` and both books are `AVAILABLE`.

**AC-SWAP-6 — Accept reserves both books and cancels competing requests** (REQ-SWAP-6)
- Given Alice has a `PENDING` request for *Dune* offering *Emma*, Chidi has a `PENDING` request for *Dune* offering *Matilda*, and Alice has a `PENDING` request for *Gone Girl* offering *Emma*
- When Ben accepts Alice's request for *Dune*
- Then that swap is `ACCEPTED`, *Dune* and *Emma* are `RESERVED`, both other swaps are `CANCELLED`, *Matilda* and *Gone Girl* are still `AVAILABLE`, and neither *Dune* nor *Emma* is in the browse list.

**AC-SWAP-7 — A stale accept changes nothing** (REQ-SWAP-6)
- Given the outcome of AC-SWAP-6
- When Ben submits accept for Chidi's cancelled request
- Then it is refused with `CONFLICT`, and no swap or book changes.

**AC-SWAP-8 — Requester cancels a pending request** (REQ-SWAP-7)
- Given Alice has a `PENDING` request for *Dune* offering *Emma*
- When Alice cancels it
- Then the swap is `CANCELLED` and both books are `AVAILABLE`.

**AC-SWAP-9 — Cancelling an accepted swap frees the books** (REQ-SWAP-8)
- Given Ben accepted Alice's request for *Dune* offering *Emma*
- When either Alice or Ben cancels the swap
- Then the swap is `CANCELLED`, both books are `AVAILABLE` and both are back in the browse list.

**AC-SWAP-10 — Complete** (REQ-SWAP-9)
- Given Ben accepted Alice's request for *Dune* offering *Emma*
- When either Alice or Ben marks it completed
- Then the swap is `COMPLETED`, both books are `SWAPPED`, both show as swapped on their owners' shelves, and neither is in the browse list.

**AC-SWAP-11 — Finished swaps never change** (REQ-SWAP-10)
- Given one swap in each of `DECLINED`, `CANCELLED` and `COMPLETED`
- When a participant submits accept, decline, cancel or complete for any of them
- Then every attempt is refused with `CONFLICT` and nothing changes.

**AC-SWAP-12 — Email appears only after acceptance** (REQ-SWAP-12)
- Given Alice has a `PENDING` request for *Dune* offering *Emma*
- Then neither Alice's nor Ben's swaps page contains the other's email.
- When Ben accepts
- Then Alice's page shows `ben@example.com` and Ben's shows `alice@example.com`, and they remain after the swap is completed.
- And for a `DECLINED` or `CANCELLED` swap, neither page contains the other's email.

**AC-SWAP-13 — Wrong person or wrong role** (REQ-SWAP-13, REQ-NFR-2)
- Given Alice has a `PENDING` request for *Dune* offering *Emma*
- When Chidi submits accept, or Alice submits accept, or Ben submits cancel
- Then each is refused with `FORBIDDEN`, the swap stays `PENDING`, and the swap never appears on Chidi's swaps page.

**AC-SWAP-14 — The page offers only allowed actions** (REQ-SWAP-11)
- Given swaps in every status
- Then each participant sees exactly the actions in the table in `03-features.md` section F4, and no others.

### Quality

**AC-NFR-1 — Narrow screens** (REQ-NFR-3)
- When each page in `03-features.md` is opened at 360 px wide
- Then nothing is cut off and the page does not scroll sideways.

**AC-NFR-2 — Keyboard and labels** (REQ-NFR-4)
- When a member registers, lists a book, requests a swap and accepts a swap using only the keyboard
- Then every step can be completed, focus is always visible, and every field has a visible label.

**AC-NFR-3 — The swap rules are fully tested** (REQ-NFR-5)
- Then the swap rules module imports no database, network or framework code, and its tests include at least one named case for each of T1 to T7 covering every status, action and actor role combination.

**AC-NFR-4 — Fresh setup** (REQ-NFR-6, REQ-NFR-7)
- Given a fresh clone with `.env` copied from `.env.example`
- When the README's commands are run in order
- Then the app starts, the browse list shows the nine seeded books, Alice can log in with the seeded password, and the repository contains no `.env` file and no secret.

## Out of scope

Behavior under heavy load, and anything listed as out of scope in `01-overview.md`.
