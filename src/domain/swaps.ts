// The swap lifecycle from docs/specs/05-behavior.md ("Swap lifecycle"), as one pure function.
// No database, network or framework code (REQ-NFR-5).
import type { PlantStatus, SwapStatus } from "./constants";

export const SWAP_ACTIONS = ["accept", "decline", "cancel", "complete"] as const;
export type SwapAction = (typeof SWAP_ACTIONS)[number];

export const SWAP_ROLES = ["owner", "requester", "other"] as const;
export type SwapRole = (typeof SWAP_ROLES)[number];

export const TERMINAL_SWAP_STATUSES: readonly SwapStatus[] = ["DECLINED", "CANCELLED", "COMPLETED"];

export type SwapDecision =
  | {
      ok: true;
      row: "T1" | "T2" | "T3" | "T4" | "T5";
      to: SwapStatus;
      /** New status for both plants, or null when the plants do not change. */
      plantsTo: PlantStatus | null;
      /** True when every other PENDING swap involving either plant must be cancelled. */
      cancelCompeting: boolean;
    }
  | { ok: false; row: "T6" | "T7"; code: "FORBIDDEN" | "CONFLICT" };

type Transition = {
  row: "T1" | "T2" | "T3" | "T4" | "T5";
  from: SwapStatus;
  action: SwapAction;
  roles: readonly SwapRole[];
  to: SwapStatus;
  plantsTo: PlantStatus | null;
  cancelCompeting: boolean;
};

const TRANSITIONS: readonly Transition[] = [
  { row: "T1", from: "PENDING", action: "accept", roles: ["owner"], to: "ACCEPTED", plantsTo: "RESERVED", cancelCompeting: true },
  { row: "T2", from: "PENDING", action: "decline", roles: ["owner"], to: "DECLINED", plantsTo: null, cancelCompeting: false },
  { row: "T3", from: "PENDING", action: "cancel", roles: ["requester"], to: "CANCELLED", plantsTo: null, cancelCompeting: false },
  { row: "T4", from: "ACCEPTED", action: "cancel", roles: ["owner", "requester"], to: "CANCELLED", plantsTo: "AVAILABLE", cancelCompeting: false },
  { row: "T5", from: "ACCEPTED", action: "complete", roles: ["owner", "requester"], to: "COMPLETED", plantsTo: "SWAPPED", cancelCompeting: false },
];

/**
 * Decides what an action does to a swap. Refusal reasons follow the order in 05-behavior.md:
 * 1. not a participant → FORBIDDEN; 2. no one may do this now → CONFLICT;
 * 3. only the other participant may → FORBIDDEN.
 */
export function decideSwapAction(status: SwapStatus, action: SwapAction, role: SwapRole): SwapDecision {
  const refusedRow = TERMINAL_SWAP_STATUSES.includes(status) ? "T6" : "T7";
  if (role === "other") return { ok: false, row: refusedRow, code: "FORBIDDEN" };

  const transition = TRANSITIONS.find((t) => t.from === status && t.action === action);
  if (!transition) return { ok: false, row: refusedRow, code: "CONFLICT" };
  if (!transition.roles.includes(role)) return { ok: false, row: "T7", code: "FORBIDDEN" };

  const { row, to, plantsTo, cancelCompeting } = transition;
  return { ok: true, row, to, plantsTo, cancelCompeting };
}

/** The actions a member in this role may take on a swap with this status, in display order. */
export function allowedSwapActions(status: SwapStatus, role: SwapRole): SwapAction[] {
  return SWAP_ACTIONS.filter((action) => decideSwapAction(status, action, role).ok);
}
