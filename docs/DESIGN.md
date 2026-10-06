# Design plan

Written with the imported `frontend-design` skill before any styling code (milestone M2): plan, review the plan against generic defaults, then build.

## Brief

- Subject: neighbours swapping plants (cuttings, seedlings, potted plants, seeds) by hand, in cities like Charlotte, Raleigh and Durham.
- Audience: hobby growers and students with spare cuttings or a windowsill of seedlings.
- Primary job: see what is on offer nearby, list your extras, and answer offers.

## Tokens

| Name | Hex | Use |
|------|-----|-----|
| ink | `#17321F` | Text. A deep leaf-shadow green instead of black. |
| paper | `#F1F4EA` | Page background. Pale green-grey, like greenhouse light, not warm cream. |
| leaf | `#2E6B3B` | Primary actions and the Available status. |
| stem | `#CAD8C0` | Borders and dividers. |
| marigold | `#E2A31B` | Seed-packet yellow: the Reserved status and the "Your plant" mark. |
| beet | `#A1263E` | Errors and destructive actions. |

Type:

- **Newsreader** (variable, with italic): page headings and plant names. Botanical names are always set in its italic, which is the taxonomic convention, not decoration.
- **Atkinson Hyperlegible Next**: body text, forms, navigation and buttons. Designed for legibility.
- Scale: 14 / 16 / 20 / 28 / 40 px. Body 16 px with 1.55 line height. Lines under 75 characters.

Both fonts are installed from npm (`@fontsource-variable/*`), so builds work offline.

## Layout

```
Easy Exchange                         Shelf  Swaps  List a plant  Alice  Log out
--------------------------------------------------------------------------------
Plants looking for a new home
[ search ............ ] [ Plant type v ] [ Form v ] [ City v ] [ Search ]

 ________     ________     ________     ________
| Monstera|  | Basil  |  | Spider |  |Sunflower|
| Monstera|  | Ocimum |  | Chloro-|  |Helianth.|
| deliciosa| | basilic|  | phytum |  | annuus  |
| Cutting |  |Seedling|  | Potted |  |  Seeds  |
 \Raleigh/    \Charlot/    \Durham/    \Durham/     <- the tag's point holds the city
```

Left-aligned throughout. Content up to 72 rem wide. Forms are one column, up to 28 rem.

## Principles

1. **One bold thing: the plant tag.** Every plant appears as a nursery stake label, a card with a pointed foot that carries the city. Everything around it stays quiet.
2. Botanical names are always italic. Common names lead.
3. Colour carries meaning: leaf means available, marigold means reserved or yours, grey means swapped.
4. Copy is plain and active: "List a plant", "Request swap", "Accept". Errors say how to fix the problem; empty pages say what to do next.
5. Quality floor: works from 360 px, visible keyboard focus, labels on every field, motion only on user action, reduced motion respected.

## Review against generic defaults

| Generic default the skill warns about | This plan |
|---------------------------------------|-----------|
| Warm cream background, high-contrast serif, terracotta accent | Green-grey paper, a reading serif (Newsreader), marigold accent |
| Near-black background with one acid accent | Light page; text is a dark green |
| Broadsheet: hairline rules, dense columns | No ruled columns; one grid of tags |
| SaaS card kit: identical rounded cards, grey shadows, gradients | Stake-shaped tags; no gradients; shadows only on focus |
| ALL-CAPS eyebrows, "A · B · C" meta strings, monospace labels, "→" on buttons | None of these |

Changed after the review: the first idea was a herbarium specimen sheet, with ruled lines and typewriter text. It was dropped because it drifts into the broadsheet and monospace-label defaults. The nursery stake tag is more specific to swapping plants, and simpler.
