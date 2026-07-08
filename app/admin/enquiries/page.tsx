import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { EnquiryStatus } from "./EnquiryStatus";

export const dynamic = "force-dynamic";

type Enquiry = {
  id: string;
  parent_name: string;
  email: string;
  phone: string | null;
  year_group: string | null;
  subjects: string[] | null;
  mode: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export default async function AdminEnquiriesPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("enquiries")
    .select(
      "id, parent_name, email, phone, year_group, subjects, mode, message, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const enquiries = (data ?? []) as Enquiry[];
  const newCount = enquiries.filter((e) => e.status === "new").length;

  return (
    <>
      <Link
        href="/admin"
        className="text-[13px] font-semibold text-teal hover:underline"
      >
        ← Admin
      </Link>
      <h1 className="mt-1 text-[28px]">Enquiries</h1>
      <p className="mb-6 text-[15px] text-muted">
        {enquiries.length} total · {newCount} new
      </p>

      {enquiries.length === 0 ? (
        <div className="card text-center text-muted">
          No enquiries yet. Messages from the contact form will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((e) => (
            <div key={e.id} className="card">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px]">{e.parent_name}</h2>
                  <p className="text-[13px] text-muted">
                    <a
                      href={`mailto:${e.email}`}
                      className="font-semibold text-teal"
                    >
                      {e.email}
                    </a>
                    {e.phone ? ` · ${e.phone}` : ""} ·{" "}
                    {new Date(e.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <EnquiryStatus id={e.id} status={e.status} />
              </div>
              <p className="mb-2 text-[13px] text-navy-soft">
                {[
                  e.year_group,
                  e.subjects?.length ? e.subjects.join(", ") : null,
                  e.mode,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {e.message && (
                <p className="whitespace-pre-wrap rounded-xl border border-line bg-cream px-4 py-3 text-[14px] text-navy-soft">
                  {e.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
