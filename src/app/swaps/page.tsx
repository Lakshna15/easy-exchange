import type { Metadata } from "next";
import Link from "next/link";
import { formatListedDate } from "@/components/plant-labels";
import { StatusBadge } from "@/components/StatusBadge";
import { getDb } from "@/server/db";
import { requireUser } from "@/server/session";
import { type SwapView, listSwaps } from "@/server/swaps";
import { SwapSteps } from "./SwapSteps";

export const metadata: Metadata = { title: "Your swaps · Easy Exchange" };

// F4, REQ-SWAP-11 to -13: incoming and outgoing swaps, newest first, with only the allowed actions.
export default async function SwapsPage() {
  const user = await requireUser("/swaps");
  const { incoming, outgoing } = listSwaps(getDb(), user.id);
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl font-semibold">Your swaps</h1>
      <SwapSection
        title="Incoming"
        intro="Offers other members made for your plants."
        swaps={incoming}
        empty="No offers for your plants yet. They appear here as soon as someone makes one."
      />
      <SwapSection
        title="Outgoing"
        intro="Offers you made for other members' plants."
        swaps={outgoing}
        empty={
          <>
            You haven&apos;t offered any swaps yet.{" "}
            <Link href="/" className="underline">
              Browse the plants
            </Link>{" "}
            to find one you want.
          </>
        }
      />
    </div>
  );
}

function SwapSection({ title, intro, swaps, empty }: { title: string; intro: string; swaps: SwapView[]; empty: React.ReactNode }) {
  const id = `${title.toLowerCase()}-heading`;
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="font-serif text-3xl font-semibold">
        {title}
      </h2>
      <p className="mt-1 text-slate">{intro}</p>
      {swaps.length === 0 ? (
        <p className="mt-4">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {swaps.map((swap) => (
            <SwapCard key={swap.id} swap={swap} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SwapCard({ swap }: { swap: SwapView }) {
  // F4: "their plant for your plant", in words
  const name = `${swap.otherName}'s ${swap.theirPlant.commonName} for your ${swap.yourPlant.commonName}`;
  return (
    <li className="rounded-md border border-stem bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-serif text-xl font-semibold">
          <Link href={`/plants/${swap.theirPlant.id}`} className="underline-offset-4 hover:underline">
            {swap.otherName}&apos;s {swap.theirPlant.commonName}
          </Link>{" "}
          for your{" "}
          <Link href={`/plants/${swap.yourPlant.id}`} className="underline-offset-4 hover:underline">
            {swap.yourPlant.commonName}
          </Link>
        </h3>
        <StatusBadge status={swap.status} />
      </div>
      <p className="mt-1 text-sm text-slate">
        {swap.role === "owner" ? `Offered by ${swap.otherName}` : `Your offer to ${swap.otherName}`} on {formatListedDate(swap.createdAt)}
      </p>
      {swap.message && (
        <blockquote className="mt-3 border-l-4 border-stem pl-3 italic">&ldquo;{swap.message}&rdquo;</blockquote>
      )}
      {swap.otherEmail && (
        <p className="mt-3">
          {swap.status === "ACCEPTED" ? "Arrange the handoff with " : "Contact "}
          {swap.otherName}:{" "}
          <a href={`mailto:${swap.otherEmail}`} className="font-medium text-leaf underline underline-offset-4">
            {swap.otherEmail}
          </a>
        </p>
      )}
      {swap.status === "PENDING" && swap.role === "owner" && (
        <p className="mt-3 text-sm text-slate">Accepting reserves both plants and cancels any other pending offers involving them.</p>
      )}
      {swap.status === "ACCEPTED" && (
        <p className="mt-3 text-sm text-slate">Meet up and swap the plants, then mark the swap completed.</p>
      )}
      <SwapSteps swapId={swap.id} actions={swap.actions} swapName={name} />
    </li>
  );
}
