# Cursor workspace setup

Prepared before application code (Phase 2 of the assignment).

## Native skills and product features we will actually use

These ship with Cursor (not copied into this repo):

| What | When we use it |
| --- | --- |
| **Plan mode** | Phase 3 architecture and every later slice: show a plan, no code until approved |
| **Project rules** (`.cursor/rules/*.mdc`) | Always-on instructions via `create-rule` conventions |
| **Agent skills** (`.cursor/skills/*/SKILL.md`) | Repeatable workflows the agent must follow |
| **Code review / Bugbot** | After each implementation slice, before commit |
| **Security review** | Before treating auth or swap mutations as done |
| **Browser tools** | Verify UI flows after pages exist |
| **GitHub CLI (`gh`)** | Push, PRs, and repo evidence. GitHub auth in this environment is `Lakshna15` via `gh` (keyring). Cursor Accounts icon is a separate IDE login the human can still complete in the UI. |

We are **not** using Origin (`origin.cursor.com`) for this assignment. The remote is GitHub: https://github.com/Lakshna15/easy-exchange

## Imported skills (in `.cursor/skills/`)

| Skill | Source | Why |
| --- | --- | --- |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Apache-2.0) | Distinctive UI when we reach polish, without generic AI chrome |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) (Apache-2.0) | Browser-level checks of local pages |
| `test-driven-development` | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/test-driven-development) (MIT) | Red-green-refactor for every feature |
| `requesting-code-review` | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/requesting-code-review) (MIT) | Independent review after each slice |

Python helper scripts from `webapp-testing` were **not** copied. For this project, use `npm test` plus Cursor browser tools.

## Custom skill

`spec-driven-implementer` — our loop: read spec → plan → failing test named with the scenario ID → smallest code → run tests → review → commit. If code must differ from the spec, update the spec first.
