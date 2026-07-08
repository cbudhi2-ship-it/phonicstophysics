"use client";

import { useState, useTransition } from "react";
import { adjustTokens } from "@/lib/admin-actions";
import { tierLabel, type Tier } from "@/lib/tiers";

const TIERS: Tier[] = ["primary", "secondary", "a_level"];
const short: Record<Tier, string> = {
  primary: "P",
  secondary: "S",
  a_level: "A",
};

export function ClientLessons({
  id,
  balances,
}: {
  id: string;
  balances: Record<Tier, number>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const nonZero = TIERS.filter((t) => balances[t] !== 0);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("id", id);
    start(async () => {
      const r = await adjustTokens(fd);
      if (!r.ok) setError(r.error ?? "Couldn't apply that.");
      else setOpen(false);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2 text-[13px]">
        {nonZero.length === 0 ? (
          <span className="text-muted">0</span>
        ) : (
          nonZero.map((t) => (
            <span key={t} className="font-semibold text-navy">
              {short[t]} {balances[t]}
            </span>
          ))
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[12px] font-semibold text-teal hover:underline"
        >
          Adjust
        </button>
      </div>

      {open && (
        <form
          onSubmit={onSubmit}
          className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-cream px-2 py-1.5"
        >
          <select
            name="tier"
            defaultValue="primary"
            className="rounded border border-line bg-white px-1.5 py-1 text-[12px]"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {tierLabel[t]}
              </option>
            ))}
          </select>
          <input
            name="amount"
            type="number"
            required
            placeholder="±1"
            className="w-14 rounded border border-line bg-white px-1.5 py-1 text-[12px]"
          />
          <input
            name="note"
            type="text"
            placeholder="reason"
            className="w-24 rounded border border-line bg-white px-1.5 py-1 text-[12px]"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-coral px-2 py-1 text-[12px] font-bold text-white disabled:opacity-50"
          >
            Save
          </button>
        </form>
      )}
      {error && <span className="text-[12px] text-coral-dark">{error}</span>}
    </div>
  );
}
