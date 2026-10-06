"use client";

import { useActionState, useState } from "react";
import { removePlantAction } from "@/app/actions/plants";
import { FormMessage } from "@/components/form-controls";

// F2: the Remove button asks for confirmation before anything changes.
export function RemovePlant({ plantId, commonName }: { plantId: string; commonName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, pending] = useActionState(removePlantAction.bind(null, plantId), {});
  return (
    <section aria-labelledby="remove-heading" className="mt-12 max-w-xl border-t border-stem pt-6">
      <h2 id="remove-heading" className="font-serif text-2xl font-semibold">
        Remove this plant
      </h2>
      <p className="mt-2">It disappears from your shelf and from the browse list. Past swaps keep their record.</p>
      <div className="mt-4">
        <FormMessage message={state.message} />
      </div>
      {confirming ? (
        <form action={formAction} className="mt-4 flex flex-wrap items-center gap-3">
          <span className="font-medium">Remove {commonName} for good?</span>
          <button type="submit" disabled={pending} className="rounded-md bg-beet px-4 py-2 font-medium text-white disabled:opacity-60">
            Yes, remove it
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="rounded-md border border-stem bg-white px-4 py-2">
            Keep it
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="mt-4 rounded-md border border-beet bg-white px-4 py-2 font-medium text-beet">
          Remove plant
        </button>
      )}
    </section>
  );
}
