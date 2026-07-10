"use client";

import { useEffect, useRef } from "react";

/**
 * Fires the Meta Pixel `Purchase` event once when mounted. Rendered on a
 * post-payment success page. `eventId` (e.g. the Stripe session id) lets Meta
 * de-duplicate if the page is refreshed or also tracked server-side.
 */
export function TrackPurchase({
  value,
  currency = "GBP",
  eventId,
}: {
  value: number;
  currency?: string;
  eventId?: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq(
        "track",
        "Purchase",
        { value, currency },
        eventId ? { eventID: eventId } : undefined,
      );
    }
  }, [value, currency, eventId]);

  return null;
}
