---
name: implement-from-spec
description: Implements one milestone of Easy Exchange strictly from the specs in docs/specs/, tests first. Use when asked to build, implement or continue a milestone or a requirement (REQ-...) of the application.
---

# Implement From Spec

The specs in `docs/specs/` are the source of truth. Code follows the spec; the spec never silently follows the code.

## When to Use

- Building a milestone listed in `docs/specs/06-milestones.md`.
- Implementing or changing behavior tied to a `REQ` or `AC` ID.

## Instructions

1. Read `docs/specs/06-milestones.md` and find the milestone you were asked to build. Work on that milestone only.
2. Read the spec sections it points to. Before writing code, reply with:
   - the `REQ` and `AC` IDs in scope,
   - the files you expect to create or change,
   - anything in the specs that is unclear, missing or contradictory.
3. If step 2 found a gap or contradiction, stop and ask. Propose the spec edit, wait for approval, and update the spec first.
4. Write the tests for the in-scope `AC` scenarios before the code that satisfies them. Put the `AC` ID at the start of each test name, for example `AC-SWAP-3: accepting reserves both books`.
5. Implement the smallest change that makes those tests pass. Follow the layering and conventions in `docs/specs/04-architecture.md`.
6. Do not add features, fields, pages or dependencies that the specs do not ask for. If one seems necessary, ask.
7. Run the tests, the type check and the linter. Fix failures you caused. Report real output, including failures you could not fix.
8. Finish with a short report: IDs implemented, files changed, how to try it by hand, and anything left undone.

## Boundaries

- Never weaken or delete a test to make it pass.
- Never put secrets in the repository. New environment variables go in `.env.example`.
- Every mutation checks the session and ownership on the server, even if the UI already hides the control.
