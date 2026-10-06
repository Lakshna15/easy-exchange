import Link from "next/link";

// Shown for unknown pages and for removed plants (REQ-BROWSE-8).
export default function NotFound() {
  return (
    <div className="max-w-prose">
      <h1 className="font-serif text-4xl font-semibold">Plant not found</h1>
      <p className="mt-4">This plant or page doesn&apos;t exist. It may have been removed by its owner.</p>
      <p className="mt-6">
        <Link href="/" className="underline">
          Browse the plants that are available
        </Link>
      </p>
    </div>
  );
}
