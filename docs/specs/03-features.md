# 03 — Features

Status: Approved
Last updated: 2026-10-06
Depends on: `01-overview.md`, `02-requirements.md`

## Purpose

Describes the app as the user meets it: the features, the screens, and what is on each screen. It adds no rules. Rules live in `02-requirements.md` and `05-behavior.md`.

## Screens

| Route | Who | Purpose |
|-------|-----|---------|
| `/` | Anyone | Browse, search and filter available plants. |
| `/plants/[id]` | Anyone | One plant. Members who do not own it get the request form. |
| `/plants/new` | Member | List a plant. |
| `/plants/[id]/edit` | Owner | Edit or remove a plant. |
| `/shelf` | Member | The member's own plants. |
| `/swaps` | Member | Incoming and outgoing swaps with their actions. |
| `/register` | Visitor | Create an account. |
| `/login` | Visitor | Log in. |

Every page has the same header. Signed out, it shows the app name (a link to `/`), Log in and Register. Signed in, it shows the app name, Shelf, Swaps, List a plant, the member's display name and Log out.

## F1 — Accounts

As a visitor, I want an account so that I can list plants and swap.

- Register form: display name, email, city, password.
- Login form: email, password.
- After registering, the member lands on `/shelf`. After logging in, the member lands on the page they came from, or on `/`.
- Covers REQ-AUTH-1 to REQ-AUTH-7.

## F2 — Shelf and listings

As a member, I want to list the plants I am willing to give away so that others can request them.

- `/shelf` lists the member's plants as cards with a status badge. `AVAILABLE` plants have an Edit link. An empty shelf explains what a listing is and links to `/plants/new`.
- The list-a-plant form has common name, botanical name, plant type (select), form (select), description (text area), and a required checkbox "No visible pests or disease".
- The edit page shows the same form filled in, with the checkbox unticked so the owner confirms the plant's health again, plus a Remove button that asks for confirmation.
- After listing or editing, the member lands on the plant's page. After removing, the member lands on `/shelf`.
- A plant that cannot be edited or removed shows the reason instead of the control. A member who opens the edit page of someone else's plant sees that only the owner can edit it.
- Covers REQ-PLANT-1 to REQ-PLANT-9.

## F3 — Browse

As anyone, I want to find a plant worth swapping for, close to where I live.

- `/` shows a search box, a plant type select, a form select, a city select and a grid of plant cards.
- A card shows the common name, the botanical name in italics if there is one, the plant type, the form and the city, and links to the plant's page. The member's own plants carry a "Your plant" badge.
- The plant's page shows the full description, the date it was listed, and the owner's display name and city.
- Covers REQ-BROWSE-1 to REQ-BROWSE-9.

## F4 — Swaps

As a member, I want to offer one of my plants for one I want, and to answer the offers I receive.

- On another member's available plant, the request form lets the member pick one of their own available plants and add a message. After a successful request, the member lands on `/swaps`.
- A visitor on an available plant's page sees a link to log in in place of the request form. Logging in returns them to the plant's page.
- `/swaps` has two sections, Incoming and Outgoing. Each swap shows "their plant for your plant" in words, the other member's name, the message and a status badge.
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
