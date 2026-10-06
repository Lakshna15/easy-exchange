# Easy Exchange

A web app where members swap plants one-for-one: cuttings, seedlings, potted plants and seeds. Built spec-first for Assignment 07 (Skills and specs), a course assignment on AI-assisted development.

## Source of truth

- `docs/PLAN.md` holds the decisions and their reasons.
- `docs/specs/` holds what to build, in `01-overview.md` to `06-milestones.md`.
- If code and spec disagree, the spec wins. If the spec is wrong, stop, propose the spec change, and update the spec before the code.

## How to work here

- Build one milestone at a time. Do not start the next one unasked.
- Do not add features, fields, pages or dependencies the specs do not ask for.
- Write the test for an acceptance scenario before the code, and start the test name with the scenario ID, for example `AC-SWAP-6: ...`.
- Ask when a requirement is unclear. Do not guess.
- Never weaken or delete a test to make it pass.
- Report what actually happened, including failing commands.

## Workspace

- Standing rules: `.cursor/rules/project.mdc`.
- Skills: `.cursor/skills/`. Which are native, imported or project skills: `docs/workspace-setup.md`.
- Process log (tool, prompt, result and what changed at each step): `docs/PROCESS_LOG.md`.
