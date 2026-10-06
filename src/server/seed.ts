// The example data from docs/specs/05-behavior.md, "Example data".
import bcrypt from "bcryptjs";
import type { PlantForm, PlantType } from "@/domain/constants";
import { type Db, newId, withTransaction } from "@/server/db";

export const SEED_PASSWORD = "grow-together-1";

type SeedPlant = { commonName: string; botanicalName: string; plantType: PlantType; form: PlantForm };
type SeedMember = { displayName: string; email: string; city: string; plants: SeedPlant[] };

export const SEED_MEMBERS: SeedMember[] = [
  {
    displayName: "Alice",
    email: "alice@example.com",
    city: "Charlotte",
    plants: [
      { commonName: "Golden pothos", botanicalName: "Epipremnum aureum", plantType: "HOUSEPLANT", form: "CUTTING" },
      { commonName: "Basil", botanicalName: "Ocimum basilicum", plantType: "HERB", form: "SEEDLING" },
      { commonName: "Aloe vera", botanicalName: "Aloe vera", plantType: "SUCCULENT_CACTUS", form: "POTTED" },
    ],
  },
  {
    displayName: "Ben",
    email: "ben@example.com",
    city: "Raleigh",
    plants: [
      { commonName: "Monstera", botanicalName: "Monstera deliciosa", plantType: "HOUSEPLANT", form: "CUTTING" },
      { commonName: "Cherry tomato", botanicalName: "Solanum lycopersicum", plantType: "VEGETABLE", form: "SEEDS" },
      { commonName: "Snake plant", botanicalName: "Dracaena trifasciata", plantType: "HOUSEPLANT", form: "POTTED" },
    ],
  },
  {
    displayName: "Chidi",
    email: "chidi@example.com",
    city: "Durham",
    plants: [
      { commonName: "Spider plant", botanicalName: "Chlorophytum comosum", plantType: "HOUSEPLANT", form: "POTTED" },
      { commonName: "Lavender", botanicalName: "Lavandula angustifolia", plantType: "HERB", form: "SEEDLING" },
      { commonName: "Sunflower", botanicalName: "Helianthus annuus", plantType: "FLOWER", form: "SEEDS" },
    ],
  },
];

/**
 * Empties every table in place, then seeds again. The file is kept, so a running app keeps a valid handle
 * (deleting the file under a running app makes SQLite refuse its writes).
 */
export async function resetDatabase(db: Db): Promise<void> {
  withTransaction(db, () => {
    db.exec("DELETE FROM swaps; DELETE FROM plants; DELETE FROM users;");
  });
  await seedDatabase(db);
}

/** Creates the three demo members and their nine plants, oldest (Golden pothos) to newest (Sunflower). */
export async function seedDatabase(db: Db): Promise<void> {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (existing.n > 0) {
    throw new Error("The database already has data. Run `npm run db:reset` to start again from the seed.");
  }
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const start = Date.now() - 60 * 60 * 1000; // one hour ago, one minute apart
  let minute = 0;
  const at = () => new Date(start + minute++ * 60 * 1000).toISOString();

  withTransaction(db, () => {
    const insertUser = db.prepare(
      "INSERT INTO users (id, email, displayName, city, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    );
    const insertPlant = db.prepare(
      `INSERT INTO plants (id, ownerId, commonName, botanicalName, plantType, form, description, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 'AVAILABLE', ?, ?)`,
    );
    for (const member of SEED_MEMBERS) {
      const userId = newId();
      insertUser.run(userId, member.email, member.displayName, member.city, passwordHash, at());
      for (const plant of member.plants) {
        const time = at();
        insertPlant.run(newId(), userId, plant.commonName, plant.botanicalName, plant.plantType, plant.form, time, time);
      }
    }
  });
}
