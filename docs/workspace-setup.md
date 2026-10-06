# Workspace setup

How the AI tooling for Easy Exchange is set up: which skills exist, where they come from, and when each is meant to be used. `docs/PROCESS_LOG.md` records which ones were actually used at each step.

## Tools

| Tool | Role |
|------|------|
| Cursor (free plan) | IDE and coding agent. Its agent did phases 1 and 2 and the first half of the repository merge. |
| Claude (claude.ai) | Took over on 2026-10-06 when Cursor's free usage ran out. Reads the same rules and skill files and follows them step by step. |
| GitHub | Remote repository: https://github.com/Lakshna15/easy-exchange |

## How Cursor finds skills

From Cursor's documentation (https://cursor.com/docs/skills):

- A skill is a folder with a `SKILL.md`. Project skills live in `.cursor/skills/` (or `.agents/skills/`).
- `SKILL.md` needs a `name` that matches the folder and a `description` that says when to use it.
- A skill runs when you type `/` and pick it in Agent chat, or automatically when the agent judges it relevant. `disable-model-invocation: true` makes it manual-only.
- Skills from GitHub can only be imported as a plugin with a `.cursor-plugin/marketplace.json`. The source repositories below have none, so their skills were copied in with their licenses.

## Native: built into Cursor

| What | Use in this project |
|------|---------------------|
| Plan mode, Ask mode | Plan mode for planning with no edits; Ask mode for read-only reviews. |
| Project rules (`.cursor/rules/*.mdc`) | `project.mdc` is applied to every request. |
| `/create-skill` | Planned for a `log-process` skill. Not created: Cursor's usage ran out first (see below). |
| `/review` | Review of a milestone's changes. |
| `/canvas` | Diagram of the swap lifecycle for the presentation. |

Native skills run on Cursor's agent and count against its usage.

## Imported (in `.cursor/skills/`)

| Skill | Source | Why |
|-------|--------|-----|
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Apache-2.0) | A deliberate look for the pages instead of generic defaults. |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) (Apache-2.0) | Checking the running app in a real browser. |
| `test-driven-development` | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/test-driven-development) (MIT) | Red, green, refactor for every scenario. |
| `requesting-code-review` | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/requesting-code-review) (MIT) | An independent review after each milestone. |

The Python helper scripts from `webapp-testing` were not copied. Browser checks use Playwright outside the project, so it is not a project dependency.

## Project skills (written for this repository)

| Skill | Origin | What it does |
|-------|--------|--------------|
| `spec-driven-implementer` | Created by Cursor's agent in phase 2; extended with the milestone steps from a duplicate v0 implementer skill, which it replaced (see `docs/PROCESS_LOG.md`). | Builds one milestone from the specs, tests first. |
| `write-spec` | Prepared with the v0 drafts. | Writes or revises one spec file from the plan, with stable IDs. |
| `verify-against-spec` | Prepared with the v0 drafts. Manual-only. | Read-only coverage report: each requirement and scenario marked Pass, Fail, Untested, Missing or Differs from spec. |

Planned but not created: `log-process`, to be made with the native `/create-skill`. `docs/PROCESS_LOG.md` is updated by hand instead.
