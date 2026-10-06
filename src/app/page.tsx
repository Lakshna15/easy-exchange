import { connection } from "next/server";
import { getDb } from "@/server/db";
import { countAvailablePlants } from "@/server/plants";

export default async function Home() {
  await connection(); // the count is live data: render it at request time, never at build time
  const count = countAvailablePlants(getDb());
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-semibold">Easy Exchange</h1>
      <p className="mt-4" data-testid="plant-count">
        {count} plants are waiting for a new home.
      </p>
    </main>
  );
}
