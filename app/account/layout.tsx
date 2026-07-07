import type { Metadata } from "next";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { requireClient } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireClient();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col">
      <PortalHeader
        name={profile?.full_name ?? user!.email}
        homeHref={isAdmin ? "/admin" : "/dashboard"}
        badge={isAdmin ? "Admin" : undefined}
      />
      <main className="flex-1">
        <div className="wrap py-8">{children}</div>
      </main>
    </div>
  );
}
