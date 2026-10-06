import { PLANT_FORM_LABELS, PLANT_STATUS_LABELS, PLANT_TYPE_LABELS, type PlantForm, type PlantStatus, type PlantType } from "@/domain/constants";

/** "Cutting of a houseplant" style phrase for cards: the form first, because that is what changes hands. */
export function describePlant(form: PlantForm, plantType: PlantType): string {
  return `${PLANT_FORM_LABELS[form]}, ${PLANT_TYPE_LABELS[plantType].toLowerCase()}`;
}

export const statusLabel = (status: PlantStatus) => PLANT_STATUS_LABELS[status];

export function formatListedDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(iso));
}
