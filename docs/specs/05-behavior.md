# 05 — Expected behavior

Status: Approved
Last updated: 2026-10-06
Depends on: `01-overview.md`, `02-requirements.md`

## Purpose

Defines exactly how the app behaves: the swap lifecycle and the acceptance scenarios that prove each requirement. Tests are written from this file.

## Example data

The seed command creates this data. Scenarios refer to it by name.

| Member | Email | City | Plants (common name, botanical name, plant type, form) |
|--------|-------|------|--------------------------------------------------------|
| Alice | alice@example.com | Charlotte | *Golden pothos*, Epipremnum aureum, Houseplant, Cutting · *Basil*, Ocimum basilicum, Herb, Seedling · *Aloe vera*, Aloe vera, Succulent or cactus, Potted plant |
| Ben | ben@example.com | Raleigh | *Monstera*, Monstera deliciosa, Houseplant, Cutting · *Cherry tomato*, Solanum lycopersicum, Vegetable, Seeds · *Snake plant*, Dracaena trifasciata, Houseplant, Potted plant |
| Chidi | chidi@example.com | Durham | *Spider plant*, Chlorophytum comosum, Houseplant, Potted plant · *Lavender*, Lavandula angustifolia, Herb, Seedling · *Sunflower*, Helianthus annuus, Flower, Seeds |

All three members use the password `grow-together-1`. All seeded plants are `AVAILABLE`. The seed lists them in the order shown, so the newest plant is *Sunflower* and the oldest is *Golden pothos*. Each scenario starts from this data unless it says otherwise.

## Swap lifecycle

A swap is created as `PENDING` by a valid request (REQ-SWAP-1 to REQ-SWAP-3). After that, only these transitions exist:

| Row | From | Action | Allowed actor | To | Effect on the two plants |
|-----|------|--------|---------------|----|--------------------------|
| T1 | `PENDING` | accept | Owner | `ACCEPTED` | Both become `RESERVED`. Every other `PENDING` swap involving either plant becomes `CANCELLED`. |
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

Plant statuses change only through this table, through listing (a new plant is `AVAILABLE`) and through removal (`AVAILABLE` to `REMOVED`). `SWAPPED` and `REMOVED` never change.

## Acceptance scenarios

### Accounts

**AC-AUTH-1 — Register** (REQ-AUTH-1, REQ-AUTH-4, REQ-AUTH-7)
- Given no account uses `dana@example.com`
- When a visitor registers as "Dana" with that email, the city " Asheville " and the password `correct-horse-1`
- Then the account exists with the city stored as "Asheville", Dana is signed in, and she is on `/shelf`, which is empty.

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
- Given a visitor opens `/plants/new`
- When they are sent to the login page and log in as Alice
- Then they arrive at `/plants/new`.
- And when the login page is opened with the return address `https://evil.example` or `//evil.example`, logging in leads to `/`.

**AC-AUTH-6 — Log out** (REQ-AUTH-4)
- Given Alice is signed in
- When she logs out and opens `/shelf`
- Then she is sent to the login page.

**AC-AUTH-7 — Registration errors keep the input** (REQ-AUTH-1, REQ-NFR-1)
- When a visitor registers as "Dana" with `dana@example.com`, no city and the password `short`
- Then the city and password fields show errors, the name and email fields still hold what was typed, and no account is created.

### Plants

**AC-PLANT-1 — List a plant** (REQ-PLANT-1, REQ-PLANT-4, REQ-PLANT-8, REQ-PLANT-9, REQ-AUTH-7)
- Given Alice is signed in
- When she lists *Peace lily*, botanical name Spathiphyllum wallisii, Houseplant, Potted plant, with no description, and confirms it shows no visible pests or disease
- Then *Peace lily* is first on her shelf with status `AVAILABLE`, and first in the browse list with the city "Charlotte".

**AC-PLANT-2 — Invalid listings are refused** (REQ-PLANT-1, REQ-PLANT-2, REQ-PLANT-3, REQ-PLANT-9, REQ-NFR-1)
- When Alice submits a listing with an empty common name, or an 81-character common name, or the plant type `CARNIVOROUS`, or the form `GRAFT`, or without the health confirmation
- Then each submission is refused with an error on that field, and no plant is created.

**AC-PLANT-3 — Edit an available plant** (REQ-PLANT-5, REQ-PLANT-9)
- When Alice changes the form of *Basil* from Seedling to Potted plant and confirms its health
- Then the plant's page and the browse list show Potted plant.
- And when she submits the same edit without the health confirmation, it is refused with an error on that field and *Basil* is unchanged.

**AC-PLANT-4 — Only the owner can change a plant** (REQ-PLANT-7, REQ-NFR-2)
- Given Ben is signed in
- When Ben opens `/plants/[id]/edit` for *Golden pothos*, or submits an edit or a removal for *Golden pothos* directly
- Then each is refused with `FORBIDDEN` and *Golden pothos* is unchanged.

