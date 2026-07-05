import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in",
  description: "Parent portal login for Phonics to Physics clients.",
  robots: { index: false },
};

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-teal";

export default function LoginPage() {
  return (
    <section className="py-14">
      <div className="wrap">
        <div className="mx-auto max-w-[420px] rounded-[24px] border border-line bg-white p-9 shadow-soft">
          <h1 className="mb-1.5 text-center text-[28px]">Welcome back</h1>
          <p className="mb-6 text-center text-[14px] text-muted">
            Log in to view lessons, targets, homework and invoices.
          </p>

          {/* Auth is provisioned by Chris / on payment (Phase 2). This is a
              non-functional placeholder until Clerk is wired in. */}
          <div className="mb-6 rounded-xl border border-line bg-cream px-4 py-3 text-center text-[13px] text-navy-soft">
            The parent portal is coming soon. Accounts are set up for you after
            your first lesson is arranged.
          </div>

          <form className="space-y-4" action="/login">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-bold">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={fieldClass}
                placeholder="you@email.com"
                disabled
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-bold"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className={fieldClass}
                placeholder="••••••••"
                disabled
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled>
              Log in
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted">
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
