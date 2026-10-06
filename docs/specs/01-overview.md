# 01 — Overview

Status: Draft
Last updated: 2026-10-06
Depends on: `docs/PLAN.md`

## Purpose

Describes what Easy Exchange is, who uses it, and where its edges are. Every other spec uses the terms defined here.

## Product

Easy Exchange is a web app where members swap books one-for-one. A member lists books they are willing to give away, finds a book they want, and offers one of their own in return. The owner accepts or declines. After an accepted swap the two members arrange the handoff themselves by email.

No money changes hands and the app does not ship anything.

## Users

| Role | Description |
|------|-------------|
| Visitor | Not signed in. Can browse and search available books and open a book's page. |
| Member | Signed in. Can do everything a visitor can, plus list books and take part in swaps. |

In a swap, the member who sends the request is the **requester**. The member who owns the requested book is the **owner**. Both are **participants**.

## Glossary

| Term | Meaning |
|------|---------|
| Book | One physical copy that a member has listed. Two copies of the same title are two books. |
| Shelf | All books a member has listed, except removed ones. |
| Requested book | The book the requester wants. It belongs to the owner. |
| Offered book | The book the requester gives in return. It belongs to the requester. |
| Swap | A proposal to exchange one requested book for one offered book, and its lifecycle. |
| Book status | `AVAILABLE`, `RESERVED`, `SWAPPED` or `REMOVED`. |
| Swap status | `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED` or `COMPLETED`. |
| Terminal status | A swap status that can never change: `DECLINED`, `CANCELLED`, `COMPLETED`. |

## Scope

In scope: accounts, book listings, browsing with search and filters, and the swap lifecycle. The detail is in `02-requirements.md`.

## Out of scope

The first version does not include:

- Money, prices or payments.
- Chat or in-app messaging.
- Image upload or cover images.
- Ratings, reviews or reputation.
- Swaps of more than one book per side.
- Email notifications, email verification or password reset.
- Admin tools or moderation.
- Deployment to a public host.

A request to add any of these is a change to the plan, not an implementation detail.
