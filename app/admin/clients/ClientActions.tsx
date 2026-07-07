"use client";

import { useState, useTransition } from "react";
import {
  resetClientPassword,
  sendClientResetLink,
} from "@/lib/admin-actions";

export function ClientActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [temp, setTemp] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-2">
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
