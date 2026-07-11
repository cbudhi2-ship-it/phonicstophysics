"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Targets" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/homework", label: "Homework" },
  { href: "/dashboard/logins", label: "Logins" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/tokens", label: "Lessons & Booking" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const active =
          t.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-[15px] font-semibold transition-colors ${
              active
                ? "border-coral text-navy"
                : "border-transparent text-muted hover:text-navy"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
