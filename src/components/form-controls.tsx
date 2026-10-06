"use client";

// Form controls with visible labels and errors tied to their field (REQ-NFR-1, REQ-NFR-4).
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

const inputClass =
  "mt-1 block w-full rounded-md border border-stem bg-white px-3 py-2 text-base text-ink " +
  "aria-[invalid=true]:border-beet";

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; className: string }) => ReactNode;
};

export function Field({ name, label, error, hint, children }: FieldProps) {
  const id = `field-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-slate">
          {hint}
        </p>
      )}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy, className: inputClass })}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-beet">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
};

export function TextField({ name, label, type = "text", error, hint, ...input }: TextFieldProps) {
  return (
    <Field name={name} label={label} error={error} hint={hint}>
      {(props) => <input {...props} name={name} type={type} {...input} />}
    </Field>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-leaf px-5 py-2.5 font-medium text-white hover:bg-leaf-dark disabled:opacity-60"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border-l-4 border-beet bg-white px-4 py-3 text-beet">
      {message}
    </p>
  );
}
