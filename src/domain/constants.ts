// Allowed values, defined once (docs/specs/04-architecture.md, "Data model").
// Pure data: no imports, no I/O.

export const PLANT_TYPES = [
  "HOUSEPLANT",
  "SUCCULENT_CACTUS",
  "HERB",
  "VEGETABLE",
  "FLOWER",
  "TREE_SHRUB",
  "OTHER",
] as const;
export type PlantType = (typeof PLANT_TYPES)[number];

export const PLANT_TYPE_LABELS: Record<PlantType, string> = {
  HOUSEPLANT: "Houseplant",
  SUCCULENT_CACTUS: "Succulent or cactus",
  HERB: "Herb",
  VEGETABLE: "Vegetable",
  FLOWER: "Flower",
  TREE_SHRUB: "Tree or shrub",
  OTHER: "Other",
};

export const PLANT_FORMS = ["CUTTING", "SEEDLING", "POTTED", "SEEDS"] as const;
export type PlantForm = (typeof PLANT_FORMS)[number];

export const PLANT_FORM_LABELS: Record<PlantForm, string> = {
  CUTTING: "Cutting",
  SEEDLING: "Seedling",
  POTTED: "Potted plant",
  SEEDS: "Seeds",
};

export const PLANT_STATUSES = ["AVAILABLE", "RESERVED", "SWAPPED", "REMOVED"] as const;
export type PlantStatus = (typeof PLANT_STATUSES)[number];

export const PLANT_STATUS_LABELS: Record<PlantStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SWAPPED: "Swapped",
  REMOVED: "Removed",
};

export const SWAP_STATUSES = ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"] as const;
export type SwapStatus = (typeof SWAP_STATUSES)[number];

export const SWAP_STATUS_LABELS: Record<SwapStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};
