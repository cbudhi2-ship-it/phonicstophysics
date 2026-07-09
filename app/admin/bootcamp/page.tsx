import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { RemoveEnrolment } from "./RemoveEnrolment";

export const dynamic = "force-dynamic";

type Enrolment = {
  id: string;
  name: string | null;
  email: string;
  amount_gbp: number | null;
  early_bird: boolean;
  created_at: string;
};

export default async function AdminBootcampPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("bootcamp_enrolments")
    .select("id, name, email, amount_gbp, early_bird, created_at")
    .order("created_at", { ascending: false });

  const list = (data ?? []) as Enrolment[];
  const total = list.reduce((sum, e) => sum + (e.amount_gbp ?? 0), 0);

  return (
    <>
      <Link href="/admin" className="text-[13px] font-semibold text-teal hover:underline">
        ← Admin
      </Link>
      <h1 className="mt-1 text-[28px]">11+ Bootcamp</h1>
      <p className="mb-6 text-[15px] text-muted">
        {list.length} {list.length === 1 ? "booking" : "bookings"} · £
        {total.toFixed(2)} taken
      </p>

      {list.length === 0 ? (
        <div className="card text-center text-muted">
          No bookings yet. Enrolments from the{" "}
          <Link href="/bootcamp" className="font-semibold text-teal">
            bootcamp page
          </Link>{" "}
          will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[16px] border border-line bg-white shadow-soft">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead className="border-b border-line bg-cream/60 text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">Paid</th>
                <th className="px-4 py-3 font-bold">Booked</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold text-navy">
                    {e.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${e.email}`}
                      className="text-teal hover:underline"
                    >
                      {e.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-navy-soft">
                    £{(e.amount_gbp ?? 0).toFixed(2)}
                    {e.early_bird && (
                      <span className="ml-1 text-[12px] text-muted">
                        (early)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(e.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <RemoveEnrolment id={e.id} label={e.name ?? e.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
