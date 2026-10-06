// What a Server Action hands back to a form: a message, per-field errors, and the values to show again
// so a rejected form keeps what the user typed (REQ-NFR-1). Passwords are never sent back.
import type { Failure } from "@/server/result";

export type FormState = {
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  /** Changes on every rejected submission, so the form re-renders with `values`. */
  submission?: number;
};

export const emptyFormState: FormState = {};

export function textField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function rejected(failure: Failure, values: Record<string, string>): FormState {
  return { message: failure.message, fieldErrors: failure.fieldErrors, values, submission: Date.now() };
}
