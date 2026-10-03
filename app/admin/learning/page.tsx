import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { tierLabel, type Tier } from "@/lib/tiers";
import { addChildForClient } from "@/lib/admin-actions";
import { yearGroups } from "@/lib/enquiry";
import {
  ChildLearning,
  type TargetRow,
  type HomeworkRow,
  type ResourceRow,
} from "@/components/admin/ChildLearning";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-teal";

export default async function AdminLearningPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [
    { data: children },
    { data: profiles },
    { data: targets },
    { data: homework },
    { data: resources },
  ] = await Promise.all([
    admin
      .from("children")
      .select("id, parent_id, name, year_group, tier")
      .order("created_at"),
    admin.from("profiles").select("id, full_name").neq("role", "admin"),
    admin.from("targets").select("id, child_id, title, detail, status"),
    admin.from("homework").select("id, child_id, title, due_date, done"),
    admin.from("resources").select("id, child_id, label, url, username, password"),
  ]);

  const kids = (children ?? []) as {
    id: string;
    parent_id: string;
    name: string;
    year_group: string | null;
    tier: Tier | null;
  }[];
  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name as string | null]),
  );
  const parentIdsWithChildren = new Set(kids.map((k) => k.parent_id));
  const clientsNoChild = (profiles ?? []).filter(
    (p) => !parentIdsWithChildren.has(p.id as string),
  ) as { id: string; full_name: string | null }[];
  const targetsByChild = new Map<string, TargetRow[]>();
  for (const t of (targets ?? []) as (TargetRow & { child_id: string })[]) {
    (targetsByChild.get(t.child_id) ?? targetsByChild.set(t.child_id, []).get(t.child_id)!).push(t);
  }
  const hwByChild = new Map<string, HomeworkRow[]>();
  for (const h of (homework ?? []) as (HomeworkRow & { child_id: string })[]) {
    (hwByChild.get(h.child_id) ?? hwByChild.set(h.child_id, []).get(h.child_id)!).push(h);
  }
  const resByChild = new Map<string, ResourceRow[]>();
  for (const r of (resources ?? []) as (ResourceRow & { child_id: string })[]) {
    (resByChild.get(r.child_id) ?? resByChild.set(r.child_id, []).get(r.child_id)!).push(r);
  }

  return (
    <>
      <Link href="/admin" className="text-[13px] font-semibold text-teal hover:underline">
        ← Admin
      </Link>
      <h1 className="mt-1 text-[28px]">Targets &amp; homework</h1>
      <p className="mb-6 text-[15px] text-muted">
        Set learning goals and assign homework for each child.
      </p>

      {clientsNoChild.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[18px]">New students — add a child to begin</h2>
          <p className="mb-3 mt-1 text-[14px] text-muted">
            These clients don&apos;t have a child set up yet, so there&apos;s
            nothing to set targets or homework against. Add the child here and
            they&apos;ll appear in the list below straight away.
          </p>
          <div className="space-y-3">
            {clientsNoChild.map((c) => (
              <form
                key={c.id}
                action={addChildForClient}
                className="flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-line bg-white p-4"
              >
                <input type="hidden" name="parent_id" value={c.id} />
                <span className="mr-1 min-w-[140px] self-center text-[15px] font-semibold text-navy">
                  {c.full_name ?? "Client"}
                </span>
                <input
                  name="name"
                  required
                  placeholder="Child's name"
                  className={`${field} max-w-[200px]`}
                />
                <select
                  name="year_group"
                  required
                  className={`${field} max-w-[220px]`}
                >
                  <option value="">Year group…</option>
                  {yearGroups.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button className="rounded-lg bg-coral px-3 py-2 text-[13px] font-bold text-white">
                  Add child
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      {kids.length === 0 ? (
        <div className="card text-center text-muted">
          No children yet. Clients add children in their Settings, or you can
          see clients under{" "}
          <Link href="/admin/clients" className="font-semibold text-teal">
            Clients
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-4">
          {kids.map((child) => {
            const tCount = (targetsByChild.get(child.id) ?? []).length;
            const hCount = (hwByChild.get(child.id) ?? []).length;
            return (
              <details key={child.id} className="group card">
                <summary className="flex cursor-pointer items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="font-serif text-[20px] text-navy">
                      {child.name}
                    </span>
                    <span className="ml-2 text-[13px] font-normal text-muted">
                      {nameById.get(child.parent_id) ?? ""}
                      {child.tier ? ` · ${tierLabel[child.tier]}` : ""} ·{" "}
                      {tCount} target{tCount === 1 ? "" : "s"} · {hCount} h/w
                    </span>
                  </span>
                  <span className="shrink-0 text-[18px] text-muted transition-transform group-open:rotate-90">
                    ›
                  </span>
                </summary>
                <ChildLearning
                  childId={child.id}
                  targets={targetsByChild.get(child.id) ?? []}
                  homework={hwByChild.get(child.id) ?? []}
                  resources={resByChild.get(child.id) ?? []}
                />
              </details>
            );
          })}
        </div>
      )}
    </>
  );
}
