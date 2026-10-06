"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import { emptyFormState } from "@/app/actions/form-state";
import { FormMessage, SubmitButton, TextField } from "@/components/form-controls";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, emptyFormState);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  return (
    <form key={state.submission} action={formAction} noValidate className="mt-8 space-y-5">
      <FormMessage message={state.message} />
      <TextField name="displayName" label="Display name" autoComplete="nickname" defaultValue={values.displayName} error={errors.displayName} hint="2 to 40 characters. Other members see this." />
      <TextField name="email" label="Email" type="email" autoComplete="email" defaultValue={values.email} error={errors.email} hint="Shown only to members whose swap with you is accepted." />
      <TextField name="city" label="City" autoComplete="address-level2" defaultValue={values.city} error={errors.city} hint="Where you can hand plants over. Shown on your plants." />
      <TextField name="password" label="Password" type="password" autoComplete="new-password" error={errors.password} hint="8 to 72 characters." />
      <SubmitButton>Create account</SubmitButton>
    </form>
  );
}
