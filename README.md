# Easy Exchange

A web app where neighbours swap plants one-for-one: cuttings, seedlings, potted plants and seeds. No money and no shipping. List a plant, offer it for one you want, and meet to hand them over once the owner accepts.

Built for Assignment 07 (Skills and specs) with a plan-first, spec-first process.
Repository: [github.com/Lakshna15/easy-exchange](https://github.com/Lakshna15/easy-exchange)

## Run it

You need **Node.js 22.13 or newer** (Node.js 24 LTS recommended, from [nodejs.org](https://nodejs.org)). The app uses Node's built-in SQLite, so there is no database server to install. On Node 22 you will see an "SQLite is an experimental feature" warning; it is harmless.

In a terminal at the project folder (Cursor: **Terminal → New Terminal**):

```bash
npm install
```

Copy the example settings. Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Create the demo data, then start the app:

```bash
npm run db:seed
npm run dev
```

Open <http://localhost:3000>. The demo members are `alice@example.com`, `ben@example.com` and `chidi@example.com`, all with the password `grow-together-1`.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the app in development mode. |
| `npm run build` / `npm start` | Builds and serves the production version. |
| `npm test` | Runs the tests. Each test name starts with the scenario it proves, for example `AC-SWAP-6`. |
| `npm run lint` / `npm run typecheck` | ESLint and the TypeScript check. |
| `npm run db:seed` | Creates the demo data in an empty database. |
| `npm run db:reset` | Empties the local database and creates the demo data again. Safe while the app is running. |

## Where things are

| Path | What it is |
|------|------------|
| `docs/PLAN.md` | Goal, scope, decisions and their reasons. |
| `docs/specs/` | Overview, requirements, features, architecture, expected behavior, milestones. |
| `docs/PROCESS_LOG.md` | What happened at each step: tool, mode, skills, prompt, result, what changed. |
| `docs/workspace-setup.md` | Native, imported and project skills, and when each is used. |
| `.cursor/rules/project.mdc` | Always-on rules for the agent. |
| `.cursor/skills/` | Imported skills and project skills. |
| `AGENTS.md` | Standing instructions for any coding agent. |
| `src/domain/` | Pure rules: swap transitions, validation, allowed values. |
| `src/server/` | Database, session, and the services for accounts, plants and swaps. |
| `src/app/` | Pages and Server Actions. |
| `tests/` | Tests, named after the scenarios in `docs/specs/05-behavior.md`. |

## Process

1. Plan: decisions and their reasons. No code.
2. Specs: written from the plan, audited, then approved.
3. Build: one milestone at a time, tests first, each test named after the scenario it proves.
4. Verify: check the code against the specs, then review.
