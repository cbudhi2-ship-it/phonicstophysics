import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { tierLabel, type Tier } from "@/lib/tiers";
import {
  ChildLearning,
  type TargetRow,
  type HomeworkRow,
} from "@/components/admin/ChildLearning";

export const dynamic = "force-dynamic";

export default async function AdminLearningPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: children }, { data: profiles }, { data: targets }, { data: homework }] =
    await Promise.all([
      admin
        .from("children")
        .select("id, parent_id, name, year_group, tier")
        .order("created_at"),
      admin.from("profiles").select("id, full_name").neq("role", "admin"),
      admin.from("targets").select("id, child_id, title, detail, status"),
      admin.from("homework").select("id, child_id, title, due_date, done"),
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
  const targetsByChild = new Map<string, TargetRow[]>();
  for (const t of (targets ?? []) as (TargetRow & { child_id: string })[]) {
    (targetsByChild.get(t.child_id) ?? targetsByChild.set(t.child_id, []).get(t.child_id)!).push(t);
  }
  const hwByChild = new Map<string, HomeworkRow[]>();
  for (const h of (homework ?? []) as (HomeworkRow & { child_id: string })[]) {
    (hwByChild.get(h.child_id) ?? hwByChild.set(h.child_id, []).get(h.child_id)!).push(h);
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
        <div className="space-y-5">
          {kids.map((child) => (
            <section key={child.id} className="card">
              <h2 className="text-[20px]">
                {child.name}
                <span className="ml-2 text-[13px] font-normal text-muted">
                  {nameById.get(child.parent_id) ?? ""}
                  {child.tier ? ` · ${tierLabel[child.tier]}` : ""}
                </span>
              </h2>
              <ChildLearning
                childId={child.id}
                targets={targetsByChild.get(child.id) ?? []}
                homework={hwByChild.get(child.id) ?? []}
              />
            </section>
          ))}
        </div>
      )}
    </>
  );
}
