// Reading and writing the session cookie. The only server module that touches next/headers.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getMemberById, type Member } from "@/server/auth";
import { getDb } from "@/server/db";
import { SESSION_COOKIE, SESSION_SECONDS, createSessionToken, readSessionToken } from "@/server/session-token";

export async function startSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in member, or null. Read once per request. */
export const getCurrentUser = cache(async (): Promise<Member | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await readSessionToken(token);
  return userId ? getMemberById(getDb(), userId) : null;
});

/** For members-only pages: sends visitors to the login page, which returns them to `path` (REQ-AUTH-6). */
export async function requireUser(path: string): Promise<Member> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);
  return user;
}
