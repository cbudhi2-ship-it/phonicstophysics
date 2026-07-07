"use client";

import { useActionState, useState } from "react";
import {
  createClientUser,
  type CreateClientState,
} from "@/lib/admin-actions";

const initial: CreateClientState = { ok: false };

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-teal";
const labelClass = "mb-1.5 block text-[13px] font-bold";

export function AddClientForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createClientUser, initial);

  // Show the success panel after a create.
  if (state.ok) {
    return (
      <div className="rounded-[16px] border border-teal/40 bg-[#EAF7F4] p-5">
        <h2 className="text-[18px]">✓ {state.name}&apos;s account created</h2>
        {state.emailed ? (
          <p className="mt-1 text-[14px] text-navy-soft">
            A welcome email has been sent inviting them to set their own
            password.
          </p>
        ) : (
          <>
            <p className="mt-1 text-[14px] text-navy-soft">
              Email isn&apos;t configured here — share this &ldquo;set your
              password&rdquo; link with them directly:
            </p>
            {state.setupLink && (
              <div className="mt-3 break-all rounded-xl border border-line bg-white px-4 py-3 font-mono text-[12px]">
                {state.setupLink}
              </div>
            )}
          </>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-primary mt-4"
        >
          Done
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary"
      >
        + Add client
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[16px] border border-line bg-white p-5 shadow-soft"
    >
      <h2 className="mb-4 text-[18px]">Add a client</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Parent / guardian name
          </label>
          <input id="fullName" name="fullName" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="phone" name="phone" type="tel" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="enabled"
            className={fieldClass}
          >
            <option value="enabled">Enabled (can book once Phase 3 is live)</option>
            <option value="pending">Pending (awaiting intro call)</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-coral/40 bg-coral/10 px-3.5 py-2.5 text-[14px] font-semibold text-coral-dark"
        >
          {state.error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn btn-ghost"
        >
          Cancel
        </button>
      </div>
      <p className="mt-3 text-[12px] text-muted">
        Creates a parent login and emails them a temporary password.
      </p>
    </form>
  );
}
