// Plant listings service (docs/specs/04-architecture.md: one service file per area).
import type { Db } from "@/server/db";

export function countAvailablePlants(db: Db): number {
  const row = db.prepare("SELECT COUNT(*) AS n FROM plants WHERE status = 'AVAILABLE'").get() as { n: number };
  return row.n;
}
