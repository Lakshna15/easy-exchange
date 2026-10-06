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

## Try a swap

Use two browser windows, one of them private, so you can be two members at once.

1. Window 1: log in as `alice@example.com`. Open **Monstera**, choose **Golden pothos** to offer, add a message and select **Request swap**.
2. Window 2: log in as `ben@example.com` and open **Swaps**. Alice's offer is under Incoming. Select **Accept**: both plants become reserved, any other pending offers for them are cancelled, and Alice's email appears so you can arrange the handoff.
3. Either window: select **Mark completed**. Both plants now show as swapped and leave the browse list.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the app in development mode. |
| `npm run build` / `npm start` | Builds and serves the production version. |
| `npm test` | Runs the tests. Each test name starts with the scenario it proves, for example `AC-SWAP-6`. |
| `npm run lint` / `npm run typecheck` | ESLint and the TypeScript check. |
| `npm run db:seed` | Creates the demo data in an empty database. |
| `npm run db:reset` | Empties the local database and creates the demo data again. Safe while the app is running. |

## Troubleshooting

| You see | Do this |
|---------|---------|
| "Easy Exchange needs Node.js 22.13 or newer" | Install Node.js 24 LTS from [nodejs.org](https://nodejs.org), open a new terminal, and run the commands again. |
| "SESSION_SECRET must be at least 32 characters" | Copy `.env.example` to `.env` (see "Run it"), then restart the app. |
| Port 3000 is already in use | Run `npm run dev -- -p 3001` and open <http://localhost:3001>. |
| You can't stay logged in after `npm start` | Open the app at `http://localhost:3000`, not at a network address. In production mode the login cookie is only sent to secure origins, and `localhost` counts as one. |
| Style changes don't show while `npm run dev` is running | Stop the app, delete the `.next/dev` folder, and start it again. |

## Status

All milestones (M0–M6) are built. 141 tests and 33 browser checks pass. Every requirement and scenario is traced to its code and tests in [`docs/VERIFICATION.md`](docs/VERIFICATION.md). The browser checks are in [`e2e/`](e2e/README.md).

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
| `e2e/` | Browser checks (Python Playwright), not part of `npm test`. |
| `docs/DESIGN.md` | The visual design plan and why it looks the way it does. |
| `docs/VERIFICATION.md`, `docs/REVIEW.md` | Coverage of every requirement, and the code review. |

## Process

1. Plan: decisions and their reasons. No code.
2. Specs: written from the plan, audited, then approved.
3. Build: one milestone at a time, tests first, each test named after the scenario it proves.
4. Verify: check the code against the specs, then review.
