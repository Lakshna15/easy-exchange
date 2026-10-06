// Plant listings service: REQ-PLANT-1 to REQ-PLANT-9, and the plant page (REQ-BROWSE-6, REQ-BROWSE-8).
import type { PlantForm, PlantStatus, PlantType } from "@/domain/constants";
import { fieldErrorsOf, plantSchema } from "@/domain/validation";
import { type Db, newId, now, withTransaction } from "@/server/db";
import { fail, ok, type Result } from "@/server/result";

export type Plant = {
  id: string;
  ownerId: string;
  commonName: string;
  botanicalName: string | null;
  plantType: PlantType;
  form: PlantForm;
  description: string | null;
  status: PlantStatus;
  createdAt: string;
  updatedAt: string;
};

/** A plant with its owner's public details. Never the owner's email (REQ-BROWSE-6). */
export type PlantDetails = Plant & { ownerName: string; ownerCity: string };

const PLANT_COLUMNS =
  "p.id, p.ownerId, p.commonName, p.botanicalName, p.plantType, p.form, p.description, p.status, p.createdAt, p.updatedAt";
const NEWEST_FIRST = "p.createdAt DESC, p.rowid DESC";
const CHECK_FIELDS = "Check the highlighted fields.";
const NOT_FOUND = "This plant was not found. It may have been removed.";
const OWNER_ONLY = "Only the owner can change this plant.";

function findPlant(db: Db, id: string): Plant | undefined {
  return db.prepare(`SELECT ${PLANT_COLUMNS} FROM plants p WHERE p.id = ?`).get(id) as Plant | undefined;
}

function parsePlant(input: unknown) {
  const parsed = plantSchema.safeParse(input);
  if (!parsed.success) return { error: fail("VALIDATION", CHECK_FIELDS, fieldErrorsOf(parsed.error)) };
  const { commonName, botanicalName, plantType, form, description } = parsed.data;
  return { data: { commonName, botanicalName: botanicalName || null, plantType, form, description: description || null } };
}

function lockedMessage(status: PlantStatus): string {
  return status === "RESERVED"
    ? "This plant is reserved for an accepted swap, so it can't be changed or removed."
    : "This plant has been swapped, so it can't be changed or removed.";
}

/** REQ-PLANT-1, -4, -9: a new plant is AVAILABLE and belongs to the member who listed it. */
export function createPlant(db: Db, ownerId: string, input: unknown): Result<{ id: string }> {
  const parsed = parsePlant(input);
  if (parsed.error) return parsed.error;
  const { commonName, botanicalName, plantType, form, description } = parsed.data;
  const id = newId();
  const time = now();
  db.prepare(
    `INSERT INTO plants (id, ownerId, commonName, botanicalName, plantType, form, description, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, ?)`,
  ).run(id, ownerId, commonName, botanicalName, plantType, form, description, time, time);
  return ok({ id });
}

/** For the edit page: only the owner may open it (REQ-PLANT-7). */
export function getPlantForEdit(db: Db, actorId: string, plantId: string): Result<Plant> {
  const plant = findPlant(db, plantId);
  if (!plant || plant.status === "REMOVED") return fail("NOT_FOUND", NOT_FOUND);
  if (plant.ownerId !== actorId) return fail("FORBIDDEN", OWNER_ONLY);
  return ok(plant);
}

/** REQ-PLANT-5, -7, -9: the owner can edit an AVAILABLE plant, confirming its health again. */
export function updatePlant(db: Db, actorId: string, plantId: string, input: unknown): Result<{ id: string }> {
  return withTransaction(db, () => {
    const plant = findPlant(db, plantId);
    if (!plant || plant.status === "REMOVED") return fail("NOT_FOUND", NOT_FOUND);
    if (plant.ownerId !== actorId) return fail("FORBIDDEN", OWNER_ONLY);
    if (plant.status !== "AVAILABLE") return fail("CONFLICT", lockedMessage(plant.status));
    const parsed = parsePlant(input);
    if (parsed.error) return parsed.error;
    const { commonName, botanicalName, plantType, form, description } = parsed.data;
    db.prepare(
      `UPDATE plants SET commonName = ?, botanicalName = ?, plantType = ?, form = ?, description = ?, updatedAt = ?
       WHERE id = ?`,
    ).run(commonName, botanicalName, plantType, form, description, now(), plantId);
    return ok({ id: plantId });
  });
}

/** REQ-PLANT-6, -7: remove an AVAILABLE plant with no PENDING swap. The record stays, as REMOVED. */
export function removePlant(db: Db, actorId: string, plantId: string): Result<{ id: string }> {
  return withTransaction(db, () => {
    const plant = findPlant(db, plantId);
    if (!plant || plant.status === "REMOVED") return fail("NOT_FOUND", NOT_FOUND);
    if (plant.ownerId !== actorId) return fail("FORBIDDEN", OWNER_ONLY);
    if (plant.status !== "AVAILABLE") return fail("CONFLICT", lockedMessage(plant.status));

    const pending = db
      .prepare(
        `SELECT r.displayName AS requesterName, rp.commonName AS requestedName, op.commonName AS offeredName
         FROM swaps s
         JOIN users r ON r.id = s.requesterId
         JOIN plants rp ON rp.id = s.requestedPlantId
         JOIN plants op ON op.id = s.offeredPlantId
         WHERE s.status = 'PENDING' AND (s.requestedPlantId = ? OR s.offeredPlantId = ?)
         ORDER BY s.createdAt, s.rowid
         LIMIT 1`,
      )
      .get(plantId, plantId) as { requesterName: string; requestedName: string; offeredName: string } | undefined;
    if (pending) {
      return fail(
        "CONFLICT",
        `This plant is in a pending swap: ${pending.requesterName} offered ${pending.offeredName} for ${pending.requestedName}. ` +
          "Answer or cancel that request on your swaps page first.",
      );
    }

    db.prepare("UPDATE plants SET status = 'REMOVED', updatedAt = ? WHERE id = ?").run(now(), plantId);
    return ok({ id: plantId });
  });
}

/** REQ-PLANT-8: the member's plants that are not removed, newest first. */
export function listShelf(db: Db, ownerId: string): Plant[] {
  return db
    .prepare(`SELECT ${PLANT_COLUMNS} FROM plants p WHERE p.ownerId = ? AND p.status != 'REMOVED' ORDER BY ${NEWEST_FIRST}`)
    .all(ownerId) as Plant[];
}

/** REQ-BROWSE-6, -8: a plant's public page. A removed plant reports not found. */
export function getPlantDetails(db: Db, plantId: string): Result<PlantDetails> {
  const row = db
    .prepare(
      `SELECT ${PLANT_COLUMNS}, u.displayName AS ownerName, u.city AS ownerCity
       FROM plants p JOIN users u ON u.id = p.ownerId
       WHERE p.id = ?`,
    )
    .get(plantId) as PlantDetails | undefined;
  if (!row || row.status === "REMOVED") return fail("NOT_FOUND", NOT_FOUND);
  return ok({ ...row });
}

export function countAvailablePlants(db: Db): number {
  const row = db.prepare("SELECT COUNT(*) AS n FROM plants WHERE status = 'AVAILABLE'").get() as { n: number };
  return row.n;
}
