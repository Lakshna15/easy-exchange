# Process log

One entry per step, oldest first. Each entry records which tool did the work, what was asked, what came out, and what changed along the way, including what went wrong.

## Entry format

```
## YYYY-MM-DD — <phase and step>

- Tool and mode: Cursor Agent | Cursor Plan | Cursor Ask | Claude (claude.ai)
- Skills: <name (native | imported | project)>, ...
- Prompt: <one or two sentences>
- Produced: <files created or changed, commit hash>
- Changed or rejected: <what was corrected, refused or re-prompted, and why>
- Takeaway: <what to keep doing or do differently>
```

## Entries

## 2026-10-06 — Phase 1: repository and exchange type

- Tool and mode: Cursor Agent
- Skills: none
- Prompt: Sign in to GitHub, pick an exchange type, create the public repository `easy-exchange`, take an empty-repository screenshot, make the first commit.
- Produced: `2aa3c28` `docs: add project README for book exchange`, pushed to `main` at https://github.com/Lakshna15/easy-exchange. GitHub showed "This repository is empty." before the push.
- Changed or rejected: The agent could not click Cursor's Accounts icon. `gh auth status` already showed `Lakshna15` signed in to github.com, so it used that. The remote already existed, so no second repository was created. Lakshna confirmed books, one-for-one, a first commit and a push.
- Takeaway: Check what already exists (sign-in, remote) before creating anything.

## 2026-10-06 — Phase 2: workspace before any code

- Tool and mode: Cursor Agent
- Skills: imported `frontend-design`, `webapp-testing`, `test-driven-development`, `requesting-code-review`; project `spec-driven-implementer` (created in this step)
- Prompt: Create `.cursor/rules/project.mdc`, import skills, write one custom skill and a prompt log. No application code.
- Produced: `d2d6b03` `chore: add Cursor rules, skills, and prompt log`: an always-on rule (spec first, no extra features, tests named with scenario IDs), four imported skills with their sources and licenses, the custom skill `spec-driven-implementer`, `docs/prompt-log.md` and `docs/workspace-setup.md`.
- Changed or rejected: The Python helper scripts of `webapp-testing` were left out on purpose.
- Takeaway: Recording each skill's source and license next to it makes the imported skills easy to explain.

## 2026-10-06 — Plan and spec drafts v0 (books), outside Cursor

- Tool and mode: prepared outside Cursor, in a folder around the cloned repository. The drafts themselves say they were "prepared before opening Cursor".
- Skills: project `write-spec`, `implement-from-spec`, `verify-against-spec` (written with the drafts)
- Prompt: not recorded.
- Produced: `docs/PLAN.md` v0, `docs/specs/01` to `06` v0, `docs/PLAYBOOK.md`, the three project skills. Not committed at the time.
- Changed or rejected: Nothing yet. These drafts are the input to the steps below.
- Takeaway: Drafts that live outside the repository are invisible to the history and easy to lose.

## 2026-10-06 — Review of the project folder

- Tool and mode: Claude (claude.ai), reading the folder on Lakshna's computer
- Skills: none
- Prompt: "Check what I have done in Cursor."
- Produced: A list of problems. The plan and specs were outside git (the outer folder was its own empty repository). The rules and the custom skill pointed to spec files that do not exist (`specs/requirements.md`, `specs/api.md` and others). There were two implementer skills, two READMEs and two AGENTS files. The logs were out of date.
- Changed or rejected: Lakshna switched the exchange type from books to plants.
- Takeaway: Review the repository's state before adding to it; every problem found here would have confused the agent later.

## 2026-10-06 — Merge into one repository, steps 1–3

- Tool and mode: Cursor Agent
- Skills: none
- Prompt: Make the folder one clean repository that continues the GitHub history: link `origin`, point `main` at `origin/main` without touching files, restore GitHub-only files, set aside duplicates as `.local`, commit the drafts as they are, then fix references, merge duplicates and logs, commit and push. Show every move and delete first and wait for an OK. Never use `reset --hard`, `clean` or a force push.
- Produced: `origin` linked and tracked; `AGENTS.md`, `README.md` and `.gitignore` set aside as `.local`; `f23c3e9` `docs: plan and spec drafts v0 (books, as-is)`.
- Changed or rejected: The local copy of the GitHub repository had been deleted before this step, so the prompt was rewritten to rebuild the history from GitHub instead of moving a nested `.git`. Cursor's free usage ran out after step 3.
- Takeaway: A prompt with numbered steps and a "Done when" check made it clear exactly where the work stopped.

## 2026-10-06 — Merge into one repository, steps 4–6

- Tool and mode: Claude (claude.ai), continuing from `f23c3e9`
- Skills: none
- Prompt: The same merge prompt, steps 4 to 6.
- Produced: One `README.md`, `AGENTS.md` and `.gitignore` (merged from the `.local` copies). Every reference now points to `docs/PLAN.md` and `docs/specs/01` to `06`. `implement-from-spec` was folded into `spec-driven-implementer` and deleted. `docs/prompt-log.md` was merged into this file and deleted. `docs/PLAYBOOK.md` was deleted; commit `f23c3e9` keeps it in history. `docs/workspace-setup.md` lists only skills that exist.
- Changed or rejected: The `log-process` skill, planned for Cursor's native `/create-skill`, was not created because Cursor's usage had run out. This log is kept by hand instead.
- Takeaway: Fixing the references before planning means every later prompt can point the agent at files that exist.
