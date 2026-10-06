# Playbook — building Easy Exchange in Cursor

Run these steps in order, in Cursor. Each step names the mode, the skills in play, the prompt, and what to check before moving on.

The plan and specs in this repository are drafts prepared before opening Cursor. Phases 1 and 2 are where you challenge and change them. Record what changed in `docs/PROCESS_LOG.md`.

## How the prompts are built

Every prompt below has the same six parts. Being able to name them is most of the presentation.

| Part | What it does | Example |
|------|--------------|---------|
| Context | Points at files instead of pasting them. | `@docs/specs/05-behavior.md` |
| Task | One outcome per prompt. | "Build milestone M1." |
| Constraints | Says what not to do. | "Do not write code yet." |
| Process | Asks for questions or a plan before action. | "List the IDs in scope first." |
| Done when | A check the agent can run itself. | "Every row T1–T7 has a passing test." |
| Output | The shape of the reply. | "Reply with a table." |

Working habits:

- One chat per step. A fresh chat reads the specs instead of relying on an old conversation.
- When the agent gets something wrong twice, fix the spec or the skill, not the chat.
- Read every plan before approving it. Reject and re-prompt when it drifts from the specs.
- After every step: check, commit, log.

## Phase 0 — Setup

**0.1 Publish the repository.** In a terminal at the project root:

```bash
git add -A
```

```bash
git commit -m "chore: project kit, plan and spec drafts"
```

```bash
gh repo create easy-exchange --private --source . --remote origin --push
```

Use `--public` instead if your instructor needs to open the repository without an invitation.

**0.2 Open the folder in Cursor.** In the Agent chat, type `/` and confirm that `write-spec`, `implement-from-spec` and `verify-against-spec` are listed. These are the project skills in `.cursor/skills/`.

**0.3 Import skills.** Cursor reads skills from `.agents/skills/`, which is where this installer puts them. `--copy` writes real files so they are committed with the project.

```bash
npx skills add obra/superpowers --skill brainstorming --skill test-driven-development --skill systematic-debugging -a cursor --copy
```

```bash
npx skills add anthropics/skills --skill frontend-design -a cursor --copy
```

```bash
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices --skill web-design-guidelines -a cursor --copy
```

Type `/` again and confirm the six imported skills appear. Read each `SKILL.md` before relying on it, and keep the license files that come with them.

Cursor's documented route for GitHub imports is Customize, then From GitHub Repository, which needs a `.cursor-plugin/marketplace.json` in the source repository. None of these three repositories had that file when this playbook was written, which is why the installer is used.

| Imported skill | Source | Used in |
|----------------|--------|---------|
| `brainstorming` | obra/superpowers | Phase 1 |
| `test-driven-development` | obra/superpowers | M1, M2, M5 |
| `systematic-debugging` | obra/superpowers | Any failing step |
| `frontend-design` | anthropics/skills | M2 |
| `vercel-react-best-practices` | vercel-labs/agent-skills | M4 |
| `web-design-guidelines` | vercel-labs/agent-skills | Phase 4 |

**0.4 Create a skill with Cursor's native `/create-skill`.** Agent mode:

```text
/create-skill

Create a project skill named log-process in .cursor/skills/.

Purpose: append one entry to docs/PROCESS_LOG.md describing the step I just finished.

It should read the current chat and the last git commit, then add an entry using the
format already shown at the top of docs/PROCESS_LOG.md: date, phase, Cursor mode, skills
used, the prompt in one or two sentences, what the agent produced, what I changed or
rejected, and what I learned.

Constraints: append only, never rewrite earlier entries. Record what actually happened,
including mistakes. Ask me for "what I changed or rejected" and "what I learned" instead
of inventing them. Set disable-model-invocation to true so it runs only when I call it.
```

Check: `.cursor/skills/log-process/SKILL.md` exists, its `name` matches the folder, and `/log-process` appears in the list.

**0.5 Commit** as `chore: import skills and add log-process`. Run `/log-process`.

## Phase 1 — Plan

Mode: Plan. No code is written in this phase.

**1.1 Challenge the plan.**

```text
/brainstorming

Context: @docs/PLAN.md is a draft plan for Easy Exchange, a one-for-one book swap web app
built for a university assignment on AI-assisted development. I am on Cursor's free tier
and the deadline is <your date>.

Task: help me decide whether this plan is right before any spec is approved.

Process: interview me one question at a time. Start with the open questions in section 6,
then challenge the scope in section 3 and the decisions in section 4. For each decision,
tell me the strongest argument against it.

Constraints: do not write application code, do not create source files, do not edit
anything under docs/specs/. Write your output to docs/PLAN.md only, not to any other
location.

Done when: every open question has an answer and a reason, and I have confirmed the
scope.

Output: an updated docs/PLAN.md, then a list of what changed from the draft and why.
```

**1.2 Optional: draw the lifecycle.** Use native `/canvas` to visualise the swap lifecycle table in `docs/specs/05-behavior.md`, and check it against your own understanding. A screenshot of it is useful in the presentation.

Check: you can explain every row in the decisions table without reading it. Commit as `docs: plan v1`. Run `/log-process`.

## Phase 2 — Specs

**2.1 Bring the specs in line with the plan.** Agent mode. Run once per spec file, in number order, each in a new chat. Replace `02-requirements.md` with the file you are on.

