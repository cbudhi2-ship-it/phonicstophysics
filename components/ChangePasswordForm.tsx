"use client";

import Link from "next/link";
import { useActionState } from "react";
import { changePassword, type ChangePasswordState } from "@/lib/actions";

const initial: ChangePasswordState = { error: null };

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-teal";
const labelClass = "mb-1.5 block text-[13px] font-bold";

export function ChangePasswordForm({
  submitLabel = "Update password",
  continueHref,
}: {
  submitLabel?: string;
  continueHref?: string;
}) {
  const [state, formAction, pending] = useActionState(changePassword, initial);

  if (state.ok) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-teal/40 bg-[#EAF7F4] px-4 py-3 text-[14px] font-semibold text-teal">
          ✓ Your password has been updated.
        </div>
        {continueHref && (
          <Link href={continueHref} className="btn btn-primary w-full">
            Continue
          </Link>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className={labelClass}>
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className={fieldClass}
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label htmlFor="confirm" className={labelClass}>
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={fieldClass}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-coral/40 bg-coral/10 px-3.5 py-2.5 text-[14px] font-semibold text-coral-dark"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
