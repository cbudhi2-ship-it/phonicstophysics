import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AddClientForm } from "./AddClientForm";
import { StatusControl } from "./StatusControl";
import { ClientActions } from "./ClientActions";

export const dynamic = "force-dynamic";

type ClientRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  email: string;
  lastSignIn: string | null;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminClientsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: profiles }, { data: usersList }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, phone, status, role, created_at")
      .neq("role", "admin")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const metaById = new Map(
    (usersList?.users ?? []).map((u) => [
      u.id,
      { email: u.email ?? "", lastSignIn: u.last_sign_in_at ?? null },
    ]),
  );

  const clients: ClientRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    phone: p.phone,
    status: p.status,
    created_at: p.created_at,
    email: metaById.get(p.id)?.email ?? "",
    lastSignIn: metaById.get(p.id)?.lastSignIn ?? null,
  }));

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-[13px] font-semibold text-teal hover:underline"
          >
            ← Admin
          </Link>
          <h1 className="mt-1 text-[28px]">Clients</h1>
          <p className="text-[15px] text-muted">
            {clients.length} {clients.length === 1 ? "client" : "clients"}
          </p>
        </div>
      </div>

      <AddClientForm />

      <div className="mt-8 overflow-x-auto rounded-[16px] border border-line bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead className="border-b border-line bg-cream/60 text-[12px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-bold">Name</th>
              <th className="px-4 py-3 font-bold">Email</th>
              <th className="px-4 py-3 font-bold">Phone</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Last sign-in</th>
              <th className="px-4 py-3 font-bold">Added</th>
              <th className="px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No clients yet — add your first one above.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold text-navy">
                  {c.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-navy-soft">{c.email}</td>
                <td className="px-4 py-3 text-navy-soft">{c.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusControl id={c.id} status={c.status} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {fmtDate(c.lastSignIn)}
                </td>
                <td className="px-4 py-3 text-muted">{fmtDate(c.created_at)}</td>
                <td className="px-4 py-3">
                  <ClientActions id={c.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
