// Session tokens: a JWT signed with HS256, holding only the user ID and the expiry
// (docs/specs/04-architecture.md, "Sessions and authorization"). No Next.js imports, so it can be unit tested.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ee_session";
export const SESSION_DAYS = 7;
export const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters. Copy .env.example to .env (see README.md).");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + SESSION_SECONDS)
    .sign(secretKey());
}

/** The user ID in a valid, unexpired token, or null for a missing, tampered or expired one. */
export async function readSessionToken(token: string | undefined, currentDate = new Date()): Promise<string | null> {
  if (!token) return null;
  const key = secretKey(); // a missing secret is a setup error, not a signed-out visitor
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"], currentDate });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
