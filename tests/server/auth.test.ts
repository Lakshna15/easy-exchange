import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it } from "vitest";
import { registerMember, verifyLogin } from "@/server/auth";
import { type Db, openDatabase } from "@/server/db";
import { SEED_PASSWORD, seedDatabase } from "@/server/seed";

let db: Db;
beforeEach(async () => {
  db = openDatabase(":memory:");
  await seedDatabase(db);
});

const dana = { displayName: "Dana", email: "dana@example.com", city: " Asheville ", password: "correct-horse-1" };
const userCount = () => (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;

describe("Accounts", () => {
  it("AC-AUTH-1: a visitor registers with a display name, email, city and password; the city is stored trimmed", async () => {
    const result = await registerMember(db, dana);
    expect(result).toMatchObject({ ok: true, data: { displayName: "Dana", email: "dana@example.com", city: "Asheville" } });
    expect(db.prepare("SELECT displayName, email, city FROM users WHERE email = ?").get("dana@example.com")).toEqual({
      displayName: "Dana",
      email: "dana@example.com",
      city: "Asheville",
    });
  });

  it("AC-AUTH-1: lengths are enforced: display name 2–40, city 1–60, password 8–72", async () => {
    const cases = [
      [{ displayName: "D" }, "displayName"],
      [{ displayName: "D".repeat(41) }, "displayName"],
      [{ city: "C".repeat(61) }, "city"],
      [{ password: "p".repeat(7) }, "password"],
      [{ password: "p".repeat(73) }, "password"],
      [{ password: "é".repeat(40) }, "password"], // 40 characters but 80 bytes: bcrypt would ignore the end
      [{ email: "not-an-email" }, "email"],
    ] as const;
    for (const [change, field] of cases) {
      const result = await registerMember(db, { ...dana, ...change });
      expect(result, field).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { [field]: expect.any(String) } });
    }
    expect(await registerMember(db, { ...dana, displayName: "Di", city: "C".repeat(60), password: "p".repeat(72) })).toMatchObject({ ok: true });
    expect(userCount()).toBe(4);
  });

  it("AC-AUTH-2: an email that differs only in letter case and spaces is refused on the email field", async () => {
    const result = await registerMember(db, { ...dana, email: " Alice@Example.com " });
    expect(result).toMatchObject({ ok: false, code: "VALIDATION", fieldErrors: { email: expect.any(String) } });
    expect(userCount()).toBe(3);
  });

  it("AC-AUTH-3: the password is stored only as a salted hash, and neither appears in a result", async () => {
    const registered = await registerMember(db, dana);
    const { passwordHash } = db.prepare("SELECT passwordHash FROM users WHERE email = ?").get("dana@example.com") as {
      passwordHash: string;
    };
    expect(passwordHash).not.toBe(dana.password);
    expect(passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(await bcrypt.compare(dana.password, passwordHash)).toBe(true);

    const loggedIn = await verifyLogin(db, { email: dana.email, password: dana.password });
    for (const result of [registered, loggedIn]) {
      const text = JSON.stringify(result);
      expect(text).not.toContain(dana.password);
      expect(text).not.toContain(passwordHash);
    }
  });

  it("AC-AUTH-4: an unknown email and a wrong password get the same message", async () => {
    const unknown = await verifyLogin(db, { email: "nobody@example.com", password: "whatever-123" });
    const wrong = await verifyLogin(db, { email: "alice@example.com", password: "wrong-password" });
    expect(unknown).toEqual({ ok: false, code: "UNAUTHENTICATED", message: "Email or password is incorrect." });
    expect(wrong).toEqual(unknown);
  });

  it("AC-AUTH-4: the right password logs in, ignoring the email's letter case and spaces", async () => {
    const result = await verifyLogin(db, { email: " ALICE@example.com ", password: SEED_PASSWORD });
    expect(result).toMatchObject({
      ok: true,
      data: { displayName: "Alice", email: "alice@example.com", city: "Charlotte" },
    });
  });

  it("AC-AUTH-7: a missing city and a short password are refused with errors on those fields, and no account is created", async () => {
    const result = await registerMember(db, { displayName: "Dana", email: "dana@example.com", city: "", password: "short" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("VALIDATION");
    expect(Object.keys(result.fieldErrors ?? {}).sort()).toEqual(["city", "password"]);
    expect(userCount()).toBe(3);
  });
});
