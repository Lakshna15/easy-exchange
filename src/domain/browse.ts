// Browse filters and their place in the page address (REQ-BROWSE-3, REQ-BROWSE-4). Pure: no I/O.
import { PLANT_FORMS, PLANT_TYPES, type PlantForm, type PlantType } from "./constants";

export type BrowseFilters = { q: string; plantType: PlantType | ""; form: PlantForm | ""; city: string };

export const NO_FILTERS: BrowseFilters = { q: "", plantType: "", form: "", city: "" };

type Params = Record<string, string | string[] | undefined>;

const single = (value: string | string[] | undefined): string => (typeof value === "string" ? value.trim() : "");

/** Reads filters from the address. Unknown or repeated values are ignored rather than trusted. */
export function parseBrowseFilters(params: Params): BrowseFilters {
  const plantType = single(params.plantType);
  const form = single(params.form);
  return {
    q: single(params.q).slice(0, 100),
    plantType: (PLANT_TYPES as readonly string[]).includes(plantType) ? (plantType as PlantType) : "",
    form: (PLANT_FORMS as readonly string[]).includes(form) ? (form as PlantForm) : "",
    city: single(params.city).slice(0, 60),
  };
}

/** The query string for these filters, leaving out empty ones, in a fixed order. */
export function browseQueryString(filters: BrowseFilters): string {
  const params = new URLSearchParams();
  for (const key of ["q", "plantType", "form", "city"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  return params.toString();
}

export const hasActiveFilters = (filters: BrowseFilters): boolean =>
  Boolean(filters.q || filters.plantType || filters.form || filters.city);
