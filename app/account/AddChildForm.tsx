"use client";

import { useActionState, useRef } from "react";
import { addChild, type ChildFormState } from "@/lib/children-actions";
import { childYearGroups } from "@/lib/tiers";

const initial: ChildFormState = { ok: false };

const fieldClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-teal";

export function AddChildForm() {
  const [state, formAction, pending] = useActionState(addChild, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful add.
  if (state.ok) formRef.current?.reset();

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <div>
        <label htmlFor="name" className="mb-1.5 block text-[13px] font-bold">
          Child&apos;s name
        </label>
        <input id="name" name="name" required className={fieldClass} />
      </div>
      <div>
        <label
          htmlFor="yearGroup"
          className="mb-1.5 block text-[13px] font-bold"
        >
          Year group
        </label>
        <select id="yearGroup" name="yearGroup" required className={fieldClass}>
          <option value="">Choose…</option>
          {childYearGroups.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add child"}
      </button>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-coral/40 bg-coral/10 px-3.5 py-2.5 text-[14px] font-semibold text-coral-dark sm:col-span-3"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
