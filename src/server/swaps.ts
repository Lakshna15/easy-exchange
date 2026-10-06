// Swaps service: REQ-SWAP-1 to REQ-SWAP-13. The rules come from the pure module src/domain/swaps.ts;
// this file loads the data, works out the actor's role, and applies the decision in one transaction.
import { SWAP_STATUS_LABELS, type PlantStatus, type SwapStatus } from "@/domain/constants";
import { type SwapAction, type SwapRole, allowedSwapActions, decideSwapAction } from "@/domain/swaps";
import { fieldErrorsOf, swapRequestSchema } from "@/domain/validation";
import { type Db, newId, now, withTransaction } from "@/server/db";
import { fail, ok, type Result } from "@/server/result";

type SwapRow = {
  id: string;
  requesterId: string;
  ownerId: string;
  requestedPlantId: string;
  offeredPlantId: string;
  message: string | null;
  status: SwapStatus;
  createdAt: string;
};

type PlantRow = { id: string; ownerId: string; status: PlantStatus };

export type SwapPlant = { id: string; commonName: string; botanicalName: string | null };

/** One swap as a participant sees it (REQ-SWAP-11, REQ-SWAP-12). */
export type SwapView = {
  id: string;
  status: SwapStatus;
  message: string | null;
  createdAt: string;
  role: "owner" | "requester";
  /** The other participant's plant. */
  theirPlant: SwapPlant;
  /** This member's plant. */
  yourPlant: SwapPlant;
  otherName: string;
  /** Only while ACCEPTED or COMPLETED, otherwise null. */
  otherEmail: string | null;
  /** Exactly the actions this member may take now. */
  actions: SwapAction[];
};

const findPlant = (db: Db, id: string) =>
  db.prepare("SELECT id, ownerId, status FROM plants WHERE id = ?").get(id) as PlantRow | undefined;

