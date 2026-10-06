import { beforeEach, describe, expect, it } from "vitest";
import { NO_FILTERS } from "@/domain/browse";
import { SWAP_ACTIONS, type SwapAction } from "@/domain/swaps";
import { registerMember } from "@/server/auth";
import type { Db } from "@/server/db";
import { listAvailablePlants, listShelf } from "@/server/plants";
import { actOnSwap, getRequestOptions, listSwaps, requestSwap } from "@/server/swaps";
import { count, freshDb, insertSwap, memberId, plantId, plantStatus, setPlantStatus } from "../helpers";

let db: Db;
let alice: string, ben: string, chidi: string;
beforeEach(async () => {
  db = await freshDb();
  alice = memberId(db, "Alice");
  ben = memberId(db, "Ben");
  chidi = memberId(db, "Chidi");
});

const request = (requester: string, requested: string, offered: string, message = "") =>
  requestSwap(db, requester, { requestedPlantId: plantId(db, requested), offeredPlantId: plantId(db, offered), message });

function mustRequest(requester: string, requested: string, offered: string, message = ""): string {
  const result = request(requester, requested, offered, message);
  if (!result.ok) throw new Error(`request failed: ${result.message}`);
  return result.data.id;
}

const swapStatus = (id: string) => (db.prepare("SELECT status FROM swaps WHERE id = ?").get(id) as { status: string }).status;
const browseNames = () => listAvailablePlants(db, NO_FILTERS).map((p) => p.commonName);
const snapshot = () => JSON.stringify([db.prepare("SELECT * FROM swaps ORDER BY id").all(), db.prepare("SELECT * FROM plants ORDER BY id").all()]);

function acceptedPothosForMonstera(): string {
  const id = mustRequest(alice, "Monstera", "Golden pothos");
  expect(actOnSwap(db, ben, id, "accept")).toMatchObject({ ok: true });
  return id;
}

