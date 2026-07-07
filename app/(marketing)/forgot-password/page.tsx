import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Phonics to Physics account password.",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <section className="py-14">
      <div className="wrap">
        <div className="mx-auto max-w-[420px] rounded-[24px] border border-line bg-white p-9 shadow-soft">
          <h1 className="mb-1.5 text-center text-[28px]">Reset your password</h1>
          <p className="mb-6 text-center text-[14px] text-muted">
            Enter your email and we&apos;ll send you a link to set a new
            password.
          </p>

          <ForgotPasswordForm />

          <p className="mt-5 text-center text-[13px] text-muted">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-teal">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
