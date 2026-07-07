"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  type ResetRequestState,
} from "@/lib/actions";

const initial: ResetRequestState = { sent: false };

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-teal";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initial,
  );

  if (state.sent) {
    return (
      <div className="rounded-xl border border-teal/40 bg-[#EAF7F4] px-4 py-3 text-[14px] text-navy-soft">
        If that email has an account, we&apos;ve sent a link to reset your
        password. Please check your inbox (and spam folder).
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-bold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
          placeholder="you@email.com"
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
        className="btn btn-primary w-full disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
