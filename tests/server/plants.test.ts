import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/server/db";
import { createPlant, getPlantDetails, getPlantForEdit, listShelf, removePlant, updatePlant } from "@/server/plants";
import { count, freshDb, insertSwap, memberId, plantId, plantRow, plantStatus, setPlantStatus } from "../helpers";

let db: Db;
let alice: string;
let ben: string;
beforeEach(async () => {
  db = await freshDb();
  alice = memberId(db, "Alice");
  ben = memberId(db, "Ben");
});

const peaceLily = {
  commonName: "Peace lily",
  botanicalName: "Spathiphyllum wallisii",
  plantType: "HOUSEPLANT",
  form: "POTTED",
  description: "",
  healthConfirmed: true,
};

const basilEdit = {
  commonName: "Basil",
  botanicalName: "Ocimum basilicum",
  plantType: "HERB",
  form: "POTTED",
  description: "",
  healthConfirmed: true,
};

describe("Plant listings", () => {
  it("AC-PLANT-1: Alice lists Peace lily; it is first on her shelf, AVAILABLE and hers", () => {
    const result = createPlant(db, alice, peaceLily);
    expect(result.ok).toBe(true);
    const shelf = listShelf(db, alice);
    expect(shelf[0]).toMatchObject({
      commonName: "Peace lily",
      botanicalName: "Spathiphyllum wallisii",
      plantType: "HOUSEPLANT",
      form: "POTTED",
      description: null,
      status: "AVAILABLE",
    });
    expect(plantRow(db, "Peace lily").ownerId).toBe(alice);
  });

  it("AC-PLANT-2: invalid listings are refused with an error on the field, and no plant is created", () => {
    const cases = [
      [{ commonName: "" }, "commonName"],
      [{ commonName: "x".repeat(81) }, "commonName"],
      [{ plantType: "CARNIVOROUS" }, "plantType"],
      [{ form: "GRAFT" }, "form"],
      [{ healthConfirmed: false }, "healthConfirmed"],
      [{ botanicalName: "x".repeat(121) }, "botanicalName"],
      [{ description: "x".repeat(1001) }, "description"],
    ] as const;
    for (const [change, field] of cases) {
      const result = createPlant(db, alice, { ...peaceLily, ...change });
      expect(result, field).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { [field]: expect.any(String) } });
    }
    expect(count(db, "plants")).toBe(9);
    expect(createPlant(db, alice, { ...peaceLily, commonName: "x".repeat(80), description: "y".repeat(1000) }).ok).toBe(true);
  });

  it("AC-PLANT-3: Alice changes Basil from Seedling to Potted plant, confirming its health", () => {
    expect(updatePlant(db, alice, plantId(db, "Basil"), basilEdit)).toMatchObject({ ok: true });
    expect(plantRow(db, "Basil").form).toBe("POTTED");
    const details = getPlantDetails(db, plantId(db, "Basil"));
    expect(details).toMatchObject({ ok: true, data: { form: "POTTED" } });
  });

  it("AC-PLANT-3: the same edit without the health confirmation is refused and Basil is unchanged", () => {
    const result = updatePlant(db, alice, plantId(db, "Basil"), { ...basilEdit, healthConfirmed: false });
    expect(result).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { healthConfirmed: expect.any(String) } });
    expect(plantRow(db, "Basil").form).toBe("SEEDLING");
  });

  it("AC-PLANT-4: Ben cannot open, edit or remove Alice's Golden pothos", () => {
    const pothos = plantId(db, "Golden pothos");
    const before = plantRow(db, "Golden pothos");
    expect(getPlantForEdit(db, ben, pothos)).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(updatePlant(db, ben, pothos, { ...basilEdit, commonName: "Mine now" })).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(removePlant(db, ben, pothos)).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(plantRow(db, "Golden pothos")).toEqual(before);
  });

  it("AC-PLANT-5: a reserved plant cannot be edited or removed", () => {
    insertSwap(db, { requester: "Alice", requested: "Monstera", offered: "Golden pothos", status: "ACCEPTED" });
    setPlantStatus(db, "Golden pothos", "RESERVED");
    setPlantStatus(db, "Monstera", "RESERVED");
    const pothos = plantId(db, "Golden pothos");
    const before = plantRow(db, "Golden pothos");
    expect(updatePlant(db, alice, pothos, { ...basilEdit, commonName: "Golden pothos" })).toMatchObject({ ok: false, code: "CONFLICT" });
    expect(removePlant(db, alice, pothos)).toMatchObject({ ok: false, code: "CONFLICT" });
    expect(plantRow(db, "Golden pothos")).toEqual(before);
  });

  it("AC-PLANT-6: removing Aloe vera takes it off the shelf, its page reports not found, and the record stays as REMOVED", () => {
    expect(removePlant(db, alice, plantId(db, "Aloe vera"))).toMatchObject({ ok: true });
    expect(listShelf(db, alice).map((p) => p.commonName)).not.toContain("Aloe vera");
    expect(getPlantDetails(db, plantId(db, "Aloe vera"))).toMatchObject({ ok: false, code: "NOT_FOUND" });
    expect(plantStatus(db, "Aloe vera")).toBe("REMOVED");
  });

  it("AC-PLANT-7: a plant in a pending swap cannot be removed, and the message names the swap", () => {
    insertSwap(db, { requester: "Alice", requested: "Monstera", offered: "Golden pothos" });
    const byAlice = removePlant(db, alice, plantId(db, "Golden pothos"));
    const byBen = removePlant(db, ben, plantId(db, "Monstera"));
    for (const result of [byAlice, byBen]) {
      expect(result).toMatchObject({ ok: false, code: "CONFLICT" });
      if (!result.ok) {
        expect(result.message).toContain("pending swap");
        expect(result.message).toContain("Golden pothos");
        expect(result.message).toContain("Monstera");
      }
    }
    expect(plantStatus(db, "Golden pothos")).toBe("AVAILABLE");
    expect(plantStatus(db, "Monstera")).toBe("AVAILABLE");
  });

  it("REQ-PLANT-8: the shelf shows the member's plants that are not removed, with status, newest first", () => {
    setPlantStatus(db, "Basil", "SWAPPED");
    removePlant(db, alice, plantId(db, "Aloe vera"));
    createPlant(db, alice, peaceLily);
    expect(listShelf(db, alice).map((p) => [p.commonName, p.status])).toEqual([
      ["Peace lily", "AVAILABLE"],
      ["Basil", "SWAPPED"],
      ["Golden pothos", "AVAILABLE"],
    ]);
  });
});
