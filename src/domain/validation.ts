// Input rules from docs/specs/02-requirements.md, enforced on the server (REQ-NFR-1).
import { z } from "zod";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Use an email address of at most 254 characters.")
  .regex(EMAIL_PATTERN, "Enter an email address like name@example.com.");

// REQ-AUTH-1, REQ-AUTH-2, REQ-AUTH-7
export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Enter a display name of 2 to 40 characters.")
    .max(40, "Enter a display name of 2 to 40 characters."),
  email,
  city: z
    .string()
    .trim()
    .min(1, "Enter your city, so neighbours know where to meet.")
    .max(60, "Use at most 60 characters for the city."),
  password: z
    .string()
    .min(8, "Use a password of 8 to 72 characters.")
    .max(72, "Use a password of 8 to 72 characters."),
});
export type RegisterInput = z.input<typeof registerSchema>;

// REQ-AUTH-4
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
});
export type LoginInput = z.input<typeof loginSchema>;

/** The first message for each field, keyed by field name. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}
