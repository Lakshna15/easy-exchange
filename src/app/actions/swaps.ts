"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { SWAP_ACTIONS, type SwapAction } from "@/domain/swaps";
import { getDb } from "@/server/db";
import { getCurrentUser } from "@/server/session";
import { actOnSwap, requestSwap } from "@/server/swaps";
import { type FormState, rejected, textField } from "./form-state";

const SIGNED_OUT = "Your session has ended. Log in again to continue.";

// F4: after a successful request, the member lands on /swaps.
export async function requestSwapAction(requestedPlantId: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: SIGNED_OUT };
  const values = { offeredPlantId: textField(formData, "offeredPlantId"), message: textField(formData, "message") };
  const result = requestSwap(getDb(), user.id, { requestedPlantId, ...values });
  if (!result.ok) return rejected(result, values);
  redirect("/swaps");
}

// F4: Accept, Decline, Cancel and Mark completed take effect immediately. The clicked button names the step.
export async function swapStepAction(swapId: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: SIGNED_OUT };
  const step = textField(formData, "step");
  if (!(SWAP_ACTIONS as readonly string[]).includes(step)) return { message: "That action isn't available." };
  const result = actOnSwap(getDb(), user.id, swapId, step as SwapAction);
  if (!result.ok) return { message: result.message, submission: Date.now() };
  refresh();
  return {};
}
