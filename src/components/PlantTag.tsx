import Link from "next/link";
import type { ReactNode } from "react";
import type { PlantForm, PlantType } from "@/domain/constants";
import { describePlant } from "./plant-labels";

type PlantTagProps = {
  id: string;
  commonName: string;
  botanicalName: string | null;
  plantType: PlantType;
  form: PlantForm;
  city: string;
  /** Badges such as the status or "Your plant". */
  badges?: ReactNode;
  /** Extra controls, such as an Edit link. Rendered above the card-wide link. */
  actions?: ReactNode;
};

export function PlantTag({ id, commonName, botanicalName, plantType, form, city, badges, actions }: PlantTagProps) {
  return (
    <li className="plant-tag-edge list-none">
      <article className="plant-tag">
        <h3 className="font-serif text-2xl font-semibold leading-tight">
          <Link href={`/plants/${id}`} className="after:absolute after:inset-0 after:content-['']">
            {commonName}
          </Link>
        </h3>
        {botanicalName && <p className="mt-1 font-serif text-lg italic text-slate">{botanicalName}</p>}
        <p className="mt-3">{describePlant(form, plantType)}</p>
        {badges && <div className="mt-3 flex flex-wrap gap-2">{badges}</div>}
        {actions && <div className="relative z-10 mt-auto pt-4">{actions}</div>}
        <p className="plant-tag-city">{city}</p>
      </article>
    </li>
  );
}

export function PlantTagGrid({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </ul>
  );
}
