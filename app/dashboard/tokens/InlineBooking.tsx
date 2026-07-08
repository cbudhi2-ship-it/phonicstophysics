"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { tierLabel, type Tier } from "@/lib/tiers";

const EVENT_URLS: Record<Tier, string | undefined> = {
  primary: process.env.NEXT_PUBLIC_CALCOM_EVENT_PRIMARY,
  secondary: process.env.NEXT_PUBLIC_CALCOM_EVENT_SECONDARY,
  a_level: process.env.NEXT_PUBLIC_CALCOM_EVENT_ALEVEL,
};

function toCalLink(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\/+/, "");
  } catch {
    return url.replace(/^https?:\/\/[^/]+\//, "");
  }
}

type Child = { id: string; name: string; tier: Tier | null };

export function InlineBooking({
  childrenList,
  balances,
  payInPerson = false,
  parentId,
  name,
  email,
}: {
  childrenList: Child[];
  balances: Record<Tier, number>;
  payInPerson?: boolean;
  parentId: string;
  name: string;
  email: string;
}) {
  // Only children whose tier has a configured Cal.com event are bookable.
  const bookable = childrenList.filter(
    (c) => c.tier && EVENT_URLS[c.tier],
  );
  const [selectedId, setSelectedId] = useState(bookable[0]?.id ?? "");

  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", { theme: "light", hideEventTypeDetails: false });
    })();
  }, []);

  if (childrenList.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-cream px-4 py-3 text-[14px] text-navy-soft">
        Add a child in{" "}
        <a href="/account" className="font-semibold text-teal">
          Settings
        </a>{" "}
        to book lessons.
      </p>
    );
  }

  if (bookable.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-cream px-4 py-3 text-[14px] text-navy-soft">
        Booking isn&apos;t available yet — please check back soon.
      </p>
    );
  }

  const selected = bookable.find((c) => c.id === selectedId) ?? bookable[0];
  const tier = selected.tier as Tier;
  const balance = balances[tier] ?? 0;
  const calLink = toCalLink(EVENT_URLS[tier]!);

  return (
    <div>
      {bookable.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {bookable.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={`rounded-pill border px-3.5 py-1.5 text-[14px] font-semibold ${
                c.id === selected.id
                  ? "border-teal bg-teal text-white"
                  : "border-line bg-white text-navy hover:border-teal"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <p className="mb-3 text-[14px] text-muted">
        Booking for <strong className="text-navy">{selected.name}</strong> ·{" "}
        {tierLabel[tier]}
        {payInPerson ? " · pay in person" : ` · ${balance} left`}
      </p>

      {!payInPerson && balance <= 0 ? (
        <p className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-[14px] text-navy-soft">
          You&apos;ve no {tierLabel[tier]} lessons left — buy one above, then
          book here.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <Cal
            calLink={calLink}
            style={{ width: "100%", height: "640px", overflow: "scroll" }}
            config={{
              layout: "month_view",
              name,
              email,
              metadata: {
                parent_id: parentId,
                child_id: selected.id,
                tier,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
