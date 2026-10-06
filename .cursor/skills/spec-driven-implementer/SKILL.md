---
name: spec-driven-implementer
description: Implement one Easy Exchange milestone or requirement strictly from the specs in docs/specs/, tests first. Use when asked to build, implement or continue a milestone (M0–M6) or a requirement (REQ-…, AC-…).
---

# Spec-driven implementer

The specs in `docs/specs/` are the source of truth. Code follows the spec; the spec never silently follows the code. One milestone at a time. No extra features.

## Before any edit

1. Read `.cursor/rules/project.mdc` and `AGENTS.md`.
2. Read `docs/specs/06-milestones.md` and find the milestone you were asked to build. Work on that milestone only.
3. Read the spec sections it points to: requirements in `docs/specs/02-requirements.md`, screens in `docs/specs/03-features.md`, stack, folders and data model in `docs/specs/04-architecture.md`, and scenarios in `docs/specs/05-behavior.md`. Read `docs/PLAN.md` when the reason for a decision matters.
4. Reply with:
   - the `REQ` and `AC` IDs in scope,
   - the files you expect to create or change,
   - anything in the specs that is unclear, missing or contradictory.
5. Do not edit until the human agrees, unless they already said to implement that milestone.

If a requirement is unclear, ask. Do not guess.

## If the spec is wrong

Stop. Propose the spec change and wait for approval. Update the spec (follow `.cursor/skills/write-spec/SKILL.md`) in the same change set, **before** the production code. Record it in `docs/PROCESS_LOG.md`.

## Implementation loop

1. **Test first.** Write the tests for the in-scope `AC` scenarios before the code that satisfies them. Start each test name with the `AC` ID, for example `AC-SWAP-6: accepting reserves both plants`. Follow `.cursor/skills/test-driven-development/SKILL.md`.
2. Run the tests and confirm they fail for the right reason.
3. Write the smallest change that makes them pass. Follow the layering and conventions in `docs/specs/04-architecture.md`: Zod on every server input, session and ownership checks in every mutating service.
4. Run `npm run lint`, `npm run typecheck` and `npm test`. Fix failures you caused. Report real output, including failures you could not fix.
5. Review the diff against the specs (follow `.cursor/skills/requesting-code-review/SKILL.md`), then run `/verify-against-spec` for the milestone.
6. Commit with a message that names the milestone and requirement IDs, for example `feat(M5): swaps (REQ-SWAP-1 to REQ-SWAP-13)`.
7. Finish with a short report: IDs implemented, files changed, how to try it by hand, and anything left undone.

## Hard stops

- Do not start the next milestone unasked.
- Do not add features, fields, routes, pages or dependencies the specs do not ask for. If one seems necessary, ask.
- Never weaken or delete a test to make it pass.
- Never put secrets in the repository. New environment variables go in `.env.example`.
- Every mutation checks the session and ownership on the server, even if the UI already hides the control.
