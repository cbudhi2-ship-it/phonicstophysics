"use client";

import { useState, useTransition } from "react";
import {
  resetClientPassword,
  sendClientResetLink,
  deleteClient,
  setPayInPerson,
} from "@/lib/admin-actions";

export function ClientActions({
  id,
  name,
  payInPerson,
}: {
  id: string;
  name: string;
  payInPerson: boolean;
}) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [temp, setTemp] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <label className="flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-navy-soft">
        <input
          type="checkbox"
          checked={payInPerson}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              await setPayInPerson(id, e.target.checked);
            })
          }
          className="accent-teal"
        />
        Pays in person
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setTemp(null);
              const r = await sendClientResetLink(id);
              setNote(
                r.emailed
                  ? "Reset link emailed ✓"
                  : r.setupLink
                    ? "Email off — use temp password instead"
                    : "Couldn't send",
              );
            })
          }
          className="text-[13px] font-semibold text-teal hover:underline disabled:opacity-50"
        >
          Email reset link
        </button>
        <span className="text-line">·</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setNote(null);
              const r = await resetClientPassword(id);
              setTemp(r.ok && r.password ? r.password : null);
              if (!r.ok) setNote("Couldn't reset");
            })
          }
          className="text-[13px] font-semibold text-navy-soft hover:underline disabled:opacity-50"
        >
          Set temp password
        </button>
        <span className="text-line">·</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !window.confirm(
                `Permanently remove ${name || "this client"}? This deletes their account, children, lesson balance and bookings. This can't be undone.`,
              )
            )
              return;
            start(async () => {
              setTemp(null);
              const r = await deleteClient(id);
              if (!r.ok) setNote(r.error ?? "Couldn't remove");
            });
          }}
          className="text-[13px] font-semibold text-coral-dark hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
      {note && <span className="text-[12px] text-muted">{note}</span>}
      {temp && (
        <span className="rounded bg-cream px-2 py-0.5 font-mono text-[12px]">
          Temp: <strong>{temp}</strong>
        </span>
      )}
    </div>
  );
}
