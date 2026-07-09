"use client";

import { useTransition } from "react";
import { deleteBootcampEnrolment } from "@/lib/admin-actions";

export function RemoveEnrolment({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Remove ${label}'s booking? This can't be undone.`))
          return;
        start(async () => {
          await deleteBootcampEnrolment(id);
        });
      }}
      className="text-[12px] font-semibold text-muted hover:text-coral-dark disabled:opacity-50"
    >
      Remove
    </button>
  );
}
