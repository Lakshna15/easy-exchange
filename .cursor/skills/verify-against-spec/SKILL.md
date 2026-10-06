---
name: verify-against-spec
description: Audits the code against docs/specs/ and reports which requirements are implemented, tested, missing or contradicted. Read-only: it reports and does not fix.
disable-model-invocation: true
---

# Verify Against Spec

Produce an honest coverage report. Do not change application code or specs while running this skill.

## When to Use

- After a milestone, before committing it.
- Before the final review and before the presentation.

## Instructions

1. Take the scope from the request: a milestone, a spec file, or everything. Default to everything.
2. List every `REQ` ID in scope from `docs/specs/02-requirements.md` and every `AC` ID from `docs/specs/05-behavior.md`.
3. For each `AC`, search the tests for its ID. For each `REQ`, find the code that implements it.
4. Run the test suite and record the real result of each `AC` test.
5. Read the implementing code for each `REQ` and judge whether it does what the requirement says, including the server-side checks. A passing test is evidence, not proof.
6. Report one table:

   | ID | Status | Evidence | Note |
   |----|--------|----------|------|

   Status is one of `Pass`, `Fail`, `Untested`, `Missing`, `Differs from spec`. Evidence is a `file:line` or a test name.
7. After the table, list behavior found in the code that no spec asks for.
8. End with the three most important gaps, most serious first. Say plainly if you could not check something.
