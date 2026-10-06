"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/server/db";
import { createPlant, removePlant, updatePlant } from "@/server/plants";
import { getCurrentUser } from "@/server/session";
import { type FormState, rejected, textField } from "./form-state";

const SIGNED_OUT = "Your session has ended. Log in again to continue.";

function plantValues(formData: FormData) {
  return {
    commonName: textField(formData, "commonName"),
    botanicalName: textField(formData, "botanicalName"),
    plantType: textField(formData, "plantType"),
    form: textField(formData, "form"),
    description: textField(formData, "description"),
    healthConfirmed: textField(formData, "healthConfirmed") === "on" ? "on" : "",
  };
}

const toInput = (values: ReturnType<typeof plantValues>) => ({ ...values, healthConfirmed: values.healthConfirmed === "on" });

// F2: after listing, the member lands on the plant's page.
export async function createPlantAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: SIGNED_OUT };
  const values = plantValues(formData);
  const result = createPlant(getDb(), user.id, toInput(values));
  if (!result.ok) return rejected(result, values);
  redirect(`/plants/${result.data.id}`);
}

// F2: after editing, the member lands on the plant's page.
export async function updatePlantAction(plantId: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: SIGNED_OUT };
  const values = plantValues(formData);
  const result = updatePlant(getDb(), user.id, plantId, toInput(values));
  if (!result.ok) return rejected(result, values);
  redirect(`/plants/${plantId}`);
}

// F2: after removing, the member lands on /shelf.
export async function removePlantAction(plantId: string): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: SIGNED_OUT };
  const result = removePlant(getDb(), user.id, plantId);
  if (!result.ok) return { message: result.message };
  redirect("/shelf");
}
