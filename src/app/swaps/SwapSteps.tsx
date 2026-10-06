"use client";

import { useActionState } from "react";
import { swapStepAction } from "@/app/actions/swaps";
import { FormMessage } from "@/components/form-controls";
import type { SwapAction } from "@/domain/swaps";

const LABELS: Record<SwapAction, string> = {
  accept: "Accept",
  decline: "Decline",
  cancel: "Cancel swap",
  complete: "Mark completed",
};

const primary = "rounded-md bg-leaf px-4 py-2 font-medium text-white hover:bg-leaf-dark disabled:opacity-60";
const secondary = "rounded-md border border-stem bg-white px-4 py-2 font-medium disabled:opacity-60";

// F4: only the actions this member may take (REQ-SWAP-11). One form; the clicked button names the step.
export function SwapSteps({ swapId, actions, swapName }: { swapId: string; actions: SwapAction[]; swapName: string }) {
  const [state, formAction, pending] = useActionState(swapStepAction.bind(null, swapId), {});
  if (actions.length === 0) return null;
  return (
    <form action={formAction} className="mt-4">
      <FormMessage message={state.message} />
      <div className="mt-2 flex flex-wrap gap-3">
        {actions.map((action) => (
          <button
            key={action}
            type="submit"
            name="step"
            value={action}
            disabled={pending}
            aria-label={`${LABELS[action]}: ${swapName}`}
            className={action === "accept" || action === "complete" ? primary : secondary}
          >
            {LABELS[action]}
          </button>
        ))}
      </div>
    </form>
  );
}
