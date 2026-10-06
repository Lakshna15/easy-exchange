"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { emptyFormState } from "@/app/actions/form-state";
import { FormMessage, SubmitButton, TextField } from "@/components/form-controls";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(loginAction, emptyFormState);
  return (
    <form key={state.submission} action={formAction} noValidate className="mt-8 space-y-5">
      <FormMessage message={state.message} />
      <input type="hidden" name="next" value={next} />
      <TextField name="email" label="Email" type="email" autoComplete="email" defaultValue={state.values?.email} />
      <TextField name="password" label="Password" type="password" autoComplete="current-password" />
      <SubmitButton>Log in</SubmitButton>
    </form>
  );
}
