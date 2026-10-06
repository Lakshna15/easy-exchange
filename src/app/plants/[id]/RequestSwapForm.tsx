"use client";

import { useActionState } from "react";
import { requestSwapAction } from "@/app/actions/swaps";
import { Field, FormMessage, SubmitButton } from "@/components/form-controls";

type Option = { id: string; commonName: string; botanicalName: string | null };

// F4: pick one of your own available plants and add a message.
export function RequestSwapForm({ plantId, options }: { plantId: string; options: Option[] }) {
  const [state, formAction] = useActionState(requestSwapAction.bind(null, plantId), {});
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  return (
    <form key={state.submission} action={formAction} noValidate className="mt-4 space-y-5">
      <FormMessage message={state.message} />
      <Field name="offeredPlantId" label="Your plant to offer" error={errors.offeredPlantId}>
        {(props) => (
          <select {...props} name="offeredPlantId" defaultValue={values.offeredPlantId ?? ""}>
            <option value="" disabled>
              Choose one of your plants
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.botanicalName ? `${option.commonName} (${option.botanicalName})` : option.commonName}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field name="message" label="Message (optional)" error={errors.message} hint="Say where and when you could meet. Up to 500 characters.">
        {(props) => <textarea {...props} name="message" rows={3} maxLength={500} defaultValue={values.message} />}
      </Field>
      <SubmitButton>Request swap</SubmitButton>
    </form>
  );
}
