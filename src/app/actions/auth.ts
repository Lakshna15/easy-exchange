"use server";

import { redirect } from "next/navigation";
import { safeReturnPath } from "@/domain/navigation";
import { registerMember, verifyLogin } from "@/server/auth";
import { getDb } from "@/server/db";
import { endSession, startSession } from "@/server/session";
import { type FormState, rejected, textField } from "./form-state";

// F1: after registering, the member lands on /shelf (REQ-AUTH-1).
export async function registerAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = {
    displayName: textField(formData, "displayName"),
    email: textField(formData, "email"),
    city: textField(formData, "city"),
  };
  const result = await registerMember(getDb(), { ...values, password: textField(formData, "password") });
  if (!result.ok) return rejected(result, values);
  await startSession(result.data.id);
  redirect("/shelf");
}

// F1: after logging in, the member lands on the page they came from, or on / (REQ-AUTH-4, REQ-AUTH-6).
export async function loginAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = { email: textField(formData, "email") };
  const next = safeReturnPath(textField(formData, "next"));
  const result = await verifyLogin(getDb(), { email: values.email, password: textField(formData, "password") });
  if (!result.ok) return rejected(result, values);
  await startSession(result.data.id);
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}
