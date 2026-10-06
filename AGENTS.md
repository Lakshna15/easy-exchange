# Easy Exchange

A web app where members swap books one-for-one. Built spec-first for a course assignment on AI-assisted development.

## Source of truth

- `docs/plan.md` holds the decisions and their reasons.
- `specs/` holds what to build.
- If code and spec disagree, the spec wins. If the spec is wrong, stop, propose the spec change, and update the spec before the code.

## How to work here

- Build one slice at a time. Do not start the next one unasked.
- Do not add features, fields, pages or dependencies the specs do not ask for.
- Write the test for an acceptance scenario before the code, and start the test name with the scenario ID, for example `AC-SWAP-6: ...`.
- Ask when a requirement is unclear. Do not guess.
- Never weaken or delete a test to make it pass.
- Report what actually happened, including failing commands.

## Cursor workspace

Standing rules: `.cursor/rules/project.mdc`.
Skills: `.cursor/skills/`. Native vs imported vs custom: `docs/workspace-setup.md`.
Prompt log: `docs/prompt-log.md`.
