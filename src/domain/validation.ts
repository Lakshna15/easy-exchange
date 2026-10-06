// Input rules from docs/specs/02-requirements.md, enforced on the server (REQ-NFR-1).
import { z } from "zod";
import { PLANT_FORMS, PLANT_TYPES } from "./constants";

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

// REQ-PLANT-1, REQ-PLANT-2, REQ-PLANT-3, REQ-PLANT-9
export const plantSchema = z.object({
  commonName: z
    .string()
    .trim()
    .min(1, "Enter the plant's common name.")
    .max(80, "Use at most 80 characters for the common name."),
  botanicalName: z.string().trim().max(120, "Use at most 120 characters for the botanical name."),
  plantType: z.enum(PLANT_TYPES, { error: "Choose a plant type from the list." }),
  form: z.enum(PLANT_FORMS, { error: "Choose a form from the list." }),
  description: z.string().trim().max(1000, "Use at most 1000 characters for the description."),
  healthConfirmed: z.literal(true, { error: "Confirm that the plant shows no visible pests or disease." }),
});
export type PlantInput = z.input<typeof plantSchema>;

/** The first message for each field, keyed by field name. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message;
  }
  return errors;
}
