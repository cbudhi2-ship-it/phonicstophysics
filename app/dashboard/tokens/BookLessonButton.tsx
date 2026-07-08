"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import type { Tier } from "@/lib/tiers";

// NEXT_PUBLIC_* must be referenced statically to be inlined.
const EVENT_URLS: Record<Tier, string | undefined> = {
  primary: process.env.NEXT_PUBLIC_CALCOM_EVENT_PRIMARY,
  secondary: process.env.NEXT_PUBLIC_CALCOM_EVENT_SECONDARY,
  a_level: process.env.NEXT_PUBLIC_CALCOM_EVENT_ALEVEL,
};

/** Turn a full Cal.com event URL into the "username/event" link the embed wants. */
function toCalLink(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\/+/, "");
  } catch {
    return url.replace(/^https?:\/\/[^/]+\//, "");
  }
}

export function BookLessonButton({
  tier,
  childId,
  parentId,
  balance,
  name,
  email,
}: {
  tier: Tier | null;
  childId: string;
  parentId: string;
  balance: number;
  name: string;
  email: string;
}) {
  const eventUrl = tier ? EVENT_URLS[tier] : undefined;

  useEffect(() => {
    if (!eventUrl) return;
    (async () => {
      const cal = await getCalApi();
      cal("ui", { theme: "light", hideEventTypeDetails: false });
    })();
  }, [eventUrl]);

  const disabledClass =
    "rounded-pill border border-line bg-cream px-4 py-2 text-[13px] font-semibold text-muted";

  if (!tier || !eventUrl) {
    return <span className={disabledClass}>Booking coming soon</span>;
  }
  if (balance <= 0) {
    return <span className={disabledClass}>Buy a lesson first</span>;
  }

  // Metadata rides along with the booking so the webhook can attribute it.
  const config = {
    name,
    email,
    metadata: { parent_id: parentId, child_id: childId, tier },
  };

  return (
    <button
      type="button"
      data-cal-link={toCalLink(eventUrl)}
      data-cal-config={JSON.stringify(config)}
      className="btn btn-primary !py-2 text-[13px]"
    >
      Book a lesson
    </button>
  );
}
