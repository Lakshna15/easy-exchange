// npm run db:seed   -> creates the demo data in an empty database
// npm run db:reset  -> empties the local database in place, then seeds it again
import { DEFAULT_DATABASE_FILE, openDatabase } from "@/server/db";
import { SEED_MEMBERS, SEED_PASSWORD, resetDatabase, seedDatabase } from "@/server/seed";

try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: fall back to the defaults.
}

const file = process.env.DATABASE_FILE || DEFAULT_DATABASE_FILE;

const reset = process.argv.includes("--reset");

async function main() {
  const db = openDatabase(file);
  if (reset) await resetDatabase(db);
  else await seedDatabase(db);
  db.close();
  const plants = SEED_MEMBERS.reduce((sum, m) => sum + m.plants.length, 0);
  console.log(`Seeded ${file}: ${SEED_MEMBERS.length} members and ${plants} plants.`);
  console.log(`Log in as ${SEED_MEMBERS.map((m) => m.email).join(", ")} with the password ${SEED_PASSWORD}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
