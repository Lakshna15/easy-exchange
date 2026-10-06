// Accounts service: REQ-AUTH-1 to REQ-AUTH-7.
import bcrypt from "bcryptjs";
import { fieldErrorsOf, loginSchema, registerSchema } from "@/domain/validation";
import { type Db, newId, now } from "@/server/db";
import { fail, ok, type Result } from "@/server/result";

/** What the app may know about a member. Never includes the password hash (REQ-AUTH-3). */
export type Member = { id: string; displayName: string; email: string; city: string };

const BCRYPT_ROUNDS = 10;
const LOGIN_FAILED = "Email or password is incorrect.";
const CHECK_FIELDS = "Check the highlighted fields.";
const EMAIL_TAKEN = "An account with this email already exists. Log in instead.";

// Compared against when the email is unknown, so both kinds of failed login take about as long (REQ-AUTH-5).
const UNKNOWN_USER_HASH = bcrypt.hashSync("easy-exchange-unknown-user", BCRYPT_ROUNDS);

export async function registerMember(db: Db, input: unknown): Promise<Result<Member>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", CHECK_FIELDS, fieldErrorsOf(parsed.error));
  const { displayName, email, city, password } = parsed.data;

  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
    return fail("VALIDATION", CHECK_FIELDS, { email: EMAIL_TAKEN });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const member: Member = { id: newId(), displayName, email, city };
  try {
    db.prepare(
      "INSERT INTO users (id, email, displayName, city, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(member.id, email, displayName, city, passwordHash, now());
  } catch (error) {
    // Another registration with the same email won the race between the check and the insert.
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed: users.email")) {
      return fail("VALIDATION", CHECK_FIELDS, { email: EMAIL_TAKEN });
    }
    throw error;
  }
  return ok(member);
}

export async function verifyLogin(db: Db, input: unknown): Promise<Result<Member>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail("UNAUTHENTICATED", LOGIN_FAILED);
  const { email, password } = parsed.data;

  const row = db
    .prepare("SELECT id, displayName, email, city, passwordHash FROM users WHERE email = ?")
    .get(email) as (Member & { passwordHash: string }) | undefined;
  const matches = await bcrypt.compare(password, row?.passwordHash ?? UNKNOWN_USER_HASH);
  if (!row || !matches) return fail("UNAUTHENTICATED", LOGIN_FAILED);

  return ok({ id: row.id, displayName: row.displayName, email: row.email, city: row.city });
}

export function getMemberById(db: Db, id: string): Member | null {
  const row = db.prepare("SELECT id, displayName, email, city FROM users WHERE id = ?").get(id) as Member | undefined;
  return row ? { ...row } : null;
}