```text
/write-spec

Context: @docs/PLAN.md is approved. @docs/specs/02-requirements.md is a draft written
before the plan was final.

Task: revise this one spec file so it matches the approved plan.

Process: first list every difference between the plan and this file, and every
requirement that is not testable as written. Ask me about anything undecided. Then edit.

Constraints: keep existing IDs stable. Edit only this file. Tell me which other spec
files need a matching change instead of changing them.

Done when: the checks at the end of the write-spec skill pass for this file.

Output: the edit, then a short list of changes and follow-ups.
```

**2.2 Audit the set.** Ask mode, so nothing can be edited.

```text
Context: all files in @docs/specs/ and @docs/PLAN.md.

Task: review the specs as a developer who has to build from them without asking me
anything.

Look for: contradictions between files, requirements with no acceptance scenario,
scenarios that cite a missing requirement, statements that cannot be tested, behavior
the scenarios imply but no requirement states, and anything in the plan's out-of-scope
list that crept into a spec.

Constraints: read only. Do not propose new features.

Output: a table with file, ID or line, problem, and suggested fix, most serious first.
If you find nothing in a category, say so.
```

**2.3 Fix the findings** with `/write-spec`, one file per chat. Repeat 2.2 until it comes back clean.

Check: set `Status: Approved` at the top of each spec. Commit as `docs: specs v1`. Run `/log-process`.

## Phase 3 — Build

One new chat per milestone, in Agent mode. Replace `M1` with the milestone you are on.

```text
/implement-from-spec

Context: @docs/specs/06-milestones.md, @docs/specs/04-architecture.md and
@docs/specs/05-behavior.md. Read the other specs as needed.

Task: build milestone M1 and nothing else.

Process: before writing code, reply with the REQ and AC IDs in scope, the files you will
create or change, and any gap or contradiction in the specs. Wait for my go-ahead.

Constraints: tests first, named by AC ID. No features, fields or dependencies the specs
do not ask for. If the spec is wrong, stop and propose a spec change.

Done when: the milestone's "Done when" line is true, and lint, typecheck and tests pass.

Output: IDs implemented, files changed, how to try it by hand, anything left undone.
```

Add one line to the prompt per milestone:

| Milestone | Extra line | Imported skill |
|-----------|------------|----------------|
| M0 | "Check the current Next.js and Prisma setup docs before running any install command. Follow the scaffolding note in the milestone." | none |
| M1 | "Write the T1–T7 tests as one table-driven test before the function exists, and show me them failing first." | `test-driven-development` |
| M2 | "Use the frontend-design skill for the header and forms. These set the look that later pages reuse." | `frontend-design`, `test-driven-development` |
| M3 | "Reuse the components and styles from M2. Do not introduce a new visual style." | none |
| M4 | "Apply the vercel-react-best-practices skill to data fetching on the browse page." | `vercel-react-best-practices` |
| M5 | "The accept step must be one transaction. Show me the test for AC-SWAP-6 before the service code." | `test-driven-development` |
| M6 | "Work through AC-NFR-1 and AC-NFR-2 page by page and report each result." | `web-design-guidelines` |

After each milestone:

1. Run `/verify-against-spec` with the milestone name. Fix anything that is not `Pass`.
2. Check the milestone's "Done when" line yourself, in the browser.
3. Commit as `feat(M1): swap rules (REQ-NFR-5)`, naming the milestone and the requirements.
4. Run `/log-process`.

When something fails and one fix attempt does not solve it:

```text
/systematic-debugging

Context: the failing output is below. The expected behavior is AC-SWAP-6 in
@docs/specs/05-behavior.md.

Task: find the root cause before changing any code.

Constraints: do not edit or delete the failing test. Do not change the spec.

Output: the cause, the evidence for it, and the smallest fix. Wait for my go-ahead.

<paste the failing output here>
```

## Phase 4 — Verify

Run each in its own chat and fix one finding at a time.

| Step | Run | Skill type |
|------|-----|-----------|
| 4.1 | `/verify-against-spec` for everything | Project |
| 4.2 | `/review` on the full diff from the first feature commit | Native |
| 4.3 | `/review-security`, asking it to focus on sessions, authorization in server actions and the login return address | Native |
| 4.4 | `/web-design-guidelines` on the pages in `03-features.md` | Imported |

For each finding you act on:

```text
Context: finding <paste one finding>. The governing requirement is <REQ ID> in
@docs/specs/02-requirements.md.

Task: fix this one finding.

Process: add or change a test that fails because of it, then fix the code.

Constraints: change nothing unrelated. If the finding contradicts the spec, tell me and
stop.

Done when: the new test passes and the full suite still passes.
```

Commit fixes as `fix: ...` with the requirement ID. Run `/log-process`.

## Phase 5 — Prepare the presentation

- Run native `/cursor-blame` on `src/domain/swaps.ts` to trace which prompts produced it.
- Pick one requirement and follow it end to end. REQ-SWAP-6 works well: the plan decision, the requirement, scenario AC-SWAP-6, row T1, the test, the service code, the commit.
- Find one place where the process corrected itself: a plan decision you reversed, a spec the audit caught, a test that failed first. `docs/PROCESS_LOG.md` is where you will find it.

What to show, in this order: the process table in `docs/PLAN.md` section 7, the skills (native, imported, project) and why each exists, one prompt with its six parts, the commit history, the end-to-end trace, and what you would do differently.
