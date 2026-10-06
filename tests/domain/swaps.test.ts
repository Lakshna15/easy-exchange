import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SWAP_STATUSES, type SwapStatus } from "@/domain/constants";
import {
  SWAP_ACTIONS,
  SWAP_ROLES,
  allowedSwapActions,
  decideSwapAction,
  type SwapAction,
  type SwapRole,
} from "@/domain/swaps";

// Every allowed transition, copied by hand from the table in docs/specs/05-behavior.md.
const ALLOWED = [
  { row: "T1", from: "PENDING", action: "accept", role: "owner", to: "ACCEPTED", plantsTo: "RESERVED", cancelCompeting: true },
  { row: "T2", from: "PENDING", action: "decline", role: "owner", to: "DECLINED", plantsTo: null, cancelCompeting: false },
  { row: "T3", from: "PENDING", action: "cancel", role: "requester", to: "CANCELLED", plantsTo: null, cancelCompeting: false },
  { row: "T4", from: "ACCEPTED", action: "cancel", role: "owner", to: "CANCELLED", plantsTo: "AVAILABLE", cancelCompeting: false },
  { row: "T4", from: "ACCEPTED", action: "cancel", role: "requester", to: "CANCELLED", plantsTo: "AVAILABLE", cancelCompeting: false },
  { row: "T5", from: "ACCEPTED", action: "complete", role: "owner", to: "COMPLETED", plantsTo: "SWAPPED", cancelCompeting: false },
  { row: "T5", from: "ACCEPTED", action: "complete", role: "requester", to: "COMPLETED", plantsTo: "SWAPPED", cancelCompeting: false },
] as const;

// T7 refusals for participants while the swap is still open, with the reason order from 05-behavior.md:
// CONFLICT when no one may take the action now, FORBIDDEN when only the other participant may.
const T7_PARTICIPANT_REFUSALS = [
  { from: "PENDING", action: "accept", role: "requester", code: "FORBIDDEN" },
  { from: "PENDING", action: "decline", role: "requester", code: "FORBIDDEN" },
  { from: "PENDING", action: "cancel", role: "owner", code: "FORBIDDEN" },
  { from: "PENDING", action: "complete", role: "owner", code: "CONFLICT" },
  { from: "PENDING", action: "complete", role: "requester", code: "CONFLICT" },
  { from: "ACCEPTED", action: "accept", role: "owner", code: "CONFLICT" },
  { from: "ACCEPTED", action: "accept", role: "requester", code: "CONFLICT" },
  { from: "ACCEPTED", action: "decline", role: "owner", code: "CONFLICT" },
  { from: "ACCEPTED", action: "decline", role: "requester", code: "CONFLICT" },
] as const;

const TERMINAL: SwapStatus[] = ["DECLINED", "CANCELLED", "COMPLETED"];
const PARTICIPANTS: SwapRole[] = ["owner", "requester"];

describe("AC-NFR-3: the swap rules are fully tested", () => {
  it.each(ALLOWED)(
    "AC-NFR-3: $row $from + $action by $role → $to, plants → $plantsTo",
    ({ row, from, action, role, to, plantsTo, cancelCompeting }) => {
      expect(decideSwapAction(from, action, role)).toEqual({ ok: true, row, to, plantsTo, cancelCompeting });
    },
  );

  const t6 = TERMINAL.flatMap((from) =>
    SWAP_ACTIONS.flatMap((action) => PARTICIPANTS.map((role) => ({ from, action, role }))),
  );
  it.each(t6)("AC-NFR-3: T6 $from + $action by $role is refused with CONFLICT", ({ from, action, role }) => {
    expect(decideSwapAction(from, action, role)).toEqual({ ok: false, row: "T6", code: "CONFLICT" });
  });

  it.each(T7_PARTICIPANT_REFUSALS)(
    "AC-NFR-3: T7 $from + $action by $role is refused with $code",
    ({ from, action, role, code }) => {
      expect(decideSwapAction(from, action, role)).toEqual({ ok: false, row: "T7", code });
    },
  );

  const outsiders = SWAP_STATUSES.flatMap((from) => SWAP_ACTIONS.map((action) => ({ from, action })));
  it.each(outsiders)("AC-NFR-3: T6/T7 $from + $action by a non-participant is refused with FORBIDDEN", ({ from, action }) => {
    const decision = decideSwapAction(from, action, "other");
    expect(decision).toEqual({ ok: false, row: TERMINAL.includes(from) ? "T6" : "T7", code: "FORBIDDEN" });
  });

  it("AC-NFR-3: the cases above cover every status, action and role combination", () => {
    const covered = new Set<string>();
    const key = (from: string, action: string, role: string) => `${from}/${action}/${role}`;
    ALLOWED.forEach((c) => covered.add(key(c.from, c.action, c.role)));
    t6.forEach((c) => covered.add(key(c.from, c.action, c.role)));
    T7_PARTICIPANT_REFUSALS.forEach((c) => covered.add(key(c.from, c.action, c.role)));
    outsiders.forEach((c) => covered.add(key(c.from, c.action, "other")));
    expect(covered.size).toBe(SWAP_STATUSES.length * SWAP_ACTIONS.length * SWAP_ROLES.length); // 5 × 4 × 3 = 60
  });

  it("AC-NFR-3: the module imports nothing outside src/domain", () => {
    const source = readFileSync("src/domain/swaps.ts", "utf8");
    const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const target of imports) expect(target).toMatch(/^(\.\/|@\/domain\/)/);
  });
});

describe("allowed actions per status and role (used by the swaps page, AC-SWAP-14)", () => {
  const expected: Record<string, SwapAction[]> = {
    "PENDING/owner": ["accept", "decline"],
    "PENDING/requester": ["cancel"],
    "ACCEPTED/owner": ["cancel", "complete"],
    "ACCEPTED/requester": ["cancel", "complete"],
  };
  for (const from of SWAP_STATUSES) {
    for (const role of SWAP_ROLES) {
      const want = expected[`${from}/${role}`] ?? [];
      it(`${from} as ${role}: ${want.join(", ") || "nothing"}`, () => {
        expect(allowedSwapActions(from, role)).toEqual(want);
      });
    }
  }
});