/** REQ-SWAP-1 to -3: request an AVAILABLE plant by offering one of your own AVAILABLE plants. */
export function requestSwap(db: Db, requesterId: string, input: unknown): Result<{ id: string }> {
  const parsed = swapRequestSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", "Check the highlighted fields.", fieldErrorsOf(parsed.error));
  const { requestedPlantId, offeredPlantId, message } = parsed.data;

  return withTransaction(db, () => {
    const requested = findPlant(db, requestedPlantId);
    if (!requested || requested.status === "REMOVED") return fail("NOT_FOUND", "This plant was not found. It may have been removed.");
    const offered = findPlant(db, offeredPlantId);
    if (!offered) return fail("VALIDATION", "Check the highlighted fields.", { offeredPlantId: "Choose one of your plants to offer." });

    if (requested.ownerId === requesterId) return fail("FORBIDDEN", "You can't request your own plant.");
    if (offered.ownerId !== requesterId) return fail("FORBIDDEN", "You can only offer one of your own plants.");
    if (requested.status !== "AVAILABLE") return fail("CONFLICT", "This plant is no longer available.");
    if (offered.status !== "AVAILABLE") return fail("CONFLICT", "The plant you offered is no longer available. Choose another one.");

    const duplicate = db
      .prepare("SELECT 1 FROM swaps WHERE requesterId = ? AND requestedPlantId = ? AND status = 'PENDING'")
      .get(requesterId, requestedPlantId);
    if (duplicate) {
      return fail("CONFLICT", "You already have a pending request for this plant. Cancel it on your swaps page to make a different offer.");
    }

    const id = newId();
    const time = now();
    db.prepare(
      `INSERT INTO swaps (id, requesterId, ownerId, requestedPlantId, offeredPlantId, message, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
    ).run(id, requesterId, requested.ownerId, requestedPlantId, offeredPlantId, message || null, time, time);
    return ok({ id });
  });
}

function refusalMessage(code: "FORBIDDEN" | "CONFLICT", role: SwapRole, status: SwapStatus, action: SwapAction): string {
  if (role === "other") return "Only the two members in this swap can change it.";
  if (code === "CONFLICT") return `This swap is ${SWAP_STATUS_LABELS[status].toLowerCase()}, so it can't be changed that way.`;
  if (action === "cancel") return "Only the member who made the request can cancel it while it is pending.";
  return "Only the plant's owner can accept or decline a request.";
}

/** REQ-SWAP-5 to -10, -13: accept, decline, cancel or complete, following the transition table. */
export function actOnSwap(db: Db, actorId: string, swapId: string, action: SwapAction): Result<{ status: SwapStatus }> {
  return withTransaction(db, () => {
    const swap = db.prepare("SELECT * FROM swaps WHERE id = ?").get(swapId) as SwapRow | undefined;
    if (!swap) return fail("NOT_FOUND", "This swap was not found.");

    const role: SwapRole = actorId === swap.ownerId ? "owner" : actorId === swap.requesterId ? "requester" : "other";
    const decision = decideSwapAction(swap.status, action, role);
    if (!decision.ok) return fail(decision.code, refusalMessage(decision.code, role, swap.status, action));

    const plantIds = [swap.requestedPlantId, swap.offeredPlantId];
    if (action === "accept") {
      // REQ-SWAP-6: re-check inside the same transaction that both plants are still AVAILABLE.
      const statuses = plantIds.map((id) => findPlant(db, id)?.status);
      if (statuses.some((status) => status !== "AVAILABLE")) {
        return fail("CONFLICT", "One of the plants is no longer available, so this request can't be accepted.");
      }
    }

    const time = now();
    db.prepare("UPDATE swaps SET status = ?, updatedAt = ? WHERE id = ?").run(decision.to, time, swap.id);
    if (decision.plantsTo) {
      db.prepare("UPDATE plants SET status = ?, updatedAt = ? WHERE id IN (?, ?)").run(decision.plantsTo, time, ...plantIds);
    }
    if (decision.cancelCompeting) {
      db.prepare(
        `UPDATE swaps SET status = 'CANCELLED', updatedAt = ?
         WHERE status = 'PENDING' AND id != ?
           AND (requestedPlantId IN (?, ?) OR offeredPlantId IN (?, ?))`,
      ).run(time, swap.id, ...plantIds, ...plantIds);
    }
    return ok({ status: decision.to });
  });
}

/** REQ-SWAP-4: the member's AVAILABLE plants, for the request form. Alphabetical. */
export function getRequestOptions(db: Db, memberId: string): SwapPlant[] {
  return db
    .prepare(
      `SELECT id, commonName, botanicalName FROM plants
       WHERE ownerId = ? AND status = 'AVAILABLE' ORDER BY commonName COLLATE NOCASE`,
    )
    .all(memberId)
    .map((row) => ({ ...(row as SwapPlant) }));
}

/** REQ-SWAP-11 to -13: the member's swaps, split into incoming and outgoing, newest first. */
export function listSwaps(db: Db, memberId: string): { incoming: SwapView[]; outgoing: SwapView[] } {
  const rows = db
    .prepare(
      `SELECT s.id, s.status, s.message, s.createdAt, s.ownerId, s.requesterId,
              rp.id AS requestedId, rp.commonName AS requestedName, rp.botanicalName AS requestedBotanical,
              op.id AS offeredId, op.commonName AS offeredName, op.botanicalName AS offeredBotanical,
              owner.displayName AS ownerName, owner.email AS ownerEmail,
              requester.displayName AS requesterName, requester.email AS requesterEmail
       FROM swaps s
       JOIN plants rp ON rp.id = s.requestedPlantId
       JOIN plants op ON op.id = s.offeredPlantId
       JOIN users owner ON owner.id = s.ownerId
       JOIN users requester ON requester.id = s.requesterId
       WHERE s.ownerId = ? OR s.requesterId = ?
       ORDER BY s.createdAt DESC, s.rowid DESC`,
    )
    .all(memberId, memberId) as Record<string, string | null>[];

  const incoming: SwapView[] = [];
  const outgoing: SwapView[] = [];
  for (const row of rows) {
    const status = row.status as SwapStatus;
    const role = row.ownerId === memberId ? "owner" : "requester";
    const requestedPlant = { id: row.requestedId!, commonName: row.requestedName!, botanicalName: row.requestedBotanical };
    const offeredPlant = { id: row.offeredId!, commonName: row.offeredName!, botanicalName: row.offeredBotanical };
    const contactVisible = status === "ACCEPTED" || status === "COMPLETED";
    const view: SwapView = {
      id: row.id!,
      status,
      message: row.message,
      createdAt: row.createdAt!,
      role,
      theirPlant: role === "owner" ? offeredPlant : requestedPlant,
      yourPlant: role === "owner" ? requestedPlant : offeredPlant,
      otherName: (role === "owner" ? row.requesterName : row.ownerName)!,
      otherEmail: contactVisible ? (role === "owner" ? row.requesterEmail : row.ownerEmail) : null,
      actions: allowedSwapActions(status, role),
    };
    (role === "owner" ? incoming : outgoing).push(view);
  }
  return { incoming, outgoing };
}
