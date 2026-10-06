import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Your shelf · Easy Exchange" };

// M2: members-only and empty. M3 lists the member's plants here.
export default async function ShelfPage() {
  const user = await requireUser("/shelf");
  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Your shelf</h1>
      <p className="mt-3 max-w-prose">
        {user.displayName}, this is where the plants you can spare will appear. A listing is one cutting, seedling, potted
        plant or packet of seeds that you are happy to swap.
      </p>
      <p className="mt-6">
        <Link href="/plants/new" className="rounded-md bg-leaf px-5 py-2.5 font-medium text-white hover:bg-leaf-dark">
          List a plant
        </Link>
      </p>
    </div>
  );
}
