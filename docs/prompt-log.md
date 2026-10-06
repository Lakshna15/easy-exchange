# Prompt log

Record of important prompts, what came back, and what we changed. Presentation evidence.

## 2026-10-06 — Phase 1: repo and exchange type

**Prompt (assignment + prior chat):** Sign in to GitHub, pick an exchange type, create public repo `easy-exchange`, empty-repo screenshot, first commit.

**What came back / what we did:**

- Cursor Accounts icon cannot be clicked by the agent. `gh auth status` already showed **Lakshna15** logged in to github.com (HTTPS, `repo` scope).
- Remote already existed: `https://github.com/Lakshna15/easy-exchange.git` (public, empty). No second repo was created.
- Exchange type locked: **books**, one-for-one (simple domain; process is what gets graded).
- Empty-repo evidence: GitHub UI showed “This repository is empty.”
- First commit: `2aa3c28` `docs: add project README for book exchange`, pushed to `main`.
  Commit URL: https://github.com/Lakshna15/easy-exchange/commit/2aa3c2821bab2b862fb5a8107503a47be16fe82f

**Human correction:** Confirmed books, first commit, and push (not plants, not local-only).

## 2026-10-06 — Phase 2: workspace (this commit)

**Prompt:** Create `.cursor/rules/project.mdc`, imported skills, one custom skill, `docs/prompt-log.md`. No application code.

**What we set up:**

- Always-on rule: spec first, no extra features, tests named with scenario IDs.
- Imported: Anthropic `frontend-design` and `webapp-testing`; Superpowers `test-driven-development` and `requesting-code-review`.
- Custom: `spec-driven-implementer`.
- Native skills we will use: Plan mode, project rules, Bugbot/code review, security review, browser verification. Documented in `docs/workspace-setup.md`.

**Not done yet:** `docs/plan.md` and `specs/*` (Phase 3–4). No app source.
