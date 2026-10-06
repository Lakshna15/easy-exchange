---
name: spec-driven-implementer
description: Implement one Easy Exchange requirement as a spec-first slice. Use when adding a feature, endpoint, or page, or when the user names a requirement ID (FR-*, AC-*, REQ-*).
---

# Spec-driven implementer

One requirement at a time. Specs win. No extra features.

## Before any edit

1. Read `.cursor/rules/project.mdc`.
2. Read `docs/plan.md` and only the spec files this slice needs (`specs/requirements.md`, `specs/user-stories.md`, `specs/features.md`, `specs/architecture.md`, `specs/data-model.md`, `specs/api.md`, `specs/ui.md`, `specs/testing.md`).
3. Restate the requirement IDs in scope and out of scope.
4. Show a short plan. Do not edit until the human agrees, unless they already said to implement that ID.

If a requirement is unclear, ask. Do not guess.

## If the spec is wrong

Stop. Propose the spec change. Update the spec in the same change set **before** production code. Note it in `docs/prompt-log.md`.

## Implementation loop

1. **Test first.** Write or extend a test named with the scenario ID, for example `AC-LIST-1: member can create a listing`. Follow `.cursor/skills/test-driven-development/SKILL.md`.
2. Run that test and confirm it fails for the right reason.
3. Write the smallest TypeScript change that should pass: Zod on server input, session and ownership checks in every mutating service.
4. Run `npm test` (and lint/typecheck when those scripts exist). Report real command output.
5. Review the diff against the spec (use `.cursor/skills/requesting-code-review/SKILL.md`).
6. Commit only if asked, or if this assignment slice includes a commit, with a message like `feat: listing creation (FR-3)`.

## Hard stops

- Do not start the next slice unasked.
- Do not add fields, routes, pages, or dependencies absent from the specs.
- Never weaken or delete a test to make it pass.
