import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log in",
  description: "Parent portal login for Phonics to Physics clients.",
  robots: { index: false },
};

export default async function LoginPage() {
  // Already signed in? Send them to the right place.
  const { user, profile } = await getSession();
  if (user) redirect(profile?.role === "admin" ? "/admin" : "/dashboard");

  return (
    <section className="py-14">
      <div className="wrap">
        <div className="mx-auto max-w-[420px] rounded-[24px] border border-line bg-white p-9 shadow-soft">
          <h1 className="mb-1.5 text-center text-[28px]">Welcome back</h1>
          <p className="mb-6 text-center text-[14px] text-muted">
            Log in to view lessons, targets, homework and your lesson balance.
          </p>

          <LoginForm />

          <p className="mt-4 text-center text-[13px]">
            <Link href="/forgot-password" className="font-semibold text-teal">
              Forgot your password?
            </Link>
          </p>

          <p className="mt-3 text-center text-[13px] text-muted">
            Not a client yet?{" "}
            <Link href="/contact" className="font-semibold text-teal">
              Book a free intro call
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
