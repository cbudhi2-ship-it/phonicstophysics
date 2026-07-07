import { createClient } from "@/lib/supabase/server";
import { tierLabel, type Tier } from "@/lib/tiers";
import { EmptyState } from "@/components/portal/EmptyState";

export const dynamic = "force-dynamic";

type Booking = {
  id: string;
  tier: Tier | null;
  starts_at: string | null;
  mode: string | null;
  join_url: string | null;
  status: string;
};

export default async function CalendarTab() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, tier, starts_at, mode, join_url, status")
    .neq("status", "cancelled")
    .order("starts_at", { ascending: true });

  const bookings = (data ?? []) as Booking[];

  if (bookings.length === 0) {
    return (
      <EmptyState icon="📅" title="No lessons booked">
        Your upcoming and past lessons will appear here once you&apos;ve booked
        them from the Lessons &amp; Booking tab.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const when = b.starts_at
          ? new Date(b.starts_at).toLocaleString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Time TBC";
        return (
          <div
            key={b.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
          >
            <div>
              <div className="font-semibold text-navy">{when}</div>
              <div className="text-[13px] text-muted">
                {b.tier ? tierLabel[b.tier] : "Lesson"}
                {b.mode ? ` · ${b.mode}` : ""}
              </div>
            </div>
            {b.join_url && (
              <a
                href={b.join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-teal !py-2 text-[13px]"
              >
                Join
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