**AC-PLANT-5 — A reserved plant is locked** (REQ-PLANT-5, REQ-PLANT-6)
- Given an `ACCEPTED` swap involves *Golden pothos*
- When Alice submits an edit or a removal for *Golden pothos*
- Then each is refused with `CONFLICT` and *Golden pothos* is unchanged.

**AC-PLANT-6 — Remove a plant** (REQ-PLANT-6, REQ-PLANT-8, REQ-BROWSE-8)
- Given no swap involves *Aloe vera*
- When Alice removes it
- Then it is gone from her shelf and from the browse list, its page reports that it was not found, and its record remains with status `REMOVED`.

**AC-PLANT-7 — A plant with a pending swap cannot be removed** (REQ-PLANT-6)
- Given Alice has a `PENDING` request for *Monstera* offering *Golden pothos*
- When Alice removes *Golden pothos*, or Ben removes *Monstera*
- Then each is refused with `CONFLICT` and a message naming the pending swap as the reason.

### Browsing

**AC-BROWSE-1 — Visitors see available plants only** (REQ-BROWSE-1)
- Given Ben accepted Alice's request for *Monstera* offering *Golden pothos*, and Alice removed *Aloe vera*
- When a visitor opens `/`
- Then the other six plants are listed, newest first, each with its common name, botanical name, plant type, form and city, and *Monstera*, *Golden pothos* and *Aloe vera* are not.

**AC-BROWSE-2 — Search matches the common or the botanical name** (REQ-BROWSE-2)
- When a visitor searches `monstera`
- Then only *Monstera* is listed.
- When a visitor searches `PLANT`
- Then only *Snake plant* and *Spider plant* are listed.
- When a visitor searches `ocimum`
- Then only *Basil* is listed.

**AC-BROWSE-3 — Search and filters combine and live in the address** (REQ-BROWSE-3, REQ-BROWSE-4)
- When a visitor searches `plant` and picks the plant type Houseplant, the form Potted plant and the city Raleigh
- Then only *Snake plant* is listed.
- And reloading the page shows the same search text, filters and result.

**AC-BROWSE-4 — Nothing matches** (REQ-BROWSE-5)
- When a visitor searches `zzzz`
- Then the page says no plants match and offers a link that clears the search and filters.

**AC-BROWSE-5 — The plant's page hides the email** (REQ-BROWSE-6)
- When anyone opens the page for *Monstera*
- Then it shows "Monstera", "Monstera deliciosa", Houseplant, Cutting, the status, the date it was listed, "Ben" and "Raleigh", and the text `ben@example.com` appears nowhere in the response.

**AC-BROWSE-6 — Own plants cannot be requested** (REQ-BROWSE-7)
- Given Alice is signed in
- Then *Golden pothos* carries a "Your plant" badge in the browse list, and its page has no request form.

**AC-BROWSE-7 — Plants that are no longer available** (REQ-BROWSE-8)
- Given Ben accepted Alice's request for *Monstera* offering *Golden pothos*, and Alice removed *Aloe vera*
- When Chidi opens the page for *Monstera*
- Then it shows the status Reserved and no request form.
- When Chidi opens the page for *Aloe vera*
- Then the page reports that the plant was not found.

**AC-BROWSE-8 — Filter by city** (REQ-BROWSE-3, REQ-BROWSE-9)
- When a visitor opens the city filter
- Then it offers Charlotte, Durham and Raleigh, in that order.
- When the visitor picks Durham
- Then only *Spider plant*, *Lavender* and *Sunflower* are listed.
- Given Dana registered with the city "durham" and listed *Mint*, Herb, Cutting
- Then the city filter still offers Durham once, and picking it also lists *Mint*.

### Swaps

**AC-SWAP-1 — Request a swap** (REQ-SWAP-1, REQ-SWAP-11)
- Given Alice is signed in
- When she requests *Monstera* offering *Golden pothos* with the message "Happy to meet at the farmers market"
- Then a `PENDING` swap exists, it appears under Outgoing for Alice and under Incoming for Ben with both plant names and the message, and both plants are still `AVAILABLE`.

