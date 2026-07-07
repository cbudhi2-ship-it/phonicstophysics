"use client";

import { setClientStatus } from "@/lib/admin-actions";

const styles: Record<string, string> = {
  enabled: "border-teal bg-[#EAF7F4] text-teal",
  pending: "border-gold/60 bg-gold/10 text-navy-soft",
  paused: "border-line bg-cream text-muted",
};

export function StatusControl({ id, status }: { id: string; status: string }) {
  return (
    <form action={setClientStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`cursor-pointer rounded-pill border px-3 py-1 text-[13px] font-bold outline-none ${
          styles[status] ?? styles.pending
        }`}
        aria-label="Account status"
      >
        <option value="enabled">Enabled</option>
        <option value="pending">Pending</option>
        <option value="paused">Paused</option>
      </select>
    </form>
  );
}
