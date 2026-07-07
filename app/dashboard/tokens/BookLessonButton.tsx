import type { Tier } from "@/lib/tiers";

// NEXT_PUBLIC_* must be referenced statically to be inlined.
const EVENT_URLS: Record<Tier, string | undefined> = {
  primary: process.env.NEXT_PUBLIC_CALCOM_EVENT_PRIMARY,
  secondary: process.env.NEXT_PUBLIC_CALCOM_EVENT_SECONDARY,
  a_level: process.env.NEXT_PUBLIC_CALCOM_EVENT_ALEVEL,
};

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

  const disabledClass =
    "rounded-pill border border-line bg-cream px-4 py-2 text-[13px] font-semibold text-muted";

  if (!tier || !eventUrl) {
    return <span className={disabledClass}>Booking coming soon</span>;
  }
  if (balance <= 0) {
    return <span className={disabledClass}>Buy a lesson first</span>;
  }

  const params = new URLSearchParams({
    name,
    email,
    "metadata[parent_id]": parentId,
    "metadata[child_id]": childId,
    "metadata[tier]": tier,
  });
  const href = `${eventUrl}${eventUrl.includes("?") ? "&" : "?"}${params.toString()}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-primary !py-2 text-[13px]"
    >
      Book a lesson
    </a>
  );
}
