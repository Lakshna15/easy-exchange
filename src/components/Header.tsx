import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/server/session";

// The same header on every page (03-features.md, "Screens").
export async function Header() {
  const user = await getCurrentUser();
  const link = "rounded-sm underline-offset-4 hover:underline";
  return (
    <header className="border-b border-stem bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="mr-auto font-serif text-2xl font-semibold">
          Easy Exchange
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {user ? (
            <>
              <Link href="/shelf" className={link}>
                Shelf
              </Link>
              <Link href="/swaps" className={link}>
                Swaps
              </Link>
              <Link href="/plants/new" className="rounded-md bg-leaf px-3 py-1.5 font-medium text-white hover:bg-leaf-dark">
                List a plant
              </Link>
              <span className="text-slate">{user.displayName}</span>
              <form action={logoutAction}>
                <button type="submit" className={link}>
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={link}>
                Log in
              </Link>
              <Link href="/register" className="rounded-md bg-leaf px-3 py-1.5 font-medium text-white hover:bg-leaf-dark">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
