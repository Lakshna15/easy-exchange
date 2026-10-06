import { decodeJwt } from "jose";
import { describe, expect, it } from "vitest";
import { SESSION_DAYS, createSessionToken, readSessionToken } from "@/server/session-token";

describe("Sessions", () => {
  it("AC-AUTH-4: a session token holds only the user id and its expiry, and lasts 7 days", async () => {
    const token = await createSessionToken("user-1");
    const payload = decodeJwt(token);
    expect(Object.keys(payload).sort()).toEqual(["exp", "iat", "sub"]);
    expect(payload.sub).toBe("user-1");
    expect(SESSION_DAYS).toBe(7);
    expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(7 * 24 * 60 * 60);
    expect(await readSessionToken(token)).toBe("user-1");
  });

  it("AC-AUTH-6: a missing, tampered or expired session means signed out", async () => {
    const token = await createSessionToken("user-1");
    expect(await readSessionToken(undefined)).toBeNull();
    expect(await readSessionToken("")).toBeNull();
    expect(await readSessionToken(token.slice(0, -2) + "xx")).toBeNull();
    const eightDaysLater = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
    expect(await readSessionToken(token, eightDaysLater)).toBeNull();
  });
});
