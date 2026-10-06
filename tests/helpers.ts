// Shared test setup: a fresh in-memory database with the seed data from 05-behavior.md.
import type { PlantStatus, SwapStatus } from "@/domain/constants";
import { type Db, newId, now, openDatabase } from "@/server/db";
import { seedDatabase } from "@/server/seed";

export async function freshDb(): Promise<Db> {
  const db = openDatabase(":memory:");
  await seedDatabase(db);
  return db;
}

export function memberId(db: Db, displayName: string): string {
  const row = db.prepare("SELECT id FROM users WHERE displayName = ?").get(displayName) as { id: string } | undefined;
  if (!row) throw new Error(`No member called ${displayName}`);
  return row.id;
}

export function plantId(db: Db, commonName: string): string {
  const row = db.prepare("SELECT id FROM plants WHERE commonName = ?").get(commonName) as { id: string } | undefined;
  if (!row) throw new Error(`No plant called ${commonName}`);
  return row.id;
}

export function plantRow(db: Db, commonName: string) {
  return db.prepare("SELECT * FROM plants WHERE commonName = ?").get(commonName) as {
    id: string;
    ownerId: string;
    commonName: string;
    botanicalName: string | null;
    plantType: string;
    form: string;
    description: string | null;
    status: PlantStatus;
    updatedAt: string;
  };
}

export function plantStatus(db: Db, commonName: string): PlantStatus {
  return plantRow(db, commonName).status;
}

export function setPlantStatus(db: Db, commonName: string, status: PlantStatus): void {
  db.prepare("UPDATE plants SET status = ? WHERE commonName = ?").run(status, commonName);
}

/** Inserts a swap row directly, as milestones M3 and M4 do before the swap service exists. */
export function insertSwap(
  db: Db,
  swap: { requester: string; requested: string; offered: string; status?: SwapStatus; message?: string },
): string {
  const id = newId();
  const requested = plantRow(db, swap.requested);
  const time = now();
  db.prepare(
    `INSERT INTO swaps (id, requesterId, ownerId, requestedPlantId, offeredPlantId, message, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    memberId(db, swap.requester),
    requested.ownerId,
    requested.id,
    plantId(db, swap.offered),
    swap.message ?? null,
    swap.status ?? "PENDING",
    time,
    time,
  );
  return id;
}

export function count(db: Db, table: "users" | "plants" | "swaps", where = "1 = 1"): number {
  return (db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`).get() as { n: number }).n;
}
