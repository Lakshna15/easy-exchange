"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";

// Unexpected errors are shown without internal detail (04-architecture.md, "Mutations and errors").
// Next.js 16 passes `retry` (older versions called it `reset`).
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-prose">
      <h1 className="font-serif text-4xl font-semibold">Something went wrong</h1>
      <p className="mt-4">The page could not be shown. Nothing you entered was lost on our side; try again in a moment.</p>
      {error.digest && <p className="mt-2 text-sm text-slate">Reference: {error.digest}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="rounded-md bg-leaf px-5 py-2.5 font-medium text-white hover:bg-leaf-dark">
          Try again
        </button>
        <Link href="/" className="rounded-md border border-stem bg-white px-5 py-2.5 font-medium">
          Go to all plants
        </Link>
      </div>
    </div>
  );
}
