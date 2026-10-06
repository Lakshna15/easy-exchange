import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { openDatabase } from "@/server/db";
import { SEED_PASSWORD, resetDatabase, seedDatabase } from "@/server/seed";

describe("AC-NFR-4: fresh setup", () => {
  it("AC-NFR-4: the seed creates three members and nine available plants", async () => {
    const db = openDatabase(":memory:");
    await seedDatabase(db);

    const members = db.prepare("SELECT displayName, city FROM users ORDER BY displayName").all();
    expect(members).toEqual([
      { displayName: "Alice", city: "Charlotte" },
      { displayName: "Ben", city: "Raleigh" },
      { displayName: "Chidi", city: "Durham" },
    ]);
    const plants = db
      .prepare("SELECT commonName FROM plants WHERE status = 'AVAILABLE' ORDER BY createdAt DESC, rowid DESC")
      .all()
      .map((row) => row.commonName);
    expect(plants).toEqual([
      "Sunflower",
      "Lavender",
      "Spider plant",
      "Snake plant",
      "Cherry tomato",
      "Monstera",
      "Aloe vera",
      "Basil",
      "Golden pothos",
    ]);
  });

  it("AC-NFR-4: Alice's stored password is a hash that verifies against the seeded password", async () => {
    const db = openDatabase(":memory:");
    await seedDatabase(db);
    const row = db.prepare("SELECT passwordHash FROM users WHERE email = ?").get("alice@example.com") as {
      passwordHash: string;
    };
    expect(row.passwordHash).not.toBe(SEED_PASSWORD);
    expect(await bcrypt.compare(SEED_PASSWORD, row.passwordHash)).toBe(true);
  });

  it("AC-NFR-4: seeding twice does not duplicate the data", async () => {
    const db = openDatabase(":memory:");
    await seedDatabase(db);
    await expect(seedDatabase(db)).rejects.toThrow(/already has data/);
    expect(db.prepare("SELECT COUNT(*) AS n FROM plants").get()).toEqual({ n: 9 });
  });

  it("AC-NFR-4: resetting empties the database in place and seeds it again", async () => {
    const db = openDatabase(":memory:");
    await seedDatabase(db);
    db.prepare("UPDATE plants SET status = 'REMOVED' WHERE commonName = 'Basil'").run();
    db.prepare(
      "INSERT INTO users (id, email, displayName, city, passwordHash, createdAt) VALUES ('x', 'x@example.com', 'X', 'Y', 'h', '2026-01-01')",
    ).run();
    await resetDatabase(db);
    expect(db.prepare("SELECT COUNT(*) AS n FROM users").get()).toEqual({ n: 3 });
    expect(db.prepare("SELECT COUNT(*) AS n FROM plants WHERE status = 'AVAILABLE'").get()).toEqual({ n: 9 });
  });

  it("AC-NFR-4: .env.example lists every variable and .env is never committed", () => {
    const example = readFileSync(".env.example", "utf8");
    expect(example).toMatch(/^DATABASE_FILE=/m);
    expect(example).toMatch(/^SESSION_SECRET=/m);
    const ignored = readFileSync(".gitignore", "utf8").split("\n");
    expect(ignored).toContain(".env");
    expect(ignored).toContain("!.env.example");
  });
});
