import { beforeEach, describe, expect, it } from "vitest";
import { registerMember } from "@/server/auth";
import { type BrowseFilters, NO_FILTERS, browseQueryString, parseBrowseFilters } from "@/domain/browse";
import type { Db } from "@/server/db";
import { createPlant, getPlantDetails, listAvailablePlants, listCities, removePlant } from "@/server/plants";
import { freshDb, insertSwap, memberId, plantId, setPlantStatus } from "../helpers";

let db: Db;
beforeEach(async () => {
  db = await freshDb();
});

const names = (filters: Partial<BrowseFilters> = {}, viewerId?: string) =>
  listAvailablePlants(db, { ...NO_FILTERS, ...filters }, viewerId).map((p) => p.commonName);

function acceptMonsteraForPothosAndRemoveAloe() {
  insertSwap(db, { requester: "Alice", requested: "Monstera", offered: "Golden pothos", status: "ACCEPTED" });
  setPlantStatus(db, "Monstera", "RESERVED");
  setPlantStatus(db, "Golden pothos", "RESERVED");
  expect(removePlant(db, memberId(db, "Alice"), plantId(db, "Aloe vera")).ok).toBe(true);
}

describe("Browsing", () => {
  it("AC-BROWSE-1: a visitor sees the other six plants, newest first, with name, botanical name, type, form and city", () => {
    acceptMonsteraForPothosAndRemoveAloe();
    const plants = listAvailablePlants(db, NO_FILTERS);
    expect(plants.map((p) => p.commonName)).toEqual([
      "Sunflower",
      "Lavender",
      "Spider plant",
      "Snake plant",
      "Cherry tomato",
      "Basil",
    ]);
    expect(plants[0]).toMatchObject({
      commonName: "Sunflower",
      botanicalName: "Helianthus annuus",
      plantType: "FLOWER",
      form: "SEEDS",
      city: "Durham",
      isOwn: false,
    });
  });

  it("AC-BROWSE-2: search matches the common or the botanical name, ignoring letter case", () => {
    expect(names({ q: "monstera" })).toEqual(["Monstera"]);
    expect(names({ q: "PLANT" })).toEqual(["Spider plant", "Snake plant"]);
    expect(names({ q: "ocimum" })).toEqual(["Basil"]);
  });

  it("AC-BROWSE-2: search text is matched literally, so % and _ are not wildcards", () => {
    expect(names({ q: "%" })).toEqual([]);
    expect(names({ q: "_" })).toEqual([]);
  });

  it("AC-BROWSE-3: search and the three filters combine", () => {
    expect(names({ q: "plant", plantType: "HOUSEPLANT", form: "POTTED", city: "Raleigh" })).toEqual(["Snake plant"]);
  });

  it("AC-BROWSE-3: search text and filters survive the round trip through the page address", () => {
    const filters: BrowseFilters = { q: "plant", plantType: "HOUSEPLANT", form: "POTTED", city: "Raleigh" };
    const query = browseQueryString(filters);
    expect(query).toBe("q=plant&plantType=HOUSEPLANT&form=POTTED&city=Raleigh");
    expect(parseBrowseFilters(Object.fromEntries(new URLSearchParams(query)))).toEqual(filters);
    expect(browseQueryString(NO_FILTERS)).toBe("");
    expect(parseBrowseFilters({ plantType: "CARNIVOROUS", form: ["CUTTING", "SEEDS"], q: "  basil " })).toEqual({
      ...NO_FILTERS,
      q: "basil",
    });
  });

  it("AC-BROWSE-4: nothing matches zzzz", () => {
    expect(names({ q: "zzzz" })).toEqual([]);
  });

  it("AC-BROWSE-5: the plant's page shows the owner's name and city and never the email", () => {
    const result = getPlantDetails(db, plantId(db, "Monstera"));
    expect(result).toMatchObject({
      ok: true,
      data: {
        commonName: "Monstera",
        botanicalName: "Monstera deliciosa",
        plantType: "HOUSEPLANT",
        form: "CUTTING",
        status: "AVAILABLE",
        ownerName: "Ben",
        ownerCity: "Raleigh",
      },
    });
    expect(JSON.stringify(result)).not.toContain("ben@example.com");
  });

  it("AC-BROWSE-6: Alice's own plants are marked as hers in the list", () => {
    const plants = listAvailablePlants(db, NO_FILTERS, memberId(db, "Alice"));
    const own = plants.filter((p) => p.isOwn).map((p) => p.commonName);
    expect(own.sort()).toEqual(["Aloe vera", "Basil", "Golden pothos"]);
  });

  it("AC-BROWSE-7: a reserved plant's page shows its status; a removed plant's page reports not found", () => {
    acceptMonsteraForPothosAndRemoveAloe();
    expect(getPlantDetails(db, plantId(db, "Monstera"))).toMatchObject({ ok: true, data: { status: "RESERVED" } });
    expect(getPlantDetails(db, plantId(db, "Aloe vera"))).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("AC-BROWSE-8: the city filter offers each city with available plants once, in alphabetical order", async () => {
    expect(listCities(db)).toEqual(["Charlotte", "Durham", "Raleigh"]);
    expect(names({ city: "Durham" })).toEqual(["Sunflower", "Lavender", "Spider plant"]);

    const dana = await registerMember(db, { displayName: "Dana", email: "dana@example.com", city: "durham", password: "correct-horse-1" });
    if (!dana.ok) throw new Error("Dana could not register");
    expect(listCities(db)).toEqual(["Charlotte", "Durham", "Raleigh"]); // Dana has no plants yet
    createPlant(db, dana.data.id, { commonName: "Mint", botanicalName: "", plantType: "HERB", form: "CUTTING", description: "", healthConfirmed: true });
    expect(listCities(db)).toEqual(["Charlotte", "Durham", "Raleigh"]);
    expect(names({ city: "Durham" })).toEqual(["Mint", "Sunflower", "Lavender", "Spider plant"]);
    expect(names({ city: "DURHAM" })).toEqual(["Mint", "Sunflower", "Lavender", "Spider plant"]);
  });

  it("AC-BROWSE-8: a city whose members have no available plants is not offered", () => {
    for (const plant of ["Spider plant", "Lavender", "Sunflower"]) setPlantStatus(db, plant, "SWAPPED");
    expect(listCities(db)).toEqual(["Charlotte", "Raleigh"]);
  });

  it("AC-PLANT-1: a newly listed plant is first in the browse list, shown with the owner's city", () => {
    createPlant(db, memberId(db, "Alice"), {
      commonName: "Peace lily",
      botanicalName: "Spathiphyllum wallisii",
      plantType: "HOUSEPLANT",
      form: "POTTED",
      description: "",
      healthConfirmed: true,
    });
    expect(listAvailablePlants(db, NO_FILTERS)[0]).toMatchObject({ commonName: "Peace lily", city: "Charlotte" });
  });
});
