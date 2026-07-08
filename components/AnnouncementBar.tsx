"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Bump this key to re-show the bar after changing the message.
const KEY = "p2p-announce-bootcamp-2026";

export function AnnouncementBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== "dismissed");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="bg-navy text-white">
      <div className="wrap flex items-center justify-center gap-3 py-2 text-[13px]">
        <Link
          href="/bootcamp"
          className="text-center font-semibold hover:underline"
        >
          🎒 August 11+ Bootcamp — daily live online, 3–28 Aug. Early-bird £199
          ends 17 July → Book your place
        </Link>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            setShow(false);
            try {
              localStorage.setItem(KEY, "dismissed");
            } catch {
              /* ignore */
            }
          }}
          className="ml-1 shrink-0 text-white/70 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
