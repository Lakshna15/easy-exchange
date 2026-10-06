import Form from "next/form";
import Link from "next/link";
import { PlantTag, PlantTagGrid } from "@/components/PlantTag";
import { YourPlantBadge } from "@/components/StatusBadge";
import { hasActiveFilters, parseBrowseFilters } from "@/domain/browse";
import { PLANT_FORMS, PLANT_FORM_LABELS, PLANT_TYPES, PLANT_TYPE_LABELS } from "@/domain/constants";
import { getDb } from "@/server/db";
import { listAvailablePlants, listCities } from "@/server/plants";
import { getCurrentUser } from "@/server/session";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const control = "mt-1 block w-full rounded-md border border-stem bg-white px-3 py-2";

// F3, REQ-BROWSE-1 to -5, -7, -9. Search text and filters live in the address (a GET form).
export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseBrowseFilters(await searchParams);
  const user = await getCurrentUser();
  const db = getDb();
  const plants = listAvailablePlants(db, filters, user?.id);
  const cities = listCities(db);
  if (filters.city && !cities.some((city) => city.toLowerCase() === filters.city.toLowerCase())) cities.push(filters.city);

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Plants looking for a new home</h1>
      <p className="mt-3 max-w-prose">
        Offer one of your plants for one of these. Plants change hands in person, so pick a city near you.
      </p>

      <Form action="/" className="mt-8 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="q" className="block font-medium">
            Search by name
          </label>
          <input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Common or botanical name" className={control} />
        </div>
        <div>
          <label htmlFor="plantType" className="block font-medium">
            Plant type
          </label>
          <select id="plantType" name="plantType" defaultValue={filters.plantType} className={control}>
            <option value="">Any type</option>
            {PLANT_TYPES.map((type) => (
              <option key={type} value={type}>
                {PLANT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="form" className="block font-medium">
            Form
          </label>
          <select id="form" name="form" defaultValue={filters.form} className={control}>
            <option value="">Any form</option>
            {PLANT_FORMS.map((form) => (
              <option key={form} value={form}>
                {PLANT_FORM_LABELS[form]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="block font-medium">
            City
          </label>
          <select id="city" name="city" defaultValue={filters.city} className={control}>
            <option value="">Any city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-md bg-leaf px-5 py-2.5 font-medium text-white hover:bg-leaf-dark">
          Search
        </button>
      </Form>

      <h2 className="sr-only">Results</h2>
      {plants.length === 0 ? (
        <div aria-live="polite" className="mt-8 max-w-prose">
          <p className="font-serif text-2xl">No plants match your search.</p>
          <p className="mt-2">Try another name, or widen the filters.</p>
          <p className="mt-4">
            <Link href="/" className="underline">
              Clear search and filters
            </Link>
          </p>
        </div>
      ) : (
        <>
          <p aria-live="polite" className="mt-8 text-slate">
            {plants.length === 1 ? "1 plant" : `${plants.length} plants`}
            {hasActiveFilters(filters) && (
              <>
                {" "}
                match.{" "}
                <Link href="/" className="text-ink underline">
                  Clear search and filters
                </Link>
              </>
            )}
          </p>
          <PlantTagGrid label="Available plants">
          {plants.map((plant) => (
              <PlantTag key={plant.id} {...plant} badges={plant.isOwn ? <YourPlantBadge /> : undefined} />
            ))}
          </PlantTagGrid>
        </>
      )}
    </div>
  );
}
