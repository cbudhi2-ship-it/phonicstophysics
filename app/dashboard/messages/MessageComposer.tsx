"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessage, type SendMessageState } from "@/lib/dashboard-actions";

const initial: SendMessageState = { ok: false };

export function MessageComposer() {
  const [state, formAction, pending] = useActionState(sendMessage, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={formAction} className="mt-4">
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Write a message to Chris…"
        className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-teal"
      />
      {state.error && (
        <p className="mt-1 text-[13px] font-semibold text-coral-dark">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-2 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
