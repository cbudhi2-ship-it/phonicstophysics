import { EmptyState } from "@/components/portal/EmptyState";

export default function CalendarTab() {
  return (
    <EmptyState icon="📅" title="No lessons booked">
      Your upcoming and past lessons will appear here once you&apos;ve booked
      them from the Lessons &amp; Booking tab.
    </EmptyState>
  );
}
