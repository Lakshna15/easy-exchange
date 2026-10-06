import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatListedDate } from "@/components/plant-labels";
import { StatusBadge, YourPlantBadge } from "@/components/StatusBadge";
import { PLANT_FORM_LABELS, PLANT_TYPE_LABELS } from "@/domain/constants";
import { getDb } from "@/server/db";
import { getPlantDetails } from "@/server/plants";
import { getCurrentUser } from "@/server/session";
import { getRequestOptions } from "@/server/swaps";
import { RequestSwapForm } from "./RequestSwapForm";

export const metadata: Metadata = { title: "Plant · Easy Exchange" };

// REQ-BROWSE-6, -7, -8 and the request form (F4, REQ-SWAP-1, REQ-SWAP-4).
export default async function PlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = getPlantDetails(getDb(), id);
  if (!result.ok) notFound();
  const plant = result.data;
  const user = await getCurrentUser();
  const isOwner = user?.id === plant.ownerId;

  return (
    <article className="max-w-3xl">
      <p>
        <Link href="/" className="underline">
          All plants
        </Link>
      </p>
      <h1 className="mt-4 font-serif text-5xl font-semibold">{plant.commonName}</h1>
      {plant.botanicalName && <p className="mt-2 font-serif text-2xl italic text-slate">{plant.botanicalName}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={plant.status} />
        {isOwner && <YourPlantBadge />}
      </div>

      <dl className="mt-8 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3">
        <dt className="text-slate">Plant type</dt>
        <dd>{PLANT_TYPE_LABELS[plant.plantType]}</dd>
        <dt className="text-slate">Form</dt>
        <dd>{PLANT_FORM_LABELS[plant.form]}</dd>
        <dt className="text-slate">Offered by</dt>
        <dd>
          {plant.ownerName}, {plant.ownerCity}
        </dd>
        <dt className="text-slate">Listed</dt>
        <dd>{formatListedDate(plant.createdAt)}</dd>
      </dl>

      <h2 className="mt-10 font-serif text-2xl font-semibold">About this plant</h2>
      <p className="mt-2 max-w-prose whitespace-pre-line">{plant.description ?? "The owner hasn't added a description."}</p>

      {!isOwner && plant.status === "AVAILABLE" && (
        <section aria-labelledby="request-heading" className="mt-12 max-w-xl border-t border-stem pt-6">
          <h2 id="request-heading" className="font-serif text-2xl font-semibold">
            Offer a swap
          </h2>
          {!user ? (
            <p className="mt-3">
              <Link href={`/login?next=${encodeURIComponent(`/plants/${plant.id}`)}`} className="font-medium text-leaf underline underline-offset-4">
                Log in to offer a swap
              </Link>{" "}
              for this {plant.commonName}.
            </p>
          ) : (
            <OfferArea plantId={plant.id} memberId={user.id} />
          )}
        </section>
      )}

      {isOwner && plant.status === "AVAILABLE" && (
        <p className="mt-10">
          <Link href={`/plants/${plant.id}/edit`} className="rounded-md border border-leaf bg-white px-4 py-2 font-medium text-leaf">
            Edit or remove
          </Link>
        </p>
      )}
    </article>
  );
}

function OfferArea({ plantId, memberId }: { plantId: string; memberId: string }) {
  const options = getRequestOptions(getDb(), memberId);
  if (options.length === 0) {
    // REQ-SWAP-4: nothing to offer
    return (
      <p className="mt-3">
        You need an available plant of your own to offer in return.{" "}
        <Link href="/plants/new" className="font-medium text-leaf underline underline-offset-4">
          List a plant
        </Link>{" "}
        and come back.
      </p>
    );
  }
  return <RequestSwapForm plantId={plantId} options={options} />;
}
