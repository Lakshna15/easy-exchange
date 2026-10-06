"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/form-state";
import { Field, FormMessage, SubmitButton, TextField } from "@/components/form-controls";
import { PLANT_FORMS, PLANT_FORM_LABELS, PLANT_TYPES, PLANT_TYPE_LABELS } from "@/domain/constants";

type PlantFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  /** Current values when editing. The health confirmation always starts unticked (03-features F2). */
  initial?: { commonName: string; botanicalName: string; plantType: string; form: string; description: string };
};

export function PlantForm({ action, submitLabel, initial }: PlantFormProps) {
  const [state, formAction] = useActionState(action, {});
  const values = state.values ?? initial ?? {};
  const errors = state.fieldErrors ?? {};
  return (
    <form key={state.submission} action={formAction} noValidate className="mt-8 max-w-xl space-y-6">
      <FormMessage message={state.message} />
      <TextField name="commonName" label="Common name" defaultValue={values.commonName} error={errors.commonName} hint="The everyday name, like Golden pothos. Up to 80 characters." maxLength={80} />
      <TextField name="botanicalName" label="Botanical name (optional)" defaultValue={values.botanicalName} error={errors.botanicalName} hint="The scientific name, if you know it, like Epipremnum aureum." maxLength={120} />

      <Field name="plantType" label="Plant type" error={errors.plantType}>
        {(props) => (
          <select {...props} name="plantType" defaultValue={values.plantType ?? ""}>
            <option value="" disabled>
              Choose a plant type
            </option>
            {PLANT_TYPES.map((type) => (
              <option key={type} value={type}>
                {PLANT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        )}
      </Field>

      <fieldset aria-describedby={errors.form ? "field-form-error" : undefined}>
        <legend className="font-medium">What you are giving</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLANT_FORMS.map((form) => (
            <label key={form} className="flex items-center gap-2 rounded-md border border-stem bg-white px-3 py-2 has-[:checked]:border-leaf has-[:checked]:bg-leaf/10">
              <input type="radio" name="form" value={form} defaultChecked={values.form === form} />
              {PLANT_FORM_LABELS[form]}
            </label>
          ))}
        </div>
        {errors.form && (
          <p id="field-form-error" className="mt-1 text-sm text-beet">
            {errors.form}
          </p>
        )}
      </fieldset>

      <Field name="description" label="Description (optional)" error={errors.description} hint="Size, pot, the light it likes, anything a new owner should know. Up to 1000 characters.">
        {(props) => <textarea {...props} name="description" rows={4} maxLength={1000} defaultValue={values.description} />}
      </Field>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="healthConfirmed"
            defaultChecked={state.values?.healthConfirmed === "on"}
            aria-invalid={Boolean(errors.healthConfirmed)}
            aria-describedby={errors.healthConfirmed ? "field-healthConfirmed-error" : "field-healthConfirmed-hint"}
            className="mt-1.5 size-4 accent-leaf"
          />
          <span>
            <span className="font-medium">No visible pests or disease</span>
            <span id="field-healthConfirmed-hint" className="block text-sm text-slate">
              Check the leaves, stems and soil before you confirm.
            </span>
          </span>
        </label>
        {errors.healthConfirmed && (
          <p id="field-healthConfirmed-error" className="mt-1 text-sm text-beet">
            {errors.healthConfirmed}
          </p>
        )}
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
