// Every service returns a Result (docs/specs/04-architecture.md, "Mutations and errors").
// Expected failures are returned, not thrown.

export type FailureCode = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" | "CONFLICT";

export type Failure = {
  ok: false;
  code: FailureCode;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type Result<T> = { ok: true; data: T } | Failure;

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });

export function fail(code: FailureCode, message: string, fieldErrors?: Record<string, string>): Failure {
  return fieldErrors ? { ok: false, code, message, fieldErrors } : { ok: false, code, message };
}
