import type { PlantStatus, SwapStatus } from "@/domain/constants";
import { PLANT_STATUS_LABELS, SWAP_STATUS_LABELS } from "@/domain/constants";

// Colour carries meaning (docs/DESIGN.md, principle 3): leaf = available or going ahead,
// marigold = reserved or waiting, grey = finished.
const tone: Record<string, string> = {
  AVAILABLE: "bg-leaf/12 text-leaf",
  ACCEPTED: "bg-leaf/12 text-leaf",
  RESERVED: "bg-marigold/25 text-ink",
  PENDING: "bg-marigold/25 text-ink",
  SWAPPED: "bg-slate/15 text-slate",
  COMPLETED: "bg-slate/15 text-slate",
  DECLINED: "bg-slate/15 text-slate",
  CANCELLED: "bg-slate/15 text-slate",
  REMOVED: "bg-slate/15 text-slate",
};

export function StatusBadge({ status }: { status: PlantStatus | SwapStatus }) {
  const label = status in PLANT_STATUS_LABELS ? PLANT_STATUS_LABELS[status as PlantStatus] : SWAP_STATUS_LABELS[status as SwapStatus];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${tone[status]}`}>{label}</span>;
}

export function YourPlantBadge() {
  return <span className="inline-block rounded-full border border-marigold px-2.5 py-0.5 text-sm font-medium">Your plant</span>;
}
