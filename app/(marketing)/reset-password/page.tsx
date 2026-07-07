import type { Metadata } from "next";
import Link from "next/link";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const { user } = await getSession();

  return (
    <section className="py-14">
      <div className="wrap">
        <div className="mx-auto max-w-[420px] rounded-[24px] border border-line bg-white p-9 shadow-soft">
          <h1 className="mb-1.5 text-center text-[28px]">Set a new password</h1>

          {user ? (
            <>
              <p className="mb-6 text-center text-[14px] text-muted">
                Choose a new password for your account.
              </p>
              <ChangePasswordForm
                submitLabel="Save new password"
                continueHref="/login"
              />
            </>
          ) : (
            <>
              <p className="mb-6 text-center text-[14px] text-muted">
                This reset link is invalid or has expired.
              </p>
              <Link href="/forgot-password" className="btn btn-primary w-full">
                Request a new link
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
