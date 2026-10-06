import type { Metadata } from "next";
import Link from "next/link";
import { safeReturnPath } from "@/domain/navigation";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in · Easy Exchange" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  const returnTo = safeReturnPath(typeof next === "string" ? next : undefined);
  return (
    <div className="max-w-md">
      <h1 className="font-serif text-4xl font-semibold">Log in</h1>
      <LoginForm next={returnTo} />
      <p className="mt-6">
        New here?{" "}
        <Link href="/register" className="underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
