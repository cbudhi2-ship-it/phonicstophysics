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
  cal_booking_uid: string | null;
  status: string;
};

// Cal.com's booking page, where an attendee can cancel or reschedule.
const CALCOM_BASE =
  process.env.NEXT_PUBLIC_CALCOM_BASE_URL ?? "https://cal.com";

export default async function CalendarTab() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, tier, starts_at, mode, join_url, cal_booking_uid, status")
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

  const now = Date.now();

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const start = b.starts_at ? new Date(b.starts_at) : null;
        const upcoming = start ? start.getTime() > now : true;
        const when = start
          ? start.toLocaleString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Time TBC";
        const manageUrl = b.cal_booking_uid
          ? `${CALCOM_BASE}/booking/${b.cal_booking_uid}`
          : null;

        return (
          <div
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3"
          >
            <div>
              <div className="font-semibold text-navy">
                {when}
                {!upcoming && (
                  <span className="ml-2 text-[12px] font-normal text-muted">
                    past
                  </span>
                )}
              </div>
              <div className="text-[13px] text-muted">
                {b.tier ? tierLabel[b.tier] : "Lesson"}
                {b.mode ? ` · ${b.mode}` : ""}
              </div>
            </div>

            {upcoming && (
              <div className="flex items-center gap-3">
                {manageUrl && (
                  <a
                    href={manageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-muted hover:text-navy"
                  >
                    Cancel / reschedule
                  </a>
                )}
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
            )}
          </div>
        );
      })}
    </div>
  );
}