describe("Swaps", () => {
  it("AC-SWAP-1: Alice requests Monstera offering Golden pothos; it is outgoing for Alice and incoming for Ben", () => {
    const id = mustRequest(alice, "Monstera", "Golden pothos", "Happy to meet at the farmers market");
    expect(swapStatus(id)).toBe("PENDING");
    const outgoing = listSwaps(db, alice).outgoing;
    expect(outgoing).toHaveLength(1);
    expect(outgoing[0]).toMatchObject({
      status: "PENDING",
      theirPlant: { commonName: "Monstera" },
      yourPlant: { commonName: "Golden pothos" },
      otherName: "Ben",
      message: "Happy to meet at the farmers market",
    });
    expect(listSwaps(db, ben).incoming[0]).toMatchObject({
      theirPlant: { commonName: "Golden pothos" },
      yourPlant: { commonName: "Monstera" },
      otherName: "Alice",
      message: "Happy to meet at the farmers market",
    });
    expect(plantStatus(db, "Monstera")).toBe("AVAILABLE");
    expect(plantStatus(db, "Golden pothos")).toBe("AVAILABLE");
  });

  it("AC-SWAP-1: a message over 500 characters is refused on the message field", () => {
    expect(request(alice, "Monstera", "Golden pothos", "x".repeat(501))).toMatchObject({
      ok: false,
      code: "VALIDATION",
      fieldErrors: { message: expect.any(String) },
    });
    expect(request(alice, "Monstera", "Golden pothos", "x".repeat(500)).ok).toBe(true);
  });

  it("AC-SWAP-2: requesting your own plant or offering someone else's is FORBIDDEN", () => {
    expect(request(alice, "Golden pothos", "Basil")).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(request(alice, "Monstera", "Cherry tomato")).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(count(db, "swaps")).toBe(0);
  });

  it("AC-SWAP-2: requesting or offering a plant that is not AVAILABLE is a CONFLICT", () => {
    setPlantStatus(db, "Monstera", "RESERVED");
    expect(request(alice, "Monstera", "Basil")).toMatchObject({ ok: false, code: "CONFLICT" });
    setPlantStatus(db, "Monstera", "AVAILABLE");
    setPlantStatus(db, "Golden pothos", "RESERVED");
    expect(request(alice, "Monstera", "Golden pothos")).toMatchObject({ ok: false, code: "CONFLICT" });
    expect(count(db, "swaps")).toBe(0);
  });

  it("AC-SWAP-3: one pending request per plant; after cancelling, the same request succeeds", () => {
    const first = mustRequest(alice, "Monstera", "Golden pothos");
    expect(request(alice, "Monstera", "Basil")).toMatchObject({ ok: false, code: "CONFLICT" });
    expect(actOnSwap(db, alice, first, "cancel")).toMatchObject({ ok: true });
    expect(request(alice, "Monstera", "Basil").ok).toBe(true);
  });

  it("AC-SWAP-4: a member with no AVAILABLE plants has nothing to offer", async () => {
    const dana = await registerMember(db, { displayName: "Dana", email: "dana@example.com", city: "Asheville", password: "correct-horse-1" });
    if (!dana.ok) throw new Error("Dana could not register");
    expect(getRequestOptions(db, dana.data.id)).toEqual([]);
    expect(getRequestOptions(db, alice).map((p) => p.commonName)).toEqual(["Aloe vera", "Basil", "Golden pothos"]);
  });

  it("AC-SWAP-5: Ben declines; the swap is DECLINED and both plants stay AVAILABLE", () => {
    const id = mustRequest(alice, "Monstera", "Golden pothos");
    expect(actOnSwap(db, ben, id, "decline")).toMatchObject({ ok: true, data: { status: "DECLINED" } });
    expect(swapStatus(id)).toBe("DECLINED");
    expect([plantStatus(db, "Monstera"), plantStatus(db, "Golden pothos")]).toEqual(["AVAILABLE", "AVAILABLE"]);
  });

  it("AC-SWAP-6: accepting reserves both plants and cancels every competing pending request", () => {
    const alicesMonstera = mustRequest(alice, "Monstera", "Golden pothos");
    const chidisMonstera = mustRequest(chidi, "Monstera", "Sunflower");
    const alicesLavender = mustRequest(alice, "Lavender", "Golden pothos");

    expect(actOnSwap(db, ben, alicesMonstera, "accept")).toMatchObject({ ok: true, data: { status: "ACCEPTED" } });

    expect(swapStatus(alicesMonstera)).toBe("ACCEPTED");
    expect([plantStatus(db, "Monstera"), plantStatus(db, "Golden pothos")]).toEqual(["RESERVED", "RESERVED"]);
    expect([swapStatus(chidisMonstera), swapStatus(alicesLavender)]).toEqual(["CANCELLED", "CANCELLED"]);
    expect([plantStatus(db, "Sunflower"), plantStatus(db, "Lavender")]).toEqual(["AVAILABLE", "AVAILABLE"]);
    expect(browseNames()).not.toContain("Monstera");
    expect(browseNames()).not.toContain("Golden pothos");
  });

  it("AC-SWAP-6: if a plant stopped being AVAILABLE before the accept, nothing changes at all", () => {
    const id = mustRequest(alice, "Monstera", "Golden pothos");
    const other = mustRequest(chidi, "Monstera", "Sunflower");
    setPlantStatus(db, "Golden pothos", "SWAPPED"); // breaks invariant 2 on purpose, to test the re-check
    const before = snapshot();
    expect(actOnSwap(db, ben, id, "accept")).toMatchObject({ ok: false, code: "CONFLICT" });
    expect(snapshot()).toBe(before);
    expect(swapStatus(other)).toBe("PENDING");
  });

  it("AC-SWAP-7: accepting a request that was cancelled by another acceptance changes nothing", () => {
    const alicesMonstera = mustRequest(alice, "Monstera", "Golden pothos");
    const chidisMonstera = mustRequest(chidi, "Monstera", "Sunflower");
    actOnSwap(db, ben, alicesMonstera, "accept");
    const before = snapshot();
    expect(actOnSwap(db, ben, chidisMonstera, "accept")).toMatchObject({ ok: false, code: "CONFLICT" });
    expect(snapshot()).toBe(before);
  });

  it("AC-SWAP-8: the requester cancels a pending request; no plant changes", () => {
    const id = mustRequest(alice, "Monstera", "Golden pothos");
    expect(actOnSwap(db, alice, id, "cancel")).toMatchObject({ ok: true, data: { status: "CANCELLED" } });
    expect([plantStatus(db, "Monstera"), plantStatus(db, "Golden pothos")]).toEqual(["AVAILABLE", "AVAILABLE"]);
  });

  it.each([["Alice"], ["Ben"]])("AC-SWAP-9: %s cancels an accepted swap; both plants are AVAILABLE and back in the list", (who) => {
    const id = acceptedPothosForMonstera();
    expect(actOnSwap(db, memberId(db, who), id, "cancel")).toMatchObject({ ok: true, data: { status: "CANCELLED" } });
    expect([plantStatus(db, "Monstera"), plantStatus(db, "Golden pothos")]).toEqual(["AVAILABLE", "AVAILABLE"]);
    expect(browseNames()).toEqual(expect.arrayContaining(["Monstera", "Golden pothos"]));
  });

  it.each([["Alice"], ["Ben"]])("AC-SWAP-10: %s marks an accepted swap completed; both plants are SWAPPED", (who) => {
    const id = acceptedPothosForMonstera();
    expect(actOnSwap(db, memberId(db, who), id, "complete")).toMatchObject({ ok: true, data: { status: "COMPLETED" } });
    expect([plantStatus(db, "Monstera"), plantStatus(db, "Golden pothos")]).toEqual(["SWAPPED", "SWAPPED"]);
    expect(listShelf(db, alice).find((p) => p.commonName === "Golden pothos")?.status).toBe("SWAPPED");
    expect(listShelf(db, ben).find((p) => p.commonName === "Monstera")?.status).toBe("SWAPPED");
    expect(browseNames()).not.toContain("Monstera");
    expect(browseNames()).not.toContain("Golden pothos");
  });

  it("AC-SWAP-11: finished swaps never change, whoever asks and whatever the action", () => {
    const declined = mustRequest(alice, "Monstera", "Golden pothos");
    actOnSwap(db, ben, declined, "decline");
    const cancelled = mustRequest(alice, "Snake plant", "Basil");
    actOnSwap(db, alice, cancelled, "cancel");
    const completed = mustRequest(chidi, "Cherry tomato", "Sunflower");
    actOnSwap(db, ben, completed, "accept");
    actOnSwap(db, chidi, completed, "complete");
    const before = snapshot();
    for (const [id, participants] of [[declined, [alice, ben]], [cancelled, [alice, ben]], [completed, [chidi, ben]]] as const) {
      for (const actor of participants) {
        for (const action of SWAP_ACTIONS) {
          expect(actOnSwap(db, actor, id, action), `${action}`).toMatchObject({ ok: false, code: "CONFLICT" });
        }
      }
    }
    expect(snapshot()).toBe(before);
  });

  it("AC-SWAP-12: the other participant's email appears only while the swap is ACCEPTED or COMPLETED", () => {
    const id = mustRequest(alice, "Monstera", "Golden pothos");
    expect(listSwaps(db, alice).outgoing[0].otherEmail).toBeNull();
    expect(listSwaps(db, ben).incoming[0].otherEmail).toBeNull();
    expect(JSON.stringify(listSwaps(db, alice))).not.toContain("ben@example.com");
    expect(JSON.stringify(listSwaps(db, ben))).not.toContain("alice@example.com");

    actOnSwap(db, ben, id, "accept");
    expect(listSwaps(db, alice).outgoing[0].otherEmail).toBe("ben@example.com");
    expect(listSwaps(db, ben).incoming[0].otherEmail).toBe("alice@example.com");
    actOnSwap(db, alice, id, "complete");
    expect(listSwaps(db, alice).outgoing[0].otherEmail).toBe("ben@example.com");
    expect(listSwaps(db, ben).incoming[0].otherEmail).toBe("alice@example.com");

    const declined = mustRequest(chidi, "Snake plant", "Lavender");
    actOnSwap(db, ben, declined, "decline");
    const cancelled = mustRequest(chidi, "Basil", "Spider plant");
    actOnSwap(db, chidi, cancelled, "cancel");
    expect(JSON.stringify(listSwaps(db, chidi))).not.toMatch(/(ben|alice)@example\.com/);
  });

  it("AC-SWAP-13: the wrong person or the wrong role is FORBIDDEN, and the swap stays private", () => {
    const id = mustRequest(alice, "Monstera", "Golden pothos");
    for (const [actor, action] of [[chidi, "accept"], [alice, "accept"], [ben, "cancel"]] as [string, SwapAction][]) {
      expect(actOnSwap(db, actor, id, action)).toMatchObject({ ok: false, code: "FORBIDDEN" });
    }
    expect(swapStatus(id)).toBe("PENDING");
    expect(listSwaps(db, chidi)).toEqual({ incoming: [], outgoing: [] });
  });

  it("AC-SWAP-13: an unknown swap is NOT_FOUND", () => {
    expect(actOnSwap(db, ben, "no-such-swap", "accept")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("AC-SWAP-14: each participant is offered exactly the actions in the F4 table", () => {
    const statuses = {
      PENDING: insertSwap(db, { requester: "Alice", requested: "Monstera", offered: "Golden pothos" }),
      ACCEPTED: insertSwap(db, { requester: "Alice", requested: "Snake plant", offered: "Basil", status: "ACCEPTED" }),
      COMPLETED: insertSwap(db, { requester: "Alice", requested: "Cherry tomato", offered: "Aloe vera", status: "COMPLETED" }),
      DECLINED: insertSwap(db, { requester: "Chidi", requested: "Monstera", offered: "Lavender", status: "DECLINED" }),
      CANCELLED: insertSwap(db, { requester: "Chidi", requested: "Snake plant", offered: "Sunflower", status: "CANCELLED" }),
    };
    const expected = {
      PENDING: { owner: ["accept", "decline"], requester: ["cancel"] },
      ACCEPTED: { owner: ["cancel", "complete"], requester: ["cancel", "complete"] },
      COMPLETED: { owner: [], requester: [] },
      DECLINED: { owner: [], requester: [] },
      CANCELLED: { owner: [], requester: [] },
    };
    const benIncoming = listSwaps(db, ben).incoming;
    const requesterViews = [...listSwaps(db, alice).outgoing, ...listSwaps(db, chidi).outgoing];
    for (const [status, id] of Object.entries(statuses) as [keyof typeof expected, string][]) {
      expect(benIncoming.find((s) => s.id === id)?.actions, `${status} owner`).toEqual(expected[status].owner);
      expect(requesterViews.find((s) => s.id === id)?.actions, `${status} requester`).toEqual(expected[status].requester);
    }
  });

  it("REQ-SWAP-11: incoming and outgoing swaps are listed separately, newest first", () => {
    const first = mustRequest(alice, "Monstera", "Golden pothos");
    const second = mustRequest(alice, "Lavender", "Basil");
    const third = mustRequest(chidi, "Basil", "Sunflower");
    expect(listSwaps(db, alice).outgoing.map((s) => s.id)).toEqual([second, first]);
    expect(listSwaps(db, alice).incoming.map((s) => s.id)).toEqual([third]);
  });
});
