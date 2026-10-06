import type { Metadata } from "next";
import Link from "next/link";
import { PlantTag, PlantTagGrid } from "@/components/PlantTag";
import { StatusBadge } from "@/components/StatusBadge";
import { getDb } from "@/server/db";
import { listShelf } from "@/server/plants";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Your shelf · Easy Exchange" };

// F2, REQ-PLANT-8: the member's plants that are not removed, with their status, newest first.
export default async function ShelfPage() {
  const user = await requireUser("/shelf");
  const plants = listShelf(getDb(), user.id);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl font-semibold">Your shelf</h1>
        {plants.length > 0 && (
          <Link href="/plants/new" className="rounded-md bg-leaf px-4 py-2 font-medium text-white hover:bg-leaf-dark">
            List a plant
          </Link>
        )}
      </div>
      {plants.length === 0 ? (
        <div className="mt-6 max-w-prose">
          <p>
            Nothing on your shelf yet. A listing is one cutting, seedling, potted plant or packet of seeds that you are happy
            to swap. Other members see it and can offer one of theirs for it.
          </p>
          <p className="mt-6">
            <Link href="/plants/new" className="rounded-md bg-leaf px-5 py-2.5 font-medium text-white hover:bg-leaf-dark">
              List your first plant
            </Link>
          </p>
        </div>
      ) : (
        <PlantTagGrid label="Your plants">
          {plants.map((plant) => (
            <PlantTag
              key={plant.id}
              {...plant}
              city={user.city}
              badges={<StatusBadge status={plant.status} />}
              actions={
                plant.status === "AVAILABLE" ? (
                  <Link href={`/plants/${plant.id}/edit`} className="font-medium text-leaf underline underline-offset-4">
                    Edit {plant.commonName}
                  </Link>
                ) : (
                  <span className="text-sm text-slate">
                    {plant.status === "RESERVED" ? "Reserved for an accepted swap" : "Swapped"}
                  </span>
                )
              }
            />
          ))}
        </PlantTagGrid>
      )}
    </div>
  );
}
