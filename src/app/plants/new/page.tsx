import type { Metadata } from "next";
import { createPlantAction } from "@/app/actions/plants";
import { requireUser } from "@/server/session";
import { PlantForm } from "../PlantForm";

export const metadata: Metadata = { title: "List a plant · Easy Exchange" };

export default async function NewPlantPage() {
  await requireUser("/plants/new");
  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">List a plant</h1>
      <p className="mt-3 max-w-prose">
        One listing is one cutting, seedling, potted plant or packet of seeds. Other members can offer one of theirs for it.
      </p>
      <PlantForm action={createPlantAction} submitLabel="List this plant" />
    </div>
  );
}
