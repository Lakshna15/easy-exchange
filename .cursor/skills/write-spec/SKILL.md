---
name: write-spec
description: Writes or revises a specification file under docs/specs/ from the approved plan. Use when asked to create, update, tighten or review a spec, or when implementation reveals that a spec is missing, ambiguous or wrong.
---

# Write Spec

Turn decisions from `docs/PLAN.md` into a spec that a developer who has never seen the plan could build and test from.

## When to Use

- A spec file in `docs/specs/` needs to be created or revised.
- A planning decision changed and the specs must follow.
- Implementation hit a gap or contradiction in a spec (fix the spec before the code).

## Instructions

1. Read `docs/PLAN.md` and every existing file in `docs/specs/` before writing. Specs must not contradict each other.
2. Start from `assets/spec-template.md` for a new file. For an existing file, keep its structure and edit in place.
3. Write what the system does, not how the code is written. No source code in specs. Only `04-architecture.md` may name libraries, folders and data types.
4. Give every requirement a stable ID (`REQ-AREA-n`) and every acceptance scenario a stable ID (`AC-AREA-n`). Never renumber or reuse an ID. To drop one, mark it `Removed` with a one-line reason.
5. Make each requirement testable: one behavior per requirement, concrete limits instead of words like "fast", "secure" or "user-friendly".
6. Write acceptance scenarios as Given / When / Then with named example data, and list the `REQ` IDs each one proves.
7. State what is out of scope. An unstated non-goal becomes scope creep.
8. If something is undecided, do not guess. Use the ask questions tool. If the question can wait, record it under "Open questions" with the options and a recommendation.
9. Finish by listing what changed and which other spec files now need a matching edit.

## Checks before finishing

- Every `REQ` has at least one `AC`, and every `AC` cites at least one `REQ`.
- No requirement appears in two files with different wording.
- Terms match the glossary in `01-overview.md`.
- No code, no implementation steps, no vague adjectives.
