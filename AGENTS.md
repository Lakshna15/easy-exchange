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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
