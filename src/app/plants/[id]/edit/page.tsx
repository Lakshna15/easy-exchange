import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePlantAction } from "@/app/actions/plants";
import { getDb } from "@/server/db";
import { getPlantForEdit } from "@/server/plants";
import { requireUser } from "@/server/session";
import { PlantForm } from "../../PlantForm";
import { RemovePlant } from "./RemovePlant";

export const metadata: Metadata = { title: "Edit plant · Easy Exchange" };

export default async function EditPlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/plants/${id}/edit`);
  const result = getPlantForEdit(getDb(), user.id, id);
  if (!result.ok && result.code === "NOT_FOUND") notFound();

  if (!result.ok) {
    // AC-PLANT-4: someone else's plant
    return (
      <div className="max-w-prose">
        <h1 className="font-serif text-4xl font-semibold">Edit plant</h1>
        <p role="alert" className="mt-6 border-l-4 border-beet bg-white px-4 py-3">
          Only the owner can edit this plant.
        </p>
        <p className="mt-6">
          <Link href={`/plants/${id}`} className="underline">
            Back to the plant
          </Link>
        </p>
      </div>
    );
  }

  const plant = result.data;
  return (
    <div>
      <p>
        <Link href={`/plants/${plant.id}`} className="underline">
          Back to {plant.commonName}
        </Link>
      </p>
      <h1 className="mt-4 font-serif text-4xl font-semibold">Edit {plant.commonName}</h1>
      {plant.status === "AVAILABLE" ? (
        <>
          <PlantForm
            action={updatePlantAction.bind(null, plant.id)}
            submitLabel="Save changes"
            initial={{
              commonName: plant.commonName,
              botanicalName: plant.botanicalName ?? "",
              plantType: plant.plantType,
              form: plant.form,
              description: plant.description ?? "",
            }}
          />
          <RemovePlant plantId={plant.id} commonName={plant.commonName} />
        </>
      ) : (
        // F2: a plant that cannot be edited shows the reason instead of the form
        <p className="mt-6 max-w-prose border-l-4 border-marigold bg-white px-4 py-3">
          {plant.status === "RESERVED"
            ? "This plant is reserved for an accepted swap, so it can't be edited or removed. If the swap is cancelled, it becomes available again."
            : "This plant has been swapped, so it can't be edited or removed."}
        </p>
      )}
    </div>
  );
}
