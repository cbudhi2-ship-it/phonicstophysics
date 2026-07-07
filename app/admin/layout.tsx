import type { Metadata } from "next";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <PortalHeader
        name={profile?.full_name ?? user!.email}
        homeHref="/admin"
        badge="Admin"
      />
      <main className="flex-1">
        <div className="wrap py-8">{children}</div>
      </main>
    </div>
  );
}