**AC-SWAP-2 — Invalid requests are refused** (REQ-SWAP-2)
- When Alice requests *Golden pothos* (her own plant), or requests *Monstera* offering *Cherry tomato* (Ben's plant)
- Then each is refused with `FORBIDDEN` and no swap is created.
- When Alice requests *Monstera* while *Monstera* is `RESERVED`, or requests *Monstera* offering *Golden pothos* while *Golden pothos* is `RESERVED`
- Then each is refused with `CONFLICT` and no swap is created.

**AC-SWAP-3 — One pending request per plant** (REQ-SWAP-3)
- Given Alice has a `PENDING` request for *Monstera* offering *Golden pothos*
- When she requests *Monstera* again offering *Basil*
- Then it is refused with `CONFLICT`. After she cancels the first request, the same request succeeds.

**AC-SWAP-4 — Nothing to offer** (REQ-SWAP-4)
- Given Dana is signed in and has no `AVAILABLE` plants
- When she opens the page for *Monstera*
- Then she sees an explanation and a link to `/plants/new` in place of the request form.

**AC-SWAP-5 — Decline** (REQ-SWAP-5)
- Given Alice has a `PENDING` request for *Monstera* offering *Golden pothos*
- When Ben declines it
- Then the swap is `DECLINED` and both plants are `AVAILABLE`.

**AC-SWAP-6 — Accept reserves both plants and cancels competing requests** (REQ-SWAP-6)
- Given Alice has a `PENDING` request for *Monstera* offering *Golden pothos*, Chidi has a `PENDING` request for *Monstera* offering *Sunflower*, and Alice has a `PENDING` request for *Lavender* offering *Golden pothos*
- When Ben accepts Alice's request for *Monstera*
- Then that swap is `ACCEPTED`, *Monstera* and *Golden pothos* are `RESERVED`, both other swaps are `CANCELLED`, *Sunflower* and *Lavender* are still `AVAILABLE`, and neither *Monstera* nor *Golden pothos* is in the browse list.

**AC-SWAP-7 — A stale accept changes nothing** (REQ-SWAP-6)
- Given the outcome of AC-SWAP-6
- When Ben submits accept for Chidi's cancelled request
- Then it is refused with `CONFLICT`, and no swap or plant changes.

**AC-SWAP-8 — Requester cancels a pending request** (REQ-SWAP-7)
- Given Alice has a `PENDING` request for *Monstera* offering *Golden pothos*
- When Alice cancels it
- Then the swap is `CANCELLED` and both plants are `AVAILABLE`.

**AC-SWAP-9 — Cancelling an accepted swap frees the plants** (REQ-SWAP-8)
- Given Ben accepted Alice's request for *Monstera* offering *Golden pothos*
- When either Alice or Ben cancels the swap
- Then the swap is `CANCELLED`, both plants are `AVAILABLE` and both are back in the browse list.

**AC-SWAP-10 — Complete** (REQ-SWAP-9)
- Given Ben accepted Alice's request for *Monstera* offering *Golden pothos*
- When either Alice or Ben marks it completed
- Then the swap is `COMPLETED`, both plants are `SWAPPED`, both show as swapped on their owners' shelves, and neither is in the browse list.

**AC-SWAP-11 — Finished swaps never change** (REQ-SWAP-10)
- Given one swap in each of `DECLINED`, `CANCELLED` and `COMPLETED`
- When a participant submits accept, decline, cancel or complete for any of them
- Then every attempt is refused with `CONFLICT` and nothing changes.

**AC-SWAP-12 — Email appears only after acceptance** (REQ-SWAP-12)
- Given Alice has a `PENDING` request for *Monstera* offering *Golden pothos*
- Then neither Alice's nor Ben's swaps page contains the other's email.
- When Ben accepts
- Then Alice's page shows `ben@example.com` and Ben's shows `alice@example.com`, and they remain after the swap is completed.
- And for a `DECLINED` or `CANCELLED` swap, neither page contains the other's email.

**AC-SWAP-13 — Wrong person or wrong role** (REQ-SWAP-13, REQ-NFR-2)
- Given Alice has a `PENDING` request for *Monstera* offering *Golden pothos*
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
- When a member registers, lists a plant, requests a swap and accepts a swap using only the keyboard
- Then every step can be completed, focus is always visible, and every field has a visible label.

**AC-NFR-3 — The swap rules are fully tested** (REQ-NFR-5)
- Then the swap rules module imports no database, network or framework code, and its tests include at least one named case for each of T1 to T7 covering every status, action and actor role combination.

**AC-NFR-4 — Fresh setup** (REQ-NFR-6, REQ-NFR-7)
- Given a fresh clone with `.env` copied from `.env.example`
- When the README's commands are run in order
- Then the app starts, the browse list shows the nine seeded plants, Alice can log in with the seeded password, and the repository contains no `.env` file and no secret.

## Out of scope

Behavior under heavy load, and anything listed as out of scope in `01-overview.md`.

## Changes from v0

- Example data, scenarios and names moved from books to plants. `AC-BOOK-1` to `AC-BOOK-7` became `AC-PLANT-1` to `AC-PLANT-7` (one-time rename before approval).
- New: AC-BROWSE-8 (city filter). AC-PLANT-2 and AC-PLANT-3 also cover the health confirmation. AC-AUTH-7 also covers the required city. AC-AUTH-5 also refuses `//evil.example`.
