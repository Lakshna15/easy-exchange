// The only module that opens the database (docs/specs/04-architecture.md, "Database access").
import { mkdirSync } from "node:fs";
import path from "node:path";
import type * as NodeSqlite from "node:sqlite";
import { PLANT_FORMS, PLANT_STATUSES, PLANT_TYPES, SWAP_STATUSES } from "@/domain/constants";

export type Db = NodeSqlite.DatabaseSync;

export const DEFAULT_DATABASE_FILE = "data/easy-exchange.db";

function loadSqlite(): typeof NodeSqlite {
  // getBuiltinModule keeps bundlers away from node:sqlite and lets us explain an old Node.js clearly.
  const mod =
    typeof process.getBuiltinModule === "function"
      ? (process.getBuiltinModule("node:sqlite") as typeof NodeSqlite | undefined)
      : undefined;
  if (!mod) {
    throw new Error(
      `Easy Exchange needs Node.js 22.13 or newer for its built-in SQLite (this is ${process.version}). ` +
        "Install Node.js 24 LTS from https://nodejs.org and run the app again.",
    );
  }
  return mod;
}

const list = (values: readonly string[]) => values.map((v) => `'${v}'`).join(", ");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  city TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  ownerId TEXT NOT NULL REFERENCES users(id),
  commonName TEXT NOT NULL,
  botanicalName TEXT,
  plantType TEXT NOT NULL CHECK (plantType IN (${list(PLANT_TYPES)})),
  form TEXT NOT NULL CHECK (form IN (${list(PLANT_FORMS)})),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN (${list(PLANT_STATUSES)})),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS plants_status_createdAt ON plants (status, createdAt);

CREATE TABLE IF NOT EXISTS swaps (
  id TEXT PRIMARY KEY,
  requesterId TEXT NOT NULL REFERENCES users(id),
  ownerId TEXT NOT NULL REFERENCES users(id),
  requestedPlantId TEXT NOT NULL REFERENCES plants(id),
  offeredPlantId TEXT NOT NULL REFERENCES plants(id),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (${list(SWAP_STATUSES)})),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS swaps_requesterId ON swaps (requesterId);
CREATE INDEX IF NOT EXISTS swaps_ownerId ON swaps (ownerId);
CREATE INDEX IF NOT EXISTS swaps_requestedPlantId ON swaps (requestedPlantId);
CREATE INDEX IF NOT EXISTS swaps_offeredPlantId ON swaps (offeredPlantId);
`;

/** Opens (and if needed creates) a database. Pass ":memory:" for a throwaway test database. */
export function openDatabase(file: string): Db {
  const { DatabaseSync } = loadSqlite();
  if (file !== ":memory:") mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}

const globalForDb = globalThis as unknown as { easyExchangeDb?: Db };

/** The app's shared database handle. Survives hot reloads in development. */
export function getDb(): Db {
  if (!globalForDb.easyExchangeDb) {
    globalForDb.easyExchangeDb = openDatabase(process.env.DATABASE_FILE || DEFAULT_DATABASE_FILE);
  }
  return globalForDb.easyExchangeDb;
}

/** Runs fn inside BEGIN IMMEDIATE … COMMIT and rolls back on any error. fn must be synchronous. */
export function withTransaction<T>(db: Db, fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export const newId = (): string => crypto.randomUUID();
export const now = (): string => new Date().toISOString();
