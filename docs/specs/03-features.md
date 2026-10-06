# 03 — Features

Status: Draft
Last updated: 2026-10-06
Depends on: `01-overview.md`, `02-requirements.md`

## Purpose

Describes the app as the user meets it: the features, the screens, and what is on each screen. It adds no rules. Rules live in `02-requirements.md` and `05-behavior.md`.

## Screens

| Route | Who | Purpose |
|-------|-----|---------|
| `/` | Anyone | Browse, search and filter available books. |
| `/books/[id]` | Anyone | One book. Members who do not own it get the request form. |
| `/books/new` | Member | List a book. |
| `/books/[id]/edit` | Owner | Edit or remove a book. |
| `/shelf` | Member | The member's own books. |
| `/swaps` | Member | Incoming and outgoing swaps with their actions. |
| `/register` | Visitor | Create an account. |
| `/login` | Visitor | Log in. |

Every page has the same header. Signed out, it shows the app name (a link to `/`), Log in and Register. Signed in, it shows the app name, Shelf, Swaps, List a book, the member's display name and Log out.

## F1 — Accounts

As a visitor, I want an account so that I can list books and swap.

- Register form: display name, email, city (optional), password.
- Login form: email, password.
- After registering, the member lands on `/shelf`. After logging in, the member lands on the page they came from, or on `/`.
- Covers REQ-AUTH-1 to REQ-AUTH-7.

## F2 — Shelf and listings

As a member, I want to list the books I am willing to give away so that others can request them.

- `/shelf` lists the member's books as cards with a status badge. `AVAILABLE` books have an Edit link. An empty shelf explains what a listing is and links to `/books/new`.
- The list-a-book form has title, author, genre (select), condition (select) and description (text area).
- The edit page shows the same form filled in, plus a Remove button that asks for confirmation.
- A book that cannot be edited or removed shows the reason instead of the control.
- Covers REQ-BOOK-1 to REQ-BOOK-8.

## F3 — Browse

As anyone, I want to find a book worth swapping for.

- `/` shows a search box, a genre select, a condition select and a grid of book cards.
- A card shows title, author, genre and condition, and links to the book's page. The member's own books carry a "Your book" badge.
- The book's page shows the full description and the owner's display name and city.
- Covers REQ-BROWSE-1 to REQ-BROWSE-8.

## F4 — Swaps

As a member, I want to offer one of my books for one I want, and to answer the offers I receive.

- On another member's available book, the request form lets the member pick one of their own available books and add a message.
- `/swaps` has two sections, Incoming and Outgoing. Each swap shows "their book for your book" in words, the other member's name, the message and a status badge.
- Actions shown per swap:

  | Status | Owner sees | Requester sees |
  |--------|------------|----------------|
  | `PENDING` | Accept, Decline | Cancel |
  | `ACCEPTED` | Mark completed, Cancel, the requester's email | Mark completed, Cancel, the owner's email |
  | `COMPLETED` | The requester's email | The owner's email |
  | `DECLINED`, `CANCELLED` | Nothing | Nothing |

- Accept, Decline, Cancel and Mark completed take effect immediately and the page shows the new status.
- Covers REQ-SWAP-1 to REQ-SWAP-13.

## Out of scope

See `01-overview.md`.
