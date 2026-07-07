import type { Metadata } from "next";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { DashboardTabs } from "@/components/portal/DashboardTabs";
import { requireClient } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireClient();
  const enabled = profile?.status === "enabled";

  return (
    <div className="flex min-h-screen flex-col">
      <PortalHeader
        name={profile?.full_name ?? user!.email}
        homeHref="/dashboard"
        badge={profile?.role === "admin" ? "Admin" : undefined}
      />
      <main className="flex-1">
        <div className="wrap py-8">
          <h1 className="mb-1 text-[28px]">
            Hello{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </h1>
          <p className="mb-6 text-[15px] text-muted">
            Your Phonics to Physics dashboard.
          </p>

          {!enabled && (
            <div className="mb-6 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-[14px] text-navy-soft">
              <strong>Your account isn&apos;t active yet.</strong> Once
              we&apos;ve had a quick intro call, Chris will switch on booking so
              you can buy lessons and book slots. Any questions? Email{" "}
              <a
                href="mailto:hello@phonicstophysics.com"
                className="font-semibold text-teal"
              >
                hello@phonicstophysics.com
              </a>
              .
            </div>
          )}

          <DashboardTabs />
          <div className="pt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
