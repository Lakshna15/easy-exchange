# 01 — Overview

Status: Approved
Last updated: 2026-10-06
Depends on: `docs/PLAN.md` (v1)

## Purpose

Describes what Easy Exchange is, who uses it, and where its edges are. Every other spec uses the terms defined here.

## Product

Easy Exchange is a web app where members swap plants one-for-one. A member lists plants they are willing to give away (a cutting, a seedling, a potted plant or a packet of seeds), finds a plant they want, and offers one of their own in return. The owner accepts or declines. After an accepted swap the two members arrange the handoff in person, by email.

No money changes hands and the app does not ship anything.

## Users

| Role | Description |
|------|-------------|
| Visitor | Not signed in. Can browse, search and filter available plants and open a plant's page. |
| Member | Signed in. Can do everything a visitor can, plus list plants and take part in swaps. |

In a swap, the member who sends the request is the **requester**. The member who owns the requested plant is the **owner**. Both are **participants**.

## Glossary

| Term | Meaning |
|------|---------|
| Plant | One listing: a single cutting, seedling, potted plant or packet of seeds that a member offers. Two cuttings of the same plant are two plants. |
| Common name | The everyday name, for example "Golden pothos". Required. |
| Botanical name | The scientific name, for example "Epipremnum aureum". Optional. |
| Plant type | Houseplant, Succulent or cactus, Herb, Vegetable, Flower, Tree or shrub, or Other. |
| Form | What is handed over: Cutting, Seedling, Potted plant or Seeds. |
| City | Where a member lives. Every plant is shown with its owner's city. |
| Health confirmation | The owner's statement, given on every listing and edit, that the plant shows no visible pests or disease. |
| Shelf | All plants a member has listed, except removed ones. |
| Requested plant | The plant the requester wants. It belongs to the owner. |
| Offered plant | The plant the requester gives in return. It belongs to the requester. |
| Swap | A proposal to exchange one requested plant for one offered plant, and its lifecycle. |
| Plant status | `AVAILABLE`, `RESERVED`, `SWAPPED` or `REMOVED`. |
| Swap status | `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED` or `COMPLETED`. |
| Terminal status | A swap status that can never change: `DECLINED`, `CANCELLED`, `COMPLETED`. |

## Scope

In scope: accounts with a city, plant listings with a health confirmation, browsing with search and filters (plant type, form, city), and the swap lifecycle. The detail is in `02-requirements.md`.

## Out of scope

The first version does not include:

- Money, prices or payments.
- Shipping. Plants are handed over in person.
- Chat or in-app messaging.
- Photos, image upload or cover images.
- Maps or distance search.
- Ratings, reviews or reputation.
- Swaps of more than one plant per side.
- Care guides, seasonal calendars or a plant encyclopedia.
- Email notifications, email verification or password reset.
- Admin tools or moderation.
- Deployment to a public host.

A request to add any of these is a change to the plan, not an implementation detail.

## Changes from v0

v0 described a book swap. Plan v1 replaced books with plants. Book terms were replaced with plant terms, and the city became required.
