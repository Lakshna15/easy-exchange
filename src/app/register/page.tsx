import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Create an account · Easy Exchange" };

export default function RegisterPage() {
  return (
    <div className="max-w-md">
      <h1 className="font-serif text-4xl font-semibold">Create an account</h1>
      <p className="mt-3">List the plants you can spare and swap them for ones you want.</p>
      <RegisterForm />
      <p className="mt-6">
        Already a member?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
